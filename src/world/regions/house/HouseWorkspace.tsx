"use client";

import type { FieldInstance } from "../field/field-geometry";
import { HouseBlockout as Part, HouseInstances } from "./HouseBlockout";
import { HouseMaterial } from "./HouseMaterial";
import { HouseBook, HouseCurve, HouseHeadphones, HouseMug } from "./HouseObjects";
import { HOUSE_PALETTE as P } from "./house-palette";

const KEYS: FieldInstance[] = [];
for (let row = 0; row < 4; row += 1) {
  for (let col = 0; col < 12; col += 1) KEYS.push({
    position: [-0.59 + col * 0.105, 0.041, -0.14 + row * 0.08],
    scale: [0.087, 0.027, 0.058], color: col === 0 && row === 0 ? P.clay : P.paperEdge,
  });
}
KEYS.push({ position: [0, 0.041, 0.187], scale: [0.5, 0.027, 0.055], color: P.paperEdge });
const NOTE_LINES: FieldInstance[] = Array.from({ length: 6 }, (_, i) => ({
  position: [0.15, 0.011, -0.23 + i * 0.075], scale: [0.25 - (i % 2) * 0.07, 0.002, 0.009], color: P.slate,
}));

function StudyNotebook() {
  return <group name="HOUSE_OPEN_STUDY_NOTEBOOK" position={[2.63, 1.62, -4.82]} rotation={[0, 0.17, 0]}>
    <Part name="NOTEBOOK_CLOTH_COVER" position={[0, -0.015, 0]} size={[0.96, 0.055, 0.73]} color={P.clay} finish="fabric" radius={0.012} />
    {[-1, 1].map(side => <Part key={side} name="NOTEBOOK_OPEN_PAGE" position={[side * 0.228, 0.02, 0]}
      size={[0.44, 0.025, 0.67]} rotation={[0, 0, side * -0.05]} color={P.paper} finish="paper" radius={0.007} />)}
    <group position={[0, 0.039, 0]}>
      <HouseInstances name="NOTEBOOK_SHORT_HANDWRITTEN_LINES" instances={NOTE_LINES} finish="paper" />
      <HouseCurve name="NOTEBOOK_SMALL_NODE_DIAGRAM" points={[[-0.33, 0, -0.17], [-0.16, 0, -0.01], [-0.3, 0, 0.21]]} radius={0.006} color={P.slate} finish="paper" />
      {[[-0.33, -0.17], [-0.16, -0.01], [-0.3, 0.21]].map(([x, z], i) => <Part key={i}
        name="NOTEBOOK_DIAGRAM_NODE" position={[x, 0, z]} size={[0.045, 0.006, 0.042]} color={P.ink} radius={0.003} finish="paper" />)}
    </group>
    <Part name="PENCIL_LEFT_ON_NOTEBOOK" position={[0.36, 0.083, 0.06]} size={[0.027, 0.027, 0.59]}
      rotation={[0, -0.12, 0.04]} color={P.ochre} radius={0.012} />
  </group>;
}

