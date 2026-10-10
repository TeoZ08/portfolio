"use client";
import { useEffect, useMemo, useState } from 'react';
import { TextureLoader, Texture, SRGBColorSpace, RepeatWrapping, Vector3 } from 'three';
import { fieldDaylight } from './field-daylight';
import { linearColor } from './field-palette';
import { FieldClouds } from './FieldClouds';
const VERTEX=`varying vec3 vDirection;void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAGMENT=`
uniform vec3 upperColor,horizonColor,sunDirection,sunColor;uniform float night,usePanorama,sunset;
uniform sampler2D cloudPanorama;varying vec3 vDirection;
void main(){
 vec3 d=normalize(vDirection);
 float h=smoothstep(.04,.45,d.y);
 vec3 sky=mix(horizonColor,upperColor,pow(h,.65));
 vec2 uv=vec2(atan(d.z,d.x)/6.28318530718+.5,asin(clamp(d.y,-1.,1.))/3.14159265359+.5);
 vec4 clouds=texture2D(cloudPanorama,uv);
 float sunFacing=pow(max(0.,dot(d,sunDirection)),3.);
 vec3 cloudTint=mix(vec3(.90,.90,.84),vec3(.24,.33,.40),night);
 cloudTint=mix(cloudTint,mix(vec3(.66,.72,.83),vec3(1.,.73,.48),sunFacing),sunset*.65);
 sky=mix(sky,sunColor,pow(max(0.,dot(d,sunDirection)),8.)*(1.-smoothstep(.03,.4,d.y))*sunset*.18);
 sky=mix(sky,clouds.rgb*cloudTint,clouds.a*usePanorama);
 float facing=max(0.,dot(d,sunDirection));
 sky=mix(sky,sunColor,(pow(facing,48.)*.13+pow(facing,550.)*.24)*(1.-night*.65));
 sky=mix(sky,mix(sunColor,vec3(1),.65),smoothstep(cos(.023),cos(.019),facing));
 gl_FragColor=vec4(sky,1.);
 #include <colorspace_fragment>
}`;
export function FieldSky({hour}:{hour:number}){
 const light=fieldDaylight(hour);
 const [texture,setTexture]=useState<Texture|null>(null);
 const [procedural,setProcedural]=useState(false);
 useEffect(()=>{
  // QA comparison only. Production uses the panorama; failed local loads fall
  // back to the same gradient + procedural clouds without suspending the world.
  setProcedural(process.env.NODE_ENV!=='production'&&new URLSearchParams(location.search).get('sky')==='procedural');
  let alive=true;let loaded:Texture|undefined;
  new TextureLoader().load('/assets/sky/painted-cloud-panorama.webp',t=>{
   loaded=t;t.colorSpace=SRGBColorSpace;t.wrapS=RepeatWrapping;t.needsUpdate=true;
   if(alive)setTexture(t);else t.dispose();
  },undefined,()=>{if(alive)setTexture(null);});
  return ()=>{alive=false;loaded?.dispose();};
 },[]);
 const uniforms=useMemo(()=>({upperColor:{value:linearColor(light.upper)},horizonColor:{value:linearColor(light.horizon)},sunDirection:{value:new Vector3(...light.direction).normalize()},sunColor:{value:linearColor(light.sun)},night:{value:light.night?1:0},sunset:{value:light.sunset?1:0},usePanorama:{value:texture&&!procedural?1:0},cloudPanorama:{value:texture}}),[light.upper,light.horizon,light.sun,light.night,light.sunset,light.direction[0],light.direction[1],light.direction[2],texture,procedural]);
 return <group name={texture&&!procedural?'FIELD_PANORAMA_SKY':'FIELD_PROCEDURAL_SKY_FALLBACK'}>
  <mesh name="FIELD_SKY"><sphereGeometry args={[450,32,24]}/><shaderMaterial uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} side={1} depthWrite={false} toneMapped={false}/></mesh>
  {(!texture||procedural)&&<FieldClouds hour={hour}/>}
 </group>;
}
