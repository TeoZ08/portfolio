import { FIELD_SCALE } from "../world-scale";
// Author units: physical design converted once, including imported native metres.
export const DOJO = {
  mainScale: 1.45 / FIELD_SCALE,
  wingScale: .82 / FIELD_SCALE,
  wingX: 10.5 / FIELD_SCALE,
  wingZ: -1.4,
  wingBase: .075,
  wingFootingTop: .1,
  wingFootingBottom: -.5,
  wingFootingWidth: 6.15 / FIELD_SCALE,
  wingFootingDepth: 5.15 / FIELD_SCALE,
  terraceWidth: 16 / FIELD_SCALE,
  terraceDepth: 10.8 / FIELD_SCALE,
  floor: .513,
  terraceTop: .4,
  foundationBottom: -.6,
  stairBottom: -.25,
  tatamiWidth: 10.77,
  tatamiDepth: 7.07,
  tatamiZ: .04,
  stairZ: [8.7, 8.05, 7.4],
  stairTops: [.14, .27, .4],
} as const;

export const SONGAHM_PLANTING = [
  {file:"pine",x:-24.5,z:4.5,scale:1.6,trunkRadius:.35,crownRadius:1.65*1.6},
  {file:"persimmon",x:25.5,z:4,scale:1.25,trunkRadius:.25,crownRadius:2.1*1.25},
  {file:"bamboo",x:-23,z:-7,scale:1.2,trunkRadius:.8,crownRadius:1.18*1.2},
] as const;
