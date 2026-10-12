import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Mesh,MeshBasicMaterial,Raycaster,Vector3} from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {transformedGeometry} from '../src/world/regions/dojo/hanok-geometry.ts';
const cache=new Map();function url(p){p=resolve(p);if(cache.has(p))return cache.get(p);const s=stripTypeScriptTypes(readFileSync(p,'utf8')).replace(/from\s+['"](\.[^'"]+)['"]/g,(_,v)=>`from ${JSON.stringify(url(resolve(dirname(p),v+'.ts')))}`);const u='data:text/javascript;base64,'+Buffer.from(s).toString('base64');cache.set(p,u);return u;}
const {geometryIslands,isStructuralPillar,groundHanokPillars}=await import(url('src/world/regions/dojo/pillar-grounding.ts'));
const {pillarSupportNative}=await import(url('src/world/regions/dojo/pillar-layout.ts'));
const {hazeWeights,landscapeHaze,SUNSET_HAZE}=await import(url('src/world/regions/field/landscape-haze.ts'));
const {fieldDaylight}=await import(url('src/world/regions/field/field-daylight.ts'));
const {PLAN}=await import(url('src/world/regions/masterplan-layout.ts'));
const {surfaceHeight}=await import(url('src/world/regions/field/field-layout.ts'));
globalThis.ProgressEvent=class{};await RAPIER.init();const rows=[];
for(const file of ['main-house','side-wing']){
 const raw=readFileSync(`public/assets/songahm/${file}.glb`),g=await new GLTFLoader().parseAsync(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'');g.scene.updateMatrixWorld(true);
 const stem=file==='main-house'?'hanok-main-house':'hanok-side-wing';
 const original=n=>{const m=g.scene.getObjectByName(stem+'_'+n);return transformedGeometry(m.geometry,m.matrixWorld);};
 const timber=original(1),stone=original(0),old=timber.getAttribute('position').array.slice(),stoneNormals=stone.getAttribute('normal').array.slice();
 const baseline=geometryIslands(timber).filter(isStructuralPillar);
 const supported=groundHanokPillars(timber,stone,(x,z)=>pillarSupportNative(file,x,z),file==='main-house');
 const pillars=geometryIslands(timber).filter(isStructuralPillar),feet=geometryIslands(stone),count=file==='main-house'?12:6,scale=file==='main-house'?1.45:.82;
 const ground=surfaceHeight(PLAN.dojo.x,PLAN.dojo.z)*.72;
 const origin=file==='main-house'?.445*.72-.50781*1.45:.075*.72;
 test(`${file}: every actual shaft and original carved foot bears on its visible support`,()=>{
  assert.equal(pillars.length,count);assert.equal(feet.length,count);
  for(const [i,p]of pillars.entries()){
   const f=feet.find(f=>Math.hypot(f.center[0]-p.center[0],f.center[2]-p.center[2])<.04);assert.ok(f);
   const floor=pillarSupportNative(file,p.center[0],p.center[2]);assert.ok(Math.abs(f.min[1]-floor)*scale<.001);assert.ok(Math.abs(p.min[1]-f.max[1])*scale<.001);
   for(const [label,offsetX]of file==='main-house'?[['C',0]]:[['W',-10.5],['E',10.5]])rows.push({id:label+String(i+1).padStart(2,'0'),worldX:PLAN.dojo.x*.72+offsetX+p.center[0]*scale,worldZ:PLAN.dojo.z*.72+(file==='side-wing'?-1.4*.72:0)+p.center[2]*scale,supportWorldY:ground+origin+floor*scale,shaftBeforeWorldY:ground+origin+baseline[i].min[1]*scale,gapBefore:(baseline[i].min[1]-floor)*scale,footBottomWorldY:ground+origin+f.min[1]*scale,shaftAfterWorldY:ground+origin+p.min[1]*scale,footTopWorldY:ground+origin+f.max[1]*scale,gapAfter:(p.min[1]-f.max[1])*scale,bearing:file==='side-wing'?'WING_CONTINUOUS_MASONRY':Math.abs(floor-pillarSupportNative(file,4.2,2.2))<.001?'TIMBER_DECK':'TATAMI'});
  }
 });
 test(`${file}: roof joints, XZ shape and authored stone normals are preserved; slabs stay omitted`,()=>{
  const p=timber.getAttribute('position');for(let i=0;i<p.count;i++){
   assert.equal(p.getX(i),old[i*3]);assert.equal(p.getZ(i),old[i*3+2]);
   const shaft=baseline.find(s=>s.vertices.includes(i));if(!shaft||old[i*3+1]>=shaft.min[1]+.55)assert.equal(p.getY(i),old[i*3+1]);
  }
  assert.deepEqual(stone.getAttribute('normal').array,stoneNormals);assert.ok(feet.every(f=>f.size[0]<1&&f.size[2]<1&&f.size[1]<.4));
 });
 test(`${file}: exact visible foot mesh and Rapier collider agree below the formerly floating shaft`,()=>{
  const w=new RAPIER.World({x:0,y:-9.81,z:0});w.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(stone.getAttribute('position').array),new Uint32Array(stone.index.array)));w.step();
  const m=new Mesh(stone,new MeshBasicMaterial());m.updateMatrixWorld(true);
  for(const f of feet){const origin={x:f.center[0],y:f.min[1]+f.size[1]*.5,z:f.center[2]+1};const direction={x:0,y:0,z:-1};const hit=w.castRay(new RAPIER.Ray(origin,direction),2,true);const visible=new Raycaster(new Vector3(origin.x,origin.y,origin.z),new Vector3(0,0,-1)).intersectObject(m)[0];assert.ok(hit&&visible);assert.ok(Math.abs(hit.timeOfImpact-visible.distance)<.001);}
  m.material.dispose();w.free();
 });
}
test('sunset haze leaves nearby gameplay entirely clear in both quality modes',()=>{for(const low of [false,true])for(const height of [-10,0,10,30])for(const depth of [0,25,40,SUNSET_HAZE.near])assert.equal(hazeWeights(depth,height,low).density,0);});
test('haze density is continuous, monotonic and bounded from the edge through far ridges',()=>{for(const height of [0,5,15,30]){let previous=0;for(let d=0;d<=300;d+=.25){const a=hazeWeights(d,height);assert.ok(a.density>=previous-1e-12&&a.density<=1);assert.ok(a.density-previous<.01);previous=a.density;}assert.equal(previous,1);}});
test('mid-distance valleys are cooler and denser than high ridges; mobile reduces the cool tint',()=>{const valley=hazeWeights(115,0),ridge=hazeWeights(115,30),low=hazeWeights(115,0,true);assert.ok(valley.cool>ridge.cool);assert.ok(valley.density>ridge.density);assert.ok(low.cool<valley.cool);assert.equal(low.density,valley.density);});
test('the sunset shader replaces one fog chunk, supports instancing and leaves legacy hours unchanged',()=>{const shader=()=>({vertexShader:'#include <worldpos_vertex>',fragmentShader:'#include <fog_fragment>'});const a=shader();landscapeHaze(a,true);assert.ok(a.vertexShader.includes('instanceMatrix*hazePosition'));assert.ok(!a.fragmentShader.includes('#include <fog_fragment>'));assert.equal(a.fragmentShader.match(/gl_FragColor.rgb=mix/g).length,1);assert.ok(!/sampler|for\s*\(/.test(a.fragmentShader));const legacy=shader();landscapeHaze(legacy,false);assert.deepEqual(legacy,shader());assert.equal(fieldDaylight(17.5).fogNear,SUNSET_HAZE.near);assert.equal(fieldDaylight(9).fogNear,42);assert.equal(fieldDaylight(22).fogNear,70);});
test.after(()=>{if(process.env.PILLAR_CSV){const keys=Object.keys(rows[0]);writeFileSync(process.env.PILLAR_CSV,keys.join(',')+'\n'+rows.map(r=>keys.map(k=>typeof r[k]==='number'?r[k].toFixed(6):r[k]).join(',')).join('\n')+'\n');}});
