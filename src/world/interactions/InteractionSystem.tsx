"use client";

import { findWorldDestination } from "@/world/regions/field/world-destinations";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import type {
  CameraResyncRef,
  DevFrameUpdatesRef,
} from "@/world/DevFrameLoop";
import { CAMERA_RECENTER_EVENT, useExperienceState } from "@/systems/experience-state";
import type { PlayerControlRef } from "@/world/player/player-control";
import type { PlayerMotionRef } from "@/world/player/player-motion";
import {
  publishInteractionDebugSnapshot,
  resetInteractionDebugState,
} from "./interaction-state";
import type {
  InteractionDestination,
  InteractionStatus,
  InteractionTarget,
} from "./interaction-types";

const INTERACTION_APPROACH_SPEED = .8;
const INTERACTION_EXIT_SPEED = .8;
const TRANSITION_REPOSITION_DELAY = 0.16;
const TRANSITION_DURATION = 0.34;

type InteractionRuntimeState = {
  status: InteractionStatus;
  candidate: InteractionTarget | null;
  activeTarget: InteractionTarget | null;
  interactRequested: boolean;
  cancelRequested: boolean;
  transitionElapsed: number;
  transitionQueued: boolean;
};

type InteractionSystemProps = {
  frameUpdatesRef: DevFrameUpdatesRef;
  cameraResyncRef: CameraResyncRef;
  motionRef: PlayerMotionRef;
  onTransitionComplete: () => void;
  onTransitionStart: (destinationRegion: InteractionDestination) => void;
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
    transitionElapsed: 0,
    transitionQueued: false,
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
  control.pose = null;
  control.manualInputEnabled = true;
  control.physicsLocked = false;
  control.desiredVelocity.x = 0;
  control.desiredVelocity.z = 0;
  control.targetRotationY = null;
  control.transitionRequest = null;
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

function setPlayerControlLocked(
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

function setPlayerControlUsing(
  playerControlRef: PlayerControlRef,
  rotationY: number,
  seated: boolean,
) {
  if (seated) {
    setPlayerControlLocked(playerControlRef, rotationY);
    return;
  }

  setPlayerControlAlignment(playerControlRef, 0, 0, rotationY);
}

export function InteractionSystem({
  cameraResyncRef,
  frameUpdatesRef,
  motionRef,
  onTransitionComplete,
  onTransitionStart,
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
        runtime.transitionElapsed = 0;
        runtime.transitionQueued = false;
        setPlayerControlIdle(playerControlRef);
        publishRuntimeState(runtime);
        return;
      }

      if (
        (statusAtFrameStart === "aligned" ||
          statusAtFrameStart === "sitting" ||
          statusAtFrameStart === "using") &&
        exitRequested
      ) {
        runtime.status = "exiting";
        runtime.transitionQueued = false;
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
          runtime.transitionElapsed = 0;
          runtime.transitionQueued = false;
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

      if (runtime.status === "entering") {
        const action = activeTarget.action;

        if (action.type !== "enter") {
          runtime.status = "idle";
          runtime.activeTarget = null;
          runtime.transitionElapsed = 0;
          runtime.transitionQueued = false;
          setPlayerControlIdle(playerControlRef);
          onTransitionComplete();
          publishRuntimeState(runtime);
          return;
        }

        runtime.transitionElapsed += delta;
        setPlayerControlAlignment(
          playerControlRef,
          0,
          0,
          runtime.transitionQueued
            ? action.destinationRotationY
            : activeTarget.interactionRotationY,
        );

        if (
          !runtime.transitionQueued &&
          runtime.transitionElapsed >= TRANSITION_REPOSITION_DELAY
        ) {
          playerControlRef.current.transitionRequest = {
            position: action.destinationPoint,
            rotationY: action.destinationRotationY,
          };
          cameraResyncRef.current.active = true;
          cameraResyncRef.current.stage = 1;
          runtime.transitionQueued = true;
        }

        if (
          runtime.transitionQueued &&
          playerControlRef.current.transitionRequest === null &&
          runtime.transitionElapsed >= TRANSITION_DURATION
        ) {
          runtime.status = "idle";
          runtime.activeTarget = null;
          runtime.transitionElapsed = 0;
          runtime.transitionQueued = false;
          setPlayerControlIdle(playerControlRef);
          onTransitionComplete();
          publishRuntimeState(runtime);
        }

        return;
      }

      if (runtime.status === "aligned") {
        if (activeTarget.action.type === "enter") {
          runtime.status = "entering";
          runtime.transitionElapsed = 0;
          runtime.transitionQueued = false;
          setPlayerControlAlignment(
            playerControlRef,
            0,
            0,
            activeTarget.interactionRotationY,
          );
          onTransitionStart(activeTarget.action.destinationRegion);
          publishRuntimeState(runtime);
          return;
        }

        if (activeTarget.action.type === "sit") {
          setPlayerControlLocked(
            playerControlRef,
            activeTarget.action.seatRotationY,
          );

          if (!runtime.transitionQueued) {
            playerControlRef.current.transitionRequest = {
              position: activeTarget.action.seatPoint,
              rotationY: activeTarget.action.seatRotationY,
            };
            runtime.transitionQueued = true;
            return;
          }

          if (playerControlRef.current.transitionRequest !== null) {
            return;
          }

          runtime.status = "sitting";
          runtime.transitionQueued = false;
          publishRuntimeState(runtime);
          return;
        }

        if (activeTarget.action.type === "use") {
          setPlayerControlUsing(
            playerControlRef,
            activeTarget.action.useRotationY,
            activeTarget.action.seated ?? false,
          );
          playerControlRef.current.pose = activeTarget.id === "DOJO_PRACTICE" ? "practice" : null;
          if (activeTarget.action.seated && activeTarget.action.seatPoint) {
            if (!runtime.transitionQueued) {
              playerControlRef.current.transitionRequest = {
                position: activeTarget.action.seatPoint,
                rotationY: activeTarget.action.useRotationY,
              };
              runtime.transitionQueued = true;
              return;
            }
            if (playerControlRef.current.transitionRequest !== null) return;
          }
          runtime.status = "using";
          runtime.transitionQueued = false;
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

      if (runtime.status === "sitting" || runtime.status === "using") {
        if (
          runtime.status === "sitting" &&
          activeTarget.action.type === "sit"
        ) {
          setPlayerControlLocked(
            playerControlRef,
            activeTarget.action.seatRotationY,
          );
          return;
        }

        if (
          runtime.status === "using" &&
          activeTarget.action.type === "use"
        ) {
          setPlayerControlUsing(
            playerControlRef,
            activeTarget.action.useRotationY,
            activeTarget.action.seated ?? false,
          );
          playerControlRef.current.pose = activeTarget.id === "DOJO_PRACTICE" ? "practice" : null;
          return;
        }

        runtime.status = "idle";
        runtime.activeTarget = null;
        runtime.transitionElapsed = 0;
        runtime.transitionQueued = false;
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
        if (activeTarget.action.type === "sit" ||
          (activeTarget.action.type === "use" && activeTarget.action.seated && activeTarget.action.seatPoint)) {
          setPlayerControlLocked(
            playerControlRef,
            activeTarget.action.type === "sit" ? activeTarget.action.seatRotationY : activeTarget.action.useRotationY,
          );

          if (!runtime.transitionQueued) {
            playerControlRef.current.transitionRequest = {
              position: activeTarget.interactionPoint,
              rotationY: activeTarget.interactionRotationY,
            };
            runtime.transitionQueued = true;
            return;
          }

          if (playerControlRef.current.transitionRequest === null) {
            runtime.status = "idle";
            runtime.activeTarget = null;
            runtime.transitionQueued = false;
            setPlayerControlIdle(playerControlRef);
            publishRuntimeState(runtime);
          }

          return;
        }

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
            desiredRotationY = Math.atan2(-dx, -dz);
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
    [
      cameraResyncRef,
      motionRef,
      onTransitionComplete,
      onTransitionStart,
      playerControlRef,
      runtime,
      targets,
    ],
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

      // The HTML device layer owns its own Escape navigation while it is
      // open. Do not let the world interaction state consume that key too.
      if (useExperienceState.getState().deviceActive || useExperienceState.getState().overlay !== null) {
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

    const travelFromMap = (event: Event) => {
      if (runtime.status !== "idle") return;
      const destination = findWorldDestination((event as CustomEvent).detail);
      if (!destination) return;
      window.dispatchEvent(new CustomEvent(CAMERA_RECENTER_EVENT));
      runtime.activeTarget = {
        ...destination,
        id: "MAP_TRAVEL",
        action: { type: "enter", destinationRegion: "FIELD", destinationPoint: destination.interactionPoint,
          destinationRotationY: destination.interactionRotationY },
      };
      runtime.status = "aligned";
      runtime.interactRequested = false;
      runtime.cancelRequested = false;
      runtime.transitionQueued = false;
      runtime.transitionElapsed = 0;
      publishRuntimeState(runtime);
    };
    window.addEventListener("world:travel", travelFromMap);
    const interactFromButton = () => { runtime.interactRequested = true; };
    const cancelFromButton = () => { runtime.cancelRequested = true; };
    window.addEventListener("world:interact", interactFromButton);
    window.addEventListener("world:cancel", cancelFromButton);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);
    document.addEventListener("visibilitychange", clearPressedKeys);

    return () => {
      window.removeEventListener("world:travel", travelFromMap);
      window.removeEventListener("world:interact", interactFromButton);
      window.removeEventListener("world:cancel", cancelFromButton);
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
      resetInteractionDebugState();
    };
  }, [frameUpdatesRef, updateInteractions]);

  return null;
}
