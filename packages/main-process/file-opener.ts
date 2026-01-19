import path from "path";
import { app as electronApp } from "electron";
import type { BackgroundProcess } from "./background-process";
import { supportedVideoExtensions } from "./constants";
import { parseWebVTT } from "@sculptor/helpers/vtt";
import { readFile, stat } from "fs/promises";

export class FileOpener {
  constructor(protected app: BackgroundProcess) {}

  open = async (event: Electron.Event | null, filePath: string) => {
    if (this.isSubtitles(filePath)) {
      this.openSubtitles(filePath);

      // load the video only if it is not already loaded
      if (!this.app.store.video.getPath()) {
        this.tryLoadVideo(filePath);
      }
    } else {
      this.openVideo(filePath);

      if (!this.app.store.subtitles.getFile()) {
        this.tryLoadSubtitles(filePath);
      }
    }

    electronApp.addRecentDocument(filePath);
  };

  protected isSubtitles(filePath: string) {
    return path.extname(filePath) === ".vtt";
  }

  protected async openSubtitles(subtitlesPath: string) {
    const content = await readFile(subtitlesPath, "utf-8");

    const { cues, regions, styles } = parseWebVTT(content.toString());

    this.app.store.setFileAndCues({
      cues,
      regions,
      styles,
      file: subtitlesPath,
    });
  }

  protected openVideo(videoPath: string) {
    this.app.store.setVideoPath(videoPath);
  }

  protected tryLoadSubtitles = async (videoPath: string) => {
    const dir = path.dirname(videoPath);
    const extname = path.extname(videoPath);
    const filename = path.basename(videoPath).replace(extname, "");
    const subtitleFilePath = path.join(dir, `${filename}.vtt`);

    try {
      await stat(subtitleFilePath);
      this.openSubtitles(subtitleFilePath);
    } catch (e) {
      console.error(e);
    }
  };

  protected tryLoadVideo = async (filePath: string) => {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath).replace(".vtt", "");
    const videoFilePaths = supportedVideoExtensions.map((ext) =>
      path.join(dir, `${filename}.${ext}`),
    );

    try {
      const videoPath = await Promise.any(
        videoFilePaths.map((p) => {
          return new Promise<string>((resolve, reject) => {
            stat(p)
              .then(() => {
                resolve(p);
              })
              .catch(reject);
          });
        }),
      );
      this.openVideo(videoPath);
    } catch (e) {
      console.error(e);
    }
  };
}
