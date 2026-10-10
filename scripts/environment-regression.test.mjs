import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {stripTypeScriptTypes} from 'node:module';
import RAPIER from '@dimforge/rapier3d-compat';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {Box3} from 'three';
const cache=new Map();function url(p){p=resolve(p);if(cache.has(p))return cache.get(p);let s=stripTypeScriptTypes(readFileSync(p,'utf8'));s=s.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,v)=>`from ${JSON.stringify(url(resolve(dirname(p),v+'.ts')))}`);const u='data:text/javascript;base64,'+Buffer.from(s).toString('base64');cache.set(p,u);return u;}
const {DOJO:D}=await import(url('src/world/regions/dojo/dojo-layout.ts'));
const {surfaceHeight,terrainHeight}=await import(url('src/world/regions/field/field-layout.ts'));
const {PLAN,routeClearance}=await import(url('src/world/regions/masterplan-layout.ts'));
const {insidePlace}=await import(url('src/world/regions/places/place-layout.ts'));
const {landscapeHeight,makeLandscape,LANDSCAPE_TREES}=await import(url('src/world/regions/field/landscape-layout.ts'));
globalThis.ProgressEvent=class{};await RAPIER.init();
test('actual quantized plinth intersects ground and reaches the shared terrace top',async()=>{
 const b=readFileSync('public/assets/songahm/plinth.glb');const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 g.scene.scale.set(D.terraceWidth/3,(D.terraceTop-D.foundationBottom)/.5,D.terraceDepth/3);g.scene.position.y=D.foundationBottom;g.scene.updateMatrixWorld(true);const box=new Box3().setFromObject(g.scene);
 assert.ok(Math.abs(box.max.y-D.terraceTop)<.001);
 for(let x=-D.terraceWidth/2;x<=D.terraceWidth/2;x+=.8)for(let z=-D.terraceDepth/2;z<=D.terraceDepth/2;z+=.8){let h=surfaceHeight(PLAN.dojo.x+x,PLAN.dojo.z+z)-surfaceHeight(PLAN.dojo.x,PLAN.dojo.z);assert.ok(box.min.y<h&&h<box.max.y);}
});
test('Rapier capsule climbs and descends all stairs, terrace and tatami without a gap',()=>{
 const w=new RAPIER.World({x:0,y:-20,z:0}),s=.72;
 function box(x,y,z,width,height,depth){const fixed=w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x*s,y*s,z*s));w.createCollider(RAPIER.ColliderDesc.cuboid(width*s/2,height*s/2,depth*s/2),fixed);}
 box(0,-.3,0,40,.6,40);box(0,(D.terraceTop+D.foundationBottom)/2,0,D.terraceWidth,D.terraceTop-D.foundationBottom,D.terraceDepth);
 D.stairZ.forEach((z,i)=>box(0,(D.stairTops[i]+D.stairBottom)/2,z,6.8-i*.35,D.stairTops[i]-D.stairBottom,1.4));
 box(0,(D.floor+D.terraceTop)/2,D.tatamiZ,D.tatamiWidth,D.floor-D.terraceTop,D.tatamiDepth);
 const body=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,.86,8));const c=w.createCollider(RAPIER.ColliderDesc.capsule(.5,.35),body);
 const cc=w.createCharacterController(.01);cc.enableAutostep(.42,.25,false);cc.enableSnapToGround(.2);w.step();let min=10;
 function move(dz,steps){for(let i=0;i<steps;i++){cc.computeColliderMovement(c,{x:0,y:-.033,z:dz},RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);const p=body.translation(),m=cc.computedMovement();body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});w.step();min=Math.min(min,body.translation().y);}}
 move(-.06,120);assert.ok(body.translation().z<2);assert.ok(Math.abs(body.translation().y-(D.floor*s+.86))<.025);
 move(.06,120);assert.ok(body.translation().z>7.8);assert.ok(Math.abs(body.translation().y-.86)<.025);assert.ok(min>.83);w.free();
});
test('landscape meets every physical terrain border vertex in height and tessellation',()=>{
 const mesh=makeLandscape(55,285,5);const positions=mesh.positions;const vertices=new Map();for(let i=0;i<positions.length;i+=3)vertices.set(`${positions[i]},${positions[i+2]}`,positions[i+1]);
 for(let v=-55;v<=55;v+=1.25)for(const [x,z] of [[v,-55],[v,55],[-55,v],[55,v]]){assert.ok(vertices.has(`${x},${z}`));assert.ok(Math.abs(vertices.get(`${x},${z}`)-terrainHeight(x,z))<1e-5);assert.equal(landscapeHeight(x,z),terrainHeight(x,z));}
});
test('woodland instances leave destinations/routes open and are planted in the rendered surface',()=>{
 assert.ok(LANDSCAPE_TREES.length>250&&LANDSCAPE_TREES.length<410);
 for(const t of LANDSCAPE_TREES){const[x,y,z]=t.position;assert.equal(routeClearance(x,z,2.8),false);assert.equal(insidePlace(x,z,3),false);const h=Math.max(Math.abs(x),Math.abs(z))>55?landscapeHeight(x,z):surfaceHeight(x,z);assert.ok(Math.abs(y+.09-h)<1e-6);}
});
test('local panorama stays under 160KiB and uses the expected 2K alpha WebP format',()=>{
 const b=readFileSync('public/assets/sky/painted-cloud-panorama.webp');assert.equal(b.toString('ascii',0,4),'RIFF');assert.ok(b.length<160*1024);assert.equal(b.toString('ascii',12,16),'VP8X');assert.equal(b.readUIntLE(24,3)+1,2048);assert.equal(b.readUIntLE(27,3)+1,1024);assert.ok(b[20]&16);
});

