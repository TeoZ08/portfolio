import type { InteractionTarget } from "./interaction-types";

export type DevInteractionFixture = {
  target: InteractionTarget;
  objectPosition: [number, number, number];
  objectSize: [number, number, number];
  objectRotationY: number;
};

export const DEV_INTERACTION_FIXTURES: readonly DevInteractionFixture[] = [
  {
    target: {
      id: "DEV_INTERACTION_CHAIR",
      label: "chair",
      action: {
        type: "sit",
        seatPoint: [3, 0.86, 2.95],
        seatRotationY: Math.PI,
      },
      interactionPoint: [3, 0.86, 2.95],
      interactionRotationY: Math.PI,
      activationRadius: 1.6,
      positionTolerance: 0.08,
      rotationTolerance: 0.05,
    },
    objectPosition: [3, 0.55, 2],
    objectSize: [1.2, 1.1, 1],
    objectRotationY: 0,
  },
  {
    target: {
      id: "DEV_INTERACTION_CONSOLE",
      label: "console",
      action: {
        type: "align",
      },
      interactionPoint: [1, 0.86, 1.4],
      interactionRotationY: Math.PI / 2,
      activationRadius: 1.6,
      positionTolerance: 0.08,
      rotationTolerance: 0.05,
    },
    objectPosition: [0, 0.55, 1.4],
    objectSize: [1.4, 1.1, 0.8],
    objectRotationY: Math.PI / 2,
  },
];

export const DEV_INTERACTION_TARGETS: readonly InteractionTarget[] =
  DEV_INTERACTION_FIXTURES.map((fixture) => fixture.target);
