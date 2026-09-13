export type PlayerControlVector = {
  x: number;
  z: number;
};

export type PlayerControlState = {
  manualInputEnabled: boolean;
  desiredVelocity: PlayerControlVector;
  targetRotationY: number | null;
};

export type PlayerControlRef = {
  current: PlayerControlState;
};

export function createPlayerControlState(): PlayerControlState {
  return {
    manualInputEnabled: true,
    desiredVelocity: { x: 0, z: 0 },
    targetRotationY: null,
  };
}

export function resetPlayerControlState(state: PlayerControlState) {
  state.manualInputEnabled = true;
  state.desiredVelocity.x = 0;
  state.desiredVelocity.z = 0;
  state.targetRotationY = null;
}
