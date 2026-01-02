import React from "react";
import { mockVttCue } from "@thulean-archives/shared/vtt/vttcue";
import { DEFAULT_CUE_LENGTH_SEC } from "shared/constants";

export const useGlobalShortcuts = (videoEl: HTMLVideoElement | null) => {
  React.useEffect(() => {
    const unsubscribe = window.electronAPI.onRequestInsertNewCue(
      (event, timestamp) => {
        if (!videoEl) {
          return;
        }

        const now = Date.now();
        const ping = now - timestamp;

        const cue = mockVttCue({
          startTime: Math.max(videoEl.currentTime - ping / 1000, 0),
          endTime: videoEl.currentTime + DEFAULT_CUE_LENGTH_SEC,
          text: "",
        });

        window.electronAPI.insertCues(cue);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [videoEl]);
};
