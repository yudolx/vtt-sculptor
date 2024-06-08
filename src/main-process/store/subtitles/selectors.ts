import { IApplicationState } from "..";

export const selectProject = (state: IApplicationState) => {
  return {
    cues: state.subtitles.cues,
    file: state.subtitles.file,
  };
};
