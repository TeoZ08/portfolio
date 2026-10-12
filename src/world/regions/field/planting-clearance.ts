import { PLAN, HOUSE_EXIT, routeClearance } from '../masterplan-layout';
import { FIELD_SCALE } from '../world-scale';

// Distances in author units. Circle vs oriented footprint tests the full crown,
// including the diagonal corners missed by a point-inside/expanded-box check.
export function footprintDistance(x:number,z:number,place:{x:number;z:number;yaw:number;width:number;depth:number}) {
  const dx=x-place.x,dz=z-place.z,c=Math.cos(place.yaw),s=Math.sin(place.yaw);
  return Math.hypot(Math.max(0,Math.abs(dx*c-dz*s)-place.width/2),Math.max(0,Math.abs(dx*s+dz*c)-place.depth/2));
}
const BUILDINGS=[PLAN.house,PLAN.gallery,PLAN.dojo];
const DESTINATIONS=[PLAN.arrival,PLAN.plaza,HOUSE_EXIT,[PLAN.hill.x,PLAN.hill.z],[PLAN.chime.x,PLAN.chime.z],[PLAN.forestBench.x,PLAN.forestBench.z]];
export function plantingObstructions(x:number,z:number,trunkRadius:number,crownRadius=trunkRadius) {
  const reasons:string[]=[];
  BUILDINGS.forEach((p,i)=>{if(footprintDistance(x,z,p)<crownRadius+.3/FIELD_SCALE)reasons.push(['house','gallery','songahm'][i]);});
  if(routeClearance(x,z,trunkRadius+.45/FIELD_SCALE))reasons.push('route');
  if(DESTINATIONS.some(([a,b])=>Math.hypot(x-a,z-b)<trunkRadius+1.3/FIELD_SCALE))reasons.push('destination');
  return reasons;
}
export function plantingAllowed(x:number,z:number,trunkRadius:number,crownRadius=trunkRadius) {
  return plantingObstructions(x,z,trunkRadius,crownRadius).length===0;
}
