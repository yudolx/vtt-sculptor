import React from "react";
import { Box, styled } from "@mui/joy";

export interface IVideoProps {
  path: string | null;
}

interface IVideoState {}

export class Video extends React.Component<IVideoProps, IVideoState> {
  // constructor(props: IVideoProps) {
  //   super(props)
  // }

  renderVideoElement() {
    if (this.props.path) {
      return (
        <VideoElementContainer>
          <video controls src={this.props.path}></video>
        </VideoElementContainer>
      );
    }

    return null;
  }

  render(): React.ReactNode {
    return <Box sx={{ height: 1, width: 1 }}>{this.renderVideoElement()}</Box>;
  }
}

const VideoElementContainer = styled(Box, { name: "VideoElementContainer" })(
  () => {
    return {
      display: "flex",
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
    };
  },
);
