import { create } from "zustand";

export const DEV_FOUNDATION_REGION = "DEV_FOUNDATION" as const;

type WorldState = {
  currentRegion: typeof DEV_FOUNDATION_REGION;
  timeOfDay: number;
  setTimeOfDay: (value: number) => void;
};

function clampTimeOfDay(value: number) {
  return Math.min(24, Math.max(0, value));
}

export const useWorldState = create<WorldState>((set) => ({
  currentRegion: DEV_FOUNDATION_REGION,
  timeOfDay: 12,
  setTimeOfDay: (value) => set({ timeOfDay: clampTimeOfDay(value) }),
}));
