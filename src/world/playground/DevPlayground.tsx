"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

type Vector3Tuple = [number, number, number];

type DevStaticBoxProps = {
  name: string;
  position: Vector3Tuple;
  size: Vector3Tuple;
  color: string;
  rotation?: Vector3Tuple;
};

function DevStaticBox({
  name,
  position,
  size,
  color,
  rotation = [0, 0, 0],
}: DevStaticBoxProps) {
  return (
    <RigidBody
      name={name}
      type="fixed"
      colliders={false}
      position={position}
      rotation={rotation}
    >
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      <mesh name={`${name}_MESH`}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

const RAMP_ANGLE = Math.atan2(1.6, 5.2);

export function DevPlayground() {
  return (
    <group name="DEV_PHYSICS_PLAYGROUND">
      <DevStaticBox
        name="DEV_FLOOR"
        position={[0, -0.25, 0]}
        size={[18, 0.5, 14]}
        color="#3f4650"
      />

      <DevStaticBox
        name="DEV_WALL_NORTH"
        position={[0, 1, -6.8]}
        size={[18, 2, 0.4]}
        color="#59616c"
      />
      <DevStaticBox
        name="DEV_WALL_SOUTH"
        position={[0, 1, 6.8]}
        size={[18, 2, 0.4]}
        color="#59616c"
      />
      <DevStaticBox
        name="DEV_WALL_EAST"
        position={[8.8, 1, 0]}
        size={[0.4, 2, 13.6]}
        color="#59616c"
      />
      <DevStaticBox
        name="DEV_WALL_WEST"
        position={[-8.8, 1, 0]}
        size={[0.4, 2, 13.6]}
        color="#59616c"
      />

      <DevStaticBox
        name="DEV_RAMP"
        position={[-3, 0.65, 1.2]}
        size={[3.4, 0.3, 5.2]}
        rotation={[RAMP_ANGLE, 0, 0]}
        color="#68727f"
      />

      <DevStaticBox
        name="DEV_STEP"
        position={[2.8, 0.18, 0]}
        size={[2.2, 0.36, 1.8]}
        color="#7a8592"
      />

      <DevStaticBox
        name="DEV_BLOCK_CENTER"
        position={[4.6, 0.8, -2.5]}
        size={[1.8, 1.6, 1.8]}
        color="#8994a0"
      />
    </group>
  );
}
