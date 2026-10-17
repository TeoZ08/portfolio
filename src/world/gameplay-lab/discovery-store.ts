"use client";

import { create } from "zustand";
import {
  discover,
  type DiscoveryId,
  type Position3,
} from "./discovery-logic";

type DiscoveryLabStore = {
  found: readonly DiscoveryId[];
  tryCollect: (id: string, playerPosition: Position3) => void;
  reset: () => void;
};

export const useDiscoveryLabStore = create<DiscoveryLabStore>((set) => ({
  found: [],
  tryCollect: (id, playerPosition) =>
    set((state) => {
      const found = discover(state.found, id, playerPosition);
      return found === state.found ? state : { found };
    }),
  reset: () => set({ found: [] }),
}));
