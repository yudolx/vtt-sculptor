import React from "react";
import { styled } from "@mui/joy";
import { VideoElContext } from "../context/video-el";
import { useVideoKeyboardNavigation } from "./hooks/useVideoKeyboardNavigation";
import { useVideo2xSpeedShortcuts } from "./hooks/useVideo2xSpeedShortcuts";
import { useVideoFullscreenShortcut } from "./hooks/useVideoFullscreenShortcut";

export interface IVideoComponentProps {
  src: string;
}

export const VideoComponent = (props: IVideoComponentProps) => {
  const { videoEl, setVideoEl } = React.useContext(VideoElContext);

  const blurVideoEl = React.useCallback(() => {
    if (document.activeElement === videoEl) {
      videoEl?.blur();
    }
  }, [videoEl]);

  useVideoKeyboardNavigation(videoEl);
  useVideo2xSpeedShortcuts(videoEl);
  useVideoFullscreenShortcut(videoEl, blurVideoEl);

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
