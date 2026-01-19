import React from "react";
import MouseTrap from "mousetrap";

export const useVideoFullscreenShortcut = (
  videoEl: HTMLVideoElement | null,
  blurVideoEl: () => void,
) => {
  React.useEffect(() => {
    MouseTrap.bind("f", () => {
      if (!document.fullscreenElement) {
        videoEl?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    return () => {
      MouseTrap.unbind("f");
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
