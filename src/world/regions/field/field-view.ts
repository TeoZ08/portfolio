import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "@/world/camera/camera-presets";

// The outdoor composition opens enough to read house/tree above a lower-third
// player without forcing the camera into the high, distant compromise used by
// the original prototype.
export const FIELD_CAMERA_COMPOSITION: CameraPreset = {
  ...EXPLORE_CAMERA_PRESET,
  offset: [7.5, 4.8, 9.5],
  initialPosition: [7.5, 7.5, 14],
  targetHeightOffset: 1.8,
  cameraPositionDamping: 6.5,
  manualPitchLimits: [Math.PI * 18 / 180, Math.PI * 48 / 180],
  manualRotationDamping: 12,
  radiusLimits: [9.5, 16],
  zoomDamping: 9,
  fov: 60,
};
