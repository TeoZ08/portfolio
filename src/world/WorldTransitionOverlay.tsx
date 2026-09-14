"use client";

import { useWorldState } from "@/systems/world-state";

export function WorldTransitionOverlay() {
  const transitionActive = useWorldState((state) => state.transitionActive);

  return (
    <div
      className={`world-transition${transitionActive ? " world-transition--active" : ""}`}
      aria-hidden="true"
    />
  );
}
