"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

const GENTLE_RISE_ANGLE = Math.atan2(0.55, 34);

export function FieldTerrain() {
  return (
    <group name="FIELD_TERRAIN_BLOCKOUT">
      <RigidBody
        name="FIELD_GROUND_COLLIDER"
        type="fixed"
        colliders={false}
        position={[0, -0.35, -35]}
      >
        <CuboidCollider args={[55, 0.35, 70]} />
        <mesh name="DEV_FIELD_GROUND" position={[0, 0, 0]}>
          <boxGeometry args={[110, 0.7, 140]} />
          <meshBasicMaterial color="#60745f" />
        </mesh>
      </RigidBody>

      <RigidBody
        name="FIELD_GENTLE_RISE_COLLIDER"
        type="fixed"
        colliders={false}
        position={[30, 0.25, -38]}
        rotation={[GENTLE_RISE_ANGLE, 0, 0]}
      >
        <CuboidCollider args={[11, 0.15, 17]} />
        <mesh name="DEV_FIELD_GENTLE_RISE">
          <boxGeometry args={[22, 0.3, 34]} />
          <meshBasicMaterial color="#6f8064" />
        </mesh>
      </RigidBody>

      <mesh
        name="DEV_FUTURE_VEGETATION_AREA_WEST"
        position={[24, 0.025, -28]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[10, 20]} />
        <meshBasicMaterial color="#566c57" />
      </mesh>
      <mesh
        name="DEV_FUTURE_VEGETATION_AREA_SOUTH"
        position={[20, 0.025, -67]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[12, 20]} />
        <meshBasicMaterial color="#566c57" />
      </mesh>
    </group>
  );
}
