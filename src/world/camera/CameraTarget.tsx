"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

import type {
  CameraResyncRef,
  DevFrameUpdatesRef,
} from "@/world/DevFrameLoop";
import type { PlayerControlRef } from "@/world/player/player-control";
import type { PlayerMotionRef } from "@/world/player/player-motion";
import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "./camera-presets";
import {
  dampVector3,
  type CameraTargetRef,
  type CameraVector,
} from "./camera-types";

type CameraTargetScratch = {
  desiredLookAhead: CameraVector;
};

type CameraTargetProps = {
  frameUpdatesRef: DevFrameUpdatesRef;
  motionRef: PlayerMotionRef;
  playerControlRef: PlayerControlRef;
  preset?: CameraPreset;
  resyncRef: CameraResyncRef;
  targetRef: CameraTargetRef;
};

const MIN_MANUAL_FOLLOW_SPEED = 0.5;

function createCameraTargetScratch(): CameraTargetScratch {
  return {
    desiredLookAhead: { x: 0, y: 0, z: 0 },
  };
}

export function CameraTarget({
  frameUpdatesRef,
  motionRef,
  playerControlRef,
  preset = EXPLORE_CAMERA_PRESET,
  resyncRef,
  targetRef,
}: CameraTargetProps) {
  const initializedRef = useRef(false);
  const scratchRef = useRef<CameraTargetScratch | null>(null);

  if (scratchRef.current === null) {
    scratchRef.current = createCameraTargetScratch();
  }

  const scratch = scratchRef.current;

  const initializeTarget = useCallback(() => {
    const motion = motionRef.current;
    const target = targetRef.current;

    target.anchor.x = motion.position.x;
    target.anchor.y = motion.position.y + preset.targetHeightOffset;
    target.anchor.z = motion.position.z;
    target.lookAhead.x = 0;
    target.lookAhead.y = 0;
    target.lookAhead.z = 0;
    target.lookAt.x = target.anchor.x;
    target.lookAt.y = target.anchor.y;
    target.lookAt.z = target.anchor.z;
    initializedRef.current = true;
  }, [motionRef, preset, targetRef]);

  const updateTarget = useCallback(
    (delta: number) => {
      const resync = resyncRef.current;
      if (resync.active && resync.stage === 1) {
        initializeTarget();
        resync.stage = 2;
        return;
      }

      if (!initializedRef.current) {
        initializeTarget();
        return;
      }

      const motion = motionRef.current;
      const target = targetRef.current;

      target.anchor.x = motion.position.x;
      target.anchor.y = motion.position.y + preset.targetHeightOffset;
      target.anchor.z = motion.position.z;

      if (preset.mode === "fixed") {
        target.lookAhead.x = 0;
        target.lookAhead.y = 0;
        target.lookAhead.z = 0;
        target.lookAt.x = target.anchor.x;
        target.lookAt.y = target.anchor.y;
        target.lookAt.z = target.anchor.z;
        return;
      }

      const planarSpeed = Math.hypot(motion.velocity.x, motion.velocity.z);
      const control = playerControlRef.current;
      const manualMovement =
        control.manualInputEnabled && !control.physicsLocked;

      if (manualMovement && planarSpeed > MIN_MANUAL_FOLLOW_SPEED) {
        const strength =
          Math.min(planarSpeed / preset.lookAheadReferenceSpeed, 1) *
          preset.lookAheadDistance;

        scratch.desiredLookAhead.x =
          (motion.velocity.x / planarSpeed) * strength;
        scratch.desiredLookAhead.y = 0;
        scratch.desiredLookAhead.z =
          (motion.velocity.z / planarSpeed) * strength;
      } else {
        scratch.desiredLookAhead.x = 0;
        scratch.desiredLookAhead.y = 0;
        scratch.desiredLookAhead.z = 0;
      }

      dampVector3(
        target.lookAhead,
        scratch.desiredLookAhead,
        preset.lookAheadDamping,
        delta,
      );
      target.lookAt.x = target.anchor.x + target.lookAhead.x;
      target.lookAt.y = target.anchor.y + target.lookAhead.y;
      target.lookAt.z = target.anchor.z + target.lookAhead.z;
    },
    [
      initializeTarget,
      motionRef,
      playerControlRef,
      preset,
      resyncRef,
      scratch,
      targetRef,
    ],
  );

  useLayoutEffect(() => {
    initializeTarget();

    const updates = frameUpdatesRef.current;
    updates.cameraTarget = updateTarget;

    return () => {
      if (updates.cameraTarget === updateTarget) {
        updates.cameraTarget = null;
      }
      initializedRef.current = false;
    };
  }, [frameUpdatesRef, initializeTarget, updateTarget]);

  return null;
}
