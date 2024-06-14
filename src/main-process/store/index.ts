import { configureStore } from "@reduxjs/toolkit";
import { videoSlice } from "./video/slice";
import { subtitlesSlice } from "./subtitles/slice";
import { backgroundProcessStarted } from "shared/actions";
import { rootSaga } from "./saga";
import { middlewares, sagaMiddleware } from "./middleware";

export const store = configureStore({
  reducer: {
    video: videoSlice.reducer,
    subtitles: subtitlesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [backgroundProcessStarted.type],
      },
    }).concat(middlewares),
});

// @ts-expect-error
sagaMiddleware.run(rootSaga);

export type IApplicationState = ReturnType<typeof store.getState>;
