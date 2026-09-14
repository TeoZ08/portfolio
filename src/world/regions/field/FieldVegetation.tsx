"use client";

import { BallCollider, RigidBody } from "@react-three/rapier";
import { FieldInstances } from "./FieldMeshes";
import { makeLeafSurface, makeSurface, organicEllipsoid, type FieldInstance } from "./field-geometry";
import { insideHouse, pathDistance, seededRandom, surfaceHeight } from "./field-layout";
import { FIELD_PALETTE as P } from "./field-palette";

// Hand-composed elliptical beds. Seeded sampling only fills these beds; paths,
// the house apron and the open center are explicitly kept clear.
const BEDS = [
  [-7, 10, 4.5, 6, 850], [7, 2, 4, 8, 950], [-12, -8, 7, 7, 1000],
  [7, -9, 3, 4, 480], [-6, -18, 6, 5, 700], [23, -25, 7, 10, 1250],
  [23, -44, 7, 8, 850], [-31, -29, 5, 9, 900], [-29, -47, 7, 5, 600],
  [9, -53, 9, 6, 850], [-17, -16, 5, 4, 500], [35, -65, 11, 9, 600],
  [-22, -1, 9, 4, 1400], [-25, -14, 6, 4, 950],
] as const;

function makeTuft() {
  const vertices: number[] = [], indices: number[] = [];
  for (let blade = 0; blade < 5; blade += 1) {
    const angle = blade * 2.39996;
    const dx = Math.cos(angle), dz = Math.sin(angle);
    const h = 0.38 + blade % 3 * 0.1;
    const a = vertices.length / 3;
    vertices.push(
      -dz * 0.022, 0, dx * 0.022,
      dz * 0.022, 0, -dx * 0.022,
      dx * 0.08 + dz * 0.022, h * 0.65, dz * 0.08 - dx * 0.022,
      dx * 0.08 - dz * 0.022, h * 0.65, dz * 0.08 + dx * 0.022,
      dx * 0.19, h, dz * 0.19,
    );
    indices.push(a, a + 1, a + 2, a, a + 2, a + 3, a + 3, a + 2, a + 4);
  }
  const tuft = makeSurface(vertices, indices);
  // Upward-biased blade normals give grass a soft, illustrated mass instead of
  // alternating black/white faces. This is static geometry, not a lighting hack per frame.
  for (let i = 0; i < tuft.normals.length; i += 3) {
    tuft.normals[i] *= 0.2;
    tuft.normals[i + 1] = 0.96;
    tuft.normals[i + 2] *= 0.2;
  }
  return tuft;
}

const TUFT = makeTuft();
const SHRUB = organicEllipsoid(16, 10, 0.2);
const ROCK = organicEllipsoid(16, 10, 0.15);
const LEAF = makeLeafSurface();
const FLOWER = makeSurface(
  [-0.1, 0, 0, 0, 0.015, -0.1, 0.1, 0, 0, 0, 0.015, 0.1, 0, 0.045, 0],
  [0, 4, 1, 1, 4, 2, 2, 4, 3, 3, 4, 0],
);

const ROCK_ANCHORS = [
  [-5.6, 8, 0.85], [5.6, 6, 0.65], [-8, -4, 0.65], [5.7, -17.2, 0.55],
  [-8.7, -18.2, 0.9], [20.5, -22, 0.9], [23, -35, 0.7],
  [-29.4, -31, 0.85], [-28, -43, 0.65], [8.5, -51, 0.6],
] as const;

