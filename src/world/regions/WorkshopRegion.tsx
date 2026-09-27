"use client";

import { Place, Platform, Part, Solid, TimberPost, Worktable, NoticeBoard, WorldLettering, HousePlant, HouseBook, HouseCurve, PLACE_PALETTE as P } from "./places/PlaceObjects";
import { PLACE_LAYOUT } from "./places/place-layout";
import { WorkshopDetails } from "./workshop/WorkshopDetails";
import { WorkshopEnvelope } from "./workshop/WorkshopEnvelope";

export function WorkshopRegion() {
  return <Place name="WORKSHOP_REGION" {...PLACE_LAYOUT.workshop}>
    <Platform width={10.5} depth={7.5} />
    <Solid name="WORKSHOP_BACK_WALL" position={[0, 1.9, -3.55]} size={[10.5, 3.6, .24]} color={P.plasterShade} finish="plaster" />
    <Solid name="WORKSHOP_SHORT_WEST_WALL" position={[-5.13, 1.4, -1.5]} size={[.24, 2.5, 4.3]} color={P.plaster} finish="plaster" />
    {[-4.95, 4.95].map(x => <TimberPost key={x} x={x} z={-.45} height={4.05} />)}
    <WorkshopEnvelope />
    <WorldLettering text="Ateliê" subtitle="ideias em andamento" position={[.8, 3.03, -3.405]} width={2.5} />
    <Worktable position={[-.75, .13, -2.15]} width={6.2} depth={1.3} />
    <Solid name="WORKSHOP_CABINET" position={[3.85, 1, -2.6]} size={[1.52, 1.7, 1.4]} color={P.shutter} />
    {[.48, .95, 1.42].map(y => <group key={y}><Part name="CABINET_DRAWER" position={[3.85, y, -1.89]} size={[1.32, .37, .055]} color={P.sage} /><Part name="DRAWER_HANDLE" position={[3.85, y, -1.84]} size={[.33, .035, .08]} color={P.iron} finish="metal" /></group>)}
    <NoticeBoard position={[-3.1, 2.75, -3.38]} title="Experimentos" />
    <Part name="WORKSHOP_MONITOR" position={[.35, 2.05, -2.42]} size={[1.44, .85, .13]} color={P.ink} castShadow />
    <Part name="WORKSHOP_SCREEN" position={[.35, 2.075, -2.347]} size={[1.27, .66, .013]} color={P.glass} />
    <Part name="WORKSHOP_MONITOR_STAND" position={[.35, 1.56, -2.42]} size={[.12, .3, .1]} color={P.iron} />
    <Part name="WORKSHOP_KEYBOARD" position={[.35, 1.51, -1.82]} size={[1.1, .05, .3]} color={P.paper} />
    <HouseBook position={[-1.9, 1.54, -2.04]} rotation={[0, .17, 0]} color={P.clay} />
    <HouseBook position={[-1.94, 1.69, -2.03]} rotation={[0, -.08, 0]} color={P.sage} size={[.54, .11, .73]} />
    <Part name="PROTOTYPE_CIRCUIT_BOARD" position={[1.71, 1.515, -2.09]} size={[.88, .06, .65]} color={P.shutter} />
    {[0, 1, 2].map(i => <Part key={i} name="CIRCUIT_COMPONENT" position={[1.43 + i * .25, 1.57, -2.12]} size={[.15, .07, .22]} color={P.ink} />)}
    <HouseCurve name="PROTOTYPE_WIRING" points={[[1.47, 1.61, -2.05], [1.55, 1.79, -1.95], [1.85, 1.7, -2.05], [1.96, 1.59, -2.24]]} color={P.clay} radius={.018} />
    <Worktable position={[-2.35, .13, 1.2]} width={2.9} depth={1.7} height={1.15} />
    <Part name="WORKSHOP_CUTTING_MAT" position={[-2.35, 1.367, 1.2]} size={[1.9, .018, 1.2]} color={P.shutter} radius={.008} />
    <Part name="MODEL_HOUSE_BASE" position={[-2.65, 1.54, 1.03]} size={[.55, .36, .52]} color={P.plaster} />
    <Part name="MODEL_HOUSE_ROOF" position={[-2.65, 1.74, 1.03]} size={[.65, .065, .63]} color={P.roof} rotation={[.12, 0, 0]} />
    <Part name="WORKSHOP_RULER" position={[-1.78, 1.385, 1.26]} size={[.07, .01, .85]} color={P.brass} rotation={[0, -.13, 0]} />
    <Solid name="WORKSHOP_STOOL" position={[-2.25, .47, 2.64]} size={[.6, .7, .6]} color={P.wood} />
    <HousePlant position={[4.25, .13, 2.6]} scale={2.2} />
    <Part name="WORKSHOP_ROLLED_CANVAS" position={[-4.7, .75, -2.5]} size={[.32, 1.25, .28]} color={P.canvas} finish="fabric" rotation={[0, 0, -.2]} radius={.12} />
    <WorkshopDetails />
  </Place>;
}
