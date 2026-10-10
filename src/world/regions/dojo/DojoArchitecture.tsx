"use client";

import { Part, Solid, WorldLettering, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { HanokModule } from "./HanokModule";
import { DOJO as D } from "./dojo-layout";

export function DojoArchitecture() {
  return <group name="SONGAHM_OPEN_HANOK_DOJANG">
    {/* Bury the continuous masonry footing; its top stays at .4u, shared
       with the terrace collider. Steps also extend below the common ground. */}
    <HanokModule file="plinth" position={[0,D.foundationBottom,0]} scale={[D.terraceWidth/3, (D.terraceTop-D.foundationBottom)/.5, D.terraceDepth/3]} />
    <Solid name="SONGAHM_TERRACE_COLLIDER" position={[0,(D.terraceTop+D.foundationBottom)/2,0]} size={[D.terraceWidth,D.terraceTop-D.foundationBottom,D.terraceDepth]} visual={false} />
    <Part name="SONGAHM_PRACTICE_FLOOR" position={[0,.425,0]} size={[D.terraceWidth-.22,.05,D.terraceDepth-.22]} color={P.woodLight} radius={.025} />
    {D.stairZ.map((z,i)=><Solid key={z} name={`SONGAHM_STAIR_${i}_COLLIDER`} position={[0,(D.stairTops[i]+D.stairBottom)/2,z]} size={[6.8-i*.35,D.stairTops[i]-D.stairBottom,1.4]} color={i%2 ? P.stoneLight:P.stone} finish="plaster" />)}
    <HanokModule file="main-house" scale={D.mainScale} position={[0,.445-.50781*D.mainScale,0]} open collision />
    {/* Wings are separate, modestly scaled bodies, not a uniformly doubled village. */}
    {[-1,1].map(side=><group key={side} position={[side*D.wingX,0,-1.4]}>
      <HanokModule file="side-wing" scale={D.wingScale} collision />
    </group>)}
    <Part name="SONGAHM_SIGN_FRAME" position={[-8.8,2.8,7.6]} size={[3.4,.86,.14]} color={P.songahmTimber} radius={.035} />
    <WorldLettering text="Songahm" subtitle="Taekwondo · um lugar de prática" position={[-8.8,2.8,7.69]} width={3.2} dark />
    <HanokModule file="stepping-stones" position={[0,.012,11.3]} scale={1.1} yaw={Math.PI/2} />
    <HanokModule file="basin" position={[-11.8,0,7.4]} scale={1.3} />
    <HanokModule file="pine" position={[-18.5,0,1.5]} scale={1.6} />
    <HanokModule file="persimmon" position={[18.2,0,1]} scale={1.25} />
    <HanokModule file="bamboo" position={[-17.8,0,-6]} scale={1.2} />
  </group>;
}
