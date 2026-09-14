"use client";

import {
  CapsuleCollider,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import type { RapierCollider, RapierRigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import type { DevFrameUpdatesRef } from "@/world/DevFrameLoop";
import type { CameraViewRef } from "@/world/camera/camera-types";
import {
  resetPlayerControlState,
  type PlayerControlRef,
} from "@/world/player/player-control";
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
const PLAYER_ROTATION_SPEED = Math.PI * 4;
const SITTING_VISUAL_SCALE_Y = 0.55;
const SITTING_VISUAL_OFFSET_Y = -0.18;

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

type PlayerRotationScratch = {
  x: number;
  y: number;
  z: number;
  w: number;
};

type DevVisualGroup = {
  scale: { y: number };
  position: { y: number };
};

type DevVisualMarker = {
  visible: boolean;
};

type DevPlayerProps = {
  solidColor?: string;
  cameraViewRef: CameraViewRef;
  frameUpdatesRef: DevFrameUpdatesRef;
  motionRef: PlayerMotionRef;
  playerControlRef: PlayerControlRef;
};

function shortestAngleDelta(target: number, current: number) {
  const fullTurn = Math.PI * 2;
  let delta = (target - current + Math.PI) % fullTurn;

  if (delta < 0) {
    delta += fullTurn;
  }

  return delta - Math.PI;
}

function moveTowardsAngle(current: number, target: number, maxDelta: number) {
  const delta = shortestAngleDelta(target, current);

  if (Math.abs(delta) <= maxDelta) {
    return target;
  }

  return current + Math.sign(delta) * maxDelta;
}

export function DevPlayer({
  solidColor,
  cameraViewRef,
  frameUpdatesRef,
  motionRef,
  playerControlRef,
}: DevPlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const visualGroupRef = useRef<DevVisualGroup>(null);
  const sittingMarkerRef = useRef<DevVisualMarker>(null);
  const sittingVisualRef = useRef(false);
  const characterControllerRef = useRef<CharacterController | null>(null);
  const verticalVelocityRef = useRef(0);
  const groundedRef = useRef(false);
  const debugElapsedRef = useRef(0);
  const stepScratchRef = useRef<PlayerStepScratch>({
    desiredTranslation: { x: 0, y: 0, z: 0 },
    nextPosition: { x: 0, y: 0, z: 0 },
  });
  const rotationScratchRef = useRef<PlayerRotationScratch>({
    x: 0,
    y: 0,
    z: 0,
    w: 1,
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

      const control = playerControlRef.current;
      const physicsLocked = control.physicsLocked;
      const input =
        control.manualInputEnabled && !physicsLocked ? readInput() : null;
      let verticalVelocity = verticalVelocityRef.current;

      if (physicsLocked) {
        verticalVelocity = 0;
      } else {
        if (groundedRef.current && verticalVelocity < 0) {
          verticalVelocity = GROUND_STICK_VELOCITY;
        }

        verticalVelocity += GRAVITY * delta;
      }

      const currentPosition = body.translation();
      const scratch = stepScratchRef.current;
      const desiredTranslation = scratch.desiredTranslation;
      const manualSideInput = input?.x ?? 0;
      const manualForwardInput = -(input?.z ?? 0);
      const cameraView = cameraViewRef.current;
      const manualVelocityX =
        manualForwardInput * cameraView.forwardX +
        manualSideInput * cameraView.rightX;
      const manualVelocityZ =
        manualForwardInput * cameraView.forwardZ +
        manualSideInput * cameraView.rightZ;
      const horizontalVelocityX = control.manualInputEnabled
        ? manualVelocityX * PLAYER_SPEED
        : control.desiredVelocity.x;
      const horizontalVelocityZ = control.manualInputEnabled
        ? manualVelocityZ * PLAYER_SPEED
        : control.desiredVelocity.z;

      desiredTranslation.x = physicsLocked ? 0 : horizontalVelocityX * delta;
      desiredTranslation.y = physicsLocked ? 0 : verticalVelocity * delta;
      desiredTranslation.z = physicsLocked ? 0 : horizontalVelocityZ * delta;

      characterController.computeColliderMovement(collider, desiredTranslation);

      const correctedMovement = characterController.computedMovement();
      const nextPosition = scratch.nextPosition;

      nextPosition.x = physicsLocked
        ? currentPosition.x
        : currentPosition.x + correctedMovement.x;
      nextPosition.y = physicsLocked
        ? currentPosition.y
        : currentPosition.y + correctedMovement.y;
      nextPosition.z = physicsLocked
        ? currentPosition.z
        : currentPosition.z + correctedMovement.z;

      body.setNextKinematicTranslation(nextPosition);

      const computedGrounded = characterController.computedGrounded();
      const grounded = physicsLocked
        ? groundedRef.current || computedGrounded
        : computedGrounded;
      const horizontalMovement = Math.hypot(
        correctedMovement.x,
        correctedMovement.z,
      );
      const moving = physicsLocked
        ? false
        : horizontalMovement > 0.0005;
      const inverseDelta = 1 / delta;
      const motion = motionRef.current;
      const rotationTargetY =
        control.targetRotationY === null && moving
          ? Math.atan2(correctedMovement.x, -correctedMovement.z)
          : control.targetRotationY;
      const nextRotationY = rotationTargetY === null
        ? motion.rotationY
        : moveTowardsAngle(
            motion.rotationY,
            rotationTargetY,
            PLAYER_ROTATION_SPEED * delta,
          );
      const rotation = rotationScratchRef.current;

      rotation.x = 0;
      rotation.y = Math.sin(nextRotationY / 2);
      rotation.z = 0;
      rotation.w = Math.cos(nextRotationY / 2);
      body.setNextKinematicRotation(rotation);

      groundedRef.current = grounded;
      verticalVelocityRef.current = physicsLocked
        ? 0
        : grounded && verticalVelocity < 0
          ? GROUND_STICK_VELOCITY
          : verticalVelocity;

      motion.position.x = nextPosition.x;
      motion.position.y = nextPosition.y;
      motion.position.z = nextPosition.z;
      motion.velocity.x = physicsLocked ? 0 : correctedMovement.x * inverseDelta;
      motion.velocity.y = physicsLocked ? 0 : correctedMovement.y * inverseDelta;
      motion.velocity.z = physicsLocked ? 0 : correctedMovement.z * inverseDelta;
      motion.rotationY = nextRotationY;
      motion.grounded = grounded;
      motion.moving = moving;

      if (sittingVisualRef.current !== physicsLocked) {
        sittingVisualRef.current = physicsLocked;

        const visualGroup = visualGroupRef.current;
        if (visualGroup) {
          visualGroup.scale.y = physicsLocked ? SITTING_VISUAL_SCALE_Y : 1;
          visualGroup.position.y = physicsLocked ? SITTING_VISUAL_OFFSET_Y : 0;
        }

        if (sittingMarkerRef.current) {
          sittingMarkerRef.current.visible = physicsLocked;
        }
      }

      debugElapsedRef.current += delta;

      if (debugElapsedRef.current < DEBUG_PUBLISH_INTERVAL) {
        return;
      }

      debugElapsedRef.current = 0;

      publishPlayerDebugSnapshot({
        position: [nextPosition.x, nextPosition.y, nextPosition.z],
        velocity: [
          physicsLocked ? 0 : correctedMovement.x * inverseDelta,
          physicsLocked ? 0 : correctedMovement.y * inverseDelta,
          physicsLocked ? 0 : correctedMovement.z * inverseDelta,
        ],
        grounded,
        moving,
      });
    },
    [cameraViewRef, motionRef, playerControlRef, readInput],
  );

  useLayoutEffect(() => {
    const updates = frameUpdatesRef.current;
    updates.player = updatePlayer;

    return () => {
      if (updates.player === updatePlayer) {
        updates.player = null;
      }
      resetPlayerControlState(playerControlRef.current);
    };
  }, [frameUpdatesRef, playerControlRef, updatePlayer]);

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
      enabledRotations={[false, true, false]}
    >
      <CapsuleCollider
        ref={colliderRef}
        args={[PLAYER_CAPSULE_HALF_HEIGHT, PLAYER_CAPSULE_RADIUS]}
      />
      <group ref={visualGroupRef} name="DEV_PLAYER_VISUAL">
        <mesh name="DEV_PLAYER_CAPSULE_MESH" castShadow={!!solidColor} receiveShadow={!!solidColor}>
          <capsuleGeometry
            args={[PLAYER_CAPSULE_RADIUS, PLAYER_CAPSULE_HALF_HEIGHT * 2, 8, 16]}
          />
          {solidColor ? (
            <meshStandardMaterial color={solidColor} roughness={0.92} />
          ) : (
            <meshBasicMaterial color="#f59e0b" wireframe />
          )}
        </mesh>
        <mesh name="DEV_PLAYER_FORWARD_MARKER" position={[0, 0, -0.42]}>
          <boxGeometry args={[0.12, 0.12, 0.18]} />
          <meshBasicMaterial color="#fff7ed" />
        </mesh>
        <mesh
          ref={sittingMarkerRef}
          name="DEV_PLAYER_SITTING_MARKER"
          position={[0, -0.42, 0]}
          visible={false}
        >
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshBasicMaterial color="#fff7ed" wireframe />
        </mesh>
      </group>
    </RigidBody>
  );
}
