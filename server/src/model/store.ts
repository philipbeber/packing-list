import { Collection, MongoClient } from "mongodb";
import { Camp, CampOperation, List } from "./common";
import { UserWithPassword } from "./user";

interface DbUser {
  _id: string;
  username: string;
  name: string;
  password: string;
  superuser?: boolean;
}

export interface DbCamp {
  _id: string;
  name: string;
  lists: List[];
  opCount: number;
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
      { projection: { _id: 1, name: 1, username: 1, password: 1 } }
    );
    if (!user) {
      return undefined;
    }
    const { _id, ...removeId } = user;
    return {
      ...removeId,
      id: user._id,
    };
  }

  async getCamp(id: string, nextOp: number): Promise<DbCamp | undefined> {
    if (!this.camps) {
      throw Error("Camps is null");
    }
    const camp = await this.camps.findOne(
      { _id: id },
      {
        projection: {
          ops: { $slice: [nextOp, 1000000000] },
          opCount: 1,
          name: 1,
          lists: 1,
        },
      }
    );
    return camp || undefined;
  }
}

export function createStore() {
  return new Store();
}
