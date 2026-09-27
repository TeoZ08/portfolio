type CameraPresetBase = {
  offset: readonly [number, number, number];
  initialPosition: readonly [number, number, number];
  targetHeightOffset: number;
  lookAheadDistance: number;
  lookAheadReferenceSpeed: number;
  lookAheadDamping: number;
  cameraPositionDamping: number;
  manualPitchLimits: readonly [number, number];
  manualYawLimits: readonly [number, number] | null;
  manualRotationDamping: number;
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
  manualPitchLimits: [Math.PI * 25 / 180, Math.PI * 55 / 180],
  manualYawLimits: null,
  manualRotationDamping: 14,
  fov: 50,
};

export const INTERIOR_CAMERA_PRESET: CameraPreset = {
  mode: "fixed",
  name: "INTERIOR",
  // From the entrance at room height, not above an exposed dollhouse. The
  // shell continues behind the playable threshold to enclose this view.
  offset: [1.8, 2.65, 10.4],
  initialPosition: [1.8, 3.8, 9.2],
  fixedLookAt: [0, 1.15, -1.2],
  targetHeightOffset: 0.65,
  lookAheadDistance: 0,
  lookAheadReferenceSpeed: 4,
  lookAheadDamping: 8,
  cameraPositionDamping: 7,
  // Keep the lens below the 4.5 m ceiling and within the entry-side enclosure.
  manualPitchLimits: [Math.PI * 10 / 180, Math.PI * 16 / 180],
  manualYawLimits: [-0.42, 0.38],
  manualRotationDamping: 16,
  fov: 60,
};
