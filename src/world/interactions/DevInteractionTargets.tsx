"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { DEV_INTERACTION_FIXTURES } from "./dev-interaction-targets";

export function DevInteractionTargets() {
  return (
    <group name="DEV_INTERACTION_TARGETS">
      {DEV_INTERACTION_FIXTURES.map((fixture) => {
        const { target } = fixture;
        const [width, height, depth] = fixture.objectSize;

        return (
          <group key={target.id} name={`${target.id}_GROUP`}>
            <RigidBody
              name={`${target.id}_BODY`}
              type="fixed"
              colliders={false}
              position={fixture.objectPosition}
              rotation={[0, fixture.objectRotationY, 0]}
            >
              <CuboidCollider args={[width / 2, height / 2, depth / 2]} />
              <mesh name={`${target.id}_MESH`}>
                <boxGeometry args={fixture.objectSize} />
                <meshBasicMaterial color="#737b86" wireframe />
              </mesh>
            </RigidBody>

            <mesh
              name={`${target.id}_INTERACTION_POINT`}
              position={target.interactionPoint}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#f4f4f4" wireframe />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
