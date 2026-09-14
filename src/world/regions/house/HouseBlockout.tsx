"use client";

import type { ReactNode } from "react";

type HouseVector3 = [number, number, number];

type HouseBlockoutProps = {
  children?: ReactNode;
  color: string;
  name: string;
  position: HouseVector3;
  receiveShadow?: boolean;
  rotation?: HouseVector3;
  size: HouseVector3;
};

export function HouseBlockout({
  children,
  color,
  name,
  position,
  receiveShadow = true,
  rotation = [0, 0, 0],
  size,
}: HouseBlockoutProps) {
  return (
    <mesh
      name={name}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.94} />
      {children}
    </mesh>
  );
}
