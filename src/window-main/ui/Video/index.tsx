import React from "react";
import { Box, GlobalStyles, styled } from "@mui/joy";

import { VideoElContext } from "../context/video-el";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "shared/constants";
import { VideoComponent } from "./styledVideo";
import { useCueMerger } from "./useCueMerger";

export const Video = () => {
  const { videoEl } = React.useContext(VideoElContext);

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
  const stylesQuery = useQuery({
    queryKey: [QueryKey.Styles],
    queryFn: window.electronAPI.fetchStyles,
  });

  const { setTextTrack } = useCueMerger(
    cuesQuery.data ?? null,
    pathQuery.data ?? null,
  );

  React.useEffect(
    () => {
      if (videoEl) {
        const track = videoEl.addTextTrack("captions", "VTTSculpt");
        track.mode = "showing";

        setTextTrack(track);
      }

      return () => {
        setTextTrack(null);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoEl],
  );

  React.useEffect(() => {
    const handleVideoKeydownInternal = (event: KeyboardEvent) => {
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.code,
        )
      ) {
        videoEl?.blur();
        event.preventDefault();
      }
    };

    if (videoEl) {
      videoEl.addEventListener("keydown", handleVideoKeydownInternal);
    }

    return () => {
      videoEl?.removeEventListener("keydown", handleVideoKeydownInternal);
    };
  }, [videoEl]);

  const cueStylesString = React.useMemo(() => {
    if (!stylesQuery.data) {
      return "";
    }
    return stylesQuery.data
      .map((css) => {
        return css.replaceAll("::cue", "video::cue");
      })
      .join("\n");
  }, [stylesQuery.data]);

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

  return (
    <VideoElementContainer>
      <GlobalStyles styles={cueStylesString} />
      <VideoComponent src={pathQuery.data ?? ""} />
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
