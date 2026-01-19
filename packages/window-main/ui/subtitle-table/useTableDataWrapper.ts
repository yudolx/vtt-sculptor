import React from "react";
import { useImmediateCuesList } from "./useImmediateCuesList";
import { useQuery } from "@tanstack/react-query";
import type { IVTTCue } from "@sculptor/helpers/vtt";
import { QueryKey } from "@sculptor/helpers/constants";
import { VTTCueUuid } from "../video/vtt-cue-uuid";

export const useTableDataWrapper = (videoEl: HTMLVideoElement | null) => {
  const { data: cues = [], setDataInternally } = useImmediateCuesList();

  const { data: activeCueUuid = [] } = useQuery({
    queryKey: [QueryKey.ActiveCue],
    queryFn: window.electronAPI.fetchActiveCuesUuid,
  });

  const cueItemsUuid = React.useMemo(() => {
    return cues.map((cue) => cue.uuid);
  }, [cues]);

  const activeCues = React.useMemo(() => {
    return cues.filter((c) => activeCueUuid.includes(c.uuid)) ?? null;
  }, [activeCueUuid, cues]);

  const cuesIsNew = React.useMemo<Record<IVTTCue["uuid"], boolean>>(() => {
    const isNew: Record<IVTTCue["uuid"], boolean> = {};
    const trackCues = [...(videoEl?.textTracks[0]?.cues ?? [])]
      .filter(VTTCueUuid.is)
      .map((cue) => cue.uuid);

    cues.forEach((c) => {
      if (trackCues.length > 0) {
        isNew[c.uuid] = !trackCues.includes(c.uuid);
      } else {
        // isNew[c.uuid] = false;
      }
    });

    return isNew;
  }, [videoEl?.textTracks, cues]);

  return React.useMemo(() => {
    return {
      cues,
      cueItemsUuid,
      activeCues,
      activeCueUuid,
      cuesIsNew,
      setDataInternally,
    };
  }, [
    cues,
    cueItemsUuid,
    activeCues,
    activeCueUuid,
    cuesIsNew,
    setDataInternally,
  ]);
};
