export type InteractionStatus =
  | "idle"
  | "approaching"
  | "aligned"
  | "sitting"
  | "using"
  | "exiting";

export type InteractionAction =
  | {
      type: "align";
    }
  | {
      type: "sit";
      seatPoint: readonly [number, number, number];
      seatRotationY: number;
    }
  | {
      type: "use";
      useRotationY: number;
    };

export type InteractionTarget = {
  id: string;
  label: string;
  action: InteractionAction;
  interactionPoint: readonly [number, number, number];
  interactionRotationY: number;
  activationRadius: number;
  positionTolerance: number;
  rotationTolerance: number;
};
