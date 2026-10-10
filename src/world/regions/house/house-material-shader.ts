export type HouseFinish = "plaster" | "wood" | "fabric" | "paper" | "ceramic" | "metal" | "paint";
export type MaterialShader = { vertexShader: string; fragmentShader: string };

export const ROUGHNESS: Record<HouseFinish, number> = {
  plaster: .94, wood: .68, fabric: 1, paper: 0.98, ceramic: 0.68, metal: 0.64, paint: 0.87,
};

export function pigment(shader: MaterialShader, finish: HouseFinish, pilot = true) {
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
    float houseRelief = 0.;
    float houseGrain = .5;
    ${finish === "wood" ? `
      vec2 grainUV = vec2(vHouseSurface.x * .8, (vHouseSurface.z + vHouseSurface.y) * 26.);
      grainUV.y += sin(vHouseSurface.x * 1.8) * .55;
      float grain = houseNoise(grainUV);
      ${pilot ? `houseGrain = grain;
      float pores = houseNoise(grainUV * vec2(2., 3.));
      float filtered = 1. - smoothstep(.6, 2.5, length(fwidth(grainUV)));
      houseRelief = (grain * .007 + pores * .002) * filtered;
      pigment *= .89 + grain * .17;` : "pigment *= .945 + grain * .09;"}` : ""}
    ${finish === "fabric" ? `
      vec2 weaveUV = uvHouse * 85.;
      float filterWidth = max(fwidth(weaveUV.x), fwidth(weaveUV.y));
      float weave = sin(weaveUV.x) * sin(weaveUV.y) * (1. - smoothstep(.5, 2., filterWidth));
      pigment *= .98 + weave * .035;` : ""}
    ${finish === "plaster" ? pilot ? "float lime = houseNoise3(vHouseSurface * 22.); pigment *= .974 + lime * .042; houseRelief = lime * .0025;" : "pigment *= .982 + houseNoise3(vHouseSurface * 34.) * .036;" : ""}
    diffuseColor.rgb *= pigment;`);
  if (pilot && (finish === "wood" || finish === "plaster")) {
    shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", `
      #include <roughnessmap_fragment>
      roughnessFactor = clamp(roughnessFactor + ${finish === "wood" ? "(houseGrain - .5) * .18" : "(mottling - .5) * .06"}, .45, 1.);
    `).replace("#include <normal_fragment_maps>", `
      #include <normal_fragment_maps>
      // Screen-space bump from authored local coordinates, including instances.
      // No UV seams, texture samplers, tangent buffers or baked sunlight.
      vec3 houseDx = dFdx(-vViewPosition), houseDy = dFdy(-vViewPosition);
      vec3 houseRx = cross(houseDy, normal), houseRy = cross(normal, houseDx);
      float houseDet = dot(houseDx, houseRx);
      vec3 houseGrad = sign(houseDet) * (dFdx(houseRelief) * houseRx + dFdy(houseRelief) * houseRy);
      normal = normalize(abs(houseDet) * normal - houseGrad);
    `);
  }
}

