import { DataSource, DataSourceConfig } from "apollo-datasource";
import { AuthenticationError } from "apollo-server";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { compare, hash } from "bcrypt";
import { Camp } from "desert-thing-packing-list-common";
import { LoginResponse, User } from "../generated/graphql";
import { makeToken } from "../model/authToken";
import { Store } from "../model/store";

const saltRounds = 10;

export interface MyContext {
  userId?: string
}



export class UserAPI extends DataSource<MyContext> {
  private context: any;
  constructor(private store: Store) {
    super();
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  async initialize(config: DataSourceConfig<MyContext>) {
    this.context = config.context;
    await this.store.initialize();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Load hash from the db, which was preivously stored
    const user = await this.store.getUserByUserName(email);
    console.log(user);
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      // console.log(await hash(password, saltRounds));
      throw new AuthenticationError("Incorrect password");
    }
    const camps = (
      await Promise.all(user.camps.map((campId) => this.store.getCamp(campId)))
    ).filter((camp) => !!camp);
    camps.forEach(c=>console.log(c));
    return {
      token: makeToken({ userId: user.id }),
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      },
      camps: camps as Camp[]
    };
  }
}
