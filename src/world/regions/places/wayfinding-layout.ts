import { PLAN, HOUSE_DOOR, localPlanPoint } from '../masterplan-layout';
import { FIELD_SCALE as S } from '../world-scale';
export const PLAZA_SIGN = {x:-3.9/S,z:PLAN.plaza[1]+5,yaw:0,width:3.0/S,height:1.8/S,centerY:1.5/S} as const;
// Route entrances, rather than a straight arrow towards the hidden far bench.
export const SIGN_DESTINATIONS = [
  {label:'Casa',point:HOUSE_DOOR},
  {label:'Ateliê / Galeria',point:localPlanPoint(PLAN.gallery,0,5.2/S)},
  {label:'Songahm',point:[PLAN.dojo.x,PLAN.dojo.z+9] as const},
  {label:'Mirante',point:[7/S,-6/S] as const},
] as const;
export function signArrow(point:readonly [number,number],yaw:number=PLAZA_SIGN.yaw) {
  const dx=point[0]-PLAZA_SIGN.x,dz=point[1]-PLAZA_SIGN.z,c=Math.cos(yaw),s=Math.sin(yaw);
  const x=dx*c-dz*s,up=-(dx*s+dz*c),length=Math.hypot(x,up);
  return {x:x/length,up:up/length};
}
