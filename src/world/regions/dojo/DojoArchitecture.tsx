"use client";

import { HouseMaterial } from "../house/HouseMaterial";
import { Part, Solid, WorldLettering, PLACE_PALETTE as P } from "../places/PlaceObjects";

const FRONT_COLUMNS = [-5.25, -3.15, -1.05, 1.05, 3.15, 5.25] as const;

function PaintedBracket({ x }: { x: number }) {
  return <group position={[x, 3.83, 3.16]} name="SONGAHM_PAINTED_BRACKET">
    <Part name="BRACKET_JADE_BLOCK" position={[0, 0, 0]} size={[.55, .18, .44]} color={P.songahmJade} />
    <Part name="BRACKET_TEAL_ARM" position={[0, .19, -.12]} size={[.82, .13, .3]} color={P.songahmTeal} />
    <Part name="BRACKET_CREAM_PIN" position={[0, .2, .055]} size={[.12, .12, .07]} color={P.songahmCream} radius={.025} />
    <Part name="BRACKET_TIMBER_KNEE" position={[0, -.24, -.13]} size={[.13, .62, .16]}
      rotation={[0, 0, x < 0 ? -.55 : .55]} color={P.songahmTimber} />
  </group>;
}

function HangingLantern({ x }: { x: number }) {
  return <group position={[x, 3.22, 3.42]} name="SONGAHM_WARM_HANGING_LANTERN">
    <Part name="LANTERN_HANGER" position={[0, .31, 0]} size={[.035, .62, .035]} color={P.iron} finish="metal" />
    <Part name="LANTERN_TOP" position={[0, .03, 0]} size={[.34, .09, .3]} color={P.songahmRoof} radius={.03} />
    <mesh position={[0, -.19, 0]} castShadow>
      <cylinderGeometry args={[.18, .22, .42, 6]} />
      <meshStandardMaterial color={P.songahmCream} emissive={P.songahmLantern} emissiveIntensity={.72} roughness={.9} />
    </mesh>
    <Part name="LANTERN_BASE" position={[0, -.42, 0]} size={[.29, .08, .26]} color={P.songahmRoof} radius={.025} />
  </group>;
}

function RoofHalf({ z, rear = false }: { z: number; rear?: boolean }) {
  const tilt = rear ? -.145 : .145;
  return <group position={[0, rear ? 4.57 : 4.62, z]} rotation={[tilt, 0, 0]} name={rear ? "SONGAHM_REAR_ROOF_SLOPE" : "SONGAHM_FRONT_ROOF_SLOPE"}>
    <Part name="ROOF_MAIN_PLANE" position={[0, 0, 0]} size={[11.3, .16, 4.8]} color={P.songahmRoof} castShadow />
    <Part name="ROOF_LEFT_LIFTED_WING" position={[-6.05, .06, 0]} size={[1.25, .16, 4.8]}
      rotation={[0, 0, -.11]} color={P.songahmRoof} castShadow />
    <Part name="ROOF_RIGHT_LIFTED_WING" position={[6.05, .06, 0]} size={[1.25, .16, 4.8]}
      rotation={[0, 0, .11]} color={P.songahmRoof} castShadow />
    <Part name="ROOF_EAVE_FASCIA" position={[0, -.08, rear ? -2.34 : 2.34]} size={[13.5, .2, .22]} color={P.songahmTimber} castShadow />
    {[-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4].map(x =>
      <Part key={x} name="ROOF_VISIBLE_RAFTER" position={[x, -.13, rear ? -2.18 : 2.18]}
        size={[.08, .12, .62]} color={P.songahmCream} />)}
  </group>;
}

