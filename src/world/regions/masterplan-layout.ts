import { FIELD_SCALE } from "./world-scale";

// Phase B: physical metres are authored here, converted once for FIELD_REGION.
export type PlanPoint = readonly [number, number];
export const authorPoint = (x: number, z: number): PlanPoint => [x / FIELD_SCALE, z / FIELD_SCALE];
const anchor = (x: number, z: number, yaw: number, width: number, depth: number) => ({x:x/FIELD_SCALE,z:z/FIELD_SCALE,yaw,width:width/FIELD_SCALE,depth:depth/FIELD_SCALE});
export const PLAN = {
  arrival: authorPoint(0,26), plaza: authorPoint(0,11),
  house: anchor(-17,10,Math.PI/2,11.52,8.64),
  gallery: anchor(17,10,-Math.PI/2,14,9),
  dojo: anchor(-2,-21,0,29,20),
  hill: anchor(21,-22,Math.PI*.75,5.76,3.6),
  forest: anchor(-15,-5,-Math.PI/2,7,8),
  chime: anchor(-12,-2,-Math.PI/2,1,1),
  forestBench: anchor(-17,-5,-Math.PI/2,2,1),
} as const;
export const GALLERY_USE = {
  unapi: authorPoint(-4.5,.3), jarvis: authorPoint(4.5,.3), process: authorPoint(0,-1.9),
} as const;
export function localPlanPoint(place: {x:number;z:number;yaw:number}, x:number,z:number): PlanPoint {
 return [place.x+x*Math.cos(place.yaw)+z*Math.sin(place.yaw), place.z-x*Math.sin(place.yaw)+z*Math.cos(place.yaw)];
}
export const HOUSE_DOOR = localPlanPoint(PLAN.house,0,7.75);
export const HOUSE_EXIT = localPlanPoint(PLAN.house,0,9.2);
export const PLAN_ROUTES = [
 {name:"chegada-eixo",width:2.4,points:[[0,26],[-.8,21],[0,16],[0,11],[.7,6],[-.6,1],[0,-4],[-1,-9],[-2,-14.5]]},
 {name:"casa",width:2.4,points:[[0,11],[-4.5,11.7],[-8.5,10.3],[-11.42,10]]},
 {name:"galeria",width:2.4,points:[[0,11],[5,11.4],[9,10.8],[12.5,10]]},
 {name:"bosque",width:1.6,points:[[-10.4,10],[-9.5,5],[-12,-2],[-15,-5],[-10,-8],[-6,-6],[0,-4]]},
 {name:"banco-bosque",width:1.6,points:[[-15,-5],[-17,-5]]},
 {name:"mirante-subida",width:2.4,points:[[0,-4],[7,-6],[15,-10],[18,-16],[21,-22]]},
 {name:"mirante-descoberta",width:1.6,points:[[21,-22],[26,-17],[26,-10],[23,-4],[16,0],[11,5],[12.5,10]]},
] as const;
function catmull(a:number,b:number,c:number,d:number,t:number){return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
export const ROUTES = PLAN_ROUTES.map(route=>{
 const points=route.points.map(([x,z])=>authorPoint(x,z));const samples:PlanPoint[]=[];
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];
  for(let j=0;j<36;j++) samples.push([catmull(a[0],b[0],c[0],d[0],j/36),catmull(a[1],b[1],c[1],d[1],j/36)]);
 }
 samples.push(points[points.length-1]);return {...route,points,samples,width:route.width/FIELD_SCALE};
});
export function routeDistance(x:number,z:number,samples:readonly PlanPoint[]) {
 let distance=Infinity;
 for(let i=1;i<samples.length;i++){
  const a=samples[i-1],b=samples[i],dx=b[0]-a[0],dz=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
  distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
 }return distance;
}
export function routeClearance(x:number,z:number,extra=0){return ROUTES.some(r=>routeDistance(x,z,r.samples)<r.width/2+extra);}
