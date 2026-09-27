"use client";

import { Place, Platform, Part, TimberPost, Bench, Worktable, WorldLettering, HouseBook, HousePlant, NoticeBoard, HouseCurve, PLACE_PALETTE as P } from "./places/PlaceObjects";
import { PLACE_LAYOUT } from "./places/place-layout";
import { FieldGeometry } from "./field/FieldMeshes";
import { makeSurface } from "./field/field-geometry";
import { HouseMaterial } from "./house/HouseMaterial";
import { CommunityDetails } from "./community/CommunityDetails";

const clothVertices: number[] = [], clothTriangles: number[] = [];
for (let i = 0; i <= 20; i++) {
  const t = i / 20, sag = -.17 * Math.sin(t * Math.PI);
  clothVertices.push(-.56, sag, t * 3.8 - 1.9, .56, sag - .025 * Math.sin(t * 6.28), t * 3.8 - 1.9);
  if (i < 20) { const a = i * 2; clothTriangles.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
}
const CANVAS_SHADE = makeSurface(clothVertices, clothTriangles);

export function CommunityRegion() {
  return <Place name="COMMUNITY_GARDEN_REGION" {...PLACE_LAYOUT.community}>
    <Platform width={10} depth={8} color={P.pathLight} />
    {[-4.55, 4.55].map(x => [-3.45, 2.4].map(z => <TimberPost key={`${x}:${z}`} x={x} z={z} height={3.75} />))}
    {[-4.55, 4.55].map(x => <Part key={x} name="PERGOLA_SIDE_BEAM" position={[x, 3.78, -.5]} size={[.2, .2, 6.55]} color={P.woodDark} castShadow />)}
    {[-3.5, -.5, 2.45].map(z => <Part key={z} name="PERGOLA_CROSSBEAM" position={[0, 3.87, z]} size={[9.65, .18, .18]} color={P.wood} castShadow />)}
    {[-3.4, -1.7, 0, 1.7, 3.4].map((x, i) => <group key={x}>
      <mesh name="PERGOLA_CANVAS_SHADE" position={[x, 3.94, -1.7]} castShadow receiveShadow><FieldGeometry data={CANVAS_SHADE} /><HouseMaterial color={i % 2 ? P.canvas : P.paper} finish="fabric" side={2} /></mesh>
      <Part name="PERGOLA_CANVAS_HEM" position={[x, 3.85, .2]} size={[1.13, .2, .024]} color={P.canvas} finish="fabric" radius={.012} />
    </group>)}
    <Worktable position={[0, .13, -.65]} width={5.9} depth={1.9} height={.8} />
    <Bench position={[0, .13, .94]} width={5.25} back={false} /><Bench position={[0, .13, -2.27]} width={5.25} rotationY={Math.PI} back={false} />
    <HouseBook position={[-1.85, 1.05, -.53]} rotation={[0, .18, 0]} color={P.clay} size={[.73, .12, .83]} />
    <HouseBook position={[1.5, 1.05, -.41]} rotation={[0, -.13, 0]} color={P.sage} />
    {[-.55, .54].map((x, i) => <group key={x} position={[x, 1.026, -.58]} rotation={[0, i ? -.12 : .13, 0]}>
      <Part name="WORKSHOP_TABLET_CASE" position={[0, .023, 0]} size={[.55, .046, .73]} color={P.iron} radius={.032} />
      <Part name="WORKSHOP_TABLET_SCREEN" position={[0, .05, 0]} size={[.47, .005, .62]} color={P.glass} radius={.002} />
      <Part name="WORKSHOP_TABLET_HOME" position={[0, .05, .33]} size={[.055, .008, .027]} color={P.paper} radius={.01} />
    </group>)}
    <Part name="COMMUNITY_BOARD_POST" position={[3.67, 1.39, -3.32]} size={[.16, 2.65, .16]} color={P.wood} />
    <NoticeBoard position={[3.67, 2.28, -3.22]} title="Próximos encontros" />
    <WorldLettering text="Entre pessoas" subtitle="oficinas · comunidade" position={[-2.5, 2.55, -3.43]} width={3.1} />
    <Part name="COMMUNITY_SIGN_BACKING" position={[-2.5, 2.55, -3.48]} size={[3.23, 1.18, .12]} color={P.wood} castShadow />
    <HouseCurve name="COMMUNITY_NOTICE_CORD" points={[[-4.5, 3.3, -3.46], [-3, 3.12, -3.46], [-1.2, 3.14, -3.46], [0, 3.22, -3.46], [4.5, 3.3, -3.46]]} radius={.012} color={P.woodDark} />
    <HousePlant position={[-4.03, .13, 2.8]} scale={2.3} /><HousePlant position={[4.03, .13, 2.8]} scale={2.3} />
    <Bench position={[-3.2, .13, 3.13]} width={2.7} />
    <CommunityDetails />
  </Place>;
}
