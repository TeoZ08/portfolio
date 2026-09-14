"use client";

import { CuboidCollider, RigidBody, TrimeshCollider } from "@react-three/rapier";
import { FieldGeometry } from "./FieldMeshes";
import { FieldMaterial } from "./FieldMaterial";
import { FIELD_TERRAIN_SURFACE } from "./field-surfaces";

export function FieldTerrain() {
  return (
    <group name="FIELD_TERRAIN_VISUAL_PROTOTYPE">
      <RigidBody name="FIELD_GROUND_COLLIDER" type="fixed" colliders={false}>
        {/* Render and collision share vertices; the player never walks on a hidden flat plane. */}
        <TrimeshCollider args={[FIELD_TERRAIN_SURFACE.positions, FIELD_TERRAIN_SURFACE.indices]} />
        <mesh name="FIELD_MEADOW_SURFACE" receiveShadow>
          <FieldGeometry data={FIELD_TERRAIN_SURFACE} />
          <FieldMaterial vertexColors />
        </mesh>
        <CuboidCollider args={[0.5, 2.5, 70]} position={[-55, 1, -35]} />
        <CuboidCollider args={[0.5, 2.5, 70]} position={[55, 1, -35]} />
        <CuboidCollider args={[55, 2.5, 0.5]} position={[0, 1, -105]} />
        <CuboidCollider args={[55, 2.5, 0.5]} position={[0, 1, 35]} />
      </RigidBody>
    </group>
  );
}
