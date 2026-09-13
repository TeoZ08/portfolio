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
const HEADING_CHANGE_THRESHOLD = Math.PI / 8;
const HEADING_PERSISTENCE = 0.2;

function createCameraTargetScratch(): CameraTargetScratch {
  return {
    desiredLookAhead: { x: 0, y: 0, z: 0 },
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
  const lastObservedHeadingRef = useRef(0);
  const headingCandidateRef = useRef(0);
  const headingCandidateElapsedRef = useRef(0);
  const headingCandidateActiveRef = useRef(false);
  const manualMotionActiveRef = useRef(false);

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
    target.movementHeading = motion.rotationY;
    target.hasMovementHeading = false;
    lastObservedHeadingRef.current = motion.rotationY;
    headingCandidateRef.current = motion.rotationY;
    headingCandidateElapsedRef.current = 0;
    headingCandidateActiveRef.current = false;
    manualMotionActiveRef.current = false;
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

      const planarSpeed = Math.hypot(motion.velocity.x, motion.velocity.z);
      const control = playerControlRef.current;
      const manualMovement =
        control.manualInputEnabled &&
        !control.physicsLocked &&
        planarSpeed > MIN_MANUAL_FOLLOW_SPEED;

      if (!manualMovement) {
        manualMotionActiveRef.current = false;
        headingCandidateActiveRef.current = false;
        headingCandidateElapsedRef.current = 0;
      } else {
        const observedHeading = Math.atan2(
          motion.velocity.x,
          -motion.velocity.z,
        );
        const observedChange = Math.abs(
          shortestAngleDelta(observedHeading, lastObservedHeadingRef.current),
        );

        if (!manualMotionActiveRef.current) {
          manualMotionActiveRef.current = true;
          headingCandidateRef.current = observedHeading;
          headingCandidateElapsedRef.current = 0;
          headingCandidateActiveRef.current = true;
        } else if (observedChange > HEADING_CHANGE_THRESHOLD) {
          headingCandidateRef.current = observedHeading;
          headingCandidateElapsedRef.current = 0;
          headingCandidateActiveRef.current = true;
        } else if (headingCandidateActiveRef.current) {
          const candidateChange = Math.abs(
            shortestAngleDelta(
              observedHeading,
              headingCandidateRef.current,
            ),
          );

          if (candidateChange > HEADING_CHANGE_THRESHOLD) {
            headingCandidateRef.current = observedHeading;
            headingCandidateElapsedRef.current = 0;
          } else {
            headingCandidateElapsedRef.current += delta;

            if (
              headingCandidateElapsedRef.current >= HEADING_PERSISTENCE
            ) {
              target.movementHeading = headingCandidateRef.current;
              target.hasMovementHeading = true;
              headingCandidateActiveRef.current = false;
            }
          }
        }

        lastObservedHeadingRef.current = observedHeading;
      }

      if (planarSpeed > 0.001) {
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
