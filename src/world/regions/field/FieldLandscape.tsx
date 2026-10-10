"use client";
import { FieldGeometry, FieldInstances } from './FieldMeshes';
import { makeSurface, organicEllipsoid } from './field-geometry';
import { makeLandscape, LANDSCAPE_TREES } from './landscape-layout';
const TERRAIN=makeLandscape(55,285,5);
const CROWN=organicEllipsoid(10,7,.10);
const trunk=makeSurface([-.1,0,-.1,.1,0,-.1,.1,2,.1,-.1,2,.1,-.1,0,.1,.1,0,.1,.1,2,-.1,-.1,2,-.1],[0,1,6,0,6,7,4,3,2,4,2,5,1,5,2,1,2,6,0,7,3,0,3,4]);
const WOOD=LANDSCAPE_TREES.map(t=>({...t,color:'#655441'}));
const CROWNS=[0,1,2].flatMap(l=>LANDSCAPE_TREES.map((t,i)=>{
 const broad=i%3!==0,offset=broad?(l-1)*t.scale[0]*.47:0;
 return {...t,position:[t.position[0]+offset,t.position[1]+t.scale[1]*(broad?2.05+Math.sin(l*2)*.22:1.6+l*.55),t.position[2]+(broad?Math.cos(l*2)*t.scale[2]*.3:0)] as const,
 scale:[t.scale[0]*(broad?.64:1-l*.23),t.scale[1]*(broad?.58:.46-l*.06),t.scale[2]*(broad?.65:.83-l*.19)] as const};
}));
export function FieldLandscape(){return <group name="FIELD_CONTINUOUS_WOODLAND_LANDSCAPE">
  <mesh name="FIELD_OUTER_CONTINUOUS_HEIGHTFIELD" receiveShadow><FieldGeometry data={TERRAIN}/><meshStandardMaterial vertexColors roughness={1}/></mesh>
  <FieldInstances name="FIELD_WOODLAND_TRUNKS" data={trunk} instances={WOOD}/>
  <FieldInstances name="FIELD_WOODLAND_CROWNS" data={CROWN} instances={CROWNS}/>
</group>;}
