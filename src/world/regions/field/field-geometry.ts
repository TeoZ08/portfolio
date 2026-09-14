import { linearColor } from "./field-palette";

export type Point3 = readonly [number, number, number];
export type SurfaceData = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  colors?: Float32Array;
};
export type FieldInstance = {
  position: Point3;
  scale: Point3;
  rotation?: Point3;
  color: string;
};

export function makeSurface(
  points: number[],
  triangles: number[],
  colors?: number[],
): SurfaceData {
  const positions = new Float32Array(points);
  const indices = new Uint32Array(triangles);
  const normals = new Float32Array(points.length);
  for (let i = 0; i < triangles.length; i += 3) {
    const a = triangles[i] * 3;
    const b = triangles[i + 1] * 3;
    const c = triangles[i + 2] * 3;
    const ux = points[b] - points[a];
    const uy = points[b + 1] - points[a + 1];
    const uz = points[b + 2] - points[a + 2];
    const vx = points[c] - points[a];
    const vy = points[c + 1] - points[a + 1];
    const vz = points[c + 2] - points[a + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    for (const index of [a, b, c]) {
      normals[index] += nx;
      normals[index + 1] += ny;
      normals[index + 2] += nz;
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= length;
    normals[i + 1] /= length;
    normals[i + 2] /= length;
  }
  return { positions, indices, normals, colors: colors ? new Float32Array(colors) : undefined };
}

export function organicEllipsoid(segments = 12, rings = 8, irregularity = 0.09) {
  const points: number[] = [];
  const triangles: number[] = [];
  for (let row = 0; row <= rings; row += 1) {
    const theta = row / rings * Math.PI;
    for (let col = 0; col <= segments; col += 1) {
      const phi = col / segments * Math.PI * 2;
      const radius = 1 + irregularity * Math.sin(phi * 3 + theta * 2) * Math.sin(theta) +
        irregularity * 0.45 * Math.cos(phi * 5 - theta * 3) * Math.sin(theta);
      points.push(-Math.cos(phi) * Math.sin(theta) * radius, Math.cos(theta) * radius,
        Math.sin(phi) * Math.sin(theta) * radius);
      if (row < rings && col < segments) {
        const a = row * (segments + 1) + col;
        const b = a + segments + 1;
        triangles.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const surface = makeSurface(points, triangles);
  // Smooth the duplicated seam/poles analytically; sampled normals there would
  // otherwise make rounded stones and leaf clusters look faceted.
  for (let i = 0; i < surface.positions.length; i += 3) {
    const length = Math.hypot(points[i], points[i + 1], points[i + 2]) || 1;
    surface.normals[i] = points[i] / length;
    surface.normals[i + 1] = points[i + 1] / length;
    surface.normals[i + 2] = points[i + 2] / length;
  }
  return surface;
}

export function makeInstanceBuffers(instances: readonly FieldInstance[]) {
  const matrices = new Float32Array(instances.length * 16);
  const colors = new Float32Array(instances.length * 3);
  instances.forEach((instance, index) => {
    const [x, y, z] = instance.rotation ?? [0, 0, 0];
    const a = Math.cos(x), b = Math.sin(x), c = Math.cos(y), d = Math.sin(y);
    const e = Math.cos(z), f = Math.sin(z);
    const [sx, sy, sz] = instance.scale;
    matrices.set([
      c * e * sx, (a * f + b * e * d) * sx, (b * f - a * e * d) * sx, 0,
      -c * f * sy, (a * e - b * f * d) * sy, (b * e + a * f * d) * sy, 0,
      d * sz, -b * c * sz, a * c * sz, 0,
      ...instance.position, 1,
    ], index * 16);
    colors.set(linearColor(instance.color), index * 3);
  });
  return { matrices, colors };
}

export function makeLeafSurface() {
  return makeSurface(
    [0, 0, -1, 0.44, 0, -0.38, 0.36, 0.04, 0.48, 0, 0.08, 1,
      -0.4, 0.02, 0.32, -0.42, 0, -0.4, 0, 0.18, 0],
    [0, 6, 1, 1, 6, 2, 2, 6, 3, 3, 6, 4, 4, 6, 5, 5, 6, 0],
  );
}
