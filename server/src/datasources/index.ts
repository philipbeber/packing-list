import { DataSources } from "apollo-server-core/dist/graphqlOptions"
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { createStore, Store } from "../model/store";
import { CampAPI } from "./camp";
import { MyContext, UserAPI } from "./user";
export * from "./user";

export interface MyDataSources extends DataSources<MyContext> {
  userAPI: UserAPI;
  campAPI: CampAPI;
}

const store = createStore();

// set up any dataSources our resolvers need
export function dataSources(): MyDataSources {
  return {
    userAPI: new UserAPI(store),
    campAPI: new CampAPI(store)
  };
}
