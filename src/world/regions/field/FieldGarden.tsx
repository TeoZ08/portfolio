"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { FieldInstances } from "./FieldMeshes";
import { organicEllipsoid, type FieldInstance } from "./field-geometry";
import { HOUSE_CENTER, seededRandom } from "./field-layout";
import { FIELD_PALETTE as P } from "./field-palette";

const STONE = organicEllipsoid(14, 8, .13);
const random = seededRandom(713);
const masonry: FieldInstance[] = [];
const planting: FieldInstance[] = [];
const paving: FieldInstance[] = [];
for (const side of [-1, 1]) {
  for (let row = 0; row < 3; row++) for (let i = 0; i < 8; i++) {
    masonry.push({
      position: [side * (3.4 + i * .57 + (row % 2) * .13), .16 + row * .22, 8.9 + .08 * Math.sin(i)],
      scale: [.34 + random() * .08, .15, .29 + random() * .06],
      rotation: [0, random() * .3, random() * .06], color: i % 3 ? P.stone : P.stoneLight,
    });
  }
  for (let i = 0; i < 14; i++) {
    const x = side * (3.1 + random() * 4.6);
    const z = 7.2 + random() * 1.1;
    const height = .28 + random() * .44;
    planting.push({ position: [x, height * .6, z], scale: [.4 + random() * .28, height, .4],
      rotation: [0, random() * 6, 0], color: i % 3 ? P.foliage : P.foliageLight });
  }
}
for (let i = 0; i < 5; i++) paving.push({
  position: [(i % 2 ? .13 : -.13), .045, 7.2 + i * .72],
  scale: [.82, .055, .38], rotation: [0, (random() - .5) * .14, 0], color: P.stoneLight,
});

export function FieldGarden() {
  return <group name="HOUSE_ENCLOSED_FRONT_GARDEN" position={[HOUSE_CENTER[0], 0, HOUSE_CENTER[1]]}>
    {[-1, 1].map(side => <RigidBody key={side} type="fixed" colliders={false} name="GARDEN_LOW_WALL_COLLIDER">
      <CuboidCollider args={[2.4, .37, .32]} position={[side * 5.6, .37, 8.9]} />
    </RigidBody>)}
    <FieldInstances name="GARDEN_DRY_STONE_BOUNDARY" data={STONE} instances={masonry} castShadow />
    <FieldInstances name="GARDEN_LAYERED_SAGE_PLANTING" data={STONE} instances={planting} castShadow />
    <FieldInstances name="GARDEN_IRREGULAR_ENTRY_STONES" data={STONE} instances={paving} />
  </group>;
}
