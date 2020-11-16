const fs = require("fs");
const { join } = require("path");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const cwd = process.cwd();

const debug = require("debug")("jest-mongodb:setup");

const globalConfigPath = join(cwd, "globalConfig.json");

module.exports = async () => {
  const replSet = new MongoMemoryReplSet({
    binary: {
      version: "4.2.10",
      skipMD5: true,
    },
    autoStart: true,
    replSet: { storageEngine: "wiredTiger" },
  });

  await replSet.waitUntilRunning();
  const uri = await replSet.getUri();

  const mongoConfig = {
    mongoUri: uri,
    mongoDBName: await replSet.getDbName(),
  };

  // Write global config to disk because all tests run in different contexts.
  fs.writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));
  debug("Config is written");

  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = replSet;
  process.env.MONGO_URL = uri;
};
