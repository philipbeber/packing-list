import { Collection, MongoClient, ObjectID } from "mongodb";
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

export interface DbCamp {
  name: string;
  lists: List[];
  opCount: number;
  ops: CampOperation[];
}

export interface CampWithOps extends Camp {
  ops: CampOperation[];
}

export class Store {
  private client: MongoClient;
  private connected?: Promise<any>;
  private users?: Collection<DbUser>;
  private camps?: Collection<DbCamp>;

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

  async getCampOps(
    id: string,
    nextOp: number
  ): Promise<CampOperation[] | undefined> {
    if (!this.camps) {
      throw Error("Camps is null");
    }
    const camp = await this.camps.findOne(
      { _id: new ObjectID(id) },
      {
        projection: {
          ops: { $slice: [nextOp, 1000000000] },
        },
      }
    );
    return camp?.ops || undefined;
  }

  async getCampWithOps(
    id: string,
    nextOp: number
  ): Promise<[Camp | undefined, CampOperation[]]> {
    if (!this.camps) {
      throw Error("Camps is null");
    }
    const camp = await this.camps.findOne(
      { _id: new ObjectID(id) },
      {
        projection: {
          name: 1,
          lists: 1,
          ops: { $slice: [nextOp, 1000000000] },
          opCount: 1,
        },
      }
    );
    const ops = camp ? camp.ops : [];
    return [
      camp
        ? {
            id,
            name: camp.name,
            lists: camp.lists,
            revision: camp.opCount,
          }
        : undefined,
      ops,
    ];
  }

  async writeCamp(camp: Camp, newOps: CampOperation[], lastServerOp: number) {
    if (!this.camps) {
      throw Error("Camps is null");
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
        $push: {
          ops: { $each: newOps },
        },
      }
    );
    return result.modifiedCount > 0;
  }
}

export function createStore() {
  return new Store();
}
