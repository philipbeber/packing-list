import { InMemoryCache } from "@apollo/client";
import { LoggedInUser } from "../model/loggedInUser";
import { initialLoginValue } from "./login";

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        isLoggedIn() {
          return !!loggedInVar();
        },
      },
    },
  },
});

export const loggedInVar = cache.makeVar<LoggedInUser | undefined>(
  initialLoginValue()
);
