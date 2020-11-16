import { ClientSession, Collection, Db, MongoClient, ObjectID, ReadConcern, TransactionOptions } from "mongodb";
import { Camp, CampOperation, List } from "desert-thing-packing-list-common";
import { UserWithPassword, User } from "./user";

interface DbUser {
  _id: ObjectID;
  username: string;
  name: string;
  password: string;
  superuser?: boolean;
  camps: ObjectID[];
}

interface DbCamp {
  name: string;
  lists: List[];
  opCount: number;
}

// Operations: Growing an unbounded array in a document is a bad idea so the operations
// go in their own collection, chunked together 100 to a document. Also, could potentially
// throw away old chunks to free up DB space.
const OpChunkSize = 100;

interface DbOperations {
  campId: ObjectID;
  chunkId: number;
  ops: CampOperation[]; // Length of this array will be max OpChunkSize
}

interface ChunkSlice {
    chunkId: number;
    startIndex: number;
    count: number;
}

const dbName = "desert-thing-packing-list";

export class Store {
  private mongoUri: string;
  private client?: MongoClient;
  private connected?: Promise<any>;
  private users?: Collection<DbUser>;
  private camps?: Collection<DbCamp>;
  private operations?: Collection<DbOperations>;
  private initCount = 0;

  constructor() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw Error("MONGO_URI environment variable not set!!");
    }
    this.mongoUri = uri;
  }

  initialize() {
    this.initCount++;
    if (!this.connected) {
      this.connected = this.connect();
    }
    return this.connected;
  }

  private async connect() {
    this.client = new MongoClient(this.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await this.client.connect();
    const db = this.client.db(dbName);
    const collections = await db.collections();

    this.users = await this.createCollection(db, collections, "users");
    await this.users.createIndex("username", { unique: true });
    this.camps = await this.createCollection(db, collections, "camps");
    this.operations = await this.createCollection(db, collections, "operations");
    await this.operations.createIndex({ campId: 1, chunkId: 1 }, { unique: true });
  }

  private async createCollection<T>(db: Db, collections: Collection<any>[], name: string) {
    const coll = collections.find(c => c.collectionName === name);
    if (coll) {
      return coll;
    }
    return await db.createCollection(name);
  }

  async close() {
    if (--this.initCount === 0) {
      await this.client?.close();
      this.client = undefined;
      this.camps = undefined;
      this.operations = undefined;
      this.users = undefined;
      this.connected = undefined;
    }
  }

  async getUserByUserName(
    username: string
  ): Promise<UserWithPassword | undefined> {
    if (!this.users) {
      throw Error("Users is null");
    }
    const user = await this.users.findOne(
      { username },
      { projection: { _id: 1, name: 1, username: 1, password: 1, camps: 1 } }
    );
    if (!user) {
      return undefined;
    }
    const { _id, ...removeId } = user;
    return {
      ...removeId,
      id: user._id.toHexString(),
      camps: user.camps ? user.camps.map((c) => c.toHexString()) : [],
    };
  }

  async getUser(userId: string): Promise<User | undefined> {
    const user = await this.users?.findOne(new ObjectID(userId));
    return user ? {
      id: user._id.toHexString(),
      name: user.name,
      username: user.username,
      camps: user.camps ? user.camps.map((c) => c.toHexString()) : [],
    } : undefined;
  }

  async createUser(username: string, name: string, password: string): Promise<string> {
    const result = await this.users?.insertOne({username, name, password, superuser: false, camps: []});
    const userId = result?.insertedId.toHexString();
    if (!userId) {
      throw new Error("userId is null");
    }
    return userId;
  }

  private async createCamp(
    name: string,
    lists: List[],
    opCount: number,
    session: ClientSession
  ): Promise<string> {
    if (!this.camps) {
      throw Error("camps is null");
    }
    const result = await this.camps.insertOne(
      { name, lists, opCount },
      { session }
    );
    return result.insertedId.toHexString();
  }

  private async updateCamp(
    camp: Camp,
    lastServerOp: number,
    newOpCount: number,
    session: ClientSession
  ) {
    if (!this.camps) {
      throw Error("camps is null");
    }
    const result = await this.camps.updateOne(
      {
        _id: new ObjectID(camp.id),
        opCount: lastServerOp,
      },
      {
        $set: {
          name: camp.name,
          lists: camp.lists,
          opCount: lastServerOp + newOpCount,
        },
      },
      { session }
    );
    return !!result.modifiedCount;
  }

  async addCampToUser(userId: string, campId: string): Promise<void> {
    if (!this.users) {
      throw Error("users is null");
    }
    await this.users.updateOne(
      { _id: new ObjectID(userId) },
      { $push: { camps: new ObjectID(campId) } }
    );
  }

  async getCamp(id: string): Promise<Camp | undefined> {
    if (!this.camps) {
      throw Error("Camps is null");
    }
    // console.log("Looking for ", id);
    const camp = await this.camps.findOne(
      { _id: new ObjectID(id) },
      {
        projection: {
          name: 1,
          lists: 1,
          opCount: 1,
        },
      }
    );
    // console.log("Found ", camp);
    return camp
      ? {
          id,
          name: camp.name,
          lists: camp.lists,
          revision: camp.opCount,
        }
      : undefined;
  }

  async getCampWithOps(
    id: string,
    nextOp: number
  ): Promise<[Camp | undefined, CampOperation[]]> {
    if (!this.camps || !this.operations) {
      throw Error("Camps or operations is null");
    }
    const dbCamp = await this.camps.findOne(
      { _id: new ObjectID(id) },
      {
        projection: {
          name: 1,
          lists: 1,
          opCount: 1,
        },
      }
    );
    if (!dbCamp) {
      return [undefined, []];
    }
    const camp = {
      id,
      name: dbCamp.name,
      lists: dbCamp.lists,
      revision: dbCamp.opCount,
    };
    if (nextOp >= dbCamp.opCount) {
      return [camp, []];
    }

    const slices = getChunkSlices(nextOp, dbCamp.opCount - nextOp);
    // console.log(slices);
    const chunkFinds = slices.map((slice) =>
      this.operations?.findOne(
        { campId: new ObjectID(id), chunkId: slice.chunkId },
        {
          projection: {
            ops: {
              $slice: [slice.startIndex, slice.count],
            },
          },
        }
      )
    );

    // Combine the chunks
    const ops = (await Promise.all(chunkFinds))
      .map((doc) => doc?.ops)
      .flat()
      .filter((o) => !!o) as CampOperation[];
    return [camp, ops];
  }

  async writeCamp(
    camp: Camp,
    newOps: CampOperation[],
    lastServerOp: number
  ) {
    let succeeded = false;
    let campId = camp.id;
    if (!this.client) {
      throw Error("Client is null");
    }
    const session = this.client.startSession();
    const transactionOptions = {
      readPreference: "primary",
      readConcern: { level: "local" },
      writeConcern: { w: "majority" },
    } as TransactionOptions;
    try {
      await session.withTransaction(async () => {
        if (!this.camps || !this.operations) {
          throw Error("Camps or operations is null");
        }
        if (newOps[0].type === "CREATE_CAMP") {
          campId = await this.createCamp(camp.name, camp.lists, newOps.length, session);
        } else {
          const wroteOne = await this.updateCamp(
            camp,
            lastServerOp,
            newOps.length,
            session
          );
          if (!wroteOne) {
            // console.log("!wroteOne", newOps[0].id);
            // Someone else updated it before us
            return;
          }
        }

        let nextIndex = 0;
        for (let chunk of getChunkSlices(lastServerOp, newOps.length)) {
          // console.log(chunk);
          const ops = newOps.slice(nextIndex, nextIndex + chunk.count);
          nextIndex += chunk.count;
          if (chunk.startIndex === 0) {
            await this.operations.insertOne(
              {
                campId: new ObjectID(campId),
                chunkId: chunk.chunkId,
                ops,
              },
              { session }
            );
          } else {
            await this.operations.updateOne(
              {
                campId: new ObjectID(campId),
                chunkId: chunk.chunkId,
              },
              {
                $push: { ops: { $each: ops } },
              },
              { session }
            );
          }
        }
        succeeded = true;
      }, transactionOptions);
    } catch (e) {
      console.log(e);
    }

    return { succeeded, campId };
  }
}

export function createStore() {
  return new Store();
}

function getChunkSlices(firstOp: number, count: number) {
  const lastOp = firstOp + count;
  const slices = [] as ChunkSlice[];
  const firstChunkId = Math.floor(firstOp / OpChunkSize);
  const lastChunkId = Math.floor(lastOp / OpChunkSize);

  // First chunk
  slices.push({
    chunkId: firstChunkId,
    startIndex: firstOp % OpChunkSize,
    count: lastChunkId > firstChunkId
    ? OpChunkSize - (firstOp % OpChunkSize)
    : lastOp - firstOp
  });
  // Middle chunks
  for (let chunkId = firstChunkId + 1; chunkId < lastChunkId; chunkId++) {
    slices.push({
      chunkId,
      startIndex: 0,
      count: OpChunkSize
    });
  }
  // Last chunk
  if (
    lastChunkId > firstChunkId &&
    lastOp > lastChunkId * OpChunkSize
  ) {
    slices.push({
      chunkId: lastChunkId,
      startIndex: 0,
      count: lastOp % OpChunkSize
    });
  }
  return slices;
}