import React from "react";
import { IpcRendererEvent } from "electron";
import { Box, styled } from "@mui/joy";
import { IApplicationState } from "main-process/store";
import { Video } from "./video";
import { SubtitleTable } from "./subtitle-table";

interface IAppProps {}
interface IAppState extends IApplicationState {
  initialStateLoaded: boolean;
}

export class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
      initialStateLoaded: false,
      video: {
        path: null,
      },
      subtitles: {
        cues: [],
        file: null,
        regions: {},
      },
    };
  }

  async componentDidMount() {
    const state = await window.electronAPI.getState();
    this.setState({
      initialStateLoaded: true,
      ...state,
    });

    window.electronAPI.onStateChanged(this.handleStateChanged);
  }

  private handleStateChanged = (
    event: IpcRendererEvent,
    state: IApplicationState,
  ) => {
    this.setState(state);
  };

  render(): React.ReactNode {
    if (!this.state.initialStateLoaded) {
      return null;
    }

    return (
      <AppWrapper>
        <VideoWrapper>
          <Video
            cues={this.state.subtitles.cues}
            path={this.state.video.path}
            regions={this.state.subtitles.regions}
          />
        </VideoWrapper>
        <SubtitleTableWrapper>
          <SubtitleTable cues={this.state.subtitles.cues} />
        </SubtitleTableWrapper>
      </AppWrapper>
    );
  }
}

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
