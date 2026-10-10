"use client";

import { Place, Part, Solid, Bench, HouseCurve, HouseInstances, PLACE_PALETTE as P } from "./places/PlaceObjects";
import { SoftObject } from "./house/HouseObjects";
import { HouseMaterial } from "./house/HouseMaterial";
import type { FieldInstance } from "./field/field-geometry";
import { PLACE_LAYOUT } from "./places/place-layout";
import { DOJO as D } from "./dojo/dojo-layout";
import { DojoDetails } from "./dojo/DojoDetails";
import { DojoArchitecture } from "./dojo/DojoArchitecture";
import { SongahmScenery } from "./dojo/SongahmScenery";

const MATS: FieldInstance[] = Array.from({ length: 30 }, (_, i) => ({
  position: [-4.5 + i % 6 * 1.8, .159, -2.8 + Math.floor(i / 6) * 1.42],
  scale: [1.77, .068, 1.39], color: i % 6 === 0 || i % 6 === 5 || i < 6 ? P.matDark : P.mat,
}));

export function DojoRegion() {
  return <Place name="DOJO_REGION" {...PLACE_LAYOUT.dojo}>
    <SongahmScenery />
    <DojoArchitecture />
    <group name="DOJO_PRESERVED_TRAINING_SPACE" position={[0, .32, 0]}>
      <Solid name="DOJO_TATAMI_CONTINUOUS_COLLIDER" position={[0,(D.floor+D.terraceTop)/2-.32,D.tatamiZ]} size={[D.tatamiWidth,D.floor-D.terraceTop,D.tatamiDepth]} visual={false} />
      <HouseInstances name="DOJO_TATAMI_MATS" instances={MATS} finish="fabric" />
      <Solid name="DOJO_BACK_WALL" position={[0, 1.55, -3.87]} size={[11, 2.8, .24]} color={P.plaster} finish="plaster" />
      <Part name="DOJO_TIMBER_WAINSCOT" position={[0, .72, -3.73]} size={[10.9, 1.13, .055]} color={P.songahmTimber} />
      {[-4.8, -2.4, 0, 2.4, 4.8].map(x => <Part key={x} name="DOJO_WALL_TIMBER_JOINERY" position={[x, 1.6, -3.69]} size={[.13, 2.95, .13]} color={P.songahmTimber} castShadow />)}
      <Bench position={[-3.8, .13, 3.03]} width={2.8} back={false} />
      <group name="DOBOK_FOLDED_ON_BENCH" position={[-3.8, .98, 3.03]}>
        <SoftObject name="DOBOK_FOLDED_JACKET" position={[0, 0, 0]} size={[.88, .21, .62]} color={P.paper} />
        <Part name="DOBOK_COLLAR" position={[0, .107, -.1]} size={[.075, .025, .45]} rotation={[0, -.4, 0]} color={P.canvas} finish="fabric" />
        <Part name="DOBOK_SECOND_COLLAR" position={[.13, .106, -.1]} size={[.075, .025, .45]} rotation={[0, .4, 0]} color={P.canvas} finish="fabric" />
      </group>
      <Solid name="TRAINING_BAG_COLLIDER" position={[4.11, 1.29, -2.3]} size={[.72, 2.3, .72]} visual={false} />
      <mesh position={[4.11, 1.77, -2.3]} castShadow receiveShadow><capsuleGeometry args={[.31, 1.4, 8, 20]} /><HouseMaterial color={P.ink} finish="fabric" /></mesh>
      <HouseCurve name="TRAINING_BAG_SUSPENSION" points={[[4.11, 2.82, -2.3], [4.11, 3.73, -2.3]]} radius={.017} color={P.iron} />
      <Part name="TRAINING_BAG_STITCH" position={[4.11, 1.72, -1.986]} size={[.025, 1.35, .003]} color={P.sage} finish="fabric" radius={0} />
      <group name="KICKING_PADDLES_ON_WALL" position={[-3.63, 1.65, -3.61]} rotation={[0, 0, -.19]}>
        <SoftObject name="PADDLE_HEAD" position={[0, .23, 0]} size={[.39, .64, .15]} color={P.iron} />
        <Part name="PADDLE_HANDLE" position={[0, -.22, 0]} size={[.09, .38, .09]} color={P.woodDark} radius={.04} />
      </group>
      <Part name="TRAINING_MAT_EDGE" position={[0, .19, 3.25]} size={[10.82, .045, .1]} color={P.wood} radius={.018} />
      <DojoDetails />
    </group>
  </Place>;
}
