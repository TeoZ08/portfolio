import { create } from "zustand";
import { SUNSET_DEFAULT_HOUR } from "@/world/regions/field/field-daylight";

export const DEV_FOUNDATION_REGION = "DEV_FOUNDATION" as const;
export const FIELD_REGION = "FIELD" as const;
export const HOUSE_REGION = "HOUSE" as const;

export type WorldRegion =
  | typeof DEV_FOUNDATION_REGION
  | typeof FIELD_REGION
  | typeof HOUSE_REGION;

export type PlayableWorldRegion = typeof FIELD_REGION | typeof HOUSE_REGION;

type WorldState = {
  currentRegion: WorldRegion;
  setCurrentRegion: (region: WorldRegion) => void;
  transitionActive: boolean;
  beginRegionTransition: (region: PlayableWorldRegion) => void;
  completeRegionTransition: () => void;
  timeOfDay: number;
  setTimeOfDay: (value: number) => void;
};

function clampTimeOfDay(value: number) {
  return Math.min(24, Math.max(0, value));
}

export const useWorldState = create<WorldState>((set) => ({
  currentRegion: FIELD_REGION,
  setCurrentRegion: (currentRegion) => set({ currentRegion }),
  transitionActive: false,
  beginRegionTransition: (currentRegion) =>
    set({ currentRegion, transitionActive: true }),
  completeRegionTransition: () => set({ transitionActive: false }),
  timeOfDay: SUNSET_DEFAULT_HOUR,
  setTimeOfDay: (value) => set({ timeOfDay: clampTimeOfDay(value) }),
}));
