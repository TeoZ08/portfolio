"use client";

import { CuboidCollider, RigidBody, TrimeshCollider } from "@react-three/rapier";
import { FieldGeometry } from "./FieldMeshes";
import { FieldMaterial } from "./FieldMaterial";
import { FIELD_BOUNDS as B } from "./field-layout";
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
        <CuboidCollider args={[.5,2.5,(B.maxZ-B.minZ)/2]} position={[B.minX,1,(B.minZ+B.maxZ)/2]} />
        <CuboidCollider args={[.5,2.5,(B.maxZ-B.minZ)/2]} position={[B.maxX,1,(B.minZ+B.maxZ)/2]} />
        <CuboidCollider args={[(B.maxX-B.minX)/2,2.5,.5]} position={[(B.minX+B.maxX)/2,1,B.minZ]} />
        <CuboidCollider args={[(B.maxX-B.minX)/2,2.5,.5]} position={[(B.minX+B.maxX)/2,1,B.maxZ]} />
      </RigidBody>
    </group>
  );
}
