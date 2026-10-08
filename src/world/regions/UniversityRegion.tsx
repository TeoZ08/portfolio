"use client";

import { Place, Platform, Part, Solid, Bench, Worktable, WorldLettering, HouseBook, HousePlant, NoticeBoard, HouseCurve, PLACE_PALETTE as P } from "./places/PlaceObjects";
import { HouseMaterial } from "./house/HouseMaterial";
import { PLACE_LAYOUT } from "./places/place-layout";
import { FieldGeometry } from "./field/FieldMeshes";
import { makeSurface } from "./field/field-geometry";
import { UniversityDetails } from "./university/UniversityDetails";
import { UniversityArchitecture } from "./university/UniversityArchitecture";

// Plaster above each arch joins the canopy. This is a small open cloister,
// rather than a row of decorative hoops disconnected from the building.
const archVertices: number[] = [], archTriangles: number[] = [];
for (let i = 0; i <= 28; i++) {
  const angle = i / 28 * Math.PI, x = Math.cos(angle) * 1.39;
  archVertices.push(x, 2.18 + Math.sin(angle) * 1.39, 0, x, 4.08, 0);
  if (i < 28) { const a = i * 2; archTriangles.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
}
const ARCH_SPANDREL = makeSurface(archVertices, archTriangles);

export function UniversityRegion() {
  return <Place name="UNIVERSITY_COURTYARD_REGION" {...PLACE_LAYOUT.university}>
    <Platform width={14} depth={8} />
    <Solid name="ACADEMIC_GALLERY_BACK_WALL" position={[0, 1.95, -3.86]} size={[14, 3.65, .25]} color={P.plaster} finish="plaster" />
    <UniversityArchitecture />
    {[-5.55, -2.77, 0, 2.77, 5.55].map(x => <group key={x} position={[x, 0, -1.65]}>
      <Solid name="ARCADE_COLUMN" position={[-1.39, 1.18, 0]} size={[.27, 2.1, .33]} color={P.plasterShade} />
      <mesh position={[0, 2.18, 0]} castShadow receiveShadow><torusGeometry args={[1.39, .17, 6, 26, Math.PI]} /><HouseMaterial color={P.plaster} finish="plaster" /></mesh>
      <mesh castShadow receiveShadow><FieldGeometry data={ARCH_SPANDREL} /><HouseMaterial color={P.plasterShade} finish="plaster" side={2} /></mesh>
      <Part name="ARCADE_COLUMN_CAPITAL" position={[-1.39, 2.19, 0]} size={[.42, .19, .46]} color={P.stoneLight} finish="plaster" />
    </group>)}
    <Solid name="ARCADE_END_COLUMN" position={[6.94, 1.18, -1.65]} size={[.27, 2.1, .33]} color={P.plasterShade} />
    <WorldLettering text="Caderno de campo" subtitle="Ciência da Computação" position={[0, 3.29, -3.711]} width={3.45} />
    <Part name="ACADEMIC_CHALKBOARD_FRAME" position={[-3.5, 2.05, -3.67]} size={[4.9, 1.7, .12]} color={P.wood} castShadow />
    <Part name="ACADEMIC_CHALKBOARD" position={[-3.5, 2.05, -3.599]} size={[4.72, 1.53, .035]} color={P.ink} />
    {[-1.8, -.55, .8, 1.85].map((x, i) => <group key={x} position={[-3.5 + x, 2.15 + (i % 2) * .3, -3.57]}>
      <mesh><circleGeometry args={[.105, 20]} /><meshBasicMaterial color={P.chalk} /></mesh>
      {i < 3 && <HouseCurve name="CHALK_NETWORK_CONNECTION" points={[[.1, 0, 0], [1.1, i % 2 ? -.3 : .3, 0]]} radius={.008} color={P.chalk} finish="paper" />}
    </group>)}
    {Array.from({ length: 5 }, (_, i) => <Part key={i} name="CHALK_STUDY_NOTATION" position={[-4.7 + i * .6, 1.61, -3.568]} size={[.38, .015, .008]} color={P.chalk} finish="paper" radius={.003} />)}
    <NoticeBoard position={[4.15, 2.12, -3.68]} title="Estudos" />
    <Worktable position={[-2.5, .13, 1.15]} width={3.3} depth={1.6} height={.8} />
    <Worktable position={[2.5, .13, 1.15]} width={3.3} depth={1.6} height={.8} />
    {[-2.5, 2.5].map((x, i) => <group key={x}><Bench position={[x, .13, 2.8]} width={2.9} back={false} /><HouseBook position={[x - .6, 1.08, 1.13]} rotation={[0, .13, 0]} color={i ? P.clay : P.sage} /><HouseBook position={[x + .37, 1.04, .81]} rotation={[0, -.17, 0]} color={P.paper} size={[.77, .07, .99]} /></group>)}
    <HousePlant position={[-6.04, .13, 2.4]} scale={2.65} /><HousePlant position={[6.04, .13, 2.4]} scale={2.65} />
    <group name="JARVIS_READING_STAND" position={[0, .13, -3.25]}>
      <Part name="READING_STAND_POST" position={[0, .54, 0]} size={[.12, 1.08, .12]} color={P.woodDark} />
      <Part name="READING_STAND_TOP" position={[0, 1.1, 0]} size={[1.05, .1, .62]} color={P.woodLight} rotation={[.18, 0, 0]} />
      <HouseBook position={[0, 1.2, 0]} color={P.sage} size={[.7, .08, .48]} />
      <WorldLettering text="Jarvis" subtitle="Consultar o caderno · E" position={[0, .8, .12]} width={.86} />
    </group>
    <UniversityDetails />
  </Place>;
}
