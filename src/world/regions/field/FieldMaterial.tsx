"use client";

import { FIELD_PALETTE } from "./field-palette";

type PaintShader = { vertexShader: string; fragmentShader: string };

// Very restrained world-space pigment variation. No image downloads, UV repeats,
// time uniforms or view-dependent noise; the surfaces remain ordinary lit PBR.
function applyPigment(shader: PaintShader) {
  shader.vertexShader = `varying vec3 vPigmentPosition;\n${shader.vertexShader}`.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
    vec4 pigmentPosition = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      pigmentPosition = instanceMatrix * pigmentPosition;
    #endif
    vPigmentPosition = (modelMatrix * pigmentPosition).xyz;`,
  );
  shader.fragmentShader = `
    varying vec3 vPigmentPosition;
    float pigmentHash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float pigmentNoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(pigmentHash(i), pigmentHash(i + vec2(1,0)), u.x),
        mix(pigmentHash(i + vec2(0,1)), pigmentHash(i + vec2(1,1)), u.x), u.y);
    }
    ${shader.fragmentShader}`.replace("#include <color_fragment>", `
    #include <color_fragment>
    vec2 pigmentUV = vPigmentPosition.xz + vPigmentPosition.xy * 0.47;
    float broadPigment = pigmentNoise(pigmentUV * 0.78);
    float finePigment = pigmentNoise(pigmentUV * 24.0);
    diffuseColor.rgb *= 0.88 + broadPigment * 0.16 + finePigment * 0.08;`);
}

export function FieldMaterial({ color = "#ffffff", vertexColors = false, side = 0 }: {
  color?: string; vertexColors?: boolean; side?: number;
}) {
  return <meshStandardMaterial color={color} vertexColors={vertexColors} side={side}
    roughness={1} metalness={0} onBeforeCompile={applyPigment}
    customProgramCacheKey={() => "field-pigment-v1"} />;
}

// Share a muted fill color without tinting every shadow green.
export const FIELD_LIGHTING = { groundFill: "#85818a", sun: FIELD_PALETTE.sun };
