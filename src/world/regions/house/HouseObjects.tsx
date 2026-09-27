"use client";

import { useMemo } from "react";
import { FieldGeometry, FieldInstances } from "../field/FieldMeshes";
import { makeLeafSurface, organicEllipsoid, type Point3, type FieldInstance } from "../field/field-geometry";
import { HouseBlockout as Part } from "./HouseBlockout";
import { HouseMaterial, type HouseFinish } from "./HouseMaterial";
import { tubeSurface } from "./house-geometry";
import { HOUSE_PALETTE as P } from "./house-palette";

const SOFT_SHAPE = organicEllipsoid(24, 14, 0.035);
const LEAF = makeLeafSurface();
const PLANT_LEAVES: FieldInstance[] = Array.from({ length: 13 }, (_, i) => {
  const angle = i * 2.4, ring = i < 8 ? 0.26 : 0.14;
  return { position: [Math.sin(angle) * ring, 0.42 + (i % 4) * 0.12, Math.cos(angle) * ring],
    scale: [0.12, 0.1, 0.28], rotation: [-0.45 + (i % 3) * 0.22, angle, 0.35],
    color: i % 3 ? P.foliage : P.foliageLight };
});

export function SoftObject({ name, position, size, color, rotation = [0, 0, 0], finish = "fabric", castShadow = false }: {
  name: string; position: Point3; size: Point3; color: string; rotation?: Point3; finish?: HouseFinish; castShadow?: boolean;
}) {
  return <mesh name={name} position={position} rotation={rotation}
    scale={[size[0] / 2, size[1] / 2, size[2] / 2]} castShadow={castShadow} receiveShadow>
    <FieldGeometry data={SOFT_SHAPE} />
    <HouseMaterial color={color} finish={finish} />
  </mesh>;
}

export function HouseCurve({ name, points, radius = 0.025, color = P.metal, finish = "metal" }: {
  name: string; points: readonly Point3[]; radius?: number; color?: string; finish?: HouseFinish;
}) {
  const data = useMemo(() => tubeSurface(points, radius), [points, radius]);
  return <mesh name={name} receiveShadow>
    <FieldGeometry data={data} />
    <HouseMaterial color={color} finish={finish} side={2} />
  </mesh>;
}

export function HouseBook({ position, rotation = [0, 0, 0], color = P.slate, size = [0.62, 0.12, 0.85] }: {
  position: Point3; rotation?: Point3; color?: string; size?: [number, number, number];
}) {
  const [w, h, d] = size;
  return <group name="HOUSE_STUDY_BOOK" position={position} rotation={rotation}>
    <Part name="BOOK_PAGE_BLOCK" position={[0.016, 0, 0]} size={[w - 0.035, h - 0.025, d - 0.04]} color={P.paper} finish="paper" radius={0.008} />
    {[-1, 1].map((side) => <Part key={side} name="BOOK_COVER" position={[0, side * h / 2, 0]}
      size={[w, 0.02, d]} color={color} finish="fabric" radius={0.008} />)}
    <Part name="BOOK_SPINE" position={[-w / 2, 0, 0]} size={[0.032, h, d]} color={color} finish="fabric" radius={0.012} />
    <Part name="BOOK_PLACE_MARKER" position={[w * 0.19, h / 2 + 0.006, d / 2 - 0.015]}
      size={[0.045, 0.006, 0.14]} color={P.ochre} finish="fabric" radius={0.002} />
  </group>;
}

export function HousePlant({ position, scale = 1 }: { position: Point3; scale?: number }) {
  return <group name="HOUSE_WINDOWSILL_PLANT" position={position} scale={scale}>
    <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.23, 0.17, 0.36, 24]} />
      <HouseMaterial color={P.clay} finish="ceramic" />
    </mesh>
    <mesh position={[0, 0.366, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.211, 24]} /><HouseMaterial color={P.soil} />
    </mesh>
    <FieldInstances name="HOUSE_PLANT_LEAVES" data={LEAF} instances={PLANT_LEAVES} doubleSided />
  </group>;
}

export function HouseMug({ position }: { position: Point3 }) {
  return <group name="HOUSE_EVERYDAY_CERAMIC_MUG" position={position}>
    <mesh position={[0, 0.15, 0]} receiveShadow>
      <cylinderGeometry args={[0.14, 0.12, 0.29, 24, 1, true]} />
      <HouseMaterial color={P.ceramic} finish="ceramic" side={2} />
    </mesh>
    <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.131, 0.012, 6, 24]} /><HouseMaterial color={P.ceramic} finish="ceramic" />
    </mesh>
    <mesh position={[0, 0.248, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.125, 24]} /><HouseMaterial color={P.woodDark} />
    </mesh>
    <mesh position={[0.15, 0.17, 0]}>
      <torusGeometry args={[0.085, 0.022, 8, 20]} /><HouseMaterial color={P.ceramic} finish="ceramic" />
    </mesh>
  </group>;
}

export function HouseHeadphones({ position }: { position: Point3 }) {
  return <group name="HOUSE_HEADPHONES_LEFT_ON_DESK" position={position} rotation={[Math.PI / 2, 0.16, -0.3]}>
    <mesh><torusGeometry args={[0.25, 0.035, 8, 26, Math.PI]} /><HouseMaterial color={P.ink} finish="paint" /></mesh>
    {[-1, 1].map(side => <group key={side} position={[side * 0.25, -0.045, 0]}>
      <Part name="HEADPHONE_CUP" position={[0, 0, 0]} size={[0.16, 0.25, 0.17]} color={P.metal} finish="paint" radius={0.06} />
      <Part name="HEADPHONE_PAD" position={[-side * 0.06, 0, 0]} size={[0.09, 0.22, 0.15]} color={P.woodDark} finish="fabric" radius={0.045} />
    </group>)}
  </group>;
}
