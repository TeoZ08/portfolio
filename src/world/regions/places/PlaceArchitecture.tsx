"use client";

import { useMemo } from "react";
import { FieldInstances } from "../field/FieldMeshes";
import { makeLeafSurface, organicEllipsoid, type FieldInstance, type Point3 } from "../field/field-geometry";
import { seededRandom } from "../field/field-layout";
import { HouseMaterial } from "../house/HouseMaterial";
import { Part, HouseCurve, PLACE_PALETTE as P } from "./PlaceObjects";

const STONE = organicEllipsoid(14, 9, .065);
const LEAF = makeLeafSurface();

// Visual finishes stay against the existing wall footprint. They do not add
// walls, change circulation, or introduce another set of building colliders.
export function WallFooting({ width, z, color = P.stone }: { width: number; z: number; color?: string }) {
  const stones = useMemo<FieldInstance[]>(() => {
    const count = Math.ceil(width / .62), step = width / count;
    return Array.from({ length: count }, (_, i) => ({
      position: [-width / 2 + (i + .5) * step, .21, z],
      scale: [step * .54, .2 + (i % 3) * .013, .16],
      rotation: [0, (i % 5) * .06, .04 * Math.sin(i)], color: i % 4 ? color : P.stoneLight,
    }));
  }, [width, z, color]);
  return <group name="HAND_LAID_BUILDING_FOOTING">
    <FieldInstances name="FOUNDATION_STONES" data={STONE} instances={stones} />
    <Part name="FOUNDATION_CAP" position={[0, .4, z]} size={[width, .085, .27]} color={P.stoneLight} finish="plaster" />
  </group>;
}

export function KneeBraces({ x, y, z, direction = 1 }: { x: number; y: number; z: number; direction?: number }) {
  return <group name="TIMBER_KNEE_BRACES">
    <Part name="BRACE_TO_BEAM" position={[x + direction * .28, y - .26, z]} size={[.12, .82, .14]}
      rotation={[0, 0, -direction * .72]} color={P.wood} castShadow />
    <Part name="JOINERY_WOODEN_PEG" position={[x, y - .53, z + .085]} size={[.065, .065, .015]} color={P.woodLight} radius={.03} />
  </group>;
}

export function ClimbingPlant({ position, height = 3.4, seed = 42, rotationY = 0 }: {
  position: [number, number, number]; height?: number; seed?: number; rotationY?: number;
}) {
  const foliage = useMemo<FieldInstance[]>(() => {
    const random = seededRandom(seed), instances: FieldInstance[] = [];
    // Three authored stems; seeded leaves fill only these narrow climbing shapes.
    for (let stem = 0; stem < 3; stem++) for (let i = 0; i < 80; i++) {
      const t = random(), angle = random() * Math.PI * 2;
      const spread = .16 + t * .24, size = .095 + random() * .065;
      const centerX = Math.sin(t * 5 + stem) * .17 + (stem - 1) * t * .42;
      instances.push({ position: [centerX + Math.cos(angle) * spread, .12 + t * height, .06 + Math.sin(angle) * spread * .62],
        scale: [size, size, size * 1.18], rotation: [.5 + random() * .8, angle, random() * .9],
        color: i % 5 === 0 ? P.foliageLight : i % 3 ? P.foliage : P.foliageShade });
    }
    return instances;
  }, [height, seed]);
  return <group name="AUTHORED_CLIMBING_PLANT" position={position} rotation={[0, rotationY, 0]}>
    {[-1, 0, 1].map(stem => <HouseCurve key={stem} name="CLIMBER_WOODY_STEM" radius={.017} color={P.wood}
      points={[[0, 0, 0], [.08, height * .3, .07], [stem * .24, height * .64, .05], [stem * .48, height, .03]]} />)}
    <FieldInstances name="CLIMBER_LEAVES" data={LEAF} instances={foliage} doubleSided sway={.06} />
  </group>;
}

export function WallLantern({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return <group name="SMALL_UNLIT_WALL_LANTERN" position={position} rotation={[0, rotationY, 0]}>
    <Part name="LANTERN_WALL_FIXING" position={[0, .14, 0]} size={[.13, .38, .1]} color={P.iron} finish="metal" />
    <HouseCurve name="LANTERN_BRACKET" points={[[0, .26, .03], [0, .33, .18], [0, .24, .31]]} color={P.iron} radius={.035} />
    <Part name="LANTERN_MATTE_GLASS" position={[0, -.03, .31]} size={[.23, .33, .2]} color={P.canvas} finish="ceramic" radius={.025} />
    {[-1, 1].map(side => <group key={side}>
      <Part name="LANTERN_CAP" position={[0, side * .21 - .03, .31]} size={[.33, .09, .3]} color={P.iron} radius={.03} />
      <Part name="LANTERN_EDGE" position={[side * .13, -.03, .42]} size={[.035, .39, .035]} color={P.iron} />
    </group>)}
  </group>;
}

export function Downpipe({ position, height }: { position: Point3; height: number }) {
  return <group name="RAIN_DOWNPIPE" position={position}>
    <HouseCurve name="DRAIN_PIPE" points={[[0, height, 0], [0, height - .3, -.15], [0, .3, -.15], [.14, .12, -.25]]} radius={.055} color={P.iron} />
    {[.65, height - .85].map(y => <mesh key={y} position={[0, y, -.15]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[.067, .012, 6, 12]} /><HouseMaterial color={P.woodDark} finish="metal" />
    </mesh>)}
  </group>;
}
