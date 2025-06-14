import { app } from "electron";
import { setAutoFreeze } from "immer";
import { BackgroundProcess } from "./background-process";

// app.commandLine.appendSwitch("--no-sandbox");

setAutoFreeze(false);

const main = async () => {
  await app.whenReady();

  app.on("window-all-closed", () => {
    app.quit();
  });

  app.setAboutPanelOptions({
    applicationName: "VTT Sculptor",
    applicationVersion: "0.0.0",
  });

  const application = new BackgroundProcess();
};

main();
