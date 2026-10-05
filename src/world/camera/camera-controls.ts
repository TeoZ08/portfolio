import type { CameraPreset } from "./camera-presets";

export const CAMERA_INPUT = {
  mouseYawSensitivity: 0.006,
  mousePitchSensitivity: 0.0045,
  touchYawSensitivity: 0.007,
  touchPitchSensitivity: 0.005,
  trackpadYawSensitivity: 0.0035,
  trackpadPitchSensitivity: 0.0028,
  trackpadMaxPixelDelta: 50,
  trackpadMinDelta: 0.5,
  wheelLinePixels: 16,
  wheelDeltaLimit: 120,
  zoomSensitivity: 0.0018,
  reducedMotionDampingMultiplier: 2.75,
} as const;

export const CAMERA_OBSTRUCTION = {
  minimumDistance: 1.6,
  pivotOffset: 0.6,
  wallPadding: 0.3,
  retractDamping: 24,
  restoreDamping: 5,
  reducedMotionRetractDamping: 14,
  reducedMotionRestoreDamping: 7,
  maximumDampingDelta: 1 / 20,
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

export type CameraObstructionDistanceInput = {
  desiredDistance: number;
  hitTimeOfImpact: number | null;
  minimumDistance?: number;
  pivotOffset?: number;
  wallPadding?: number;
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

export function getCameraObstructionDistance({
  desiredDistance,
  hitTimeOfImpact,
  minimumDistance = CAMERA_OBSTRUCTION.minimumDistance,
  pivotOffset = CAMERA_OBSTRUCTION.pivotOffset,
  wallPadding = CAMERA_OBSTRUCTION.wallPadding,
}: CameraObstructionDistanceInput) {
  if (hitTimeOfImpact === null) {
    return desiredDistance;
  }

  const paddedHitDistance =
    pivotOffset + Math.max(0, hitTimeOfImpact) - wallPadding;

  return Math.min(
    desiredDistance,
    Math.max(minimumDistance, paddedHitDistance),
  );
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
  return absoluteX > CAMERA_INPUT.trackpadMinDelta ||
    hasTrackpadGranularity ||
    (absoluteY > 0 && absoluteY < CAMERA_INPUT.trackpadMaxPixelDelta)
    ? "orbit"
    : "zoom";
}

export function normalizeWheelDelta(
  delta: number,
  deltaMode: number,
  pageSize: number,
) {
  if (deltaMode === 1) {
    return delta * CAMERA_INPUT.wheelLinePixels;
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
  const boundedDelta = clampCameraValue(
    wheelDelta,
    [-CAMERA_INPUT.wheelDeltaLimit, CAMERA_INPUT.wheelDeltaLimit],
  );

  return clampCameraValue(
    currentRadius * Math.exp(boundedDelta * CAMERA_INPUT.zoomSensitivity),
    limits,
  );
}

export function isInteractiveCameraTarget(target: EventTarget | null) {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(
      "a, button, input, textarea, select, [contenteditable='true'], [role='button'], [data-world-ui]",
    ) !== null
  );
}
