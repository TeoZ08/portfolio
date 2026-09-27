import type { InteractionTarget } from "@/world/interactions/interaction-types";

import { HOUSE_INTERIOR_ENTRY_POINT } from "../house/house-layout";

export const HOUSE_EXTERIOR_DOOR_INTERACTION_POINT = [
  -16,
  0.86,
  -30.25,
] as const;

export const FIELD_INTERACTION_TARGETS = [
  {
    id: "HOUSE_ENTRY_DOOR",
    label: "Entrar na casa",
    action: {
      type: "enter",
      destinationRegion: "HOUSE",
      destinationPoint: HOUSE_INTERIOR_ENTRY_POINT,
      destinationRotationY: 0,
    },
    interactionPoint: HOUSE_EXTERIOR_DOOR_INTERACTION_POINT,
    interactionRotationY: 0,
    activationRadius: 2.2,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
] as const satisfies readonly InteractionTarget[];
