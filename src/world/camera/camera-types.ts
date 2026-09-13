export type CameraVector = {
  x: number;
  y: number;
  z: number;
};

export type CameraTargetState = {
  anchor: CameraVector;
  lookAhead: CameraVector;
  lookAt: CameraVector;
};

export type CameraTargetRef = {
  current: CameraTargetState;
};

export function createCameraTargetState(): CameraTargetState {
  return {
    anchor: { x: 0, y: 0, z: 0 },
    lookAhead: { x: 0, y: 0, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 },
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
