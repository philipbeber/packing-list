import { AuthenticationError } from "apollo-server";
import { MyDataSources as DataSources } from "./datasources";
import { Resolvers } from "./generated/graphql";

type Context = { dataSources: DataSources };

export const resolvers: Resolvers<Context> = {
  Query: {
    me: async (parent, args, { dataSources }) => ({
      id: "12345",
      username: "bob@happycamping.com",
      name: "Bob (Ranger Bilbo)",
    }),
  },
  Mutation: {
    synchronize: async (
      parent,
      args,
      { dataSources }
    ) => {
      return dataSources.campAPI.syncCamp(args);
    },
    async login(
      parent,
      { email, password },
      { dataSources }
    ) {
      if (!email) {
        throw new AuthenticationError("Invalid email")
      }
      if (!password) {
        throw new AuthenticationError("Invalid password")
      }
      return dataSources.userAPI.login(email, password);
    },
  },
};
