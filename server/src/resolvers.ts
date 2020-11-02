import { AuthenticationError } from "apollo-server";
import { MyDataSources as DataSources } from "./datasources";
import { Resolvers } from "./generated/graphql";
import * as GraphQLDate from "graphql-date";

type Context = { dataSources: DataSources };

export const resolvers: Resolvers<Context> = {
  Date: GraphQLDate,
  
  Query: {
    async me(parent, args, { dataSources }) {
      throw Error("Not implemented");
    },
  },
  Mutation: {
    async synchronize(
      parent,
      args,
      { dataSources }
    ) {
      console.log(args);
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
