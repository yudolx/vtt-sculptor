import React from "react";
import { Box, styled } from "@mui/joy";
import { Video } from "./video";
import { SubtitleTable } from "./subtitle-table";

export const App = () => {
  return (
    <AppWrapper>
      <VideoWrapper>
        <Video />
      </VideoWrapper>
      <SubtitleTableWrapper
        onKeyDown={(e) => {
          if (["ArrowUp", "ArrowDown", "Space"].includes(e.code)) {
            e.preventDefault();
          }
        }}
      >
        <SubtitleTable />
      </SubtitleTableWrapper>
    </AppWrapper>
  );
};

const AppWrapper = styled(Box, { name: "AppWrapper" })(() => {
  return {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };
});

const VideoWrapper = styled(Box, { name: "VideoWrapper" })(() => {
  return {
    display: "flex",
    maxHeight: 500,
  };
});

const SubtitleTableWrapper = styled(Box, { name: "SubtitleTableWrapper" })(
  () => {
    return {
      flexGrow: 1,
      overflow: "auto",
    };
  },
);
