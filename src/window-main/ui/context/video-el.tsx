import React from "react";

export interface IVideoElContextValue {
  videoEl: HTMLVideoElement | null;
  setVideoEl: (el: HTMLVideoElement | null) => void;
}

export const VideoElContext = React.createContext<IVideoElContextValue>({
  videoEl: null,
  setVideoEl: () => {},
});

export const VideoElContextProvider: React.FC<React.PropsWithChildren> = (
  props,
) => {
  const [videoEl, setVideoEl] = React.useState<HTMLVideoElement | null>(null);

  return (
    <VideoElContext.Provider
      value={{
        setVideoEl,
        videoEl,
      }}
    >
      {props.children}
    </VideoElContext.Provider>
  );
};
