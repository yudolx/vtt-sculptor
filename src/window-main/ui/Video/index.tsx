import React from "react";
import { Box, styled } from "@mui/joy";
import { IVideoSliceState } from "main-process/store/video/slice";
import { ISubtitlesSliceState } from "main-process/store/subtitles/slice";
import { assert } from "shared/assert";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { VTTCueUuid } from "./VttCueUuid";

export interface IVideoProps {
  path: IVideoSliceState["path"];
  cues: ISubtitlesSliceState["cues"];
  regions: ISubtitlesSliceState["regions"];
}

interface IVideoState {}

export class Video extends React.Component<IVideoProps, IVideoState> {
  protected regions: Record<string, VTTRegion> = {};
  protected videoEl: HTMLVideoElement | null = null;

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
  }

  componentDidUpdate(
    prevProps: Readonly<IVideoProps>,
    prevState: Readonly<IVideoState>,
    snapshot?: any,
  ): void {
    this.recreateRegions();
    this.mergeCues();
  }

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

    const propsCues = (this.props.cues ?? []) as IVTTCue[];
    const trackCues = [...(track.cues ?? [])].filter(VTTCueUuid.is);

    // Delete removed cues
    trackCues.forEach((tCue) => {
      if (!propsCues.find((pCue) => tCue.uuid === pCue.uuid)) {
        track.removeCue(tCue);
      }
    });

    // Update existing cues and add new
    propsCues.forEach((propsCue) => {
      let cue: VTTCueUuid;
      const existingCue = trackCues.find((tCue) => tCue.uuid === propsCue.uuid);
      if (!existingCue) {
        cue = new VTTCueUuid(
          propsCue.startTime,
          propsCue.endTime,
          propsCue.text,
          propsCue.uuid,
        );
        track.addCue(cue);
      } else {
        cue = existingCue;
      }

      cue.id = propsCue.id;
      cue.align = propsCue.align;
      cue.line = propsCue.line;
      cue.lineAlign = propsCue.lineAlign;
      cue.position = propsCue.position;
      cue.positionAlign = propsCue.positionAlign;
      cue.size = propsCue.size;
      cue.snapToLines = propsCue.snapToLines;
      cue.vertical = propsCue.vertical;
      cue.region = propsCue.region ? this.regions[propsCue.region] : null;
      // cue.track = cue
    });
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
