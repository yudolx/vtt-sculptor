// @ts-check
import path from "path";
import webpack from "webpack";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";

import * as defineVars from "./define.mjs";

export const SRC_DIR = path.resolve(import.meta.dirname, "src");
export const DIST_DIR = path.resolve(import.meta.dirname, "compiled");
export const NODE_ENV =
  /** @type {"development"|"production"}  */ (process.env.NODE_ENV) ??
  "development";

/** @type {boolean} */
export const WATCH = process.env.WATCH === "true";

const plugins = [
  new webpack.DefinePlugin(defineVars),
  new MiniCSSExtractPlugin({
    filename: "style.css",
  }),
];

let config = /** @type {import('webpack').Configuration} */ ({
  plugins,
  resolve: {
    modules: [path.resolve(import.meta.dirname, "node_modules"), SRC_DIR],
    extensions: [".js", ".ts", ".tsx", ".css"],
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
      {
        test: /\.css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: `css-loader`,
            options: {
              url: false,
              modules: {
                localIdentName: "[local]-[hash:base64:5]",
              },
            },
          },
        ],
      },
    ],
  },
  mode: NODE_ENV,
  devtool: false,
  watch: WATCH,
});

export { config };
