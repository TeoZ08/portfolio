"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import type {
  CameraResyncRef,
  DevFrameUpdatesRef,
} from "@/world/DevFrameLoop";
import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "./camera-presets";
import {
  dampVector3,
  getDampingAlpha,
  type CameraViewRef,
  type CameraTargetRef,
  type CameraVector,
} from "./camera-types";

const MOUSE_YAW_SENSITIVITY = 0.006;
const MOUSE_PITCH_SENSITIVITY = 0.0045;

type QuaternionLike = {
  x: number;
  y: number;
  z: number;
  w: number;
};

type VectorLike = CameraVector & {
  copy: (vector: CameraVector) => void;
};

type CameraLike = {
  position: VectorLike;
  quaternion: QuaternionLike;
};

type CameraRigScratch = {
  desiredPosition: CameraVector;
};

type ManualCameraState = {
  currentYaw: number;
  currentPitch: number;
  targetYaw: number;
  targetPitch: number;
  pendingYaw: number;
  pendingPitch: number;
  radius: number;
  initialized: boolean;
};

type FieldCameraOrientation = {
  yaw: number;
  pitch: number;
  valid: boolean;
};

type CameraPointerState = {
  pointerId: number | null;
  lastX: number;
  lastY: number;
};

type CameraRigProps = {
  cameraViewRef: CameraViewRef;
  frameUpdatesRef: DevFrameUpdatesRef;
  preset?: CameraPreset;
  resyncRef: CameraResyncRef;
  targetRef: CameraTargetRef;
};

function createCameraRigScratch(): CameraRigScratch {
  return {
    desiredPosition: { x: 0, y: 0, z: 0 },
  };
}

function createManualCameraState(): ManualCameraState {
  return {
    currentYaw: 0,
    currentPitch: 0,
    targetYaw: 0,
    targetPitch: 0,
    pendingYaw: 0,
    pendingPitch: 0,
    radius: 1,
    initialized: false,
  };
}

function createFieldCameraOrientation(): FieldCameraOrientation {
  return {
    yaw: 0,
    pitch: 0,
    valid: false,
  };
}

function createCameraPointerState(): CameraPointerState {
  return {
    pointerId: null,
    lastX: 0,
    lastY: 0,
  };
}

function normalizeAngle(angle: number) {
  const fullTurn = Math.PI * 2;
  let normalized = (angle + Math.PI) % fullTurn;

  if (normalized < 0) {
    normalized += fullTurn;
  }

  return normalized - Math.PI;
}

function shortestAngleDelta(target: number, current: number) {
  return normalizeAngle(target - current);
}

function clamp(value: number, limits: readonly [number, number]) {
  return Math.min(limits[1], Math.max(limits[0], value));
}

function dampAngle(current: number, target: number, damping: number, delta: number) {
  const difference = shortestAngleDelta(target, current);
  const alpha = getDampingAlpha(damping, delta);

  if (Math.abs(difference) <= 0.0001) {
    return normalizeAngle(target);
  }

  return normalizeAngle(current + difference * alpha);
}

function getInitialManualOrientation(preset: CameraPreset) {
  if (preset.mode === "fixed") {
    const offsetX = preset.initialPosition[0] - preset.fixedLookAt[0];
    const offsetY = preset.initialPosition[1] - preset.fixedLookAt[1];
    const offsetZ = preset.initialPosition[2] - preset.fixedLookAt[2];
    const horizontalDistance = Math.hypot(offsetX, offsetZ);

    return {
      yaw: Math.atan2(-offsetX, offsetZ),
      pitch: clamp(
        Math.atan2(offsetY, horizontalDistance),
        preset.manualPitchLimits,
      ),
      radius: Math.hypot(horizontalDistance, offsetY),
    };
  }

  const horizontalDistance = Math.hypot(preset.offset[0], preset.offset[2]);

  return {
    yaw: Math.atan2(-preset.offset[0], preset.offset[2]),
    pitch: clamp(
      Math.atan2(preset.offset[1], horizontalDistance),
      preset.manualPitchLimits,
    ),
    radius: Math.hypot(horizontalDistance, preset.offset[1]),
  };
}

function setCameraQuaternion(
  quaternion: QuaternionLike,
  yaw: number,
  pitch: number,
) {
  const halfPitch = -pitch / 2;
  const halfYaw = -yaw / 2;
  const sinPitch = Math.sin(halfPitch);
  const cosPitch = Math.cos(halfPitch);
  const sinYaw = Math.sin(halfYaw);
  const cosYaw = Math.cos(halfYaw);

  quaternion.x = sinPitch * cosYaw;
  quaternion.y = cosPitch * sinYaw;
  quaternion.z = -sinPitch * sinYaw;
  quaternion.w = cosPitch * cosYaw;
}

