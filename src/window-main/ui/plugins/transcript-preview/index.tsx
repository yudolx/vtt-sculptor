import React from "react";
import { useImmediateCuesList } from "window-main/ui/subtitle-table/useImmediateCuesList";
import { AugmentedMdToken, cuesToMdTokens } from "./cuesToJsx/parseHtml";
import { Transcription } from "./cuesToJsx/Transcription";
import { Box } from "@mui/joy";

export const TranscriptPreview = () => {
  const [mdTokens, setMdTokens] = React.useState<AugmentedMdToken[]>([]);
  const { data: cues = [], setDataInternally } = useImmediateCuesList();

  React.useEffect(() => {
    cuesToMdTokens(cues).then((tokens) => setMdTokens(tokens));
  }, [cues]);

  return (
    <Box sx={{ overflow: "auto" }}>
      <Transcription tokens={mdTokens} />
    </Box>
  );
};
