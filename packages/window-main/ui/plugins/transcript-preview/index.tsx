import React from "react";
// import { useImmediateCuesList } from "@sculptor/window-main/ui/subtitle-table/useImmediateCuesList";
// import { Box, Button } from "@mui/joy";
// import { CameraIcon } from "@heroicons/react/24/outline";
// import {
//   AugmentedMdToken,
//   cuesToMdTokens,
// } from "@thulean-archives/shared/transcription-viewer/parseHtml";
// import { Transcription } from "@thulean-archives/shared/transcription-viewer/Transcription";
// import { VideoElContext } from "@sculptor/shared";

export const TranscriptPreview = () => {
  return <div>TranscriptPreview</div>;
  // const { videoEl } = React.useContext(VideoElContext);
  // const [canvasEl, setCanvasEl] = React.useState<HTMLCanvasElement | null>(
  //   null,
  // );

  // const [mdTokens, setMdTokens] = React.useState<AugmentedMdToken[]>([]);
  // const { data: cues = [] } = useImmediateCuesList();

  // React.useEffect(() => {
  //   cuesToMdTokens(cues).then((tokens) => setMdTokens(tokens));
  // }, [cues]);

  // const handleScreenshotClick = React.useCallback(() => {
  //   if (videoEl && canvasEl) {
  //     canvasEl.width = videoEl.videoWidth;
  //     canvasEl.height = videoEl.videoHeight;
  //     const ctx = canvasEl.getContext("2d");
  //     if (ctx) {
  //       ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
  //       canvasEl.toBlob((blob: any) => {
  //         if (blob) {
  //           blob.bytes().then((bytes: any) => {
  //             console.log(bytes);
  //           });
  //         }
  //       });
  //     }
  //   }
  // }, [videoEl, canvasEl]);

  // return (
  //   <Box sx={{ overflow: "auto" }}>
  //     <canvas ref={setCanvasEl} style={{ display: "none" }}></canvas>
  //     <Box
  //       sx={{
  //         padding: 1,
  //         backgroundColor: "#ebebeb",
  //         borderBottom: "1px #CDD7E1 solid",
  //       }}
  //     >
  //       <Button
  //         color="neutral"
  //         variant="plain"
  //         sx={{ border: "1px solid #CDD7E1" }}
  //         onClick={handleScreenshotClick}
  //         startDecorator={
  //           <span style={{ width: 24, height: 24 }}>
  //             <CameraIcon />
  //           </span>
  //         }
  //       >
  //         Screenshot
  //       </Button>
  //     </Box>
  //     <Box>
  //       <Transcription tokens={mdTokens} />
  //     </Box>
  //   </Box>
  // );
};
