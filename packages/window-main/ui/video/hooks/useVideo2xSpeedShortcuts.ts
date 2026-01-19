import React from "react";

export const useVideo2xSpeedShortcuts = (videoEl: HTMLVideoElement | null) => {
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
};
