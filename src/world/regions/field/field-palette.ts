// Milestone 005: shared matte palette for the visual prototype, not final assets.
export const FIELD_PALETTE = {
  grass: "#567847",
  grassLight: "#8da875",
  grassShade: "#385e49",
  grassDry: "#ae9f6b",
  path: "#b5a07e",
  pathLight: "#c4aa7e",
  pathEdge: "#8f8956",
  soil: "#76674f",
  stone: "#99988a",
  stoneShade: "#777e74",
  stoneLight: "#b5ac94",
  wood: "#766049",
  woodLight: "#987952",
  woodDark: "#493e32",
  plaster: "#ddd1af",
  plasterShade: "#c6baa0",
  roof: "#866653",
  roofLight: "#a17b60",
  roofShade: "#845c4c",
  shutter: "#64776b",
  glass: "#7e9b98",
  windowGlow: "#e7b365",
  foliage: "#4b743e",
  foliageLight: "#83a767",
  foliageShade: "#476750",
  flower: "#e2d6a4",
  flowerGold: "#cdb261",
  hill: "#677c6b",
  hillMiddle: "#889a93",
  hillFar: "#a6b4b4",
  sky: "#bbc9cf",
  skyHigh: "#91adb4",
  horizon: "#e6d6b7",
  sun: "#ffe1ae",
  fill: "#c6d9e6",
  songahmTimber: "#70483c",
  songahmRoof: "#394443",
  songahmJade: "#4f746e",
  songahmTeal: "#5d8782",
  songahmCream: "#ead7a7",
  songahmLantern: "#f0b35e",
  mountainNear: "#3f5d58",
  mountainMiddle: "#647e76",
  mountainFar: "#98aaa5",
  mountainMist: "#c5d3d0",
  player: "#b9723f",
  devMarker: "#f4f4f4",
} as const;

export function linearColor(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045
      ? srgb / 12.92
      : ((srgb + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
}
