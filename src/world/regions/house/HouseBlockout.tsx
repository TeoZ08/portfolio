"use client";

import { useMemo, useLayoutEffect, useRef, type ReactNode } from "react";

import { FieldGeometry } from "../field/FieldMeshes";
import { makeInstanceBuffers, type FieldInstance } from "../field/field-geometry";
import { roundedBox } from "./house-geometry";
import { HouseMaterial, type HouseFinish } from "./HouseMaterial";

type HouseVector3 = [number, number, number];

type HouseBlockoutProps = {
  children?: ReactNode;
  castShadow?: boolean;
  color: string;
  finish?: HouseFinish;
  name: string;
  position: HouseVector3;
  receiveShadow?: boolean;
  rotation?: HouseVector3;
  size: HouseVector3;
  radius?: number;
};

export function HouseBlockout({
  children,
  castShadow = false,
  color,
  finish = "wood",
  name,
  position,
  receiveShadow = true,
  rotation = [0, 0, 0],
  size,
  radius = 0.035,
}: HouseBlockoutProps) {
  const [width, height, depth] = size;
  const geometry = useMemo(() => roundedBox([width, height, depth], radius), [width, height, depth, radius]);
  return (
    <mesh
      name={name}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <FieldGeometry data={geometry} />
      <HouseMaterial color={color} finish={finish} />
      {children}
    </mesh>
  );
}

const BATCH_BOX = roundedBox([1, 1, 1], 0.025);
type InstanceMesh = {
  instanceMatrix: { array: Float32Array; needsUpdate: boolean };
  computeBoundingSphere: () => void;
};

// Repetition is batched: floorboards, keyboard keys, book spines and rug threads.
export function HouseInstances({ name, instances, finish = "wood" }: {
  name: string; instances: readonly FieldInstance[]; finish?: HouseFinish;
}) {
  const ref = useRef<InstanceMesh>(null);
  const buffers = useMemo(() => makeInstanceBuffers(instances), [instances]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.instanceMatrix.array.set(buffers.matrices);
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [buffers]);
  return <instancedMesh ref={ref} name={name} args={[undefined, undefined, instances.length]} receiveShadow>
    <FieldGeometry data={BATCH_BOX} />
    <instancedBufferAttribute attach="instanceColor" args={[buffers.colors, 3]} />
    <HouseMaterial color="#ffffff" finish={finish} />
  </instancedMesh>;
}
