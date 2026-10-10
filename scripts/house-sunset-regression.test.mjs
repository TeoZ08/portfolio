import test from 'node:test';import assert from 'node:assert/strict';import RAPIER from '@dimforge/rapier3d-compat';import {readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {stripTypeScriptTypes} from 'node:module';
function url(path){let s=stripTypeScriptTypes(readFileSync(path,'utf8'));s=s.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,v)=>`from ${JSON.stringify(url(resolve(dirname(path),v+'.ts')))}`);return 'data:text/javascript;base64,'+Buffer.from(s).toString('base64');}async function module(path){return import(url(path));}
const {HOUSE_FLOOR:F,crossedHouseExit,needsPlayerRecovery,RECOVERY_COOLDOWN}=await module('src/world/regions/house/house-safety.ts');
const {fieldDaylight,SUNSET_DEFAULT_HOUR}=await module('src/world/regions/field/field-daylight.ts');
const {pigment,ROUGHNESS}=await module('src/world/regions/house/house-material-shader.ts');await RAPIER.init();
test('Rapier: backwards passage has continuous support before, through and beyond doorway fade',()=>{
 const w=new RAPIER.World({x:0,y:-20,z:0}),s=.72;
 w.createCollider(RAPIER.ColliderDesc.cuboid(F.halfWidth*s,F.halfThickness*s,F.halfDepth*s).setTranslation(0,-F.halfThickness*s,F.centerZ*s));
 w.createCollider(RAPIER.ColliderDesc.cuboid(8.25*s,2.25*s,.15*s).setTranslation(0,2.25*s,11.5*s));
 const b=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,.86,5*s)),c=w.createCollider(RAPIER.ColliderDesc.capsule(.5,.35),b),cc=w.createCharacterController(.01);cc.enableAutostep(.42,.25,false);cc.enableSnapToGround(.2);w.step();let crossings=0;
 for(let i=0;i<350;i++){cc.computeColliderMovement(c,{x:0,y:-.033,z:.06});let p=b.translation(),m=cc.computedMovement();b.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});w.step();p=b.translation();assert.ok(p.y>.84,'fall at '+JSON.stringify(p));if(crossedHouseExit(p))crossings++;}
 assert.ok(crossings>300);assert.ok(b.translation().z<11.35*s-.34);w.free();
});
test('door threshold is region-scaled, stays clear of spawn, ignores adjacent walls and jumps',()=>{
 assert.equal(crossedHouseExit({x:0,y:.86,z:3.6}),false);assert.equal(crossedHouseExit({x:0,y:.86,z:4.33}),true);assert.equal(crossedHouseExit({x:2,y:.86,z:4.5}),false);assert.equal(crossedHouseExit({x:0,y:-3,z:5}),false);
});
test('recovery uses distinct regional thresholds, finite coordinates and cooldown',()=>{
 assert.equal(needsPlayerRecovery('HOUSE',{x:0,y:-2.1,z:0},0),true);assert.equal(needsPlayerRecovery('FIELD',{x:0,y:-2.1,z:0},0),false);assert.equal(needsPlayerRecovery('FIELD',{x:0,y:-8.1,z:0},0),true);assert.equal(needsPlayerRecovery('HOUSE',{x:0,y:.86,z:3.6},0),false);assert.equal(needsPlayerRecovery('HOUSE',{x:NaN,y:0,z:0},0),true);assert.equal(needsPlayerRecovery('HOUSE',{x:0,y:-10,z:0},RECOVERY_COOLDOWN),false);
});
test('sunset is the boot default and has warm directional sun with a distinct cool upper sky',()=>{
 assert.match(readFileSync('src/systems/world-state.ts','utf8'),/timeOfDay: SUNSET_DEFAULT_HOUR/);assert.equal(SUNSET_DEFAULT_HOUR,17.5);const light=fieldDaylight(SUNSET_DEFAULT_HOUR);assert.equal(light.sunset,true);assert.equal(light.night,false);assert.ok(light.direction[1]>.1&&light.direction[1]<.2);assert.notEqual(light.upper,light.horizon);assert.equal(fieldDaylight(9).sunset,false);assert.equal(fieldDaylight(22).night,true);
});
test('local PBR pilot injects roughness and filtered normal relief for wood and limewash',()=>{
 for(const finish of ['wood','plaster']){const shader={vertexShader:'#include <begin_vertex>',fragmentShader:'#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>'};pigment(shader,finish);assert.match(shader.vertexShader,/instanceMatrix \* housePosition/);assert.match(shader.fragmentShader,/roughnessFactor = clamp/);assert.match(shader.fragmentShader,/normal = normalize/);assert.doesNotMatch(shader.fragmentShader,/sampler2D/);assert.ok(ROUGHNESS[finish]>.5);}
});
