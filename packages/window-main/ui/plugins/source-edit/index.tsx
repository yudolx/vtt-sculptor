import React from "react";
import { Textarea } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@sculptor/helpers/constants";
import { stringifyVTT } from "@sculptor/helpers/vtt";

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
