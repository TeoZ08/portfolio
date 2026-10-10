"use client";

import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { RigidBody, TrimeshCollider } from "@react-three/rapier";
import { Mesh, Group, MeshStandardMaterial } from "three";
import { transformedGeometry } from "./hanok-geometry";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Cached GLBs share geometry and materials. Main house is an architectural skin:
// the enclosed room/doors are omitted so the existing training room stays usable.
export function HanokModule({ file, position = [0, 0, 0], scale = 1, yaw = 0, open = false, collision = false }: {
  file: string; position?: [number, number, number]; scale?: number | [number, number, number]; yaw?: number; open?: boolean; collision?: boolean;
}) {
  const gltf = useLoader(GLTFLoader, `/assets/songahm/${file}.glb`);
  const model = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const clone = new Group();
    gltf.scene.traverse(object => {
      const source = object as Mesh;
      if (!source.isMesh) return;
      if(file === "stepping-stones" && source.name !== "stepping-stone-path_1")return;
      if(open && !["hanok-main-house_1", "hanok-main-house_7"].includes(source.name))return;
      if(open && source.name === "hanok-main-house_1") {
        // Remove the native low perimeter sill: it otherwise blocks the original
        // training floor. Keep tall posts/joinery; no collision-only invisible fix.
        const geometry=transformedGeometry(source.geometry,source.matrixWorld);
        const position=geometry.getAttribute("position"),old=geometry.index!;const indices:number[]=[];
        for(let i=0;i<old.count;i+=3){const a=old.getX(i),b=old.getX(i+1),c=old.getX(i+2);
          if(Math.max(position.getY(a),position.getY(b),position.getY(c))>.95)indices.push(a,b,c);
        }
        geometry.setIndex(indices);geometry.computeBoundingSphere();
        const mesh=new Mesh(geometry,source.material);mesh.name=source.name;mesh.castShadow=true;mesh.receiveShadow=true;clone.add(mesh);
      } else {
        const mesh=source.clone();mesh.matrixAutoUpdate=false;mesh.matrix.copy(source.matrixWorld);
        if(file==='plinth'){
          const materials=Array.isArray(source.material)?source.material:[source.material];
          mesh.material=materials.map(original=>{const m=original.clone() as MeshStandardMaterial;m.color.set('#8b8875');m.roughness=1;return m;});
        }
        mesh.castShadow=true;mesh.receiveShadow=true;clone.add(mesh);
      }
    });
    return clone;
  }, [gltf.scene, open, file]);
  useEffect(()=>()=>{if(open||file==="plinth")model.traverse(o=>{const m=o as Mesh;if(m.isMesh&&m.name==="hanok-main-house_1")m.geometry.dispose();if(m.isMesh&&file==="plinth")(Array.isArray(m.material)?m.material:[m.material]).forEach(material=>material.dispose());});},[model,open,file]);
  const shapes = useMemo(() => {
    if(!collision)return [];
    model.updateMatrixWorld(true);
    const parts:{positions:Float32Array;indices:Uint32Array}[]=[];
    model.traverse(o=>{
      const m=o as Mesh;if(!m.isMesh||!m.visible)return;
      const geometry=transformedGeometry(m.geometry,m.matrixWorld);
      const a=geometry.getAttribute("position");const positions=new Float32Array(a.count*3);
      for(let i=0;i<a.count;i++){positions[i*3]=a.getX(i);positions[i*3+1]=a.getY(i);positions[i*3+2]=a.getZ(i);}
      const indices=geometry.index?new Uint32Array(geometry.index.array):Uint32Array.from({length:a.count},(_,i)=>i);
      parts.push({positions,indices});geometry.dispose();
    });return parts;
  },[model,collision]);
  return <group name={`HANOK_${file}`} position={position} scale={scale} rotation={[0, yaw, 0]} dispose={null}>
    <primitive object={model} />
    {collision && <RigidBody type="fixed" colliders={false} name={`HANOK_${file}_EXACT_COLLIDERS`}>
      {shapes.map((s,i)=><TrimeshCollider key={i} args={[s.positions,s.indices]} />)}
    </RigidBody>}
  </group>;
}
