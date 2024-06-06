import { app } from "electron";
import { BackgroundProcess } from "./background-process";
import { store } from "./store";
import { backgroundProcessStarted } from "shared/actions";

// app.commandLine.appendSwitch("--no-sandbox");

const main = async () => {
  await app.whenReady();

  app.on("window-all-closed", () => {
    app.quit();
  });

  const application = new BackgroundProcess();
  store.dispatch(backgroundProcessStarted(application));
};

main();
