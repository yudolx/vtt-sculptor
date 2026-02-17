import { IVTTCue } from "./vtt";
import { safeHasOwnProperty } from "./safe-has-own-property";

export const mutableMergeVttCues = (cueA: IVTTCue, cueB: Partial<IVTTCue>) => {
  let changed = false;
  const keys: (keyof IVTTCue)[] = [
    "id",
    "align",
    "line",
    // TODO: NOT SUPPORTED BY CHROME
    "lineAlign",
    "position",
    // TODO: NOT SUPPORTED BY CHROME
    "positionAlign",
    "size",
    "snapToLines",
    "vertical",
    "text",
    "endTime",
    "startTime",
  ] as const;

  for (const key of keys) {
    if (safeHasOwnProperty(cueB, key) && cueA[key] !== cueB[key]) {
      // @ts-expect-error
      cueA[key] = cueB[key];
      changed = true;
    }
  }

  if (changed) {
    return cueA;
  } else {
    return null;
  }
};

export const immutableMergeVttCues = (cueA: IVTTCue, cueB: IVTTCue) => {
  return mutableMergeVttCues({ ...cueA }, cueB);
};
