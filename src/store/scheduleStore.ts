import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Schedule, Block, DayOfWeek } from "../types";

interface DeletedBlockInfo {
  block: Block;
  day: DayOfWeek;
}

interface ScheduleState {
  schedule: Schedule;
  isLoading: boolean;
  error: string | null;
  lastDeleted: DeletedBlockInfo | null;
  loadSchedule: () => Promise<void>;
  saveScheduleProxy: (newSchedule: Schedule) => Promise<void>;
  addBlock: (
    day: DayOfWeek,
    block: Omit<Block, "id" | "order_index">,
  ) => Promise<void>;
  removeBlock: (day: DayOfWeek, blockId: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearLastDeleted: () => void;
  updateBlockOrder: (day: DayOfWeek, blocks: Block[]) => Promise<void>;
  moveBlock: (
    fromDay: DayOfWeek,
    toDay: DayOfWeek,
    blockId: string,
    toIndex: number,
  ) => Promise<void>;
}

const defaultDays: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function ensureCompleteSchedule(schedule: Schedule): Schedule {
  const existingDays = schedule.routines.map((r) => r.day_of_week);

  const completeRoutines = [...schedule.routines];

  defaultDays.forEach((day) => {
    if (!existingDays.includes(day)) {
      completeRoutines.push({ day_of_week: day, blocks: [] });
    }
  });

  completeRoutines.sort(
    (a, b) =>
      defaultDays.indexOf(a.day_of_week) - defaultDays.indexOf(b.day_of_week),
  );

  return { routines: completeRoutines };
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedule: { routines: [] },
  isLoading: true,
  error: null,
  lastDeleted: null,

  loadSchedule: async () => {
    try {
      set({ isLoading: true, error: null });
      const rawSchedule = await invoke<Schedule>("get_schedule");

      const fullSchedule = ensureCompleteSchedule(rawSchedule);

      set({ schedule: fullSchedule, isLoading: false });
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
    }
  },

  saveScheduleProxy: async (newSchedule: Schedule) => {
    const previousSchedule = get().schedule;

    set({ schedule: newSchedule, error: null });
    try {
      await invoke("save_schedule", { schedule: newSchedule });
    } catch (err: any) {
      set({ schedule: previousSchedule, error: err.toString() });
    }
  },

  addBlock: async (day: DayOfWeek, blockData) => {
    const { schedule, saveScheduleProxy } = get();

    const newBlock: Block = {
      ...blockData,
      id: crypto.randomUUID(),
      order_index:
        schedule.routines.find((r) => r.day_of_week === day)?.blocks.length ||
        0,
    };

    const newSchedule = {
      routines: schedule.routines.map((routine) => {
        if (routine.day_of_week === day) {
          return { ...routine, blocks: [...routine.blocks, newBlock] };
        }
        return routine;
      }),
    };

    await saveScheduleProxy(newSchedule);
  },

  removeBlock: async (day: DayOfWeek, blockId: string) => {
    const { schedule, saveScheduleProxy } = get();

    const routine = schedule.routines.find((r) => r.day_of_week === day);
    const deletedBlock = routine?.blocks.find((b) => b.id === blockId);

    const newSchedule = {
      routines: schedule.routines.map((routine) => {
        if (routine.day_of_week === day) {
          const filteredBlocks = routine.blocks.filter((b) => b.id !== blockId);
          const reindexedBlocks = filteredBlocks.map((b, i) => ({
            ...b,
            order_index: i,
          }));
          return { ...routine, blocks: reindexedBlocks };
        }
        return routine;
      }),
    };

    if (deletedBlock) {
      set({ lastDeleted: { block: deletedBlock, day } });
    }

    await saveScheduleProxy(newSchedule);
  },

  undoDelete: async () => {
    const { lastDeleted, schedule, saveScheduleProxy } = get();
    if (!lastDeleted) return;

    const { block, day } = lastDeleted;
    const newSchedule = {
      routines: schedule.routines.map((routine) => {
        if (routine.day_of_week === day) {
          const newBlocks = [...routine.blocks, block].map((b, i) => ({
            ...b,
            order_index: i,
          }));
          return { ...routine, blocks: newBlocks };
        }
        return routine;
      }),
    };

    set({ lastDeleted: null });
    await saveScheduleProxy(newSchedule);
  },

  clearLastDeleted: () => {
    set({ lastDeleted: null });
  },

  updateBlockOrder: async (day: DayOfWeek, newBlocks: Block[]) => {
    const { schedule, saveScheduleProxy } = get();

    const reindexedBlocks = newBlocks.map((b, i) => ({ ...b, order_index: i }));

    const newSchedule = {
      routines: schedule.routines.map((routine) => {
        if (routine.day_of_week === day) {
          return { ...routine, blocks: reindexedBlocks };
        }
        return routine;
      }),
    };

    await saveScheduleProxy(newSchedule);
  },

  moveBlock: async (fromDay, toDay, blockId, toIndex) => {
    const { schedule, saveScheduleProxy } = get();

    const fromRoutine = schedule.routines.find(
      (r) => r.day_of_week === fromDay,
    );
    const block = fromRoutine?.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const newRoutines = schedule.routines.map((routine) => {
      if (routine.day_of_week === fromDay) {
        const filtered = routine.blocks
          .filter((b) => b.id !== blockId)
          .map((b, i) => ({ ...b, order_index: i }));
        return { ...routine, blocks: filtered };
      }
      if (routine.day_of_week === toDay) {
        const destBlocks = [...routine.blocks];
        const clampedIndex = Math.min(toIndex, destBlocks.length);
        destBlocks.splice(clampedIndex, 0, {
          ...block,
          order_index: clampedIndex,
        });
        const reindexed = destBlocks.map((b, i) => ({ ...b, order_index: i }));
        return { ...routine, blocks: reindexed };
      }
      return routine;
    });

    await saveScheduleProxy({ routines: newRoutines });
  },
}));
