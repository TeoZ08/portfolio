"use client";

import { useEffect, useState } from "react";
import { pigment, ROUGHNESS, type HouseFinish, type MaterialShader } from "./house-material-shader";
export type { HouseFinish } from "./house-material-shader";

// No texture downloads or moving uniforms. Pigment remains subtle at room scale.
export function HouseMaterial({ color, finish = "paint", vertexColors = false, side = 0 }: {
  color: string; finish?: HouseFinish; vertexColors?: boolean; side?: 0 | 1 | 2;
}) {
  const [pilot, setPilot] = useState(true);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") setPilot(new URLSearchParams(location.search).get("materialPilot") !== "baseline");
  }, []);
  return <meshStandardMaterial key={`${finish}-${pilot}`} color={color} roughness={!pilot && finish === "wood" ? .89 : !pilot && finish === "plaster" ? 1 : ROUGHNESS[finish]}
    metalness={finish === "metal" ? 0.3 : 0} vertexColors={vertexColors} side={side}
    onBeforeCompile={(shader: MaterialShader) => pigment(shader, finish, pilot)}
    customProgramCacheKey={() => `house-013-pbr-v1-${finish}-${pilot}`} />;
}
