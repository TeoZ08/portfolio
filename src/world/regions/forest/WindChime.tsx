"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useExperienceState } from "@/systems/experience-state";
import { FOREST_CHIME_ANCHOR } from "../field/field-interaction-targets";
import { Place, Part, WorldLettering, PLACE_PALETTE as P } from "../places/PlaceObjects";

export function WindChime() {
  const notes = useRef<(Group | null)[]>([]);
  const strikes = useRef([0, 0, 0]);
  useEffect(() => {
    const strike = (event: Event) => {
      const index: unknown = (event as CustomEvent).detail;
      if (typeof index === "number" && Number.isInteger(index) && index >= 0 && index < 3) strikes.current[index] = 1;
    };
    window.addEventListener("world:chime", strike);
    return () => window.removeEventListener("world:chime", strike);
  }, []);
  useFrame((state, delta) => {
    const still = useExperienceState.getState().reducedMotion;
    notes.current.forEach((note, index) => {
      strikes.current[index] = Math.max(0, strikes.current[index] - Math.min(delta, .1) * .55);
      if (note) note.rotation.z = still ? 0 : Math.sin(state.clock.elapsedTime * (7 + index) + index) * (.018 + strikes.current[index] * .2);
    });
  });
  return <Place name="FOREST_HANDMADE_WIND_CHIME" x={FOREST_CHIME_ANCHOR.x} z={FOREST_CHIME_ANCHOR.z} yaw={FOREST_CHIME_ANCHOR.yaw}>
    <Part name="CHIME_TIMBER_POST" position={[0, 1.6, -.85]} size={[.14, 3.2, .15]} color={P.woodDark} />
    <Part name="CHIME_TIMBER_ARM" position={[0, 3.08, -.55]} size={[1.4, .12, .7]} color={P.wood} />
    {[-1, 0, 1].map((x, index) => <group ref={node => { notes.current[index] = node; }} key={index} position={[x * .37, 3, -.4]}>
      <Part name="CHIME_THREAD" position={[0, -.22, 0]} size={[.012, .44, .012]} color={P.iron} />
      <mesh position={[0, -.76 + index * .08, 0]} castShadow><cylinderGeometry args={[.055, .055, .72 - index * .16, 12]} /><meshStandardMaterial color={P.brass} roughness={.55} metalness={.6} /></mesh>
    </group>)}
    <WorldLettering text="Escute o bosque" subtitle="Três notas · E para tocar" position={[0, 1.27, -.75]} width={1.25} />
  </Place>;
}
