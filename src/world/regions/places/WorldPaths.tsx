"use client";

import { FieldGeometry } from "../field/FieldMeshes";
import { FieldMaterial } from "../field/FieldMaterial";
import { makeSurface } from "../field/field-geometry";
import { surfaceHeight } from "../field/field-layout";
import { groundColor } from "../field/field-surfaces";
import { linearColor } from "../field/field-palette";
import { ROUTES, PLAN } from "../masterplan-layout";
import { PLACE_LAYOUT } from "./place-layout";
import { Place, Part, WorldLettering, PLACE_PALETTE as P } from "./PlaceObjects";

function makeBranches() {
  const vertices: number[] = [], triangles: number[] = [], colors: number[] = [];
  const dirt = linearColor(P.path);
  // One shared surface for every branch: overlapping ribbons would fight for
  // depth and paint green edges through the middle of path junctions.
  // This spacing subdivides the terrain grid, keeping the visual surface flush.
  const step = 1.25 / 4;
  const points = new Map<string, { x: number; z: number; distance: number; index: number }>();
  for (const route of ROUTES) {
    route.samples.forEach(([x,z], i)=>{
      const width=route.width/2*(1+.04*Math.sin(i*.1));
      const radius = width + step * 2;
      for (let gx = Math.floor((x-radius)/step); gx <= Math.ceil((x+radius)/step); gx++) {
        for (let gz = Math.floor((z-radius)/step); gz <= Math.ceil((z+radius)/step); gz++) {
          const distance = Math.hypot(gx*step-x, gz*step-z) / width;
          if (distance > 1.35) continue;
          const key = `${gx}:${gz}`, existing = points.get(key);
          if (existing) existing.distance = Math.min(existing.distance, distance);
          else points.set(key, { x: gx, z: gz, distance, index: points.size });
        }
      }
    });
  }
  // The lookout clearing belongs to this same surface, so the two arriving
  // paths do not overlap a second disk of dirt at the summit.
  const hill = PLACE_LAYOUT.hill;
  for (let gx = Math.floor((hill.x-6)/step); gx <= Math.ceil((hill.x+6)/step); gx++) {
    for (let gz = Math.floor((hill.z-3.7)/step); gz <= Math.ceil((hill.z+3.7)/step); gz++) {
      const radius = Math.hypot((gx*step-hill.x)/5.2, (gz*step-hill.z)/3.2);
      if (radius > 1.15) continue;
      const distance = Math.max(0, radius*2-1);
      const key = `${gx}:${gz}`, existing = points.get(key);
      if (existing) existing.distance = Math.min(existing.distance, distance);
      else points.set(key, { x: gx, z: gz, distance, index: points.size });
    }
  }
  for (const point of points.values()) {
    const x = point.x*step, z = point.z*step;
    vertices.push(x, surfaceHeight(x,z)+.032, z);
    const grass = groundColor(x,z);
    const edge = Math.min(1,Math.max(0,(point.distance-.4)/.6));
    // Grass-coloured clearings with intermittent wear: flow diagrams are not roads.
    const wear=(.18+.16*(.5+.5*Math.sin(x*.45+z*.32)))*(1-edge);
    colors.push(...grass.map((color,c)=>color*(1-wear)+dirt[c]*wear));
    const right = points.get(`${point.x+1}:${point.z}`);
    const next = points.get(`${point.x}:${point.z+1}`);
    const diagonal = points.get(`${point.x+1}:${point.z+1}`);
    if (right && next && diagonal) {
      triangles.push(point.index,next.index,right.index,right.index,next.index,diagonal.index);
    }
  }
  return makeSurface(vertices,triangles,colors);
}
const PATHS=makeBranches();

export function WorldPaths() {
  return <group name="WORLD_CONNECTING_PATHS">
    <mesh receiveShadow><FieldGeometry data={PATHS} /><FieldMaterial vertexColors side={2} /></mesh>
    <Place name="FIELD_HANDMADE_WAYFINDING" x={PLAN.plaza[0]-3.5} z={PLAN.plaza[1]+5} yaw={.25}>
      <Part name="SIGNPOST" position={[0, 1.02, 0]} size={[.18, 2.05, .2]} color={P.woodDark} castShadow />
      {[["← Casa", 1.75, -.06], ["Ateliê →", 1.22, .07], ["↑ Songahm", .69, -.04]].map(([text,y,angle])=><group key={String(text)} rotation={[0,0,Number(angle)]}>
        <Part name="WAYFINDING_TIMBER" position={[0,Number(y),.01]} size={[2.27,.47,.15]} color={P.woodLight} radius={.045} />
        <WorldLettering text={String(text)} position={[0,Number(y),.092]} width={1.98} />
      </group>)}
    </Place>
  </group>;
}
