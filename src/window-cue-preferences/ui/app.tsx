import React from "react";
import joi, { ValidationError } from "joi";
import {
  Alert,
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
import { IVTTCue, mockVttCue } from "shared/libs/vtt/vttcue";

export const App = () => {
  const { data: cue = null } = useQuery({
    queryKey: [QueryKey.PreferenceWindowCue],
    queryFn: window.electronAPI.preferenceWindowFetchCue,
  });

  const [stateCue, setStateCue] = React.useState<IVTTCue>(
    mockVttCue({
      endTime: 0,
      startTime: 0,
      text: "",
    }),
  );
  const [validationError, setValidationError] =
    React.useState<ValidationError | null>(null);

  React.useEffect(() => {
    if (cue) {
      setStateCue(cue);
    } else {
      setStateCue(
        mockVttCue({
          endTime: 0,
          startTime: 0,
          text: "",
        }),
      );
    }
  }, [cue]);

  React.useEffect(() => {
    const { error, value } = vttCueValidationSchema.validate(stateCue);
    if (!error) {
      setValidationError(null);
      window.electronAPI.prefenceWindowPatchCue(value);
    } else {
      setValidationError(error);
      console.log(error);
    }
  }, [stateCue]);

  return (
    <AppWrapper>
      <Stack
        sx={{ padding: "15px" }}
        divider={<Divider sx={{ margin: "15px 0" }} />}
      >
        <FormControl>
          <FormLabel>Text</FormLabel>
          <Textarea
            minRows={3}
            size="sm"
            value={stateCue.text}
            onChange={(e) =>
              setStateCue({
                ...stateCue,
                text: e.currentTarget.value,
              })
            }
          />
        </FormControl>

        <Stack direction="row" spacing={2}>
          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>Start</FormLabel>
            <Input
              type="number"
              size="sm"
              value={stateCue.startTime}
              onChange={(e) => {
                setStateCue({
                  ...stateCue,
                  startTime: e.currentTarget.valueAsNumber,
                });
              }}
            />
          </FormControl>

          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>End</FormLabel>
            <Input
              type="number"
              size="sm"
              value={stateCue.endTime}
              onChange={(e) => {
                setStateCue({
                  ...stateCue,
                  endTime: e.currentTarget.valueAsNumber,
                });
              }}
            />
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
          <Input
            size="sm"
            value={stateCue.id}
            onChange={(e) => {
              setStateCue({
                ...stateCue,
                id: e.currentTarget.value,
              });
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Region</FormLabel>
          <Select
            size="sm"
            value={stateCue.region}
            onChange={(event, value) => {
              setStateCue({
                ...stateCue,
                region: value ?? "",
              });
            }}
          >
            <Option value="placeholder">Region placeholder</Option>
          </Select>
        </FormControl>

        <FormControl>
          <Stack direction="row" spacing={1}>
            <Checkbox
              size="sm"
              label="Pause on exit"
              checked={stateCue.pauseOnExit}
              onChange={(e) => {
                setStateCue({
                  ...stateCue,
                  pauseOnExit: e.currentTarget.checked,
                });
              }}
            />
            <QuestionMarkHelper placement="right">
              This checkbox indicates whether playback of the media should pause
              when the end of the range to which this cue applies is reached
            </QuestionMarkHelper>
          </Stack>
        </FormControl>

        <FormControl>
          <FormLabel>Writing direction</FormLabel>
          <Select
            size="sm"
            value={stateCue.vertical}
            onChange={(event, value) => {
              setStateCue({
                ...stateCue,
                vertical: value ?? "",
              });
            }}
          >
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
            <Input
              size="sm"
              value={stateCue.line}
              onChange={(e) => {
                setStateCue({
                  ...stateCue,
                  line: e.currentTarget.value as LineAndPositionSetting,
                });
              }}
            />
          </FormControl>

          <FormControl sx={{ flexGrow: 1 }}>
            <FormLabel>Line align</FormLabel>
            <Select
              size="sm"
              value={stateCue.lineAlign}
              onChange={(event, value) => {
                setStateCue({
                  ...stateCue,
                  lineAlign: value ?? "start",
                });
              }}
            >
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
                checked={stateCue.snapToLines}
                onChange={(event) => {
                  setStateCue({
                    ...stateCue,
                    snapToLines: event.currentTarget.checked,
                  });
                }}
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
            <Input
              size="sm"
              value={stateCue.position}
              onChange={(event) => {
                setStateCue({
                  ...stateCue,
                  position: event.currentTarget.value as LineAndPositionSetting,
                });
              }}
            />
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
            <Select
              size="sm"
              value={stateCue.positionAlign}
              onChange={(event, value) => {
                setStateCue({
                  ...stateCue,
                  positionAlign: value ?? "auto",
                });
              }}
            >
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
            value={stateCue.size}
            onChange={(event) => {
              setStateCue({
                ...stateCue,
                size: event.currentTarget.valueAsNumber,
              });
            }}
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
          <Select
            size="sm"
            value={stateCue.align}
            onChange={(event, value) => {
              setStateCue({
                ...stateCue,
                align: value ?? "center",
              });
            }}
          >
            <Option value="center">Center</Option>
            <Option value="end">End</Option>
            <Option value="left">Left</Option>
            <Option value="right">Right</Option>
            <Option value="start">Start</Option>
          </Select>
        </FormControl>
      </Stack>
      {validationError ? (
        <Alert
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            zIndex: 1,
          }}
          variant="solid"
          color="danger"
        >
          {validationError.message}
        </Alert>
      ) : null}
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

export const vttCueValidationSchema = joi.object({
  uuid: joi.string().uuid(),
  id: joi.string().allow("").label("Id"),
  pauseOnExit: joi.boolean().label("Pause on exit"),
  startTime: joi.number().min(0).label("Start time"),
  endTime: joi.number().min(0).label("End time"),
  text: joi.string().allow("").label("Text"),
  region: joi.string().allow(null).label("Region"),
  vertical: joi.string().valid("", "lr", "rl").label("Writing direction"),
  snapToLines: joi.boolean().label("Snap to lines"),
  line: joi
    .alternatives(
      joi.string().valid("auto"),
      joi
        .number()
        .when("snapToLines", { is: false, then: joi.number().min(0).max(100) }),
    )
    .label("Line"),
  lineAlign: joi.string().valid("center", "end", "start").label("Line align"),
  position: joi
    .alternatives(joi.string().valid("auto"), joi.number())
    .label("Position"),
  positionAlign: joi
    .string()
    .valid("auto", "center", "line-left", "line-right")
    .label("Position align"),
  size: joi.number().max(100).min(0).label("Size"),
  align: joi
    .string()
    .valid("center", "end", "left", "right", "start")
    .label("Align"),
});
