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
  type CameraTargetRef,
  type CameraVector,
} from "./camera-types";

type QuaternionLike = {
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
};

type CameraRigProps = {
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
  };
}

export function CameraRig({
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

    scratch.offset.x = preset.offset[0];
    scratch.offset.y = preset.offset[1];
    scratch.offset.z = preset.offset[2];
    scratch.desiredPosition.x = target.anchor.x + scratch.offset.x;
    scratch.desiredPosition.y = target.anchor.y + scratch.offset.y;
    scratch.desiredPosition.z = target.anchor.z + scratch.offset.z;

    cameraLike.position.copy(scratch.desiredPosition);
    scratch.lookAtTarget.copy(target.lookAt);
    cameraLike.lookAt(scratch.lookAtTarget);
    scratch.desiredQuaternion.copy(cameraLike.quaternion);
    cameraLike.quaternion.copy(scratch.desiredQuaternion);
    initializedRef.current = true;
  }, [cameraLike, preset, scratch, targetRef]);

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
    },
    [cameraLike, initializeRig, preset, resyncRef, scratch, targetRef],
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
