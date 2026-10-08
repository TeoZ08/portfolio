"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { HouseBlockout as Part, HouseInstances } from "../house/HouseBlockout";
import { HouseMaterial, type HouseFinish } from "../house/HouseMaterial";
import { HouseBook, HousePlant, HouseCurve } from "../house/HouseObjects";
import { surfaceHeight } from "../field/field-layout";
import type { FieldInstance } from "../field/field-geometry";
import { FIELD_PALETTE } from "../field/field-palette";

export const PLACE_PALETTE = {
  ...FIELD_PALETTE, paper: "#e6ddc6", ink: "#414d43", brass: "#a9996c",
  canvas: "#d7c79e", sage: "#7b8974", clay: "#af765a", chalk: "#d1d9bb",
  mat: "#b4b18a", matDark: "#848e70", iron: "#515650",
};
const P = PLACE_PALETTE;
export { Part, HouseBook, HousePlant, HouseCurve, HouseInstances };

export function Place({ name, x, z, yaw = 0, children }: {
  name: string; x: number; z: number; yaw?: number; children: ReactNode;
}) {
  return <group name={name} position={[x, surfaceHeight(x, z), z]} rotation={[0, yaw, 0]}>{children}</group>;
}

export function Solid({ name, position, size, color = P.wood, visual = true, finish = "wood" }: {
  name: string; position: [number, number, number]; size: [number, number, number]; color?: string; visual?: boolean; finish?: HouseFinish;
}) {
  return <RigidBody type="fixed" colliders={false} name={name} position={position}>
    <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
    {visual && <Part name={`${name}_SURFACE`} position={[0, 0, 0]} size={size} color={color} finish={finish} castShadow />}
  </RigidBody>;
}

export function Platform({ width, depth, color = P.stoneLight }: { width: number; depth: number; color?: string }) {
  const stones: FieldInstance[] = [];
  for (let x = -width / 2; x < width / 2; x += 1.2) for (let z = -depth / 2; z < depth / 2; z += 1.15) {
    const w = Math.min(1.2, width / 2 - x), d = Math.min(1.15, depth / 2 - z);
    stones.push({ position: [x + w / 2, 0.112, z + d / 2], scale: [w - .02, .035, d - .025], color: (Math.round(x * 4 + z * 3) % 3) ? color : P.stone });
  }
  return <><Solid name="PLACE_GROUND_PLINTH" position={[0, -.1, 0]} size={[width, .4, depth]} color={P.stoneShade} />
    <HouseInstances name="PLACE_STONE_PAVING" instances={stones} finish="plaster" />
    <Solid name="PLACE_LOW_FRONT_STEP" position={[0, .015, depth / 2 + .38]} size={[width * .55, .17, .8]} color={color} /></>;
}

export function TimberPost({ x, z, height = 3.65 }: { x: number; z: number; height?: number }) {
  return <><Solid name="TIMBER_COLUMN" position={[x, height / 2, z]} size={[.19, height, .22]} />
    <Part name="COLUMN_STONE_FOOT" position={[x, .19, z]} size={[.31, .36, .33]} color={P.stoneShade} finish="plaster" />
    <Part name="COLUMN_TOP_JOINERY" position={[x, height - .06, z]} size={[.36, .2, .3]} color={P.woodDark} /></>;
}

export function Bench({ position, rotationY = 0, width = 3.2, back = true }: {
  position: [number, number, number]; rotationY?: number; width?: number; back?: boolean;
}) {
  return <group position={position} rotation={[0, rotationY, 0]} name="TIMBER_BENCH">
    <Solid name="BENCH_COLLIDER" position={[0, .4, 0]} size={[width, .8, .6]} visual={false} />
    {[-.22, 0, .22].map(z => <Part key={z} name="BENCH_WORN_SEAT_BOARD" position={[0, .74, z]} size={[width, .1, .2]} color={P.woodLight} radius={.045} castShadow />)}
    {[-1, 1].map(side => <group key={side}><Part name="BENCH_LEG" position={[side * (width / 2 - .35), .36, 0]} size={[.2, .72, .62]} color={P.woodDark} castShadow />{back && <Part name="BENCH_BACK_UPRIGHT" position={[side * (width / 2 - .35), .94, .33]} size={[.12, 1.1, .12]} color={P.wood} rotation={[.09, 0, 0]} />}</group>)}
    {back && [1.12, 1.36].map(y => <Part key={y} name="BENCH_BACK_BOARD" position={[0, y, .39]} size={[width, .2, .1]} color={P.woodLight} radius={.045} castShadow />)}
  </group>;
}

