import { seededRandom, surfaceHeight } from "../field/field-layout";
import { nearPlacePath } from "../places/place-layout";
import type { FieldInstance } from "../field/field-geometry";

export const FOREST_PALETTE = {
  fern: "#89977c", bush: "#98a78a", mushroom: "#c3b79a",
  stone: "#969e91", bark: "#a39b86", shadow: "#3c5148",
  canopy: "#435e48", canopyLight: "#6c8056", canopyShade: "#37554b",
};

const random = seededRandom(62391);
const fern: FieldInstance[] = [], bush: FieldInstance[] = [], mushroom: FieldInstance[] = [];
// Small authored planting islands. The centre and footpath stay empty.
const BEDS = [[-33.7,-60,1.6],[-37.4,-62.8,1.8],[-40.5,-61.8,1.4],[-45.3,-64,1.7],
  [-48.3,-67,1.6],[-49,-72,1.9],[-45.5,-74,2],[-40.5,-73.8,1.3],[-39.5,-69.4,1.1]] as const;
for (const [cx, cz, radius] of BEDS) {
  for (let i = 0; i < 12; i++) {
    const angle = random() * Math.PI * 2, distance = Math.sqrt(random()) * radius;
    const x = cx + Math.cos(angle) * distance, z = cz + Math.sin(angle) * distance;
    if (nearPlacePath(x, z, 1.55)) continue;
    const y = surfaceHeight(x, z);
    const scale = .105 + random() * .065;
    fern.push({ position: [x, y, z], scale: [scale, scale, scale], rotation: [0, angle, 0], color: FOREST_PALETTE.fern });
    if (i < 2) bush.push({ position: [x, y - .07, z], scale: [.8, .65, .8], rotation: [0, angle, 0], color: FOREST_PALETTE.bush });
    if (i % 3 === 0) {
      for (let j = 0; j < 3; j++) {
        const mx = x + j * .18, mz = z + j * .15;
        const s = .36 + random() * .42;
        mushroom.push({ position: [mx, surfaceHeight(mx, mz), mz], scale: [s, s, s], rotation: [0, random() * 6.28, 0], color: FOREST_PALETTE.mushroom });
      }
    }
  }
}
const stone: FieldInstance[] = [
  [-36.7,-63,.45],[-42.9,-62.8,.6],[-47.8,-66,.78],[-48.2,-72.4,.63],[-41,-74.4,.4],[-39,-68.6,.32],
].map(([x,z,s], index) => ({ position: [x,surfaceHeight(x,z)-.12,z],scale:[s,s*.72,s],rotation:[0,index*1.34,.05],color:FOREST_PALETTE.stone }));
const snag: FieldInstance[] = [
  { position: [-47.6, surfaceHeight(-47.6,-70)-.05, -70], scale: [.63,.63,.63], rotation:[.02,.8,-.06], color:FOREST_PALETTE.bark },
];
export const FOREST_DRESSING = { fern, bush, mushroom, stone, snag };
