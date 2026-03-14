import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useScheduleStore } from "../../store/scheduleStore";
import { DayCard } from "./DayCard";
import { BlockOverlay } from "./BlockOverlay";
import { DeleteToast } from "./DeleteToast";
import { Block, DayOfWeek } from "../../types";

export function ScheduleBoard() {
  const schedule = useScheduleStore((s) => s.schedule);
  const updateBlockOrder = useScheduleStore((s) => s.updateBlockOrder);
  const moveBlock = useScheduleStore((s) => s.moveBlock);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [activeFromDay, setActiveFromDay] = useState<DayOfWeek | null>(null);

  const [liveRoutines, setLiveRoutines] = useState(schedule.routines);

  if (!activeBlock && liveRoutines !== schedule.routines) {
    setLiveRoutines(schedule.routines);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function findDayForBlock(blockId: UniqueIdentifier): DayOfWeek | null {
    for (const routine of liveRoutines) {
      if (routine.blocks.some((b) => b.id === blockId)) {
        return routine.day_of_week;
      }
    }
    return null;
  }

  function findOverDay(overId: UniqueIdentifier): DayOfWeek | null {
    const isDayId = schedule.routines.some((r) => r.day_of_week === overId);
    if (isDayId) return overId as DayOfWeek;
    return findDayForBlock(overId);
  }

  const handleDragStart = (event: DragStartEvent) => {
    const blockId = event.active.id;
    const day = findDayForBlock(blockId);
    if (!day) return;
    const block = liveRoutines
      .find((r) => r.day_of_week === day)
      ?.blocks.find((b) => b.id === blockId);
    setActiveBlock(block ?? null);
    setActiveFromDay(day);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const fromDay = findDayForBlock(active.id);
    const toDay = findOverDay(over.id);

    if (!fromDay || !toDay) return;
    if (fromDay === toDay) {
      const routine = liveRoutines.find((r) => r.day_of_week === fromDay);
      if (!routine) return;
      const oldIdx = routine.blocks.findIndex((b) => b.id === active.id);
      const newIdx = routine.blocks.findIndex((b) => b.id === over.id);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
      setLiveRoutines((prev) =>
        prev.map((r) => {
          if (r.day_of_week !== fromDay) return r;
          return { ...r, blocks: arrayMove(r.blocks, oldIdx, newIdx) };
        }),
      );
    } else {
      const block = liveRoutines
        .find((r) => r.day_of_week === fromDay)
        ?.blocks.find((b) => b.id === active.id);
      if (!block) return;

      const toRoutine = liveRoutines.find((r) => r.day_of_week === toDay);
      const overIdx =
        toRoutine?.blocks.findIndex((b) => b.id === over.id) ?? -1;
      const insertAt = overIdx >= 0 ? overIdx : (toRoutine?.blocks.length ?? 0);

      setLiveRoutines((prev) =>
        prev.map((r) => {
          if (r.day_of_week === fromDay) {
            return { ...r, blocks: r.blocks.filter((b) => b.id !== block.id) };
          }
          if (r.day_of_week === toDay) {
            const newBlocks = [...r.blocks];
            newBlocks.splice(insertAt, 0, block);
            return { ...r, blocks: newBlocks };
          }
          return r;
        }),
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (!over || !activeFromDay) {
      setLiveRoutines(schedule.routines);
      setActiveFromDay(null);
      return;
    }

    const fromDay = activeFromDay;
    const toDay = findOverDay(over.id);
    setActiveFromDay(null);

    if (!toDay) {
      setLiveRoutines(schedule.routines);
      return;
    }

    if (fromDay === toDay) {
      const liveRoutine = liveRoutines.find((r) => r.day_of_week === fromDay);
      if (!liveRoutine) return;
      updateBlockOrder(fromDay, liveRoutine.blocks);
    } else {
      const toRoutine = liveRoutines.find((r) => r.day_of_week === toDay);
      const toIndex =
        toRoutine?.blocks.findIndex((b) => b.id === active.id) ?? 0;
      moveBlock(fromDay, toDay, active.id as string, Math.max(0, toIndex));
    }
  };

  const handleDragCancel = () => {
    setActiveBlock(null);
    setActiveFromDay(null);
    setLiveRoutines(schedule.routines);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="inline-grid grid-flow-col auto-cols-[300px] gap-4 h-full items-start">
          {liveRoutines.map((routine) => (
            <DayCard
              key={routine.day_of_week}
              day={routine.day_of_week}
              blocks={routine.blocks}
              activeBlockId={activeBlock?.id ?? null}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeBlock ? <BlockOverlay block={activeBlock} /> : null}
        </DragOverlay>
      </DndContext>

      <DeleteToast />
    </>
  );
}
