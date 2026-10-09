import fs from 'node:fs';
import path from 'node:path';
const files=[];
for(const dir of ['public/assets/songahm','public/assets/terrain'])for(const file of fs.readdirSync(dir)){
 if(!/\.(glb|jpg)$/.test(file))continue;const p=path.join(dir,file),b=fs.readFileSync(p);const entry={file:p,bytes:b.length};
 if(file.endsWith('.glb')){
  const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  let primitives=0,triangles=0;for(const m of j.meshes)for(const prim of m.primitives){primitives++;triangles+=(prim.indices!==undefined?j.accessors[prim.indices].count:j.accessors[prim.attributes.POSITION].count)/3;}
  Object.assign(entry,{sourceTriangles:triangles,sourcePrimitives:primitives,sourceMaterials:j.materials?.length||0,embeddedImages:j.images?.length||0});
 }
 files.push(entry);
}
const data={files,totalBytes:files.reduce((s,f)=>s+f.bytes,0),glbBytes:files.filter(f=>f.file.endsWith('.glb')).reduce((s,f)=>s+f.bytes,0),textureBytes:files.filter(f=>f.file.endsWith('.jpg')).reduce((s,f)=>s+f.bytes,0),textureDecodedEstimateBytes:4*1024*1024*4*4/3,note:'Source mesh counts are file inventory, not live renderer draw calls or GPU performance. Four 1K RGBA textures with mipmaps estimate; excludes baseline assets.'};
console.log(JSON.stringify(data,null,2));
