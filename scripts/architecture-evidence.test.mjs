import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import{resolve,dirname}from'node:path';import{stripTypeScriptTypes}from'node:module';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {BoxGeometry,Mesh,MeshStandardMaterial,Raycaster,Vector3} from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
const cache=new Map();function url(p){p=resolve(p);if(cache.has(p))return cache.get(p);let s=stripTypeScriptTypes(readFileSync(p,'utf8')).replace(/from\s+['"](\.[^'"]+)['"]/g,(_,v)=>`from ${JSON.stringify(url(resolve(dirname(p),v+'.ts')))}`);const u='data:text/javascript;base64,'+Buffer.from(s).toString('base64');cache.set(p,u);return u;}
const {WING_ENVELOPE,WING_MASONRY}=await import(url('src/world/regions/dojo/wing-envelope.ts'));
const {GALLERY_ENVELOPE:G,GALLERY_WALLS}=await import(url('src/world/regions/workshop/gallery-layout.ts'));
const {PLAZA_SIGN:S,SIGN_DESTINATIONS,signArrow}=await import(url('src/world/regions/places/wayfinding-layout.ts'));
const {ROUTES,routeDistance}=await import(url('src/world/regions/masterplan-layout.ts'));
const box=p=>{const m=new Mesh(new BoxGeometry(...p.size),new MeshStandardMaterial());m.name=p.name;m.position.set(...p.position);return m;};
globalThis.ProgressEvent=class{};
const raw=readFileSync('public/assets/songahm/side-wing.glb'),asset=await new GLTFLoader().parseAsync(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'');asset.scene.updateMatrixWorld(true);
const cast=(scene,x,y)=>new Raycaster(new Vector3(x,y,6),new Vector3(0,0,-1)).intersectObject(scene,true)[0];
test('the source GLB really lacks the window jamb; changing culling would not create it',()=>{const hit=cast(asset.scene,.6,1.8);assert.ok(hit.point.z<0);});
test('reconstructed window surround closes the entire front aperture in visible front-face geometry',()=>{
 const scene=asset.scene.clone();for(const p of WING_ENVELOPE)scene.add(box(p));scene.updateMatrixWorld(true);
 for(let x=.25;x<=2.65;x+=.12)for(let y=.7;y<=2.82;y+=.12){const hit=cast(scene,x,y);assert.ok(hit&&hit.point.z>1.35,`front gap at ${x},${y}: ${hit?.point.z}`);}
});
for(const [name,origin,direction,axis]of [['rear',[0,1.8,-6],[0,0,1],0],['left',[-6,1.8,0],[1,0,0],2],['right',[6,1.8,0],[-1,0,0],2]])test(`original wing ${name} wall has outward-facing visible geometry`,()=>{
 for(let t=-1.4;t<1.5;t+=.2){const o=[...origin];o[axis]=t;const hit=new Raycaster(new Vector3(...o),new Vector3(...direction)).intersectObject(asset.scene,true)[0];assert.ok(hit);assert.ok(Math.abs(hit.point[name==='rear'?'z':'x'])>1.5);}
});
test('one masonry body spans floor to below grade and door steps overlap without floating scraps',()=>{
 const foundation=WING_MASONRY[0];assert.equal(foundation.position[1]-foundation.size[1]/2,-.5);assert.ok(Math.abs(foundation.position[1]+foundation.size[1]/2-.54)<1e-9);
 const stairs=WING_MASONRY.slice(1);for(let i=0;i<stairs.length;i++){const p=stairs[i];assert.ok(p.position[1]-p.size[1]/2<0);if(i)assert.ok(Math.abs(p.position[2]-stairs[i-1].position[2])<(p.size[2]+stairs[i-1].size[2])/2);}
});
test('Rapier climbs and descends the visible wing door stairs without a hidden ramp',async()=>{
 await RAPIER.init();const w=new RAPIER.World({x:0,y:-20,z:0}),scale=.82,base=.075*.72;
 w.createCollider(RAPIER.ColliderDesc.cuboid(20,.3,20).setTranslation(0,-.3,0));
 for(const p of WING_MASONRY){const fixed=w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.position[0]*scale,p.position[1]*scale+base,p.position[2]*scale));w.createCollider(RAPIER.ColliderDesc.cuboid(...p.size.map(v=>v*scale/2)),fixed);}
 const b=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-1.4*scale,.86,6.5*scale)),c=w.createCollider(RAPIER.ColliderDesc.capsule(.5,.35),b),cc=w.createCharacterController(.01);cc.enableAutostep(.42,.25,false);cc.enableSnapToGround(.2);w.step();
 const move=(dz,n)=>{for(let i=0;i<n;i++){cc.computeColliderMovement(c,{x:0,y:-.033,z:dz},RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);const m=cc.computedMovement(),p=b.translation();b.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});w.step();}};
 move(-.06,100);assert.ok(Math.abs(b.translation().y-(.54*scale+base+.86))<.03);move(.06,100);assert.ok(Math.abs(b.translation().y-.86)<.03);w.free();
});
test('gallery artworks are supported by continuous walls and clear the real shelter height',async()=>{
 const {GALLERY_ARTWORKS}=await import(url('src/content/gallery.ts'));assert.equal(GALLERY_ARTWORKS.length,4);
 assert.equal(GALLERY_WALLS.filter(w=>w.name.includes('SIDE')).length,2);
 for(const a of GALLERY_ARTWORKS){const height=a.width*a.imageHeight/a.imageWidth;assert.ok(a.position[1]+height/2+.08<G.roofBottom);const wall=a.yaw===0?GALLERY_WALLS[0]:GALLERY_WALLS.find(w=>w.position[0]*a.position[0]>0&&w.name.includes('SIDE'));assert.ok(wall);if(a.yaw!==0)assert.ok(Math.abs(a.position[2])+a.width/2<wall.size[2]/2);}
});
test('gallery entrance is broad, with no middle post or hanging artwork-crossing pergola',()=>{assert.ok(G.entryWidth>6);for(const w of GALLERY_WALLS.filter(w=>w.name.includes('ENTRY')))assert.ok(Math.abs(w.position[0])-w.size[0]/2>=G.entryWidth/2);const source=readFileSync('src/world/regions/WorkshopRegion.tsx','utf8');assert.ok(!source.includes('GALLERY_OPEN_TIMBER_LOUVRES'));assert.ok(source.includes('GALLERY_HIGH_SHELTER'));});
test('every arrow on both sign faces points towards the real destination in its local frame',()=>{
 for(const yaw of [0,Math.PI])for(const d of SIGN_DESTINATIONS){const a=signArrow(d.point,yaw),dx=d.point[0]-S.x,dz=d.point[1]-S.z;const wx=a.x*Math.cos(yaw)-a.up*Math.sin(yaw),wz=-a.x*Math.sin(yaw)-a.up*Math.cos(yaw);assert.ok((wx*dx+wz*dz)/Math.hypot(dx,dz)>.999999);}
 assert.equal(SIGN_DESTINATIONS.length,4);assert.ok(signArrow(SIGN_DESTINATIONS[0].point).x<0);assert.ok(signArrow(SIGN_DESTINATIONS[1].point).x>0);
});
test('the sign supports and visible board leave the main axial walking route clear',()=>{const route=ROUTES[0];assert.ok(routeDistance(S.x,S.z,route.samples)>S.width/2+route.width/2+.15);});
test('courtyard has upward normals and follows the rendered ground without a raised flat slab',async()=>{
 const {makeSongahmCourtyard}=await import(url('src/world/regions/dojo/courtyard-surface.ts'));
 const {PLAN}=await import(url('src/world/regions/masterplan-layout.ts'));
 const {surfaceHeight}=await import(url('src/world/regions/field/field-layout.ts'));
 const m=makeSongahmCourtyard(),h=surfaceHeight(PLAN.dojo.x,PLAN.dojo.z);
 for(let i=0;i<m.positions.length;i+=3){const[x,y,z]=m.positions.slice(i,i+3);assert.ok(Math.abs(y-(surfaceHeight(PLAN.dojo.x+x,PLAN.dojo.z+z)-h+.009))<1e-5);assert.ok(Number.isFinite(m.normals[i+1])&&m.normals[i+1]>.5);}
});
