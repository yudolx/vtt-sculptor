import React from "react";
import {
  isPlaceholderCue,
  type IPlaceholderCue,
} from "main-process/store/subtitles/placeholderCue";
import { createVttCue, IVTTCue } from "shared/libs/vtt/vttcue";
import { toFixedNumber } from "shared/to-fixed-number";
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
      return createVttCue({
        uuid: placeholder.uuid,
        startTime: Math.max(videoEl.currentTime - ping / 1000, 0),
        endTime: toFixedNumber(videoEl.currentTime + DEFAULT_CUE_LENGTH_SEC, 3),
        text: "",
      });
    });

    window.electronAPI.cueChanged(converted);
  }, [cues, videoEl]);
};
