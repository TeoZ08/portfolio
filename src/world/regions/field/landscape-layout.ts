import { terrainHeight, seededRandom, surfaceHeight, insideHouse } from './field-layout';
import { insidePlace } from '../places/place-layout';
import { routeClearance } from '../masterplan-layout';
import { makeSurface, type FieldInstance } from './field-geometry';
import { linearColor } from './field-palette';
import { plantingAllowed } from './planting-clearance';

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
export function landscapeCoordinates(outer=285,step=5) {
  const coords:number[]=[];
  for(let v=-outer;v<=outer;v+=Math.abs(v)>=75?step:1.25)coords.push(v);
  return coords;
}
const LANDSCAPE_COORDS=landscapeCoordinates();
function cellIndex(coords:readonly number[],value:number) {
  let lo=0,hi=coords.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(coords[mid]<=value)lo=mid;else hi=mid;}
  return Math.min(coords.length-2,lo);
}
// Same grid, triangle diagonal and Float32 vertex heights as the rendered mesh.
// Binary cell lookup avoids an O(triangle count) scan per plant.
export function landscapeSurfaceHeight(x:number,z:number) {
  if(Math.max(Math.abs(x),Math.abs(z))<=55)return surfaceHeight(x,z);
  const ix=cellIndex(LANDSCAPE_COORDS,x),iz=cellIndex(LANDSCAPE_COORDS,z);
  const x0=LANDSCAPE_COORDS[ix],x1=LANDSCAPE_COORDS[ix+1],z0=LANDSCAPE_COORDS[iz],z1=LANDSCAPE_COORDS[iz+1];
  const u=(x-x0)/(x1-x0),v=(z-z0)/(z1-z0);
  const a=Math.fround(landscapeHeight(x0,z0)),b=Math.fround(landscapeHeight(x1,z0)),c=Math.fround(landscapeHeight(x0,z1)),d=Math.fround(landscapeHeight(x1,z1));
  return u+v<=1?a+u*(b-a)+v*(c-a):d+(1-v)*(b-d)+(1-u)*(c-d);
}
export function landscapeSlope(x:number,z:number) {
  const dx=(landscapeSurfaceHeight(x+.6,z)-landscapeSurfaceHeight(x-.6,z))/1.2;
  const dz=(landscapeSurfaceHeight(x,z+.6)-landscapeSurfaceHeight(x,z-.6))/1.2;
  return Math.hypot(dx,dz);
}
export function makeLandscape(inner:number,outer:number,step:number) {
  // Match the physical mesh's 1.25u tessellation at its four edges. The
  // sparse distant grid otherwise leaves hairline gaps at the height join.
  const coords=landscapeCoordinates(outer,step);
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
  const y=landscapeSurfaceHeight(x,z),s=(edge<65?1.0:1.25)+random()*(edge<65?1.0:1.6);
  if(!plantingAllowed(x,z,.14*s,1.22*s)||landscapeSlope(x,z)>.48)continue;
  if(LANDSCAPE_TREES.some(t=>Math.hypot(x-t.position[0],z-t.position[2])<1.25*(s+t.scale[0])))continue;
  const height=s*(.85+random()*.35),yaw=random()*6.28,c=Math.cos(yaw),sn=Math.sin(yaw);
  // The trunk has a square .2u base. Anchor all four rotated corners on the
  // visible triangles, so a downhill edge cannot hang above the slope.
  const root=Math.min(y,...[-1,1].flatMap(a=>[-1,1].map(b=>{
    const dx=a*.1*s,dz=b*.1*s;
    return landscapeSurfaceHeight(x+dx*c+dz*sn,z-dx*sn+dz*c);
  })))-.025;
  LANDSCAPE_TREES.push({position:[x,root,z],scale:[s,height,s],rotation:[0,yaw,0],color:['#647950','#71825a','#7e8c64','#536e57'][i%4]});
}
