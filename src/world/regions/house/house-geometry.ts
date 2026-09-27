import { makeSurface, type Point3 } from "../field/field-geometry";

// Small, rounded joinery rather than scaling a sphere into every furniture part.
// Sample the bevel itself so even thin pieces keep broad, flat surfaces.
export function roundedBox(size: Point3, radius = 0.035) {
  const half = size.map((value) => value / 2);
  const r = Math.min(radius, ...half);
  const points: number[] = [], indices: number[] = [], normals: number[] = [];
  const coordinates = half.map((h) => [-h, -h + r * 0.3, -h + r, h - r, h - r * 0.3, h]);
  for (let axis = 0; axis < 3; axis += 1) {
    const u = (axis + 1) % 3, v = (axis + 2) % 3;
    for (const sign of [-1, 1]) {
      const start = points.length / 3;
      for (let row = 0; row < 6; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const p = [0, 0, 0];
          p[axis] = half[axis] * sign;
          p[u] = coordinates[u][col];
          p[v] = coordinates[v][row];
          const inner = p.map((value, i) => Math.max(-half[i] + r, Math.min(half[i] - r, value)));
          const normal = p.map((value, i) => value - inner[i]);
          const length = Math.hypot(...normal) || 1;
          for (let i = 0; i < 3; i += 1) {
            normals.push(normal[i] / length);
            points.push(inner[i] + normal[i] / length * r);
          }
          if (row < 5 && col < 5) {
            const a = start + row * 6 + col, b = a + 6;
            if (sign > 0) indices.push(a, a + 1, b, a + 1, b + 1, b);
            else indices.push(a, b, a + 1, a + 1, b, b + 1);
          }
        }
      }
    }
  }
  return { ...makeSurface(points, indices), normals: new Float32Array(normals) };
}

export function quiltSurface() {
  const points: number[] = [], indices: number[] = [];
  const columns = 36, rows = 38;
  for (let row = 0; row <= rows; row += 1) {
    for (let col = 0; col <= columns; col += 1) {
      const x = -1.76 + col / columns * 3.5;
      const z = -0.86 + row / rows * 3.24;
      const edge = Math.max(0, Math.abs(x) - 1.46) / 0.3;
      const foot = Math.max(0, z - 1.98) / 0.4;
      const folds = 0.022 * Math.sin(x * 8 + z * 2) + 0.014 * Math.sin(z * 12 - x * 3);
      const y = 1.19 - edge * edge * 0.42 - foot * foot * 0.54 + folds;
      points.push(x + Math.sin(z * 7) * 0.012, y, z);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col, b = a + columns + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  return makeSurface(points, indices);
}

export function curtainSurface() {
  const points: number[] = [], indices: number[] = [];
  const columns = 18, rows = 12;
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    for (let col = 0; col <= columns; col += 1) {
      const u = col / columns;
      points.push((u - 0.5) * (0.5 + 0.22 * t), -t * 2.36 + 0.018 * Math.sin(u * 13),
        Math.sin(u * Math.PI * 8) * (0.055 + t * 0.02) + Math.sin(t * Math.PI) * 0.035);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col, b = a + columns + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  return makeSurface(points, indices);
}

// Static curves for cables, handles and chair frames. No per-frame geometry.
export function tubeSurface(path: readonly Point3[], radius = 0.025, sides = 8) {
  const points: number[] = [], indices: number[] = [];
  path.forEach((p, row) => {
    const before = path[Math.max(0, row - 1)], after = path[Math.min(path.length - 1, row + 1)];
    const tangent = after.map((value, i) => value - before[i]);
    const length = Math.hypot(...tangent) || 1;
    const [tx, ty, tz] = tangent.map((value) => value / length);
    const nLength = Math.hypot(tx, ty);
    const n = nLength > 0.01 ? [ty / nLength, -tx / nLength, 0] : [1, 0, 0];
    const b = [ty * n[2] - tz * n[1], tz * n[0] - tx * n[2], tx * n[1] - ty * n[0]];
    for (let col = 0; col <= sides; col += 1) {
      const a = col / sides * Math.PI * 2;
      points.push(...p.map((value, i) => value + radius * (Math.cos(a) * n[i] + Math.sin(a) * b[i])));
      if (row < path.length - 1 && col < sides) {
        const start = row * (sides + 1) + col, next = start + sides + 1;
        indices.push(start, start + 1, next, start + 1, next + 1, next);
      }
    }
  });
  return makeSurface(points, indices);
}
