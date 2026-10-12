import { linearColor } from './field-palette';

export const SUNSET_HAZE = {
  near: 55, far: 185,
  amber: '#d7ab87', valley: '#8195aa',
  valleyBottom: 1.5, valleyTop: 17,
} as const;
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};

// CPU counterpart for depth/height continuity and near-playfield regressions.
export function hazeWeights(depth:number,height:number,low=false) {
  const distance=smooth(SUNSET_HAZE.near,SUNSET_HAZE.far,depth);
  const valley=1-smooth(SUNSET_HAZE.valleyBottom,SUNSET_HAZE.valleyTop,height);
  const middle=smooth(65,110,depth)*(1-smooth(135,185,depth));
  const density=distance+(1-distance)*valley*smooth(SUNSET_HAZE.near,110,depth)*.30;
  return {distance,valley,middle,density,cool:middle*valley*(low?.42:.52)};
}

type Shader = { vertexShader:string; fragmentShader:string };
// Replaces the existing material fog chunk. No extra fog object, transparent
// sheets, geometry, noise samplers, marching steps or per-frame allocations.
export function landscapeHaze(shader:Shader,sunset:boolean,low=false) {
  if(!sunset)return;
  shader.vertexShader=`varying vec3 vLandscapeHazeWorld;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>',`
    #include <worldpos_vertex>
    vec4 hazePosition=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
      hazePosition=instanceMatrix*hazePosition;
    #endif
    vLandscapeHazeWorld=(modelMatrix*hazePosition).xyz;
  `);
  const amber=linearColor(SUNSET_HAZE.amber).map(v=>v.toFixed(6)).join(',');
  const cool=linearColor(SUNSET_HAZE.valley).map(v=>v.toFixed(6)).join(',');
  shader.fragmentShader=`varying vec3 vLandscapeHazeWorld;\n${shader.fragmentShader}`.replace('#include <fog_fragment>',`
    #ifdef USE_FOG
      float hazeDepth=length(vLandscapeHazeWorld-cameraPosition);
      float hazeDistance=smoothstep(fogNear,fogFar,hazeDepth);
      float hazeValley=1.0-smoothstep(1.5,17.0,vLandscapeHazeWorld.y);
      float hazeMiddle=smoothstep(65.0,110.0,hazeDepth)*(1.0-smoothstep(135.0,185.0,hazeDepth));
      vec3 hazeColor=mix(fogColor,vec3(${amber}),.35*(1.0-hazeDistance)*(1.0-hazeValley));
      hazeColor=mix(hazeColor,vec3(${cool}),hazeMiddle*hazeValley*${low?'0.42':'0.52'});
      float hazeDensity=hazeDistance+(1.0-hazeDistance)*hazeValley*smoothstep(fogNear,110.0,hazeDepth)*.30;
      // Three r182 runs fog after colorspace_fragment. Match the approved sky's
      // encoding before blending the linear palette into the output pixels.
      gl_FragColor.rgb=mix(gl_FragColor.rgb,linearToOutputTexel(vec4(hazeColor,1.0)).rgb,hazeDensity);
    #endif
  `);
}
