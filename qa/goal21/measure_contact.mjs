import {readFile,writeFile} from 'node:fs/promises';
import {AnimationMixer,Vector3,Group} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const root='/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16';const revision=process.argv[2]||'1';
const meta=JSON.parse(await readFile(`${root}/CANDIDATOS/cycle${revision}-manual/authoring.json`,'utf8'));const file=`${root}/CANDIDATOS/cycle${revision}-manual/matteo-chibi-motion.glb`;const b=await readFile(file);const gltf=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
const world=new Group();world.scale.setScalar(1.12);world.rotation.y=Math.PI;world.position.y=.0101;world.add(gltf.scene);world.updateMatrixWorld(true);const mixer=new AnimationMixer(gltf.scene);const feet={L:[],R:[]};
gltf.scene.traverse(o=>{if(!o.isSkinnedMesh||!o.name.startsWith('Magicless'))return;const idx=o.geometry.index;const used=new Set(idx?Array.from(idx.array):Array.from({length:o.geometry.attributes.position.count},(_,i)=>i));for(const s of ['L','R']){const bone=o.skeleton.bones.findIndex(b=>b.name==='foot'+s);for(const i of used){let w=0;for(let k=0;k<4;k++)if(o.geometry.attributes.skinIndex.getComponent(i,k)===bone)w+=o.geometry.attributes.skinWeight.getComponent(i,k);if(w>.5)feet[s].push({mesh:o,index:i});}}});
const percentile=(a,p)=>a.slice().sort((a,b)=>a-b)[Math.floor((a.length-1)*p)];const result=[];
for(const [pose,speed] of [['walk',3.6],['run',6.2]]){
 mixer.stopAllAction();const clip=gltf.animations.find(c=>c.name===pose);mixer.clipAction(clip).play();const m=meta.targetSamples.find(s=>s.clip===pose);const cadence=speed*m.duty*clip.duration/(m.stroke*1.12);const samples={L:[],R:[]};
 for(let f=0;f<240;f++){
  const t=f/120;world.position.z=-speed*t;mixer.setTime(t*cadence);world.updateMatrixWorld(true);
  for(const side of ['L','R']){
   const phase=((t*cadence/clip.duration+(side==='L'?0:.5))%1);const pts=feet[side].map(v=>v.mesh.getVertexPosition(v.index,new Vector3()).applyMatrix4(v.mesh.matrixWorld));const minY=Math.min(...pts.map(v=>v.y));const low=pts.filter(v=>v.y<=minY+.004);const centroid=low.reduce((a,v)=>a.add(v),new Vector3()).divideScalar(low.length);
   samples[side].push({t,phase,stance:phase>.04&&phase<m.duty-.04,minSoleY:minY,centroid:centroid.toArray()});
  }
 }
 for(const side of ['L','R']){const s=samples[side];const v=[];for(let i=1;i<s.length;i++)if(s[i].stance&&s[i-1].stance)v.push(Math.hypot(s[i].centroid[0]-s[i-1].centroid[0],s[i].centroid[2]-s[i-1].centroid[2])/(s[i].t-s[i-1].t));const gaps=s.filter(x=>x.stance).map(x=>x.minSoleY);result.push({pose,side,speed,cadence,renderVertices:feet[side].length,medianSlip:percentile(v,.5),p95Slip:percentile(v,.95),minSoleGap:Math.min(...gaps),maxSoleGap:Math.max(...gaps),method:'Real skinned sole: minY+4mm centroid, native Three.js evaluation at120Hz, prescribed nominal body travel. Authored phase stance excludes4%near boundaries; floorY0/bodyoffset.0101. Not real-game raycast or contact-force measurement.',samples:s});}
}
await writeFile(`${root}/METRICAS/cycle${revision}-contact-offline.json`,JSON.stringify(result,null,2));console.log(result.map(({samples,...r})=>r));mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);
