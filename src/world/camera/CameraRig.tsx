"use client";

import { useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import {
  CAMERA_RECENTER_EVENT,
  useExperienceState,
  worldInputBlocked,
} from "@/systems/experience-state";
import type {
  CameraResyncRef,
  DevFrameUpdatesRef,
} from "@/world/DevFrameLoop";
import {
  CAMERA_INPUT,
  CAMERA_OBSTRUCTION,
  clampCameraValue,
  getCameraDefaultView,
  getCameraObstructionDistance,
  getWheelIntent,
  getZoomRadius,
  isInteractiveCameraTarget,
  normalizeWheelDelta,
} from "./camera-controls";
import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "./camera-presets";
import {
  dampVector3,
  getDampingAlpha,
  type CameraViewRef,
  type CameraTargetRef,
  type CameraVector,
} from "./camera-types";

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
  rayDirection: CameraVector;
  rayOrigin: CameraVector;
};

type ManualCameraState = {
  currentYaw: number;
  currentPitch: number;
  targetYaw: number;
  targetPitch: number;
  pendingYaw: number;
  pendingPitch: number;
  currentRadius: number;
  targetRadius: number;
  obstructionRadius: number;
  obstructionEngaged: boolean;
  initialized: boolean;
};

type FieldCameraOrientation = {
  yaw: number;
  pitch: number;
  valid: boolean;
};

type CameraPointerState = {
  activePointerId: number | null;
  pointers: Map<number, CameraPointer>;
  pinchDistance: number | null;
};

