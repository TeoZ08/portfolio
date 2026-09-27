"use client";

import { FieldGeometry } from "../field/FieldMeshes";
import type { FieldInstance } from "../field/field-geometry";
import { HouseBlockout as Part, HouseInstances } from "./HouseBlockout";
import { HouseMaterial } from "./HouseMaterial";
import { HousePlant } from "./HouseObjects";
import { HouseRug } from "./HousePersonalDetails";
import { curtainSurface } from "./house-geometry";
import { HOUSE_INTERIOR_WIDTH, HOUSE_INTERIOR_DEPTH, HOUSE_INTERIOR_WALL_HEIGHT } from "./house-layout";
import { HOUSE_PALETTE as P } from "./house-palette";

const CURTAIN = curtainSurface();
const BOARDS: FieldInstance[] = [];
const BOARD_COLORS = [P.floor, P.floorLight, P.floor, P.floorShade, P.floor, P.floorLight];
// The eight extra rows sit behind the playable threshold. They are visual
// overscan for the entrance camera, not an extension of the navigable layout.
for (let row = 0; row < 26; row += 1) {
  const width = HOUSE_INTERIOR_DEPTH / 18;
  const offset = (row % 3) * 1.06;
  for (let x = -11.2 + offset; x < 8; x += 3.2) {
    const left = Math.max(-8, x), right = Math.min(8, x + 3.2);
    if (right - left < 0.02) continue;
    BOARDS.push({ position: [(left + right) / 2, -0.018, -6 + (row + 0.5) * width],
      scale: [right - left - 0.014, 0.048, width - 0.013],
      color: BOARD_COLORS[(row * 7 + Math.round(x + 20)) % BOARD_COLORS.length] });
  }
}

function NorthWindow() {
  return <group name="HOUSE_NORTH_WINDOW" position={[-2.8, 2.55, -6.05]}>
    {/* The glass picks up the Field sky colour; it is not a painted panorama. */}
    <Part name="WINDOW_REVEAL" position={[0, 0, -0.015]} size={[2.37, 2.13, 0.32]} color={P.woodDark} radius={0.035} />
    <mesh position={[0, 0, 0.169]}>
      <planeGeometry args={[2.04, 1.79]} />
      <meshStandardMaterial color={P.glass} emissive={P.glassSky} emissiveIntensity={0.25} roughness={0.36} />
    </mesh>
    {[-1, 1].map(side => <group key={side}>
      <Part name="WINDOW_VERTICAL_CASING" position={[side * 1.19, 0, 0.2]} size={[0.16, 2.34, 0.15]} color={P.trim} radius={0.02} />
      <Part name="WINDOW_HORIZONTAL_CASING" position={[0, side * 1.09, 0.2]} size={[2.53, 0.15, 0.15]} color={P.trim} radius={0.02} />
    </group>)}
    <Part name="WINDOW_CENTER_MULLION" position={[0, 0, 0.211]} size={[0.066, 2.03, 0.08]} color={P.woodLight} radius={0.025} />
    <Part name="WINDOW_CROSS_MULLION" position={[0, -0.17, 0.211]} size={[2.2, 0.066, 0.08]} color={P.woodLight} radius={0.025} />
    <Part name="WINDOW_DEEP_STONE_SILL" position={[0, -1.16, 0.28]} size={[2.66, 0.13, 0.62]} color={P.trim} finish="plaster" radius={0.04} />
    <Part name="WINDOW_CURTAIN_ROD" position={[0, 1.27, 0.39]} size={[3.4, 0.05, 0.05]} color={P.woodDark} radius={0.024} />
    {[-1, 1].map(side => <mesh key={side} name="WINDOW_GATHERED_LINEN_CURTAIN" position={[side * 1.37, 1.23, 0.4]} castShadow receiveShadow>
      <FieldGeometry data={CURTAIN} /><HouseMaterial color={P.linenLight} finish="fabric" side={2} />
    </mesh>)}
    <HousePlant position={[0.73, -1.085, 0.36]} scale={0.78} />
  </group>;
}

function EntryDoor() {
  return <group name="HOUSE_ENTRY_DOOR_JOINERY" position={[7.82, 2.08, 5.2]} rotation={[0, -Math.PI / 2, 0]}>
    <Part name="DOOR_RECESSED_PANEL" position={[0, 0, 0]} size={[2.62, 4.03, 0.16]} color={P.woodDark} castShadow />
    {[-1.04, -0.52, 0, 0.52, 1.04].map((x, i) => <Part key={x} name="DOOR_TIMBER_BOARD"
      position={[x, -0.03, 0.11]} size={[0.493, 3.81, 0.07]} color={i % 2 ? P.wood : P.woodLight} radius={0.025} />)}
    {[-1, 1].map(side => <Part key={side} name="DOOR_SIDE_ARCHITRAVE" position={[side * 1.36, 0, 0.17]}
      size={[0.15, 4.16, 0.15]} color={P.wood} radius={0.035} />)}
    <Part name="DOOR_HEADER" position={[0, 2.04, 0.17]} size={[2.88, 0.14, 0.15]} color={P.wood} radius={0.03} />
    <Part name="DOOR_LATCH_PLATE" position={[-0.98, -0.28, 0.177]} size={[0.08, 0.31, 0.06]} color={P.brass} finish="metal" radius={0.025} />
    <Part name="DOOR_LEVER" position={[-0.87, -0.19, 0.24]} size={[0.25, 0.044, 0.06]} color={P.brass} finish="metal" radius={0.02} />
  </group>;
}