function RearGableLayer() {
  return <group name="SONGAHM_REAR_GABLE_LAYER" position={[0, .18, -3.15]}>
    <Part name="REAR_GABLE_BEAM" position={[0, 4.02, 0]} size={[9.5, .19, .26]} color={P.songahmTimber} castShadow />
    <group position={[0, 4.75, -.18]}>
      <Part name="REAR_GABLE_LEFT_SLOPE" position={[-2.35, 0, 0]} size={[5.25, .16, 2.5]}
        rotation={[0, 0, .18]} color={P.songahmRoof} castShadow />
      <Part name="REAR_GABLE_RIGHT_SLOPE" position={[2.35, 0, 0]} size={[5.25, .16, 2.5]}
        rotation={[0, 0, -.18]} color={P.songahmRoof} castShadow />
      <Part name="REAR_GABLE_RIDGE" position={[0, .46, 0]} size={[.34, .3, 2.68]} color={P.songahmTimber} radius={.08} />
    </group>
  </group>;
}

function ForecourtPine({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale} name="SONGAHM_FORECOURT_PINE">
    <mesh position={[0, 1.55, 0]} castShadow><cylinderGeometry args={[.11, .18, 3.1, 7]} /><HouseMaterial color={P.woodDark} /></mesh>
    {[[2.15, 1.05, .9], [2.85, .82, .75], [3.45, .58, .62], [3.95, .34, .45]].map(([y, radius, height]) =>
      <mesh key={y} position={[0, y, 0]} castShadow><coneGeometry args={[radius, height, 7]} /><HouseMaterial color={P.foliageShade} /></mesh>)}
  </group>;
}

function SongahmForecourt() {
  return <group name="SONGAHM_COMPOSED_FORECOURT">
    {[[-.26, 6.72, .78, .52], [.18, 7.57, .72, .46], [-.14, 8.38, .67, .42]].map(([x, z, sx, sz], index) =>
      <Part key={z} name={`FORECOURT_STEPPING_STONE_${index + 1}`} position={[x, .07, z]}
        size={[sx, .12, sz]} color={index % 2 ? P.stoneLight : P.stone} finish="plaster" radius={.12} />)}
    <group name="ABSTRACT_STACKED_STONE_MARKER" position={[-6.15, .05, 6.1]}>
      <Part name="MARKER_BASE" position={[0, .18, 0]} size={[1.05, .34, .88]} color={P.stoneShade} finish="plaster" radius={.12} />
      <Part name="MARKER_PEDESTAL" position={[0, .65, 0]} size={[.48, .72, .45]} color={P.stone} finish="plaster" radius={.08} />
      <Part name="MARKER_LIGHT_BOX" position={[0, 1.16, 0]} size={[.7, .42, .61]} color={P.stoneLight} finish="plaster" radius={.08} />
      <Part name="MARKER_CAP" position={[0, 1.47, 0]} size={[1.04, .16, .92]} color={P.stoneShade} finish="plaster" radius={.08} />
      <mesh position={[0, 1.68, 0]}><coneGeometry args={[.62, .34, 4]} /><HouseMaterial color={P.songahmRoof} /></mesh>
    </group>
    <group name="SHALLOW_REFLECTING_BASIN" position={[6.05, .12, 6.02]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[.62, .14, 8, 24]} /><HouseMaterial color={P.stoneShade} finish="plaster" /></mesh>
      <mesh position={[0, .025, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.54, 24]} />
        <meshStandardMaterial color={P.glass} roughness={.32} metalness={0} /></mesh>
      <Part name="BASIN_LOW_PEDESTAL" position={[0, -.16, 0]} size={[.74, .28, .74]} color={P.stone} finish="plaster" radius={.18} />
    </group>
    <ForecourtPine position={[-7.25, 0, 2.5]} scale={1.02} />
    <ForecourtPine position={[7.45, 0, 2.25]} scale={.94} />
    <ForecourtPine position={[-7.65, 0, -2.65]} scale={.78} />
    {[[-4.15, 6.5], [4.2, 6.42]].map(([x, z]) => <group key={x} position={[x, .14, z]} name="FORECOURT_WARM_PATH_ACCENT">
      <Part name="PATH_LIGHT_STONE" position={[0, .16, 0]} size={[.28, .32, .28]} color={P.stoneShade} radius={.06} />
      <mesh position={[0, .39, 0]}><sphereGeometry args={[.1, 10, 6]} />
        <meshStandardMaterial color={P.songahmCream} emissive={P.songahmLantern} emissiveIntensity={.8} roughness={1} /></mesh>
    </group>)}
  </group>;
}

