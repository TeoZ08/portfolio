import { PLAN } from "../masterplan-layout";
import type { InteractionTarget } from "@/world/interactions/interaction-types";

import {
  HOUSE_BOOKSHELF_INTERACTION_POINT,
  HOUSE_COMPUTER_INTERACTION_POINT,
  HOUSE_COMPUTER_SEAT_POINT,
  HOUSE_ENTRY_BENCH_INTERACTION_POINT,
  HOUSE_ENTRY_BENCH_SEAT_POINT,
  HOUSE_FIELD_EXIT_POINT,
  HOUSE_INTERIOR_DOOR_POINT,
  HOUSE_REFERENCE_BOARD_INTERACTION_POINT,
} from "./house-layout";

export const HOUSE_BOOKSHELF_TARGET_ID = "HOUSE_BOOKSHELF" as const;
export const HOUSE_COMPUTER_TARGET_ID = "HOUSE_COMPUTER" as const;
export const HOUSE_ENTRY_BENCH_TARGET_ID = "HOUSE_ENTRY_BENCH" as const;
export const HOUSE_REFERENCE_BOARD_TARGET_ID = "HOUSE_REFERENCE_BOARD" as const;

export const HOUSE_INTERACTION_TARGETS = [
  {
    id: "HOUSE_EXIT_DOOR",
    label: "Sair da casa",
    action: {
      type: "enter",
      destinationRegion: "FIELD",
      destinationPoint: HOUSE_FIELD_EXIT_POINT,
      destinationRotationY: PLAN.house.yaw + Math.PI,
    },
    interactionPoint: HOUSE_INTERIOR_DOOR_POINT,
    interactionRotationY: Math.PI,
    activationRadius: 1.5,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
  {
    id: HOUSE_ENTRY_BENCH_TARGET_ID,
    label: "Sentar no banco",
    action: {
      type: "sit",
      seatPoint: HOUSE_ENTRY_BENCH_SEAT_POINT,
      seatRotationY: 0,
    },
    interactionPoint: HOUSE_ENTRY_BENCH_INTERACTION_POINT,
    interactionRotationY: Math.PI,
    activationRadius: 1.15,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
  {
    id: HOUSE_REFERENCE_BOARD_TARGET_ID,
    label: "Examinar mural",
    action: {
      type: "use",
      useRotationY: 0,
    },
    interactionPoint: HOUSE_REFERENCE_BOARD_INTERACTION_POINT,
    interactionRotationY: 0,
    activationRadius: 1.2,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
  {
    id: HOUSE_BOOKSHELF_TARGET_ID,
    label: "Examinar estante",
    action: {
      type: "use",
      useRotationY: -Math.PI / 2,
    },
    interactionPoint: HOUSE_BOOKSHELF_INTERACTION_POINT,
    interactionRotationY: -Math.PI / 2,
    activationRadius: 1.1,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
  {
    id: HOUSE_COMPUTER_TARGET_ID,
    label: "Usar o computador",
    action: {
      type: "use",
      useRotationY: 0,
      seated: true,
      seatPoint: HOUSE_COMPUTER_SEAT_POINT,
    },
    interactionPoint: HOUSE_COMPUTER_INTERACTION_POINT,
    interactionRotationY: 0,
    activationRadius: 1.45,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
] as const satisfies readonly InteractionTarget[];
