import { createSlice } from "@reduxjs/toolkit";
import { appMenuFileNew, appMenuFileOpen } from "shared/actions";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";

export interface ISubtitlesSliceState {
  openedFilePath: string | null;
  cues: (IVTTCue | IVTTRegion)[] | null;
}

export const getInitialState = (): ISubtitlesSliceState => {
  return {
    openedFilePath: null,
    cues: null,
  };
};

export const subtitlesSlice = createSlice({
  name: "subtitles",
  initialState: getInitialState(),
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(appMenuFileNew, (state) => {
        state.cues = [];
        state.openedFilePath = null;
      })
      .addCase(appMenuFileOpen, (state, action) => {
        state.cues = action.payload.cues;
        state.openedFilePath = action.payload.file;
      });
  },
});
