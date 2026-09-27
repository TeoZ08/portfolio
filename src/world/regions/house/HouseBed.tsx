"use client";

import { FieldGeometry } from "../field/FieldMeshes";
import { HouseBlockout as Part, HouseInstances } from "./HouseBlockout";
import { HouseMaterial } from "./HouseMaterial";
import { HouseBook, SoftObject } from "./HouseObjects";
import { quiltSurface } from "./house-geometry";
import { HOUSE_PALETTE as P } from "./house-palette";

const QUILT = quiltSurface();
const STITCHES = Array.from({ length: 22 }, (_, i) => ({
  position: [-1.4 + i * 0.13, 1.227, -0.55] as const,
  scale: [0.045, 0.006, 0.016] as const, color: P.thread,
}));

export function HouseBed() {
  return <group name="HOUSE_BED_VISUAL_PROTOTYPE" position={[-4.4, 0, -3.25]}>
    {[-1, 1].flatMap(x => [-1, 1].map(z => <Part key={`${x}:${z}`} name="BED_WOOD_FOOT"
      position={[x * 1.49, 0.29, z * 1.97]} size={[0.2, 0.56, 0.2]} color={P.woodDark} radius={0.055} castShadow />))}
    <Part name="BED_FRAME_RAIL" position={[0, 0.52, 0]} size={[3.5, 0.27, 4.5]} color={P.wood} radius={0.1} castShadow />
    <Part name="BED_MATTRESS" position={[0, 0.87, 0]} size={[3.28, 0.5, 4.25]} color={P.linenLight} finish="fabric" radius={0.18} castShadow />
    <Part name="BED_MATTRESS_PIPING" position={[0, 0.83, 0]} size={[3.31, 0.018, 4.27]} color={P.paperEdge} finish="fabric" radius={0.009} />
    <Part name="BED_ROUNDED_HEADBOARD" position={[0, 1.36, -2.13]} size={[3.5, 1.75, 0.2]} color={P.woodLight} radius={0.09} castShadow />
    <Part name="BED_HEADBOARD_INSET" position={[0, 1.39, -1.995]} size={[3.13, 0.91, 0.09]} color={P.linenShade} finish="fabric" radius={0.04} />
    {[-1, 1].map(side => <SoftObject key={side} name="BED_SOFT_PILLOW" position={[side * 0.76, 1.17, -1.43]}
      size={[1.47, 0.34, 0.83]} rotation={[0.04, side * 0.06, side * 0.03]} color={P.paper} castShadow />)}
    <mesh name="BED_SAGE_QUILT_WITH_DRAPED_EDGES" castShadow receiveShadow>
      <FieldGeometry data={QUILT} /><HouseMaterial color={P.linen} finish="fabric" side={2} />
    </mesh>
    <Part name="BED_FOLDED_QUILT_EDGE" position={[-0.025, 1.225, -0.69]} size={[3.1, 0.1, 0.43]}
      rotation={[0.018, 0.015, 0.009]} color={P.linenShade} finish="fabric" radius={0.049} />
    <HouseInstances name="BED_HEM_STITCHING" instances={STITCHES} finish="fabric" />
    <Part name="BED_FOOT_THROW" position={[0.025, 1.22, 1.55]} size={[3.05, 0.065, 0.72]}
      color={P.linenLight} rotation={[0.008, -0.03, 0.01]} finish="fabric" radius={0.03} />
    {[-1, 1].map(side => <Part key={side} name="THROW_WOVEN_BAND" position={[0.02, 1.259, 1.55 + side * 0.23]}
      size={[3.01, 0.008, 0.055]} color={P.clay} finish="fabric" rotation={[0, -0.03, 0]} radius={0.003} />)}
    <HouseBook position={[-0.79, 1.35, 1.57]} rotation={[0, -0.16, 0.035]} size={[0.56, 0.105, 0.74]} color={P.ochre} />
  </group>;
}
