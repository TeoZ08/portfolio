"use client";

import { Part, HouseInstances, HouseCurve, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { ClimbingPlant, KneeBraces } from "../places/PlaceArchitecture";
import { FieldNotebook, PaperStudy, StorageBox, WaterBottle } from "../places/StudyObjects";
import { HouseMug } from "../house/HouseObjects";
import type { FieldInstance } from "../field/field-geometry";

const KEYBOARD_KEYS: FieldInstance[] = Array.from({ length: 36 }, (_, i) => ({
  position: [-.34 + i % 12 * .063, .035, -.096 + Math.floor(i / 12) * .083],
  scale: [.049, .03, .065], color: i % 12 === 0 ? P.clay : P.paper,
}));

function TeachingMaterials() {
  return <group name="COMMUNITY_DIGITAL_LITERACY_MATERIALS">
    <group position={[-2.03, 1.05, -1.33]} rotation={[0, .09, 0]}>
      <Part name="PRACTICE_KEYBOARD" position={[0, 0, 0]} size={[.84, .055, .34]} color={P.iron} radius={.028} />
      <HouseInstances name="PRACTICE_KEYBOARD_KEYS" instances={KEYBOARD_KEYS} finish="paint" />
      <Part name="PRACTICE_MOUSE" position={[.64, .01, .03]} size={[.17, .075, .25]} color={P.paper} radius={.067} />
      <HouseCurve name="MOUSE_CABLE" points={[[.64, .02, -.1], [.7, .035, -.24], [.35, .02, -.27], [.17, .015, -.21]]} radius={.009} color={P.iron} />
    </group>
    <PaperStudy position={[-1.83, 1.122, -.53]} variant={1} rotationY={-.08} />
    <FieldNotebook position={[2.03, 1.012, -1.05]} rotationY={.12} />
    <WaterBottle position={[2.54, 1.012, -.12]} color={P.sage} />
    <HouseMug position={[.9, 1.01, -1.24]} />
    <StorageBox position={[1.4, .135, -.85]} color={P.sage} />
    <StorageBox position={[2.17, .135, -.94]} rotationY={-.06} />
    <Part name="FOLDED_COMMUNITY_TABLE_RUNNER" position={[2.32, 1.016, -.36]} size={[.67, .017, 1.05]} color={P.canvas} finish="fabric" radius={.012} />
    <Part name="WORKSHOP_INSTRUCTION_LEAFLETS" position={[.27, 1.043, -1.17]} size={[.63, .085, .43]} color={P.paper} finish="paper" rotation={[0, -.08, 0]} radius={.006} />
  </group>;
}

export function CommunityDetails() {
  return <group name="COMMUNITY_GARDEN_VISUAL_DETAILS">
    <TeachingMaterials />
    <ClimbingPlant position={[-4.55, .13, -3.42]} height={3.63} seed={74} />
    <ClimbingPlant position={[4.55, .13, 2.39]} height={2.8} seed={93} rotationY={-.7} />
    {[-1, 1].map(side => <group key={side}>
      <KneeBraces x={side * 4.55} y={3.75} z={2.4} direction={-side} />
      <KneeBraces x={side * 4.55} y={3.75} z={-3.45} direction={-side} />
    </group>)}
    {[-3.9, -2.2, -.5, 1.2, 2.9].map((x, i) => <group key={x} position={[x, 3.11 + Math.sin(i) * .055, -3.455]} rotation={[0, 0, (i % 3 - 1) * .07]}>
      <Part name="PINNED_WORKSHOP_NOTE" position={[0, -.23, .005]} size={[.26, .36, .012]} color={i % 2 ? P.canvas : P.paper} finish="paper" radius={.006} />
      <Part name="WOODEN_CLOTHESPIN" position={[0, -.031, .023]} size={[.032, .11, .032]} color={P.woodLight} radius={.006} />
      <Part name="WORKSHOP_NOTE_SKETCH" position={[0, -.21, .013]} size={[.13, .11, .002]} color={P.sage} finish="paper" radius={.005} />
    </group>)}
    <HouseCurve name="CANOPY_TIE_LEFT" points={[[-4.54, 3.78, 2.4], [-4.56, 3.54, 2.41], [-4.61, 3.6, 2.48]]} radius={.013} color={P.canvas} finish="fabric" />
    <Part name="BENCH_SEAT_PAD" position={[-3.35, .632, 3.13]} size={[1.32, .065, .55]} color={P.sage} finish="fabric" radius={.03} />
  </group>;
}