function composeVegetation() {
  const random = seededRandom(50517);
  const grass: FieldInstance[] = [], shrubs: FieldInstance[] = [], leaves: FieldInstance[] = [];
  const flowers: FieldInstance[] = [], rocks: FieldInstance[] = [];
  const grassColors = [P.grass, P.grassLight, P.grass, P.grassDry];
  BEDS.forEach(([cx, cz, rx, rz, count], bedIndex) => {
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2, radius = Math.sqrt(random());
      const x = cx + Math.cos(angle) * radius * rx;
      const z = cz + Math.sin(angle) * radius * rz;
      if (pathDistance(x, z) < 2.95 || insideHouse(x, z, 1.5)) continue;
      // Fade the bed into the meadow instead of drawing a hard elliptical edge.
      if (random() > Math.min(1, (1 - radius) * 3.5)) continue;
      const scale = 0.4 + random() * 0.5;
      const y = surfaceHeight(x, z);
      grass.push({ position: [x, y - 0.015, z], scale: [scale, scale, scale],
        rotation: [0, random() * 6.28, 0], color: grassColors[Math.floor(random() * 4)] });
      if (i % 23 === 0 && bedIndex % 3 !== 2) {
        flowers.push({ position: [x, y + scale * 0.59, z], scale: [1, 1, 1],
          rotation: [random() * 0.5, random() * 6.28, 0], color: i % 2 ? P.flower : P.flowerGold });
      }
      if (i % 110 === 0 && radius < 0.65 && pathDistance(x, z) > 4.2) {
        const size = 0.38 + random() * 0.38;
        shrubs.push({ position: [x, y + size * 0.48, z], scale: [size * 1.35, size * 0.8, size],
          rotation: [0.1, random() * 6.28, -0.12], color: i % 3 ? P.foliage : P.foliageLight });
      }
    }
  });
  ROCK_ANCHORS.forEach(([x, z, size], index) => {
    rocks.push({ position: [x, surfaceHeight(x, z) + size * 0.46, z],
      scale: [size * 1.25, size * 0.92, size], rotation: [0.12, random() * 6.28, 0.18],
      color: index % 2 ? P.stone : P.stoneShade });
    for (let i = 0; i < 5; i += 1) {
      const angle = random() * 6.28, distance = size + random() * 0.9;
      const px = x + Math.cos(angle) * distance, pz = z + Math.sin(angle) * distance;
      if (pathDistance(px, pz) < 2.8) continue;
      const small = 0.12 + random() * 0.18;
      rocks.push({ position: [px, surfaceHeight(px, pz) + small * 0.3, pz],
        scale: [small * 1.6, small * 0.6, small], rotation: [0, angle, 0.2], color: P.stoneLight });
    }
  });
  for (const shrub of shrubs) {
    for (let i = 0; i < 150; i += 1) {
      const angle = random() * 6.28;
      const v = random();
      const ring = Math.sqrt(1 - v * v);
      const size = 0.1 + random() * 0.1;
      leaves.push({ position: [shrub.position[0] + Math.cos(angle) * ring * shrub.scale[0] * 1.14,
        shrub.position[1] + v * shrub.scale[1] * 1.14, shrub.position[2] + Math.sin(angle) * ring * shrub.scale[2] * 1.14],
        scale: [size, size, size * 1.3], rotation: [random() * 0.4, angle, random() * 0.3],
        color: i % 4 === 0 ? P.foliageLight : P.foliage });
    }
  }
  return { grass, shrubs, flowers, rocks, leaves };
}

const VEGETATION = composeVegetation();

export function FieldVegetation() {
  return (
    <group name="FIELD_COMPOSED_VEGETATION_PROTOTYPE">
      <FieldInstances name="FIELD_GRASS_BEDS" data={TUFT} instances={VEGETATION.grass} doubleSided />
      <FieldInstances name="FIELD_LOW_SHRUBS" data={SHRUB} instances={VEGETATION.shrubs} castShadow />
      <FieldInstances name="FIELD_SHRUB_LEAVES" data={LEAF} instances={VEGETATION.leaves} doubleSided />
      <FieldInstances name="FIELD_MEADOW_FLOWERS" data={FLOWER} instances={VEGETATION.flowers} doubleSided />
      <FieldInstances name="FIELD_COMPOSITION_STONES" data={ROCK} instances={VEGETATION.rocks} castShadow />
      <RigidBody type="fixed" colliders={false} name="FIELD_LARGE_STONE_COLLIDERS">
        {ROCK_ANCHORS.map(([x, z, size]) => (
          <BallCollider key={`${x}:${z}`} args={[size]} position={[x, surfaceHeight(x, z) + size * 0.3, z]} />
        ))}
      </RigidBody>
    </group>
  );
}
