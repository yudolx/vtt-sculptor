// @ts-check
import packagejson from "./package.json" with { type: "json" };
import webpack from "webpack";
import path from "path";
import { merge } from "webpack-merge";
import HTMLWebpackPlugin from "html-webpack-plugin";
import {
  config as commonConfig,
  SRC_DIR,
  DIST_DIR,
} from "./webpack.config.common.mjs";

const rendererConfig = merge(commonConfig, {
  entry: {
    /* eslint-disable prettier/prettier */
    window_main: path.resolve(SRC_DIR, "./window-main/index.tsx"),
    window_cue_preferences: path.resolve(SRC_DIR, "./window-cue-preferences/index.tsx"),
    window_settings: path.resolve(SRC_DIR, "./window-settings/index.tsx"),
    window_cue_split: path.resolve(SRC_DIR, "./window-cue-split/index.tsx"),
  /* eslint-enable prettier/prettier */
  },
  output: {
    path: DIST_DIR,
    globalObject: "window",
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
    new HTMLWebpackPlugin({
      title: "",
      chunks: ["window_cue_split", "window_cue_split_preload"],
      filename: "window_cue_split.html",
    }),
    new webpack.container.ModuleFederationPlugin({
      name: "sculptor",
      filename: "sculptor_exposes.js",
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: packagejson.dependencies["react"],
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: packagejson.dependencies["react-dom"],
        },
        "@sculptor/shared": {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
      },
    }),
  ],
});

// --------------------------------------------------------------------

const mainProcessConfig = merge(commonConfig, {
  entry: path.join(SRC_DIR, "main-process/index.ts"),
  output: {
    filename: "main-process.js",
    path: DIST_DIR,
  },
  target: "electron-main",
});

// --------------------------------------------------------------------

const preloadConfig = merge(commonConfig, {
  entry: {
    /* eslint-disable prettier/prettier */
      window_main_preload: path.resolve(SRC_DIR, "./window-main/preload.ts"),
      window_cue_preferences_preload: path.resolve(SRC_DIR, "./window-cue-preferences/preload.ts"),
      window_settings_preload: path.resolve(SRC_DIR, "./window-settings/preload.ts"),
      window_cue_split_preload: path.resolve(SRC_DIR, "./window-cue-split/preload.ts"),
      /* eslint-enable prettier/prettier */
  },
  output: {
    path: DIST_DIR,
  },
  target: "electron-preload",
});

const sharedPackageConfig = merge(commonConfig, {
  entry: path.resolve(SRC_DIR, "./shared/src/index.ts"),
  output: {
    path: DIST_DIR,
    // library: {
    //   type: "commonjs2",
    // },
  },
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      name: "shared",
      filename: "shared_exposes.js",
      exposes: {
        "./VideoProvider": path.resolve(SRC_DIR, "./shared/src/VideoProvider"),
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: packagejson.dependencies["react"],
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: packagejson.dependencies["react-dom"],
        },
      },
    }),
  ],
});

export default [
  sharedPackageConfig,
  rendererConfig,
  preloadConfig,
  mainProcessConfig,
];
