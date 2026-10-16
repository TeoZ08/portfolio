import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {AnimationMixer,Vector3} from 'three';
import assert from 'node:assert/strict';
const P='/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16';
const load=async file=>{const b=await readFile(file);return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const baseline=await load(P+'/BASELINE/matteo-chibi-v3.glb'),candidate=await load(P+'/CANDIDATOS/cycle3-manual/matteo-chibi-motion.glb');
const hash=a=>createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
function signature(g){const meshes=[],bones=[];g.scene.traverse(o=>{if(o.isBone)bones.push({name:o.name,parent:o.parent.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray()});if(o.isSkinnedMesh){const attrs=Object.fromEntries(Object.entries(o.geometry.attributes).map(([n,a])=>[n,{size:a.itemSize,count:a.count,type:a.array.constructor.name,hash:hash(a.array)}]));meshes.push({name:o.name,attrs,index:hash(o.geometry.index.array),inverseBind:o.skeleton.boneInverses.map(m=>m.toArray()),material:{name:o.material.name,color:o.material.color.toArray(),roughness:o.material.roughness,metalness:o.material.metalness,side:o.material.side}});}});return {meshes,bones};}
const A=signature(baseline),B=signature(candidate);assert.deepEqual(A,B,'Mesh/material/skin/rest changed');assert.equal(B.bones.length,24);
const poses=[];for(const name of ['idle','seated-pose']){const bm=new AnimationMixer(baseline.scene),cm=new AnimationMixer(candidate.scene);const ba=baseline.animations.find(c=>c.name===name),ca=candidate.animations.find(c=>c.name===name);bm.clipAction(ba).play();cm.clipAction(ca).play();let maxError=0;
 for(const phase of [0,.125,.25,.5,.75,.9]){bm.setTime(phase*ba.duration);cm.setTime(phase*ca.duration);baseline.scene.updateMatrixWorld(true);candidate.scene.updateMatrixWorld(true);for(const b of A.bones){const p=baseline.scene.getObjectByName(b.name).getWorldPosition(new Vector3()),q=candidate.scene.getObjectByName(b.name).getWorldPosition(new Vector3());maxError=Math.max(maxError,p.distanceTo(q));}}
 assert(maxError<.001,`${name} preserved within1mm`);poses.push({name,maxLandmarkError:maxError});bm.stopAllAction();cm.stopAllAction();}
const clips=candidate.animations.map(c=>({name:c.name,duration:c.duration,tracks:c.tracks.length,keyValues:c.tracks.reduce((n,t)=>n+t.values.length,0)}));assert.equal(clips.length,9);assert(clips.every(c=>c.duration>0));for(const c of candidate.animations)for(const t of c.tracks)assert([...t.values,...t.times].every(Number.isFinite));
const result={status:'passing',identity:{meshes:B.meshes.length,bones:B.bones.length,exactGeometryMaterialsSkinRest:true,details:B},preservedPoses:poses,clips,baselineClips:baseline.animations.map(c=>({name:c.name,duration:c.duration,tracks:c.tracks.length,keyValues:c.tracks.reduce((n,t)=>n+t.values.length,0)}))};
await writeFile(P+'/METRICAS/fresh-gltf-identity.json',JSON.stringify(result,null,2));console.log('ASSET_IDENTITY_OK',poses,clips);
