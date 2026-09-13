export type InteractionStatus = "idle" | "approaching" | "aligned";

export type InteractionTarget = {
  id: string;
  label: string;
  interactionPoint: readonly [number, number, number];
  interactionRotationY: number;
  activationRadius: number;
  positionTolerance: number;
  rotationTolerance: number;
};
