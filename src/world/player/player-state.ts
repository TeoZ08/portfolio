import { create } from "zustand";

export type PlayerDebugVector = [number, number, number];

export type PlayerDebugSnapshot = {
  position: PlayerDebugVector;
  velocity: PlayerDebugVector;
  grounded: boolean;
  moving: boolean;
};

const INITIAL_PLAYER_DEBUG: PlayerDebugSnapshot = {
  position: [0, 0.9, 4.5],
  velocity: [0, 0, 0],
  grounded: false,
  moving: false,
};

type PlayerDebugState = PlayerDebugSnapshot & {
  publish: (snapshot: PlayerDebugSnapshot) => void;
  reset: () => void;
};

export const usePlayerDebugState = create<PlayerDebugState>((set) => ({
  ...INITIAL_PLAYER_DEBUG,
  publish: (snapshot) => set(snapshot),
  reset: () => set(INITIAL_PLAYER_DEBUG),
}));

export function publishPlayerDebugSnapshot(snapshot: PlayerDebugSnapshot) {
  usePlayerDebugState.getState().publish(snapshot);
}

export function resetPlayerDebugState() {
  usePlayerDebugState.getState().reset();
}
