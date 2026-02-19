// @ts-check
import path from "path";
import webpack from "webpack";
import MiniCSSExtractPlugin from "mini-css-extract-plugin";

import * as defineVars from "./define.mjs";

export const SRC_DIR = path.join(import.meta.dirname, "packages");
export const DIST_DIR = path.join(import.meta.dirname, "compiled");
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
  mode: NODE_ENV,
  devtool: false,
  watch: WATCH,

  plugins,

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".css"],
    symlinks: false,
    // modules: [path.join(import.meta.dirname, "node_modules")],
    alias: {
      /* eslint-disable prettier/prettier */
      "@sculptor/main-process/*": path.join(import.meta.dirname, "packages/main-process/*"),
      "@sculptor/shared": path.join(import.meta.dirname, "packages/shared/src/"),
      "@sculptor/window-cue-preferences/*": path.join(import.meta.dirname, "packages/window-cue-preferences/*"),
      "@sculptor/window-cue-split/*": path.join(import.meta.dirname, "packages/window-cue-split/*"),
      "@sculptor/window-main/*": path.join(import.meta.dirname, "packages/window-main/*"),
      "@sculptor/window-settings/*": path.join(import.meta.dirname, "packages/window-settings/*"),
      "@sculptor/helpers/*": path.join(import.meta.dirname, "packages/helpers/*"),
      /* eslint-enable prettier/prettier */
    },
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.(tsx|ts|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.join(import.meta.dirname, "tsconfig.json"),
            logLevel: "info",
            onlyCompileBundledFiles: true,
          },
        },
      },

      {
        test: /\.module\.(css)$/i,
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

      {
        test: /\.css$/i,
        exclude: /\.module\.(css)$/i,
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: `css-loader`,
            options: {
              url: false,
              modules: false,
            },
          },
        ],
      },
    ],
  },
});

export { config };