function setDesiredPosition(
  desiredPosition: CameraVector,
  pivotX: number,
  pivotY: number,
  pivotZ: number,
  manualCamera: ManualCameraState,
) {
  const horizontalDistance =
    Math.cos(manualCamera.currentPitch) * manualCamera.radius;

  desiredPosition.x =
    pivotX - Math.sin(manualCamera.currentYaw) * horizontalDistance;
  desiredPosition.y =
    pivotY + Math.sin(manualCamera.currentPitch) * manualCamera.radius;
  desiredPosition.z =
    pivotZ + Math.cos(manualCamera.currentYaw) * horizontalDistance;
}

function updateCameraView(
  cameraViewRef: CameraViewRef,
  quaternion: QuaternionLike,
) {
  const forwardX =
    -2 * (quaternion.w * quaternion.y + quaternion.x * quaternion.z);
  const forwardZ =
    2 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y) - 1;
  const horizontalLength = Math.hypot(forwardX, forwardZ);

  if (horizontalLength <= 0.0001) {
    return;
  }

  const inverseLength = 1 / horizontalLength;
  const view = cameraViewRef.current;
  view.forwardX = forwardX * inverseLength;
  view.forwardZ = forwardZ * inverseLength;
  view.rightX = -view.forwardZ;
  view.rightZ = view.forwardX;
}

