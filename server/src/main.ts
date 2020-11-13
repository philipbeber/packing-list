require("dotenv").config();

import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

import { MyContext, UserAPI } from "./datasources/user";

import { internalEngineDemo } from "./engineDemo";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { decryptToken } from "./model/authToken";
import { dataSources } from "./datasources";

// the function that sets up the global context for each resolver, using the req
const context: ({ req }: ExpressContext) => Promise<MyContext|undefined> = async ({ req }: ExpressContext) => {
  // simple auth check on every request
  const auth = req.headers && req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length);
    const ctx = decryptToken<MyContext>(token);
    // console.log(ctx);
    return ctx;
  }
  return {};
};

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context,
  introspection: true,
  playground: true,
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
    ...internalEngineDemo,
  },
});

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== "test") {
  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀 app running at ${url}`);
  });
}

// export all the important pieces for integration/e2e tests to use
module.exports = {
  dataSources,
  context,
  typeDefs,
  resolvers,
  ApolloServer,
  UserAPI,
//  store,
  server,
};
