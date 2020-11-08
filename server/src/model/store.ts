import { Collection, MongoClient, ObjectID, ReadConcern, TransactionOptions } from "mongodb";
import { Camp, CampOperation, List } from "desert-thing-packing-list-common";
import { UserWithPassword } from "./user";

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

export class Store {
  private client: MongoClient;
  private connected?: Promise<any>;
  private users?: Collection<DbUser>;
  private camps?: Collection<DbCamp>;
  private operations?: Collection<DbOperations>;

  constructor() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw Error("MONGO_URI environment variable not set!!");
    }
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  initialize() {
    if (!this.connected) {
      this.connected = this.client
        .connect()
        .then(() => {
          this.users = this.client
            .db("desert-thing-packing-list")
            .collection("users");
        })
        .then(() => {
          this.camps = this.client
            .db("desert-thing-packing-list")
            .collection("camps");
        })
        .then(() => {
          this.operations = this.client
            .db("desert-thing-packing-list")
            .collection("operations");
        })
        .catch((err) => {
          console.error(err);
          process.exit(1);
        });
    }
    return this.connected;
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

  async createCamp(newCamp: {
    name: string;
    lists: List[];
    ops: CampOperation[];
    opCount: number;
  }): Promise<string> {
    if (!this.camps) {
      throw Error("camps is null");
    }
    const result = await this.camps.insertOne(newCamp);
    return result.insertedId.toHexString();
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
    console.log("Looking for ", id);
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
    console.log("Found ", camp);
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
    if (nextOp <= dbCamp.opCount) {
      return [camp, []];
    }

    const slices = getChunkSlices(nextOp, dbCamp.opCount - nextOp);
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

  async writeCamp(camp: Camp, newOps: CampOperation[], lastServerOp: number) {
    let succeeded = false;
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
        const result = await this.camps.updateOne(
          {
            _id: new ObjectID(camp.id),
            opCount: lastServerOp,
          },
          {
            $set: {
              name: camp.name,
              lists: camp.lists,
              opCount: lastServerOp + newOps.length,
            },
          }
        );
        if (!result.modifiedCount) {
          // Someone else updated it before us
          return;
        }
        let nextIndex = 0;
        for (let chunk of getChunkSlices(lastServerOp, newOps.length)) {
          const ops = newOps.slice(nextIndex, nextIndex + chunk.count);
          nextIndex += chunk.count;
          if (chunk.startIndex === 0) {
            await this.operations.insertOne({
              campId: new ObjectID(camp.id),
              chunkId: chunk.chunkId,
              ops,
            })
          } else {
            await this.operations.updateOne({
              campId: new ObjectID(camp.id),
              chunkId: chunk.chunkId
            }, {
              $push: { ops: { $each: ops }}
            });
          }
        }
        succeeded = true;
      }, transactionOptions);
    } catch (e) {
      console.log(e);
    }

    return succeeded;
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