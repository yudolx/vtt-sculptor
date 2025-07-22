import React from "react";
import { styled } from "@mui/joy";
import { VideoElContext } from "../context/video-el";
import Mousetrap from "shared/libs/mousetrap";

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

  React.useEffect(() => {
    Mousetrap.bind("f", () => {
      if (!document.fullscreenElement) {
        videoEl?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    return () => {
      Mousetrap.unbind("f");
    };
  }, [videoEl]);

  React.useEffect(() => {
    if (videoEl) {
      videoEl.addEventListener("fullscreenchange", blurVideoEl);
    }

    return () => {
      if (videoEl) {
        videoEl.removeEventListener("fullscreenchange", blurVideoEl);
      }
    };
  }, [videoEl, blurVideoEl]);

  React.useEffect(() => {
    let holdTimeout: number | null = null;

    const preventDefault = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!videoEl || event.button !== 0) return;

      if (holdTimeout !== null) {
        window.clearTimeout(holdTimeout);
      }

      if (videoEl) {
        videoEl.playbackRate = 1;
        if (document.activeElement === videoEl) {
          videoEl.blur();
        }
      }
    };

    const handleMouseLeave = () => {
      window.removeEventListener("click", preventDefault);

      if (holdTimeout !== null) {
        window.clearTimeout(holdTimeout);
      }

      if (videoEl) {
        videoEl.playbackRate = 1;
        if (document.activeElement === videoEl) {
          videoEl.blur();
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (
        !videoEl ||
        videoEl.paused ||
        event.button !== 0 ||
        event.target !== videoEl
      ) {
        return;
      }

      window.addEventListener("mouseup", handleMouseUp, { once: true });
      window.addEventListener("mouseleave", handleMouseLeave, { once: true });

      holdTimeout = window.setTimeout(() => {
        window.addEventListener("click", preventDefault, {
          once: true,
          capture: true,
        });

        if (videoEl) {
          if (!videoEl.paused) {
            videoEl.playbackRate = 2;
          }
        }
      }, 700);
    };

    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", preventDefault);

      if (holdTimeout !== null) {
        window.clearTimeout(holdTimeout);
        holdTimeout = null;
      }
    };
  }, [videoEl]);

  return (
    <StyledVideo
      controls
      ref={setVideoEl}
      onPause={blurVideoEl}
      onPlay={blurVideoEl}
      onSeeked={blurVideoEl}
      src={props.src}
    />
  );
};

const StyledVideo = styled("video", { name: "StyledVideo" })(() => {
  return {
    maxHeight: "100%",
    width: "100%",
  };
});
