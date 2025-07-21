import React from "react";
import {
  isPlaceholderCue,
  type IPlaceholderCue,
} from "main-process/store/subtitles/placeholderCue";
import { mockVttCue, IVTTCue } from "shared/libs/vtt/vttcue";
import { DEFAULT_CUE_LENGTH_SEC } from "shared/constants";

export const useWatchPlaceholderCues = (
  videoEl: HTMLVideoElement | null,
  cues: (IVTTCue | IPlaceholderCue)[],
) => {
  React.useEffect(() => {
    if (!videoEl) {
      return;
    }
    const placeholderCues = cues.filter(isPlaceholderCue);
    const now = Date.now();
    const converted = placeholderCues.map((placeholder) => {
      const ping = now - placeholder.timestamp;
      return mockVttCue({
        uuid: placeholder.uuid,
        startTime: Math.max(videoEl.currentTime - ping / 1000, 0),
        endTime: videoEl.currentTime + DEFAULT_CUE_LENGTH_SEC,
        text: "",
      });
    });

    if (converted.length > 0) {
      window.electronAPI.patchCues(converted);
    }
  }, [cues, videoEl]);
};
