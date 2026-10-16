import {launch,Gameplay,world} from '../lib/gameplay.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.QA_OUT;if(!out)throw Error('QA_OUT required');await mkdir(out+'/EVIDENCIAS',{recursive:true});const browser=await launch();const report=[];
async function install(g){await g.page.evaluate(()=>{const frames=[],events=[];window.__g21motion={frames,events};function sample(t){const a=document.querySelector('canvas').__avatarQA,s=a.animation,m=a.motionRef.current;frames.push({t,pose:s.current,clip:s.activeClip,phase:s.phase,clock:{...s.clock},position:{...m.position},velocity:{...m.velocity},airborne:m.airborne,grounded:m.grounded,manual:a.controlRef.current.manualInputEnabled,locked:a.controlRef.current.physicsLocked,overlay:!!document.querySelector('.pause-menu[open]'),actions:Object.fromEntries(Object.entries(s.actions).map(([k,v])=>[k,{time:v.time,weight:v.getEffectiveWeight(),running:v.isRunning(),paused:v.paused}])),impact:s.movingLanding?{time:s.movingLanding.time,tracks:s.movingLanding.getClip().tracks.length,weight:s.movingLanding.getEffectiveWeight()}:null});window.__g21motion.handle=requestAnimationFrame(sample);}window.__g21motion.handle=requestAnimationFrame(sample);});}
async function mark(g,label){await g.page.evaluate(label=>window.__g21motion.events.push({label,t:performance.now()}),label);}
for(const playback of ['phases','sampled']){
 const g=await new Gameplay(browser,out,'scenarios-'+playback).init();const row={playback,status:'running'};report.push(row);
 try{
  await g.open('/?avatarQA&jumpPrototype='+playback);await g.ready();await g.mode('third-person-front');await install(g);
  await mark(g,'standing-input');await g.key('Space',35);await g.page.waitForTimeout(900);await g.settle();await g.shot('standing-jump-finished');
  for(const sprint of [false,true]){await g.page.keyboard.down('w');if(sprint)await g.page.keyboard.down('Shift');await g.page.waitForTimeout(650);await mark(g,sprint?'dash-jump-input':'walk-jump-input');await g.key('Space',35);await g.page.waitForTimeout(850);await mark(g,'moving-landed');await g.page.keyboard.up('w');await g.page.keyboard.up('Shift');await g.settle();}
  await mark(g,'pause-air-input');await g.key('Space',35);await g.page.waitForTimeout(100);await g.menu();await mark(g,'paused');await g.page.waitForTimeout(850);await g.shot('paused-physical-ground');await g.click(g.page.getByRole('button',{name:/Continuar explorando/}));await mark(g,'resumed');await g.page.waitForTimeout(600);await g.settle();assert.equal((await g.read()).pose,'idle');
  await mark(g,'cadence-10-shift-variants');await g.page.keyboard.down('w');
  for(let i=0;i<10;i++){await g.page.keyboard.down('Shift');await g.page.waitForTimeout(115+i*13);await g.page.keyboard.up('Shift');await g.page.waitForTimeout(90+i*7);}
  await g.page.keyboard.up('w');await g.settle();
  for(const age of [80,170,260]){await g.page.keyboard.down('w');await g.page.keyboard.down('Shift');await g.page.waitForTimeout(500+age);await mark(g,'stop-'+age);if(age===170){await g.page.keyboard.up('Shift');await g.page.waitForTimeout(100);await g.page.keyboard.up('w');}else {await g.page.keyboard.up('w');await g.page.keyboard.up('Shift');}await g.settle();await g.page.waitForTimeout(200);}
  await g.map('Mirante');await mark(g,'hill-descending-input');await g.page.keyboard.down('s');await g.page.waitForTimeout(400);await g.key('Space',35);await g.page.waitForTimeout(750);await g.page.keyboard.up('s');await g.settle();await g.shot('hill-descended');
  await g.page.evaluate(()=>cancelAnimationFrame(window.__g21motion.handle));await writeFile(out+'/EVIDENCIAS/'+playback+'-motion-frames.json',JSON.stringify(await g.page.evaluate(()=>window.__g21motion)));
  // System preference is verified in fresh contexts by mobile_panel.mjs.
  row.status='observed';row.errors=g.data.errors;
 }catch(e){row.status='harness-error';row.error=e.stack;await g.shot('interrupted').catch(()=>{});}
 finally{await writeFile(out+'/EVIDENCIAS/'+playback+'-last-frames.json',JSON.stringify(await g.page.evaluate(()=>window.__g21motion).catch(()=>null)));await g.page.evaluate(()=>cancelAnimationFrame(window.__g21motion?.handle)).catch(()=>{});await g.end();await writeFile(out+'/EVIDENCIAS/scenario-report.json',JSON.stringify(report,null,2));console.log(playback,row.status,row.error||'');}
}
await browser.close();
