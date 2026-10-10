"use client";
import { Place, Part, Solid, Worktable, WorldLettering, HouseBook, HouseInstances } from './places/PlaceObjects';
import { PLAN } from './masterplan-layout';
import { FIELD_SCALE as S } from './world-scale';
import { GALLERY_ARTWORKS } from '@/content/gallery';
import { FramedProjectArtwork } from './gallery/FramedProjectArtwork';
import type { FieldInstance } from './field/field-geometry';

// Gallery-local physical units. World placement stays exactly on the approved plan.
const slats:FieldInstance[]=Array.from({length:18},(_,i)=>({position:[(-6.5+i*.51)/S,3.83/S,3.25/S],scale:[.08/S,.14/S,2.25/S],color:'#a78764'}));
const floorSeams:FieldInstance[]=Array.from({length:6},(_,i)=>({position:[0,.135,(i*1.5-3.75)/S],scale:[13.6/S,.009,.018/S],color:'#c6c2b4'}));
export function WorkshopRegion() {
  return <Place name="ATELIER_GALLERY_V1" {...PLAN.gallery}>
    <Solid name="GALLERY_MINERAL_PLINTH" position={[0,.035,0]} size={[14/S,.19,9/S]} color="#dad7cb" finish="plaster" />
    <HouseInstances name="GALLERY_FLOOR_JOINTS" instances={floorSeams} finish="plaster" />
    <Solid name="GALLERY_EXHIBITION_WALL" position={[0,1.87/S,-4.5/S]} size={[14/S,3.55/S,.23/S]} color="#ece9de" finish="plaster" />
    {[-1,1].map(side=><Solid key={side} name="GALLERY_RETURN_WALL" position={[side*7/S,1.75/S,-1.8/S]} size={[.22/S,3.3/S,5.4/S]} color={side<0?'#e5e2d6':'#d4dedb'} finish="plaster" />)}
    <Part name="GALLERY_REAR_CANOPY" position={[0,3.85/S,-4/S]} size={[14.35/S,.18/S,1.35/S]} color="#8c6d50" castShadow />
    {/* Offset timber porch and a single mineral blade give an asymmetric front. */}
    <Solid name="GALLERY_ENTRY_BLADE" position={[-6.45/S,1.94/S,3.6/S]} size={[1.05/S,3.7/S,.3/S]} color="#eeebe1" finish="plaster" />
    <Part name="GALLERY_OFFSET_FASCIA" position={[-2.15/S,3.9/S,4.23/S]} size={[9.6/S,.28/S,.36/S]} color="#84664a" castShadow />
    <Part name="GALLERY_PORCH_HEADER" position={[-2.15/S,3.9/S,2.12/S]} size={[9.6/S,.2/S,.22/S]} color="#a18260" castShadow />
    <HouseInstances name="GALLERY_OPEN_TIMBER_LOUVRES" instances={slats} />
    {[[-6.5,3.9],[2.4,4.0]].map(([x,z],i)=><Solid key={i} name="GALLERY_PORCH_POST" position={[x/S,1.92/S,z/S]} size={[.19/S,3.65/S,.19/S]} color="#9f7e5b" />)}
    <WorldLettering compact text="Ateliê / Galeria" subtitle="Obras e experimentos" position={[-2.25/S,3.91/S,4.43/S]} width={2.2/S} />
    {GALLERY_ARTWORKS.map(a=><FramedProjectArtwork key={a.id} artwork={a} />)}
    {/* One process desk; the wings stay free of identical furniture and colliders. */}
    <Worktable position={[0,.13,-3.25/S]} width={3/S} depth={.8/S} height={1/S} />
    <WorldLettering compact text="Processo" subtitle="Luz, materiais e volume" position={[0,1.75/S,-4.31/S]} width={2.8/S} />
    <HouseBook position={[-1/S,1.12/S,-3.3/S]} color="#738a79" />
    <Part name="PROCESS_SKETCH_SHEET" position={[.38/S,1.15/S,-3.22/S]} size={[1.02/S,.018/S,.53/S]} color="#f4f0e4" finish="paper" rotation={[0,.08,0]} />
    <Part name="PROCESS_SCALE_STUDY_BASE" position={[.35/S,1.19/S,-3.25/S]} size={[.72/S,.07/S,.4/S]} color="#b8ad95" />
    <Part name="PROCESS_SCALE_STUDY_WALL" position={[.15/S,1.35/S,-3.37/S]} size={[.12/S,.3/S,.3/S]} color="#e7e2d5" finish="plaster" />
    <Part name="PROCESS_SCALE_STUDY_CANOPY" position={[.39/S,1.5/S,-3.35/S]} size={[.68/S,.04/S,.34/S]} color="#a78660" />
    <Part name="PROCESS_TASK_LAMP_BASE" position={[1.05/S,1.15/S,-3.3/S]} size={[.28/S,.045/S,.2/S]} color="#4d625b" />
    <Part name="PROCESS_TASK_LAMP_STEM" position={[1.05/S,1.43/S,-3.38/S]} size={[.045/S,.58/S,.045/S]} color="#4d625b" />
    <mesh name="PROCESS_TASK_LAMP_SHADE" position={[.99/S,1.72/S,-3.31/S]} rotation={[.1,0,-.25]} castShadow><coneGeometry args={[.18/S,.16/S,8]} /><meshStandardMaterial color="#647c71" roughness={1} /></mesh>
  </Place>;
}
