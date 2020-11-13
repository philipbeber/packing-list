const {resolve} = require('path');

module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  globalSetup: resolve(__dirname, "./jest-setup.js"),
  globalTeardown: resolve(__dirname, "./jest-teardown.js"),
  testEnvironment: resolve(__dirname, "./jest-environment.js"),
  setupFilesAfterEnv: ["jest-expect-message"],
};