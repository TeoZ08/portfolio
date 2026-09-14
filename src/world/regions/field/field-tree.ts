import { makeSurface, type FieldInstance, type Point3 } from "./field-geometry";
import { seededRandom } from "./field-layout";
import { FIELD_PALETTE as P, linearColor } from "./field-palette";

type BranchPoint = readonly [number, number, number, number];
const BRANCHES: readonly (readonly BranchPoint[])[] = [
  [[0, 0, 0, 0.85], [-0.25, 1.2, 0.1, 0.66], [0.1, 2.8, 0.04, 0.56], [0.85, 4.1, -0.2, 0.39], [0.55, 6.6, -0.45, 0.12]],
  [[0, 2.3, 0, 0.42], [-1.1, 3.4, 0.05, 0.33], [-2.5, 4.4, 0.3, 0.23], [-3.8, 5.8, 0.45, 0.06]],
  [[0.6, 3.9, -0.1, 0.3], [2, 4.7, 0.3, 0.24], [3.2, 5.7, 0.8, 0.12], [3.8, 6.5, 0.9, 0.04]],
  [[0.3, 3.4, -0.1, 0.34], [0.1, 4.5, -1.5, 0.23], [-1.1, 6, -2.2, 0.05]],
  [[-1.7, 4.05, 0.2, 0.2], [-2.3, 5.1, 1.5, 0.15], [-2.4, 6.3, 2.1, 0.03]],
  [[0.7, 4.8, -0.3, 0.2], [1, 6.4, 1.2, 0.13], [1.8, 7.5, 1.5, 0.03]],
  [[0, 0.45, 0, 0.38], [-0.9, 0.14, 0.7, 0.2], [-1.55, 0.02, 1.05, 0.025]],
  [[0, 0.5, 0, 0.34], [1.05, 0.15, 0.45, 0.16], [1.85, 0, 0.7, 0.02]],
  [[0, 0.35, 0, 0.34], [0.25, 0.1, -1.2, 0.19], [0.6, 0, -1.8, 0.02]],
];

function catmull(a: number, b: number, c: number, d: number, t: number) {
  return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t +
    (-a + 3 * b - 3 * c + d) * t * t * t);
}

export function makeTreeWood() {
  const points: number[] = [], indices: number[] = [], colors: number[] = [];
  const wood = linearColor(P.wood), light = linearColor(P.woodLight);
  const sides = 14;
  BRANCHES.forEach((branch) => {
    const samples: number[][] = [];
    for (let part = 0; part < branch.length - 1; part += 1) {
      for (let step = 0; step < 5; step += 1) {
        const t = step / 5;
        samples.push([0, 1, 2, 3].map((axis) => catmull(
          branch[Math.max(0, part - 1)][axis], branch[part][axis], branch[part + 1][axis],
          branch[Math.min(branch.length - 1, part + 2)][axis], t)));
      }
    }
    samples.push([...branch[branch.length - 1]]);
    const start = points.length / 3;
    samples.forEach(([x, y, z, radius], row) => {
      const a = samples[Math.max(0, row - 1)], b = samples[Math.min(samples.length - 1, row + 1)];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const tangent: Point3 = [(b[0] - a[0]) / length, (b[1] - a[1]) / length, (b[2] - a[2]) / length];
      const normalLength = Math.hypot(tangent[1], tangent[0]) || 1;
      const n: Point3 = [tangent[1] / normalLength, -tangent[0] / normalLength, 0];
      const binormal: Point3 = [-tangent[2] * n[1], tangent[2] * n[0], tangent[0] * n[1] - tangent[1] * n[0]];
      for (let col = 0; col <= sides; col += 1) {
        const angle = col / sides * Math.PI * 2;
        const r = radius * (1 + 0.055 * Math.sin(angle * 7 + row * 0.2));
        points.push(x + r * (n[0] * Math.cos(angle) + binormal[0] * Math.sin(angle)),
          y + r * (n[1] * Math.cos(angle) + binormal[1] * Math.sin(angle)),
          z + r * (n[2] * Math.cos(angle) + binormal[2] * Math.sin(angle)));
        const stripe = (0.5 + 0.5 * Math.sin(angle * 6 + row * 0.12)) * 0.35;
        colors.push(...wood.map((channel, i) => channel + (light[i] - channel) * stripe));
        if (row < samples.length - 1 && col < sides) {
          const i = start + row * (sides + 1) + col;
          indices.push(i, i + 1, i + sides + 1, i + 1, i + sides + 2, i + sides + 1);
        }
      }
    });
  });
  return makeSurface(points, indices, colors);
}

// Asymmetric, hand-positioned crown lobes; small leaf volumes break their outline.
const CROWN = [
  [-3.1, 5.7, 0.4, 1.9, 1.05, 1.6], [-2.3, 6.8, -0.9, 1.85, 1.2, 1.6],
  [-0.6, 7.5, -1.2, 1.85, 1.25, 1.6], [1.1, 7.4, -0.45, 2, 1.3, 1.7],
  [2.8, 6.3, 0.8, 1.8, 1.05, 1.65], [-1.5, 6.2, 2, 1.8, 0.95, 1.55],
  [0.5, 6.8, 1.6, 1.65, 1.2, 1.5], [2.1, 5.7, -1.4, 1.6, 0.8, 1.4],
  [-1.8, 5.5, -2.1, 1.6, 0.95, 1.3], [0, 8.3, 0.3, 1.5, 0.9, 1.3],
] as const;

export function makeTreeFoliage(): FieldInstance[] {
  const random = seededRandom(517);
  const instances: FieldInstance[] = [];
  const colors = [P.foliage, P.foliage, P.foliageLight, P.foliageShade];
  CROWN.forEach(([x, y, z, rx, ry, rz]) => {
    for (let i = 0; i < 130; i += 1) {
      const angle = random() * Math.PI * 2;
      const vertical = random() * 2 - 1;
      const ring = Math.sqrt(1 - vertical * vertical);
      const radius = 0.45 + random() * 0.55;
      const size = 0.28 + random() * 0.25;
      instances.push({
        position: [x + Math.cos(angle) * ring * rx * radius, y + vertical * ry * radius,
          z + Math.sin(angle) * ring * rz * radius],
        scale: [size * 1.3, size * 0.6, size],
        rotation: [random() * 0.5, random() * 6.28, random() * 0.4],
        color: colors[Math.floor(random() * colors.length)],
      });
    }
  });
  return instances;
}

export function makeTreeLeaves(clusters: readonly FieldInstance[]): FieldInstance[] {
  const random = seededRandom(509);
  const result: FieldInstance[] = [];
  const colors = [P.foliageLight, P.foliage, P.foliage, P.foliageShade];
  for (const cluster of clusters) {
    for (let i = 0; i < 7; i += 1) {
      const angle = random() * Math.PI * 2;
      const vertical = random() * 2 - 1;
      const ring = Math.sqrt(1 - vertical * vertical);
      const size = 0.14 + random() * 0.1;
      result.push({
        position: [cluster.position[0] + Math.cos(angle) * ring * cluster.scale[0] * 1.12,
          cluster.position[1] + vertical * cluster.scale[1] * 1.12,
          cluster.position[2] + Math.sin(angle) * ring * cluster.scale[2] * 1.12],
        scale: [size, size, size * 1.45],
        rotation: [(random() - 0.5) * 2.1, angle, (random() - 0.5) * 1.8],
        color: colors[Math.floor(random() * colors.length)],
      });
    }
  }
  return result;
}
