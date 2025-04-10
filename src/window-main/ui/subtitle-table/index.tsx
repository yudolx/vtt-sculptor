import React from "react";
import { Table } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import MouseTrap from "shared/libs/mousetrap/index";
import { ISubtitleTableRowProps, SubtitleTableRow } from "./row";
import { assert } from "shared/assert";
import { VideoElContext } from "../context/video-el";
import { DEFAULT_CUE_ADJUST_TIME, QueryKey } from "shared/constants";
import { useWatchPlaceholderCues } from "./useWatchPlaceholderCues";
import { isNotPlaceholderCue } from "main-process/store/subtitles/placeholderCue";

export const SubtitleTable = () => {
  const [editField, setEditField] = React.useState<keyof IVTTCue | null>(null);

  const { videoEl } = React.useContext(VideoElContext);

  const { data: cues = [] } = useQuery({
    queryKey: [QueryKey.CuesList],
    queryFn: window.electronAPI.fetchCues,
  });

  const { data: activeCueUuid = null } = useQuery({
    queryKey: [QueryKey.ActiveCue],
    queryFn: window.electronAPI.fetchActiveCue,
  });

  useWatchPlaceholderCues(videoEl, cues);

  const activeCue = React.useMemo(() => {
    console.log(cues, activeCueUuid);
    return (
      cues.filter(isNotPlaceholderCue).find((c) => c.uuid === activeCueUuid) ??
      null
    );
  }, [activeCueUuid, cues]);

  const activeCueIndex = React.useMemo(() => {
    return activeCue ? cues.filter(isNotPlaceholderCue).indexOf(activeCue) : -1;
  }, [activeCue, cues]);

  const nextCue = React.useMemo(() => {
    return cues.filter(isNotPlaceholderCue).at(activeCueIndex + 1) ?? null;
  }, [activeCueIndex, cues]);

  const prevCue = React.useMemo(() => {
    return (
      cues.filter(isNotPlaceholderCue).at(Math.max(activeCueIndex - 1, 0)) ??
      null
    );
  }, [activeCueIndex, cues]);

  React.useEffect(() => {
    const handleSpace = () => {
      if (videoEl) {
        if (videoEl.paused) {
          videoEl.play();
        } else {
          videoEl.pause();
        }
      }
    };

    const handleUp = () => {
      if (prevCue) {
        window.electronAPI.setActiveCue(prevCue.uuid);
      }
    };
    const handleDown = () => {
      if (nextCue) {
        window.electronAPI.setActiveCue(nextCue.uuid);
      }
    };
    const handleDelete = () => {
      const nextActiveCue = nextCue ?? prevCue ?? null;
      if (nextActiveCue) {
        window.electronAPI.setActiveCue(nextActiveCue.uuid);
      }
      if (activeCue) {
        window.electronAPI.deleteCues([activeCue.uuid]);
      }
    };

    const handleEnter = () => {
      if (activeCue) {
        window.electronAPI.disableHotkeys();
        setEditField("text");
      }
    };

    const handleEsc = () => {
      if (activeCue && editField) {
        window.electronAPI.enableHotkeys();
        setEditField(null);
      }
    };

    const handleQ = () => {
      if (activeCue) {
        let newStartTime = activeCue.startTime - DEFAULT_CUE_ADJUST_TIME;
        newStartTime = Math.max(newStartTime, 0);
        window.electronAPI.patchCues([
          { ...activeCue, startTime: newStartTime },
        ]);
      }
    };

    const handleW = () => {
      if (activeCue) {
        let newStartTime = activeCue.startTime + DEFAULT_CUE_ADJUST_TIME;
        newStartTime = Math.min(newStartTime, activeCue.endTime);
        window.electronAPI.patchCues([
          { ...activeCue, startTime: newStartTime },
        ]);
      }
    };

    const handleE = () => {
      if (activeCue) {
        let newEndTime = activeCue.endTime - DEFAULT_CUE_ADJUST_TIME;
        newEndTime = Math.max(newEndTime, activeCue.startTime);
        window.electronAPI.patchCues([{ ...activeCue, endTime: newEndTime }]);
      }
    };

    const handleR = () => {
      if (activeCue && videoEl) {
        let newEndTime = activeCue.endTime + DEFAULT_CUE_ADJUST_TIME;
        newEndTime = Math.min(newEndTime, videoEl.duration);
        window.electronAPI.patchCues([{ ...activeCue, endTime: newEndTime }]);
      }
    };

    const handleK = () => {
      if (activeCue && videoEl) {
        window.electronAPI.patchCues([
          { ...activeCue, endTime: videoEl.currentTime },
        ]);
      }
    };

    const handleO = () => {
      const START_BUFFER = 0.5;
      if (activeCue && videoEl) {
        videoEl.currentTime = Math.max(activeCue.startTime - START_BUFFER, 0);
      }
    };

    MouseTrap.bind("enter", handleEnter);
    MouseTrap.bind("esc", handleEsc);
    MouseTrap.bind("space", handleSpace);
    MouseTrap.bind("up", handleUp);
    MouseTrap.bind("down", handleDown);
    MouseTrap.bind("del", handleDelete);
    MouseTrap.bind("q", handleQ);
    MouseTrap.bind("w", handleW);
    MouseTrap.bind("e", handleE);
    MouseTrap.bind("r", handleR);
    MouseTrap.bind("k", handleK);
    MouseTrap.bind("o", handleO);

    return () => {
      MouseTrap.unbind("enter");
      MouseTrap.unbind("esc");
      MouseTrap.unbind("space");
      MouseTrap.unbind("up");
      MouseTrap.unbind("down");
      MouseTrap.unbind("del");
      MouseTrap.unbind("q");
      MouseTrap.unbind("w");
      MouseTrap.unbind("e");
      MouseTrap.unbind("r");
      MouseTrap.unbind("k");
      MouseTrap.unbind("o");
    };
  }, [prevCue, activeCue, nextCue, videoEl, editField]);

  const handleSubtitleTableRowClick = React.useCallback(
    (cue: IVTTCue) => {
      if (activeCueUuid !== cue.uuid) {
        window.electronAPI.setActiveCue(cue.uuid);
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

      window.electronAPI.patchCues([newCue]);
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

  return (
    <Table hoverRow stickyHeader tabIndex={1} stripe="odd">
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
