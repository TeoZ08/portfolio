"use client";
import { Place, Part, Solid, Worktable, WorldLettering, HouseBook, HouseInstances } from './places/PlaceObjects';
import { WorldMaterial } from "../materials/WorldMaterial";
import { PLAN } from './masterplan-layout';
import { FIELD_SCALE as S } from './world-scale';
import { GALLERY_ARTWORKS } from '@/content/gallery';
import { FramedProjectArtwork } from './gallery/FramedProjectArtwork';
import { GALLERY_WALLS, GALLERY_ENVELOPE as G } from './workshop/gallery-layout';
import type { FieldInstance } from './field/field-geometry';

// Gallery-local physical units. World placement stays exactly on the approved plan.

const floorSeams:FieldInstance[]=Array.from({length:6},(_,i)=>({position:[0,.135,(i*1.5-3.75)/S],scale:[13.6/S,.009,.018/S],color:'#c6c2b4'}));
export function WorkshopRegion() {
  return <Place name="ATELIER_GALLERY_V1" {...PLAN.gallery}>
    <Solid name="GALLERY_MINERAL_PLINTH" position={[0,-.095,0]} size={[14/S,.45,9/S]} color="#c9c8b9" finish="stone" />
    <HouseInstances name="GALLERY_FLOOR_JOINTS" instances={floorSeams} finish="stone" />
    {GALLERY_WALLS.map(w=><Solid key={w.name} name={w.name} position={w.position.map(v=>v/S) as [number,number,number]} size={w.size.map(v=>v/S) as [number,number,number]} color="#ece9de" finish="plaster" />)}
    {/* One high shelter, supported by real walls and entry piers. No exposed
        pergola or low transverse beam between the player and the artworks. */}
    <Part name="GALLERY_HIGH_SHELTER" position={[0,(G.roofBottom+.09)/S,0]} size={[14.5/S,.18/S,9.5/S]} color="#748277" finish="metal" castShadow />
    <Part name="GALLERY_CEILING" position={[0,(G.roofBottom-.03)/S,0]} size={[14.1/S,.045/S,9.1/S]} color="#e0dccd" finish="plaster" />
    <Part name="GALLERY_REAR_TOP_PLATE" position={[0,4.55/S,-4.5/S]} size={[14.2/S,.2/S,.3/S]} color="#92785b" />
    {[-1,1].map(side=><Part key={side} name="GALLERY_SIDE_TOP_PLATE" position={[side*7/S,4.55/S,0]} size={[.3/S,.2/S,9.15/S]} color="#92785b" />)}
    <pointLight name="GALLERY_LOCAL_EXHIBITION_FILL" position={[0,3.6/S,-1.8/S]} intensity={18} distance={13} decay={2} color="#ffefd2" />
    <Part name="GALLERY_ENTRY_HIGH_FASCIA" position={[0,4.58/S,4.65/S]} size={[14.5/S,.2/S,.18/S]} color="#82664b" castShadow />
    {[-1,1].map(side=><Solid key={side} name="GALLERY_ENTRY_PIER" position={[side*3.72/S,2.375/S,4.5/S]} size={[.24/S,4.55/S,.27/S]} color="#92785b" />)}
    <WorldLettering compact text="Ateliê / Galeria" subtitle="Obras e experimentos" position={[-5.35/S,2.1/S,4.65/S]} width={2.8/S} />
    {/* A wide, low stone threshold links the existing route to the gallery floor. */}
    <Solid name="GALLERY_ENTRY_THRESHOLD" position={[0,-.005/S,4.88/S]} size={[7.2/S,.11/S,.85/S]} color="#b6b5a6" finish="stone" />
    {GALLERY_ARTWORKS.map(a=><FramedProjectArtwork key={a.id} artwork={a} />)}
    {/* One process desk; the wings stay free of identical furniture and colliders. */}
    <Worktable position={[0,.13,-3.25/S]} width={3/S} depth={.8/S} height={1/S} />
    <WorldLettering compact text="Processo" subtitle="Luz, materiais e volume" position={[0,1.75/S,-4.31/S]} width={2.8/S} />
    <HouseBook position={[-1/S,1.12/S,-3.3/S]} color="#738a79" />
    <Part name="PROCESS_SKETCH_SHEET" position={[.38/S,1.15/S,-3.22/S]} size={[1.02/S,.018/S,.53/S]} color="#f4f0e4" finish="paper" rotation={[0,.08,0]} />
    <Part name="PROCESS_SCALE_STUDY_BASE" position={[.35/S,1.19/S,-3.25/S]} size={[.72/S,.07/S,.4/S]} color="#b8ad95" />
    <Part name="PROCESS_SCALE_STUDY_WALL" position={[.15/S,1.35/S,-3.37/S]} size={[.12/S,.3/S,.3/S]} color="#e7e2d5" finish="plaster" />
    <Part name="PROCESS_SCALE_STUDY_CANOPY" position={[.39/S,1.5/S,-3.35/S]} size={[.68/S,.04/S,.34/S]} color="#a78660" />
    <Part name="PROCESS_TASK_LAMP_BASE" position={[1.05/S,1.15/S,-3.3/S]} size={[.28/S,.045/S,.2/S]} color="#4d625b" finish="metal" />
    <Part name="PROCESS_TASK_LAMP_STEM" position={[1.05/S,1.43/S,-3.38/S]} size={[.045/S,.58/S,.045/S]} color="#4d625b" finish="metal" />
    <mesh name="PROCESS_TASK_LAMP_SHADE" position={[.99/S,1.72/S,-3.31/S]} rotation={[.1,0,-.25]} castShadow><coneGeometry args={[.18/S,.16/S,8]} /><WorldMaterial color="#647c71" finish="metal" /></mesh>
  </Place>;
}
