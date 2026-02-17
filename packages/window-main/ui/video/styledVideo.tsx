import React from "react";
import { styled } from "@mui/joy";
import { VideoElContext } from "@sculptor/shared";
import { useVideoKeyboardNavigation } from "./hooks/useVideoKeyboardNavigation";
import { useVideo2xSpeedShortcuts } from "./hooks/useVideo2xSpeedShortcuts";
import { useVideoFullscreenShortcut } from "./hooks/useVideoFullscreenShortcut";
import { useTrackModeObserver } from "./hooks/useTrackModeObserver";

export interface IVideoComponentProps {
  src: string;
}

export const VideoComponent = (props: IVideoComponentProps) => {
  const { videoEl, setVideoEl } = React.useContext(VideoElContext);
  const textTrack = videoEl?.textTracks[0] ?? null;

  const blurVideoEl = React.useCallback(() => {
    if (document.activeElement === videoEl) {
      videoEl?.blur();
    }
  }, [videoEl]);

  const { mode: textTrackMode } = useTrackModeObserver(textTrack);
  useVideoKeyboardNavigation(videoEl);
  useVideo2xSpeedShortcuts(videoEl);
  useVideoFullscreenShortcut(videoEl, blurVideoEl);

  React.useEffect(() => {
    if (textTrack) {
      if (textTrackMode) {
        textTrack.mode = textTrackMode;
      } else {
        textTrack.mode = "showing";
      }
    }
  }, [textTrackMode, textTrack]);

  return (
    <StyledVideo
      controls
      src={props.src}
      ref={setVideoEl}
      onPause={blurVideoEl}
      onPlay={blurVideoEl}
      onSeeked={blurVideoEl}
    />
  );
};

const StyledVideo = styled("video", { name: "StyledVideo" })(() => {
  return {
    maxHeight: "100%",
    width: "100%",
  };
});
