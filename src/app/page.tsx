"use client";

import {
  FIELD_REGION,
  HOUSE_REGION,
  useWorldState,
} from "@/systems/world-state";
import { useInteractionDebugState } from "@/world/interactions/interaction-state";
import { WorldAvailability } from "@/ui/WorldAvailability";
import { WorldPresentation } from "@/ui/WorldPresentation";
import { WorldTransitionOverlay } from "@/world/WorldTransitionOverlay";
import { FieldRegion } from "@/world/regions/FieldRegion";
import { HouseRegion } from "@/world/regions/HouseRegion";
import { WorldCanvas } from "@/world/WorldCanvas";
import { FIELD_INTERACTION_TARGETS } from "@/world/regions/field/field-interaction-targets";
import { FIELD_PALETTE } from "@/world/regions/field/field-palette";
import { FIELD_CAMERA_COMPOSITION, HILL_CAMERA_COMPOSITION, PRACTICE_CAMERA_COMPOSITION, COMMUNITY_CAMERA_COMPOSITION } from "@/world/regions/field/field-view";
import { HOUSE_INTERACTION_TARGETS } from "@/world/regions/house/house-interaction-targets";
import { HOUSE_PALETTE } from "@/world/regions/house/house-palette";
import { INTERIOR_CAMERA_PRESET } from "@/world/camera/camera-presets";

export default function HomePage() {
  const currentRegion = useWorldState((state) => state.currentRegion);
  const inWorkshop = useInteractionDebugState(state => state.status === "using" && state.activeTargetId === "COMMUNITY_WORKSHOP");
  const practicing = useInteractionDebugState(state => state.status === "using" && state.activeTargetId === "DOJO_PRACTICE");
  const atLookout = useInteractionDebugState(state => state.status === "sitting" && state.activeTargetId === "HILL_BENCH");
  const isHouse = currentRegion === HOUSE_REGION;

  return (
    <main className="world-page"><WorldAvailability>
      <WorldCanvas
        backgroundColor={isHouse ? HOUSE_PALETTE.wallShade : FIELD_PALETTE.sky}
        playerColor={FIELD_PALETTE.player}
        cameraPreset={isHouse ? INTERIOR_CAMERA_PRESET : atLookout ? HILL_CAMERA_COMPOSITION : practicing ? PRACTICE_CAMERA_COMPOSITION : inWorkshop ? COMMUNITY_CAMERA_COMPOSITION : FIELD_CAMERA_COMPOSITION}
        canvasLabel={
          isHouse
            ? "Casa de Matteo: quarto e escritório"
            : "O mundo de Matteo: campo, casa e caminhos para explorar"
        }
        dataWorldMode="vertical-slice"
        region={isHouse ? HOUSE_REGION : FIELD_REGION}
        targets={isHouse ? HOUSE_INTERACTION_TARGETS : FIELD_INTERACTION_TARGETS}
      >
        {isHouse ? <HouseRegion /> : <FieldRegion />}
      </WorldCanvas>
      <WorldTransitionOverlay />
      <WorldPresentation />
      </WorldAvailability>
    </main>
  );
}
