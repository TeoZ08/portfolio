import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "@/world/camera/camera-presets";

// The outdoor composition opens enough to read house/tree above a lower-third
// player without forcing the camera into the high, distant compromise used by
// the original prototype.
export const FIELD_CAMERA_COMPOSITION: CameraPreset = {
  ...EXPLORE_CAMERA_PRESET,
  offset: [4.4, 1.7, 5.6],
  initialPosition: [4.4, 3.6, 10.1],
  targetHeightOffset: 1.05,
  cameraPositionDamping: 6.5,
  manualPitchLimits: [Math.PI * 8 / 180, Math.PI * 48 / 180],
  manualRotationDamping: 12,
  radiusLimits: [5.8, 12],
  zoomDamping: 9,
  fov: 54,
};

export const HILL_CAMERA_COMPOSITION: CameraPreset = {
  ...FIELD_CAMERA_COMPOSITION,
  mode: "follow", name: "VISTA", offset: [-3.2, 1.8, -5.3],
  initialPosition: [-3.2, 1.8, -5.3], targetHeightOffset: .65,
  lookAheadDistance: 0, radiusLimits: [5.5, 10],
  manualPitchLimits: [Math.PI * 8 / 180, Math.PI * 35 / 180], fov: 52,
};

export const PRACTICE_CAMERA_COMPOSITION: CameraPreset = {
  ...FIELD_CAMERA_COMPOSITION,
  mode: "follow", name: "PRACTICE", offset: [-1.8, .65, -2.1],
  initialPosition: [-1.8, .65, -2.1], targetHeightOffset: -.15,
  lookAheadDistance: 0, radiusLimits: [2.6, 3.5],
  manualPitchLimits: [Math.PI * 4 / 180, Math.PI * 18 / 180], fov: 66,
};

export const COMMUNITY_CAMERA_COMPOSITION: CameraPreset = {
  ...FIELD_CAMERA_COMPOSITION,
  mode: "follow", name: "COMMUNITY", offset: [-2.7, .7, 2],
  initialPosition: [-2.7, .7, 2], targetHeightOffset: .2,
  lookAheadDistance: 0, radiusLimits: [3, 6],
  manualPitchLimits: [Math.PI * 5 / 180, Math.PI * 24 / 180], fov: 62,
};
