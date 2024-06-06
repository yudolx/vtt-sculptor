// @ts-check
import path from "path";
import { merge } from "webpack-merge";
import HTMLWebpackPlugin from "html-webpack-plugin";
import {
  config as commonConfig,
  SRC_DIR,
  DIST_DIR,
} from "./webpack.config.common.mjs";

const rendererConfig = merge(
  commonConfig,
  /** @type {import('webpack').Configuration} */ ({
    entry: {
      window_main: path.resolve(SRC_DIR, "./window-main/index.tsx"),
      window_main_preload: path.resolve(SRC_DIR, "./window-main/preload.ts"),
    },
    output: {
      path: DIST_DIR,
    },
    target: "electron-renderer",
    plugins: [
      new HTMLWebpackPlugin({
        // chunks: ["vendor", "window_main", "shared_css"],
        // chunksSortMode: "manual",
        filename: "window_main.html",
      }),
    ],
  }),
);

const mainProcessConfig = merge(
  commonConfig,
  /** @type {import('webpack').Configuration} */ ({
    entry: path.join(SRC_DIR, "main-process/index.ts"),
    output: {
      filename: "main-process.js",
      path: DIST_DIR,
    },
    target: "electron-main",
  }),
);

export default [rendererConfig, mainProcessConfig];