export function Worktable({ position, width = 3, depth = 1.3, height = 1.28 }: { position: [number, number, number]; width?: number; depth?: number; height?: number }) {
  return <group position={position} name="PLACE_WORKTABLE">
    <Solid name="WORKTABLE_COLLIDER" position={[0, height / 2, 0]} size={[width, height, depth]} visual={false} />
    <Part name="TABLE_TOP" position={[0, height, 0]} size={[width, .15, depth]} color={P.woodLight} radius={.04} castShadow />
    {[-1, 1].map(x => [-1, 1].map(z => <Part key={`${x}:${z}`} name="TABLE_LEG" position={[x * (width / 2 - .22), height / 2, z * (depth / 2 - .15)]} size={[.12, height, .14]} color={P.woodDark} castShadow />))}
    <Part name="TABLE_STRETCHER" position={[0, .29, 0]} size={[width - .35, .09, .09]} color={P.wood} />
  </group>;
}

export function WorldLettering({ text, subtitle = "", position, width = 2, rotationY = 0, dark = false }: {
  text: string; subtitle?: string; position: [number, number, number]; width?: number; rotationY?: number; dark?: boolean;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const image = document.createElement("canvas"); image.width = 768; image.height = 256;
    const ctx = image.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = dark ? P.ink : P.paper; ctx.fillRect(0, 0, 768, 256);
    ctx.strokeStyle = dark ? "#768775" : "#beb59a"; ctx.lineWidth = 2; ctx.strokeRect(18, 18, 732, 220);
    ctx.fillStyle = dark ? P.paper : P.ink; ctx.textAlign = "center";
    ctx.font = "500 68px Georgia, serif"; ctx.fillText(text, 384, subtitle ? 119 : 153, 680);
    if (subtitle) { ctx.font = "26px system-ui, sans-serif"; ctx.fillText(subtitle, 384, 178, 660); }
    setCanvas(image);
  }, [text, subtitle, dark]);
  return <mesh position={position} rotation={[0, rotationY, 0]} name="PHYSICAL_PLACE_LETTERING">
    <planeGeometry args={[width, width / 3]} />
    <meshStandardMaterial key={canvas ? "lettered" : "paper"} color={canvas ? "#ffffff" : P.paper} roughness={1}>
      {canvas && <canvasTexture attach="map" args={[canvas]} colorSpace="srgb" />}
    </meshStandardMaterial>
  </mesh>;
}

export function NoticeBoard({ position, title = "Anotações" }: { position: [number, number, number]; title?: string }) {
  return <group position={position}><Part name="NOTICE_BOARD_FRAME" position={[0, 0, 0]} size={[2.3, 1.62, .11]} color={P.wood} castShadow />
    <Part name="NOTICE_BOARD_CORK" position={[0, 0, .065]} size={[2.13, 1.45, .025]} color={P.path} />
    {[[-.62, -.14, .1], [.06, -.12, -.1], [.66, -.19, .07]].map(([x, y, rotation], i) => <group key={i} position={[x, y, .09]} rotation={[0, 0, rotation]}>
      <Part name="PINNED_PAPER" position={[0, 0, 0]} size={[.47, .64, .008]} color={P.paper} finish="paper" radius={.004} />
      <Part name="PAPER_TAPE" position={[0, .32, .009]} size={[.18, .07, .008]} color={P.canvas} finish="paper" radius={.002} />
      {[0, 1, 2, 3].map(line => <Part key={line} name="PAPER_HANDWRITING" position={[-.018, .15 - line * .095, .009]} size={[.29 - (line % 2) * .07, .012, .002]} color={P.sage} finish="paper" radius={0} />)}
    </group>)}
    <WorldLettering text={title} position={[0, .49, .09]} width={1.55} />
  </group>;
}

export function RoofStrip({ width, depth, y, z, color = P.roofShade }: { width: number; depth: number; y: number; z: number; color?: string }) {
  return <group name="REAR_CANOPY" position={[0, y, z]} rotation={[-.1, 0, 0]}>
    <Part name="CANOPY_TIMBER_FASCIA" position={[0, -.08, depth / 2]} size={[width + .18, .2, .2]} color={P.woodDark} castShadow />
    <Part name="CANOPY_SURFACE" position={[0, 0, 0]} size={[width, .12, depth]} color={color} castShadow />
    {Array.from({ length: Math.floor(width / .58) }, (_, i) => <Part key={i} name="ROOF_STANDING_SEAM" position={[-width / 2 + (i + .5) * .58, .071, 0]} size={[.026, .018, depth]} color={P.woodDark} radius={.01} />)}
  </group>;
}
