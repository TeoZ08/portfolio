import { type FieldInstance } from "./field-geometry";
import { authorPoint, routeClearance } from "../masterplan-layout";
import { insidePlace } from "../places/place-layout";
import { insideHouse, seededRandom, surfaceHeight } from "./field-layout";

// Curated clusters, not a random scatter over the entire map. Routes and all
// destination envelopes remain clear. Repeat species with instancing per primitive.
export const REGIONAL_CLUSTERS = [[-10,20,3,2],[11,21,3,2],[-26,-7,4,3],[28,1,3,4],[-21,-26,3,3],[29,-25,3,4],[7,-33,4,2]] as const;
function compose() {
  const r=seededRandom(10109);const stone:FieldInstance[]=[],bush:FieldInstance[]=[],pebble:FieldInstance[]=[];
  for(const [cx,cz,rx,rz] of REGIONAL_CLUSTERS) for(let i=0;i<18;i++) {
    const a=r()*Math.PI*2,rad=Math.sqrt(r()),[x,z]=authorPoint(cx+Math.cos(a)*rx*rad,cz+Math.sin(a)*rz*rad);
    if(routeClearance(x,z,1.8)||insideHouse(x,z,2)||insidePlace(x,z,1.5))continue;
    const size=(i%6===0?1.5:.55)+r()*.4;
    const item:FieldInstance={position:[x,surfaceHeight(x,z)-.02,z],scale:[size,size*(.7+r()*.3),size],rotation:[0,r()*6.28,0],color:'#ffffff'};
    (i%6===0?stone:i%2?bush:pebble).push(item);
  }return {stone,bush,pebble};
}
export const REGIONAL_PLANTING=compose();
