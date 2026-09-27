"use client";

import { Part, HouseInstances, HouseCurve, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { WallFooting, ClimbingPlant, Downpipe, WallLantern } from "../places/PlaceArchitecture";
import { BookRow, FieldNotebook, PaperStudy, WaterBottle } from "../places/StudyObjects";
import type { FieldInstance } from "../field/field-geometry";

const NOTATIONS: FieldInstance[] = Array.from({ length: 18 }, (_, i) => ({
  position: [-.86 + i % 6 * .31, .23 - Math.floor(i / 6) * .18, .012],
  scale: [i % 3 ? .18 : .08, .012, .006], color: P.chalk,
}));

function NetworkModel() {
  return <group name="PHYSICAL_NETWORK_STUDY" position={[3.24, 1.022, 1.24]} rotation={[0, -.09, 0]}>
    <Part name="NETWORK_MODEL_PLYWOOD_BASE" position={[0, 0, 0]} size={[1.16, .046, .89]} color={P.woodLight} />
    {[[-.34, -.22], [.31, -.21], [.02, .27]].map(([x, z], i) => <group key={i}>
      <Part name="NETWORK_MODEL_NODE" position={[x, .09, z]} size={[.23, .13, .18]} color={i === 1 ? P.clay : P.ink} radius={.025} />
      <Part name="NETWORK_MODEL_LABEL" position={[x, .158, z]} size={[.11, .006, .08]} color={P.paper} finish="paper" />
    </group>)}
    <HouseCurve name="NETWORK_MODEL_CONNECTION_A" points={[[-.3, .045, -.22], [0, .05, -.32], [.31, .045, -.21]]} radius={.012} color={P.clay} />
    <HouseCurve name="NETWORK_MODEL_CONNECTION_B" points={[[.31, .046, -.21], [.32, .047, .14], [.02, .045, .27]]} radius={.012} color={P.sage} />
    <HouseCurve name="NETWORK_MODEL_CONNECTION_C" points={[[.02, .045, .27], [-.25, .047, .16], [-.3, .045, -.22]]} radius={.012} color={P.iron} />
  </group>;
}

export function UniversityDetails() {
  return <group name="UNIVERSITY_STUDY_AND_CLOISTER_DETAILS">
    <WallFooting width={14.1} z={-4.006} />
    <Part name="GALLERY_REAR_CORNICE" position={[0, 3.75, -4.024]} size={[14.28, .17, .25]} color={P.plasterShade} finish="plaster" castShadow />
    {[-6.66, -2.8, 2.8, 6.66].map(x => <group key={x}>
      <Part name="GALLERY_REAR_PIER" position={[x, 2.03, -4.023]} size={[.33, 3.3, .15]} color={P.plasterShade} finish="plaster" />
      <Part name="PIER_STONE_CAPITAL" position={[x, 3.61, -4.025]} size={[.45, .13, .25]} color={P.stoneLight} finish="plaster" />
    </group>)}
    <ClimbingPlant position={[-5.43, .1, -4.15]} height={3.42} rotationY={Math.PI} seed={123} />
    <ClimbingPlant position={[5.52, .1, -4.15]} height={2.18} rotationY={Math.PI} seed={251} />
    <Downpipe position={[7.18, .12, -3.88]} height={3.92} />
    <Part name="GALLERY_BOOK_SHELF" position={[.34, 1.56, -3.49]} size={[2.5, .1, .42]} color={P.woodLight} castShadow />
    <BookRow position={[.37, 1.614, -3.45]} width={1.78} seed={2} />
    <group position={[-3.6, 1.56, -3.565]}><HouseInstances name="ACADEMIC_CHALK_NOTATIONS" instances={NOTATIONS} finish="paper" /></group>
    <Part name="CHALKBOARD_LEDGE" position={[-3.5, 1.19, -3.55]} size={[4.9, .07, .2]} color={P.woodLight} />
    <Part name="CHALKBOARD_ERASER" position={[-4.65, 1.26, -3.51]} size={[.21, .075, .12]} color={P.sage} radius={.014} />
    <FieldNotebook position={[-1.78, 1.017, 1.22]} rotationY={.08} />
    <PaperStudy position={[-2.96, 1.018, 1.43]} rotationY={-.1} />
    <WaterBottle position={[-3.61, 1.01, .79]} color={P.clay} />
    <NetworkModel />
    <Part name="ACADEMIC_CANVAS_SATCHEL" position={[-3.25, .73, 2.8]} size={[.55, .27, .43]} color={P.ink} finish="fabric" radius={.1} />
    <HouseCurve name="SATCHEL_CARRYING_STRAP" points={[[-3.43, .81, 2.85], [-3.52, .43, 3.12], [-3.02, .4, 3.13], [-3.04, .8, 2.85]]} radius={.019} color={P.wood} finish="fabric" />
    <WallLantern position={[6.28, 2.55, -3.698]} />
  </group>;
}
