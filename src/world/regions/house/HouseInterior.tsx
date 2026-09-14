"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { FieldGeometry, FieldInstances } from "../field/FieldMeshes";
import { makeSurface, organicEllipsoid } from "../field/field-geometry";
import {
  HOUSE_INTERIOR_DEPTH,
  HOUSE_INTERIOR_DOOR_POINT,
  HOUSE_INTERIOR_ENTRY_POINT,
  HOUSE_INTERIOR_WALL_HEIGHT,
  HOUSE_INTERIOR_WIDTH,
} from "./house-layout";
import { HouseBlockout } from "./HouseBlockout";
import { HouseRoom } from "./HouseRoom";
import { HOUSE_PALETTE as P } from "./house-palette";

const WINDOW_GLASS = makeSurface(
  [-0.9, -0.78, 0, 0.9, -0.78, 0, 0.9, 0.78, 0, -0.9, 0.78, 0],
  [0, 1, 2, 0, 2, 3],
);
const DOOR_STEP = organicEllipsoid(8, 5, 0.035);

function InteriorWindow({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group name="HOUSE_INTERIOR_WINDOW" position={position} rotation={[0, rotationY, 0]}>
      <HouseBlockout
        name="DEV_INTERIOR_WINDOW_FRAME"
        position={[0, 0, 0]}
        size={[2.25, 2.05, 0.14]}
        color={P.woodDark}
      />
      <mesh name="DEV_INTERIOR_WINDOW_GLASS" position={[0, 0, 0.1]}>
        <FieldGeometry data={WINDOW_GLASS} />
        <meshStandardMaterial color={P.glass} roughness={0.62} />
      </mesh>
      <HouseBlockout
        name="DEV_INTERIOR_WINDOW_MULLION_VERTICAL"
        position={[0, 0, 0.18]}
        size={[0.09, 1.82, 0.08]}
        color={P.wood}
      />
      <HouseBlockout
        name="DEV_INTERIOR_WINDOW_MULLION_HORIZONTAL"
        position={[0, -0.12, 0.18]}
        size={[2, 0.09, 0.08]}
        color={P.wood}
      />
    </group>
  );
}

function InteriorShell() {
  return (
    <group name="HOUSE_INTERIOR_SHELL_BLOCKOUT">
      <HouseBlockout
        name="HOUSE_INTERIOR_FLOOR"
        position={[0, -0.12, 0]}
        size={[HOUSE_INTERIOR_WIDTH, 0.24, HOUSE_INTERIOR_DEPTH]}
        color={P.floor}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_WALL_WEST"
        position={[-8.25, HOUSE_INTERIOR_WALL_HEIGHT / 2, 0]}
        size={[0.5, HOUSE_INTERIOR_WALL_HEIGHT, HOUSE_INTERIOR_DEPTH + 1]}
        color={P.wall}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_WALL_EAST"
        position={[8.25, HOUSE_INTERIOR_WALL_HEIGHT / 2, 0]}
        size={[0.5, HOUSE_INTERIOR_WALL_HEIGHT, HOUSE_INTERIOR_DEPTH + 1]}
        color={P.wall}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_WALL_NORTH"
        position={[0, HOUSE_INTERIOR_WALL_HEIGHT / 2, -6.25]}
        size={[HOUSE_INTERIOR_WIDTH + 0.5, HOUSE_INTERIOR_WALL_HEIGHT, 0.5]}
        color={P.wall}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_ENTRY_DOOR"
        position={[7.9, 2.08, 5.2]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[2.8, 4.16, 0.14]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_ENTRY_DOOR_PANEL"
        position={[7.78, 2.08, 5.2]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[2.38, 3.76, 0.06]}
        color={P.wood}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_TOP_BEAM_X"
        position={[0, 4.35, 0]}
        size={[16.5, 0.18, 0.22]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="HOUSE_INTERIOR_TOP_BEAM_Z"
        position={[0, 4.35, 0]}
        size={[0.22, 0.18, 12.5]}
        color={P.woodDark}
      />
      <InteriorWindow position={[-4.6, 2.55, 5.94]} />
      <InteriorWindow position={[4.45, 2.55, 5.94]} />
      <InteriorWindow position={[-2.8, 2.55, -5.94]} rotationY={Math.PI} />
      <HouseBlockout
        name="HOUSE_INTERIOR_ENTRY_RUG"
        position={[0, 0.018, 3.25]}
        size={[3.4, 0.04, 2.7]}
        color={P.floorRug}
        receiveShadow={false}
      />
    </group>
  );
}

function InteriorColliders() {
  return (
    <RigidBody
      name="HOUSE_INTERIOR_COLLIDERS"
      type="fixed"
      colliders={false}
    >
      <CuboidCollider name="HOUSE_INTERIOR_FLOOR_COLLIDER" args={[8, 0.12, 6]} position={[0, -0.12, 0]} />
      <CuboidCollider args={[0.25, 2.25, 6.5]} position={[-8.25, 2.25, 0]} />
      <CuboidCollider args={[0.25, 2.25, 6.5]} position={[8.25, 2.25, 0]} />
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

function InteriorLighting() {
  return (
    <group name="HOUSE_INTERIOR_DEV_LIGHTING">
      <ambientLight color="#efe5ce" intensity={1.35} />
      <hemisphereLight
        color="#f6e8d2"
        groundColor="#6f6254"
        intensity={1.25}
      />
      <directionalLight
        color="#ffe0b0"
        intensity={1.6}
        position={[3, 8, 4]}
      />
    </group>
  );
}

export function HouseInterior() {
  return (
    <group name="HOUSE_INTERIOR_REGION">
      <InteriorLighting />
      <InteriorColliders />
      <InteriorShell />
      <HouseRoom />
      <FieldInstances
        name="DEV_INTERIOR_DOOR_STEP"
        data={DOOR_STEP}
        instances={[
          {
            position: [HOUSE_INTERIOR_DOOR_POINT[0], 0.03, HOUSE_INTERIOR_DOOR_POINT[2]],
            scale: [1.6, 1, 0.55],
            color: P.floorRug,
          },
        ]}
      />
      <mesh
        name="DEV_HOUSE_EXIT_DOOR_INTERACTION_POINT"
        position={HOUSE_INTERIOR_ENTRY_POINT}
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={P.devMarker} wireframe />
      </mesh>
    </group>
  );
}
