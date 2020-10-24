import { DataSource } from "apollo-datasource";
import { AuthenticationError } from "apollo-server";
import { compare, hash } from "bcrypt";
import { LoginResponse, User } from "../generated/graphql";
import { makeToken } from "../model/authToken";
import { Store } from "../model/store";

const saltRounds = 10;

export class UserAPI extends DataSource {
  private context: any;
  constructor(private store: Promise<Store>) {
    super();
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config: any) {
    this.context = config.context;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Load hash from the db, which was preivously stored
    const store = await this.store;
    const user = await store.getUserByUserName(email);
    console.log(user);
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      // console.log(await hash(password, saltRounds));
      throw new AuthenticationError("Incorrect password");
    }
    return {
      token: makeToken({ userId: user._id }),
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    };
  }
}
