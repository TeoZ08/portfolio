"use client";

import { HOUSE_SCALE } from "./world-scale";
import { HouseInterior } from "./house/HouseInterior";

export function HouseRegion() {
  return (
    <group name="HOUSE_REGION" scale={HOUSE_SCALE}>
      <HouseInterior />
    </group>
  );
}
