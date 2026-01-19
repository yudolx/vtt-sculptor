import fs from "fs/promises";
import path from "path";
import type { SettingsStore } from "./settings";

export interface IPlugin {
  main: {
    pluginId: string;
    pluginName: string;
    pluginDescription: string;
    toolbarButtons: any[];
    settings: any[];
  };
  path: string;
}

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
    const pluginsDir = this.settings.pluginsSettings.path;
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
      for (const dir of dirlist) {
        const absolutePluginDirPath = path.join(pluginsDir, dir);
        const pluginPath = await tryRootOrCompiledFolder(absolutePluginDirPath);
        if (pluginPath) {
          /* eslint-disable prettier/prettier, @typescript-eslint/no-var-requires */
          const main = require(/* webpackIgnore: true */ path.join(pluginPath, "main.js"));
          // const renderer = await fs.readFile(path.join(pluginPath, "renderer.js"), "utf-8");
          // const preload = await fs.readFile(path.join(pluginPath, "preload.js"), "utf-8");
          /* eslint-enable prettier/prettier, @typescript-eslint/no-var-requires */

          this.plugins.push({ main, path: pluginPath });
        }
      }
    }
  }

  public list() {
    return this.plugins;
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
