"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useExperienceState } from "@/systems/experience-state";
import { makeInstanceBuffers, type FieldInstance, type SurfaceData } from "./field-geometry";

// Declarative buffer attributes are disposed by R3F on unmount. All instance
// transforms/colors are uploaded once; no per-frame React work or allocations.
export function FieldGeometry({ data }: { data: SurfaceData }) {
  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      <bufferAttribute attach="attributes-normal" args={[data.normals, 3]} />
      <bufferAttribute attach="index" args={[data.indices, 1]} />
      {data.colors ? <bufferAttribute attach="attributes-color" args={[data.colors, 3]} /> : null}
    </bufferGeometry>
  );
}

type InstanceMeshRef = {
  instanceMatrix: { array: Float32Array; needsUpdate: boolean };
  computeBoundingSphere: () => void;
};

export function FieldInstances({
  name, data, instances, castShadow = false, roughness = 1, doubleSided = false, shadowOnly = false, sway = 0,
}: {
  name: string;
  data: SurfaceData;
  instances: readonly FieldInstance[];
  castShadow?: boolean;
  roughness?: number;
  doubleSided?: boolean;
  shadowOnly?: boolean;
  sway?: number;
}) {
  const meshRef = useRef<InstanceMeshRef>(null);
  const buffers = useMemo(() => makeInstanceBuffers(instances), [instances]);
  const breeze = useRef({ value: 0 });
  useFrame((_, delta) => {
    if (sway && !useExperienceState.getState().reducedMotion) breeze.current.value += Math.min(delta, .1);
  });
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.array.set(buffers.matrices);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [buffers]);

  return (
    <instancedMesh ref={meshRef} name={name} args={[undefined, undefined, instances.length]}
      castShadow={castShadow} receiveShadow>
      <FieldGeometry data={data} />
      <instancedBufferAttribute attach="instanceColor" args={[buffers.colors, 3]} />
      <meshStandardMaterial roughness={roughness} metalness={0} side={doubleSided ? 2 : 0}
        colorWrite={!shadowOnly} depthWrite={!shadowOnly}
        customProgramCacheKey={() => `field-foliage-${sway}`}
        onBeforeCompile={(shader: { uniforms: Record<string, unknown>; vertexShader: string }) => {
          if (!sway) return;
          shader.uniforms.uFieldBreeze = breeze.current;
          shader.vertexShader = `uniform float uFieldBreeze;\n${shader.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
            #ifdef USE_INSTANCING
              float phase = instanceMatrix[3].x * .47 + instanceMatrix[3].z * .32;
              float bend = max(0.0, position.y) * ${sway.toFixed(3)};
              transformed.x += sin(uFieldBreeze * .85 + phase) * bend;
              transformed.z += cos(uFieldBreeze * .63 + phase) * bend * .45;
            #endif`);
        }} />
    </instancedMesh>
  );
}