export function HouseShell() {
  const h = HOUSE_INTERIOR_WALL_HEIGHT;
  return <group name="HOUSE_SHELL_VISUAL_PROTOTYPE">
    <Part name="HOUSE_FLOOR_FOUNDATION" position={[0, -0.14, 0]} size={[HOUSE_INTERIOR_WIDTH, 0.24, HOUSE_INTERIOR_DEPTH]} color={P.woodDark} radius={0.025} />
    <Part name="HOUSE_ENTRANCE_CAMERA_FLOOR_CONTINUATION" position={[0, -.14, 8.67]} size={[16, .24, 5.34]} color={P.woodDark} radius={.01} />
    <HouseInstances name="HOUSE_STAGGERED_OAK_FLOORBOARDS" instances={BOARDS} />
    <Part name="HOUSE_WEST_LIMEWASH" position={[-8.25, h / 2, 2.5]} size={[0.5, h, 18]} color={P.wall} finish="plaster" radius={0.015} castShadow />
    <Part name="HOUSE_EAST_LIMEWASH" position={[8.25, h / 2, 2.5]} size={[0.5, h, 18]} color={P.wallShade} finish="plaster" radius={0.015} castShadow />
    {/* WindowShadowWall remains the authored light mask. This visual ceiling
        encloses the view without removing the established afternoon patches. */}
    <Part name="HOUSE_ENCLOSING_PLASTER_CEILING" position={[0, h+.1, 2.5]} size={[16.5, .2, 18]} color={P.trim} finish="plaster" radius={.008} />
    <Part name="HOUSE_CAMERA_RECESS_BACK_WALL" position={[0, h/2, 11.5]} size={[16.5, h, .3]} color={P.wallShade} finish="plaster" radius={.01} />
    {/* Same north-wall footprint/collider; the visual opening matches its window. */}
    <Part name="HOUSE_NORTH_WALL_LEFT" position={[-6.2, h / 2, -6.25]} size={[4.3, h, 0.5]} color={P.wall} finish="plaster" radius={0.001} castShadow />
    <Part name="HOUSE_NORTH_WALL_RIGHT" position={[3.35, h / 2, -6.25]} size={[9.8, h, 0.5]} color={P.wall} finish="plaster" radius={0.001} castShadow />
    <Part name="HOUSE_NORTH_WALL_UNDER_WINDOW" position={[-2.85, 0.7, -6.25]} size={[2.6, 1.4, 0.5]} color={P.wall} finish="plaster" radius={0.001} castShadow />
    <Part name="HOUSE_NORTH_WALL_ABOVE_WINDOW" position={[-2.85, 4.11, -6.25]} size={[2.6, 0.78, 0.5]} color={P.wall} finish="plaster" radius={0.001} castShadow />
    {[-1, 1].map(side => <group key={side}>
      <Part name="HOUSE_SIDE_SKIRTING" position={[side * 7.98, 0.16, 2.67]} size={[0.095, 0.28, 17.34]} color={P.trim} finish="wood" radius={0.022} />
      <Part name="HOUSE_SIDE_CEILING_TRIM" position={[side*7.97, h-.08, 2.5]} size={[.12, .15, 17.6]} color={P.wall} finish="plaster" radius={.018} />
    </group>)}
    <Part name="HOUSE_NORTH_CEILING_TRIM" position={[0, h-.08, -5.97]} size={[16, .15, .12]} color={P.wall} finish="plaster" radius={.018} />
    <Part name="HOUSE_NORTH_SKIRTING" position={[0, 0.16, -5.96]} size={[16, 0.28, 0.095]} color={P.trim} radius={0.023} />
    <NorthWindow />
    <EntryDoor />
    {/* The entry-facing plane stays open to the lens. Wall, floor and ceiling
        continuations surround it; there is no exposed dollhouse rim or sky. */}
    <HouseRug name="HOUSE_ENTRY_WOVEN_RUNNER" position={[0, 0.032, 3.25]} size={[3.4, 2.7]} />
    <Part name="HOUSE_FLAT_ENTRY_THRESHOLD" position={[0, 0.018, 5]} size={[2.25, 0.035, 0.51]} color={P.wallShade} finish="plaster" radius={0.017} />
  </group>;
}
