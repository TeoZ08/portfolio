import { terrainHeight, seededRandom, surfaceHeight, insideHouse } from './field-layout';
import { insidePlace } from '../places/place-layout';
import { routeClearance } from '../masterplan-layout';
import { makeSurface, type FieldInstance } from './field-geometry';
import { linearColor } from './field-palette';

// One continuous height field outside the physical 55u boundary. No isolated
// mountain props, invisible new ground colliders or circular ridge silhouettes.
export function landscapeHeight(x:number,z:number) {
  const edge=Math.max(Math.abs(x),Math.abs(z));
  if(edge<=55)return terrainHeight(x,z);
  const t=Math.min(1,(edge-55)/64);const blend=t*t*(3-2*t);
  const boundary=terrainHeight(x*55/edge,z*55/edge);
  const waves=3+2*Math.sin(x*.026+Math.sin(z*.018)*1.3)+1.7*Math.cos(z*.032-x*.009)
    +Math.sin(x*.067+z*.039)+.6*Math.cos(x*.11-z*.08);
  const hills=20*Math.exp(-(((x+35)/88)**2)-((z+155)/60)**2)
    +15*Math.exp(-(((x-165)/65)**2)-((z+25)/110)**2)
    +12*Math.exp(-(((x+170)/62)**2)-((z-20)/100)**2)
    +10*Math.exp(-(((x-30)/110)**2)-((z-180)/62)**2);
  return boundary*(1-blend)+blend*(waves+hills);

}
export function makeLandscape(inner:number,outer:number,step:number) {
  // Match the physical mesh's 1.25u tessellation at its four edges. The
  // sparse distant grid otherwise leaves hairline gaps at the height join.
  const coords:number[]=[];for(let v=-outer;v<=outer;v+=Math.abs(v)>=75?step:1.25)coords.push(v);
  const n=coords.length-1,p:number[]=[],ids:number[]=[],c:number[]=[];
  const near=linearColor('#65764f'),far=linearColor('#82998c');
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
    const x=coords[i],z=coords[j];
    p.push(x,landscapeHeight(x,z),z);
    const d=Math.min(1,Math.max(0,(Math.hypot(x,z)-55)/190));
    const pigment=.96+.04*Math.sin(x*.08+z*.04);
    c.push(...near.map((v,k)=>(v+(far[k]-v)*d)*pigment));
    if(i<n&&j<n){const x1=coords[i+1],z1=coords[j+1];
      if(x>=inner||x1<=-inner||z>=inner||z1<=-inner){const a=j*(n+1)+i,b=a+n+1;ids.push(a,b,a+1,a+1,b,b+1);}
    }
  }return makeSurface(p,ids,c);
}
const random=seededRandom(12102026);
export const LANDSCAPE_TREES:FieldInstance[]=[];
const WOODLAND_BEDS=[[-70,-58,25,23],[-26,-72,28,21],[45,-80,28,24],[83,-38,22,28],[77,20,24,30],[61,73,27,25],[8,87,32,23],[-52,76,26,24],[-84,15,26,32],[-83,-22,24,26],[-37,-135,48,32],[128,18,27,60]];
for(const [cx,cz,rx,rz] of WOODLAND_BEDS)for(let i=0;i<34;i++){
  const angle=random()*Math.PI*2,radius=Math.sqrt(random());
  const x=cx+Math.cos(angle)*radius*rx,z=cz+Math.sin(angle)*radius*rz,edge=Math.max(Math.abs(x),Math.abs(z));
  if(edge<43||routeClearance(x,z,2.8)||insideHouse(x,z,3)||insidePlace(x,z,3))continue;
  const y=edge>55?landscapeHeight(x,z):surfaceHeight(x,z),s=(edge<65?1.0:1.25)+random()*(edge<65?1.0:1.6);
  LANDSCAPE_TREES.push({position:[x,y-.09,z],scale:[s,s*(.85+random()*.35),s],rotation:[0,random()*6.28,0],color:['#647950','#71825a','#7e8c64','#536e57'][i%4]});
}
