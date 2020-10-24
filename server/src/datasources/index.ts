import { Store } from "../model/store";
import { UserAPI } from "./user";
export * from "./user";

export interface DataSources {
  userAPI: UserAPI;
}

// set up any dataSources our resolvers need
export function createDataSources(store: Promise<Store>) {
  return {
    userAPI: new UserAPI(store),
  };
}
