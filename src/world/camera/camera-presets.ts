type CameraPresetBase = {
  offset: readonly [number, number, number];
  initialPosition: readonly [number, number, number];
  targetHeightOffset: number;
  lookAheadDistance: number;
  lookAheadReferenceSpeed: number;
  lookAheadDamping: number;
  cameraPositionDamping: number;
  fov: number;
};

export type CameraPreset =
  | (CameraPresetBase & {
      mode: "follow";
      name: "EXPLORE";
    })
  | (CameraPresetBase & {
      fixedLookAt: readonly [number, number, number];
      mode: "fixed";
      name: "INTERIOR";
    });

export const EXPLORE_CAMERA_PRESET: CameraPreset = {
  mode: "follow",
  name: "EXPLORE",
  offset: [8, 6.5, 8],
  initialPosition: [8, 7.55, 12.5],
  targetHeightOffset: 0.15,
  lookAheadDistance: 0.6,
  lookAheadReferenceSpeed: 4,
  lookAheadDamping: 7,
  cameraPositionDamping: 5.5,
  fov: 50,
};

export const INTERIOR_CAMERA_PRESET: CameraPreset = {
  mode: "fixed",
  name: "INTERIOR",
  offset: [7.6, 5, 10.5],
  initialPosition: [7.6, 6.1, 10.5],
  fixedLookAt: [0, 1.2, -0.6],
  targetHeightOffset: 0.65,
  lookAheadDistance: 0,
  lookAheadReferenceSpeed: 4,
  lookAheadDamping: 8,
  cameraPositionDamping: 7,
  fov: 56,
};
