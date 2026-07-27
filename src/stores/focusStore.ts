import { create } from "zustand";
import type { Task, EnergyLevel } from "@/types/task";

type FocusUIMode = "loading" | "empty" | "task" | "celebrating";

interface FocusState {
  currentTask: Task | null;
  remainingCount: number;
  mode: FocusUIMode;
  timerSeconds: number;
  isTimerRunning: boolean;

  // Energy budget the user picked for "right now". Null = no filter,
  // show whatever's next by priority alone (the original behavior).
  energyFilter: EnergyLevel | null;
  // Whether the last-fetched task actually matched energyFilter, or
  // was a fallback because nothing fit the budget. Lets the UI say
  // "nothing low-energy left, here's the easiest thing available"
  // instead of silently ignoring the user's stated energy level.
  matchedEnergy: boolean;

  setTask: (
    task: Task | null,
    remainingCount: number,
    matchedEnergy?: boolean
  ) => void;
  setMode: (mode: FocusUIMode) => void;
  setEnergyFilter: (energy: EnergyLevel | null) => void;
  startTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

/**
 * Client-only UI state for the Focus view: which task is currently
 * shown, the selected energy filter, and the timer. This intentionally
 * does NOT own server data fetching/mutation -- that stays in the page
 * component via fetch calls to /api/tasks/*, so this store can't drift
 * out of sync with the DB.
 */
export const useFocusStore = create<FocusState>((set, get) => ({
  currentTask: null,
  remainingCount: 0,
  mode: "loading",
  timerSeconds: 0,
  isTimerRunning: false,
  energyFilter: null,
  matchedEnergy: true,

  setTask: (task, remainingCount, matchedEnergy = true) =>
    set({
      currentTask: task,
      remainingCount,
      matchedEnergy,
      mode: task ? "task" : "empty",
    }),

  setMode: (mode) => set({ mode }),

  setEnergyFilter: (energy) => set({ energyFilter: energy }),

  startTimer: (seconds) => set({ timerSeconds: seconds, isTimerRunning: true }),

  tickTimer: () => {
    const { timerSeconds, isTimerRunning } = get();
    if (!isTimerRunning) return;
    set({ timerSeconds: Math.max(0, timerSeconds - 1) });
  },

  stopTimer: () => set({ isTimerRunning: false }),

  resetTimer: () => set({ timerSeconds: 0, isTimerRunning: false }),
}));
