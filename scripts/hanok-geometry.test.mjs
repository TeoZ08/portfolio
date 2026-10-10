import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { transformedGeometry } from '../src/world/regions/dojo/hanok-geometry.ts';
import RAPIER from '@dimforge/rapier3d-compat';
globalThis.ProgressEvent=class{};
await RAPIER.init();
for(const file of ['main-house','side-wing'])test(`quantized ${file}: transformed colliders retain native bounds and valid Rapier shapes`,async()=>{
 const b=readFileSync(`public/assets/songahm/${file}.glb`);
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);
 const world=new RAPIER.World({x:0,y:-9.81,z:0});let triangles=0;
 g.scene.traverse(m=>{if(!m.isMesh)return;const geometry=transformedGeometry(m.geometry,m.matrixWorld),a=geometry.getAttribute('position');
  assert.ok(a.array instanceof Float32Array);for(let i=0;i<a.count;i++)assert.ok(Number.isFinite(a.getY(i)));
  const positions=new Float32Array(a.array),indices=new Uint32Array(geometry.index.array);
  assert.ok(world.createCollider(RAPIER.ColliderDesc.trimesh(positions,indices)));triangles+=indices.length/3;
  geometry.computeBoundingBox();assert.ok(geometry.boundingBox.max.y>0);geometry.dispose();
 });assert.ok(triangles>5000);world.free();
});
