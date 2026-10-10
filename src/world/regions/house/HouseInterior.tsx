"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useExperienceState } from "@/systems/experience-state";

import {
  HOUSE_BOOKSHELF_INTERACTION_POINT,
  HOUSE_COMPUTER_INTERACTION_POINT,
  HOUSE_ENTRY_BENCH_INTERACTION_POINT,
  HOUSE_INTERIOR_ENTRY_POINT,
  HOUSE_REFERENCE_BOARD_INTERACTION_POINT,
} from "./house-layout";
import { HOUSE_FLOOR } from "./house-safety";
import { HouseRoom } from "./HouseRoom";
import { HouseShell } from "./HouseShell";
import { HouseLighting } from "./HouseLighting";
import { HOUSE_SCALE } from "../world-scale";
import { HOUSE_PALETTE as P } from "./house-palette";

function InteriorColliders() {
  return (
    <RigidBody
      name="HOUSE_INTERIOR_COLLIDERS"
      type="fixed"
      colliders={false}
    >
      <CuboidCollider name="HOUSE_INTERIOR_FLOOR_COLLIDER" args={[HOUSE_FLOOR.halfWidth, HOUSE_FLOOR.halfThickness, HOUSE_FLOOR.halfDepth]} position={[0, -HOUSE_FLOOR.halfThickness, HOUSE_FLOOR.centerZ]} />
      <CuboidCollider args={[0.25, 2.25, 9]} position={[-8.25, 2.25, 2.5]} />
      <CuboidCollider args={[0.25, 2.25, 9]} position={[8.25, 2.25, 2.5]} />
      <CuboidCollider name="HOUSE_VISIBLE_RECESS_BACK_WALL" args={[8.25, 2.25, .15]} position={[0, 2.25, 11.5]} />
      <CuboidCollider args={[8.25, 2.25, 0.25]} position={[0, 2.25, -6.25]} />
      <CuboidCollider args={[2.8, 2.25, 0.25]} position={[-5.2, 2.25, 6.25]} />
      <CuboidCollider args={[2.8, 2.25, 0.25]} position={[5.2, 2.25, 6.25]} />
      <CuboidCollider args={[1.7, 0.45, 2.25]} position={[-4.4, 0.45, -3.25]} />
      <CuboidCollider args={[2.15, 0.7, 0.58]} position={[4.25, 0.7, -5.18]} />
      <CuboidCollider args={[0.65, 0.45, 0.65]} position={[4.25, 0.45, -3.55]} />
      <CuboidCollider args={[0.6, 1.65, 1.6]} position={[7.1, 1.65, -2.15]} />
      <CuboidCollider args={[1.55, 0.4, 0.45]} position={[-5.05, 0.4, 3.55]} />
    </RigidBody>
  );
}

export function HouseInterior() {
  const showHelpers = useExperienceState(state => state.debugVisible);
  return (
    <group name="HOUSE_INTERIOR_VISUAL_PROTOTYPE">
      <HouseLighting />
      <InteriorColliders />
      <HouseShell />
      <HouseRoom />
      <group scale={1 / HOUSE_SCALE}>
        <mesh name="DEV_HOUSE_EXIT_DOOR_INTERACTION_POINT" position={HOUSE_INTERIOR_ENTRY_POINT} visible={showHelpers}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={P.devMarker} wireframe />
        </mesh>
        <mesh name="DEV_HOUSE_COMPUTER_INTERACTION_POINT" position={HOUSE_COMPUTER_INTERACTION_POINT} visible={showHelpers}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={P.devMarker} wireframe />
        </mesh>
        {[
          ["DEV_HOUSE_ENTRY_BENCH_INTERACTION_POINT", HOUSE_ENTRY_BENCH_INTERACTION_POINT],
          ["DEV_HOUSE_REFERENCE_BOARD_INTERACTION_POINT", HOUSE_REFERENCE_BOARD_INTERACTION_POINT],
          ["DEV_HOUSE_BOOKSHELF_INTERACTION_POINT", HOUSE_BOOKSHELF_INTERACTION_POINT],
        ].map(([name, position]) => (
          <mesh key={name as string} name={name as string} position={position as readonly [number, number, number]} visible={showHelpers}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={P.devMarker} wireframe />
          </mesh>
        ))}
      </group>
    </group>
  );
}
