import type { CameraPreset } from "./camera-presets";

export const CAMERA_INPUT = {
  mouseYawSensitivity: 0.006,
  mousePitchSensitivity: 0.0045,
  trackpadYawSensitivity: 0.0035,
  trackpadPitchSensitivity: 0.0028,
  zoomSensitivity: 0.0018,
  reducedMotionDampingMultiplier: 2.75,
} as const;

export type WheelInput = {
  ctrlKey: boolean;
  deltaMode: number;
  deltaX: number;
  deltaY: number;
};

export type CameraDefaultView = {
  yaw: number;
  pitch: number;
  radius: number;
};

export function clampCameraValue(
  value: number,
  limits: readonly [number, number],
) {
  return Math.min(limits[1], Math.max(limits[0], value));
}

export function getCameraDefaultView(preset: CameraPreset): CameraDefaultView {
  const offset =
    preset.mode === "fixed"
      ? [
          preset.initialPosition[0] - preset.fixedLookAt[0],
          preset.initialPosition[1] - preset.fixedLookAt[1],
          preset.initialPosition[2] - preset.fixedLookAt[2],
        ]
      : preset.offset;
  const horizontalDistance = Math.hypot(offset[0], offset[2]);

  return {
    yaw: Math.atan2(-offset[0], offset[2]),
    pitch: clampCameraValue(
      Math.atan2(offset[1], horizontalDistance),
      preset.manualPitchLimits,
    ),
    radius: clampCameraValue(
      Math.hypot(horizontalDistance, offset[1]),
      preset.radiusLimits,
    ),
  };
}

export function getWheelIntent(input: WheelInput): "orbit" | "zoom" {
  if (input.ctrlKey || input.deltaMode !== 0) {
    return "zoom";
  }

  const absoluteX = Math.abs(input.deltaX);
  const absoluteY = Math.abs(input.deltaY);
  const hasTrackpadGranularity =
    !Number.isInteger(input.deltaX) || !Number.isInteger(input.deltaY);

  // Browsers do not expose the hardware source. Pixel deltas with horizontal
  // movement, fine granularity, or modest magnitude are the conservative
  // signals available for a two-finger trackpad gesture.
  return absoluteX > 0.5 ||
    hasTrackpadGranularity ||
    (absoluteY > 0 && absoluteY < 50)
    ? "orbit"
    : "zoom";
}

export function normalizeWheelDelta(
  delta: number,
  deltaMode: number,
  pageSize: number,
) {
  if (deltaMode === 1) {
    return delta * 16;
  }

  if (deltaMode === 2) {
    return delta * pageSize;
  }

  return delta;
}

export function getZoomRadius(
  currentRadius: number,
  wheelDelta: number,
  limits: readonly [number, number],
) {
  const boundedDelta = clampCameraValue(wheelDelta, [-120, 120]);

  return clampCameraValue(
    currentRadius * Math.exp(boundedDelta * CAMERA_INPUT.zoomSensitivity),
    limits,
  );
}

export function isInteractiveCameraTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest(
      "a, button, input, textarea, select, [contenteditable='true'], [role='button'], [data-world-ui]",
    ) !== null
  );
}
