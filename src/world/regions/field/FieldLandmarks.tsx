"use client";

import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { FieldGeometry, FieldInstances } from "./FieldMeshes";
import { makeLeafSurface, organicEllipsoid } from "./field-geometry";
import { TREE_CENTER, surfaceHeight } from "./field-layout";
import { makeTreeFoliage, makeTreeLeaves, makeTreeWood } from "./field-tree";

const WOOD = makeTreeWood();
const LEAF_CLUSTER = organicEllipsoid(8, 5, 0.18);
const FOLIAGE = makeTreeFoliage();
const LEAVES = makeTreeLeaves(FOLIAGE);
const LEAF = makeLeafSurface();

export function FieldLandmarks() {
  return (
    <group name="FIELD_LANDMARK_TREE_VISUAL_PROTOTYPE"
      position={[TREE_CENTER[0], surfaceHeight(...TREE_CENTER), TREE_CENTER[1]]}>
      <RigidBody type="fixed" colliders={false} name="FIELD_LANDMARK_TRUNK_COLLIDER">
        <CylinderCollider args={[1.65, 0.7]} position={[0, 1.65, 0]} />
      </RigidBody>
      <mesh name="FIELD_BRANCHING_TREE_WOOD" castShadow receiveShadow>
        <FieldGeometry data={WOOD} />
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <FieldInstances name="FIELD_LANDMARK_CANOPY_SHADOW_VOLUMES" data={LEAF_CLUSTER} instances={FOLIAGE} castShadow shadowOnly />
      <FieldInstances name="FIELD_LANDMARK_LEAVES" data={LEAF} instances={LEAVES} doubleSided sway={.09} />
    </group>
  );
}
