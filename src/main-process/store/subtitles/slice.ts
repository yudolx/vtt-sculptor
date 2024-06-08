import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";

export interface ISubtitlesSliceState {
  file: string | null;
  cues: (IVTTCue | IVTTRegion)[] | null;
}

export const getInitialState = (): ISubtitlesSliceState => {
  return {
    file: null,
    cues: null,
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
      }>,
    ) => {
      state.cues = action.payload.cues;
      state.file = action.payload.file;
    },
  },
});
