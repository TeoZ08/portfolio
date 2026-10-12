import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{stripTypeScriptTypes}from'node:module';import{MeshStandardMaterial}from'three';
const source=stripTypeScriptTypes(readFileSync('src/world/materials/world-material-shader.ts','utf8'));const{pigment,ROUGHNESS,configureWorldMaterial}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(const finish of ['wood','plaster','stone','tile','gravel','metal','fabric'])test(`${finish}: scale-aware instanced detail keeps filtered relief and physically bounded roughness`,()=>{
 const s={vertexShader:'#include <begin_vertex>',fragmentShader:'#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>'};pigment(s,finish,true,.72);assert.match(s.vertexShader,/instanceMatrix \* housePosition/);assert.match(s.vertexShader,/housePosition.xyz \* 0.72000/);assert.match(s.fragmentShader,/fwidth/);assert.match(s.fragmentShader,/normal = normalize/);assert.match(s.fragmentShader,/roughnessFactor = clamp/);assert.doesNotMatch(s.fragmentShader,/sampler2D|uniform float.*time/);assert.ok(ROUGHNESS[finish]>=.5&&ROUGHNESS[finish]<=1);
});
test('PBR clone preserves source colour/maps and only changes the runtime material',()=>{
 const original=new MeshStandardMaterial({color:'#5a605d',roughness:.2,metalness:0});original.name='tile';const clone=configureWorldMaterial(original.clone(),'tile',1.45);assert.equal(original.roughness,.2);assert.equal(clone.roughness,ROUGHNESS.tile);assert.equal(clone.color.getHex(),original.color.getHex());assert.equal(clone.map,original.map);assert.notEqual(clone.customProgramCacheKey(),configureWorldMaterial(original.clone(),'wood',1.45).customProgramCacheKey());original.dispose();clone.dispose();
});
test('invalid material scale cannot enter a generated shader',()=>{
 for(const scale of [NaN,Infinity,0,-1])assert.throws(()=>pigment({vertexShader:'',fragmentShader:''},'wood',true,scale),RangeError);
});
