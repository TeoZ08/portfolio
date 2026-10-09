import { PLAN, ROUTES, routeClearance } from "../masterplan-layout";
export const PLACE_LAYOUT = {
 workshop: PLAN.gallery, university: PLAN.gallery, community: PLAN.gallery,
 dojo: PLAN.dojo, hill: PLAN.hill,
} as const;
export function insidePlace(x:number,z:number,margin=1){
 return Object.values(PLACE_LAYOUT).some(place=>{
 const dx=x-place.x,dz=z-place.z;
 return Math.abs(dx*Math.cos(place.yaw)-dz*Math.sin(place.yaw))<place.width/2+margin && Math.abs(dx*Math.sin(place.yaw)+dz*Math.cos(place.yaw))<place.depth/2+margin;
 });
}
export const PLACE_PATHS = ROUTES.slice(1).map(r=>r.points);
export const PLACE_PATH_SAMPLES = ROUTES.slice(1).map(r=>r.samples);
export function nearPlacePath(x:number,z:number,clearance=1.7){return routeClearance(x,z,clearance);}
