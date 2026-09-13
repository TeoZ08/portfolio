export type CameraPreset = {
  name: "EXPLORE";
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
