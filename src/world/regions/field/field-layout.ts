// X/Z control points retain the approved 004A route and footprint.
export type FieldPoint = readonly [number, number];
export const FIELD_PATH_POINTS: readonly FieldPoint[] = [
  [0, 34], [0, -10], [14, -18], [14, -34],
  [0, -46], [0, -24], [-16, -24], [-16, -32],
];
export const HOUSE_CENTER = [-16, -38] as const;
export const TREE_CENTER = [-5, -20] as const;
export const FIELD_BOUNDS = { minX: -55, maxX: 55, minZ: -105, maxZ: 35 };
export const TERRAIN_COLUMNS = 88;
export const TERRAIN_ROWS = 112;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function makePathSamples(): FieldPoint[] {
  const result: FieldPoint[] = [FIELD_PATH_POINTS[0]];
  for (let i = 1; i < FIELD_PATH_POINTS.length - 1; i += 1) {
    const previous = FIELD_PATH_POINTS[i - 1];
    const corner = FIELD_PATH_POINTS[i];
    const next = FIELD_PATH_POINTS[i + 1];
    const before = Math.hypot(corner[0] - previous[0], corner[1] - previous[1]);
    const after = Math.hypot(next[0] - corner[0], next[1] - corner[1]);
    const radius = Math.min(3.2, before * 0.22, after * 0.22);
    const a: FieldPoint = [
      corner[0] + (previous[0] - corner[0]) * radius / before,
      corner[1] + (previous[1] - corner[1]) * radius / before,
    ];
    const b: FieldPoint = [
      corner[0] + (next[0] - corner[0]) * radius / after,
      corner[1] + (next[1] - corner[1]) * radius / after,
    ];
    result.push(a);
    for (let step = 1; step <= 10; step += 1) {
      const t = step / 10;
      result.push([
        (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * corner[0] + t * t * b[0],
        (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * corner[1] + t * t * b[1],
      ]);
    }
  }
  result.push(FIELD_PATH_POINTS[FIELD_PATH_POINTS.length - 1]);
  return result;
}

export const FIELD_PATH_SAMPLES = makePathSamples();

export function pathDistance(x: number, z: number) {
  let distance = Infinity;
  for (let i = 1; i < FIELD_PATH_SAMPLES.length; i += 1) {
    const a = FIELD_PATH_SAMPLES[i - 1];
    const b = FIELD_PATH_SAMPLES[i];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz));
    distance = Math.min(distance, Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz));
  }
  return distance;
}

export function insideHouse(x: number, z: number, margin = 0) {
  return Math.abs(x - HOUSE_CENTER[0]) < 8 + margin &&
    Math.abs(z - HOUSE_CENTER[1]) < 6 + margin;
}

// Low, broad rises; landing and house apron remain flat. No runtime noise.
export function terrainHeight(x: number, z: number) {
  const landingMask = smooth((Math.hypot(x, z - 4.5) - 3.5) / 6);
  const houseMask = smooth((Math.max(Math.abs(x + 16) - 8, Math.abs(z + 38) - 6) - 1) / 5);
  const broad = 0.19 * Math.sin(x * 0.12) * Math.sin((z + 4) * 0.095) +
    0.09 * Math.sin(x * 0.3 + z * 0.16);
  const eastRise = 0.65 * Math.exp(-(((x - 30) / 13) ** 2) - ((z + 38) / 22) ** 2);
  const westBank = 1.5 * Math.exp(-(((x + 35) / 14) ** 2) - ((z + 8) / 20) ** 2);
  const backBank = 1.8 * Math.exp(-(((x - 20) / 20) ** 2) - ((z + 75) / 18) ** 2);
  return (broad + eastRise + westBank + backBank) * landingMask * houseMask;
}

// Exact barycentric height of the rendered/collision grid, also used by props/path.
export function surfaceHeight(x: number, z: number) {
  const stepX = (FIELD_BOUNDS.maxX - FIELD_BOUNDS.minX) / TERRAIN_COLUMNS;
  const stepZ = (FIELD_BOUNDS.maxZ - FIELD_BOUNDS.minZ) / TERRAIN_ROWS;
  const gx = (x - FIELD_BOUNDS.minX) / stepX;
  const gz = (z - FIELD_BOUNDS.minZ) / stepZ;
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  const u = gx - ix;
  const v = gz - iz;
  const x0 = FIELD_BOUNDS.minX + ix * stepX;
  const z0 = FIELD_BOUNDS.minZ + iz * stepZ;
  const a = terrainHeight(x0, z0);
  const b = terrainHeight(x0 + stepX, z0);
  const c = terrainHeight(x0, z0 + stepZ);
  const d = terrainHeight(x0 + stepX, z0 + stepZ);
  return u + v <= 1
    ? a + u * (b - a) + v * (c - a)
    : d + (1 - v) * (b - d) + (1 - u) * (c - d);
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
