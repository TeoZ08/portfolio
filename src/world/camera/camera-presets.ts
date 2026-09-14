export type CameraPreset = {
  name: "EXPLORE" | "INTERIOR";
  offset: readonly [number, number, number];
  initialPosition: readonly [number, number, number];
  targetHeightOffset: number;
  lookAheadDistance: number;
  lookAheadReferenceSpeed: number;
  lookAheadDamping: number;
  cameraPositionDamping: number;
  orientationDamping: number;
  headingDamping: number;
  fov: number;
};

export const EXPLORE_CAMERA_PRESET: CameraPreset = {
  name: "EXPLORE",
  offset: [8, 6.5, 8],
  initialPosition: [8, 7.55, 12.5],
  targetHeightOffset: 0.15,
  lookAheadDistance: 0.6,
  lookAheadReferenceSpeed: 4,
  lookAheadDamping: 7,
  cameraPositionDamping: 5.5,
  orientationDamping: 9,
  headingDamping: 4.5,
  fov: 50,
};

export const INTERIOR_CAMERA_PRESET: CameraPreset = {
  name: "INTERIOR",
  offset: [5.4, 4.2, 5.4],
  initialPosition: [5.4, 5.06, 10.4],
  targetHeightOffset: 0.65,
  lookAheadDistance: 0.28,
  lookAheadReferenceSpeed: 4,
  lookAheadDamping: 8,
  cameraPositionDamping: 7,
  orientationDamping: 11,
  headingDamping: 5,
  fov: 56,
};
