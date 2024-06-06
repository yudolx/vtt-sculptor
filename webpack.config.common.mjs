// @ts-check
import path from 'path'
import webpack from 'webpack';
import * as defineVars from './define.mjs';

export const SRC_DIR = path.resolve(import.meta.dirname, "src");
export const DIST_DIR = path.resolve(import.meta.dirname, "compiled");
export const NODE_ENV = /** @type {"development"|"production"}  */ (
  process.env.NODE_ENV
) ?? "development";
export const WATCH = /** @type {boolean} */(
  process.env.WATCH === "true"
) ?? false;

const plugins = [
  new webpack.DefinePlugin(defineVars),
];

let config = /** @type {import('webpack').Configuration} */({
  plugins,
  resolve: {
    modules: [path.resolve(import.meta.dirname, "node_modules"), SRC_DIR],
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.json",
            onlyCompileBundledFiles: true,
          },
        },
      },
    ],
  },
  mode: NODE_ENV,
  devtool: false,
  watch: WATCH
});

export { config };