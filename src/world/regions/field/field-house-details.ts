import { makeSurface, type FieldInstance } from "./field-geometry";
import { seededRandom } from "./field-layout";
import { FIELD_PALETTE as P } from "./field-palette";

export const ROOF_PITCH = Math.atan2(3, 6.7);
export const ROOF_SLOPE_LENGTH = Math.hypot(3, 6.7);

export function makeRoofTile() {
  const positions: number[] = [], indices: number[] = [];
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col <= 6; col += 1) {
      const t = col / 6;
      positions.push((t - 0.5) * 0.63, Math.sin(t * Math.PI) * 0.085, (row - 0.5) * 0.86);
      if (row === 0 && col < 6) indices.push(col, col + 7, col + 1, col + 1, col + 7, col + 8);
    }
  }
  return makeSurface(positions, indices);
}

export function makeHouseDetails() {
  const random = seededRandom(503);
  const roof: FieldInstance[] = [], stones: FieldInstance[] = [];
  const tileColors = [P.roof, P.roof, P.roofLight, P.roofShade];
  for (const side of [-1, 1]) {
    for (let row = 0; row < 10; row += 1) {
      const distance = (row + 0.35) * ROOF_SLOPE_LENGTH / 10;
      for (let col = 0; col < 28; col += 1) {
        roof.push({
          position: [-8.45 + col * 0.625 + (row % 2) * 0.045,
            8.89 - Math.sin(ROOF_PITCH) * distance + random() * 0.02,
            side * Math.cos(ROOF_PITCH) * distance],
          scale: [1, 1, 1], rotation: [side * ROOF_PITCH, 0, (random() - 0.5) * 0.012],
          color: tileColors[Math.floor(random() * tileColors.length)],
        });
      }
    }
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 20; i += 1) {
      const x = -7.7 + i * 0.8;
      if (side === 1 && Math.abs(x) < 1.25) continue;
      stones.push({ position: [x, 0.3, side * 6.03], scale: [0.46, 0.33, 0.18],
        rotation: [0, 0, random() * 0.15], color: i % 3 ? P.stone : P.stoneLight });
    }
    for (let i = 0; i < 15; i += 1) {
      stones.push({ position: [side * 8.03, 0.3, -5.7 + i * 0.8], scale: [0.18, 0.33, 0.46],
        rotation: [random() * 0.1, 0, 0], color: i % 3 ? P.stone : P.stoneShade });
    }
  }
  return { roof, stones };
}