export function DojoArchitecture() {
  return <group name="SONGAHM_RAISED_PAVILION_ARCHITECTURE">
    <Solid name="SONGAHM_TERRACE_COLLIDER" position={[0, .2, 0]} size={[13.2, .4, 9.4]} color={P.stoneShade} finish="plaster" />
    <Part name="SONGAHM_TERRACE_CAP" position={[0, .415, 0]} size={[13.35, .07, 9.55]} color={P.stoneLight} finish="plaster" radius={.04} />
    <Part name="SONGAHM_PRACTICE_FLOOR" position={[0, .445, 0]} size={[11.15, .06, 8.05]} color={P.woodLight} radius={.025} />
    <Solid name="SONGAHM_STAIR_LOWER_COLLIDER" position={[0, .07, 5.72]} size={[4.9, .14, 1]} color={P.stone} finish="plaster" />
    <Solid name="SONGAHM_STAIR_MIDDLE_COLLIDER" position={[0, .135, 5.28]} size={[4.65, .27, .9]} color={P.stoneLight} finish="plaster" />
    <Solid name="SONGAHM_STAIR_UPPER_COLLIDER" position={[0, .2, 4.85]} size={[4.4, .4, .86]} color={P.stone} finish="plaster" />
    {FRONT_COLUMNS.map(x => <group key={x} name="SONGAHM_FRONT_TIMBER_COLUMN">
      <Part name="COLUMN_STONE_BASE" position={[x, .58, 3.22]} size={[.42, .3, .44]} color={P.stoneShade} finish="plaster" radius={.04} />
      <Part name="RED_BROWN_COLUMN" position={[x, 2.18, 3.22]} size={[.24, 3.25, .27]} color={P.songahmTimber} castShadow />
      <PaintedBracket x={x} />
    </group>)}
    <Part name="SONGAHM_FRONT_LINTEL" position={[0, 3.92, 3.2]} size={[11.35, .28, .34]} color={P.songahmTimber} castShadow />
    <Part name="SONGAHM_JADE_JOINERY_BAND" position={[0, 4.12, 3.16]} size={[11.8, .12, .28]} color={P.songahmJade} />
    <Part name="SONGAHM_CREAM_JOINERY_LINE" position={[0, 4.24, 3.15]} size={[10.9, .055, .3]} color={P.songahmCream} />
    {[-5.25, 5.25].map(x => <Part key={x} name="SONGAHM_REAR_SUPPORT" position={[x, 2.25, -3.55]}
      size={[.24, 3.55, .27]} color={P.songahmTimber} castShadow />)}
    <group name="SONGAHM_PHYSICAL_SIGN" position={[0, 3.42, 3.39]}>
      <Part name="SIGN_TIMBER_FRAME" position={[0, 0, -.035]} size={[3.55, .92, .12]} color={P.songahmTimber} radius={.04} />
      <WorldLettering text="Songahm" subtitle="um lugar de prática" position={[0, 0, .035]} width={3.32} dark />
    </group>
    <HangingLantern x={-4.05} />
    <HangingLantern x={4.05} />
    <RoofHalf z={1.05} />
    <RoofHalf z={-3.05} rear />
    <Part name="SONGAHM_MAIN_ROOF_RIDGE" position={[0, 4.94, -1]} size={[13.35, .28, .34]} color={P.songahmTimber} radius={.1} />
    <RearGableLayer />
    <SongahmForecourt />
  </group>;
}
