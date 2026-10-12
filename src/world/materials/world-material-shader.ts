export type WorldFinish = "plaster" | "wood" | "fabric" | "paper" | "ceramic" | "metal" | "paint" | "stone" | "tile" | "gravel";
export type MaterialShader = { vertexShader: string; fragmentShader: string };

export const ROUGHNESS: Record<WorldFinish, number> = {
  plaster: .94, wood: .68, fabric: 1, paper: 0.98, ceramic: 0.68, metal: 0.54, paint: 0.87, stone: .89, tile: .83, gravel: .98,
};

export function pigment(shader: MaterialShader, finish: WorldFinish, pilot = true, detailScale = 1) {
  if(!Number.isFinite(detailScale)||detailScale<=0)throw new RangeError('Material scale must be finite and positive');
  shader.vertexShader = `varying vec3 vHouseSurface;\n${shader.vertexShader}`.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
    vec4 housePosition = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      housePosition = instanceMatrix * housePosition;
    #endif
    vHouseSurface = housePosition.xyz * ${detailScale.toFixed(5)};`,
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
    float reliefFilter = 1. - smoothstep(.5, 2.0, length(fwidth(vHouseSurface * 22.)));
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
    ${finish === "plaster" ? pilot ? "float lime = houseNoise3(vHouseSurface * 22.); pigment *= .974 + lime * .042; houseRelief = lime * .0025 * reliefFilter;" : "pigment *= .982 + houseNoise3(vHouseSurface * 34.) * .036;" : ""}
    ${finish === "stone" ? "float mineral = houseNoise3(vHouseSurface * 7.); houseGrain = mineral; pigment *= .94 + mineral * .10; houseRelief = mineral * .004 * reliefFilter;" : ""}
    ${finish === "tile" ? "float silt = houseNoise3(vHouseSurface * 12.); houseGrain = silt; pigment *= .97 + silt * .06; houseRelief = silt * .0015 * reliefFilter;" : ""}
    ${finish === "gravel" ? "float grit = houseNoise3(vHouseSurface * 18.); houseGrain = grit; pigment *= .96 + grit * .08; houseRelief = grit * .005 * reliefFilter;" : ""}
    ${finish === "metal" ? "houseGrain = houseNoise3(vHouseSurface * 9.); pigment = .988 + houseGrain * .024; houseRelief = houseGrain * .0003 * reliefFilter;" : ""}
    ${finish === "fabric" ? "houseRelief = houseNoise3(vHouseSurface * 28.) * .0005 * reliefFilter;" : ""}
    diffuseColor.rgb *= pigment;`);
  if (pilot && finish !== "paper" && finish !== "paint" && finish !== "ceramic") {
    shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", `
      #include <roughnessmap_fragment>
      roughnessFactor = clamp(roughnessFactor + ${finish === "wood" ? "(houseGrain - .5) * .18" : finish === "plaster" ? "(mottling - .5) * .06" : "(houseGrain - .5) * .08"}, .45, 1.);
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


// Runtime clones keep source GLB materials untouched; object scale is supplied
// for native assets, while instance transforms are already in the vertex path.
export function configureWorldMaterial<T extends {roughness:number;metalness:number;onBeforeCompile:unknown;customProgramCacheKey:unknown}>(material:T,finish:WorldFinish,detailScale=1) {
  material.roughness=ROUGHNESS[finish];material.metalness=finish==='metal'?.35:0;
  material.onBeforeCompile=(shader:MaterialShader)=>pigment(shader,finish,true,detailScale);
  material.customProgramCacheKey=()=>`world-014-pbr-v1-${finish}-${detailScale}`;
  return material;
}
