const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = function (options = {}, argv) {
  const BUILD_MODE =
    argv && argv.mode === "production" ? "production" : "development";
  const IS_PROD = BUILD_MODE === "production";
  const IS_DEV = BUILD_MODE === "development";

  return {
    module: {
      rules: [
        {
          exclude: [path.resolve(__dirname, "node_modules")],
          test: /\.ts$/,
          use: "ts-loader",
        },
      ],
    },
    output: {
      filename: "server.js",
      path: path.resolve(__dirname, "dist"),
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    target: "node",

    devtool: IS_DEV ? "inline-source-map" : "source-map",
    entry: [path.join(__dirname, "src/main.ts")],
    externals: [nodeExternals({})],
    mode: IS_DEV ? "development" : "production",
    plugins: [new CleanWebpackPlugin()],
    watch: IS_DEV && true,
  };
};
