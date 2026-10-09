"use client";
import { Place, Part, Solid, Worktable, WorldLettering, HouseBook, PLACE_PALETTE as P } from "./places/PlaceObjects";
import { PLAN, GALLERY_USE } from "./masterplan-layout";
import { FIELD_SCALE as S } from "./world-scale";
export function WorkshopRegion(){
 const g=PLAN.gallery;
 return <Place name="DEV_BLOCKOUT_GALLERY" {...g}>
  <Solid name="DEV_GALLERY_FLOOR" position={[0,.035,0]} size={[g.width,.19,g.depth]} color={P.stoneLight} finish="plaster" />
  <Solid name="DEV_GALLERY_REAR_WALL" position={[0,2.3/S,-g.depth/2]} size={[g.width,4.6/S,.25]} color={P.plasterShade} finish="plaster" />
  {[-1,1].map(side=><group key={side}>
   <Solid name="DEV_GALLERY_SHORT_SIDE" position={[side*g.width/2,1.5/S,-g.depth/2+1.5/S]} size={[.25,3/S,3/S]} color={P.plaster} finish="plaster" />
   <Solid name="DEV_GALLERY_FRONT_POST" position={[side*(g.width/2-.25),2.3/S,g.depth/2]} size={[.3,4.6/S,.3]} color={P.woodDark} />
   <Part name="DEV_GALLERY_ROOF_BAND" position={[side*(g.width/2-.5/S),4.7/S,0]} size={[1/S,.18,g.depth]} color={P.roofShade} castShadow />
  </group>)}
  <Part name="DEV_GALLERY_BACK_CANOPY" position={[0,4.7/S,-g.depth/2+.6/S]} size={[g.width,.18,1.2/S]} color={P.roofShade} castShadow />
  <Part name="DEV_GALLERY_FRONT_BEAM" position={[0,4.55/S,g.depth/2]} size={[g.width,.25,.25]} color={P.woodDark} castShadow />
  <WorldLettering text="Galeria · blockout" subtitle="UnAPI · processo · Jarvis" position={[0,3.8/S,-g.depth/2+.15]} width={6/S} />
  {[{name:"UnAPI",point:GALLERY_USE.unapi,color:P.sage},{name:"Jarvis",point:GALLERY_USE.jarvis,color:P.clay},{name:"Processo",point:GALLERY_USE.process,color:P.woodLight}].map(({name,point:[x,z],color})=><group key={name}>
   <Worktable position={[x,.13,z-1.5/S]} width={2.3/S} depth={1/S} height={1.05/S} />
   <WorldLettering text={name} subtitle="núcleo provisório" position={[x,2.35/S,z-2.1/S]} width={2.6/S} />
   <HouseBook position={[x,.13+1.18/S,z-1.5/S]} color={color} />
  </group>)}
 </Place>;
}
