import { app } from "electron";
import { BackgroundProcess } from "./background-process";

// app.commandLine.appendSwitch("--no-sandbox");

const main = async () => {
  await app.whenReady();

  app.on("window-all-closed", () => {
    app.quit();
  });

  const application = new BackgroundProcess();
};

main();
