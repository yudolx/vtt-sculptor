import { app, session } from "electron";
import { BackgroundProcess } from "./background-process";

// app.commandLine.appendSwitch("--no-sandbox");

const main = async () => {
  await app.whenReady();

  app.on("window-all-closed", () => {
    app.quit();
  });

  app.setAboutPanelOptions({
    applicationName: "VTT Sculptor",
    applicationVersion: "0.0.0",
  });

  // // Loading provided extentions
  // if (__DEVELOPMENT__) {
  //   const isDirectory = async (p: string) => {
  //     try {
  //       const stat = await fs.stat(p);
  //       return stat.isDirectory();
  //     } catch {
  //       return false;
  //     }
  //   };

  //   try {
  //     const extentionsPath = path.join(__dirname, "extentions");
  //     if (await isDirectory(extentionsPath)) {
  //       const dirs = await fs.readdir(extentionsPath);
  //       for (const extDir of dirs) {
  //         const fullextPath = path.join(extentionsPath, extDir);
  //         if (await isDirectory(fullextPath)) {
  //           try {
  //             const ext =
  //               await session.defaultSession.extensions.loadExtension(
  //                 fullextPath,
  //               );
  //             console.log(`Extension loaded: ${ext.name} (ID: ${ext.id})`);
  //           } catch (err) {
  //             console.error("Failed to load extension:", err);
  //           }
  //         }
  //       }
  //     } else {
  //       console.log('"Extentions" is not a directory');
  //     }
  //   } catch {
  //     console.log("No extentions directory detected.");
  //   }
  // }

  const application = new BackgroundProcess();
};

main();
