"use client";

import { Part, Solid, HouseInstances, WorldLettering, PLACE_PALETTE as P } from "../places/PlaceObjects";
import { HanokModule } from "./HanokModule";
import { surfaceHeight } from '../field/field-layout';
import { PLAN } from '../masterplan-layout';
import { DOJO as D, SONGAHM_PLANTING } from "./dojo-layout";
import { makeSongahmCourtyard } from './courtyard-surface';
import { FieldGeometry } from '../field/FieldMeshes';
import { WorldMaterial } from '../../materials/WorldMaterial';
const COURTYARD=makeSongahmCourtyard();

const MASONRY_JOINTS = [-1,1].flatMap(side=>Array.from({length:15},(_,i)=>({
  position:[(i-7)*D.terraceWidth/15,.18,side*(D.terraceDepth/2+.002)] as const,
  scale:[.025,.43,.009] as const,color:"#747565",
})));
const ground=(x:number,z:number)=>surfaceHeight(PLAN.dojo.x+x,PLAN.dojo.z+z)-surfaceHeight(PLAN.dojo.x,PLAN.dojo.z);
export function DojoArchitecture() {
  return <group name="SONGAHM_OPEN_HANOK_DOJANG">
    <mesh name="SONGAHM_TERRAIN_FOLLOWING_GRAVEL_COURT" receiveShadow>
      <FieldGeometry data={COURTYARD} /><WorldMaterial color="#ffffff" finish="gravel" vertexColors />
    </mesh>
    {/* Bury the continuous masonry footing; its top stays at .4u, shared
       with the terrace collider. Steps also extend below the common ground. */}
    <Solid name="SONGAHM_TERRACE_COLLIDER" position={[0,(D.terraceTop+D.foundationBottom)/2,0]} size={[D.terraceWidth,D.terraceTop-D.foundationBottom,D.terraceDepth]} color="#8f907e" finish="stone" />
    {/* Thin masonry joints make the continuous, below-grade terrace legible
        from both sides, without moving the approved floor or stair heights. */}
    <HouseInstances name="SONGAHM_MASONRY_JOINTS" instances={MASONRY_JOINTS} finish="stone" />
    <Part name="SONGAHM_STONE_COPING" position={[0,.385,0]} size={[D.terraceWidth,.03,D.terraceDepth]} color="#b3af99" finish="stone" radius={.01} />
    <Part name="SONGAHM_PRACTICE_FLOOR" position={[0,.425,0]} size={[D.terraceWidth-.22,.05,D.terraceDepth-.22]} color={P.woodLight} radius={.025} />
    {D.stairZ.map((z,i)=><Solid key={z} name={`SONGAHM_STAIR_${i}_COLLIDER`} position={[0,(D.stairTops[i]+D.stairBottom)/2,z]} size={[D.stairWidth,D.stairTops[i]-D.stairBottom,1.4]} color={P.stoneLight} finish="stone" />)}
    <HanokModule file="main-house" scale={D.mainScale} position={[0,.445-.50781*D.mainScale,0]} open collision />
    {/* Wings are separate, modestly scaled bodies, not a uniformly doubled village. */}
    {[-1,1].map(side=><group key={side} position={[side*D.wingX,0,D.wingZ]}>
      {/* Continuous masonry and door steps are part of the same visible/native
          model and exact collider now; no second plate or hidden footing. */}
      <HanokModule file="side-wing" position={[0,D.wingBase,0]} scale={D.wingScale} collision />
    </group>)}
    <Part name="SONGAHM_SIGN_FRAME" position={[-7.4,3.7,3.9]} size={[3.4,1.17,.14]} color={P.songahmTimber} radius={.035} />
    <WorldLettering text="Songahm" subtitle="Taekwondo · um lugar de prática" position={[-7.4,3.7,3.99]} width={3.2} dark />
    <HanokModule file="stepping-stones" position={[0,.012,11.3]} scale={1.1} yaw={Math.PI/2} />
    <HanokModule file="basin" position={[-20.7,ground(-20.7,2.8),2.8]} scale={1.1} />
    {SONGAHM_PLANTING.map(p=><HanokModule key={p.file} file={p.file} position={[p.x,ground(p.x,p.z),p.z]} scale={p.scale} />)}
  </group>;
}
