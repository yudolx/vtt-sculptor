import React from "react";

export interface IVideoElContextValue {
  video: HTMLVideoElement | null;
  setVideo: (el: HTMLVideoElement | null) => void;
}

export const VideoElContext = React.createContext<IVideoElContextValue>({
  video: null,
  setVideo: () => {},
});

export const VideoElContextProvider: React.FC<React.PropsWithChildren> = (
  props,
) => {
  const [videoEl, setVideoEl] = React.useState<HTMLVideoElement | null>(null);

  const setVideo = React.useCallback((el: HTMLVideoElement | null) => {
    setVideoEl(el);
  }, []);

  return (
    <VideoElContext.Provider
      value={{
        setVideo,
        video: videoEl,
      }}
    >
      {props.children}
    </VideoElContext.Provider>
  );
};
