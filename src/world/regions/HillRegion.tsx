"use client";

import { Place, Part, Bench, WorldLettering, PLACE_PALETTE as P } from "./places/PlaceObjects";
import { FieldInstances } from "./field/FieldMeshes";
import { organicEllipsoid, type FieldInstance } from "./field/field-geometry";
import { surfaceHeight } from "./field/field-layout";
import { PLACE_LAYOUT } from "./places/place-layout";

const STONE = organicEllipsoid(18, 10, .09);
const STONES: FieldInstance[] = [-1, 0, 1, 2, 3].map((index) => {
  const x = 2.1 + index * 1.7, z = -92.9 + Math.sin(index) * .55;
  return { position: [x, surfaceHeight(x, z) + .33, z], scale: [.95, .48, .58], rotation: [0, index * .6, .07], color: index % 2 ? P.stone : P.stoneLight };
});
export function HillRegion() {
  return <group name="HILL_LOOKOUT_REGION">
    <Place name="HILL_CONTEMPLATION_BENCH" {...PLACE_LAYOUT.hill}>
      <Bench position={[0, .025, 0]} width={3.5} />
      <Part name="LOOKOUT_NOTEBOOK" position={[1.15, .85, -.02]} size={[.44, .06, .58]} color={P.sage} finish="fabric" rotation={[0, .17, 0]} />
    </Place>
    <FieldInstances name="LOOKOUT_LOW_STONE_EDGE" data={STONE} instances={STONES} castShadow />
    <Place name="LOOKOUT_SMALL_WAYMARK" x={3.1} z={-84.7} yaw={.27}>
      <Part name="WAYMARK_POST" position={[0, .63, 0]} size={[.15, 1.26, .16]} color={P.woodDark} />
      <Part name="WAYMARK_BOARD" position={[0, 1.29, 0]} size={[1.8, .62, .11]} color={P.wood} />
      <WorldLettering text="Um pouco de horizonte" position={[0, 1.29, .058]} width={1.66} />
    </Place>
  </group>;
}
