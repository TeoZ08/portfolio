"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { HouseBlockout as Part } from "@/world/regions/house/HouseBlockout";
import { SoftObject } from "@/world/regions/house/HouseObjects";
import type { PlayerMotionRef } from "./player-motion";
import type { PlayerControlRef } from "./player-control";
import { AnimatedVisitor } from "./AnimatedVisitor";
import { AssetBoundary } from "@/world/assets/AssetBoundary";

type Limb = { rotation: { x: number }; position: { y: number } };
const CLOTH = "#e8e3d6", TROUSER = "#303438", SHOE = "#b8b5ac", SKIN = "#d9b497";

// A lightweight, explicitly provisional silhouette while the original GLB loads
// or if it fails. Neither representation writes physical position or heading.
export function VisitorAvatar({ motionRef, controlRef }: { motionRef: PlayerMotionRef; controlRef: PlayerControlRef }) {
  const fallback = <VisitorSilhouette motionRef={motionRef} controlRef={controlRef} />;
  return <AssetBoundary fallback={fallback}><Suspense fallback={fallback}>
    <AnimatedVisitor motionRef={motionRef} controlRef={controlRef} />
  </Suspense></AssetBoundary>;
}

function VisitorSilhouette({ motionRef, controlRef }: { motionRef: PlayerMotionRef; controlRef: PlayerControlRef }) {
  const leftLeg=useRef<Limb>(null),rightLeg=useRef<Limb>(null),leftArm=useRef<Limb>(null),rightArm=useRef<Limb>(null),torso=useRef<Limb>(null);
  const phase=useRef(0),blend=useRef(0),seat=useRef(0),sprint=useRef(0),airborne=useRef(0);
  useFrame((_,delta)=>{
    const speed=Math.hypot(motionRef.current.velocity.x,motionRef.current.velocity.z);
    const alpha=1-Math.exp(-12*Math.min(delta,.1));
    blend.current+=(Math.min(1,speed/4)-blend.current)*alpha;
    seat.current+=((controlRef.current.physicsLocked?1:0)-seat.current)*alpha;
    sprint.current+=((motionRef.current.sprinting?1:0)-sprint.current)*alpha;
    airborne.current+=((motionRef.current.airborne?1:0)-airborne.current)*alpha;
    phase.current+=speed*Math.min(delta,.1)*3.1;
    const swing=Math.sin(phase.current)*.46*blend.current*(1-seat.current);
    if(leftLeg.current)leftLeg.current.rotation.x=swing+seat.current*1.25;
    if(rightLeg.current)rightLeg.current.rotation.x=-swing+seat.current*1.25;
    if(leftArm.current)leftArm.current.rotation.x=-swing*.6+seat.current*.46;
    if(rightArm.current)rightArm.current.rotation.x=swing*.6+seat.current*.46;
    if(torso.current){
      torso.current.position.y=Math.cos(phase.current*2)*.012*blend.current+seat.current*.06+airborne.current*.025;
      torso.current.rotation.x=-sprint.current*.055-airborne.current*.02;
    }
  });
  return <group name="DEV_MATTEO_ASSET_FALLBACK">
    <group ref={torso}>
      <SoftObject name="VISITOR_JACKET" position={[0,.03,0]} size={[.49,.64,.32]} color={CLOTH} castShadow />
      <Part name="JACKET_HEM" position={[0,-.25,0]} size={[.41,.09,.3]} color="#b6aa8f" finish="fabric" radius={.04} />
      <SoftObject name="VISITOR_NECK" position={[0,.38,0]} size={[.16,.18,.15]} color={SKIN} finish="paint" />
      <SoftObject name="VISITOR_HEAD" position={[0,.59,-.008]} size={[.35,.4,.34]} color={SKIN} finish="paint" castShadow />
      <SoftObject name="VISITOR_HAIR" position={[0,.725,.031]} size={[.368,.2,.33]} color="#493f32" finish="fabric" castShadow />
      <SoftObject name="VISITOR_HAIR_BACK" position={[0,.63,.13]} size={[.34,.25,.1]} color="#493f32" finish="fabric" />
      <SoftObject name="VISITOR_NOSE" position={[0,.575,-.18]} size={[.065,.068,.066]} color={SKIN} finish="paint" />
      {[-1,1].map(side=><group key={side}>
        <SoftObject name="VISITOR_EAR" position={[side*.173,.585,0]} size={[.07,.095,.065]} color={SKIN} finish="paint" />
        <mesh position={[side*.075,.614,-.163]}><sphereGeometry args={[.012,8,6]} /><meshStandardMaterial color="#393831" roughness={1} /></mesh>
      </group>)}
      <group ref={leftArm} position={[-.28,.23,0]}><SoftObject name="JACKET_LEFT_SLEEVE" position={[0,-.22,0]} size={[.16,.46,.18]} color={CLOTH} castShadow /><SoftObject name="VISITOR_LEFT_HAND" position={[0,-.465,0]} size={[.115,.13,.12]} color={SKIN} finish="paint" /></group>
      <group ref={rightArm} position={[.28,.23,0]}><SoftObject name="JACKET_RIGHT_SLEEVE" position={[0,-.22,0]} size={[.16,.46,.18]} color={CLOTH} castShadow /><SoftObject name="VISITOR_RIGHT_HAND" position={[0,-.465,0]} size={[.115,.13,.12]} color={SKIN} finish="paint" /></group>
    </group>
    <group ref={leftLeg} position={[-.135,-.21,0]}><SoftObject name="VISITOR_LEFT_TROUSER" position={[0,-.225,0]} size={[.195,.55,.22]} color={TROUSER} castShadow /><Part name="VISITOR_LEFT_BOOT" position={[0,-.56,-.058]} size={[.2,.13,.32]} color={SHOE} radius={.055} castShadow /><Part name="LEFT_BOOT_SOLE" position={[0,-.626,-.06]} size={[.206,.035,.32]} color="#c7b998" radius={.015} /></group>
    <group ref={rightLeg} position={[.135,-.21,0]}><SoftObject name="VISITOR_RIGHT_TROUSER" position={[0,-.225,0]} size={[.195,.55,.22]} color={TROUSER} castShadow /><Part name="VISITOR_RIGHT_BOOT" position={[0,-.56,-.058]} size={[.2,.13,.32]} color={SHOE} radius={.055} castShadow /><Part name="RIGHT_BOOT_SOLE" position={[0,-.626,-.06]} size={[.206,.035,.32]} color="#c7b998" radius={.015} /></group>
  </group>;
}
