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
        <StyledAccordionDetails>
          <SourceEdit />
        </StyledAccordionDetails>
      </Accordion>
      <Accordion>
        <StyledAccordionSummary>
          Thulean transcription preview
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <TranscriptPreview />
        </StyledAccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
};

const StyledAccordionSummary = styled(AccordionSummary)(() => {
  return {
    backgroundColor: "#F0F4F8",
  };
});

const StyledAccordionDetails = styled(AccordionDetails)(() => {
  return {
    "& > .MuiAccordionDetails-content": {
      padding: 0,
    },
  };
});
