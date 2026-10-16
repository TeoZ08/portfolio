import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {getAvatarCadence} from '../src/world/player/avatar-animation.ts';

// Same native TypeScript loader as the existing physics regression suite.
function moduleURL(file) {
  let source=stripTypeScriptTypes(readFileSync(file,'utf8'));
  source=source.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,p)=>`from ${JSON.stringify(moduleURL(resolve(dirname(file),p+'.ts')))}`);
  return 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
}
const {createAvatarMotionClock,advanceAvatarMotion,MOTION_GAITS,alignedGaitPhase,consumeAvatarTravel,advanceGaitByDistance}=await import(moduleURL(resolve('src/world/player/avatar-motion-clock.ts')));
const control={physicsLocked:false,manualInputEnabled:true,pose:null,desiredVelocity:{x:0,z:0},targetRotationY:null,transitionRequest:null};
const ground={position:{x:0,y:.86,z:0},velocity:{x:0,y:0,z:0},airborne:false,grounded:true,sprinting:false,moving:false,rotationY:0};
const fly=(vy,speed=0)=>({...ground,velocity:{x:0,y:vy,z:-speed},grounded:false,airborne:true,moving:speed>0});
test('one launch progresses to air from Rapier vertical velocity, without changing physical state',()=>{
 const clock=createAvatarMotionClock();const input=fly(6.2);const before=structuredClone(input);const c=structuredClone(control);
 assert.equal(advanceAvatarMotion(clock,input,c,1/60).clip,'jump-start');
 let r;for(let i=1;i<=12;i++)r=advanceAvatarMotion(clock,fly(6.2-20*i/60),c,1/60);
 assert.equal(r.clip,'jump-air');assert.ok(r.fraction>0&&r.fraction<.5);
 assert.equal(advanceAvatarMotion(clock,fly(0),c,1/60).fraction,.5);
 assert.deepEqual(input,before);assert.deepEqual(c,control);
});
test('walking off a ledge starts fall, never launch; a long fall holds the endpoint',()=>{
 const clock=createAvatarMotionClock();advanceAvatarMotion(clock,ground,control,1/60);
 assert.equal(advanceAvatarMotion(clock,fly(-1),control,1/60).clip,'jump-air');
 for(let i=0;i<90;i++){const r=advanceAvatarMotion(clock,fly(-15),control,1/60);assert.equal(r.clip,'jump-air');assert.equal(r.fraction,1);}
});
test('standing landing absorbs once and recovers, without locking controls',()=>{
 const clock=createAvatarMotionClock();advanceAvatarMotion(clock,fly(6.2),control,.016);
 advanceAvatarMotion(clock,fly(-4),control,.1);const landing=advanceAvatarMotion(clock,ground,control,.016);
 assert.equal(landing.clip,'jump-land');assert.equal(landing.fraction,0);
 for(let i=0;i<15;i++)advanceAvatarMotion(clock,ground,control,.016);
 assert.equal(advanceAvatarMotion(clock,ground,control,.016).clip,'idle');assert.equal(control.physicsLocked,false);
});
test('moving landing keeps running legs and applies only an impact layer',()=>{
 const clock=createAvatarMotionClock();advanceAvatarMotion(clock,fly(6.2,6.2),control,.016);
 const running={...ground,moving:true,sprinting:true,velocity:{x:0,y:0,z:-6.2}};
 const r=advanceAvatarMotion(clock,running,control,.016);
 assert.equal(r.pose,'run');assert.equal(r.clip,'run');assert.equal(r.phase,'land');assert.equal(r.movingImpact,0);assert.equal(r.fraction,null);
});
test('tiny spawn/contact jitter does not repeatedly crouch or replay a landing',()=>{
 const clock=createAvatarMotionClock();advanceAvatarMotion(clock,fly(-.1),control,.016);
 assert.equal(advanceAvatarMotion(clock,ground,control,.016).clip,'idle');
});
test('seat/practice priority cancels phase playback and does not alter locks',()=>{
 const clock=createAvatarMotionClock();advanceAvatarMotion(clock,fly(6.2),control,.016);
 assert.equal(advanceAvatarMotion(clock,fly(3),{...control,physicsLocked:true},.016).clip,'seated-pose');
 assert.equal(advanceAvatarMotion(clock,ground,{...control,pose:'practice'},.016).clip,'practice');
 assert.equal(advanceAvatarMotion(clock,ground,control,.016).clip,'idle');
});
test('single-clip prototype maps the same physical apex and landing semantically',()=>{
 const clock=createAvatarMotionClock();advanceAvatarMotion(clock,fly(6.2),control,.1,'sampled');
 advanceAvatarMotion(clock,fly(3),control,.1,'sampled');const apex=advanceAvatarMotion(clock,fly(0),control,.016,'sampled');
 assert.equal(apex.clip,'jump');assert.ok(Math.abs(apex.fraction-(.1+.7*(.5-.16)/.84))<1e-8);
 const land=advanceAvatarMotion(clock,ground,control,.016,'sampled');assert.equal(land.clip,'jump');assert.equal(land.fraction,.8);
});
test('candidate gait cadence uses authored stroke while retaining the original asset calibration',()=>{
 assert.equal(getAvatarCadence('walk',100),2.6);
 assert.ok(Math.abs(getAvatarCadence('walk',3.6,MOTION_GAITS)-3.214285714285714)<1e-10);
 assert.ok(Math.abs(getAvatarCadence('run',6.2,MOTION_GAITS)-1.9162087912087913)<1e-10);
 assert.equal(getAvatarCadence('run',0,MOTION_GAITS),0);
 for(const p of [.01,.10,.51,.60]){
  const q=alignedGaitPhase(p,'run','walk');const side=p>=.5?.5:0;
  assert.ok(Math.abs((q-side)/.5-(p-side)/.24)<1e-8,'support-side progress changes across run/walk');
 }
});

test('gait phase follows completed distance even when render frame intervals vary',()=>{
 const gait=MOTION_GAITS.walk;const steps=[.0702,.05616,.06588,.05472,.05976];
 const many=steps.reduce((time,distance)=>advanceGaitByDistance(time,distance,gait),.1);
 const once=advanceGaitByDistance(.1,steps.reduce((a,b)=>a+b,0),gait);
 assert.ok(Math.abs(many-once)<1e-12);
 // During a support phase, the authored foot travels exactly against the body.
 const body=steps[0],phase=advanceGaitByDistance(.1,body,gait)-.1;
 assert.ok(Math.abs(body-phase*gait.stroke*1.12/gait.duty/gait.duration)<1e-12);
});
test('map/recovery relocations and vertical movement never become strides',()=>{
 const clock={previous:null};const p={x:0,z:26};assert.equal(consumeAvatarTravel(clock,p),0);
 assert.equal(consumeAvatarTravel(clock,{x:20,z:-22}),0);
 assert.ok(Math.abs(consumeAvatarTravel(clock,{x:20.1,z:-22})-.1)<1e-12);
 assert.equal(consumeAvatarTravel(clock,{x:20.1,z:-22}),0);assert.deepEqual(p,{x:0,z:26});
});
