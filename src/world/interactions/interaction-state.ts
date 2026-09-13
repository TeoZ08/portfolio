import { create } from "zustand";

import type { InteractionStatus } from "./interaction-types";

export type InteractionDebugSnapshot = {
  status: InteractionStatus;
  candidateId: string | null;
  candidateLabel: string | null;
  activeTargetId: string | null;
  activeTargetLabel: string | null;
};

const INITIAL_INTERACTION_DEBUG: InteractionDebugSnapshot = {
  status: "idle",
  candidateId: null,
  candidateLabel: null,
  activeTargetId: null,
  activeTargetLabel: null,
};

type InteractionDebugState = InteractionDebugSnapshot & {
  publish: (snapshot: InteractionDebugSnapshot) => void;
  reset: () => void;
};

export const useInteractionDebugState = create<InteractionDebugState>((set) => ({
  ...INITIAL_INTERACTION_DEBUG,
  publish: (snapshot) => set(snapshot),
  reset: () => set(INITIAL_INTERACTION_DEBUG),
}));

export function publishInteractionDebugSnapshot(
  snapshot: InteractionDebugSnapshot,
) {
  useInteractionDebugState.getState().publish(snapshot);
}

export function resetInteractionDebugState() {
  useInteractionDebugState.getState().reset();
}
