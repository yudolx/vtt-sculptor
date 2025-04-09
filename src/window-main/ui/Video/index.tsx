import React from "react";
import { Box, styled } from "@mui/joy";
import { assert } from "shared/assert";
import { CuesMerger } from "./cues-merger";
import { VideoElContext } from "../context/video-el";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "shared/constants";
import { isNotPlaceholderCue } from "main-process/store/subtitles/placeholderCue";

export const Video = () => {
  const { videoEl, setVideoEl: setVideo } = React.useContext(VideoElContext);
  const pathQuery = useQuery({
    queryKey: [QueryKey.VideoPath],
    queryFn: window.electronAPI.fetchVideoPath,
  });
  const cuesQuery = useQuery({
    queryKey: [QueryKey.CuesList],
    queryFn: window.electronAPI.fetchCues,
  });
  const regionsQuery = useQuery({
    queryKey: [QueryKey.RegionsList],
    queryFn: window.electronAPI.fetchRegions,
  });

  React.useEffect(() => {
    if (videoEl) {
      const track = videoEl.addTextTrack("captions", "WIP Captions");
      track.mode = "showing";
    }
  }, [videoEl]);

  const regions = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(regionsQuery.data ?? {}).map(([regionId, iregion]) => {
        const region = new VTTRegion();
        region.lines = iregion.lines;
        region.regionAnchorX = iregion.regionAnchorX;
        region.regionAnchorY = iregion.regionAnchorY;
        region.scroll = iregion.scroll;
        region.viewportAnchorX = iregion.viewportAnchorX;
        region.viewportAnchorY = iregion.viewportAnchorY;
        region.width = iregion.width;

        return [regionId, region];
      }),
    );
  }, [regionsQuery.data]);

  React.useEffect(() => {
    if (!videoEl) {
      return;
    }

    const track = videoEl.textTracks[0];
    assert(track, "No WIP captions track found");

    console.log(cuesQuery.data);

    new CuesMerger(track, (cuesQuery.data ?? []).filter(isNotPlaceholderCue));
  }, [cuesQuery.data, videoEl]);

  return (
    <VideoElementContainer>
      <StyledVideo controls ref={setVideo} src={pathQuery.data ?? ""} />
    </VideoElementContainer>
  );
};

const VideoElementContainer = styled(Box, { name: "VideoElementContainer" })(
  () => {
    return {
      display: "flex",
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
      maxHeight: "100%",
      width: "100%",
    };
  },
);

const StyledVideo = styled("video", { name: "StyledVideo" })(() => {
  return {
    maxWidth: "100%",
    maxHeight: "100%",
  };
});
