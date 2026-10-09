"use client";
import { useLoader } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { type FieldInstance, makeInstanceBuffers } from "./field-geometry";
import { REGIONAL_PLANTING as CLUSTERS } from "./regional-planting-layout";

function Instances({file,items,color}:{file:string;items:readonly FieldInstance[];color:string}) {
  const gltf=useLoader(GLTFLoader,`/assets/songahm/${file}.glb`);
  const buffers=useMemo(()=>makeInstanceBuffers(items),[items]);
  const parts=useMemo(()=>{
    gltf.scene.updateMatrixWorld(true);const meshes:Mesh[]=[];gltf.scene.traverse(o=>{if((o as Mesh).isMesh)meshes.push(o as Mesh);});
    return meshes.map(m=>({geometry:m.geometry.clone().applyMatrix4(m.matrixWorld),material:new MeshStandardMaterial({color,roughness:1})}));
  },[gltf.scene,color]);
  useEffect(()=>()=>parts.forEach(p=>{p.geometry.dispose();p.material.dispose();}),[parts]);
  return <group name={`REGIONAL_${file}`}>{parts.map((p,i)=><PrimitiveInstances key={i} part={p} count={items.length} matrices={buffers.matrices} />)}</group>;
}
function PrimitiveInstances({part,count,matrices}:{part:{geometry:Mesh['geometry'];material:MeshStandardMaterial};count:number;matrices:Float32Array}) {
  const ref=useRef<InstancedMesh>(null);
  useLayoutEffect(()=>{if(ref.current){ref.current.instanceMatrix.array.set(matrices);ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();}},[matrices]);
  return <instancedMesh ref={ref} args={[part.geometry,part.material,count]} receiveShadow dispose={null} />;
}
export function RegionalPlanting(){return <group name="REGIONAL_CURATED_KENNEY_CLUSTERS">
  <Instances file="rock_largeA" items={CLUSTERS.stone} color="#858477" />
  <Instances file="rock_smallC" items={CLUSTERS.pebble} color="#aaa18a" />
  <Instances file="plant_bushSmall" items={CLUSTERS.bush} color="#65794a" />
</group>;}
