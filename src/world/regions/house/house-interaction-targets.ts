import type { InteractionTarget } from "@/world/interactions/interaction-types";

import {
  HOUSE_FIELD_EXIT_POINT,
  HOUSE_INTERIOR_DOOR_POINT,
} from "./house-layout";

export const HOUSE_INTERACTION_TARGETS = [
  {
    id: "HOUSE_EXIT_DOOR",
    label: "Sair da casa",
    action: {
      type: "enter",
      destinationRegion: "FIELD",
      destinationPoint: HOUSE_FIELD_EXIT_POINT,
      destinationRotationY: 0,
    },
    interactionPoint: HOUSE_INTERIOR_DOOR_POINT,
    interactionRotationY: Math.PI,
    activationRadius: 2.1,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
] as const satisfies readonly InteractionTarget[];
