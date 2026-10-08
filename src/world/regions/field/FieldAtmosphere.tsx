"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, AdditiveBlending } from "three";
import { useWorldState } from "@/systems/world-state";
import { useExperienceState } from "@/systems/experience-state";
import { surfaceHeight } from "./field-layout";
import { PLACE_LAYOUT } from "../places/place-layout";

export function FieldAtmosphere() {
  const time = useWorldState(state => state.timeOfDay);
  const reducedMotion = useExperienceState(state => state.reducedMotion);
  const night = time >= 19 || time < 6;
  const lights = useRef<Group>(null);
  const points = useMemo(() => {
    const array = new Float32Array(54 * 3);
    for (let i = 0; i < 54; i++) {
      const x = -42 + Math.sin(i * 13.31) * 8;
      const z = -68 + Math.cos(i * 19.7) * 14;
      array.set([x, surfaceHeight(x, z) + .5 + (i % 8) * .24, z], i * 3);
    }
    return array;
  }, []);
  useFrame((state) => {
    if (lights.current) lights.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * .4) * .13;
  });
  return <group name="FIELD_EVENING_ATMOSPHERE">
    {night && Object.entries(PLACE_LAYOUT).map(([key, place]) => <pointLight key={key} name={`${key}_EVENING_LAMP`} position={[place.x, surfaceHeight(place.x, place.z) + 2.65, place.z + 1]} color="#ffc878" intensity={key === "hill" ? 2 : 8} distance={12} decay={1.4} />)}
    {night && <pointLight name="HOUSE_PORCH_WARMTH" position={[-16, 2.5, -30]} color="#ffd08c" intensity={8} distance={13} decay={1.4} />}
    <group ref={lights} visible={night} name="GROVE_FIREFLIES">
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><pointsMaterial color="#ffe9a0" size={.055} transparent opacity={.7} blending={AdditiveBlending} depthWrite={false} /></points>
    </group>
  </group>;
}