export function CameraRig({
  cameraViewRef,
  frameUpdatesRef,
  preset = EXPLORE_CAMERA_PRESET,
  resyncRef,
  targetRef,
}: CameraRigProps) {
  const { camera, gl } = useThree();
  const cameraLike = camera as unknown as CameraLike;
  const initializedRef = useRef(false);
  const scratchRef = useRef<CameraRigScratch | null>(null);
  const manualCameraRef = useRef(createManualCameraState());
  const fieldOrientationRef = useRef(createFieldCameraOrientation());
  const activePresetKeyRef = useRef<string | null>(null);
  const pointerStateRef = useRef(createCameraPointerState());

  if (scratchRef.current === null) {
    scratchRef.current = createCameraRigScratch();
  }

  const scratch = scratchRef.current;

  const initializeRig = useCallback(() => {
    const target = targetRef.current;
    const manualCamera = manualCameraRef.current;
    const presetKey = `${preset.mode}:${preset.name}`;
    const presetChanged = activePresetKeyRef.current !== presetKey;

    if (presetChanged || !manualCamera.initialized) {
      const initial = getInitialManualOrientation(preset);
      const shouldRestoreFieldOrientation =
        preset.mode === "follow" && fieldOrientationRef.current.valid;
      const yaw = shouldRestoreFieldOrientation
        ? fieldOrientationRef.current.yaw
        : initial.yaw;
      const pitch = shouldRestoreFieldOrientation
        ? clamp(fieldOrientationRef.current.pitch, preset.manualPitchLimits)
        : initial.pitch;

      manualCamera.currentYaw = normalizeAngle(yaw);
      manualCamera.currentPitch = pitch;
      manualCamera.targetYaw = manualCamera.currentYaw;
      manualCamera.targetPitch = pitch;
      manualCamera.pendingYaw = 0;
      manualCamera.pendingPitch = 0;
      manualCamera.radius = initial.radius;
      manualCamera.initialized = true;
      activePresetKeyRef.current = presetKey;

      if (preset.mode === "follow") {
        fieldOrientationRef.current.yaw = manualCamera.currentYaw;
        fieldOrientationRef.current.pitch = manualCamera.currentPitch;
        fieldOrientationRef.current.valid = true;
      }
    }

    if (preset.mode === "fixed") {
      setDesiredPosition(
        scratch.desiredPosition,
        preset.fixedLookAt[0],
        preset.fixedLookAt[1],
        preset.fixedLookAt[2],
        manualCamera,
      );
    } else {
      setDesiredPosition(
        scratch.desiredPosition,
        target.lookAt.x,
        target.lookAt.y,
        target.lookAt.z,
        manualCamera,
      );
    }
    cameraLike.position.copy(scratch.desiredPosition);
    setCameraQuaternion(
      cameraLike.quaternion,
      manualCamera.currentYaw,
      manualCamera.currentPitch,
    );
    updateCameraView(cameraViewRef, cameraLike.quaternion);
    initializedRef.current = true;
  }, [cameraLike, cameraViewRef, preset, scratch, targetRef]);

  const updateRig = useCallback(
    (delta: number) => {
      const resync = resyncRef.current;
      if (resync.active && resync.stage === 2) {
        initializeRig();
        resync.stage = 0;
        return;
      }

      if (!initializedRef.current) {
        initializeRig();
        return;
      }

      const manualCamera = manualCameraRef.current;

      if (manualCamera.pendingYaw !== 0) {
        manualCamera.targetYaw = normalizeAngle(
          manualCamera.targetYaw + manualCamera.pendingYaw,
        );
        manualCamera.pendingYaw = 0;
      }

      if (manualCamera.pendingPitch !== 0) {
        manualCamera.targetPitch = clamp(
          manualCamera.targetPitch + manualCamera.pendingPitch,
          preset.manualPitchLimits,
        );
        manualCamera.pendingPitch = 0;
      }

      if (preset.manualYawLimits !== null) {
        manualCamera.targetYaw = clamp(
          manualCamera.targetYaw,
          preset.manualYawLimits,
        );
      }

      manualCamera.currentYaw = dampAngle(
        manualCamera.currentYaw,
        manualCamera.targetYaw,
        preset.manualRotationDamping,
        delta,
      );
      manualCamera.currentPitch +=
        (manualCamera.targetPitch - manualCamera.currentPitch) *
        getDampingAlpha(preset.manualRotationDamping, delta);

      if (preset.mode === "follow") {
        fieldOrientationRef.current.yaw = manualCamera.targetYaw;
        fieldOrientationRef.current.pitch = manualCamera.targetPitch;
      }

      const target = targetRef.current;
      if (preset.mode === "fixed") {
        setDesiredPosition(
          scratch.desiredPosition,
          preset.fixedLookAt[0],
          preset.fixedLookAt[1],
          preset.fixedLookAt[2],
          manualCamera,
        );
      } else {
        setDesiredPosition(
          scratch.desiredPosition,
          target.lookAt.x,
          target.lookAt.y,
          target.lookAt.z,
          manualCamera,
        );
      }

      if (preset.mode === "follow") {
        dampVector3(
          cameraLike.position,
          scratch.desiredPosition,
          preset.cameraPositionDamping,
          delta,
        );
      } else {
        cameraLike.position.copy(scratch.desiredPosition);
      }

      setCameraQuaternion(
        cameraLike.quaternion,
        manualCamera.currentYaw,
        manualCamera.currentPitch,
      );
      updateCameraView(cameraViewRef, cameraLike.quaternion);
    },
    [
      cameraLike,
      cameraViewRef,
      initializeRig,
      preset,
      resyncRef,
      scratch,
      targetRef,
    ],
  );

  useEffect(() => {
    const element = gl.domElement;
    const pointerState = pointerStateRef.current;
    const manualCamera = manualCameraRef.current;

    const releasePointerCapture = () => {
      if (
        pointerState.pointerId !== null &&
        element.hasPointerCapture(pointerState.pointerId)
      ) {
        element.releasePointerCapture(pointerState.pointerId);
      }

      pointerState.pointerId = null;
    };

    const clearDragging = (clearPendingInput: boolean) => {
      releasePointerCapture();

      if (clearPendingInput) {
        manualCamera.pendingYaw = 0;
        manualCamera.pendingPitch = 0;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 2) {
        return;
      }

      pointerState.pointerId = event.pointerId;
      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        pointerState.pointerId === null ||
        event.pointerId !== pointerState.pointerId
      ) {
        return;
      }

      const deltaX = event.clientX - pointerState.lastX;
      const deltaY = event.clientY - pointerState.lastY;
      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
      manualCamera.pendingYaw += deltaX * MOUSE_YAW_SENSITIVITY;
      manualCamera.pendingPitch -= deltaY * MOUSE_PITCH_SENSITIVITY;
      event.preventDefault();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (
        pointerState.pointerId !== null &&
        event.pointerId === pointerState.pointerId
      ) {
        clearDragging(false);
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleWindowBlur = () => {
      clearDragging(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearDragging(true);
      }
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handleWindowBlur);
    element.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handleWindowBlur);
      element.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearDragging(true);
    };
  }, [gl]);

  useLayoutEffect(() => {
    initializeRig();

    const updates = frameUpdatesRef.current;
    updates.cameraRig = updateRig;

    return () => {
      if (updates.cameraRig === updateRig) {
        updates.cameraRig = null;
      }
      initializedRef.current = false;
    };
  }, [frameUpdatesRef, initializeRig, updateRig]);

  return null;
}
