import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  styled,
} from "@mui/joy";
import { SourceEdit } from "./source-edit";
import { TranscriptPreview } from "./transcript-preview";

export const Plugins = () => {
  return (
    <AccordionGroup size="lg" sx={{ overflow: "auto", maxHeight: "100%" }}>
      <Accordion>
        <StyledAccordionSummary>Source edit</StyledAccordionSummary>
        <AccordionDetails>
          <SourceEdit />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <StyledAccordionSummary>Transcript preview</StyledAccordionSummary>
        <AccordionDetails>
          <TranscriptPreview />
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
};

const StyledAccordionSummary = styled(AccordionSummary)(() => {
  return {
    backgroundColor: "#F0F4F8",
  };
});
