import { DataSources } from "./datasources";

type Context = { dataSources: DataSources };
type LoginParameters = { email: string; password: string };

export const resolvers = {
  Query: {
    camps: async (_: any, __: any, { dataSources }: Context) => {
      return [
        {
          id: 123,
          name: "The Camp for Happy Campers",
          members: [],
          lists: [],
          deleted: false,
        },
      ];
    },
    me: async (_: any, __: any, { dataSources }: Context) => ({
      id: 12345,
      email: "bob@happycamping.com",
      displayName: "Bob (Ranger Bilbo)",
    }),
  },
  Mutation: {
    sendOperations: async (
      _: any,
      { operations }: any,
      { dataSources }: Context
    ) => {
      return {
        success: true,
      };
    },
    login: async (
      _: any,
      { email, password }: LoginParameters,
      { dataSources }: Context
    ) => {
      return dataSources.userAPI.login(email, password);
    },
  },
};
