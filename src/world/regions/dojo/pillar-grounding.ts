import type { BufferGeometry } from 'three';

type Island = { triangles: number[]; vertices: number[]; min: number[]; max: number[]; center: number[]; size: number[] };

// glTF splits coincident positions at normal/UV seams. Weld only for analysis,
// retaining the actual render indices and hard edges in the returned geometry.
export function geometryIslands(geometry: BufferGeometry): Island[] {
  const p=geometry.getAttribute('position'),indices=geometry.index!;
  const keys=new Map<string,number>(),parent:number[]=[],ids:number[]=[];
  for(let i=0;i<p.count;i++) {
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*10000)).join(':');
    if(!keys.has(key)){keys.set(key,parent.length);parent.push(parent.length);}
    ids.push(keys.get(key)!);
  }
  const find=(i:number):number=>parent[i]===i?i:parent[i]=find(parent[i]);
  for(let t=0;t<indices.count;t+=3)for(let j=1;j<3;j++)parent[find(ids[indices.getX(t)])]=find(ids[indices.getX(t+j)]);
  const groups=new Map<number,{triangles:number[];vertices:Set<number>}>();
  for(let t=0;t<indices.count;t+=3){const key=find(ids[indices.getX(t)]);if(!groups.has(key))groups.set(key,{triangles:[],vertices:new Set()});
    const g=groups.get(key)!;for(let j=0;j<3;j++){const id=indices.getX(t+j);g.triangles.push(id);g.vertices.add(id);}}
  return [...groups.values()].map(g=>{
    const vertices=[...g.vertices],min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(const i of vertices){const v=[p.getX(i),p.getY(i),p.getZ(i)];for(let k=0;k<3;k++){min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k]);}}
    return {triangles:g.triangles,vertices,min,max,center:min.map((v,k)=>(v+max[k])/2),size:min.map((v,k)=>max[k]-v)};
  });
}

export function isStructuralPillar(island: Island) {
  return island.size[1]>1.6 && island.size[0]>.1 && island.size[0]<.6 && island.size[2]>.1 && island.size[2]<.6;
}

// Both inputs are already baked to native GLB metres, with quantized attributes
// decoded. Recover the original carved stone feet, never the discarded slabs.
export function groundHanokPillars(timber: BufferGeometry, stone: BufferGeometry, supportAt:(x:number,z:number)=>number, open:boolean) {
  const pillars=geometryIslands(timber).filter(isStructuralPillar);
  const feet=geometryIslands(stone).filter(i=>i.size[0]<1&&i.size[2]<1&&i.size[1]<.4);
  const woodPosition=timber.getAttribute('position'),stonePosition=stone.getAttribute('position');
  const stoneIndices:number[]=[],pillarIndices=new Set<number>(),contacts=[];
  for(const [index,pillar]of pillars.entries()) {
    const foot=feet.find(f=>Math.hypot(f.center[0]-pillar.center[0],f.center[2]-pillar.center[2])<.04);
    if(!foot)throw new Error(`Missing authored stone foot for Hanok pillar ${index}`);
    const support=supportAt(pillar.center[0],pillar.center[2]),shift=support-foot.min[1];
    const cap=foot.max[1]+shift,gap=pillar.min[1]-cap;
    for(const i of foot.vertices)stonePosition.setY(i,stonePosition.getY(i)+shift);
    stoneIndices.push(...foot.triangles);pillar.triangles.forEach(i=>pillarIndices.add(i));
    // Extend only the lower shaft into its original stone socket. Roof and
    // joinery stay fixed; the transition is smooth over the lowest .55 native m.
    for(const i of pillar.vertices){const y=woodPosition.getY(i),t=Math.min(1,Math.max(0,(y-pillar.min[1])/.55));
      woodPosition.setY(i,y-gap*(1-t*t*(3-2*t)));}
    contacts.push({index,x:pillar.center[0],z:pillar.center[2],support,shaftBefore:pillar.min[1],shaftAfter:cap,footBottom:support,footTop:cap});
  }
  if(open){const old=timber.index!,keep:number[]=[];
    for(let t=0;t<old.count;t+=3){const a=old.getX(t),b=old.getX(t+1),c=old.getX(t+2);
      if(pillarIndices.has(a)||Math.max(woodPosition.getY(a),woodPosition.getY(b),woodPosition.getY(c))>.95)keep.push(a,b,c);}
    timber.setIndex(keep);
  }
  stone.setIndex(stoneIndices);
  timber.computeVertexNormals(); // Stone was translated only: retain the authored facets.
  for(const geometry of [timber,stone]){geometry.getAttribute('position').needsUpdate=true;geometry.computeBoundingSphere();}
  return {timber,stone,contacts};
}
