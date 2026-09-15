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
  clone: () => VectorLike;
  copy: (vector: CameraVector) => void;
};

type CameraLike = {
  lookAt: (target: CameraVector) => void;
  position: VectorLike;
  quaternion: QuaternionLike;
};

type CameraRigScratch = {
  desiredPosition: CameraVector;
  lookAtTarget: VectorLike;
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
    desiredPosition: { x: 0, y: 0, z: 0 },
    lookAtTarget: camera.position.clone(),
  };
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

  if (scratchRef.current === null || !scratchRef.current.lookAtTarget) {
    scratchRef.current = createCameraRigScratch(cameraLike);
  }

  const scratch = scratchRef.current;

  const initializeRig = useCallback(() => {
    const target = targetRef.current;

    if (preset.mode === "fixed") {
      scratch.desiredPosition.x = preset.initialPosition[0];
      scratch.desiredPosition.y = preset.initialPosition[1];
      scratch.desiredPosition.z = preset.initialPosition[2];
      scratch.lookAtTarget.x = preset.fixedLookAt[0];
      scratch.lookAtTarget.y = preset.fixedLookAt[1];
      scratch.lookAtTarget.z = preset.fixedLookAt[2];
    } else {
      scratch.desiredPosition.x = target.anchor.x + preset.offset[0];
      scratch.desiredPosition.y = target.anchor.y + preset.offset[1];
      scratch.desiredPosition.z = target.anchor.z + preset.offset[2];
      scratch.lookAtTarget.copy(target.lookAt);
    }

    cameraLike.position.copy(scratch.desiredPosition);
    cameraLike.lookAt(scratch.lookAtTarget);
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

      if (preset.mode === "fixed") {
        return;
      }

      const target = targetRef.current;
      scratch.desiredPosition.x =
        target.anchor.x + preset.offset[0] + target.lookAhead.x;
      scratch.desiredPosition.y = target.anchor.y + preset.offset[1];
      scratch.desiredPosition.z =
        target.anchor.z + preset.offset[2] + target.lookAhead.z;
      dampVector3(
        cameraLike.position,
        scratch.desiredPosition,
        preset.cameraPositionDamping,
        delta,
      );
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
