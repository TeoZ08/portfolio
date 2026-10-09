"use client";

import { FieldInstances } from "./field/FieldMeshes";
import { makeLeafSurface, makeSurface, organicEllipsoid, type FieldInstance } from "./field/field-geometry";
import { seededRandom, surfaceHeight } from "./field/field-layout";
import { tubeSurface } from "./house/house-geometry";
import { PLACE_PALETTE as P, Bench, Place } from "./places/PlaceObjects";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { authorPoint } from "./masterplan-layout";
import { FOREST_ANCHOR } from "./field/field-interaction-targets";
import { WindChime } from "./forest/WindChime";
import { FOREST_PALETTE as F } from "./forest/forest-dressing";

// Existing tree geometry reused; crowns flank the west transition and leave the axis clear.
const ANCHORS = [
 [-22,0,.95],[-24,-6,1.1],[-22,-12,.95],[-17,-12,.85],[-26,6,1.05],
 [-27,17,.9],[-28,-18,1.1],[-11,-12,.8],[-23,-22,1],[-30,-5,1.1],
 [30,18,.9],[32,-5,.8],
].map(([x,z,s])=>[...authorPoint(x,z),s] as const);
const random = seededRandom(20260919);
const LEAF = makeLeafSurface(), CANOPY = organicEllipsoid(16, 10, .14);
const vertices:number[]=[], triangles:number[]=[];
for(const branch of [
  [[0,0,0],[.06,1.5,.02],[-.13,2.9,.04],[.18,4.5,-.09],[.36,5.6,-.19]],
  [[-.1,2.3,0],[-.72,3.3,.13],[-1.64,4.22,.14],[-2.17,4.61,.25]],
  [[.12,3.4,0],[.98,4.15,.02],[1.62,4.79,-.1]],
  [[0,2.9,.01],[.35,3.72,1.1],[.68,4.55,1.5]],
] as const) {
  const data=tubeSurface(branch,branch.length===5?.19:.1,9), base=vertices.length/3;
  vertices.push(...data.positions);triangles.push(...Array.from(data.indices,i=>i+base));
}
const WOOD = makeSurface(vertices, triangles);
const trunks:FieldInstance[]=[], leaves:FieldInstance[]=[], shadows:FieldInstance[]=[], roots:FieldInstance[]=[];
for(const [index, [x,z,scale]] of ANCHORS.entries()) {
  const y=surfaceHeight(x,z), yaw=random()*6.28;
  const grove = x < -15;
  // Alternate spreading and upright silhouettes within the hand-placed grove.
  // Changes are in the authored crowns, not random placement across the field.
  const spread = index % 3 === 0 ? 1.32 : index % 3 === 1 ? .86 : 1.05;
  const height = index % 3 === 0 ? .9 : index % 3 === 1 ? 1.13 : 1;
  trunks.push({position:[x,y,z],scale:[scale*spread,scale*height,scale*spread],rotation:[0,yaw,0],color:P.wood});
  for(const [cx,cy,cz,rx,ry,rz] of [[-.9,4.55,.1,2,1.45,1.45],[1.18,5.1,-.2,1.85,1.25,1.4],[.25,5.83,0,1.7,1.25,1.5],[.5,4.75,1.28,1.48,1.2,1.5]]) {
    const px=x+(cx*Math.cos(yaw)+cz*Math.sin(yaw))*scale*spread, pz=z+(-cx*Math.sin(yaw)+cz*Math.cos(yaw))*scale*spread, py=y+cy*scale*height;
    shadows.push({position:[px,py,pz],scale:[rx*scale*spread,ry*scale*height,rz*scale*spread],color:P.foliage});
    for(let i=0;i<210;i++) {
      const a=random()*6.28, v=random()*2-1, ring=Math.sqrt(1-v*v), size=(.15+random()*.15)*scale;
      leaves.push({position:[px+Math.cos(a)*ring*rx*scale*spread,py+v*ry*scale*height,pz+Math.sin(a)*ring*rz*scale*spread],scale:[size,size,size*1.4],rotation:[random()*.9,a,random()*.9],color:grove?(i%5===0?F.canopyLight:i%3?F.canopy:F.canopyShade):(i%5===0?P.foliageLight:i%3?P.foliage:P.foliageShade)});
    }
  }
  roots.push({position:[x,y+.07,z],scale:[.62*scale,.2*scale,.55*scale],rotation:[0,yaw,0],color:P.soil});
}

export function ForestRegion() {
  return <group name="FOREST_COMPOSED_GROVES">
    <FieldInstances name="GROVE_BRANCHING_TRUNKS" data={WOOD} instances={trunks} castShadow />
    <FieldInstances name="GROVE_ROOT_FLARES" data={CANOPY} instances={roots} />
    <FieldInstances name="GROVE_CANOPY_SHADOWS" data={CANOPY} instances={shadows} castShadow shadowOnly />
    <FieldInstances name="GROVE_MATTE_LEAVES" data={LEAF} instances={leaves} doubleSided sway={.11} />
    <RigidBody type="fixed" colliders={false} name="GROVE_TRUNKS_COLLIDERS">
      {ANCHORS.map(([x,z,s])=><CylinderCollider key={`${x}:${z}`} args={[1.4*s,.23*s]} position={[x,surfaceHeight(x,z)+1.4*s,z]} />)}
    </RigidBody>
    <Place name="QUIET_FOREST_BENCH" {...FOREST_ANCHOR}><Bench position={[0,.03,0]} width={2.8} /></Place>
    <WindChime />
    {/* Detailed grove assets stay in their source files for Phase D, not this blockout. */}
  </group>;
}
