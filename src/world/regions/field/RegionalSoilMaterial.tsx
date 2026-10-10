"use client";

import { useLoader } from "@react-three/fiber";
import { RepeatWrapping, SRGBColorSpace, TextureLoader, ClampToEdgeWrapping, NoColorSpace, LinearFilter } from "three";
import { useEffect, useMemo } from "react";

type SoilShader = { uniforms: Record<string,unknown>; vertexShader:string;fragmentShader:string };
export function RegionalSoilMaterial() {
  const textures=useLoader(TextureLoader,[
    "/assets/terrain/gravel_ground_01_diffuse_1k.jpg", "/assets/terrain/rocks_ground_09_diffuse_1k.jpg",
    "/assets/terrain/gravel_ground_01_rough_1k.jpg", "/assets/terrain/rocks_ground_09_rough_1k.jpg",
    "/assets/terrain/regional-soil-mask.png",
  ]);
  const prepared=useMemo(()=>textures.map((texture,i)=>{
    const t=texture.clone();t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=4;
    t.colorSpace=i<2?SRGBColorSpace:NoColorSpace;
    if(i===4){t.wrapS=t.wrapT=ClampToEdgeWrapping;t.generateMipmaps=false;t.minFilter=t.magFilter=LinearFilter;}
    t.needsUpdate=true;return t;
  }),[textures]);
  useEffect(()=>()=>prepared.forEach(t=>t.dispose()),[prepared]);
  return <meshStandardMaterial vertexColors roughness={1} metalness={0}
    customProgramCacheKey={()=>"regional-soil-v3"}
    onBeforeCompile={(shader:SoilShader)=>{
      shader.uniforms.soilMask={value:prepared[4]};
      prepared.forEach((t,i)=>{shader.uniforms[`soilTexture${i}`]={value:t};});
      shader.vertexShader=`attribute vec3 soilWeights; varying vec3 vSoilWeights; varying vec2 vSoilUV;\n${shader.vertexShader}`.replace("#include <begin_vertex>",`#include <begin_vertex>\nvSoilWeights=soilWeights; vSoilUV=position.xz*.72/2.4;`);
      shader.fragmentShader=`varying vec3 vSoilWeights; varying vec2 vSoilUV;
        uniform sampler2D soilMask;
        uniform sampler2D soilTexture0; uniform sampler2D soilTexture1;
        uniform sampler2D soilTexture2; uniform sampler2D soilTexture3;
        ${shader.fragmentShader}`.replace("#include <color_fragment>",`#include <color_fragment>
        vec3 g=texture2D(soilTexture0,vSoilUV).rgb;
        vec3 r=texture2D(soilTexture1,vSoilUV*.8).rgb;
        // Retain the real PBR detail but soften it into the world's matte palette.
        g=mix(g,vec3(.32,.28,.20),.6);
        r=mix(r,vec3(.27,.29,.24),.58);
        vec2 maskUV=(vSoilUV*(2.4/.72)+55.)/110.;
        vec2 warp=vec2(sin(vSoilUV.y*8.3),cos(vSoilUV.x*7.1))*.0012;
        vec3 w=texture2D(soilMask,clamp(maskUV+warp,0.,1.)).rgb;
        w/=max(1.,w.x+w.y+w.z);
        vec3 meadow=diffuseColor.rgb*(.94+.12*g.r);
        diffuseColor.rgb=meadow*(1.-w.x-w.y-w.z)+g*w.x+r*w.y+mix(g,vec3(.13,.12,.08),.55)*w.z;
      `).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor=mix(.98,texture2D(soilTexture2,vSoilUV).r,vSoilWeights.x*.4);
        roughnessFactor=mix(roughnessFactor,texture2D(soilTexture3,vSoilUV*.8).r,vSoilWeights.y*.4);
      `);
    }} />;
}
