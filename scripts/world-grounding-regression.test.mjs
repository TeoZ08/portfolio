import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {stripTypeScriptTypes} from 'node:module';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {Box3} from 'three';
const cache=new Map();function url(p){p=resolve(p);if(cache.has(p))return cache.get(p);let s=stripTypeScriptTypes(readFileSync(p,'utf8'));s=s.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,v)=>`from ${JSON.stringify(url(resolve(dirname(p),v+'.ts')))}`);const u='data:text/javascript;base64,'+Buffer.from(s).toString('base64');cache.set(p,u);return u;}
const {LANDSCAPE_TREES,landscapeSurfaceHeight,makeLandscape}=await import(url('src/world/regions/field/landscape-layout.ts'));
const {FOREST_TREES}=await import(url('src/world/regions/forest/forest-layout.ts'));
const {plantingObstructions,footprintDistance}=await import(url('src/world/regions/field/planting-clearance.ts'));
const {PLAN,ROUTES,routeDistance}=await import(url('src/world/regions/masterplan-layout.ts'));
const {surfaceHeight}=await import(url('src/world/regions/field/field-layout.ts'));
const {DOJO:D}=await import(url('src/world/regions/dojo/dojo-layout.ts'));
function meshHeight(mesh,x,z){const p=mesh.positions,ids=mesh.indices;for(let n=0;n<ids.length;n+=3){const a=ids[n]*3,b=ids[n+1]*3,c=ids[n+2]*3;const ax=p[a],az=p[a+2],bx=p[b],bz=p[b+2],cx=p[c],cz=p[c+2];if(x<Math.min(ax,bx,cx)||x>Math.max(ax,bx,cx)||z<Math.min(az,bz,cz)||z>Math.max(az,bz,cz))continue;const det=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz),u=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/det,v=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/det;if(u>=-1e-7&&v>=-1e-7&&u+v<=1+1e-7)return u*p[a+1]+v*p[b+1]+(1-u-v)*p[c+1];}return null;}
test('every external tree root agrees with the actual Float32 rendered triangles',()=>{
 const mesh=makeLandscape(55,285,5);let checked=0;
 for(const t of LANDSCAPE_TREES){const[x,y,z]=t.position;if(Math.max(Math.abs(x),Math.abs(z))<=55)continue;const h=meshHeight(mesh,x,z);assert.notEqual(h,null);assert.ok(Math.abs(landscapeSurfaceHeight(x,z)-h)<1e-6);assert.ok(y<=h-.024&&h-y<.3);
 const yaw=t.rotation[1],c=Math.cos(yaw),sn=Math.sin(yaw);
 for(const a of [-1,1])for(const b of [-1,1]){const dx=a*.1*t.scale[0],dz=b*.1*t.scale[2],corner=meshHeight(mesh,x+dx*c+dz*sn,z-dx*sn+dz*c);assert.ok(y<=corner-.024);}
 checked++;}assert.ok(checked>250);
});
test('circle to rotated building distance handles corners and does not accept crowns over roofs',()=>{
 const p={x:0,z:0,yaw:Math.PI/4,width:4,depth:2};assert.equal(footprintDistance(0,0,p),0);assert.ok(footprintDistance(4,4,p)>2);assert.ok(plantingObstructions(PLAN.house.x+PLAN.house.width/2+1,PLAN.house.z,.1,3).includes('house'));
});
test('all retained forest trunks and crowns leave building envelopes, routes and destinations clear',()=>{
 assert.ok(FOREST_TREES.length>=7);for(const t of FOREST_TREES){assert.deepEqual(plantingObstructions(t.x,t.z,t.trunkRadius,t.crownRadius),[]);for(const route of ROUTES)assert.ok(routeDistance(t.x,t.z,route.samples)>=route.width/2+t.trunkRadius+.45/.72);}
});
globalThis.ProgressEvent=class{};
for(const side of [-1,1])test(`actual side wing ${side}: masonry intersects visible ground at every footing sample and native base`,async()=>{
 const b=readFileSync('public/assets/songahm/side-wing.glb'),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.scale.setScalar(D.wingScale);g.scene.position.set(side*D.wingX,D.wingBase,D.wingZ);g.scene.updateMatrixWorld(true);const bounds=new Box3().setFromObject(g.scene);assert.ok(bounds.min.y<D.wingFootingTop&&bounds.min.y>D.wingFootingBottom);
 for(let x=-D.wingFootingWidth/2;x<=D.wingFootingWidth/2;x+=.2)for(let z=-D.wingFootingDepth/2;z<=D.wingFootingDepth/2;z+=.2){const h=surfaceHeight(PLAN.dojo.x+side*D.wingX+x,PLAN.dojo.z+D.wingZ+z)-surfaceHeight(PLAN.dojo.x,PLAN.dojo.z);assert.ok(h>D.wingFootingBottom&&h<D.wingFootingTop,`ground ${x},${z}=${h}`);}
 const stone=g.scene.getObjectByName('hanok-side-wing_0'),base=new Box3().setFromObject(stone);assert.ok(base.min.x>=side*D.wingX-D.wingFootingWidth/2&&base.max.x<=side*D.wingX+D.wingFootingWidth/2);assert.ok(base.min.z>=D.wingZ-D.wingFootingDepth/2&&base.max.z<=D.wingZ+D.wingFootingDepth/2);
});

const {architecturalCameraPitch}=await import(url('src/world/camera/architectural-camera.ts'));
test('architectural camera stays below local eaves without changing landscape orbit intent',()=>{
 for(const [name,eye]of [['dojo',3.25],['gallery',2.95]]){
 const p=PLAN[name],ground=surfaceHeight(p.x,p.z)*.72,y=ground+2.1;
 for(const radius of [5.8,8.4,12])for(const requested of [.14,.32,.84]){
 const pitch=architecturalCameraPitch(p.x*.72,y,p.z*.72,radius,requested);
 assert.ok(pitch<=requested);assert.ok(y+Math.sin(pitch)*radius<=ground+eye+1e-8);
 }
 }
 assert.equal(architecturalCameraPitch(0,2,25,8,.32),.32);
 const x=PLAN.dojo.x*.72,z=PLAN.dojo.z*.72;
 assert.ok(Math.abs(architecturalCameraPitch(x+9.59,2,z,8,.32)-architecturalCameraPitch(x+9.6,2,z,8,.32))<1e-4);
});

const {SONGAHM_PLANTING}=await import(url('src/world/regions/dojo/dojo-layout.ts'));
const {REGIONAL_PLANTING}=await import(url('src/world/regions/field/regional-planting-layout.ts'));
test('native courtyard crowns clear the full Songahm and approaches; Kenney bases remain below ground',()=>{
 for(const t of SONGAHM_PLANTING)assert.deepEqual(plantingObstructions(PLAN.dojo.x+t.x,PLAN.dojo.z+t.z,t.trunkRadius,t.crownRadius),[],t.file);
 for(const items of Object.values(REGIONAL_PLANTING))for(const p of items){const[x,y,z]=p.position;const radius=.34*p.scale[0];for(const[dx,dz]of [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius]])assert.ok(y-.05*p.scale[1]<=surfaceHeight(x+dx,z+dz)-.024);assert.deepEqual(plantingObstructions(x,z,p.scale[0]*.18,p.scale[0]*.52),[]);}
});
