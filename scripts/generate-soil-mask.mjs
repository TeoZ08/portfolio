// Bake expensive route distances offline. The image is scalar data, not sRGB.
import {readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {stripTypeScriptTypes,createRequire} from 'node:module';
const cache=new Map();function url(p){p=resolve(p);if(cache.has(p))return cache.get(p);let s=stripTypeScriptTypes(readFileSync(p,'utf8'));s=s.replace(/from\s+['"](\.[^'"]+)['"]/g,(_,v)=>`from ${JSON.stringify(url(resolve(dirname(p),v+'.ts')))}`);let u='data:text/javascript;base64,'+Buffer.from(s).toString('base64');cache.set(p,u);return u;}
const {soilWeights}=await import(url('src/world/regions/field/terrain-biomes.ts'));
const require=createRequire(process.env.SKY_GENERATOR_MODULES??'/home/matteo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');const sharp=require('sharp');
const N=256,b=Buffer.alloc(N*N*4);
// TextureLoader flips image Y: row 0 is north (+V), z=+55.
for(let j=0;j<N;j++)for(let i=0;i<N;i++)b.set([...soilWeights(-55+i/(N-1)*110,55-j/(N-1)*110).map(v=>Math.round(v*255)),255],(j*N+i)*4);
await sharp(b,{raw:{width:N,height:N,channels:4}}).png().toFile('public/assets/terrain/regional-soil-mask.png');
