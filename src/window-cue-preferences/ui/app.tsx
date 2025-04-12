import React from "react";
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  styled,
  Textarea,
  Tooltip,
  TooltipProps,
} from "@mui/joy";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "shared/constants";

export const App = () => {
  const { data: cue = null } = useQuery({
    queryKey: [QueryKey.PreferenceWindowCue],
    queryFn: window.electronAPI.preferenceWindowFetchCue,
  });

  return (
    <AppWrapper>
      <Stack
        sx={{ padding: "15px" }}
        divider={<Divider sx={{ margin: "15px 0" }} />}
      >
        <FormControl>
          <FormLabel>Text</FormLabel>
          <Textarea minRows={3} size="sm" value={cue?.text} />
        </FormControl>

        <Stack direction="row" spacing={2}>
          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>Start</FormLabel>
            <Input type="number" size="sm" value={cue?.startTime} />
          </FormControl>

          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>End</FormLabel>
            <Input type="number" size="sm" value={cue?.endTime} />
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>
            <Stack direction={"row"} spacing={1}>
              <span>ID</span>
              <QuestionMarkHelper placement="right">
                ID may be used to reference this cue in JavaScript and CSS
              </QuestionMarkHelper>
            </Stack>
          </FormLabel>
          <Input size="sm" value={cue?.id} />
        </FormControl>

        <FormControl>
          <FormLabel>Region</FormLabel>
          <Select size="sm" value={cue?.region}>
            <Option value="placeholder">Region placeholder</Option>
          </Select>
        </FormControl>

        <FormControl>
          <Stack direction="row" spacing={1}>
            <Checkbox
              size="sm"
              label="Pause on exit"
              checked={cue?.pauseOnExit}
            />
            <QuestionMarkHelper placement="right">
              This checkbox indicates whether playback of the media should pause
              when the end of the range to which this cue applies is reached
            </QuestionMarkHelper>
          </Stack>
        </FormControl>

        <FormControl>
          <FormLabel>Writing direction</FormLabel>
          <Select size="sm" value={cue?.vertical}>
            <Option value="">Not specified</Option>
            <Option value="lr">Left to right</Option>
            <Option value="rl">Right to left</Option>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>
              <Stack direction={"row"} spacing={1}>
                <span>Line</span>
                <QuestionMarkHelper placement="right">
                  Represents the line positioning of the cue. This can be the
                  string auto or a number whose interpretation depends on the
                  value of{" "}
                  <Chip size="sm" variant="outlined">
                    Snap to lines
                  </Chip>
                </QuestionMarkHelper>
              </Stack>
            </FormLabel>
            <Input size="sm" value={cue?.line} />
          </FormControl>

          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>Line align</FormLabel>
            <Select size="sm" value={cue?.lineAlign}>
              <Option value="start">Start</Option>
              <Option value="center">Center</Option>
              <Option value="end">End</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel sx={{ visibility: "hidden" }}>visual fix</FormLabel>
            <Stack direction="row" spacing={1}>
              <Checkbox
                size="sm"
                label="Snap to lines"
                checked={cue?.snapToLines}
              />
              <QuestionMarkHelper placement="left">
                Check this if{" "}
                <Chip size="sm" variant="outlined">
                  Line
                </Chip>{" "}
                attribute indicates a number of lines. Uncheck if it represents
                a percentage of the video size.
              </QuestionMarkHelper>
            </Stack>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl>
            <FormLabel>
              <Stack direction={"row"} spacing={1}>
                <span>Position</span>
                <QuestionMarkHelper placement="right">
                  Represents the indentation of the cue within the line. This
                  can be the string auto, a number representing the percentage
                  of the
                  <Chip size="sm" variant="outlined">
                    Region
                  </Chip>
                  , or the video size if{" "}
                  <Chip size="sm" variant="outlined">
                    Region
                  </Chip>{" "}
                  is not set.
                </QuestionMarkHelper>
              </Stack>
            </FormLabel>
            <Input size="sm" value={cue?.position} />
          </FormControl>

          <FormControl>
            <FormLabel>
              <Stack direction={"row"} spacing={1}>
                <span>Position align</span>
                <QuestionMarkHelper>
                  Alignment of the cue. This is used to determine what the{" "}
                  <Chip size="sm" variant="outlined">
                    Position
                  </Chip>{" "}
                  is anchored to.
                </QuestionMarkHelper>
              </Stack>
            </FormLabel>
            <Select size="sm" value={cue?.positionAlign}>
              <Option value="auto">Auto</Option>
              <Option value="center">Center</Option>
              <Option value="line-left">line-left</Option>
              <Option value="line-right">line-right</Option>
            </Select>
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>
            <Stack direction="row" spacing={1}>
              <span>Size</span>
              <QuestionMarkHelper placement="right">
                Represents the size of the cue, as a percentage of the video
                size.
              </QuestionMarkHelper>
            </Stack>
          </FormLabel>
          <Input
            type="number"
            size="sm"
            slotProps={{ input: { min: 0, max: 100 } }}
            value={cue?.size}
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            <Stack direction="row" spacing={1}>
              <span>Align</span>
              <QuestionMarkHelper placement="right">
                Represents the alignment of all the lines of text within the cue
                box
              </QuestionMarkHelper>
            </Stack>
          </FormLabel>
          <Select size="sm" value={cue?.align}>
            <Option value="center">Center</Option>
            <Option value="end">End</Option>
            <Option value="left">Left</Option>
            <Option value="right">Right</Option>
            <Option value="start">Start</Option>
          </Select>
        </FormControl>
      </Stack>
    </AppWrapper>
  );
};

const AppWrapper = styled(Box, { name: "AppWrapper" })(() => {
  return {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };
});

const QuestionMarkHelper: React.FC<
  React.PropsWithChildren<Partial<Omit<TooltipProps, "children">>>
> = (props) => {
  return (
    <Tooltip
      size="sm"
      variant="soft"
      {...props}
      title={<Box sx={{ maxWidth: 300 }}>{props.children}</Box>}
    >
      <QuestionMarkCircleIcon width={16} />
    </Tooltip>
  );
};
