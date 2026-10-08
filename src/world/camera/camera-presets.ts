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
  radiusLimits: readonly [number, number];
  zoomDamping: number;
  fov: number;
};

export type CameraPreset =
  | (CameraPresetBase & {
      mode: "follow";
      name: "EXPLORE" | "VISTA" | "PRACTICE" | "COMMUNITY";
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
  radiusLimits: [7.5, 18],
  zoomDamping: 11,
  fov: 50,
};

export const INTERIOR_CAMERA_PRESET: CameraPreset = {
  mode: "fixed",
  name: "INTERIOR",
  // From the entrance at room height, not above an exposed dollhouse. The
  // shell continues behind the playable threshold to enclose this view.
  offset: [1.3, 2.1, 8.0],
  initialPosition: [1.3, 2.95, 7.6],
  fixedLookAt: [0, .85, -.4],
  targetHeightOffset: 0.65,
  lookAheadDistance: 0,
  lookAheadReferenceSpeed: 4,
  lookAheadDamping: 8,
  cameraPositionDamping: 7,
  // Keep the lens below the rescaled 3.24 m ceiling and within the entry-side enclosure.
  manualPitchLimits: [Math.PI * 12 / 180, Math.PI * 16 / 180],
  manualYawLimits: [-0.42, 0.38],
  manualRotationDamping: 10,
  radiusLimits: [7.6, 8.5],
  zoomDamping: 9.5,
  fov: 62,
};
