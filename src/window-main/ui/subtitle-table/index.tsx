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
import { VTTCueUuid } from "../video/vtt-cue-uuid";

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

    const handleUp = (event: KeyboardEvent) => {
      const shiftKey = event.shiftKey;
      const ctrlKey = window.electronAPI.IS_DARWIN
        ? event.metaKey
        : event.ctrlKey;

      window.electronAPI.alterSelection("ArrowUp", {
        ctrlKey,
        shiftKey,
      });
    };

    const handleDown = (event: KeyboardEvent) => {
      const shiftKey = event.shiftKey;
      const ctrlKey = window.electronAPI.IS_DARWIN
        ? event.metaKey
        : event.ctrlKey;

      window.electronAPI.alterSelection("ArrowDown", {
        ctrlKey,
        shiftKey,
      });
    };

    const handleDelete = () => {
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
            return { uuid: cue.uuid, startTime: newStartTime };
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
            return { uuid: cue.uuid, startTime: newStartTime };
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
            return { uuid: cue.uuid, endTime: newEndTime };
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
            return { uuid: cue.uuid, endTime: newEndTime };
          }),
        );
      }
    };

    const handleK = () => {
      if (activeCues && videoEl) {
        window.electronAPI.patchCues(
          activeCues.map((cue) => {
            return { uuid: cue.uuid, endTime: videoEl.currentTime };
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

    const handleS = () => {
      const activeCue = activeCues.length === 1 ? activeCues.at(0)! : null;
      if (activeCue) {
        window.electronAPI.splitCue(activeCue.uuid);
      }
    };

    MouseTrap.bind("enter", handleEnter);
    MouseTrap.bind("esc", handleEsc);
    MouseTrap.bind("space", handleSpace);
    MouseTrap.bind(["up", "command+up", "ctrl+up", "shift+up"], handleUp);
    MouseTrap.bind(
      ["down", "command+down", "ctrl+down", "shift+down"],
      handleDown,
    );
    MouseTrap.bind("del", handleDelete);
    MouseTrap.bind("q", handleQ);
    MouseTrap.bind("w", handleW);
    MouseTrap.bind("e", handleE);
    MouseTrap.bind("r", handleR);
    MouseTrap.bind("k", handleK);
    MouseTrap.bind("o", handleO);
    MouseTrap.bind("s", handleS);

    return () => {
      MouseTrap.unbind("enter");
      MouseTrap.unbind("esc");
      MouseTrap.unbind("space");
      MouseTrap.unbind(["up", "command+up", "ctrl+up", "shift+up"]);
      MouseTrap.unbind(["down", "command+down", "ctrl+down", "shift+down"]);
      MouseTrap.unbind("del");
      MouseTrap.unbind("q");
      MouseTrap.unbind("w");
      MouseTrap.unbind("e");
      MouseTrap.unbind("r");
      MouseTrap.unbind("k");
      MouseTrap.unbind("o");
      MouseTrap.unbind("s");
    };
  }, [activeCues, videoEl, editField]);

  const handleSubtitleTableRowClick = React.useCallback(
    (cue: IVTTCue, event: React.MouseEvent<HTMLTableRowElement>) => {
      const shiftKey = event.shiftKey;
      const ctrlKey = window.electronAPI.IS_DARWIN
        ? event.metaKey
        : event.ctrlKey;

      window.electronAPI.alterSelection(cue.uuid, { ctrlKey, shiftKey });
    },
    [],
  );

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

  const handleContextMenu = React.useCallback((cue: IVTTCue) => {
    window.electronAPI.showCueContextMenu(cue.uuid);
  }, []);

  const cuesIsNew = React.useMemo<Record<IVTTCue["uuid"], boolean>>(() => {
    const isNew: Record<IVTTCue["uuid"], boolean> = {};
    const trackCues = [...(videoEl?.textTracks[0]?.cues ?? [])]
      .filter(VTTCueUuid.is)
      .map((cue) => cue.uuid);

    cues.forEach((c) => {
      if (trackCues.length > 0) {
        isNew[c.uuid] = !trackCues.includes(c.uuid);
      } else {
        isNew[c.uuid] = false;
      }
    });

    return isNew;
  }, [videoEl?.textTracks, cues]);

  return (
    <Table
      sx={{ outline: "none", userSelect: "none" }}
      hoverRow
      stickyHeader
      tabIndex={1}
      stripe="odd"
    >
      <thead>
        <tr>
          <th style={{ width: 100 }}>Start</th>
          <th style={{ width: 100 }}>End</th>
          <th style={{ width: 85 }}>Duration</th>
          <th>Text</th>
        </tr>
      </thead>
      <tbody>
        {cues.filter(isNotPlaceholderCue).map((cue) => {
          return (
            <SubtitleTableRow
              isNew={cuesIsNew[cue.uuid] ?? false}
              editField={editField}
              key={cue.uuid}
              cue={cue}
              active={activeCueUuid.includes(cue.uuid)}
              onContextMenu={handleContextMenu}
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
