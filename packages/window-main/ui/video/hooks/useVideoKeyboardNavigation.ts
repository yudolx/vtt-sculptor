import React from "react";
import { assert } from "@sculptor/helpers/assert";

export const useVideoKeyboardNavigation = (
  videoEl: HTMLVideoElement | null,
) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !videoEl ||
        window.document.activeElement?.tagName === "INPUT" ||
        window.document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.key === ",") {
        videoEl.currentTime = Math.max(videoEl.currentTime - 0.5, 0);
      } else if (event.key === ".") {
        videoEl.currentTime = Math.min(
          videoEl.currentTime + 0.5,
          videoEl.duration,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoEl]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        window.document.activeElement?.tagName === "INPUT" ||
        window.document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      assert(videoEl, "No video element present");

      if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)
      ) {
        const seekCoef = parseInt(event.key);
        assert(!Number.isNaN(seekCoef), "Parsing seek coefficient error");

        const seek = (videoEl.duration / 10) * seekCoef;
        videoEl.currentTime = seek;
      } else if (event.key === "ArrowRight") {
        videoEl.currentTime = Math.min(
          videoEl.currentTime + 5,
          videoEl.duration,
        );
      } else if (event.key === "ArrowLeft") {
        videoEl.currentTime = Math.max(videoEl.currentTime - 5, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoEl]);
};
