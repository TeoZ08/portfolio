import { PLAN } from "../regions/masterplan-layout";
import { FIELD_SCALE } from "../regions/world-scale";

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
  sprinting: boolean;
  airborne: boolean;
};

export type PlayerMotionRef = {
  current: PlayerMotionState;
};

export const DEV_PLAYER_START_POSITION: [number, number, number] = [
  PLAN.arrival[0]*FIELD_SCALE,
  0.9,
  PLAN.arrival[1]*FIELD_SCALE,
];

const PLAYGROUND_START_POSITION: [number, number, number] = [0, .9, 4.5];
export function getPlayerStartPosition(region: string): [number, number, number] {
  // HOUSE retains the existing entry/SPA policy; only the DEV floor needs its own spawn.
  return region === "DEV_FOUNDATION" ? PLAYGROUND_START_POSITION : DEV_PLAYER_START_POSITION;
}

export function createPlayerMotionState(startPosition = DEV_PLAYER_START_POSITION): PlayerMotionState {
  return {
    position: {
      x: startPosition[0],
      y: startPosition[1],
      z: startPosition[2],
    },
    velocity: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    grounded: false,
    moving: false,
    sprinting: false,
    airborne: true,
  };
}

export function resetPlayerMotionState(state: PlayerMotionState, startPosition = DEV_PLAYER_START_POSITION) {
  state.position.x = startPosition[0];
  state.position.y = startPosition[1];
  state.position.z = startPosition[2];
  state.velocity.x = 0;
  state.velocity.y = 0;
  state.velocity.z = 0;
  state.rotationY = 0;
  state.grounded = false;
  state.moving = false;
  state.sprinting = false;
  state.airborne = true;
}
