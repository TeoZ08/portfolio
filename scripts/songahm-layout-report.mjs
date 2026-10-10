import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
// Load the real pure layout modules without changing their bundler imports.
const cache=new Map();
function moduleUrl(path){
 path=resolve(path);if(cache.has(path))return cache.get(path);
 let source=stripTypeScriptTypes(readFileSync(path,'utf8'));
 source=source.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,specifier)=>`from ${JSON.stringify(moduleUrl(resolve(dirname(path),specifier+'.ts')))}`);
 const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');cache.set(path,url);return url;
}
const base='src/world/regions/';
const {PLAN,ROUTES,GALLERY_USE,localPlanPoint,HOUSE_DOOR,HOUSE_EXIT}=await import(moduleUrl(base+'masterplan-layout.ts'));
const {FIELD_BOUNDS,surfaceHeight,insideHouse}=await import(moduleUrl(base+'field/field-layout.ts'));
const {FIELD_INTERACTION_TARGETS,placePlayerPoint}=await import(moduleUrl(base+'field/field-interaction-targets.ts'));
const {WORLD_DESTINATIONS,findWorldDestination}=await import(moduleUrl(base+'field/world-destinations.ts'));
const scale=.72;

import {writeFileSync} from 'node:fs';
const locations=Object.fromEntries(Object.entries(PLAN).map(([k,p])=>[k,Array.isArray(p)?p.map(v=>v*scale):{x:p.x*scale,z:p.z*scale,width:p.width*scale,depth:p.depth*scale,yaw:p.yaw}]));
const routes=ROUTES.map(r=>{let length=0,maxGrade=0;for(let i=1;i<r.samples.length;i++){const a=r.samples[i-1],b=r.samples[i],h=surfaceHeight(...b)-surfaceHeight(...a);length+=Math.hypot(b[0]-a[0],b[1]-a[1],h)*scale;maxGrade=Math.max(maxGrade,Math.atan2(Math.abs(h),Math.hypot(b[0]-a[0],b[1]-a[1]))*180/Math.PI);}return {name:r.name,width:r.width*scale,length,walkTheorySeconds:length/3.6,sprintTheorySeconds:length/6.2,maxGradeDegrees:maxGrade};});
const out=process.argv[2];writeFileSync(out+'/layout-metrics.json',JSON.stringify({locations,routes},null,2));
const pt=([x,z])=>`${(x*scale+40)*10},${(z*scale+40)*10}`;
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="950" viewBox="-30 -70 900 950"><rect x="-30" y="-70" width="900" height="950" fill="#f0ecdf"/><text x="0" y="-35" font-size="22" fill="#344536">GOAL10 · implantação real · norte ↑ · metros físicos</text>';
svg+='<rect width="792" height="792" x="4" y="4" rx="12" fill="#dce0c6"/>';
for(const name of ['house','gallery','dojo']){const p=locations[name],w=name==='dojo'?p.width:p.depth,d=name==='dojo'?p.depth:p.width;svg+=`<rect x="${(p.x+40-w/2)*10}" y="${(p.z+40-d/2)*10}" width="${w*10}" height="${d*10}" fill="${name==='dojo'?'#b9b3a0':'#c19f78'}" stroke="#6b7460" stroke-width="2"/>`;}
for(const r of ROUTES)svg+=`<polyline points="${r.samples.map(pt).join(' ')}" fill="none" stroke="#9e8761" stroke-width="${r.width*scale*10}" stroke-linecap="round" stroke-linejoin="round" opacity=".72"/>`;
for(const d of WORLD_DESTINATIONS)svg+=`<circle cx="${(d.x*scale+40)*10}" cy="${(d.z*scale+40)*10}" r="5" fill="#3e5346"/><text x="${(d.x*scale+40)*10+8}" y="${(d.z*scale+40)*10-8}" font-size="13" fill="#263e32">${d.name}</text>`;
svg+='<text x="5" y="830" font-size="15">Envelope Songahm 29×20 m; pele central 16,24 m; rota do Mirante pela direita.</text><text x="5" y="854" font-size="13">Áreas indicam envelopes de implantação; não são sólidos integrais. Rotas derivadas do código.</text></svg>';
writeFileSync(out+'/implantacao.svg',svg);console.log(JSON.stringify({locations,routes},null,2));
