"use client";

import { useLoader } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Box3, Color, InstancedMesh, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { makeInstanceBuffers, type FieldInstance } from "../field/field-geometry";
import { surfaceHeight } from "../field/field-layout";
import { FOREST_DRESSING as D } from "./forest-dressing";

// These selected glTFs each contain a single material/primitive. Share one
// geometry per species, with matrices uploaded only on mount. No frame work.
function GroveInstances({ file, instances, shadow = false }: { file: string; instances: readonly FieldInstance[]; shadow?: boolean }) {
  const gltf = useLoader(GLTFLoader, `/assets/nature/${file}.gltf`);
  const ref = useRef<InstancedMesh>(null);
  const buffers = useMemo(() => makeInstanceBuffers(instances), [instances]);
  const prepared = useMemo(() => {
    let source: Mesh | undefined;
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(object => { if ((object as Mesh).isMesh) source = object as Mesh; });
    if (!source) throw new Error(`No geometry in ${file}`);
    const geometry = source.geometry.clone().applyMatrix4(source.matrixWorld);
    const material = (source.material as MeshStandardMaterial).clone();
    material.roughness = 1; material.metalness = 0;
    material.normalScale.set(.3, .3);
    if (material.alphaTest) material.alphaTest = .38;
    return { geometry, material };
  }, [gltf.scene, file]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.instanceMatrix.array.set(buffers.matrices);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [buffers]);
  useEffect(() => () => { prepared.geometry.dispose(); prepared.material.dispose(); }, [prepared]);
  return <instancedMesh ref={ref} name={`GROVE_${file}`} args={[prepared.geometry, prepared.material, instances.length]} castShadow={shadow} receiveShadow dispose={null}>
    <instancedBufferAttribute attach="instanceColor" args={[buffers.colors, 3]} />
  </instancedMesh>;
}

function ForgottenMachine({ file, x, z, height, yaw }: { file: string; x: number; z: number; height: number; yaw: number }) {
  const gltf = useLoader(GLTFLoader, `/assets/machines/${file}.glb`);
  const prepared = useMemo(() => {
    const model = gltf.scene.clone(true);
    const materials: MeshStandardMaterial[] = [];
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3()), centre = box.getCenter(new Vector3());
    const scale = height / size.y;
    model.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
    model.scale.setScalar(scale);
    model.traverse(object => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      const material = (mesh.material as MeshStandardMaterial).clone();
      material.emissive.set(0); material.roughness = 1; material.metalness = 0;
      // Palette kept as a small material detail, with no glowing light sources.
      material.color.multiply(new Color("#b5b9a4"));
      mesh.material = material; mesh.castShadow = true; mesh.receiveShadow = true;
      materials.push(material);
    });
    return { model, materials };
  }, [gltf.scene, height]);
  useEffect(() => () => prepared.materials.forEach(material => material.dispose()), [prepared]);
  return <group name={`GROVE_FORGOTTEN_${file.toUpperCase()}`} position={[x, surfaceHeight(x,z)-.09, z]} rotation={[0,yaw,0]} dispose={null}>
    <primitive object={prepared.model} />
  </group>;
}

export function ForestAssets() {
  return <group name="FOREST_FOUND_OBJECTS">
    <GroveInstances file="Fern_1" instances={D.fern} />
    <GroveInstances file="Bush_Common" instances={D.bush} shadow />
    <GroveInstances file="Mushroom_Common" instances={D.mushroom} />
    <GroveInstances file="Rock_Medium_1" instances={D.stone} shadow />
    <GroveInstances file="DeadTree_1" instances={D.snag} shadow />
    <ForgottenMachine file="companion" x={-44.1} z={-72.2} height={1.75} yaw={.8} />
    <ForgottenMachine file="storage" x={-47.1} z={-67.6} height={1.35} yaw={-.5} />
  </group>;
}
