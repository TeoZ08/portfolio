import { FIELD_PALETTE } from "../field/field-palette";

export const HOUSE_PALETTE = {
  wall: "#d8cfb8",
  wallShade: "#b9ad98",
  floor: "#8c745b",
  floorRug: "#b19b7b",
  wood: FIELD_PALETTE.wood,
  woodLight: FIELD_PALETTE.woodLight,
  woodDark: FIELD_PALETTE.woodDark,
  linen: "#c8c0ac",
  linenLight: "#ddd5c1",
  glass: "#819997",
  screen: "#647b80",
  screenLight: "#9eb0a6",
  paper: "#d8d1b9",
  metal: "#858883",
  devMarker: FIELD_PALETTE.devMarker,
} as const;
