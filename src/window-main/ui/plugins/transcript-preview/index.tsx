import React from "react";
import { useImmediateCuesList } from "window-main/ui/subtitle-table/useImmediateCuesList";
import {
  AugmentedMdToken,
  cuesToMdTokens,
} from "@thulean-archives/shared/transcription-viewer/parseHtml";
import { Transcription } from "@thulean-archives/shared/transcription-viewer/Transcription";
import { Box } from "@mui/joy";

export const TranscriptPreview = () => {
  const [mdTokens, setMdTokens] = React.useState<AugmentedMdToken[]>([]);
  const { data: cues = [] } = useImmediateCuesList();

  React.useEffect(() => {
    cuesToMdTokens(cues).then((tokens) => setMdTokens(tokens));
  }, [cues]);

  return (
    <Box sx={{ overflow: "auto" }}>
      <Transcription tokens={mdTokens} />
    </Box>
  );
};
