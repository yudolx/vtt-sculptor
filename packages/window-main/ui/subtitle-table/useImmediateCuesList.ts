import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@sculptor/helpers/constants";
import type { IVTTCue } from "@sculptor/helpers/vtt";

/**
 * A wrapper for the cues list useQuery. Keeps a local copy of cues in a state
 * Adds ability to update the cues immediatly by updating the local copy of it.
 *
 * The main purpose is to remove the delay when setting the cues using setQueryData
 * or sending ipc events and then waiting for query invalidation events.
 */
export const useImmediateCuesList = () => {
  const { data, ...restQuery } = useQuery({
    queryKey: [QueryKey.CuesList],
    queryFn: window.electronAPI.fetchCues,
  });

  const [cues, setCues] = React.useState<IVTTCue[]>([]);

  React.useEffect(() => {
    setCues(data ?? []);
  }, [data]);

  return {
    ...restQuery,
    data: cues,
    setDataInternally: setCues,
  };
};
