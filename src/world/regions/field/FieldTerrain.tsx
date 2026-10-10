"use client";

import { CuboidCollider, RigidBody, TrimeshCollider } from "@react-three/rapier";
import { RegionalSoilMaterial } from "./RegionalSoilMaterial";
import { soilWeights } from "./terrain-biomes";
import { FIELD_BOUNDS as B } from "./field-layout";
import { FIELD_TERRAIN_SURFACE } from "./field-surfaces";

const SOIL_WEIGHTS = new Float32Array(Array.from({length:FIELD_TERRAIN_SURFACE.positions.length/3},(_,i)=>soilWeights(FIELD_TERRAIN_SURFACE.positions[i*3],FIELD_TERRAIN_SURFACE.positions[i*3+2])).flat());

export function FieldTerrain() {
  return (
    <group name="FIELD_TERRAIN_VISUAL_PROTOTYPE">
      <RigidBody name="FIELD_GROUND_COLLIDER" type="fixed" colliders={false}>
        {/* Render and collision share vertices; the player never walks on a hidden flat plane. */}
        <TrimeshCollider args={[FIELD_TERRAIN_SURFACE.positions, FIELD_TERRAIN_SURFACE.indices]} />
        <mesh name="FIELD_MEADOW_SURFACE" receiveShadow>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[FIELD_TERRAIN_SURFACE.positions,3]} />
            <bufferAttribute attach="attributes-normal" args={[FIELD_TERRAIN_SURFACE.normals,3]} />
            <bufferAttribute attach="attributes-color" args={[FIELD_TERRAIN_SURFACE.colors!,3]} />
            <bufferAttribute attach="attributes-soilWeights" args={[SOIL_WEIGHTS,3]} />
            <bufferAttribute attach="index" args={[FIELD_TERRAIN_SURFACE.indices,1]} />
          </bufferGeometry>
          <RegionalSoilMaterial />
        </mesh>
        <CuboidCollider args={[.5,2.5,(B.maxZ-B.minZ)/2]} position={[B.minX,1,(B.minZ+B.maxZ)/2]} />
        <CuboidCollider args={[.5,2.5,(B.maxZ-B.minZ)/2]} position={[B.maxX,1,(B.minZ+B.maxZ)/2]} />
        <CuboidCollider args={[(B.maxX-B.minX)/2,2.5,.5]} position={[(B.minX+B.maxX)/2,1,B.minZ]} />
        <CuboidCollider args={[(B.maxX-B.minX)/2,2.5,.5]} position={[(B.minX+B.maxX)/2,1,B.maxZ]} />
      </RigidBody>
    </group>
  );
}
