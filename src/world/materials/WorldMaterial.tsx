"use client";

import { useEffect, useState } from "react";
import { pigment, ROUGHNESS, type WorldFinish, type MaterialShader } from "./world-material-shader";
export type { WorldFinish } from "./world-material-shader";

// No texture downloads or moving uniforms. Pigment remains subtle at room scale.
export function WorldMaterial({ color, finish = "paint", vertexColors = false, side = 0, detailScale = 1 }: {
  color: string; finish?: WorldFinish; vertexColors?: boolean; side?: 0 | 1 | 2; detailScale?: number;
}) {
  const [pilot, setPilot] = useState(true);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") setPilot(new URLSearchParams(location.search).get("materialPilot") !== "baseline");
  }, []);
  return <meshStandardMaterial key={`${finish}-${pilot}`} color={color} roughness={!pilot && finish === "wood" ? .89 : !pilot && finish === "plaster" ? 1 : ROUGHNESS[finish]}
    metalness={finish === "metal" ? 0.35 : 0} vertexColors={vertexColors} side={side}
    onBeforeCompile={(shader: MaterialShader) => pigment(shader, finish, pilot, detailScale)}
    customProgramCacheKey={() => `world-014-pbr-v1-${finish}-${pilot}-${detailScale}`} />;
}
