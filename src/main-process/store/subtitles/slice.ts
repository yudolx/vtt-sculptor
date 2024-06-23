import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IPCRendererEvent } from "shared/constants";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";

export interface ISubtitlesSliceState {
  file: string | null;
  cues: IVTTCue[] | null;
  regions: Record<string, IVTTRegion> | null;
}

export const getInitialState = (): ISubtitlesSliceState => {
  return {
    file: null,
    cues: null,
    regions: null,
  };
};

export const subtitlesSlice = createSlice({
  name: "subtitles",
  initialState: getInitialState(),
  reducers: {
    setFileAndCues: (
      state,
      action: PayloadAction<{
        file: ISubtitlesSliceState["file"];
        cues: ISubtitlesSliceState["cues"];
        regions: ISubtitlesSliceState["regions"];
      }>,
    ) => {
      state.cues = action.payload.cues;
      state.regions = action.payload.regions;
      state.file = action.payload.file;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is PayloadAction<IVTTCue[]> =>
        action.type === IPCRendererEvent.CueChanged,
      (state, action) => {
        for (const cue of action.payload) {
          const existingAction = state.cues?.find(
            (stateCue) => stateCue.uuid === cue.uuid,
          );
          if (!existingAction) {
            continue;
          }
          existingAction.text = cue.text;
        }
      },
    );
  },
});
