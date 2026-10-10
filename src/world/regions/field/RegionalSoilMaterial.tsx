"use client";

import { useLoader } from "@react-three/fiber";
import { RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";
import { useEffect, useMemo } from "react";

type SoilShader = { uniforms: Record<string,unknown>; vertexShader:string;fragmentShader:string };
export function RegionalSoilMaterial() {
  const textures=useLoader(TextureLoader,[
    "/assets/terrain/gravel_ground_01_diffuse_1k.jpg", "/assets/terrain/rocks_ground_09_diffuse_1k.jpg",
    "/assets/terrain/gravel_ground_01_rough_1k.jpg", "/assets/terrain/rocks_ground_09_rough_1k.jpg",
  ]);
  const prepared=useMemo(()=>textures.map((texture,i)=>{
    const t=texture.clone();t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=4;
    if(i<2)t.colorSpace=SRGBColorSpace;t.needsUpdate=true;return t;
  }),[textures]);
  useEffect(()=>()=>prepared.forEach(t=>t.dispose()),[prepared]);
  return <meshStandardMaterial vertexColors roughness={1} metalness={0}
    customProgramCacheKey={()=>"regional-soil-v1"}
    onBeforeCompile={(shader:SoilShader)=>{
      prepared.forEach((t,i)=>{shader.uniforms[`soilTexture${i}`]={value:t};});
      shader.vertexShader=`attribute vec3 soilWeights; varying vec3 vSoilWeights; varying vec2 vSoilUV;\n${shader.vertexShader}`.replace("#include <begin_vertex>",`#include <begin_vertex>\nvSoilWeights=soilWeights; vSoilUV=position.xz*.72/2.4;`);
      shader.fragmentShader=`varying vec3 vSoilWeights; varying vec2 vSoilUV;
        uniform sampler2D soilTexture0; uniform sampler2D soilTexture1;
        uniform sampler2D soilTexture2; uniform sampler2D soilTexture3;
        ${shader.fragmentShader}`.replace("#include <color_fragment>",`#include <color_fragment>
        vec3 g=texture2D(soilTexture0,vSoilUV).rgb;
        vec3 r=texture2D(soilTexture1,vSoilUV*.8).rgb;
        // Retain the real PBR detail but soften it into the world's matte palette.
        g=mix(g,vec3(dot(g,vec3(.299,.587,.114))),.32)*vec3(.94,.88,.75);
        r=mix(r,vec3(dot(r,vec3(.299,.587,.114))),.28)*vec3(.9,.91,.83);
        vec3 w=vSoilWeights;
        vec3 meadow=diffuseColor.rgb*(.94+.12*g.r);
        diffuseColor.rgb=meadow*(1.-w.x-w.y-w.z)+g*w.x+r*w.y+g*vec3(.52,.46,.34)*w.z;
      `).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        roughnessFactor=mix(.98,texture2D(soilTexture2,vSoilUV).r,vSoilWeights.x*.4);
        roughnessFactor=mix(roughnessFactor,texture2D(soilTexture3,vSoilUV*.8).r,vSoilWeights.y*.4);
      `);
    }} />;
}
