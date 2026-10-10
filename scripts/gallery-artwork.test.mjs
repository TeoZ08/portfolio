import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const {GALLERY_ARTWORKS:artworks}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync('src/content/gallery.ts','utf8'))).toString('base64'));
function webpSize(bytes) {
 for(let offset=12;offset+8<=bytes.length;){
  const type=bytes.subarray(offset,offset+4).toString(),length=bytes.readUInt32LE(offset+4),p=offset+8;
  if(type==='VP8X')return [bytes.readUIntLE(p+4,3)+1,bytes.readUIntLE(p+7,3)+1];
  if(type==='VP8 ')return [bytes.readUInt16LE(p+6)&0x3fff,bytes.readUInt16LE(p+8)&0x3fff];
  if(type==='VP8L'){const value=bytes.readUInt32LE(p+1);return [(value&0x3fff)+1,((value>>>14)&0x3fff)+1];}
  offset=p+length+(length%2);
 }
 throw new Error('WebP dimensions missing');
}
test('four actual WebP assets match declared dimensions and byte budget',()=>{
 assert.equal(artworks.length,4);assert.equal(new Set(artworks.map(a=>a.src)).size,4);
 for(const a of artworks){assert.ok(statSync('public'+a.src).size<200000);const bytes=readFileSync('public'+a.src);assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.deepEqual(webpSize(bytes),[a.imageWidth,a.imageHeight]);assert.ok(a.imageWidth>a.imageHeight);assert.ok(a.width*a.imageHeight/a.imageWidth<2.5);}
});
test('two works per project have valid placement, orientation and vertical clearance',()=>{
 for(const project of ['unapi','jarvis'])assert.equal(artworks.filter(a=>a.project===project).length,2);
 for(const a of artworks){const [x,y,z]=a.position;assert.ok(Math.abs(x)<=7&&Math.abs(z)<=4.5);assert.ok(y+a.width*a.imageHeight/a.imageWidth/2<3.55);assert.ok(y-a.width*a.imageHeight/a.imageWidth/2>.6);assert.ok(a.yaw===0||Math.abs(a.yaw)===Math.PI/2);}
});
