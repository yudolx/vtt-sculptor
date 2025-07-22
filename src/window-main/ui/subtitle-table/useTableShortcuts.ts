import React from "react";
import MouseTrap from "shared/libs/mousetrap/index";
import { DEFAULT_CUE_ADJUST_TIME } from "shared/constants";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export const useTableShortcuts = (
  videoEl: HTMLVideoElement | null,
  cues: IVTTCue[],
  activeCues: IVTTCue[],
  editField: keyof IVTTCue | null,
  setEditField: (field: keyof IVTTCue | null) => void,
) => {
  React.useEffect(() => {
    const handleSpace = (event: MouseTrap.ExtendedKeyboardEvent) => {
      const el = event.target as Element;

      if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") {
        event.stopPropagation();
        event.preventDefault();
      }

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

      window.electronAPI.alterSelection(null, {
        ctrlKey,
        shiftKey,
        key: "ArrowUp",
      });
    };

    const handleDown = (event: KeyboardEvent) => {
      const shiftKey = event.shiftKey;
      const ctrlKey = window.electronAPI.IS_DARWIN
        ? event.metaKey
        : event.ctrlKey;

      window.electronAPI.alterSelection(null, {
        ctrlKey,
        shiftKey,
        key: "ArrowDown",
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

    const handleCtrlK = () => {
      if (activeCues.length === 1 && videoEl) {
        const activeCue = activeCues.at(0)!;
        const prevCue = cues.at(cues.indexOf(activeCue) - 1);

        if (prevCue) {
          window.electronAPI.patchCues([
            { uuid: activeCue.uuid, startTime: prevCue.endTime + 0.001 },
          ]);
        } else {
          console.warn("No previous cue for the specified cue was found");
          return;
        }
      } else {
        alert("This function requires only 1 cue to be selected");
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
    MouseTrap.bind(["command+k", "ctrl+k"], handleCtrlK);
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
      MouseTrap.unbind(["command+k", "ctrl+k"]);
      MouseTrap.unbind("o");
      MouseTrap.unbind("s");
    };
  }, [activeCues, videoEl, editField, cues, setEditField]);
};
