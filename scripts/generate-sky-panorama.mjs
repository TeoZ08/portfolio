// Original spherical cloud field: sampling XYZ makes the longitude seam exact.
// No external images, proprietary textures or photographed HDRI.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
// Offline authoring helper; sharp is supplied by the desktop runtime, never a browser dependency.
const require=createRequire(process.env.SKY_GENERATOR_MODULES ?? '/home/matteo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const sharp=require('sharp');
const W=2048,H=1024,buf=Buffer.alloc(W*H*4);
const smooth=(a,b,v)=>{let t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
function hash(x,y,z){const a=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return a-Math.floor(a);}
function noise(x,y,z){const a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,y-b),w=smooth(0,1,z-c);let sum=0;for(let k=0;k<2;k++)for(let j=0;j<2;j++)for(let i=0;i<2;i++)sum+=hash(a+i,b+j,c+k)*(i?u:1-u)*(j?v:1-v)*(k?w:1-w);return sum;}
for(let j=0;j<H;j++)for(let i=0;i<W;i++){
 const phi=i/(W-1)*Math.PI*2,theta=j/(H-1)*Math.PI;
 const y=Math.cos(theta),x=Math.sin(theta)*Math.cos(phi),z=Math.sin(theta)*Math.sin(phi);
 const n=.58*noise(x*5+8,y*8+3,z*5)+.27*noise(x*12+9,y*19,z*12+5)+.15*noise(x*28,y*35,z*28);
 const bank=smooth(.08,.16,y)*(1-smooth(.48,.75,y));
 const alpha=smooth(.48,.66,n)*bank*.86;
 const shade=Math.round(239+n*16),a=(j*W+i)*4;
 buf.set([shade,shade,Math.round(shade*.97),Math.round(alpha*255)],a);
}
mkdirSync('public/assets/sky',{recursive:true});
await sharp(buf,{raw:{width:W,height:H,channels:4}}).webp({quality:85,alphaQuality:95}).toFile('public/assets/sky/painted-cloud-panorama.webp');
console.log('Original panorama generated',W,H);
