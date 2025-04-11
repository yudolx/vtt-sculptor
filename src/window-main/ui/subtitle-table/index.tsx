import React from "react";
import { Table } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import MouseTrap from "shared/libs/mousetrap/index";
import { ISubtitleTableRowProps, SubtitleTableRow } from "./row";
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

  const { data: activeCueUuid = [] } = useQuery({
    queryKey: [QueryKey.ActiveCue],
    queryFn: window.electronAPI.fetchActiveCue,
  });

  useWatchPlaceholderCues(videoEl, cues);

  const activeCues = React.useMemo(() => {
    return (
      cues
        .filter(isNotPlaceholderCue)
        .filter((c) => activeCueUuid.includes(c.uuid)) ?? null
    );
  }, [activeCueUuid, cues]);

  /**
   * all cues = [1,2,3,4,5,6]
   * selected = [2,4]
   * if we want to select the next cue then we should take one from the end of the cues list.
   * so in this case the next available cue is 5
   */
  const nextCue = React.useMemo(() => {
    const nonPlaceholderCues = cues.filter(isNotPlaceholderCue);
    const lastCueUuid = activeCueUuid.at(activeCueUuid.length - 1);
    const nextCueIndex = nonPlaceholderCues.findLastIndex(
      (value, index, array) => array.at(index - 1)?.uuid === lastCueUuid,
    );
    return nextCueIndex >= 0 ? nonPlaceholderCues.at(nextCueIndex)! : null;
  }, [activeCueUuid, cues]);

  /**
   * this one follows the same logic as nextCue but it will take previous cue from the start of all cues array
   * the previous available cue would be 1
   */
  const prevCue = React.useMemo(() => {
    const nonPlaceholderCues = cues.filter(isNotPlaceholderCue);
    const firstCueUuid = activeCueUuid.at(0);
    const prevCueIndex = nonPlaceholderCues.findIndex(
      (value, index, array) => array.at(index + 1)?.uuid === firstCueUuid,
    );
    return prevCueIndex >= 0 ? nonPlaceholderCues.at(prevCueIndex)! : null;
  }, [activeCueUuid, cues]);

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
        window.electronAPI.toggleActiveCue(nextActiveCue.uuid);
      }
      if (activeCues.length) {
        window.electronAPI.deleteCues(activeCues.map((cue) => cue.uuid));
      }
    };

    const handleEnter = () => {
      if (activeCues.length === 1) {
        window.electronAPI.disableHotkeys();
        setEditField("text");
      }
    };

    const handleEsc = () => {
      if (activeCues.length && editField) {
        window.electronAPI.enableHotkeys();
        setEditField(null);
      }
    };

    const handleQ = () => {
      if (activeCues.length) {
        window.electronAPI.patchCues(
          activeCues.map((cue) => {
            let newStartTime = cue.startTime - DEFAULT_CUE_ADJUST_TIME;
            newStartTime = Math.max(newStartTime, 0);
            return { ...cue, startTime: newStartTime };
          }),
        );
      }
    };

    const handleW = () => {
      if (activeCues.length) {
        window.electronAPI.patchCues(
          activeCues.map((cue) => {
            let newStartTime = cue.startTime + DEFAULT_CUE_ADJUST_TIME;
            newStartTime = Math.min(newStartTime, cue.endTime);
            return { ...cue, startTime: newStartTime };
          }),
        );
      }
    };

    const handleE = () => {
      if (activeCues.length) {
        window.electronAPI.patchCues(
          activeCues.map((cue) => {
            let newEndTime = cue.endTime - DEFAULT_CUE_ADJUST_TIME;
            newEndTime = Math.max(newEndTime, cue.startTime);
            return { ...cue, endTime: newEndTime };
          }),
        );
      }
    };

    const handleR = () => {
      if (activeCues.length && videoEl) {
        window.electronAPI.patchCues(
          activeCues.map((cue) => {
            let newEndTime = cue.endTime + DEFAULT_CUE_ADJUST_TIME;
            newEndTime = Math.min(newEndTime, videoEl.duration);
            return { ...cue, endTime: newEndTime };
          }),
        );
      }
    };

    const handleK = () => {
      if (activeCues && videoEl) {
        window.electronAPI.patchCues(
          activeCues.map((cue) => {
            return { ...cue, endTime: videoEl.currentTime };
          }),
        );
      }
    };

    const handleO = () => {
      const START_BUFFER = 0.5;
      if (activeCues.length === 1 && videoEl) {
        const activeCue = activeCues.at(0)!;
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
  }, [prevCue, activeCues, nextCue, videoEl, editField]);

  const handleSubtitleTableRowClick = React.useCallback((cue: IVTTCue) => {
    window.electronAPI.setActiveCue(cue.uuid);
  }, []);

  const handleCellChange = React.useCallback<
    ISubtitleTableRowProps["onCellChange"]
  >(
    (field, value) => {
      if (activeCues.length === 1) {
        const activeCue = activeCues.at(0)!;
        const newCue: IVTTCue = {
          ...activeCue,
          [field]: value,
        };

        window.electronAPI.patchCues([newCue]);
      }
    },
    [activeCues],
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
              active={activeCueUuid.includes(cue.uuid)}
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
