import {
  ApolloClient,
  NormalizedCacheObject,
  gql,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { cache, loggedInVar } from "./cache";

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
  }
`;

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = loggedInVar();
  const auth = token ? { authorization: `Bearer ${token}` } : {};
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      ...auth,
    },
  };
});

// Set up our apollo-client to point at the server we created
// this can be local or a remote endpoint
export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  link: authLink.concat(httpLink),
  headers: {
    "client-name": "Desert Festival Packing List [web]",
    "client-version": "1.0.0",
  },
  typeDefs,
  resolvers: {},
});

export const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;
