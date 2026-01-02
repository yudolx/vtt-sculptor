import { Textarea } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { QueryKey } from "shared/constants";
import { stringifyVTT } from "@thulean-archives/shared/vtt/WebVTTDeserializer";

export const SourceEdit = () => {
  const cuesQuery = useQuery({
    queryKey: [QueryKey.CuesList],
    queryFn: window.electronAPI.fetchCues,
  });
  const regionsQuery = useQuery({
    queryKey: [QueryKey.RegionsList],
    queryFn: window.electronAPI.fetchRegions,
  });
  const stylesQuery = useQuery({
    queryKey: [QueryKey.Styles],
    queryFn: window.electronAPI.fetchStyles,
  });

  const textvalue = stringifyVTT(
    cuesQuery.data ?? [],
    regionsQuery.data ?? {},
    stylesQuery.data ?? [],
  );

  const handleTextAreaChange = React.useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >((event) => {
    console.log(event.currentTarget.value);
  }, []);

  return <Textarea value={textvalue} onChange={handleTextAreaChange} />;
};
