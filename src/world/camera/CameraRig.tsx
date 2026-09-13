"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useLayoutEffect, useRef } from "react";

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

type QuaternionLike = {
  x: number;
  y: number;
  z: number;
  w: number;
  clone: () => QuaternionLike;
  copy: (quaternion: QuaternionLike) => QuaternionLike;
  slerp: (quaternion: QuaternionLike, alpha: number) => QuaternionLike;
};

type VectorLike = CameraVector & {
  clone: () => VectorLike;
  copy: (vector: CameraVector) => void;
};

type CameraLike = {
  lookAt: (target: CameraVector) => void;
  position: VectorLike;
  quaternion: QuaternionLike;
};

type CameraRigScratch = {
  currentQuaternion: QuaternionLike;
  desiredPosition: CameraVector;
  desiredQuaternion: QuaternionLike;
  lookAtTarget: VectorLike;
  offset: CameraVector;
  horizontalDistance: number;
};

type CameraRigProps = {
  cameraViewRef: CameraViewRef;
  frameUpdatesRef: DevFrameUpdatesRef;
  preset?: CameraPreset;
  resyncRef: CameraResyncRef;
  targetRef: CameraTargetRef;
};

function createCameraRigScratch(camera: CameraLike): CameraRigScratch {
  return {
    currentQuaternion: camera.quaternion.clone(),
    desiredPosition: { x: 0, y: 0, z: 0 },
    desiredQuaternion: camera.quaternion.clone(),
    lookAtTarget: camera.position.clone(),
    offset: { x: 0, y: 0, z: 0 },
    horizontalDistance: 0,
  };
}

function shortestAngleDelta(target: number, current: number) {
  const fullTurn = Math.PI * 2;
  let delta = (target - current + Math.PI) % fullTurn;

  if (delta < 0) {
    delta += fullTurn;
  }

  return delta - Math.PI;
}

function updateCameraView(
  cameraViewRef: CameraViewRef,
  quaternion: QuaternionLike,
) {
  const forwardX = -2 * (quaternion.w * quaternion.y + quaternion.x * quaternion.z);
  const forwardZ = 2 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y) - 1;
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
  const { camera } = useThree();
  const cameraLike = camera as unknown as CameraLike;
  const initializedRef = useRef(false);
  const scratchRef = useRef<CameraRigScratch | null>(null);
  const currentHeadingRef = useRef(
    Math.atan2(-preset.offset[0], preset.offset[2]),
  );

  if (scratchRef.current === null || !scratchRef.current.lookAtTarget) {
    scratchRef.current = createCameraRigScratch(cameraLike);
  }

  const scratch = scratchRef.current;

  const initializeRig = useCallback(() => {
    const target = targetRef.current;
    const currentHeading = currentHeadingRef.current;

    scratch.horizontalDistance = Math.hypot(preset.offset[0], preset.offset[2]);
    scratch.offset.x = -Math.sin(currentHeading) * scratch.horizontalDistance;
    scratch.offset.y = preset.offset[1];
    scratch.offset.z = Math.cos(currentHeading) * scratch.horizontalDistance;
    scratch.desiredPosition.x = target.anchor.x + scratch.offset.x;
    scratch.desiredPosition.y = target.anchor.y + scratch.offset.y;
    scratch.desiredPosition.z = target.anchor.z + scratch.offset.z;

    cameraLike.position.copy(scratch.desiredPosition);
    scratch.lookAtTarget.copy(target.lookAt);
    cameraLike.lookAt(scratch.lookAtTarget);
    scratch.desiredQuaternion.copy(cameraLike.quaternion);
    cameraLike.quaternion.copy(scratch.desiredQuaternion);
    updateCameraView(cameraViewRef, cameraLike.quaternion);
    currentHeadingRef.current = Math.atan2(
      cameraViewRef.current.forwardX,
      -cameraViewRef.current.forwardZ,
    );
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

      const target = targetRef.current;
      const currentHeading = currentHeadingRef.current;

      if (target.hasMovementHeading) {
        currentHeadingRef.current +=
          shortestAngleDelta(target.movementHeading, currentHeading) *
          getDampingAlpha(preset.headingDamping, delta);
      }

      scratch.offset.x =
        -Math.sin(currentHeadingRef.current) * scratch.horizontalDistance;
      scratch.offset.y = preset.offset[1];
      scratch.offset.z =
        Math.cos(currentHeadingRef.current) * scratch.horizontalDistance;

      scratch.desiredPosition.x = target.anchor.x + scratch.offset.x;
      scratch.desiredPosition.y = target.anchor.y + scratch.offset.y;
      scratch.desiredPosition.z = target.anchor.z + scratch.offset.z;
      dampVector3(
        cameraLike.position,
        scratch.desiredPosition,
        preset.cameraPositionDamping,
        delta,
      );

      scratch.currentQuaternion.copy(cameraLike.quaternion);
      scratch.lookAtTarget.copy(target.lookAt);
      cameraLike.lookAt(scratch.lookAtTarget);
      scratch.desiredQuaternion.copy(cameraLike.quaternion);
      cameraLike.quaternion.copy(scratch.currentQuaternion).slerp(
        scratch.desiredQuaternion,
        getDampingAlpha(preset.orientationDamping, delta),
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
