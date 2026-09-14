"use client";

import { FieldGeometry } from "./FieldMeshes";
import { FieldMaterial } from "./FieldMaterial";
import { FIELD_PATH_SAMPLES, surfaceHeight, type FieldPoint } from "./field-layout";
import { makeSurface } from "./field-geometry";
import { FIELD_PALETTE as P, linearColor } from "./field-palette";
import { groundColor } from "./field-surfaces";

function makePath() {
  const samples: FieldPoint[] = [];
  for (let i = 1; i < FIELD_PATH_SAMPLES.length; i += 1) {
    const a = FIELD_PATH_SAMPLES[i - 1];
    const b = FIELD_PATH_SAMPLES[i];
    const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5);
    for (let step = 0; step < steps; step += 1) {
      samples.push([a[0] + (b[0] - a[0]) * step / steps, a[1] + (b[1] - a[1]) * step / steps]);
    }
  }
  samples.push(FIELD_PATH_SAMPLES[FIELD_PATH_SAMPLES.length - 1]);
  const vertices: number[] = [], triangles: number[] = [], colors: number[] = [];
  const dirt = linearColor(P.path);
  const across = 12;
  samples.forEach((point, i) => {
    const before = samples[Math.max(0, i - 1)];
    const after = samples[Math.min(samples.length - 1, i + 1)];
    const dx = after[0] - before[0], dz = after[1] - before[1];
    const length = Math.hypot(dx, dz) || 1;
    const width = 2.4 + 0.18 * Math.sin(i * 0.09) + 0.09 * Math.sin(i * 0.69);
    for (let col = 0; col <= across; col += 1) {
      const t = col / across * 2 - 1;
      const x = point[0] + dz / length * width * t;
      const z = point[1] - dx / length * width * t;
      vertices.push(x, surfaceHeight(x, z) + 0.018, z);
      const edge = Math.min(1, Math.max(0, (Math.abs(t) - 0.67) / 0.33));
      const grass = groundColor(x, z);
      const wear = 0.97 + 0.02 * Math.sin(i * 0.73 + col * 1.8);
      colors.push(...dirt.map((channel, c) => channel * wear * (1 - edge) + grass[c] * edge));
      if (i < samples.length - 1 && col < across) {
        const a = i * (across + 1) + col;
        const b = a + across + 1;
        triangles.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  });
  return makeSurface(vertices, triangles, colors);
}

const PATH_SURFACE = makePath();

export function FieldArrival() {
  return (
    <mesh name="FIELD_ARRIVAL_WORN_EARTH_PATH" receiveShadow>
      <FieldGeometry data={PATH_SURFACE} />
      <FieldMaterial vertexColors side={2} />
    </mesh>
  );
}
