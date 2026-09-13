import { create } from "zustand";

export const DEV_FOUNDATION_REGION = "DEV_FOUNDATION" as const;
export const FIELD_REGION = "FIELD" as const;

export type WorldRegion = typeof DEV_FOUNDATION_REGION | typeof FIELD_REGION;

type WorldState = {
  currentRegion: WorldRegion;
  setCurrentRegion: (region: WorldRegion) => void;
  timeOfDay: number;
  setTimeOfDay: (value: number) => void;
};

function clampTimeOfDay(value: number) {
  return Math.min(24, Math.max(0, value));
}

export const useWorldState = create<WorldState>((set) => ({
  currentRegion: FIELD_REGION,
  setCurrentRegion: (currentRegion) => set({ currentRegion }),
  timeOfDay: 12,
  setTimeOfDay: (value) => set({ timeOfDay: clampTimeOfDay(value) }),
}));
