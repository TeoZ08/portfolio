"use client";

import { Part, Solid, WorldLettering, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { HanokModule } from "./HanokModule";
import { DOJO as D } from "./dojo-layout";

export function DojoArchitecture() {
  return <group name="SONGAHM_OPEN_HANOK_DOJANG">
    {/* Native plinth is 3×3×.5m. Visual and simple walkable collider agree. */}
    <HanokModule file="plinth" scale={[D.terraceWidth/3, .8, D.terraceDepth/3]} />
    <Solid name="SONGAHM_TERRACE_COLLIDER" position={[0,.2,0]} size={[D.terraceWidth,.4,D.terraceDepth]} visual={false} />
    <Part name="SONGAHM_PRACTICE_FLOOR" position={[0,.445,0]} size={[D.terraceWidth-.7,.06,D.terraceDepth-.7]} color={P.woodLight} radius={.025} />
    {D.stairZ.map((z,i)=><Solid key={z} name={`SONGAHM_STAIR_${i}_COLLIDER`} position={[0,D.stairTops[i]/2,z]} size={[6.8-i*.35,D.stairTops[i],1.4]} color={i%2 ? P.stoneLight:P.stone} finish="plaster" />)}
    <HanokModule file="main-house" scale={D.mainScale} position={[0,.445-.50781*D.mainScale,0]} open collision />
    {/* Wings are separate, modestly scaled bodies, not a uniformly doubled village. */}
    {[-1,1].map(side=><group key={side} position={[side*D.wingX,0,-1.4]}>
      <HanokModule file="side-wing" scale={D.wingScale} collision />
    </group>)}
    <Part name="SONGAHM_SIGN_FRAME" position={[0,4.5,5.72]} size={[4.1,1,.14]} color={P.songahmTimber} radius={.035} />
    <WorldLettering text="Songahm" subtitle="Taekwondo · um lugar de prática" position={[0,4.5,5.81]} width={3.9} dark />
    <HanokModule file="stepping-stones" position={[0,.012,11.3]} scale={1.1} yaw={Math.PI/2} />
    <HanokModule file="basin" position={[-11.8,0,7.4]} scale={1.3} />
    <HanokModule file="pine" position={[-18.5,0,1.5]} scale={1.6} />
    <HanokModule file="persimmon" position={[18.2,0,1]} scale={1.25} />
    <HanokModule file="bamboo" position={[-17.8,0,-6]} scale={1.2} />
  </group>;
}
