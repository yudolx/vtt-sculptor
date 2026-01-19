import React from "react";
import { DEFAULT_CUE_LENGTH_SEC } from "@sculptor/helpers/constants";
import { mockVttCue } from "@sculptor/helpers/vtt";

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
