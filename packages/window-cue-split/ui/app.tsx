import React from "react";
import {
  Box,
  Button,
  Input,
  Slider,
  sliderClasses,
  SliderProps,
  styled,
  Table,
  Textarea,
  Typography,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { stringifyTimestamp, mockVttCue } from "@sculptor/helpers/vtt";
import { QueryKey } from "@sculptor/helpers/constants";
import { toFixedNumber } from "@sculptor/helpers/to-fixed-number";

export const App = () => {
  const [positionDelimiter, setPositionDelimiter] = React.useState<number>(0);
  const [timeDelimiter, setTimeDelimiter] = React.useState<number>(0);

  const { data: splitCueData } = useQuery({
    queryKey: [QueryKey.PreferenceWindowCue],
    queryFn: window.electronAPI.fetchSplitCue,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (splitCueData?.cue) {
      setPositionDelimiter(Math.round(splitCueData.cue.text.length / 2));
    } else {
      setPositionDelimiter(0);
    }

    if (typeof splitCueData?.time === "number") {
      setTimeDelimiter(
        Math.max(0, Math.min(splitCueData.time, splitCueData.cue.endTime)),
      );
    }
  }, [splitCueData]);

  const splittedCue = React.useMemo(() => {
    if (!splitCueData) {
      return [];
    }

    const text1 = splitCueData.cue.text.slice(0, positionDelimiter).trim();
    const text2 = splitCueData.cue.text.slice(positionDelimiter).trim();

    return [
      mockVttCue({
        ...splitCueData.cue,
        uuid: crypto.randomUUID(),
        text: text1,
        endTime: timeDelimiter,
      }),
      mockVttCue({
        ...splitCueData.cue,
        uuid: crypto.randomUUID(),
        text: text2,
        startTime: timeDelimiter + 0.001,
      }),
    ];
  }, [splitCueData, positionDelimiter, timeDelimiter]);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.electronAPI.splitCue(null, false);
      }

      if (!splitCueData) {
        return;
      }

      if (
        e.key === "Enter" &&
        ((window.electronAPI.IS_DARWIN && e.metaKey) ||
          (window.electronAPI.IS_LINUX && e.ctrlKey) ||
          (window.electronAPI.IS_WIN32 && e.ctrlKey))
      ) {
        window.electronAPI.submitSplitCue(splitCueData.cue.uuid, splittedCue);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [splitCueData, splittedCue]);

  const handleCloseClick = React.useCallback(() => {
    window.electronAPI.splitCue(null, false);
  }, []);

  const handleSelect = React.useCallback(
    (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
      const target = e.target as HTMLTextAreaElement;
      const selectionStart = target.selectionStart;
      setPositionDelimiter(selectionStart);
    },
    [],
  );

  const handleSubmitClick = React.useCallback(() => {
    if (!splitCueData) {
      return;
    }
    window.electronAPI.submitSplitCue(splitCueData.cue.uuid, splittedCue);
  }, [splitCueData, splittedCue]);

  const handleSliderChange = React.useCallback<
    Required<SliderProps>["onChange"]
  >((event, value) => {
    if (typeof value === "number") {
      setTimeDelimiter(value);
    }
  }, []);

  const handleInputchange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (!splitCueData) {
        return;
      }
      const valueAsNumber = event.currentTarget.valueAsNumber;
      const value = Number.isNaN(valueAsNumber)
        ? splitCueData.cue.startTime
        : valueAsNumber;
      setTimeDelimiter(value);
    },
    [splitCueData],
  );

  if (!splitCueData) {
    return null;
  }

  return (
    <Box
      sx={{
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Typography level="body-sm" sx={{ padding: "0 5px" }}>
        Place the cursor in the textfield below. The current cue will be split
        in two with this cursor as a separator.
      </Typography>
      <Textarea
        sx={{ flexGrow: 1, marginTop: "5px" }}
        value={splitCueData.cue.text}
        onSelect={handleSelect}
      />
      <Box sx={{ padding: "0 10px" }}>
        <StyledSlider
          track={false}
          step={0.001}
          min={splitCueData.cue.startTime}
          max={splitCueData.cue.endTime}
          value={timeDelimiter}
          valueLabelDisplay="auto"
          valueLabelFormat={stringifyTimestamp}
          marks={[
            {
              value: splitCueData.cue.startTime,
              label: stringifyTimestamp(splitCueData.cue.startTime),
            },
            {
              value: splitCueData.cue.endTime,
              label: stringifyTimestamp(splitCueData.cue.endTime),
            },
          ]}
          onChange={handleSliderChange}
        />
      </Box>
      <Box>
        <Input
          sx={{ marginTop: "15px" }}
          type="number"
          value={timeDelimiter}
          onChange={handleInputchange}
          slotProps={{
            input: {
              min: splitCueData.cue.startTime,
              max: splitCueData.cue.endTime,
              step: 0.001,
              sx: { textAlign: "center" },
            },
          }}
        />
      </Box>
      <Box>
        <Table sx={{ outline: "none", userSelect: "none" }} stripe="odd">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Start</th>
              <th style={{ width: 100 }}>End</th>
              <th style={{ width: 85 }}>Duration</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {splittedCue.map((cue) => {
              return (
                <tr key={cue.uuid}>
                  <td title={cue.startTime.toString()}>
                    {stringifyTimestamp(cue.startTime)}
                  </td>
                  <td title={cue.endTime.toString()}>
                    {stringifyTimestamp(cue.endTime)}
                  </td>
                  <td>{toFixedNumber(cue.endTime - cue.startTime, 3)}</td>
                  <td>{cue.text}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Box>
      <hr />
      <Button sx={{ marginTop: "5px" }} onClick={handleSubmitClick}>
        Split
      </Button>
      <Button
        sx={{ marginTop: "5px" }}
        variant="plain"
        onClick={handleCloseClick}
      >
        Close
      </Button>
    </Box>
  );
};

const StyledSlider = styled(Slider, { name: "StyledSlider" })(() => {
  return {
    // Need both of the selectors to make it works on the server-side and client-side
    [`& [style*="left:0%"], & [style*="left: 0%"]`]: {
      [`&.${sliderClasses.markLabel}`]: {
        transform: "none",
      },
      [`& .${sliderClasses.valueLabel}`]: {
        left: "calc(var(--Slider-thumbSize) / 2)",
        borderBottomLeftRadius: 0,
        "&::before": {
          left: 0,
          transform: "translateY(100%)",
          borderLeftColor: "currentColor",
        },
      },
    },
    [`& [style*="left:100%"], & [style*="left: 100%"]`]: {
      [`&.${sliderClasses.markLabel}`]: {
        transform: "translateX(-100%)",
      },
      [`& .${sliderClasses.valueLabel}`]: {
        right: "calc(var(--Slider-thumbSize) / 2)",
        borderBottomRightRadius: 0,
        "&::before": {
          left: "initial",
          right: 0,
          transform: "translateY(100%)",
          borderRightColor: "currentColor",
        },
      },
    },
  };
});
