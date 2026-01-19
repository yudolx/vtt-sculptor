import React from "react";
import { Box, styled } from "@mui/joy";
import { Video } from "./video";
import { SubtitleTable } from "./subtitle-table";
import { Plugins } from "./plugins";

export const App = () => {
  return (
    <AppWrapper>
      <Left>
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
      </Left>
      <Right>
        <Plugins />
      </Right>
    </AppWrapper>
  );
};

const AppWrapper = styled(Box, { name: "AppWrapper" })(() => {
  return {
    display: "flex",
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

const Left = styled(Box, { name: "Left" })(() => {
  return {
    display: "flex",
    flexDirection: "column",
    maxWidth: 800,
  };
});

const Right = styled(Box, { name: "Right" })(() => {
  return {
    flexGrow: 1,
    borderLeft: "1px #e5e5e5 solid",
  };
});
