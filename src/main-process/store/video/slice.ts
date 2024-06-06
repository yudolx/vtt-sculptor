import { createSlice } from "@reduxjs/toolkit";
import { setVideoPath } from "shared/actions";

export interface IVideoSliceState {
  path: string | null;
}

export const getInitialState = (): IVideoSliceState => {
  return {
    path: null,
  };
};

export const videoSlice = createSlice({
  name: "video",
  initialState: getInitialState(),
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setVideoPath, (state, action) => {
      state.path = action.payload;
    });
  },
});
