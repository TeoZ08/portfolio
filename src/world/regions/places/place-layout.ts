export const PLACE_LAYOUT = {
  workshop: { x: 30, z: -31, yaw: -0.38, width: 10.5, depth: 7.5 },
  university: { x: -19, z: -65, yaw: 0.12, width: 14, depth: 8 },
  community: { x: 28, z: -61, yaw: -0.17, width: 10, depth: 8 },
  dojo: { x: -31, z: -87, yaw: 0.3, width: 17, depth: 17.5 },
  hill: { x: 8, z: -88, yaw: Math.PI, width: 8, depth: 5 },
} as const;

export function insidePlace(x: number, z: number, margin = 1) {
  return Object.values(PLACE_LAYOUT).some(place => {
    const dx = x - place.x, dz = z - place.z;
    const localX = dx * Math.cos(place.yaw) - dz * Math.sin(place.yaw);
    const localZ = dx * Math.sin(place.yaw) + dz * Math.cos(place.yaw);
    return Math.abs(localX) < place.width / 2 + margin && Math.abs(localZ) < place.depth / 2 + margin;
  });
}

// Authored branches, not random object scattering. The original arrival route stays intact.
export const PLACE_PATHS: readonly (readonly (readonly [number, number])[])[] = [
  [[14, -26], [18, -24], [23, -24], [28.4, -27.2]],
  [[0, -43], [-4, -50], [-13, -52], [-18.44, -60.6]],
  [[14, -34], [21, -42], [23, -49], [27.25, -56.8]],
  [[-18.5, -58.7], [-27, -60.5], [-31, -70], [-29.8, -82.9]],
  [[-15, -54.5], [-5, -60], [4, -64], [21, -60], [27.25, -56.8]],
  [[4, -64], [13, -76], [16, -83], [8, -85]],
  [[-29.8, -82.9], [-23, -85], [-7, -87], [8, -85]],
  [[-27, -60.5], [-33, -63.5], [-35.6, -68.1]],
  [[-33, -63.5], [-37, -64.7], [-41.5, -67.2], [-43.3, -69.8]],
];

function catmull(a: number, b: number, c: number, d: number, t: number) {
  return .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
}

// One static sampling shared by the visible paths and planting exclusions.
export const PLACE_PATH_SAMPLES = PLACE_PATHS.map(points => {
  const samples: [number, number][] = [];
  for (let segment = 0; segment < points.length - 1; segment++) {
    const a = points[Math.max(0, segment - 1)], b = points[segment];
    const c = points[segment + 1], d = points[Math.min(points.length - 1, segment + 2)];
    for (let step = 0; step < 36; step++) {
      samples.push([catmull(a[0], b[0], c[0], d[0], step / 36), catmull(a[1], b[1], c[1], d[1], step / 36)]);
    }
  }
  const end = points[points.length - 1];
  samples.push([end[0], end[1]]);
  return samples;
});

export function nearPlacePath(x: number, z: number, clearance = 1.7) {
  return PLACE_PATH_SAMPLES.some(samples => samples.some(point =>
    (point[0] - x) ** 2 + (point[1] - z) ** 2 < clearance * clearance,
  ));
}
