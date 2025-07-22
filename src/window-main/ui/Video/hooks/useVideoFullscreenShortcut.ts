import React from "react";
import Mousetrap from "shared/libs/mousetrap";

export const useVideoFullscreenShortcut = (
  videoEl: HTMLVideoElement | null,
  blurVideoEl: () => void,
) => {
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
};
