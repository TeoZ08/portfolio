import { PLAN } from "../masterplan-layout";
import { FIELD_BOUNDS, TERRAIN_COLUMNS, TERRAIN_ROWS, terrainHeight } from "./field-layout";
import { makeSurface } from "./field-geometry";
import { FIELD_PALETTE as P, linearColor } from "./field-palette";

const grass = linearColor(P.grass);
const shade = linearColor(P.grassShade);
const dry = linearColor(P.grassLight);
const forestFloor = linearColor("#45574a");

export function groundColor(x: number, z: number) {
  const patch = Math.sin(x * 0.23 + Math.sin(z * 0.13)) * Math.cos(z * 0.2) * 0.5 + 0.5;
  const grain = Math.sin(x * 2.8 + z * 1.9) * Math.sin(z * 3.1 - x * 1.7) * 0.035;
  const destination = patch > 0.5 ? dry : shade;
  const strength = Math.abs(patch - 0.5) * 1.15;
  // A broad, soft bed of moss/shade under the western grove. Colour only: the
  // approved height grid, triangles and Rapier collision surface stay identical.
  const grove = Math.max(0, 1 - Math.hypot((x - PLAN.forest.x) / 12, (z - PLAN.forest.z) / 12));
  const shadeWeight = grove * grove * (3 - 2 * grove) * .72;
  return grass.map((channel, i) => {
    const meadow = Math.max(0, channel + (destination[i] - channel) * strength + grain * channel);
    return meadow + (forestFloor[i] - meadow) * shadeWeight;
  });
}

export function makeTerrainSurface() {
  const vertices: number[] = [];
  const triangles: number[] = [];
  const colors: number[] = [];
  for (let row = 0; row <= TERRAIN_ROWS; row += 1) {
    const z = FIELD_BOUNDS.minZ + row / TERRAIN_ROWS * (FIELD_BOUNDS.maxZ-FIELD_BOUNDS.minZ);
    for (let col = 0; col <= TERRAIN_COLUMNS; col += 1) {
      const x = FIELD_BOUNDS.minX + col / TERRAIN_COLUMNS * 110;
      vertices.push(x, terrainHeight(x, z), z);
      colors.push(...groundColor(x, z));
      if (row < TERRAIN_ROWS && col < TERRAIN_COLUMNS) {
        const a = row * (TERRAIN_COLUMNS + 1) + col;
        const b = a + TERRAIN_COLUMNS + 1;
        triangles.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  return makeSurface(vertices, triangles, colors);
}

export const FIELD_TERRAIN_SURFACE = makeTerrainSurface();
