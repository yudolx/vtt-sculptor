import React from "react";
import { CuesMerger } from "./cues-merger";
import {
  IPlaceholderCue,
  isNotPlaceholderCue,
} from "main-process/store/subtitles/placeholderCue";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export const useCueMerger = (
  cues: (IVTTCue | IPlaceholderCue)[] | null,
  videoPath: string | null,
) => {
  const [textTrack, setTextTrack] = React.useState<TextTrack | null>(null);
  const checkModeInterval = React.useRef<number | null>(null);
  const hasUpdateDebt = React.useRef(false);
  const [textTrackMode, setTextTrackMode] =
    React.useState<TextTrackMode | null>(null);

  // Standart TextTrack interface lacks dedicated event for `mode` change.
  // So we set up an interval and check if it was changed ourselfs.
  React.useEffect(() => {
    checkModeInterval.current = window.setInterval(() => {
      if (textTrackMode !== textTrack?.mode) {
        console.log("mode changed to = ", textTrack?.mode);
        setTextTrackMode(textTrack?.mode ?? null);
      }
    }, 100);

    return () => {
      if (typeof checkModeInterval.current === "number") {
        clearInterval(checkModeInterval.current);
        checkModeInterval.current = null;
      }
    };
  }, [textTrack, textTrackMode]);

  // When textTrack.mode changes we check if it has an update debt and merge
  // cues for all the previous times the track should have been updated but was
  // hidden or disabled
  React.useEffect(() => {
    if (textTrackMode === "showing" && hasUpdateDebt.current === true) {
      hasUpdateDebt.current = false;

      if (textTrack) {
        console.log("update debt");
        new CuesMerger(textTrack, (cues ?? []).filter(isNotPlaceholderCue));
      } else {
        console.log("skipping update because no textTrack is set");
      }
    }
  }, [textTrackMode, textTrack, cues]);

  React.useEffect(() => {
    if (!textTrack) {
      return;
    }

    // Only do update if the track is visible. The track will not have any
    // cues accessable if it's hidden or disabled
    if (textTrack.mode === "showing") {
      new CuesMerger(textTrack, (cues ?? []).filter(isNotPlaceholderCue));
    } else {
      console.log(
        "mode is",
        textTrack.mode,
        "skipping update and setting debt",
      );
      // If it's hidden or disabled we set the flag for update. This flag is
      // checked everytime the text track mode is changed.
      hasUpdateDebt.current = true;
    }
  }, [cues, textTrack]);

  // Clear cues from the track when video changed
  React.useEffect(() => {
    return () => {
      if (!textTrack) {
        return;
      }

      [...(textTrack.cues ?? [])].forEach((cue) => {
        textTrack.removeCue(cue);
      });
    };
  }, [textTrack, videoPath]);

  return {
    setTextTrack,
  };
};
