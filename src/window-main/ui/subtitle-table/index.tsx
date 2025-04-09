import React from "react";
import { Table, TableProps } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { ISubtitleTableRowProps, SubtitleTableRow } from "./row";
import { assert } from "shared/assert";
import { toFixedNumber } from "shared/to-fixed-number";
import { VideoElContext } from "../context/video-el";
import { DEFAULT_CUE_ADJUST_TIME, QueryKey } from "shared/constants";
import { useWatchPlaceholderCues } from "./useWatchPlaceholderCues";
import {
  isNotPlaceholderCue,
  isPlaceholderCue,
} from "main-process/store/subtitles/placeholderCue";

export const SubtitleTable = () => {
  const [activeCueUuid, setActiveCueUuid] = React.useState<
    IVTTCue["uuid"] | null
  >(null);
  const [editField, setEditField] = React.useState<keyof IVTTCue | null>(null);

  const { videoEl } = React.useContext(VideoElContext);

  const { data: cues = [] } = useQuery({
    queryKey: [QueryKey.CuesList],
    queryFn: window.electronAPI.fetchCues,
  });

  useWatchPlaceholderCues(videoEl, cues);

  const activeCue = React.useMemo(() => {
    return (
      cues.filter(isNotPlaceholderCue).find((c) => c.uuid === activeCueUuid) ??
      null
    );
  }, [activeCueUuid, cues]);

  const activeCueIndex = React.useMemo(() => {
    return activeCueUuid
      ? (cues.findIndex((c) => c.uuid === activeCueUuid) ?? -1)
      : -1;
  }, [activeCueUuid, cues]);

  const nextCue = React.useMemo(() => {
    if (!cues) {
      return null;
    }
    const maxCueIndex = cues.length - 1;
    const nextCueIndex = Math.min(maxCueIndex, activeCueIndex + 1);
    return cues[nextCueIndex];
  }, [activeCueIndex, cues]);

  const prevCue = React.useMemo(() => {
    const prevActiveCue = Math.max(0, activeCueIndex - 1);
    return cues[prevActiveCue] ?? null;
  }, [activeCueIndex, cues]);

  const handleSubtitleTableRowClick = React.useCallback(
    (cue: IVTTCue) => {
      if (activeCueUuid !== cue.uuid) {
        setActiveCueUuid(cue.uuid);
      }
    },
    [activeCueUuid],
  );

  const handleCellChange = React.useCallback<
    ISubtitleTableRowProps["onCellChange"]
  >(
    (field, value) => {
      assert(activeCue, "No cue found");

      const newCue: IVTTCue = {
        ...activeCue,
        [field]: value,
      };

      window.electronAPI.cueChanged([newCue]);
    },
    [activeCue],
  );

  const handleDoubleCellClick = React.useCallback<
    ISubtitleTableRowProps["onDoubleCellClick"]
  >((field) => {
    setEditField(field);
  }, []);

  const handleCellBlur = React.useCallback<
    ISubtitleTableRowProps["onCellBlur"]
  >(() => {
    setEditField(null);
    window.electronAPI.enableHotkeys();
  }, []);

  const handleCellFocus = React.useCallback<
    ISubtitleTableRowProps["onCellFocus"]
  >(() => {
    window.electronAPI.disableHotkeys();
  }, []);

  const handleSubtitleTableRowKeyDown = React.useCallback<
    Required<TableProps>["onKeyDown"]
  >(
    (event) => {
      const cue = activeCue;
      if (event.key === "Enter") {
        if (activeCueUuid) {
          setEditField("text");
        }
      } else if (event.key === "ArrowDown" && nextCue) {
        setActiveCueUuid(nextCue.uuid);
      } else if (event.key === "ArrowUp" && prevCue) {
        setActiveCueUuid(prevCue.uuid);
      } else if (event.key.toLocaleLowerCase() === "delete") {
        const activeCue = nextCue ?? prevCue ?? null;
        setActiveCueUuid(activeCue.uuid);
        if (cue) {
          window.electronAPI.deleteCues([cue.uuid]);
        }
      } else if (event.key.toLowerCase() === "q") {
        assert(videoEl, "No video");
        assert(cue, "Cue not found");

        const newStartTime =
          cue.startTime - DEFAULT_CUE_ADJUST_TIME < 0
            ? 0
            : toFixedNumber(cue.startTime - DEFAULT_CUE_ADJUST_TIME, 3);

        window.electronAPI.cueChanged([{ ...cue, startTime: newStartTime }]);
      } else if (event.key.toLowerCase() === "w") {
        assert(videoEl, "No video");
        assert(cue, "Cue not found");

        const newStartTime =
          cue.startTime + DEFAULT_CUE_ADJUST_TIME >= cue.endTime
            ? cue.endTime
            : toFixedNumber(cue.startTime + DEFAULT_CUE_ADJUST_TIME, 3);

        window.electronAPI.cueChanged([{ ...cue, startTime: newStartTime }]);
      } else if (event.key.toLowerCase() === "e") {
        assert(videoEl, "No video");
        assert(cue, "Cue not found");

        const newEndTime =
          cue.endTime - DEFAULT_CUE_ADJUST_TIME <= cue.startTime
            ? cue.startTime
            : toFixedNumber(cue.endTime - DEFAULT_CUE_ADJUST_TIME, 3);

        window.electronAPI.cueChanged([{ ...cue, endTime: newEndTime }]);
      } else if (event.key.toLowerCase() === "r") {
        assert(videoEl, "No video");
        assert(cue, "Cue not found");

        const newEndTime =
          cue.endTime + DEFAULT_CUE_ADJUST_TIME >= videoEl.duration
            ? videoEl.duration
            : toFixedNumber(cue.endTime + DEFAULT_CUE_ADJUST_TIME, 3);

        window.electronAPI.cueChanged([{ ...cue, endTime: newEndTime }]);
      }
    },
    [activeCue, activeCueUuid, nextCue, prevCue, videoEl],
  );

  return (
    <Table
      hoverRow
      stickyHeader
      tabIndex={1}
      stripe="odd"
      onKeyDown={handleSubtitleTableRowKeyDown}
    >
      <thead>
        <tr>
          <th style={{ width: 85 }}>Start</th>
          <th style={{ width: 85 }}>End</th>
          <th style={{ width: 85 }}>Duration</th>
          <th>Text</th>
        </tr>
      </thead>
      <tbody>
        {cues.filter(isNotPlaceholderCue).map((cue) => {
          return (
            <SubtitleTableRow
              editField={editField}
              key={cue.uuid}
              cue={cue}
              active={activeCueUuid === cue.uuid}
              onClick={handleSubtitleTableRowClick}
              onCellChange={handleCellChange}
              onDoubleCellClick={handleDoubleCellClick}
              onCellBlur={handleCellBlur}
              onCellFocus={handleCellFocus}
            />
          );
        })}
      </tbody>
    </Table>
  );
};
