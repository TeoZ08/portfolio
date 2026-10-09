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

const {DOJO}=await import(moduleUrl(base+'dojo/dojo-layout.ts'));
const {soilWeights}=await import(moduleUrl(base+'field/terrain-biomes.ts'));
test('monument envelope and native Hanok scale are converted once',()=>{
 assert.deepEqual([PLAN.dojo.x*scale,PLAN.dojo.z*scale,PLAN.dojo.width*scale,PLAN.dojo.depth*scale].map(v=>Math.round(v*1e9)/1e9),[-2,-21,29,20]);
 assert.equal(DOJO.mainScale*scale,1.45);assert.ok(11.2*DOJO.mainScale*scale>16);
 assert.ok(DOJO.wingX*scale+7.9*DOJO.wingScale*scale/2<PLAN.dojo.width*scale/2);
});
test('right-hand hill route clears the entire dojang envelope with walking width',()=>{
 const route=ROUTES.find(r=>r.name==='mirante-subida');
 for(const [x,z] of route.samples){
  if(Math.abs(z-PLAN.dojo.z)<PLAN.dojo.depth/2+route.width/2)
   assert.ok(x-PLAN.dojo.x>PLAN.dojo.width/2+route.width/2+.4/scale);
 }
});
test('stairs form a continuous walkable connection from axial route to terrace',()=>{
 const end=ROUTES[0].samples.at(-1);assert.ok(Math.abs(end[0]-PLAN.dojo.x)<.01);
 const foot=PLAN.dojo.z+DOJO.stairZ[0]+.7;assert.ok(Math.abs(end[1]-foot)<1);
 for(let i=1;i<3;i++){assert.ok(DOJO.stairZ[i-1]-DOJO.stairZ[i]<1.4);assert.ok((DOJO.stairTops[i]-DOJO.stairTops[i-1])*scale<.14);}
 assert.ok(DOJO.stairZ[2]-.7<DOJO.terraceDepth/2);
 const target=findWorldDestination('DOJO_PRACTICE');assert.ok(Math.abs(target.interactionPoint[1]-(DOJO.floor*scale+.86))<.01);
});
test('regional soil weights are finite, normalized and spatially distinct',()=>{
 for(let x=-55;x<=55;x+=2)for(let z=-55;z<=55;z+=2){const w=soilWeights(x,z);assert.ok(w.every(v=>Number.isFinite(v)&&v>=0&&v<=1));assert.ok(w.reduce((a,b)=>a+b,0)<=1.000001);}
 assert.ok(soilWeights(PLAN.dojo.x,PLAN.dojo.z)[0]>.7);
 assert.ok(soilWeights(PLAN.hill.x,PLAN.hill.z)[1]>.6);
 assert.ok(soilWeights(PLAN.forest.x,PLAN.forest.z)[2]>.35);
});
test('soil material uses real maps on the collider mesh without floating path planes',()=>{
 const terrain=readFileSync(base+'field/FieldTerrain.tsx','utf8'),paths=readFileSync(base+'places/WorldPaths.tsx','utf8');
 assert.ok(terrain.includes('FIELD_TERRAIN_SURFACE.positions'));assert.ok(terrain.includes('attributes-soilWeights'));assert.ok(!paths.includes('makeBranches'));
});

const {REGIONAL_PLANTING}=await import(moduleUrl(base+'field/regional-planting-layout.ts'));
const {routeClearance}=await import(moduleUrl(base+'masterplan-layout.ts'));
const {insidePlace}=await import(moduleUrl(base+'places/place-layout.ts'));
test('curated clusters leave routes, house and destination envelopes clear',()=>{
 let count=0;
 for(const items of Object.values(REGIONAL_PLANTING))for(const p of items){const [x,y,z]=p.position;
 assert.equal(routeClearance(x,z,1.8),false);assert.equal(insideHouse(x,z,2),false);assert.equal(insidePlace(x,z,1.5),false);
 assert.ok(Math.abs(y-(surfaceHeight(x,z)-.02))<1e-6);count++;
 }assert.ok(count>20&&count<126);
});
