import { FIELD_SCALE } from "../world-scale";
// Author units: physical design converted once, including imported native metres.
export const DOJO = {
  mainScale: 1.45 / FIELD_SCALE,
  wingScale: .82 / FIELD_SCALE,
  wingX: 10.5 / FIELD_SCALE,
  terraceWidth: 16 / FIELD_SCALE,
  terraceDepth: 10.8 / FIELD_SCALE,
  floor: .513,
  stairZ: [8.7, 8.05, 7.4],
  stairTops: [.14, .27, .4],
} as const;
