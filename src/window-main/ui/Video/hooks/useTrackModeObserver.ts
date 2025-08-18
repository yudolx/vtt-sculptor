import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "shared/constants";

export const useTrackModeObserver = (textTrack: TextTrack | null) => {
  const { data: remoteTrackVisible } = useQuery({
    queryKey: [QueryKey.VideoSubtitlesVisible],
    queryFn: window.electronAPI.fetchVideoTrackVisible,
  });
  const checkModeInterval = React.useRef<number | null>(null);
  const [internalTrackMode, setInternalTrackMode] =
    React.useState<TextTrackMode | null>(null);

  // Standart TextTrack interface lacks dedicated event for `mode` change.
  // So we set up an interval and check if it was changed ourselfs.
  React.useEffect(() => {
    checkModeInterval.current = window.setInterval(() => {
      if (internalTrackMode !== textTrack?.mode) {
        console.log("mode changed to = ", textTrack?.mode);
        setInternalTrackMode(textTrack?.mode ?? null);
      }
    }, 100);

    return () => {
      if (typeof checkModeInterval.current === "number") {
        clearInterval(checkModeInterval.current);
        checkModeInterval.current = null;
      }
    };
  }, [textTrack, internalTrackMode]);

  React.useEffect(() => {
    setInternalTrackMode(remoteTrackVisible ? "showing" : "disabled");
  }, [remoteTrackVisible]);

  const setImmediateTrackModeVisible = React.useCallback((value: boolean) => {
    setInternalTrackMode(value ? "showing" : "disabled");
    window.electronAPI.setVideoTrackVisible(value);
  }, []);

  return React.useMemo(() => {
    return {
      mode: internalTrackMode,
      setImmediateTrackModeVisible,
    };
  }, [internalTrackMode, setImmediateTrackModeVisible]);
};
