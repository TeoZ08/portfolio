"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import type { DevFrameUpdatesRef } from "@/world/DevFrameLoop";
import type { PlayerControlRef } from "@/world/player/player-control";
import type { PlayerMotionRef } from "@/world/player/player-motion";
import {
  publishInteractionDebugSnapshot,
  resetInteractionDebugState,
} from "./interaction-state";
import type { InteractionStatus, InteractionTarget } from "./interaction-types";

const INTERACTION_APPROACH_SPEED = 2.5;
const INTERACTION_EXIT_SPEED = 2.5;

type InteractionRuntimeState = {
  status: InteractionStatus;
  candidate: InteractionTarget | null;
  activeTarget: InteractionTarget | null;
  interactRequested: boolean;
  cancelRequested: boolean;
};

type InteractionSystemProps = {
  frameUpdatesRef: DevFrameUpdatesRef;
  motionRef: PlayerMotionRef;
  playerControlRef: PlayerControlRef;
  targets: readonly InteractionTarget[];
};

function createInteractionRuntimeState(): InteractionRuntimeState {
  return {
    status: "idle",
    candidate: null,
    activeTarget: null,
    interactRequested: false,
    cancelRequested: false,
  };
}

function isFormControl(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

function shortestAngleDelta(target: number, current: number) {
  const fullTurn = Math.PI * 2;
  let delta = (target - current + Math.PI) % fullTurn;

  if (delta < 0) {
    delta += fullTurn;
  }

  return delta - Math.PI;
}

function getNearestTarget(
  position: PlayerMotionRef["current"]["position"],
  targets: readonly InteractionTarget[],
) {
  let nearest: InteractionTarget | null = null;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    const dx = target.interactionPoint[0] - position.x;
    const dy = target.interactionPoint[1] - position.y;
    const dz = target.interactionPoint[2] - position.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const radiusSquared = target.activationRadius * target.activationRadius;

    if (distanceSquared > radiusSquared) {
      continue;
    }

    const isCloser = distanceSquared < nearestDistanceSquared;
    const isTie =
      distanceSquared === nearestDistanceSquared &&
      nearest !== null &&
      target.id < nearest.id;

    if (isCloser || isTie) {
      nearest = target;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest;
}

function publishRuntimeState(runtime: InteractionRuntimeState) {
  publishInteractionDebugSnapshot({
    status: runtime.status,
    candidateId: runtime.candidate?.id ?? null,
    candidateLabel: runtime.candidate?.label ?? null,
    activeTargetId: runtime.activeTarget?.id ?? null,
    activeTargetLabel: runtime.activeTarget?.label ?? null,
  });
}

function setPlayerControlIdle(playerControlRef: PlayerControlRef) {
  const control = playerControlRef.current;
  control.manualInputEnabled = true;
  control.physicsLocked = false;
  control.desiredVelocity.x = 0;
  control.desiredVelocity.z = 0;
  control.targetRotationY = null;
}

function setPlayerControlAlignment(
  playerControlRef: PlayerControlRef,
  velocityX: number,
  velocityZ: number,
  targetRotationY: number,
) {
  const control = playerControlRef.current;
  control.manualInputEnabled = false;
  control.physicsLocked = false;
  control.desiredVelocity.x = velocityX;
  control.desiredVelocity.z = velocityZ;
  control.targetRotationY = targetRotationY;
}

function setPlayerControlSitting(
  playerControlRef: PlayerControlRef,
  rotationY: number,
) {
  const control = playerControlRef.current;
  control.manualInputEnabled = false;
  control.physicsLocked = true;
  control.desiredVelocity.x = 0;
  control.desiredVelocity.z = 0;
  control.targetRotationY = rotationY;
}

export function InteractionSystem({
  frameUpdatesRef,
  motionRef,
  playerControlRef,
  targets,
}: InteractionSystemProps) {
  const runtimeRef = useRef<InteractionRuntimeState | null>(null);
  const pressedKeysRef = useRef<Set<string> | null>(null);

  if (runtimeRef.current === null) {
    runtimeRef.current = createInteractionRuntimeState();
  }

  if (pressedKeysRef.current === null) {
    pressedKeysRef.current = new Set<string>();
  }

  const runtime = runtimeRef.current;
  const pressedKeys = pressedKeysRef.current;

  const updateInteractions = useCallback(
    (delta: number) => {
      const statusAtFrameStart = runtime.status;
      const interactRequested = runtime.interactRequested;
      const cancelRequested = runtime.cancelRequested;

      runtime.interactRequested = false;
      runtime.cancelRequested = false;

      const exitRequested = interactRequested || cancelRequested;

      if (statusAtFrameStart === "approaching" && exitRequested) {
        runtime.status = "idle";
        runtime.activeTarget = null;
        setPlayerControlIdle(playerControlRef);
        publishRuntimeState(runtime);
        return;
      }

      if (
        (statusAtFrameStart === "aligned" || statusAtFrameStart === "sitting") &&
        exitRequested
      ) {
        runtime.status = "exiting";
      }

      if (statusAtFrameStart === "idle") {
        const candidate = getNearestTarget(motionRef.current.position, targets);

        if (candidate !== runtime.candidate) {
          runtime.candidate = candidate;
          publishRuntimeState(runtime);
        }

        if (interactRequested && !cancelRequested && candidate !== null) {
          runtime.activeTarget = candidate;
          runtime.status = "approaching";
          setPlayerControlAlignment(
            playerControlRef,
            0,
            0,
            candidate.interactionRotationY,
          );
          publishRuntimeState(runtime);
          return;
        }

        setPlayerControlIdle(playerControlRef);
        return;
      }

      const activeTarget = runtime.activeTarget;
      if (activeTarget === null) {
        runtime.status = "idle";
        setPlayerControlIdle(playerControlRef);
        publishRuntimeState(runtime);
        return;
      }

      if (runtime.status === "aligned") {
        if (activeTarget.action.type === "sit") {
          runtime.status = "sitting";
          setPlayerControlSitting(
            playerControlRef,
            activeTarget.action.seatRotationY,
          );
          publishRuntimeState(runtime);
          return;
        }

        setPlayerControlAlignment(
          playerControlRef,
          0,
          0,
          activeTarget.interactionRotationY,
        );
        return;
      }

      if (runtime.status === "sitting") {
        if (activeTarget.action.type === "sit") {
          setPlayerControlSitting(
            playerControlRef,
            activeTarget.action.seatRotationY,
          );
          return;
        }

        runtime.status = "idle";
        runtime.activeTarget = null;
        setPlayerControlIdle(playerControlRef);
        publishRuntimeState(runtime);
        return;
      }

      const motion = motionRef.current;
      const dx = activeTarget.interactionPoint[0] - motion.position.x;
      const dy = activeTarget.interactionPoint[1] - motion.position.y;
      const dz = activeTarget.interactionPoint[2] - motion.position.z;
      const positionErrorSquared = dx * dx + dy * dy + dz * dz;
      const positionToleranceSquared =
        activeTarget.positionTolerance * activeTarget.positionTolerance;
      const positionAligned =
        positionErrorSquared <= positionToleranceSquared;

      if (runtime.status === "exiting") {
        let velocityX = 0;
        let velocityZ = 0;

        if (!positionAligned) {
          const planarDistance = Math.hypot(dx, dz);

          if (planarDistance > 0.0001) {
            const speed = Math.min(
              INTERACTION_EXIT_SPEED,
              planarDistance / Math.max(delta, 0.0001),
            );
            velocityX = (dx / planarDistance) * speed;
            velocityZ = (dz / planarDistance) * speed;
          }
        }

        setPlayerControlAlignment(
          playerControlRef,
          velocityX,
          velocityZ,
          activeTarget.interactionRotationY,
        );

        const rotationError = Math.abs(
          shortestAngleDelta(activeTarget.interactionRotationY, motion.rotationY),
        );
        const rotationAligned =
          rotationError <= activeTarget.rotationTolerance;

        if (positionAligned && rotationAligned) {
          runtime.status = "idle";
          runtime.activeTarget = null;
          setPlayerControlIdle(playerControlRef);
          publishRuntimeState(runtime);
        }

        return;
      }

      if (runtime.status === "approaching") {
        let velocityX = 0;
        let velocityZ = 0;
        let desiredRotationY = activeTarget.interactionRotationY;

        if (!positionAligned) {
          const planarDistance = Math.hypot(dx, dz);

          if (planarDistance > 0.0001) {
            const speed = Math.min(
              INTERACTION_APPROACH_SPEED,
              planarDistance / Math.max(delta, 0.0001),
            );
            velocityX = (dx / planarDistance) * speed;
            velocityZ = (dz / planarDistance) * speed;
            desiredRotationY = Math.atan2(dx, -dz);
          }
        }

        setPlayerControlAlignment(
          playerControlRef,
          velocityX,
          velocityZ,
          desiredRotationY,
        );

        const rotationError = Math.abs(
          shortestAngleDelta(activeTarget.interactionRotationY, motion.rotationY),
        );
        const rotationAligned =
          rotationError <= activeTarget.rotationTolerance;

        if (positionAligned && rotationAligned) {
          runtime.status = "aligned";
          setPlayerControlAlignment(
            playerControlRef,
            0,
            0,
            activeTarget.interactionRotationY,
          );
          publishRuntimeState(runtime);
        }
      } else {
        setPlayerControlAlignment(
          playerControlRef,
          0,
          0,
          activeTarget.interactionRotationY,
        );
      }
    },
    [motionRef, playerControlRef, runtime, targets],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((key === "e" || key === "escape") && isFormControl(event.target)) {
        return;
      }

      if (key !== "e" && key !== "escape") {
        return;
      }

      if (event.repeat || pressedKeys.has(key)) {
        return;
      }

      pressedKeys.add(key);
      event.preventDefault();

      if (key === "e") {
        runtime.interactRequested = true;
      } else {
        runtime.cancelRequested = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase());
    };

    const clearPressedKeys = () => {
      pressedKeys.clear();
      runtime.interactRequested = false;
      runtime.cancelRequested = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);
    document.addEventListener("visibilitychange", clearPressedKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPressedKeys);
      document.removeEventListener("visibilitychange", clearPressedKeys);
      clearPressedKeys();
    };
  }, [pressedKeys, runtime]);

  useLayoutEffect(() => {
    const updates = frameUpdatesRef.current;
    updates.interaction = updateInteractions;

    return () => {
      if (updates.interaction === updateInteractions) {
        updates.interaction = null;
      }
      setPlayerControlIdle(playerControlRef);
      resetInteractionDebugState();
    };
  }, [frameUpdatesRef, playerControlRef, updateInteractions]);

  return null;
}
