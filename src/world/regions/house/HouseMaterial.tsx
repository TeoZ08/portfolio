"use client";

export type HouseFinish = "plaster" | "wood" | "fabric" | "paper" | "ceramic" | "metal" | "paint";
type MaterialShader = { vertexShader: string; fragmentShader: string };

const ROUGHNESS: Record<HouseFinish, number> = {
  plaster: 1, wood: 0.89, fabric: 1, paper: 0.98, ceramic: 0.68, metal: 0.64, paint: 0.87,
};

function pigment(shader: MaterialShader, finish: HouseFinish) {
  shader.vertexShader = `varying vec3 vHouseSurface;\n${shader.vertexShader}`.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
    vec4 housePosition = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      housePosition = instanceMatrix * housePosition;
    #endif
    vHouseSurface = housePosition.xyz;`,
  );
  shader.fragmentShader = `
    varying vec3 vHouseSurface;
    float houseHash(vec2 p) {
      vec3 v = fract(vec3(p.xyx) * .1031);
      v += dot(v, v.yzx + 33.33);
      return fract((v.x + v.y) * v.z);
    }
    float houseNoise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
      return mix(mix(houseHash(i), houseHash(i + vec2(1,0)), u.x),
        mix(houseHash(i + vec2(0,1)), houseHash(i + vec2(1,1)), u.x), u.y);
    }
    float houseNoise3(vec3 p) {
      float layer = floor(p.z), f = fract(p.z);
      return mix(houseNoise(p.xy + vec2(17., 31.) * layer),
        houseNoise(p.xy + vec2(17., 31.) * (layer + 1.)), f * f * (3. - 2. * f));
    }
    ${shader.fragmentShader}`.replace("#include <color_fragment>", `
    #include <color_fragment>
    vec2 uvHouse = vHouseSurface.xz + vHouseSurface.xy * .37;
    float mottling = houseNoise3(vHouseSurface * 2.5);
    float pigment = .965 + mottling * .065;
    ${finish === "wood" ? `
      vec2 grainUV = vec2(vHouseSurface.x * .8, (vHouseSurface.z + vHouseSurface.y) * 26.);
      grainUV.y += sin(vHouseSurface.x * 1.8) * .55;
      float grain = houseNoise(grainUV);
      pigment *= .945 + grain * .09;` : ""}
    ${finish === "fabric" ? `
      vec2 weaveUV = uvHouse * 85.;
      float filterWidth = max(fwidth(weaveUV.x), fwidth(weaveUV.y));
      float weave = sin(weaveUV.x) * sin(weaveUV.y) * (1. - smoothstep(.5, 2., filterWidth));
      pigment *= .98 + weave * .035;` : ""}
    ${finish === "plaster" ? "pigment *= .982 + houseNoise3(vHouseSurface * 34.) * .036;" : ""}
    diffuseColor.rgb *= pigment;`);
}

// No texture downloads or moving uniforms. Pigment remains subtle at room scale.
export function HouseMaterial({ color, finish = "paint", vertexColors = false, side = 0 }: {
  color: string; finish?: HouseFinish; vertexColors?: boolean; side?: number;
}) {
  return <meshStandardMaterial key={finish} color={color} roughness={ROUGHNESS[finish]}
    metalness={finish === "metal" ? 0.3 : 0} vertexColors={vertexColors} side={side}
    onBeforeCompile={(shader: MaterialShader) => pigment(shader, finish)}
    customProgramCacheKey={() => `house-007-pigment-v2-${finish}`} />;
}
