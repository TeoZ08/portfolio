"use client";

import { DEV_INTERACTION_TARGETS } from "@/world/interactions/dev-interaction-targets";
import { DevPlayground } from "@/world/playground/DevPlayground";
import { WorldCanvas } from "@/world/WorldCanvas";

export function DevCanvas() {
  return (
    <WorldCanvas
      canvasLabel="Canvas DEV do playground de física"
      dataWorldMode="physics-playground"
      region="DEV_FOUNDATION"
      showHelpers
      targets={DEV_INTERACTION_TARGETS}
    >
      <DevPlayground />
    </WorldCanvas>
  );
}
