"use client";

import { FieldGeometry } from "../field/FieldMeshes";
import { makeSurface, type FieldInstance } from "../field/field-geometry";
import { HouseMaterial } from "../house/HouseMaterial";
import { Part, Solid, HouseInstances, PLACE_PALETTE as P } from "../places/PlaceObjects";

const PITCH = Math.atan2(.7, 1.7);
const SLOPE = Math.hypot(.7, 1.7);
const GABLE = makeSurface([0, 4.05, -3.9, 0, 4.75, -2.2, 0, 4.05, -.5], [0, 1, 2]);
const SEAMS: FieldInstance[] = [];
for (const side of [-1, 1]) for (let i = 0; i < 20; i++) {
  SEAMS.push({ position: [-5.36+i*.565, 4.437, -2.2+side*.85],
    scale: [.034, .038, SLOPE+.06], rotation: [side*PITCH, 0, 0], color: P.iron });
}

function WorkshopWindow() {
  // Only the rear side is enclosed. The making table and broad front remain
  // open to the camera and the existing route through the workshop.
  return <group name="WORKSHOP_SIDE_CASEMENT" position={[5.13, 0, -2.05]} rotation={[0, Math.PI/2, 0]}>
    <Solid name="WORKSHOP_SIDE_WALL_COLLIDER" position={[0, 1.9, 0]} size={[3.22, 3.6, .24]} visual={false} />
    <Part name="WORKSHOP_WINDOW_APRON" position={[0, .735, 0]} size={[3.22, 1.27, .24]} color={P.plaster} finish="plaster" castShadow />
    <Part name="WORKSHOP_WINDOW_LINTEL" position={[0, 3.2, 0]} size={[3.22, 1, .24]} color={P.plaster} finish="plaster" castShadow />
    {[-1, 1].map(side => <group key={side}>
      <Part name="WORKSHOP_WINDOW_WALL_PIER" position={[side*1.35, 2.035, 0]} size={[.52, 1.33, .24]} color={P.plaster} finish="plaster" castShadow />
      <Part name="WORKSHOP_WINDOW_FRAME_SIDE" position={[side*1.073, 2.035, .035]} size={[.08, 1.37, .28]} color={P.woodDark} />
      <Part name="WORKSHOP_WINDOW_FRAME_RAIL" position={[0, 2.035+side*.65, .035]} size={[2.2, .085, .28]} color={P.woodDark} />
    </group>)}
    <mesh position={[0, 2.035, .04]}>
      <planeGeometry args={[2.07, 1.24]} />
      <meshStandardMaterial color={P.glass} roughness={.38} metalness={0} transparent opacity={.22} depthWrite={false} side={2} />
    </mesh>
    {[-.37, .37].map(x => <Part key={x} name="CASEMENT_MULLION" position={[x, 2.035, .04]} size={[.044, 1.28, .12]} color={P.wood} />)}
    <Part name="WORKSHOP_WINDOW_SILL" position={[0, 1.335, .08]} size={[2.39, .12, .47]} color={P.stoneLight} finish="plaster" />
    <Part name="WORKSHOP_SIDE_FOUNDATION" position={[0, .3, .13]} size={[3.23, .4, .12]} color={P.stone} finish="plaster" />
    <Part name="CASEMENT_SMALL_HANDLE" position={[.43, 1.8, -.15]} size={[.04, .17, .045]} color={P.brass} finish="metal" radius={.014} />
  </group>;
}

export function WorkshopEnvelope() {
  return <group name="WORKSHOP_ROOF_AND_ENCLOSURE">
    <WorkshopWindow />
    {[-1, 1].map(side => <group key={side}>
      <Part name="WORKSHOP_FOLDED_METAL_ROOF" position={[0, 4.4, -2.2+side*.85]} size={[11.3, .09, SLOPE+.12]}
        rotation={[side*PITCH, 0, 0]} color={side < 0 ? P.sage : P.shutter} finish="paint" castShadow />
      <Part name="WORKSHOP_EAVE_FASCIA" position={[0, 4.005, -2.2+side*1.77]} size={[11.4, .19, .13]} color={P.woodDark} castShadow />
      <mesh position={[side*5.24, 0, 0]} castShadow receiveShadow>
        <FieldGeometry data={GABLE} /><HouseMaterial color={P.plasterShade} finish="plaster" side={2} />
      </mesh>
      <Part name="WORKSHOP_GABLE_REAR_VERGE" position={[side*5.66, 4.37, -3.06]} size={[.14, .16, SLOPE+.2]} rotation={[-PITCH, 0, 0]} color={P.woodDark} />
      <Part name="WORKSHOP_GABLE_FRONT_VERGE" position={[side*5.66, 4.37, -1.34]} size={[.14, .16, SLOPE+.2]} rotation={[PITCH, 0, 0]} color={P.woodDark} />
    </group>)}
    <HouseInstances name="WORKSHOP_ROOF_STANDING_SEAMS" instances={SEAMS} finish="metal" />
    <Part name="WORKSHOP_RIDGE_CAP" position={[0, 4.79, -2.2]} size={[11.48, .09, .2]} color={P.iron} finish="metal" />
    {[-4.96, .2, 4.96].map(x => <group key={x}>
      <Part name="WORKSHOP_VISIBLE_CROSS_TIE" position={[x, 3.94, -2.2]} size={[.16, .16, 3.35]} color={P.wood} castShadow />
      <Part name="WORKSHOP_KING_POST" position={[x, 4.34, -2.2]} size={[.13, .68, .14]} color={P.wood} />
    </group>)}
    <Part name="WORKSHOP_LEFT_TOP_PLATE" position={[-5.13, 3.83, -2.03]} size={[.24, .25, 3.34]} color={P.wood} />
  </group>;
}
