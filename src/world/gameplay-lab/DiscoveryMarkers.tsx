"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import { usePlayerDebugState } from "@/world/player/player-state";
import { LAB_DISCOVERIES } from "./discovery-logic";
import { useDiscoveryLabStore } from "./discovery-store";

function DiscoveryMarker({
  id,
  color,
  position,
}: {
  id: string;
  color: string;
  position: readonly [number, number, number];
}) {
  const marker = useRef<Group>(null);
  useFrame((_, delta) => {
    if (marker.current) marker.current.rotation.y += Math.min(delta, 0.1) * 0.45;
  });

  const collect = () => {
    // The same range rule protects pointer and keyboard interaction.
    useDiscoveryLabStore.getState().tryCollect(
      id,
      usePlayerDebugState.getState().position,
    );
  };

  return (
    <group name={"DISCOVERY_" + id.toUpperCase()} position={position}>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.43, 0.48, 0.12, 8]} />
        <meshBasicMaterial color="#353b44" />
      </mesh>
      <group ref={marker}>
        <mesh name={"DISCOVERY_SELECT_" + id} onClick={(event) => {
          event.stopPropagation();
          collect();
        }}>
          <icosahedronGeometry args={[0.29, 0]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.44, 0.018, 5, 30]} />
          <meshBasicMaterial color="#dce1ea" />
        </mesh>
      </group>
    </group>
  );
}

export function DiscoveryMarkers() {
  const found = useDiscoveryLabStore((state) => state.found);
  return (
    <group name="GAMEPLAY_LAB_DISCOVERIES">
      {LAB_DISCOVERIES.filter((target) => !found.includes(target.id)).map((target) => (
        <DiscoveryMarker
          key={target.id}
          id={target.id}
          color={target.color}
          position={target.position}
        />
      ))}
    </group>
  );
}
