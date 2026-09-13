export type PlayerMotionVector = {
  x: number;
  y: number;
  z: number;
};

export type PlayerMotionState = {
  position: PlayerMotionVector;
  velocity: PlayerMotionVector;
  rotationY: number;
  grounded: boolean;
  moving: boolean;
};

export type PlayerMotionRef = {
  current: PlayerMotionState;
};

export const DEV_PLAYER_START_POSITION: [number, number, number] = [
  0,
  0.9,
  4.5,
];

export function createPlayerMotionState(): PlayerMotionState {
  return {
    position: {
      x: DEV_PLAYER_START_POSITION[0],
      y: DEV_PLAYER_START_POSITION[1],
      z: DEV_PLAYER_START_POSITION[2],
    },
    velocity: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    grounded: false,
    moving: false,
  };
}

export function resetPlayerMotionState(state: PlayerMotionState) {
  state.position.x = DEV_PLAYER_START_POSITION[0];
  state.position.y = DEV_PLAYER_START_POSITION[1];
  state.position.z = DEV_PLAYER_START_POSITION[2];
  state.velocity.x = 0;
  state.velocity.y = 0;
  state.velocity.z = 0;
  state.rotationY = 0;
  state.grounded = false;
  state.moving = false;
}
