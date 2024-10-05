import React from "react";
import { Box, styled } from "@mui/joy";
import { assert } from "shared/assert";
import { CuesMerger } from "./CuesMerger";
import { ISubtitlesStoreState } from "main-process/store/subtitles";
import { IVideoStoreState } from "main-process/store/video";

export interface IVideoProps {
  path: IVideoStoreState["path"];
  cues: ISubtitlesStoreState["cues"];
  regions: ISubtitlesStoreState["regions"];
}

interface IVideoState {}

export class Video extends React.Component<IVideoProps, IVideoState> {
  protected regions: Record<string, VTTRegion> = {};
  protected videoEl: HTMLVideoElement | null = null;
  protected unsubRequestVideTime: (() => void) | null = null;

  constructor(props: IVideoProps) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState(): IVideoState {
    return {};
  }

  componentDidMount(): void {
    assert(this.videoEl, "No video element found");

    const track = this.videoEl.addTextTrack("captions", "WIP Captions");
    track.mode = "showing";

    this.recreateRegions();
    this.mergeCues();

    this.unsubRequestVideTime = window.electronAPI.onRequestVideoCurrenTime(
      () => {
        if (this.videoEl?.currentTime) {
          window.electronAPI.videoCurrentTime(this.videoEl.currentTime);
        } else {
          throw new Error("No video element found");
        }
      },
    );
  }

  componentWillUnmount(): void {
    this.unsubRequestVideTime?.();
  }

  componentDidUpdate(
    prevProps: Readonly<IVideoProps>,
    prevState: Readonly<IVideoState>,
    snapshot?: any,
  ): void {
    this.recreateRegions();
    this.mergeCues();
  }

  setVideoRef = (video: HTMLVideoElement | null) => {
    this.videoEl = video;
  };

  recreateRegions() {
    const newRegions: Record<string, VTTRegion> = Object.fromEntries(
      Object.entries(this.props.regions ?? {}).map(([regionId, iregion]) => {
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

    this.regions = newRegions;
  }

  mergeCues() {
    assert(this.videoEl, "No video element found");

    const track = this.videoEl.textTracks[0];
    assert(track, "No WIP captions track found");

    new CuesMerger(track, this.props.cues ?? []);
  }

  render(): React.ReactNode {
    return (
      <VideoElementContainer>
        <StyledVideo
          ref={(el) => (this.videoEl = el)}
          controls
          src={this.props.path ?? ""}
        ></StyledVideo>
      </VideoElementContainer>
    );
  }
}

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
