import React from "react";
import { Box, styled } from "@mui/joy";
import { IVideoSliceState } from "main-process/store/video/slice";
import { ISubtitlesSliceState } from "main-process/store/subtitles/slice";
import { assert } from "shared/assert";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export interface IVideoProps {
  path: IVideoSliceState["path"];
  cues: ISubtitlesSliceState["cues"];
}

interface IVideoState {}

// export const Video: React.FC<IVideoProps> = (props) => {
//   const [videoEl, setVideoEl] = React.useState<HTMLVideoElement | null>(null);

//   React.useEffect(() => {
//     console.log(videoEl);
//   }, [videoEl]);

//   const renderVideoElement = () => {
//     if (props.path) {
//       return (
//         <VideoElementContainer>
//           <video
//             ref={(el) => setVideoEl(videoEl)}
//             controls
//             src={props.path}
//           ></video>
//         </VideoElementContainer>
//       );
//     }

//     return null;
//   };

//   return <Box sx={{ height: 1, width: 1 }}>{renderVideoElement()}</Box>;
// };

export class Video extends React.Component<IVideoProps, IVideoState> {
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
    console.log(track);

    this.mergeCues();
  }

  componentDidUpdate(
    prevProps: Readonly<IVideoProps>,
    prevState: Readonly<IVideoState>,
    snapshot?: any,
  ): void {
    this.mergeCues();
  }

  mergeCues() {
    assert(this.videoEl, "No video element found");

    const track = this.videoEl.textTracks[0];
    assert(track, "No WIP captions track found");

    const propsCues = (this.props.cues ?? []) as IVTTCue[];
    const trackCues = [...(track.cues ?? [])];

    // Delete removed cues
    trackCues.forEach((tCue) => {
      if (!propsCues.find((pCue) => tCue.id === pCue.id)) {
        track.removeCue(tCue);
      }
    });

    // Update existing cues and add new
    propsCues.forEach((propsCue) => {
      let cue: VTTCue;
      const existingCue = trackCues.find((tCue) => tCue.id === propsCue.id);
      if (!existingCue) {
        cue = new VTTCue(propsCue.startTime, propsCue.endTime, propsCue.text);
        track.addCue(cue);
      } else {
        // @ts-expect-error
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
      // cue.region = cue.region
      // cue.track = cue
    });
  }

  renderVideoElement() {
    return (
      <VideoElementContainer>
        <video
          ref={(el) => (this.videoEl = el)}
          controls
          src={this.props.path ?? ""}
        ></video>
      </VideoElementContainer>
    );
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
