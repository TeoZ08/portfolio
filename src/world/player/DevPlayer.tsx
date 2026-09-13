"use client";

import {
  CapsuleCollider,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import type { RapierCollider, RapierRigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import type { DevFrameUpdatesRef } from "@/world/DevFrameLoop";
import {
  publishPlayerDebugSnapshot,
  resetPlayerDebugState,
} from "@/world/player/player-state";
import { usePlayerInput } from "@/world/player/player-input";
import {
  DEV_PLAYER_START_POSITION,
  resetPlayerMotionState,
  type PlayerMotionRef,
} from "@/world/player/player-motion";

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
const DEBUG_PUBLISH_INTERVAL = 0.1;

type CharacterController = ReturnType<
  ReturnType<typeof useRapier>["world"]["createCharacterController"]
>;

type PlayerStepVector = {
  x: number;
  y: number;
  z: number;
};

type PlayerStepScratch = {
  desiredTranslation: PlayerStepVector;
  nextPosition: PlayerStepVector;
};

type DevPlayerProps = {
  frameUpdatesRef: DevFrameUpdatesRef;
  motionRef: PlayerMotionRef;
};

export function DevPlayer({ frameUpdatesRef, motionRef }: DevPlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const characterControllerRef = useRef<CharacterController | null>(null);
  const verticalVelocityRef = useRef(0);
  const groundedRef = useRef(false);
  const debugElapsedRef = useRef(0);
  const stepScratchRef = useRef<PlayerStepScratch>({
    desiredTranslation: { x: 0, y: 0, z: 0 },
    nextPosition: { x: 0, y: 0, z: 0 },
  });
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

      resetPlayerMotionState(motionRef.current);
      resetPlayerDebugState();
    };
  }, [motionRef, world]);

  const updatePlayer = useCallback(
    (delta: number) => {
      const body = bodyRef.current;
      const collider = colliderRef.current;
      const characterController = characterControllerRef.current;

      if (!body || !collider || !characterController) {
        return;
      }

      const input = readInput();
      let verticalVelocity = verticalVelocityRef.current;

      if (groundedRef.current && verticalVelocity < 0) {
        verticalVelocity = GROUND_STICK_VELOCITY;
      }

      verticalVelocity += GRAVITY * delta;

      const currentPosition = body.translation();
      const scratch = stepScratchRef.current;
      const desiredTranslation = scratch.desiredTranslation;

      desiredTranslation.x = input.x * PLAYER_SPEED * delta;
      desiredTranslation.y = verticalVelocity * delta;
      desiredTranslation.z = input.z * PLAYER_SPEED * delta;

      characterController.computeColliderMovement(collider, desiredTranslation);

      const correctedMovement = characterController.computedMovement();
      const nextPosition = scratch.nextPosition;

      nextPosition.x = currentPosition.x + correctedMovement.x;
      nextPosition.y = currentPosition.y + correctedMovement.y;
      nextPosition.z = currentPosition.z + correctedMovement.z;

      body.setNextKinematicTranslation(nextPosition);

      const grounded = characterController.computedGrounded();
      const moving =
        Math.hypot(correctedMovement.x, correctedMovement.z) > 0.0005;
      const inverseDelta = 1 / delta;
      const motion = motionRef.current;

      groundedRef.current = grounded;
      verticalVelocityRef.current = grounded && verticalVelocity < 0
        ? GROUND_STICK_VELOCITY
        : verticalVelocity;

      motion.position.x = nextPosition.x;
      motion.position.y = nextPosition.y;
      motion.position.z = nextPosition.z;
      motion.velocity.x = correctedMovement.x * inverseDelta;
      motion.velocity.y = correctedMovement.y * inverseDelta;
      motion.velocity.z = correctedMovement.z * inverseDelta;
      motion.grounded = grounded;
      motion.moving = moving;

      debugElapsedRef.current += delta;

      if (debugElapsedRef.current < DEBUG_PUBLISH_INTERVAL) {
        return;
      }

      debugElapsedRef.current = 0;

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
    },
    [motionRef, readInput],
  );

  useLayoutEffect(() => {
    const updates = frameUpdatesRef.current;
    updates.player = updatePlayer;

    return () => {
      if (updates.player === updatePlayer) {
        updates.player = null;
      }
    };
  }, [frameUpdatesRef, updatePlayer]);

  useLayoutEffect(() => {
    resetPlayerMotionState(motionRef.current);
  }, [motionRef]);

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
