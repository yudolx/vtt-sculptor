import fs from "fs/promises";
import path from "path";
import type { SettingsStore } from "./settings";
import { ISettings } from "./settings/types";

export interface IPlugin {
  main: {
    pluginId: string;
    pluginName: string;
    pluginDescription: string;
    /** This property is not available outside of the main process */
    getDefaultSettings: () => unknown;
  };
  path: string;
}

const MIME_TYPE_MAP = new Map<string, string>([[".css", "text/css"]]);
const getMimeType = (ext: string) => MIME_TYPE_MAP.get(ext) ?? "text/plain";

export class PluginsManager {
  protected plugins: IPlugin[] = [];
  public ready: Promise<void>;

  constructor(public settings: SettingsStore) {
    this.ready = new Promise((resolve) => {
      this.scan().then(() => {
        resolve();
      });
    });
  }

  protected async scan() {
    const pluginsDir = this.settings.pluginsDirectory;
    if (path.isAbsolute(pluginsDir)) {
      try {
        await fs.stat(pluginsDir);
      } catch {
        console.error(
          `Plugins directory doesn't exist or user has no rights to read it`,
        );
        return;
      }

      const dirlist = await fs.readdir(pluginsDir);
      const pluginsSettings: ISettings["plugins"] = {};
      for (const dir of dirlist) {
        const absolutePluginDirPath = path.join(pluginsDir, dir);
        const pluginPath = await tryRootOrCompiledFolder(absolutePluginDirPath);
        if (pluginPath) {
          /* eslint-disable-next-line prettier/prettier, @typescript-eslint/no-var-requires */
          const main = require(/* webpackIgnore: true */ path.join(pluginPath, "main.js"));
          const plugin: IPlugin = { main, path: pluginPath };
          this.plugins.push(plugin);
          pluginsSettings[plugin.main.pluginId] =
            plugin.main.getDefaultSettings();
        }
      }
      this.settings.setState({
        plugins: pluginsSettings,
      });
    }
  }

  public list() {
    return this.plugins;
  }

  public ipcList() {
    return this.plugins.map((p) => {
      const { getDefaultSettings, ...goodMain } = p.main;
      return {
        ...p,
        main: goodMain,
      };
    });
  }

  public async execute(pluginId: string, methodArg: string) {
    const method = methodArg.split("/");
    const plugin = this.plugins.find((p) => p.main.pluginId === pluginId);

    if (!plugin) {
      return new Response("Not Found", {
        status: 404,
      });
    }

    if (method.at(0) === "file" && (method.at(1)?.length ?? 0) > 0) {
      const file = method.at(1)!;
      try {
        const fileContent = await fs.readFile(
          path.join(plugin.path, file),
          "utf-8",
        );

        return new Response(fileContent, {
          status: 200,
          headers: {
            "Content-Type": getMimeType(path.extname(file)),
          },
        });
      } catch (e) {
        return new Response("error, check console", {
          status: 404,
        });
      }
    }

    return new Response("not allowed", {
      status: 405,
    });
  }

  // public get(pluginId: string) {
  //   return this.plugins.find((p) => p.main.pluginId === pluginId) ?? null;
  // }
}

const tryRootOrCompiledFolder = async (rootpath: string) => {
  const compiledPath = path.join(rootpath, "compiled");
  try {
    const stat = await fs.stat(compiledPath);
    if (stat.isDirectory()) {
      return compiledPath;
    }
  } catch {}

  try {
    const stat = await fs.stat(rootpath);
    if (stat.isDirectory()) {
      return rootpath;
    }
  } catch {}

  return null;
};
