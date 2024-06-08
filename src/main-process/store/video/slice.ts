import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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
  reducers: {
    setPath: (
      state,
      action: PayloadAction<{ path: IVideoSliceState["path"] }>,
    ) => {
      state.path = action.payload.path;
    },
  },
});
