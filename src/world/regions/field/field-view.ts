import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "@/world/camera/camera-presets";

// Same fixed-heading exploration rig, distance and elevation. The outdoor
// composition opens enough to read house/tree above a lower-third player.
export const FIELD_CAMERA_COMPOSITION: CameraPreset = {
  ...EXPLORE_CAMERA_PRESET,
  targetHeightOffset: 2.55,
  fov: 64,
};
