import React from "react";
import { Table } from "@mui/joy";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import { ISubtitleTableRowProps, SubtitleTableRow } from "./row";
import type { IVTTCue } from "@sculptor/helpers/vtt";
import { VideoElContext } from "@sculptor/shared";
import { useTableDataWrapper } from "./useTableDataWrapper";
import { useTableShortcuts } from "./useTableShortcuts";
import { useGlobalShortcuts } from "./useGlobalShortcuts";

export const SubtitleTable = () => {
  const [editField, setEditField] = React.useState<keyof IVTTCue | null>(null);

  const { videoEl } = React.useContext(VideoElContext);

  const {
    activeCueUuid,
    activeCues,
    cues,
    cueItemsUuid,
    cuesIsNew,
    setDataInternally,
  } = useTableDataWrapper(videoEl);

  useGlobalShortcuts(videoEl);
  useTableShortcuts(videoEl, cues, activeCues, editField, setEditField);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleSubtitleTableRowClick = React.useCallback(
    (cue: IVTTCue, event: React.MouseEvent<HTMLTableRowElement>) => {
      if (editField !== null) return;

      const shiftKey = event.shiftKey;
      const ctrlKey = window.electronAPI.IS_DARWIN
        ? event.metaKey
        : event.ctrlKey;

      window.electronAPI.alterSelection(cue.uuid, { ctrlKey, shiftKey });
    },
    [editField],
  );

  const handleCellChange = React.useCallback<
    ISubtitleTableRowProps["onCellChange"]
  >(
    (field, value, blur) => {
      if (activeCues.length === 1) {
        const activeCue = activeCues.at(0)!;
        const newCue: IVTTCue = {
          ...activeCue,
          [field]: value,
        };

        window.electronAPI.patchCues([newCue]);

        if (blur) {
          window.electronAPI.enableHotkeys();
          setEditField(null);
        }
      }
    },
    [activeCues],
  );

  const handleDoubleCellClick = React.useCallback<
    ISubtitleTableRowProps["onDoubleCellClick"]
  >((field) => {
    setEditField(field);
    window.electronAPI.disableHotkeys();
  }, []);

  const handleContextMenu = React.useCallback((cue: IVTTCue) => {
    window.electronAPI.showCueContextMenu(cue.uuid);
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const activeIndex = cues.findIndex((cue) => cue.uuid === active.id);
        const overIndex = cues.findIndex((cue) => cue.uuid === over!.id);

        window.electronAPI.reorderCue(activeIndex, overIndex);

        setDataInternally(arrayMove(cues, activeIndex, overIndex));
      }
    },
    [setDataInternally, cues],
  );

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table
        hoverRow
        stickyHeader
        stripe="odd"
        sx={{ outline: "none", userSelect: "none" }}
        tabIndex={1}
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
          <SortableContext
            items={cueItemsUuid}
            strategy={verticalListSortingStrategy}
          >
            {cues.map((cue) => {
              return (
                <SubtitleTableRow
                  isNew={cuesIsNew[cue.uuid] ?? false}
                  editField={editField}
                  key={cue.uuid}
                  cue={cue}
                  isActive={activeCueUuid.includes(cue.uuid)}
                  onContextMenu={handleContextMenu}
                  onClick={handleSubtitleTableRowClick}
                  onCellChange={handleCellChange}
                  onDoubleCellClick={handleDoubleCellClick}
                />
              );
            })}
          </SortableContext>
        </tbody>
      </Table>
    </DndContext>
  );
};
