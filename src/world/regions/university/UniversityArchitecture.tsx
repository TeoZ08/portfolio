"use client";

import { FieldGeometry, FieldInstances } from "../field/FieldMeshes";
import { makeRoofTile } from "../field/field-house-details";
import { makeSurface, type FieldInstance } from "../field/field-geometry";
import { HouseMaterial } from "../house/HouseMaterial";
import { Part, Solid, HouseInstances, PLACE_PALETTE as P } from "../places/PlaceObjects";

const PITCH = Math.atan2(.72, 1.43), LENGTH = Math.hypot(.72, 1.43);
const TILE = makeRoofTile();
const ROOF_TILES: FieldInstance[] = [];
for (const side of [-1, 1]) for (let row = 0; row < 3; row++) for (let col = 0; col < 26; col++) {
  const distance = (row+.35)*LENGTH/3;
  ROOF_TILES.push({ position: [-7.28+col*.581+(row%2)*.018, 4.875-Math.sin(PITCH)*distance, -2.86+side*Math.cos(PITCH)*distance],
    rotation: [side*PITCH, 0, 0], scale: [.94, .8, .76], color: (row+col)%6 === 0 ? P.roofLight : col%5 === 0 ? P.roofShade : P.roof });
}
const GABLE = makeSurface([0, 4.08, -4.3, 0, 4.8, -2.86, 0, 4.08, -1.43], [0, 1, 2]);
const PAVING_BORDER: FieldInstance[] = [];
for (const x of [-6.73, 6.73]) for (let i = 0; i < 11; i++) {
  PAVING_BORDER.push({ position: [x, .139, -3.61+i*.685], scale: [.29, .016, .59], color: P.clay });
}

export function UniversityArchitecture() {
  return <group name="UNIVERSITY_CLOISTER_ENVELOPE">
    {[-1, 1].map(side => <group key={side}>
      <Part name="CLOISTER_ROOF_UNDERSIDE" position={[0, 4.44, -2.86+side*.715]} size={[15.12, .13, LENGTH+.17]}
        rotation={[side*PITCH, 0, 0]} color={P.roofShade} castShadow />
      <Part name="CLOISTER_EAVE_FASCIA" position={[0, 4.035, -2.86+side*1.52]} size={[15.24, .18, .17]} color={P.woodDark} castShadow />
      <mesh position={[side*7.01, 0, 0]} castShadow receiveShadow><FieldGeometry data={GABLE} /><HouseMaterial color={P.plasterShade} finish="plaster" side={2} /></mesh>
      <Part name="CLOISTER_BARGEBOARD_REAR" position={[side*7.59, 4.445, -3.585]} size={[.16, .15, LENGTH+.19]} rotation={[-PITCH, 0, 0]} color={P.wood} />
      <Part name="CLOISTER_BARGEBOARD_FRONT" position={[side*7.59, 4.445, -2.135]} size={[.16, .15, LENGTH+.19]} rotation={[PITCH, 0, 0]} color={P.wood} />
      <Solid name="CLOISTER_LOW_SIDE_RETURN" position={[side*6.85, .58, -2.71]} size={[.27, .92, 2.3]} color={P.plasterShade} finish="plaster" />
      <Part name="CLOISTER_SIDE_RETURN_CAP" position={[side*6.85, 1.085, -2.71]} size={[.4, .09, 2.38]} color={P.stoneLight} finish="plaster" />
    </group>)}
    <FieldInstances name="CLOISTER_CLAY_ROOF_TILES" data={TILE} instances={ROOF_TILES} doubleSided />
    <Part name="CLOISTER_RIDGE" position={[0, 4.91, -2.86]} size={[15.28, .12, .19]} color={P.roofLight} radius={.055} />
    <HouseInstances name="CLOISTER_PAVING_INLAY" instances={PAVING_BORDER} finish="plaster" />
    {[-6.94, -4.16, -1.39, 1.38, 4.16, 6.94].map(x => <group key={x}>
      <Part name="ARCADE_STONE_BASE" position={[x, .27, -1.65]} size={[.48, .28, .52]} color={P.stone} finish="plaster" />
      <Part name="ARCADE_BASE_MOULDING" position={[x, .43, -1.65]} size={[.38, .06, .43]} color={P.stoneLight} finish="plaster" />
    </group>)}
    <Part name="CLOISTER_FRONT_CORNICE" position={[0, 3.99, -1.46]} size={[14.34, .17, .23]} color={P.plaster} finish="plaster" />
  </group>;
}
