"use client";

import { Part, HouseInstances, HouseCurve, WorldLettering, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { ClimbingPlant, Downpipe, KneeBraces, WallFooting, WallLantern } from "../places/PlaceArchitecture";
import { BookRow, PaperStudy, StorageBox } from "../places/StudyObjects";
import { HouseHeadphones, HouseMug } from "../house/HouseObjects";
import { HouseMaterial } from "../house/HouseMaterial";
import type { FieldInstance } from "../field/field-geometry";

const PEG_HOLES: FieldInstance[] = Array.from({ length: 70 }, (_, i) => ({
  position: [-1.22 + i % 10 * .27, -.63 + Math.floor(i / 10) * .21, .047],
  scale: [.026, .026, .009], color: P.woodDark,
}));
const KEYS: FieldInstance[] = Array.from({ length: 42 }, (_, i) => ({
  position: [-.47 + i % 14 * .07, .032, -.097 + Math.floor(i / 14) * .076],
  scale: [.056, .022, .058], color: i % 14 === 0 ? P.sage : P.paper,
}));

function ToolWall() {
  return <group name="WORKSHOP_HAND_TOOLS" position={[-4.967, 1.9, -1.63]} rotation={[0, Math.PI / 2, 0]}>
    <Part name="PEGBOARD" position={[0, 0, 0]} size={[2.82, 1.61, .075]} color={P.woodLight} radius={.02} />
    <HouseInstances name="PEGBOARD_HOLES" instances={PEG_HOLES} />
    {[-.96, -.7, -.44].map((x, i) => <group key={x} position={[x, .08, .09]} rotation={[0, 0, (i - 1) * .075]}>
      <Part name="SCREWDRIVER_HANDLE" position={[0, .04, 0]} size={[.078, .24, .074]} color={i === 1 ? P.clay : P.iron} radius={.033} />
      <Part name="SCREWDRIVER_SHAFT" position={[0, -.18, 0]} size={[.022, .22, .022]} color={P.stoneLight} finish="metal" radius={.009} />
    </group>)}
    <HouseCurve name="PLIERS_HANDLE_LEFT" points={[[.02, -.4, .1], [.08, -.2, .1], [.2, .12, .1], [.16, .3, .1]]} radius={.026} color={P.iron} />
    <HouseCurve name="PLIERS_HANDLE_RIGHT" points={[[.39, -.4, .1], [.3, -.18, .1], [.2, .12, .1], [.25, .3, .1]]} radius={.026} color={P.iron} />
    <Part name="CARPENTER_SQUARE_LONG" position={[.76, -.11, .09]} size={[.055, .77, .035]} color={P.brass} finish="metal" />
    <Part name="CARPENTER_SQUARE_SHORT" position={[.94, -.47, .09]} size={[.42, .064, .035]} color={P.brass} finish="metal" />
    <Part name="PEGBOARD_TOP_RAIL" position={[0, .86, .01]} size={[2.94, .1, .1]} color={P.woodDark} />
  </group>;
}

function PrototypeShelf() {
  return <group name="WORKSHOP_VERSIONS_AND_PARTS" position={[3.72, 2.38, -3.25]}>
    <Part name="PARTS_WALL_SHELF" position={[0, 0, 0]} size={[2.28, .095, .52]} color={P.woodLight} castShadow />
    <BookRow position={[-.52, .054, 0]} width={.85} seed={4} />
    <Part name="OLD_PROTOTYPE_ENCLOSURE" position={[.42, .22, .01]} size={[.64, .32, .4]} color={P.paper} finish="paint" radius={.045} />
    <Part name="OLD_PROTOTYPE_BLANK_DISPLAY" position={[.42, .245, .219]} size={[.38, .13, .007]} color={P.glass} finish="paint" radius={.009} />
    <Part name="PROTOTYPE_TAPE_LABEL" position={[.44, .09, .22]} size={[.31, .055, .005]} color={P.canvas} finish="paper" />
    <HouseCurve name="SPARE_CABLE" points={[[.72, .11, .11], [.93, .22, .16], [.98, .04, .29], [.87, -.23, .28], [.73, -.2, .22]]} color={P.iron} radius={.013} />
    {[-.82, .82].map(x => <Part key={x} name="SHELF_BRACKET" position={[x, -.18, -.08]} size={[.065, .36, .21]} color={P.iron} finish="metal" />)}
  </group>;
}

export function WorkshopDetails() {
  return <group name="WORKSHOP_VISUAL_STORYTELLING">
    <ToolWall />
    <PrototypeShelf />
    <group position={[.35, 1.537, -1.82]}><HouseInstances name="WORKSHOP_KEYCAPS" instances={KEYS} finish="paint" /></group>
    <HouseHeadphones position={[-2.72, 1.57, -2.04]} />
    <HouseMug position={[-3.44, 1.493, -2.39]} />
    <PaperStudy position={[-1.45, 1.496, -2.61]} rotationY={-.16} />
    <group position={[-3.72, 1.47, -2.42]}>
      <Part name="TASK_LAMP_BASE" position={[0, .05, 0]} size={[.32, .065, .27]} color={P.iron} finish="metal" radius={.055} />
      <HouseCurve name="TASK_LAMP_ARM" points={[[0, .08, 0], [0, .55, -.15], [.23, .93, -.02], [.43, .86, .1]]} radius={.033} color={P.iron} />
      <mesh position={[.43, .76, .1]} rotation={[0, 0, -.32]} castShadow><coneGeometry args={[.23, .2, 20, 1, true]} /><HouseMaterial color={P.sage} side={2} finish="paint" /></mesh>
    </group>
    <StorageBox position={[-1.3, .16, -2.29]} color={P.sage} rotationY={.06} />
    <StorageBox position={[-.49, .16, -2.34]} />
    <StorageBox position={[-.45, .59, -2.33]} color={P.canvas} rotationY={-.055} />
    <Part name="CUTTING_MAT_MEASURE_GUIDE" position={[-2.33, 1.38, 1.61]} size={[1.45, .004, .012]} color={P.paper} finish="paper" radius={0} />
    <Part name="MODEL_REVISION_OFFCUT" position={[-3.05, 1.4, 1.57]} size={[.35, .045, .22]} color={P.woodLight} rotation={[0, .29, 0]} />
    <WallFooting width={10.5} z={-3.68} />
    <Part name="WORKSHOP_REAR_FASCIA" position={[0, 3.62, -3.7]} size={[10.7, .2, .17]} color={P.woodDark} castShadow />
    {[-4.96, -.1, 4.96].map(x => <Part key={x} name="WORKSHOP_REAR_JOINERY" position={[x, 2.02, -3.694]} size={[.16, 3.28, .1]} color={P.wood} />)}
    <ClimbingPlant position={[3.95, .08, -3.79]} height={2.9} rotationY={Math.PI} seed={18} />
    <Downpipe position={[-5.12, .1, -3.79]} height={3.91} />
    <WorldLettering text="Ateliê" position={[-2.7, 2.37, -3.706]} rotationY={Math.PI} width={1.52} />
    <WallLantern position={[-4.91, 2.54, .56]} rotationY={Math.PI / 2} />
    {[-1, 1].map(side => <KneeBraces key={side} x={side * 4.95} y={4.03} z={-.45} direction={-side} />)}
  </group>;
}
