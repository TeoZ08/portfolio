"use client";

import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import type { RapierCollider, RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";

import {
  publishPlayerDebugSnapshot,
  resetPlayerDebugState,
} from "@/world/player/player-state";
import { usePlayerInput } from "@/world/player/player-input";

const DEV_PLAYER_START_POSITION: [number, number, number] = [0, 0.9, 4.5];
const PLAYER_CAPSULE_HALF_HEIGHT = 0.5;
const PLAYER_CAPSULE_RADIUS = 0.35;
const PLAYER_SPEED = 4;
const GRAVITY = -20;
const GROUND_STICK_VELOCITY = -2;
const CHARACTER_CONTROLLER_OFFSET = 0.01;
const MAX_SLOPE_CLIMB_ANGLE = Math.PI / 4;
const MIN_SLOPE_SLIDE_ANGLE = Math.PI / 3;
const MAX_STEP_HEIGHT = 0.42;
const MIN_STEP_WIDTH = 0.25;
const SNAP_TO_GROUND_DISTANCE = 0.2;
const MAX_FRAME_DELTA = 0.1;
const DEBUG_PUBLISH_INTERVAL = 0.1;

type CharacterController = ReturnType<
  ReturnType<typeof useRapier>["world"]["createCharacterController"]
>;

export function DevPlayer() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const characterControllerRef = useRef<CharacterController | null>(null);
  const verticalVelocityRef = useRef(0);
  const groundedRef = useRef(false);
  const debugElapsedRef = useRef(0);
  const readInput = usePlayerInput();
  const { world } = useRapier();

  useEffect(() => {
    const characterController = world.createCharacterController(
      CHARACTER_CONTROLLER_OFFSET,
    );

    characterController.setUp({ x: 0, y: 1, z: 0 });
    characterController.setSlideEnabled(true);
    characterController.setMaxSlopeClimbAngle(MAX_SLOPE_CLIMB_ANGLE);
    characterController.setMinSlopeSlideAngle(MIN_SLOPE_SLIDE_ANGLE);
    characterController.enableAutostep(
      MAX_STEP_HEIGHT,
      MIN_STEP_WIDTH,
      false,
    );
    characterController.enableSnapToGround(SNAP_TO_GROUND_DISTANCE);
    characterControllerRef.current = characterController;

    const initialPosition = bodyRef.current?.translation();

    if (initialPosition) {
      publishPlayerDebugSnapshot({
        position: [initialPosition.x, initialPosition.y, initialPosition.z],
        velocity: [0, 0, 0],
        grounded: false,
        moving: false,
      });
    }

    let removed = false;

    return () => {
      if (!removed) {
        removed = true;
        world.removeCharacterController(characterController);
      }

      if (characterControllerRef.current === characterController) {
        characterControllerRef.current = null;
      }

      resetPlayerDebugState();
    };
  }, [world]);

  useFrame((_, rawDelta) => {
    const body = bodyRef.current;
    const collider = colliderRef.current;
    const characterController = characterControllerRef.current;

    if (!body || !collider || !characterController) {
      return;
    }

    const delta = Math.min(rawDelta, MAX_FRAME_DELTA);

    if (delta <= 0) {
      return;
    }

    const input = readInput();
    let verticalVelocity = verticalVelocityRef.current;

    if (groundedRef.current && verticalVelocity < 0) {
      verticalVelocity = GROUND_STICK_VELOCITY;
    }

    verticalVelocity += GRAVITY * delta;

    const currentPosition = body.translation();
    const desiredTranslation = {
      x: input.x * PLAYER_SPEED * delta,
      y: verticalVelocity * delta,
      z: input.z * PLAYER_SPEED * delta,
    };

    characterController.computeColliderMovement(collider, desiredTranslation);

    const correctedMovement = characterController.computedMovement();
    const nextPosition = {
      x: currentPosition.x + correctedMovement.x,
      y: currentPosition.y + correctedMovement.y,
      z: currentPosition.z + correctedMovement.z,
    };

    body.setNextKinematicTranslation(nextPosition);

    const grounded = characterController.computedGrounded();
    const moving =
      Math.hypot(correctedMovement.x, correctedMovement.z) > 0.0005;

    groundedRef.current = grounded;
    verticalVelocityRef.current = grounded && verticalVelocity < 0
      ? GROUND_STICK_VELOCITY
      : verticalVelocity;

    debugElapsedRef.current += delta;

    if (debugElapsedRef.current < DEBUG_PUBLISH_INTERVAL) {
      return;
    }

    debugElapsedRef.current = 0;
    const inverseDelta = 1 / delta;

    publishPlayerDebugSnapshot({
      position: [nextPosition.x, nextPosition.y, nextPosition.z],
      velocity: [
        correctedMovement.x * inverseDelta,
        correctedMovement.y * inverseDelta,
        correctedMovement.z * inverseDelta,
      ],
      grounded,
      moving,
    });
  });

  return (
    <RigidBody
      ref={bodyRef}
      name="DEV_PLAYER_CAPSULE"
      type="kinematicPosition"
      colliders={false}
      position={DEV_PLAYER_START_POSITION}
      lockRotations
    >
      <CapsuleCollider
        ref={colliderRef}
        args={[PLAYER_CAPSULE_HALF_HEIGHT, PLAYER_CAPSULE_RADIUS]}
      />
      <mesh name="DEV_PLAYER_CAPSULE_MESH">
        <capsuleGeometry
          args={[PLAYER_CAPSULE_RADIUS, PLAYER_CAPSULE_HALF_HEIGHT * 2, 8, 16]}
        />
        <meshBasicMaterial color="#f59e0b" wireframe />
      </mesh>
    </RigidBody>
  );
}