type CameraPointer = {
  pointerType: string;
  x: number;
  y: number;
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
    rayDirection: { x: 0, y: 0, z: 0 },
    rayOrigin: { x: 0, y: 0, z: 0 },
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
    currentRadius: 1,
    targetRadius: 1,
    obstructionRadius: 1,
    obstructionEngaged: false,
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
    activePointerId: null,
    pointers: new Map(),
    pinchDistance: null,
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

function dampAngle(current: number, target: number, damping: number, delta: number) {
  const difference = shortestAngleDelta(target, current);
  const alpha = getDampingAlpha(damping, delta);

  if (Math.abs(difference) <= 0.0001) {
    return normalizeAngle(target);
  }

  return normalizeAngle(current + difference * alpha);
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
  radius = manualCamera.currentRadius,
) {
  const horizontalDistance =
    Math.cos(manualCamera.currentPitch) * radius;

  desiredPosition.x =
    pivotX - Math.sin(manualCamera.currentYaw) * horizontalDistance;
  desiredPosition.y =
    pivotY + Math.sin(manualCamera.currentPitch) * radius;
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
  const { rapier, world } = useRapier();
  const reducedMotion = useExperienceState((state) => state.reducedMotion);
  const cameraLike = camera as unknown as CameraLike;
  const initializedRef = useRef(false);
  const scratchRef = useRef<CameraRigScratch | null>(null);
  const manualCameraRef = useRef(createManualCameraState());
  const fieldOrientationRef = useRef(createFieldCameraOrientation());
  const activePresetKeyRef = useRef<string | null>(null);
  const pointerStateRef = useRef(createCameraPointerState());
  const obstructionRayRef = useRef<InstanceType<typeof rapier.Ray> | null>(
    null,
  );

  if (scratchRef.current === null) {
    scratchRef.current = createCameraRigScratch();
  }

  const scratch = scratchRef.current;

  if (obstructionRayRef.current === null) {
    obstructionRayRef.current = new rapier.Ray(
      scratch.rayOrigin,
      scratch.rayDirection,
    );
  }

  const obstructionRay = obstructionRayRef.current;

  const initializeRig = useCallback(() => {
    const target = targetRef.current;
    const manualCamera = manualCameraRef.current;
    const presetKey = `${preset.mode}:${preset.name}`;
    const presetChanged = activePresetKeyRef.current !== presetKey;

    if (presetChanged || !manualCamera.initialized) {
      const initial = getCameraDefaultView(preset);
      const shouldRestoreFieldOrientation =
        preset.mode === "follow" && preset.name === "EXPLORE" && fieldOrientationRef.current.valid;
      const yaw = shouldRestoreFieldOrientation
        ? fieldOrientationRef.current.yaw
        : initial.yaw;
      const pitch = shouldRestoreFieldOrientation
        ? clampCameraValue(
            fieldOrientationRef.current.pitch,
            preset.manualPitchLimits,
          )
        : initial.pitch;

      manualCamera.currentYaw = normalizeAngle(yaw);
      manualCamera.currentPitch = pitch;
      manualCamera.targetYaw = manualCamera.currentYaw;
      manualCamera.targetPitch = pitch;
      manualCamera.pendingYaw = 0;
      manualCamera.pendingPitch = 0;
      manualCamera.currentRadius = initial.radius;
      manualCamera.targetRadius = initial.radius;
      manualCamera.obstructionRadius = initial.radius;
      manualCamera.obstructionEngaged = false;
      manualCamera.initialized = true;
      activePresetKeyRef.current = presetKey;

      if (preset.mode === "follow" && preset.name === "EXPLORE") {
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

  const recenterCamera = useCallback(() => {
    const manualCamera = manualCameraRef.current;
    const initial = getCameraDefaultView(preset);

    manualCamera.pendingYaw = 0;
    manualCamera.pendingPitch = 0;
    manualCamera.targetYaw = normalizeAngle(initial.yaw);
    manualCamera.targetPitch = initial.pitch;
    manualCamera.targetRadius = initial.radius;
  }, [preset]);

  const updateRig = useCallback(
    (delta: number) => {
      const manualCamera = manualCameraRef.current;

      if (worldInputBlocked()) {
        // Freeze both smoothing and queued gestures while a semantic overlay
        // or the HTML computer owns the interaction surface.
        manualCamera.pendingYaw = 0;
        manualCamera.pendingPitch = 0;
        return;
      }

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

      const dampingMultiplier = reducedMotion
        ? CAMERA_INPUT.reducedMotionDampingMultiplier
        : 1;

      if (manualCamera.pendingYaw !== 0) {
        manualCamera.targetYaw = normalizeAngle(
          manualCamera.targetYaw + manualCamera.pendingYaw,
        );
        manualCamera.pendingYaw = 0;
      }

      if (manualCamera.pendingPitch !== 0) {
        manualCamera.targetPitch = clampCameraValue(
          manualCamera.targetPitch + manualCamera.pendingPitch,
          preset.manualPitchLimits,
        );
        manualCamera.pendingPitch = 0;
      }

      if (preset.manualYawLimits !== null) {
        manualCamera.targetYaw = clampCameraValue(
          manualCamera.targetYaw,
          preset.manualYawLimits,
        );
      }

      manualCamera.currentYaw = dampAngle(
        manualCamera.currentYaw,
        manualCamera.targetYaw,
        preset.manualRotationDamping * dampingMultiplier,
        delta,
      );
      manualCamera.currentPitch +=
        (manualCamera.targetPitch - manualCamera.currentPitch) *
        getDampingAlpha(
          preset.manualRotationDamping * dampingMultiplier,
          delta,
        );
      manualCamera.currentRadius +=
        (manualCamera.targetRadius - manualCamera.currentRadius) *
        getDampingAlpha(preset.zoomDamping * dampingMultiplier, delta);

      if (preset.mode === "follow" && preset.name === "EXPLORE") {
        fieldOrientationRef.current.yaw = manualCamera.targetYaw;
        fieldOrientationRef.current.pitch = manualCamera.targetPitch;
      }

      const target = targetRef.current;
      const pivot = preset.mode === "fixed"
        ? {
            x: preset.fixedLookAt[0],
            y: preset.fixedLookAt[1],
            z: preset.fixedLookAt[2],
          }
        : target.lookAt;

      setDesiredPosition(
        scratch.desiredPosition,
        pivot.x,
        pivot.y,
        pivot.z,
        manualCamera,
      );

      const desiredOffsetX = scratch.desiredPosition.x - pivot.x;
      const desiredOffsetY = scratch.desiredPosition.y - pivot.y;
      const desiredOffsetZ = scratch.desiredPosition.z - pivot.z;
      const desiredDistance = Math.hypot(
        desiredOffsetX,
        desiredOffsetY,
        desiredOffsetZ,
      );
      const inverseDesiredDistance = desiredDistance > 0.0001
        ? 1 / desiredDistance
        : 0;

      scratch.rayDirection.x = desiredOffsetX * inverseDesiredDistance;
      scratch.rayDirection.y = desiredOffsetY * inverseDesiredDistance;
      scratch.rayDirection.z = desiredOffsetZ * inverseDesiredDistance;
      scratch.rayOrigin.x =
        pivot.x + scratch.rayDirection.x * CAMERA_OBSTRUCTION.pivotOffset;
      scratch.rayOrigin.y =
        pivot.y + scratch.rayDirection.y * CAMERA_OBSTRUCTION.pivotOffset;
      scratch.rayOrigin.z =
        pivot.z + scratch.rayDirection.z * CAMERA_OBSTRUCTION.pivotOffset;

      const rayLength = Math.max(
        0,
        desiredDistance - CAMERA_OBSTRUCTION.pivotOffset,
      );
      const hit = rayLength > 0
        ? world.castRay(
            obstructionRay,
            rayLength,
            true,
            rapier.QueryFilterFlags.EXCLUDE_SENSORS |
              rapier.QueryFilterFlags.EXCLUDE_KINEMATIC,
          )
        : null;
      const obstructionTarget = getCameraObstructionDistance({
        desiredDistance,
        hitTimeOfImpact: hit?.timeOfImpact ?? null,
      });

      if (hit !== null) {
        manualCamera.obstructionEngaged = true;
      } else if (
        manualCamera.obstructionEngaged &&
        manualCamera.obstructionRadius >= desiredDistance - 0.01
      ) {
        manualCamera.obstructionEngaged = false;
      }

      const retracting =
        obstructionTarget < manualCamera.obstructionRadius - 0.001;

      if (manualCamera.obstructionEngaged) {
        const obstructionDamping = reducedMotion
          ? retracting
            ? CAMERA_OBSTRUCTION.reducedMotionRetractDamping
            : CAMERA_OBSTRUCTION.reducedMotionRestoreDamping
          : retracting
            ? CAMERA_OBSTRUCTION.retractDamping
            : CAMERA_OBSTRUCTION.restoreDamping;
        const obstructionDelta = Math.min(
          delta,
          CAMERA_OBSTRUCTION.maximumDampingDelta,
        );

        manualCamera.obstructionRadius +=
          (obstructionTarget - manualCamera.obstructionRadius) *
          getDampingAlpha(obstructionDamping, obstructionDelta);
        manualCamera.obstructionRadius = Math.min(
          manualCamera.obstructionRadius,
          desiredDistance,
        );
      } else {
        manualCamera.obstructionRadius = desiredDistance;
      }

      setDesiredPosition(
        scratch.desiredPosition,
        pivot.x,
        pivot.y,
        pivot.z,
        manualCamera,
        manualCamera.obstructionRadius,
      );

      if (preset.mode === "follow") {
        const positionDamping = retracting
          ? reducedMotion
            ? CAMERA_OBSTRUCTION.reducedMotionRetractDamping
            : CAMERA_OBSTRUCTION.retractDamping
          : preset.cameraPositionDamping * dampingMultiplier;

        dampVector3(
          cameraLike.position,
          scratch.desiredPosition,
          positionDamping,
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
      obstructionRay,
      preset,
      rapier.QueryFilterFlags.EXCLUDE_KINEMATIC,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      reducedMotion,
      resyncRef,
      scratch,
      targetRef,
      world,
    ],
  );

  useEffect(() => {
    const element = gl.domElement;
    const pointerState = pointerStateRef.current;
    const manualCamera = manualCameraRef.current;

    const releasePointerCapture = (pointerId: number) => {
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    };

    const clearPointerInput = (clearPendingInput: boolean) => {
      for (const pointerId of pointerState.pointers.keys()) {
        releasePointerCapture(pointerId);
      }

      pointerState.pointers.clear();
      pointerState.activePointerId = null;
      pointerState.pinchDistance = null;

      if (clearPendingInput) {
        manualCamera.pendingYaw = 0;
        manualCamera.pendingPitch = 0;
      }
    };

    const getTouchPointers = () =>
      [...pointerState.pointers.entries()].filter(
        ([, pointer]) => pointer.pointerType === "touch",
      );

    const getTouchDistance = () => {
      const touches = getTouchPointers();

      if (touches.length < 2) {
        return null;
      }

      const first = touches[0][1];
      const second = touches[1][1];
      return Math.hypot(second.x - first.x, second.y - first.y);
    };

    const updateTouchMode = () => {
      const touches = getTouchPointers();

      if (touches.length >= 2) {
        pointerState.activePointerId = null;
        pointerState.pinchDistance = getTouchDistance();
        return;
      }

      pointerState.pinchDistance = null;
      pointerState.activePointerId = touches.length === 1 ? touches[0][0] : null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        (event.pointerType !== "touch" &&
          event.button !== 0 &&
          event.button !== 2) ||
        worldInputBlocked() ||
        isInteractiveCameraTarget(event.target)
      ) {
        return;
      }

      if (event.pointerType !== "touch") {
        clearPointerInput(false);
      }

      pointerState.pointers.set(event.pointerId, {
        pointerType: event.pointerType,
        x: event.clientX,
        y: event.clientY,
      });

      if (event.pointerType === "touch") {
        updateTouchMode();
      } else {
        pointerState.activePointerId = event.pointerId;
      }

      element.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pointer = pointerState.pointers.get(event.pointerId);

      if (!pointer) {
        return;
      }

      if (worldInputBlocked() || isInteractiveCameraTarget(event.target)) {
        clearPointerInput(true);
        return;
      }

      if (
        pointer.pointerType !== "touch" &&
        (event.buttons & 3) === 0
      ) {
        return;
      }

      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      if (pointer.pointerType === "touch") {
        const touchDistance = getTouchDistance();

        if (touchDistance !== null) {
          if (pointerState.pinchDistance !== null) {
            manualCamera.targetRadius = getZoomRadius(
              manualCamera.targetRadius,
              pointerState.pinchDistance - touchDistance,
              preset.radiusLimits,
            );
          }

          pointerState.pinchDistance = touchDistance;
          event.preventDefault();
          return;
        }

        if (pointerState.activePointerId !== event.pointerId) {
          return;
        }

        manualCamera.pendingYaw +=
          deltaX * CAMERA_INPUT.touchYawSensitivity;
        manualCamera.pendingPitch -=
          deltaY * CAMERA_INPUT.touchPitchSensitivity;
        event.preventDefault();
        return;
      }

      if (pointerState.activePointerId !== event.pointerId) {
        return;
      }

      manualCamera.pendingYaw +=
        deltaX * CAMERA_INPUT.mouseYawSensitivity;
      manualCamera.pendingPitch -=
        deltaY * CAMERA_INPUT.mousePitchSensitivity;
      event.preventDefault();
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        worldInputBlocked() ||
        isInteractiveCameraTarget(event.target)
      ) {
        return;
      }

      const deltaX = normalizeWheelDelta(
        event.deltaX,
        event.deltaMode,
        window.innerWidth,
      );
      const deltaY = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        window.innerHeight,
      );

      if (getWheelIntent(event) === "orbit") {
        // Wheel deltas describe content scroll and are opposite to the
        // physical two-finger gesture. Invert them to match mouse dragging.
        manualCamera.pendingYaw -=
          deltaX * CAMERA_INPUT.trackpadYawSensitivity;
        manualCamera.pendingPitch +=
          deltaY * CAMERA_INPUT.trackpadPitchSensitivity;
      } else {
        manualCamera.targetRadius = getZoomRadius(
          manualCamera.targetRadius,
          deltaY,
          preset.radiusLimits,
        );
      }

      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "c" ||
        event.repeat ||
        worldInputBlocked() ||
        isInteractiveCameraTarget(event.target)
      ) {
        return;
      }

      recenterCamera();
      event.preventDefault();
    };

    const handleRecenterRequest = () => {
      if (!worldInputBlocked()) {
        recenterCamera();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const pointer = pointerState.pointers.get(event.pointerId);

      if (!pointer) {
        return;
      }

      releasePointerCapture(event.pointerId);
      pointerState.pointers.delete(event.pointerId);

      if (pointer.pointerType === "touch") {
        updateTouchMode();
      } else if (pointerState.activePointerId === event.pointerId) {
        pointerState.activePointerId = null;
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const pointer = pointerState.pointers.get(event.pointerId);

      if (!pointer) {
        return;
      }

      releasePointerCapture(event.pointerId);
      pointerState.pointers.delete(event.pointerId);

      if (pointer.pointerType === "touch") {
        updateTouchMode();
      } else if (pointerState.activePointerId === event.pointerId) {
        pointerState.activePointerId = null;
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (!worldInputBlocked() && !isInteractiveCameraTarget(event.target)) {
        event.preventDefault();
      }
    };

    const handleWindowBlur = () => {
      clearPointerInput(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPointerInput(true);
      }
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerCancel);
    element.addEventListener("contextmenu", handleContextMenu);
    element.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(CAMERA_RECENTER_EVENT, handleRecenterRequest);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handlePointerCancel);
      element.removeEventListener("contextmenu", handleContextMenu);
      element.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(CAMERA_RECENTER_EVENT, handleRecenterRequest);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPointerInput(true);
    };
  }, [gl, preset, recenterCamera]);

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
