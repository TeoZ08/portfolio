import { PLAN, ROUTES, authorPoint, routeDistance } from "../masterplan-layout";
export type FieldPoint = readonly [number,number];
export const FIELD_PATH_POINTS = ROUTES[0].points;
export const FIELD_PATH_SAMPLES = ROUTES[0].samples;
export const HOUSE_CENTER = [PLAN.house.x,PLAN.house.z] as const;
export const HOUSE_YAW = PLAN.house.yaw;
export const TREE_CENTER = authorPoint(-8,-.5);
export const FIELD_BOUNDS = {minX:-55,maxX:55,minZ:-55,maxZ:55};
export const TERRAIN_COLUMNS=88, TERRAIN_ROWS=88;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function pathDistance(x:number,z:number){return routeDistance(x,z,FIELD_PATH_SAMPLES);}
export function houseLocal(x:number,z:number){
 const dx=x-PLAN.house.x,dz=z-PLAN.house.z;
 return [dx*Math.cos(HOUSE_YAW)-dz*Math.sin(HOUSE_YAW), dx*Math.sin(HOUSE_YAW)+dz*Math.cos(HOUSE_YAW)] as const;
}
export function insideHouse(x:number,z:number,margin=0){const [a,b]=houseLocal(x,z);return Math.abs(a)<8+margin&&Math.abs(b)<6+margin;}
export function terrainHeight(x:number,z:number){
 let h=.12*Math.sin(x*.12)*Math.sin(z*.095)+.07*Math.sin(x*.3+z*.16);
 const hill=PLAN.hill;
 // Broad walkable mound; no detached tower or steep pedestal.
 h+=4.7*Math.exp(-(((x-hill.x)/16)**2)-((z-hill.z)/15)**2);
 const flat=[{...PLAN.house,width:20,depth:24},{...PLAN.gallery,width:PLAN.gallery.width+3,depth:PLAN.gallery.depth+5},{...PLAN.dojo,width:PLAN.dojo.width+3,depth:PLAN.dojo.depth+3}];
 for(const place of flat){
  const dx=x-place.x,dz=z-place.z;
  const a=dx*Math.cos(place.yaw)-dz*Math.sin(place.yaw),b=dx*Math.sin(place.yaw)+dz*Math.cos(place.yaw);
  h*=smooth((Math.max(Math.abs(a)-place.width/2,Math.abs(b)-place.depth/2))/5);
 }
 h*=smooth((Math.hypot(x-PLAN.arrival[0],z-PLAN.arrival[1])-5)/5);
 h*=smooth((Math.hypot(x-PLAN.plaza[0],z-PLAN.plaza[1])-7)/6);
 return h;
}
// Exact barycentric height of the rendered/collision grid, also used by props/path.
export function surfaceHeight(x: number, z: number) {
  const stepX = (FIELD_BOUNDS.maxX - FIELD_BOUNDS.minX) / TERRAIN_COLUMNS;
  const stepZ = (FIELD_BOUNDS.maxZ - FIELD_BOUNDS.minZ) / TERRAIN_ROWS;
  const gx = (x - FIELD_BOUNDS.minX) / stepX;
  const gz = (z - FIELD_BOUNDS.minZ) / stepZ;
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  const u = gx - ix;
  const v = gz - iz;
  const x0 = FIELD_BOUNDS.minX + ix * stepX;
  const z0 = FIELD_BOUNDS.minZ + iz * stepZ;
  const a = terrainHeight(x0, z0);
  const b = terrainHeight(x0 + stepX, z0);
  const c = terrainHeight(x0, z0 + stepZ);
  const d = terrainHeight(x0 + stepX, z0 + stepZ);
  return u + v <= 1
    ? a + u * (b - a) + v * (c - a)
    : d + (1 - v) * (b - d) + (1 - u) * (c - d);
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
