import type { InteractionTarget } from "@/world/interactions/interaction-types";

import { HOUSE_INTERIOR_ENTRY_POINT } from "../house/house-layout";
import { PLACE_LAYOUT } from "../places/place-layout";
import { surfaceHeight } from "./field-layout";
import { PLAN, GALLERY_USE, HOUSE_DOOR } from "../masterplan-layout";
import { FIELD_SCALE } from "../world-scale";

export const HOUSE_EXTERIOR_DOOR_INTERACTION_POINT = [HOUSE_DOOR[0]*FIELD_SCALE, surfaceHeight(...HOUSE_DOOR)*FIELD_SCALE+.86, HOUSE_DOOR[1]*FIELD_SCALE] as const;


type Anchor = { x: number; z: number; yaw: number };
export function placePlayerPoint(place: Anchor, x: number, z: number, floor = .13): readonly [number, number, number] {
  return [
    (place.x + x * Math.cos(place.yaw) + z * Math.sin(place.yaw)) * FIELD_SCALE,
    (surfaceHeight(place.x, place.z) + floor) * FIELD_SCALE + .86,
    (place.z - x * Math.sin(place.yaw) + z * Math.cos(place.yaw)) * FIELD_SCALE,
  ];
}
function useTarget(id: string, label: string, place: Anchor, x: number, z: number, yaw = 0, floor = .13): InteractionTarget {
  return { id, label, action: { type: "use", useRotationY: place.yaw + yaw },
    interactionPoint: placePlayerPoint(place, x, z, floor), interactionRotationY: place.yaw + yaw,
    activationRadius: 2.1, positionTolerance: .12, rotationTolerance: .07 };
}
export const FOREST_CHIME_ANCHOR = PLAN.chime;
export const FOREST_ANCHOR = PLAN.forestBench;
function benchTarget(id: string, label: string, place: Anchor, floor: number): InteractionTarget {
  return { id, label, action: { type: "sit", seatPoint: placePlayerPoint(place, 0, -.04, floor), seatRotationY: place.yaw },
    interactionPoint: placePlayerPoint(place, 0, -1.25, floor), interactionRotationY: place.yaw,
    activationRadius: 2, positionTolerance: .12, rotationTolerance: .07 };
}

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
    interactionRotationY: PLAN.house.yaw,
    activationRadius: 1.8,
    positionTolerance: 0.08,
    rotationTolerance: 0.05,
  },
  useTarget("WORKSHOP_LIGHT_TABLE", "Experimentar a luz do ateliê", PLACE_LAYOUT.workshop, ...GALLERY_USE.process),
  useTarget("UNIVERSITY_NOTEBOOK", "Consultar o caderno do Jarvis", PLACE_LAYOUT.university, ...GALLERY_USE.jarvis),
  useTarget("COMMUNITY_WORKSHOP", "Abrir uma oficina UnAPI", PLACE_LAYOUT.community, ...GALLERY_USE.unapi),
  useTarget("DOJO_PRACTICE", "Fazer uma pausa para o treino", PLACE_LAYOUT.dojo, 0, 1.1, 0, .513),
  useTarget("FOREST_CHIMES", "Tocar o sino de vento", FOREST_CHIME_ANCHOR, 0, 0, 0, 0),
  benchTarget("FOREST_BENCH", "Sentar à sombra", FOREST_ANCHOR, .03),
  benchTarget("HILL_BENCH", "Contemplar o horizonte", PLACE_LAYOUT.hill, .025),
] as const satisfies readonly InteractionTarget[];
