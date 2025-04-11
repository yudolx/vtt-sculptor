import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  styled,
  Textarea,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "shared/constants";

export const App = () => {
  const { data: cue = null } = useQuery({
    queryKey: [QueryKey.PreferenceWindowCue],
    queryFn: window.electronAPI.preferenceWindowFetchCue,
  });

  return (
    <AppWrapper>
      <FormControl>
        <FormLabel>Text</FormLabel>
        <Textarea minRows={3} size="sm" value={cue?.text} />
      </FormControl>

      <FormControl>
        <FormLabel>Start</FormLabel>
        <Input type="number" size="sm" value={cue?.startTime} />
      </FormControl>

      <FormControl>
        <FormLabel>End</FormLabel>
        <Input type="number" size="sm" value={cue?.endTime} />
      </FormControl>

      <FormControl>
        <FormLabel>ID</FormLabel>
        <Input type="number" size="sm" value={cue?.id} />
      </FormControl>

      <FormControl>
        <FormLabel>Pause on exit</FormLabel>
        <Checkbox checked={cue?.pauseOnExit} />
      </FormControl>

      <FormControl>
        <FormLabel>Region</FormLabel>
        <Select value={cue?.region}>
          <Option value="placeholder">Select placeholder</Option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Vertical</FormLabel>
        <Select value={cue?.vertical}>
          <Option value="">Empty</Option>
          <Option value="lr">LR</Option>
          <Option value="rl">RL</Option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Snap to lines</FormLabel>
        <Checkbox checked={cue?.snapToLines} />
      </FormControl>

      <FormControl>
        <FormLabel>Line</FormLabel>
        <Input value={cue?.line} />
      </FormControl>

      <FormControl>
        <FormLabel>Line align</FormLabel>
        <Select value={cue?.lineAlign}>
          <Option value="">Empty</Option>
          <Option value="center">Center</Option>
          <Option value="end">End</Option>
          <Option value="start">Start</Option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Position</FormLabel>
        <Input value={cue?.position} />
      </FormControl>

      <FormControl>
        <FormLabel>Positiona align</FormLabel>
        <Select value={cue?.positionAlign}>
          <Option value="">Empty</Option>
          <Option value="auto">Auto</Option>
          <Option value="center">Center</Option>
          <Option value="line-left">line-left</Option>
          <Option value="line-right">line-right</Option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Size</FormLabel>
        <Input type="number" size="sm" value={cue?.size} />
      </FormControl>

      <FormControl>
        <FormLabel>Align</FormLabel>
        <Select value={cue?.align}>
          <Option value="">Empty</Option>
          <Option value="center">Center</Option>
          <Option value="end">End</Option>
          <Option value="left">Left</Option>
          <Option value="right">Right</Option>
          <Option value="start">Start</Option>
        </Select>
      </FormControl>
    </AppWrapper>
  );
};

const AppWrapper = styled(Box, { name: "AppWrapper" })(() => {
  return {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: 10,
  };
});
