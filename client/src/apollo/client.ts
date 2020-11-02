import {
  ApolloClient,
  NormalizedCacheObject,
  gql,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import store from "../redux/store";

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
  const token = store.getState().user.token;
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
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
  headers: {
    "client-name": "Desert Festival Packing List [web]",
    "client-version": "1.0.0",
  },
  typeDefs,
  resolvers: {},
});