function DeskLamp() {
  return <group name="HOUSE_SMALL_TASK_LAMP" position={[5.83, 1.59, -5.27]}>
    <Part name="LAMP_WEIGHTED_BASE" position={[0, 0.05, 0]} size={[0.51, 0.1, 0.43]} color={P.linenShade} finish="metal" radius={0.045} />
    <HouseCurve name="LAMP_BENT_ARM" points={[[0, 0.08, 0], [0.08, 0.24, -0.04], [0.1, 0.85, -0.09], [-0.06, 1.06, 0], [-0.24, 1.04, 0.12]]} radius={0.035} color={P.brass} />
    <group position={[-0.25, 0.91, 0.14]} rotation={[0.14, 0, -0.14]}>
      <mesh castShadow><cylinderGeometry args={[0.14, 0.35, 0.3, 32, 1, true]} /><HouseMaterial color={P.linenShade} finish="metal" side={2} /></mesh>
      <mesh position={[0, -0.142, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} /><meshStandardMaterial color={P.ceramic} emissive={P.lamp} emissiveIntensity={0.45} roughness={1} />
      </mesh>
    </group>
    <pointLight color={P.lamp} position={[-0.25, 0.67, 0.14]} intensity={1.25} distance={3.7} decay={2} />
  </group>;
}

function Computer() {
  return <group name="HOUSE_COMPUTER">
    <Part name="COMPUTER_MONITOR_HOUSING" position={[4.25, 2.35, -5.29]} size={[2.22, 1.31, 0.18]} color={P.ink} finish="paint" radius={0.065} castShadow />
    <mesh name="COMPUTER_STANDBY_SCREEN" position={[4.25, 2.39, -5.189]}>
      <boxGeometry args={[2.025, 1.055, 0.024]} />
      <meshStandardMaterial color={P.screen} emissive={P.screenLight} emissiveIntensity={0.2} roughness={0.76} />
    </mesh>
    <Part name="COMPUTER_STANDBY_HEADER" position={[4.02, 2.57, -5.17]} size={[0.92, 0.035, 0.012]} color={P.screenLight} radius={0.005} />
    <Part name="COMPUTER_STANDBY_LINE" position={[3.89, 2.42, -5.17]} size={[0.66, 0.025, 0.012]} color={P.slate} radius={0.004} />
    <Part name="COMPUTER_STANDBY_LINE_SHORT" position={[3.76, 2.31, -5.17]} size={[0.4, 0.022, 0.012]} color={P.slate} radius={0.004} />
    <Part name="MONITOR_LOWER_BEZEL" position={[4.25, 1.81, -5.175]} size={[1.97, 0.068, 0.015]} color={P.metal} finish="metal" radius={0.007} />
    <Part name="MONITOR_STAND_NECK" position={[4.25, 1.77, -5.31]} size={[0.17, 0.48, 0.14]} color={P.metal} finish="metal" castShadow />
    <Part name="MONITOR_STAND_FOOT" position={[4.25, 1.592, -5.18]} size={[0.65, 0.055, 0.43]} color={P.metal} finish="metal" radius={0.026} />
    <group name="COMPUTER_KEYBOARD" position={[4.1, 1.59, -4.72]} rotation={[0, -0.025, 0]}>
      <Part name="KEYBOARD_CASE" position={[0, 0, 0]} size={[1.39, 0.061, 0.49]} color={P.ceramic} finish="paint" radius={0.028} />
      <HouseInstances name="KEYBOARD_INSTANCED_KEYS" instances={KEYS} finish="paint" />
    </group>
    <Part name="MOUSE_FELT_PAD" position={[5.16, 1.575, -4.83]} size={[0.67, 0.012, 0.72]} color={P.slate} finish="fabric" radius={0.005} />
    <Part name="COMPUTER_MOUSE" position={[5.2, 1.661, -4.87]} size={[0.2, 0.15, 0.32]} color={P.ceramic} finish="paint" radius={0.07} />
    <Part name="MOUSE_WHEEL" position={[5.2, 1.735, -4.93]} size={[0.025, 0.018, 0.059]} color={P.metal} finish="metal" radius={0.008} />
    <Part name="COMPUTER_COMPACT_CASE" position={[5.83, 0.49, -5.24]} size={[0.37, 0.84, 0.67]} color={P.ink} finish="paint" radius={0.04} castShadow />
    <HouseCurve name="MONITOR_POWER_CABLE" points={[[4.25, 1.8, -5.41], [4.52, 1.68, -5.56], [5.1, 1.6, -5.62], [5.72, 1.45, -5.64], [5.85, 0.43, -5.49]]}
      radius={0.014} color={P.woodDark} />
  </group>;
}

function DeskChair() {
  return <group name="HOUSE_DESK_CHAIR" position={[4.25, 0, -3.55]} rotation={[0, -0.1, 0]}>
    {[-1, 1].map(side => <HouseCurve key={side} name="CHAIR_SLED_LEGS"
      points={[[side * 0.53, 0.05, -0.53], [side * 0.54, 0.51, -0.4], [side * 0.54, 0.58, 0.43], [side * 0.54, 0.07, 0.52], [side * 0.53, 0.05, -0.53]]}
      radius={0.043} color={P.woodDark} />)}
    <Part name="CHAIR_WOOD_SEAT" position={[0, 0.58, 0]} size={[1.28, 0.13, 1.22]} color={P.woodLight} radius={0.062} castShadow />
    <Part name="CHAIR_SAGE_CUSHION" position={[0, 0.7, 0]} size={[1.19, 0.17, 1.12]} color={P.linenShade} finish="fabric" radius={0.082} castShadow />
    {[-1, 1].map(side => <Part key={side} name="CHAIR_BACK_POST" position={[side * 0.53, 1.09, 0.49]}
      size={[0.095, 1.19, 0.12]} rotation={[0.09, 0, 0]} color={P.wood} radius={0.044} />)}
    <Part name="CHAIR_ROUNDED_BACK" position={[0, 1.43, 0.55]} rotation={[0.09, 0, 0]}
      size={[1.3, 0.59, 0.17]} color={P.woodLight} radius={0.08} castShadow />
  </group>;
}

function WorkspaceSmallDetails() {
  return <group name="HOUSE_WORKSPACE_SMALL_DETAILS">
    <mesh name="MUG_WOVEN_COASTER" position={[5.67, 1.568, -4.8]} receiveShadow>
      <cylinderGeometry args={[0.2, 0.2, 0.018, 24]} />
      <HouseMaterial color={P.ochre} finish="fabric" />
    </mesh>
    <group name="TINY_USB_DRIVE" position={[3.55, 1.59, -5.43]} rotation={[0, -0.18, 0]}>
      <Part name="USB_DRIVE_BODY" position={[0, 0.025, 0]} size={[0.18, 0.05, 0.36]} color={P.slate} finish="paint" radius={0.018} />
      <Part name="USB_DRIVE_CONNECTOR" position={[0, 0.021, -0.23]} size={[0.11, 0.035, 0.13]} color={P.metal} finish="metal" radius={0.008} />
    </group>
  </group>;
}

export function HouseWorkspace() {
  return <group name="HOUSE_WORKSPACE_VISUAL_PROTOTYPE">
    <Part name="DESK_SOLID_OAK_TOP" position={[4.25, 1.43, -5.18]} size={[4.28, 0.25, 1.26]} color={P.woodLight} radius={0.055} castShadow />
    <Part name="DESK_FRONT_APRON" position={[4.25, 1.19, -4.89]} size={[3.64, 0.22, 0.1]} color={P.wood} radius={0.03} />
    {[2.53, 5.97].map(x => <group key={x}>
      {[-5.53, -4.86].map(z => <Part key={z} name="DESK_TAPERED_LEG" position={[x, 0.68, z]}
        size={[0.16, 1.35, 0.18]} color={P.wood} rotation={[0, 0, x < 4 ? 0.035 : -0.035]} radius={0.04} castShadow />)}
      <Part name="DESK_LOW_CROSS_RAIL" position={[x, 0.26, -5.2]} size={[0.12, 0.1, 0.78]} color={P.woodDark} />
    </group>)}
    <Part name="DESK_SHALLOW_DRAWER" position={[2.82, 1.18, -5.05]} size={[1.03, 0.26, 0.73]} color={P.wood} castShadow />
    <Part name="DESK_DRAWER_PULL" position={[2.82, 1.19, -4.649]} size={[0.31, 0.04, 0.06]} color={P.brass} finish="metal" radius={0.02} />
    <Computer />
    <StudyNotebook />
    <DeskLamp />
    <WorkspaceSmallDetails />
    <HouseMug position={[5.67, 1.563, -4.8]} />
    <HouseHeadphones position={[3.03, 1.64, -5.48]} />
    <HouseBook position={[2.58, 1.65, -5.48]} size={[0.61, 0.13, 0.56]} color={P.slate} rotation={[0, -0.12, 0]} />
    <Part name="PHONE_FACE_DOWN" position={[3.32, 1.593, -4.82]} size={[0.2, 0.035, 0.38]} color={P.ink} finish="paint" rotation={[0, -0.17, 0]} radius={0.017} />
    <DeskChair />
  </group>;
}
