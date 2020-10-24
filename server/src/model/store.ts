import { Collection, MongoClient } from "mongodb";

export class Store {
  private client: MongoClient;
  private connected: Promise<any>;
  private users?: Collection<any>;

  constructor() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw Error("MONGO_URI environment variable not set!!");
    }
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.connected = this.client.connect();
    this.connected
      .then(() => {
        this.users = this.client
          .db("desert-thing-packing-list")
          .collection("users");
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  }

  async getUserByUserName(username: string) {
    await this.connected;
    if (!this.users) {
      throw Error("Users is null");
    }
    return this.users.findOne({ username });
  }
}

export async function createStore() {
  return new Store();
}
