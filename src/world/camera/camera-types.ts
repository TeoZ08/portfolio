export type CameraVector = {
  x: number;
  y: number;
  z: number;
};

export type CameraViewState = {
  forwardX: number;
  forwardZ: number;
  rightX: number;
  rightZ: number;
};

export type CameraViewRef = {
  current: CameraViewState;
};

export type CameraTargetState = {
  anchor: CameraVector;
  lookAhead: CameraVector;
  lookAt: CameraVector;
  movementHeading: number;
  hasMovementHeading: boolean;
};

export type CameraTargetRef = {
  current: CameraTargetState;
};

export function createCameraViewState(
  offset: readonly [number, number, number],
): CameraViewState {
  const horizontalLength = Math.hypot(offset[0], offset[2]);
  const inverseLength = horizontalLength > 0.0001 ? 1 / horizontalLength : 0;
  const forwardX = -offset[0] * inverseLength;
  const forwardZ = -offset[2] * inverseLength;

  return {
    forwardX,
    forwardZ,
    rightX: -forwardZ,
    rightZ: forwardX,
  };
}

export function createCameraTargetState(): CameraTargetState {
  return {
    anchor: { x: 0, y: 0, z: 0 },
    lookAhead: { x: 0, y: 0, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 },
    movementHeading: 0,
    hasMovementHeading: false,
  };
}

export function dampVector3(
  current: CameraVector,
  target: CameraVector,
  damping: number,
  delta: number,
) {
  const alpha = 1 - Math.exp(-damping * delta);

  current.x += (target.x - current.x) * alpha;
  current.y += (target.y - current.y) * alpha;
  current.z += (target.z - current.z) * alpha;
}

export function getDampingAlpha(damping: number, delta: number) {
  return 1 - Math.exp(-damping * delta);
}
