import React from "react";
import { CuesMerger } from "./cues-merger";
import { IVTTCue } from "@thulean-archives/shared/vtt/vttcue";
import { useTrackModeObserver } from "./hooks/useTrackModeObserver";

export const useCueMerger = (
  cues: IVTTCue[] | null,
  videoPath: string | null,
) => {
  const [textTrack, setTextTrack] = React.useState<TextTrack | null>(null);
  const { mode: textTrackMode } = useTrackModeObserver(textTrack);
  const hasUpdateDebt = React.useRef(false);

  // When textTrack.mode changes we check if it has an update debt and merge
  // cues for all the previous times the track should have been updated but was
  // hidden or disabled
  React.useEffect(() => {
    if (textTrackMode === "showing" && hasUpdateDebt.current === true) {
      hasUpdateDebt.current = false;

      if (textTrack) {
        console.log("update debt");
        new CuesMerger(textTrack, cues ?? []);
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
      new CuesMerger(textTrack, cues ?? []);
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
