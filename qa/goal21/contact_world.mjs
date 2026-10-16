import {launch,Gameplay} from '../lib/gameplay.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.env.QA_OUT;if(!out)throw Error('QA_OUT required');
await mkdir(out+'/EVIDENCIAS',{recursive:true});const browser=await launch(),g=await new Gameplay(browser,out,'contact-world').init(),report=[];
async function capture(label,seconds){
 const rows=await g.page.evaluate(async seconds=>{
  const a=document.querySelector('canvas').__avatarQA,scene=a.root.scene,avatar=scene.getObjectByName('MATTEO_AVATAR_CHIBI_V3'),V=a.root.camera.position.constructor,Ray=a.root.raycaster.constructor;
  const refs={L:[],R:[]};const bones={};
  avatar.traverse(o=>{if(o.isBone)bones[o.name]=o;if(!o.isSkinnedMesh||!o.name.includes('Magicless'))return;const geo=o.geometry,used=new Set(geo.index?Array.from(geo.index.array):Array.from({length:geo.attributes.position.count},(_,i)=>i));
   for(const side of ['L','R']){const bi=o.skeleton.bones.findIndex(b=>b.name==='foot'+side);for(const i of used){let w=0;for(let k=0;k<4;k++)if(geo.attributes.skinIndex.getComponent(i,k)===bi)w+=geo.attributes.skinWeight.getComponent(i,k);if(w>.5)refs[side].push({mesh:o,i});}}
  });
  const isAvatar=o=>{for(let p=o;p;p=p.parent)if(p===avatar)return true;return false;};const rows=[],start=performance.now();
  do{
   const now=performance.now(),state=a.animation,m=a.motionRef.current,feet={};
   for(const side of ['L','R']){
    const pts=refs[side].map(r=>r.mesh.getVertexPosition(r.i,new V()).applyMatrix4(r.mesh.matrixWorld));const min=Math.min(...pts.map(p=>p.y)),low=pts.filter(p=>p.y<=min+.004),center=low.reduce((s,p)=>s.add(p),new V()).divideScalar(low.length),sole=pts.reduce((p,q)=>q.y<p.y?q:p);
    const ray=new Ray(new V(sole.x,sole.y+.06,sole.z),new V(0,-1,0),0,2);
    const hits=ray.intersectObjects(scene.children,true).filter(h=>!isAvatar(h.object)&&h.face?.normal.clone().transformDirection(h.object.matrixWorld).y>.5);
    const hit=hits[0];feet[side]={sole:sole.toArray(),centroid:center.toArray(),ankle:bones['foot'+side].getWorldPosition(new V()).toArray(),gap:hit?sole.y-hit.point.y:null,surface:hit?.object.name,surfaceY:hit?.point.y,vertices:pts.length};
   }
   rows.push({t:now,clip:state.activeClip,actionTime:state.actions[state.activeClip].time,actionDuration:state.actions[state.activeClip].getClip().duration,weight:state.actions[state.activeClip].getEffectiveWeight(),motion:JSON.parse(JSON.stringify(m)),offset:avatar.position.toArray(),feet});
   await new Promise(r=>setTimeout(r,40));
  }while(performance.now()-start<seconds*1000);return rows;
 },seconds);
 report.push({label,rows,method:'Current skinned used vertices >50% foot weight; lowest sole +4mm centroid; upward rendered-surface raycast at same sampling instant; physical state read only. Pivot centroid rotation is not counted as sliding; ankle translation measured separately.'});await g.shot(label);await writeFile(out+'/EVIDENCIAS/contact-samples.json',JSON.stringify(report,null,2));
}
try{
 await g.open();await g.ready();await g.mode('third-person-back');await capture('flat-idle',.5);
 await g.page.keyboard.down('w');await g.page.waitForTimeout(400);await capture('flat-walk-5cycles',1.8);await g.page.keyboard.up('w');await g.settle();
 await g.page.reload();await g.ready();await g.mode('third-person-back');await g.page.keyboard.down('w');await g.page.keyboard.down('Shift');await g.page.waitForTimeout(400);await capture('flat-run-5cycles',2.1);await g.page.keyboard.up('w');await g.page.keyboard.up('Shift');await g.settle();
 if(!process.env.QA_FLAT_ONLY){await g.map('Dojang');await capture('dojo-idle',.5);await g.activate('DOJO_PRACTICE');await capture('practice-3loops',12.1);await g.leave('DOJO_PRACTICE');await capture('dojo-idle-after',.5);
 await g.go(-2,-13.5,'dojo-threshold');await capture('dojo-threshold-idle',.5);await g.go(-2,-12.5,'dojo-outside');await capture('dojo-outside-idle',.5);
 await g.map('Mirante');await g.activate('HILL_BENCH');await capture('hill-seated',.5);await g.leave('HILL_BENCH');
 await g.house({physical:false});await g.activate('HOUSE_ENTRY_BENCH');await capture('house-seated',.5);await g.leave('HOUSE_ENTRY_BENCH');}
}finally{await g.end();await browser.close();}
