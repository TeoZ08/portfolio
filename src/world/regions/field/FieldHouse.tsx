"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

const HOUSE_POSITION = [-16, 3.5, -38] as const;
const HOUSE_SIZE = [16, 7, 12] as const;
const HOUSE_FRONT_Z = HOUSE_POSITION[2] + HOUSE_SIZE[2] / 2 + 0.08;

export function FieldHouse() {
  return (
    <group name="DEV_PLACEHOLDER_HOUSE">
      <RigidBody
        name="DEV_PLACEHOLDER_HOUSE_COLLIDER"
        type="fixed"
        colliders={false}
        position={HOUSE_POSITION}
      >
        <CuboidCollider
          args={[HOUSE_SIZE[0] / 2, HOUSE_SIZE[1] / 2, HOUSE_SIZE[2] / 2]}
        />
        <mesh name="DEV_PLACEHOLDER_HOUSE_BODY">
          <boxGeometry args={HOUSE_SIZE} />
          <meshBasicMaterial color="#b1a18c" />
        </mesh>
      </RigidBody>

      <mesh
        name="DEV_PLACEHOLDER_HOUSE_ROOF"
        position={[HOUSE_POSITION[0], 8.4, HOUSE_POSITION[2]]}
      >
        <coneGeometry args={[10, 2.8, 4]} />
        <meshBasicMaterial color="#756d64" />
      </mesh>

      <mesh
        name="DEV_FUTURE_HOUSE_DOOR"
        position={[HOUSE_POSITION[0], 1.35, HOUSE_FRONT_Z]}
      >
        <boxGeometry args={[1.6, 2.7, 0.08]} />
        <meshBasicMaterial color="#4f514f" />
      </mesh>

      <mesh
        name="DEV_FUTURE_HOUSE_WINDOW_FRONT_LEFT"
        position={[-20.5, 3.8, HOUSE_FRONT_Z]}
      >
        <boxGeometry args={[2.6, 1.5, 0.08]} />
        <meshBasicMaterial color="#6f858a" wireframe />
      </mesh>
      <mesh
        name="DEV_FUTURE_HOUSE_WINDOW_FRONT_RIGHT"
        position={[-11.5, 3.8, HOUSE_FRONT_Z]}
      >
        <boxGeometry args={[2.6, 1.5, 0.08]} />
        <meshBasicMaterial color="#6f858a" wireframe />
      </mesh>
      <mesh
        name="DEV_FUTURE_HOUSE_WINDOW_SIDE"
        position={[-24.08, 3.8, HOUSE_POSITION[2]]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[2.6, 1.5, 0.08]} />
        <meshBasicMaterial color="#6f858a" wireframe />
      </mesh>
    </group>
  );
}
