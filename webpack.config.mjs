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
  /* eslint-disable prettier/prettier */
  /** @type {import('webpack').Configuration} */ ({
    entry: {
      window_main: path.resolve(SRC_DIR, "./window-main/index.tsx"),
      window_main_preload: path.resolve(SRC_DIR, "./window-main/preload.ts"),

      window_cue_preferences: path.resolve(SRC_DIR, "./window-cue-preferences/index.tsx"),
      window_cue_preferences_preload: path.resolve(SRC_DIR, "./window-cue-preferences/preload.ts"),

      window_settings: path.resolve(SRC_DIR, "./window-settings/index.tsx"),
      window_settings_preload: path.resolve(SRC_DIR, "./window-settings/preload.ts"),
    },
    /* eslint-enable prettier/prettier */
    output: {
      path: DIST_DIR,
    },
    target: "electron-renderer",
    plugins: [
      new HTMLWebpackPlugin({
        title: "",
        chunks: ["window_main", "window_main_preload"],
        filename: "window_main.html",
      }),
      new HTMLWebpackPlugin({
        title: "",
        chunks: ["window_cue_preferences", "window_cue_preferences_preload"],
        filename: "window_cue_preferences.html",
      }),
      new HTMLWebpackPlugin({
        title: "",
        chunks: ["window_settings", "window_settings_preload"],
        filename: "window_settings.html",
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
