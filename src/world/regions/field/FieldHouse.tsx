"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useExperienceState } from "@/systems/experience-state";
import { FieldGeometry, FieldInstances } from "./FieldMeshes";
import { FieldMaterial } from "./FieldMaterial";
import { makeSurface, organicEllipsoid, type Point3 } from "./field-geometry";
import { makeHouseDetails, makeRoofTile, ROOF_PITCH, ROOF_SLOPE_LENGTH } from "./field-house-details";
import { HOUSE_EXTERIOR_DOOR_INTERACTION_POINT } from "./field-interaction-targets";
import { HOUSE_CENTER } from "./field-layout";
import { FIELD_PALETTE as P } from "./field-palette";

const DETAILS = makeHouseDetails();
const TILE = makeRoofTile();
const PLINTH_STONE = organicEllipsoid(10, 6, 0.075);
const GABLE = makeSurface([0, 5.8, -6, 0, 5.8, 6, 0, 8.8, 0], [0, 1, 2]);
const DOOR_MARKER_POSITION: Point3 = [
  0,
  HOUSE_EXTERIOR_DOOR_INTERACTION_POINT[1],
  HOUSE_EXTERIOR_DOOR_INTERACTION_POINT[2] - HOUSE_CENTER[1],
];

function Timber({ position, size, color = P.wood }: {
  position: Point3; size: Point3; color?: string;
}) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={0.93} />
  </mesh>;
}

function Window({ position, rotationY = 0, warm = false }: {
  position: Point3; rotationY?: number; warm?: boolean;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} name="HOUSE_WINDOW_AND_SHUTTERS">
      <Timber position={[0, 0, 0]} size={[2.05, 2, 0.15]} color={P.woodDark} />
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[1.73, 1.67, 0.035]} />
        <meshStandardMaterial color={warm ? P.windowGlow : P.glass} roughness={0.48}
          emissive={P.windowGlow} emissiveIntensity={warm ? 0.13 : 0} />
      </mesh>
      <Timber position={[0, 0, 0.15]} size={[0.075, 1.72, 0.11]} />
      <Timber position={[0, -0.17, 0.15]} size={[1.78, 0.075, 0.11]} />
      <Timber position={[0, -1.06, 0.19]} size={[2.3, 0.18, 0.43]} color={P.stoneLight} />
      {[-1, 1].map((side) => <group key={side} position={[side * 1.35, 0, 0.13]} rotation={[0, side * -0.12, 0]}>
        <Timber position={[0, 0, 0]} size={[0.52, 1.86, 0.1]} color={P.shutter} />
        <Timber position={[0, -0.53, 0.075]} size={[0.49, 0.08, 0.07]} color={P.wood} />
        <Timber position={[0, 0.53, 0.075]} size={[0.49, 0.08, 0.07]} color={P.wood} />
      </group>)}
    </group>
  );
}

export function FieldHouse() {
  const showHelpers = useExperienceState(state => state.debugVisible);
  return (
    <group name="HOUSE_EXTERIOR_VISUAL_PROTOTYPE" position={[HOUSE_CENTER[0], 0, HOUSE_CENTER[1]]}>
      <RigidBody
        name="HOUSE_EXTERIOR_COLLIDER"
        type="fixed"
        colliders={false}
        position={[0, 3.5, 0]}
      >
        <CuboidCollider args={[8, 3.5, 6]} />
        <CuboidCollider args={[1.55, 0.045, 0.55]} position={[0, -3.455, 6.48]} />
      </RigidBody>
      <mesh name="HOUSE_LIME_PLASTER" position={[0, 2.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 5.8, 12]} />
        <FieldMaterial color={P.plaster} />
      </mesh>
      {[-1, 1].map((side) => <group key={side}>
        <mesh position={[side * 8, 0, 0]} castShadow receiveShadow>
          <FieldGeometry data={GABLE} />
          <FieldMaterial color={P.plasterShade} side={2} />
        </mesh>
        <mesh position={[0, 7.3, side * 3.35]} rotation={[side * ROOF_PITCH, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[17.8, 0.18, ROOF_SLOPE_LENGTH + 0.5]} />
          <meshStandardMaterial color={P.roofShade} roughness={0.96} />
        </mesh>
        <Timber position={[0, 5.77, side * 6.83]} size={[17.9, 0.24, 0.2]} color={P.woodDark} />
      </group>)}
      <FieldInstances name="HOUSE_CLAY_TILES" data={TILE} instances={DETAILS.roof} roughness={0.92} doubleSided />
      <Timber position={[0, 8.94, 0]} size={[17.9, 0.22, 0.28]} color={P.roof} />
      <FieldInstances name="HOUSE_STONE_FOOTING" data={PLINTH_STONE} instances={DETAILS.stones} />

      <group name="HOUSE_CLOSED_ENTRY" position={[0, 0, 6.08]}>
        <Timber position={[0, 1.4, 0]} size={[1.86, 2.8, 0.16]} color={P.woodDark} />
        {[-0.58, -0.29, 0, 0.29, 0.58].map((x, i) =>
          <Timber key={x} position={[x, 1.36, 0.11]} size={[0.278, 2.6, 0.06]} color={i % 2 ? P.wood : P.woodLight} />)}
        <Timber position={[-0.56, 1.25, 0.2]} size={[0.06, 0.17, 0.1]} color={P.woodDark} />
        <Timber position={[0, 0.045, 0.4]} size={[3.1, 0.09, 1.1]} color={P.stoneLight} />
        <mesh position={[0, 3.18, 0.62]} rotation={[0.15, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.7, 0.17, 1.9]} />
          <meshStandardMaterial color={P.roof} roughness={1} />
        </mesh>
        <Timber position={[-1.38, 2.91, 0.6]} size={[0.12, 0.34, 1.18]} />
        <Timber position={[1.38, 2.91, 0.6]} size={[0.12, 0.34, 1.18]} />
      </group>
      <Window position={[-4.6, 2.43, 6.09]} />
      <Window position={[4.45, 2.43, 6.09]} warm />
      <Window position={[-8.09, 2.43, 0.7]} rotationY={-Math.PI / 2} />
      <Window position={[8.09, 2.43, -1.8]} rotationY={Math.PI / 2} />
      <Window position={[-2.8, 2.43, -6.09]} rotationY={Math.PI} />
      <mesh
        name="DEV_HOUSE_DOOR_INTERACTION_POINT"
        position={DOOR_MARKER_POSITION}
        visible={showHelpers}
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={P.devMarker} wireframe />
      </mesh>
      <mesh position={[-4.5, 8.9, -1.8]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 2.25, 0.95]} />
        <meshStandardMaterial color={P.plasterShade} roughness={1} />
      </mesh>
      <Timber position={[-4.5, 10.06, -1.8]} size={[1.04, 0.18, 1.15]} color={P.stoneShade} />
    </group>
  );
}
