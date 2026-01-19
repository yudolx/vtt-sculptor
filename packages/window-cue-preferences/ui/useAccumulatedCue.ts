import React from "react";
import { IVTTCue, mockVttCue } from "@sculptor/helpers/vtt";

export const useAccumulatedCue = (cuesArg: IVTTCue[]): Partial<IVTTCue> => {
  return React.useMemo(() => {
    if (cuesArg.length === 0) {
      const { uuid: __, ...mockCue } = mockVttCue({
        endTime: 0,
        startTime: 0,
        text: "",
      });
      return mockCue;
    }

    if (cuesArg.length === 1) {
      return cuesArg.at(0)!;
    }

    const accCue: Partial<IVTTCue> = {};
    const keys = (Object.keys(cuesArg.at(0)!) as (keyof IVTTCue)[]).filter(
      (key) => key !== "uuid",
    );

    keys.forEach((key) => {
      const uniqueValues = new Set(cuesArg.map((c) => c[key]));

      if (uniqueValues.size === 1) {
        // @ts-expect-error
        accCue[key] = [...uniqueValues].at(0);
      }
    });

    return accCue;
  }, [cuesArg]);
};
