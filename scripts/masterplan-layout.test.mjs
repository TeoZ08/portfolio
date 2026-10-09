import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
// Load the real pure layout modules without changing their bundler imports.
const cache=new Map();
function moduleUrl(path){
 path=resolve(path);if(cache.has(path))return cache.get(path);
 let source=stripTypeScriptTypes(readFileSync(path,'utf8'));
 source=source.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,specifier)=>`from ${JSON.stringify(moduleUrl(resolve(dirname(path),specifier+'.ts')))}`);
 const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');cache.set(path,url);return url;
}
const base='src/world/regions/';
const {PLAN,ROUTES,GALLERY_USE,localPlanPoint,HOUSE_DOOR,HOUSE_EXIT}=await import(moduleUrl(base+'masterplan-layout.ts'));
const {FIELD_BOUNDS,surfaceHeight,insideHouse}=await import(moduleUrl(base+'field/field-layout.ts'));
const {FIELD_INTERACTION_TARGETS,placePlayerPoint}=await import(moduleUrl(base+'field/field-interaction-targets.ts'));
const {WORLD_DESTINATIONS,findWorldDestination}=await import(moduleUrl(base+'field/world-destinations.ts'));
const scale=.72;
test('physical anchors convert once and rotated house door/exit stay outside solid house',()=>{
 assert.deepEqual(PLAN.arrival.map(v=>v*scale),[0,26]);
 assert.ok(Math.abs(HOUSE_DOOR[0]*scale+11.42)<1e-9);
 assert.ok(Math.abs(HOUSE_DOOR[1]*scale-10)<1e-9);
 assert.equal(insideHouse(...HOUSE_DOOR),false);assert.equal(insideHouse(...HOUSE_EXIT),false);
 const door=findWorldDestination('HOUSE_ENTRY_DOOR');assert.equal(door.interactionRotationY,PLAN.house.yaw);
});
test('all seven map destinations use their live interaction points and preserve target IDs',()=>{
 assert.equal(WORLD_DESTINATIONS.length,7);assert.equal(FIELD_INTERACTION_TARGETS.length,8);
 for(const destination of WORLD_DESTINATIONS){const target=findWorldDestination(destination.id);assert.ok(target);assert.equal(destination.x*scale,target.interactionPoint[0]);assert.equal(destination.z*scale,target.interactionPoint[2]);}
 assert.equal(findWorldDestination('unknown'),undefined);
});
test('three gallery targets are separated beyond overlapping 2.1m activation radii',()=>{
 const targets=['WORKSHOP_LIGHT_TABLE','UNIVERSITY_NOTEBOOK','COMMUNITY_WORKSHOP'].map(findWorldDestination);
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(Math.hypot(targets[i].interactionPoint[0]-targets[j].interactionPoint[0],targets[i].interactionPoint[2]-targets[j].interactionPoint[2])>4.2);
 for(const point of Object.values(GALLERY_USE)){const p=localPlanPoint(PLAN.gallery,...point);assert.deepEqual(placePlayerPoint(PLAN.gallery,...point).filter((_,i)=>i!==1),p.map(v=>v*scale));}
});
test('sampled organic circulation is inside terrain and does not cross house/gallery/dojo solids',()=>{
 for(const route of ROUTES)for(const [x,z] of route.samples){
  assert.ok(x>FIELD_BOUNDS.minX&&x<FIELD_BOUNDS.maxX&&z>FIELD_BOUNDS.minZ&&z<FIELD_BOUNDS.maxZ,route.name);
  assert.equal(insideHouse(x,z),false,route.name+' crosses house');
  for(const [place,w,d] of [[PLAN.gallery,PLAN.gallery.width,PLAN.gallery.depth],[PLAN.dojo,13.2,9.4]]){
   const dx=x-place.x,dz=z-place.z,lx=dx*Math.cos(place.yaw)-dz*Math.sin(place.yaw),lz=dx*Math.sin(place.yaw)+dz*Math.cos(place.yaw);
   assert.ok(Math.abs(lx)>=w/2-.02||Math.abs(lz)>=d/2-.02,route.name+' crosses volume');
  }
 }
});
test('shared terrain is finite and sampled routes stay below a 35-degree grade',()=>{
 for(const route of ROUTES)for(const [x,z] of route.samples){
  const h=surfaceHeight(x,z),dx=(surfaceHeight(x+.05,z)-surfaceHeight(x-.05,z))/.1,dz=(surfaceHeight(x,z+.05)-surfaceHeight(x,z-.05))/.1;
  assert.ok(Number.isFinite(h));assert.ok(Math.hypot(dx,dz)<Math.tan(35*Math.PI/180),route.name+' steep');
 }
});
