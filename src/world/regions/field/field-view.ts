import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "@/world/camera/camera-presets";

// Same exploration rig, distance, elevation and directional follow. Only the
// outdoor composition opens enough to read house/tree above a lower-third player.
export const FIELD_CAMERA_COMPOSITION: CameraPreset = {
  ...EXPLORE_CAMERA_PRESET,
  targetHeightOffset: 2.55,
  fov: 64,
};
