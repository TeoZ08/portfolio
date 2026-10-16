import {launch,Gameplay} from '../lib/gameplay.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const out=process.env.QA_OUT; if(!out)throw Error('QA_OUT required');
const captureHz=Number(process.env.QA_CAPTURE_HZ||30);
await mkdir(path.join(out,'EVIDENCIAS'),{recursive:true});
await writeFile(path.join(out,'EVIDENCIAS/browser-motion-source.mjs'),await readFile(new URL(import.meta.url),'utf8'));
const browser=await launch();const report={startedAt:new Date().toISOString(),scope:'Native inputs; read-only frame telemetry; touch is CDP emulation',profiles:[]};
const modes=['third-person-back','third-person-front','first-person'];
try{
for(const touch of [false,true]) for(const quality of ['balanced','low']) for(const mode of modes){
 const id=`${touch?'touch':'desktop'}-${quality}-${mode}`;
 if(process.env.QA_ONLY && !process.env.QA_ONLY.split(',').includes(id))continue;
 const videoDir=path.join(out,'VIDEOS',id);await mkdir(videoDir,{recursive:true});
 const g=await new Gameplay(browser,out,id,{touch,quality}).init();
 const captured=[],pending=[];let last=-Infinity;
 g.cdp.on('Page.screencastFrame',event=>{
  const t=event.metadata.timestamp;
  if(t-last<1/captureHz){void g.cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});return;}
  last=t;const file=path.join(videoDir,String(captured.length).padStart(6,'0')+'.jpg');captured.push({t,file});
  pending.push(writeFile(file,Buffer.from(event.data,'base64')).then(()=>g.cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId})).catch(()=>{}));
 });
 await g.cdp.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1280,maxHeight:844,everyNthFrame:1});const result={id,status:'running'};report.profiles.push(result);
 try{
  await g.open(process.env.QA_PATH || "/?avatarQA");await g.ready();await g.mode(mode);
  await g.page.evaluate(()=>{
   const qa=document.querySelector('canvas').__avatarQA;
   const model=qa.root.scene.getObjectByName('MATTEO_AVATAR_CHIBI_V3');
   const bones=[];model.traverse(o=>{if(o.isBone)bones.push(o)});
   window.__goal20={frames:[],events:[],frame:0,boneNames:bones.map(b=>b.name),timeOrigin:performance.timeOrigin};
   function sample(t){
    const state=window.__goal20,a=document.querySelector('canvas')?.__avatarQA;
    if(a?.animation && state.frames.length<30000){
     const m=a.motionRef.current,c=a.controlRef.current;
     state.frames.push({t,pose:a.animation.current,activeClip:a.animation.activeClip,phase:a.animation.phase,motionReview:a.motionReview,movingLanding:a.animation.movingLanding?{time:a.animation.movingLanding.time,weight:a.animation.movingLanding.getEffectiveWeight(),tracks:a.animation.movingLanding.getClip().tracks.length}:null,position:{...m.position},velocity:{...m.velocity},grounded:m.grounded,airborne:m.airborne,sprinting:m.sprinting,manual:c.manualInputEnabled,locked:c.physicsLocked,requestedPose:c.pose,camera:window.__environmentQA.read().perspective.selected,actions:Object.fromEntries(Object.entries(a.animation.actions).map(([n,v])=>[n,{time:v.time,paused:v.paused,weight:v.getEffectiveWeight(),timeScale:v.getEffectiveTimeScale(),running:v.isRunning()}])),bones:Object.fromEntries(bones.map(b=>[b.name,[b.matrixWorld.elements[12],b.matrixWorld.elements[13],b.matrixWorld.elements[14]]]))});
    }
    state.frame=requestAnimationFrame(sample);
   }
   window.__goal20.frame=requestAnimationFrame(sample);
  });
  const mark=async(label,duration=0)=>{await g.page.evaluate(label=>window.__goal20.events.push({label,t:performance.now()}),label);if(duration)await g.page.waitForTimeout(duration);await g.shot(label);};
  await mark('idle',1200);
  if(touch){await g.stick('w',1200);}else await g.key('w',1200);
  await mark('walk-stop',300);
  if(!touch){await g.page.keyboard.down('w');await g.page.keyboard.down('Shift');await g.page.waitForTimeout(1000);await mark('run');await g.key('Space',70);await g.page.waitForTimeout(100);await mark('sprint-dash-jump');await g.page.keyboard.up('Shift');await g.page.keyboard.up('w');}
  else {const box=await g.page.locator('.touch-joystick-pad').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;const point=(id,x,y)=>({id,x,y,radiusX:5,radiusY:5,force:1});await g.cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,x,y)]});await g.cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(1,x,y-40)]});await g.page.waitForTimeout(1000);await mark('run');const jump=await g.page.locator('.touch-jump').boundingBox();await g.cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,x,y-40),point(2,jump.x+jump.width/2,jump.y+jump.height/2)]});await g.page.waitForTimeout(120);await mark('sprint-dash-jump');await g.cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  await g.settle();await mark('landed',400);
  if(touch)await g.click(g.page.getByRole('button',{name:'Saltar'}));else await g.key('Space',70);
  await g.page.waitForTimeout(120);await mark('standing-jump');await g.settle();await mark('standing-landed',400);
  await g.map('Mirante');await g.activate('HILL_BENCH');await mark('seated-hold',1200);await g.leave('HILL_BENCH');await mark('seat-exit',300);
  await g.map('Dojang');
  if(process.env.QA_CAMERA_YAW){
   const wanted=Number(process.env.QA_CAMERA_YAW);
   await g.page.locator('canvas').click({position:{x:500,y:350}});
   await g.page.mouse.move(500,350);await g.page.waitForTimeout(100);
   const before=(await g.read()).env.perspective.yaw;
   await g.page.mouse.move(500+(wanted-before)/.0025,350);
   await g.page.waitForFunction(y=>Math.abs(window.__environmentQA.read().perspective.yaw-y)<.04,wanted);
   g.data.observations.push({label:'Native mouse look for three-quarter practice review',wanted,observed:(await g.read()).env.perspective.yaw});
  }
  await g.activate('DOJO_PRACTICE');await mark('practice-cycle',3600);
  await g.leave('DOJO_PRACTICE');await mark('practice-exit',400);
  await g.menu();await g.click(g.page.getByLabel('Movimento reduzido'));await g.click(g.page.getByRole('button',{name:/Continuar explorando/}));
  await g.activate('DOJO_PRACTICE');await mark('practice-reduced',1500);await g.leave('DOJO_PRACTICE');
  const frames=await g.page.evaluate(()=>{cancelAnimationFrame(window.__goal20.frame);return window.__goal20;});
  await writeFile(path.join(out,'EVIDENCIAS',id+'-frames.json'),JSON.stringify(frames));
  result.status='observed';result.frames=frames.frames.length;result.errors=g.data.errors;result.video=path.join(videoDir,'capture.mp4');
 }catch(e){result.status='harness-error';result.error=e.stack;await g.shot('interrupted').catch(()=>{});}
 finally{await g.cdp.send('Page.stopScreencast').catch(()=>{});await Promise.allSettled(pending);
  await writeFile(path.join(videoDir,'timestamps.json'),JSON.stringify(captured,null,2));
  if(captured.length>1){const lines=captured.map((f,i)=>`file '${f.file}'\nduration ${Math.max(.001,(captured[i+1]?.t??(f.t+1/captureHz))-f.t)}`).join('\n');const list=path.join(videoDir,'frames.concat');await writeFile(list,lines+'\n');const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',list,'-c:v','libx264','-pix_fmt','yuv420p','-fps_mode','vfr','-movflags','+faststart',path.join(videoDir,'capture.mp4')],{encoding:'utf8'});result.encoding={status:encoded.status,stderr:encoded.stderr};}
  await g.page.keyboard.up('w').catch(()=>{});await g.page.keyboard.up('Shift').catch(()=>{});await g.end();await writeFile(path.join(out,'EVIDENCIAS/browser-audit.json'),JSON.stringify(report,null,2));console.log(id,result.status,result.error?.split('\n')[0]||'');}
}
}finally{await browser.close();report.finishedAt=new Date().toISOString();await writeFile(path.join(out,'EVIDENCIAS/browser-audit.json'),JSON.stringify(report,null,2));}
