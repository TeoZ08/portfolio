import { PLAN } from '../masterplan-layout';
import { surfaceHeight } from '../field/field-layout';
import { makeSurface } from '../field/field-geometry';
import { linearColor } from '../field/field-palette';
import { FIELD_SCALE as S } from '../world-scale';
const CONTOUR=[[-14.2,-5],[-14.2,3.4],[-10.5,4.3],[-5,4.9],[0,6.7],[4.5,5],[10,4.3],[14.2,3.5],[14.2,-5],[0,-5]];
const catmull=(a:number,b:number,c:number,d:number,t:number)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
export function makeSongahmCourtyard() {
  const boundary:number[][]=[];
  for(let i=0;i<CONTOUR.length;i++)for(let j=0;j<12;j++) {
    const a=CONTOUR[(i+CONTOUR.length-1)%CONTOUR.length],b=CONTOUR[i],c=CONTOUR[(i+1)%CONTOUR.length],d=CONTOUR[(i+2)%CONTOUR.length];
    boundary.push([catmull(a[0],b[0],c[0],d[0],j/12)/S,catmull(a[1],b[1],c[1],d[1],j/12)/S]);
  }
  const positions:number[]=[],colors:number[]=[],indices:number[]=[],n=boundary.length;
  const centerGround=surfaceHeight(PLAN.dojo.x,PLAN.dojo.z),inside=linearColor('#a4a08b'),edge=linearColor('#8d846a');
  // An eight-ring patch follows the existing visible mesh; it does not flatten
  // the terrain or create a raised slab. The original ground collider remains.
  for(let ring=0;ring<=8;ring++)for(const[x,z]of boundary){
    const r=ring/8,px=x*r,pz=z*r;
    positions.push(px,surfaceHeight(PLAN.dojo.x+px,PLAN.dojo.z+pz)-centerGround+.009,pz);
    const blend=Math.max(0,(r-.65)/.35);colors.push(...inside.map((v,k)=>v+(edge[k]-v)*blend));
  }
  for(let ring=0;ring<8;ring++)for(let j=0;j<n;j++){const a=ring*n+j,b=ring*n+(j+1)%n,c=a+n,d=b+n;indices.push(a,c,b,b,c,d);}
  return makeSurface(positions,indices,colors);
}
