"use client";

import { Part, HouseInstances, HouseCurve, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { WallFooting, KneeBraces, WallLantern } from "../places/PlaceArchitecture";
import { WaterBottle } from "../places/StudyObjects";
import { HouseMaterial } from "../house/HouseMaterial";
import { SoftObject } from "../house/HouseObjects";
import type { FieldInstance } from "../field/field-geometry";

const WAINSCOT_BOARDS: FieldInstance[] = Array.from({ length: 45 }, (_, i) => ({
  position: [-5.35 + i * .243, .72, -3.999], scale: [.231, 1.07, .035],
  color: i % 4 === 0 ? P.woodLight : P.wood,
}));
const MAT_EDGES: FieldInstance[] = Array.from({ length: 7 }, (_, i) => ({
  position: [-4.5 + i * 1.5, .194, -2.5], scale: [.035, .004, .45], color: P.matDark,
}));

export function DojoDetails() {
  return <group name="DOJO_PRACTICE_DETAILS">
    <WallFooting width={11.06} z={-4.013} color={P.stoneShade} />
    <HouseInstances name="DOJO_REAR_TIMBER_CLADDING" instances={WAINSCOT_BOARDS} />
    <Part name="REAR_TIMBER_CAP" position={[0, 1.285, -4.02]} size={[11.08, .11, .16]} color={P.woodDark} />
    {[-5.25, 0, 5.25].map(x => <Part key={x} name="REAR_FRAME_UPRIGHT" position={[x, 1.75, -4.01]} size={[.13, 2.4, .09]} color={P.wood} />)}
    <Part name="DOJO_WALL_TOP_FINISH" position={[0, 2.95, -3.87]} size={[11.21, .17, .36]} color={P.woodDark} castShadow />
    {[-1, 1].map(side => <KneeBraces key={side} x={side * 5.15} y={3.74} z={-1.72} direction={-side} />)}
    <group name="TRAINING_EQUIPMENT_WALL_RACK" position={[-3.48, 1.82, -3.58]}>
      <Part name="EQUIPMENT_RACK" position={[0, -.24, 0]} size={[1.64, .07, .29]} color={P.woodLight} />
      <SoftObject name="FOLDED_TRAINING_TOWEL" position={[-.37, -.12, .02]} size={[.51, .19, .23]} color={P.paper} />
      <SoftObject name="SECOND_KICKING_TARGET" position={[.42, .26, .04]} size={[.35, .62, .12]} color={P.clay} />
      <Part name="SECOND_TARGET_HANDLE" position={[.42, -.14, .04]} size={[.075, .32, .075]} color={P.woodDark} radius={.03} />
    </group>
    <WaterBottle position={[-4.81, .616, 3.05]} color={P.iron} />
    <Part name="DOBOK_FOLDED_BELT" position={[-3.89, .826, 3.1]} size={[.56, .018, .048]} color={P.paper} finish="fabric" rotation={[0, .12, 0]} radius={.004} />
    <group name="ROLLED_PRACTICE_MATS" position={[4.25, .15, -3.34]}>
      {[-.36, .09].map((x, i) => <group key={x} position={[x, .53 + i * .08, 0]} rotation={[0, 0, i ? -.06 : .04]}>
        <mesh castShadow><cylinderGeometry args={[.18, .18, 1.06, 20]} /><HouseMaterial color={i ? P.matDark : P.mat} finish="fabric" /></mesh>
        <mesh position={[0, .534, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.115, .025, 6, 18]} /><HouseMaterial color={P.canvas} finish="fabric" /></mesh>
        <Part name="MAT_CARRY_STRAP" position={[0, 0, .183]} size={[.27, .075, .015]} color={P.woodDark} finish="fabric" radius={.008} />
      </group>)}
    </group>
    <HouseInstances name="SUBTLE_PRACTICE_ALIGNMENT_MARKS" instances={MAT_EDGES} finish="fabric" />
    <WallLantern position={[4.91, 2.29, -3.714]} />
    <HouseCurve name="BAG_CANVAS_REINFORCEMENT" points={[[3.9, 2.43, -2.48], [4.11, 2.85, -2.3], [4.32, 2.43, -2.1]]} radius={.028} color={P.sage} finish="fabric" />
  </group>;
}
