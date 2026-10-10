import { PLAN, ROUTES, routeDistance } from "../masterplan-layout";
import { FIELD_SCALE } from "../world-scale";
const smooth = (a:number,b:number,v:number) => {const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
// Stable, broad pigment waves warp the regional edges, never rectangular decals.
export function soilWeights(x:number,z:number): [number,number,number] {
  const noise=Math.sin(x*.37+Math.sin(z*.21))*Math.cos(z*.28+x*.13);
  const dx=(x-PLAN.dojo.x)*FIELD_SCALE,dz=(z-PLAN.dojo.z)*FIELD_SCALE;
  const mineral=1-smooth(.68,1.18,Math.hypot(dx/17,dz/12)+noise*.07);
  let path=0;
  for(const route of ROUTES){const dist=routeDistance(x,z,route.samples)*FIELD_SCALE;path=Math.max(path,1-smooth(route.width*FIELD_SCALE*.3,route.width*FIELD_SCALE*.7+.4,dist+noise*.2));}
  const hill=1-smooth(3,14,Math.hypot((x-PLAN.hill.x)*FIELD_SCALE,(z-PLAN.hill.z)*FIELD_SCALE)+noise);
  const grove=1-smooth(3,11,Math.hypot((x-PLAN.forest.x)*FIELD_SCALE,(z-PLAN.forest.z)*FIELD_SCALE)+noise*.8);
  const dry=(.5+.5*Math.sin(x*.14+z*.17))* .11;
  const rock=hill*.7;
  const gravel=Math.max(mineral*.83,path*.66)*(1-rock)*(1-grove*.6);
  const earth=Math.min(1-gravel-rock,grove*.57+dry+path*.16);
  return [gravel,rock,Math.max(0,earth)];
}
