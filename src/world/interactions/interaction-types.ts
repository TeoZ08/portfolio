export type InteractionStatus =
  | "idle"
  | "approaching"
  | "aligned"
  | "entering"
  | "sitting"
  | "using"
  | "exiting";

export type InteractionDestination = "FIELD" | "HOUSE";

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
      seated?: boolean;
      seatPoint?: readonly [number, number, number];
    }
  | {
      type: "enter";
      destinationRegion: InteractionDestination;
      destinationPoint: readonly [number, number, number];
      destinationRotationY: number;
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
