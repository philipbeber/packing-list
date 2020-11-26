import {
  ApolloClient,
  NormalizedCacheObject,
  gql,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
  }
`;

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

// Set up our apollo-client to point at the server we created
// this can be local or a remote endpoint
export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
  headers: {
    "client-name": "Desert Festival Packing List [web]",
    "client-version": "1.0.0",
  },
  typeDefs,
  resolvers: {},
});