test('baked linear soil mask retains normalized regional weights and orientation',async()=>{
 const {inflateSync}=await import('node:zlib'),b=readFileSync('public/assets/terrain/regional-soil-mask.png');assert.ok(b.length<64*1024);assert.equal(b.readUInt32BE(16),256);assert.equal(b.readUInt32BE(20),256);assert.equal(b[25],6);
 let chunks=[];for(let n=8;n<b.length;){const len=b.readUInt32BE(n);if(b.toString('ascii',n+4,n+8)==='IDAT')chunks.push(b.subarray(n+8,n+8+len));n+=len+12;}
 const raw=inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(256*256*4),stride=1024;
 const paeth=(a,c,d)=>{const p=a+c-d,aa=Math.abs(p-a),cc=Math.abs(p-c),dd=Math.abs(p-d);return aa<=cc&&aa<=dd?a:cc<=dd?c:d;};
 for(let j=0;j<256;j++){const filter=raw[j*(stride+1)];for(let i=0;i<stride;i++){const a=i>=4?pixels[j*stride+i-4]:0,c=j?pixels[(j-1)*stride+i]:0,d=j&&i>=4?pixels[(j-1)*stride+i-4]:0;const predictor=[0,a,c,Math.floor((a+c)/2),paeth(a,c,d)][filter];pixels[j*stride+i]=(raw[j*(stride+1)+i+1]+predictor)&255;}}
 const {soilWeights}=await import(url('src/world/regions/field/terrain-biomes.ts'));
 for(const place of [PLAN.dojo,PLAN.hill,PLAN.forest,PLAN.gallery]){const i=Math.round((place.x+55)/110*255),j=Math.round((55-place.z)/110*255),w=soilWeights(-55+i/255*110,55-j/255*110);for(let k=0;k<3;k++)assert.ok(Math.abs(pixels[(j*256+i)*4+k]/255-w[k])<.004);}
 for(let i=0;i<pixels.length;i+=4)assert.ok(pixels[i]+pixels[i+1]+pixels[i+2]<=257);
});
