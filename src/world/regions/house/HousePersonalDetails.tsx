"use client";

import type { FieldInstance, Point3 } from "../field/field-geometry";
import { HouseBlockout as Part, HouseInstances } from "./HouseBlockout";
import { HouseCurve, SoftObject } from "./HouseObjects";
import { HouseMaterial } from "./HouseMaterial";
import { HOUSE_PALETTE as P } from "./house-palette";

const SHELF_BOOKS: FieldInstance[] = [];
const SPINE_COLORS = [P.slate, P.linenShade, P.clay, P.ochre, P.linenLight, P.wood];
// A few authored groups; empty shelf intervals are deliberate.
for (const [shelf, start, count] of [[1.13, -1.3, 6], [2.05, -1.25, 4], [2.97, 0.22, 5]]) {
  for (let i = 0; i < count; i += 1) {
    const width = 0.13 + (i % 3) * 0.022;
    const height = shelf > 2.5 ? 0.28 + ((i * 3) % 5) * 0.025 : 0.49 + ((i * 3) % 5) * 0.06;
    const z = start + i * 0.19;
    const color = SPINE_COLORS[(i + Math.floor(shelf)) % SPINE_COLORS.length];
    SHELF_BOOKS.push({ position: [0, shelf + height / 2, z], scale: [0.73, height - 0.018, width - 0.018], color: P.paper });
    for (const side of [-1, 1]) SHELF_BOOKS.push({ position: [0, shelf + height / 2, z + side * width / 2],
      scale: [0.8, height, 0.018], color });
    SHELF_BOOKS.push({ position: [-0.4, shelf + height / 2, z], scale: [0.029, height, width], color });
    for (const band of [0.1, height - 0.11]) SHELF_BOOKS.push({ position: [-0.419, shelf + band, z],
      scale: [0.008, 0.018, width * 0.73], color: P.paperEdge });
  }
}

function Bookshelf() {
  return <group name="HOUSE_OPEN_BOOKSHELF" position={[7.1, 0, -2.15]}>
    {[-1, 1].flatMap(side => [-0.44, 0.44].map(x => <Part key={`${side}:${x}`} name="BOOKSHELF_OPEN_SIDE_POST" position={[x, 1.7, side * 1.61]}
      size={[0.13, 3.4, 0.12]} color={P.wood} radius={0.045} castShadow />))}
    {[0.22, 1.08, 2, 2.92, 3.42].map(y => <Part key={y} name="BOOKSHELF_OPEN_SHELF" position={[0, y, 0]}
      size={[1.1, 0.1, 3.32]} color={P.woodLight} radius={0.035} castShadow />)}
    <HouseInstances name="BOOKSHELF_BOOKS_AND_BINDINGS" instances={SHELF_BOOKS} finish="paper" />
    <Part name="BOOKSHELF_CANVAS_ARCHIVE_BOX" position={[0.02, 1.37, 0.92]} size={[0.86, 0.51, 0.85]} color={P.canvas} finish="fabric" radius={0.065} />
    <Part name="ARCHIVE_BOX_LID" position={[0.02, 1.63, 0.92]} size={[0.89, 0.063, 0.88]} color={P.linenShade} finish="fabric" radius={0.03} />
    <Part name="ARCHIVE_BOX_PAPER_TAB" position={[-0.418, 1.41, 0.92]} size={[0.01, 0.11, 0.24]} color={P.paper} finish="paper" radius={0.004} />
    <Part name="STACK_OF_LANGUAGE_CARDS" position={[-0.15, 2.13, 0.26]} size={[0.6, 0.15, 0.58]} color={P.paper} finish="paper" radius={0.014} />
    {[P.slate, P.clay, P.ochre].map((color, i) => <Part key={color} name="LANGUAGE_CARD_DIVIDER"
      position={[-0.21, 2.2 + i * 0.018, 0.07 + i * 0.13]} size={[0.53, 0.014, 0.085]} color={color} finish="paper" radius={0.005} />)}
    <Part name="FOLDED_TRAINING_JACKET" position={[0.02, 0.42, -0.58]} size={[0.86, 0.31, 1.03]} color={P.linenLight} finish="fabric" radius={0.14} />
    {[-1, 1].map(side => <Part key={side} name="TRAINING_JACKET_FOLDED_LAPEL" position={[side * 0.12 - 0.19, 0.585, -0.79]}
      size={[0.12, 0.02, 0.43]} rotation={[0, side * -0.46, 0]} color={P.paper} finish="fabric" radius={0.009} />)}
    <group name="TAEKWONDO_TRAINING_PADDLE_STORED" position={[-0.07, 0.33, 0.88]} rotation={[0.05, -0.15, 0.12]}>
      <SoftObject name="TRAINING_PADDLE_PAD" position={[0, 0.4, 0]} size={[0.18, 0.65, 0.39]} color={P.ink} finish="paint" />
      <SoftObject name="TRAINING_PADDLE_SECOND_PAD" position={[0.085, 0.4, 0.016]} size={[0.1, 0.6, 0.35]} color={P.clay} finish="paint" />
      <Part name="TRAINING_PADDLE_HANDLE" position={[0.03, 0.02, 0]} size={[0.12, 0.34, 0.12]} color={P.woodDark} finish="fabric" radius={0.05} />
    </group>
  </group>;
}

function ReferenceBoard() {
  return <group name="HOUSE_STUDY_REFERENCE_BOARD" position={[0, 2.72, -5.985]}>
    <Part name="BOARD_OAK_FRAME" position={[0, 0, 0]} size={[3.4, 1.94, 0.14]} color={P.woodLight} radius={0.05} />
    <Part name="BOARD_CORK" position={[0, 0, 0.083]} size={[3.17, 1.71, 0.035]} color={P.cork} finish="plaster" radius={0.015} />
    {[[-1.06, 0.26, -0.045], [-0.25, 0.21, 0.05], [0.67, -0.23, -0.07]].map(([x, y, tilt], i) =>
      <group key={i} position={[x, y, 0.12]} rotation={[0, 0, tilt]}>
        <Part name="BOARD_PINNED_PAGE" position={[0, 0, 0]} size={[i === 1 ? 0.77 : 0.63, 0.93, 0.012]} color={P.paper} finish="paper" radius={0.004} />
        <Part name="BOARD_PAPER_TAPE" position={[0.04, 0.46, 0.01]} size={[0.2, 0.12, 0.007]} color={P.linenLight} finish="paper" radius={0.003} />
        {i === 1 ? <>
          <HouseCurve name="COURSE_NETWORK_SKETCH" points={[[-0.19, 0.17, 0.012], [0.15, 0.05, 0.012], [-0.09, -0.22, 0.012], [-0.19, 0.17, 0.012]]}
            radius={0.009} color={P.slate} finish="paper" />
          {[[-0.19, 0.17], [0.15, 0.05], [-0.09, -0.22]].map(([nx, ny], j) => <Part key={j} name="SKETCH_NODE"
            position={[nx, ny, 0.014]} size={[0.07, 0.06, 0.012]} color={P.ink} finish="paper" radius={0.005} />)}
        </> : <>
          {[0.17, 0.02, -0.13, -0.28].map((line, j) => <Part key={j} name="STUDY_NOTE_MARK"
            position={[-0.025, line, 0.012]} size={[0.37 - (j % 2) * 0.13, 0.016, 0.004]} color={P.slate} finish="paper" radius={0.002} />)}
          <Part name="PAGE_COLORED_TAB" position={[0.11, 0.28, 0.014]} size={[0.14, 0.09, 0.004]} color={i ? P.clay : P.ochre} finish="paper" radius={0.002} />
        </>}
      </group>)}
    <Part name="SMALL_PINNED_COLOUR_REFERENCE" position={[1.15, 0.45, 0.13]} size={[0.4, 0.36, 0.01]} color={P.slate} finish="paper" rotation={[0, 0, 0.07]} radius={0.003} />
    <Part name="BOARD_SAVED_ENVELOPE" position={[-0.75, -0.6, 0.13]} size={[0.71, 0.21, 0.017]} color={P.linenLight} finish="paper" rotation={[0, 0, -0.025]} radius={0.006} />
  </group>;
}

function WallStudies() {
  return <group name="HOUSE_SMALL_PAPER_STUDIES" position={[-7.963, 2.83, 0.45]} rotation={[0, Math.PI / 2, 0]}>
    <group rotation={[0, 0, -0.025]}>
      <Part name="STUDY_FRAME" position={[0, 0, 0]} size={[1.39, 1.72, 0.08]} color={P.wood} radius={0.025} />
      <Part name="STUDY_PAPER" position={[0, 0, 0.046]} size={[1.21, 1.54, 0.018]} color={P.paper} finish="paper" radius={0.007} />
      <mesh position={[0.26, 0.35, 0.06]}><circleGeometry args={[0.17, 32]} /><HouseMaterial color={P.ochre} finish="paper" /></mesh>
      <HouseCurve name="PAPER_LANDSCAPE_LINE" points={[[-0.52, -0.07, 0.065], [-0.32, 0.03, 0.065], [-0.12, -0.11, 0.065], [0.09, -0.18, 0.065], [0.34, -0.05, 0.065], [0.51, -0.1, 0.065]]}
        radius={0.013} color={P.linenShade} finish="paper" />
      <HouseCurve name="PAPER_SECOND_CONTOUR" points={[[-0.52, -0.37, 0.066], [-0.21, -0.23, 0.066], [0.12, -0.28, 0.066], [0.51, -0.39, 0.066]]}
        radius={0.01} color={P.slate} finish="paper" />
    </group>
    <group position={[1.19, -0.23, 0.035]} rotation={[0, 0, 0.045]}>
      <Part name="PINNED_MOVEMENT_STUDY" position={[0, 0, 0]} size={[0.64, 0.9, 0.014]} color={P.paper} finish="paper" radius={0.005} />
      <Part name="MOVEMENT_STUDY_TAPE" position={[0.01, 0.45, 0.01]} size={[0.19, 0.1, 0.006]} color={P.linenLight} finish="paper" radius={0.003} />
      <mesh position={[-0.02, 0.22, 0.014]}><circleGeometry args={[0.065, 20]} /><HouseMaterial color={P.slate} finish="paper" /></mesh>
      <HouseCurve name="MOVEMENT_GESTURE_SKETCH" points={[[-0.02, 0.12, 0.017], [0.035, -0.02, 0.017], [-0.14, -0.32, 0.017]]} radius={0.012} color={P.slate} finish="paper" />
      <HouseCurve name="MOVEMENT_EXTENDED_LEG_SKETCH" points={[[0.035, -0.02, 0.017], [0.14, 0.075, 0.017], [0.25, 0.17, 0.017]]} radius={0.012} color={P.slate} finish="paper" />
      <HouseCurve name="MOVEMENT_ARM_SKETCH" points={[[-0.15, 0.14, 0.017], [0.015, 0.05, 0.017], [0.12, 0.17, 0.017]]} radius={0.01} color={P.slate} finish="paper" />
    </group>
  </group>;
}

export function HouseEntryDetails() {
  return <group name="HOUSE_ENTRY_BENCH_AND_BAG" position={[-5.05, 0, 3.55]}>
    {[-0.27, 0, 0.27].map(z => <Part key={z} name="ENTRY_BENCH_SEAT_SLAT" position={[0, 0.73, z]}
      size={[3.1, 0.15, 0.245]} color={P.woodLight} radius={0.045} castShadow />)}
    {[-1.22, 1.22].map(x => <Part key={x} name="ENTRY_BENCH_LEG" position={[x, 0.35, 0]}
      size={[0.17, 0.7, 0.71]} color={P.wood} radius={0.04} castShadow />)}
    <Part name="ENTRY_BENCH_LOW_RAIL" position={[0, 0.2, 0]} size={[2.58, 0.1, 0.14]} color={P.woodDark} />
    <group name="MATTEO_CANVAS_BACKPACK" position={[-0.67, 0.81, 0]} rotation={[0.03, 0.12, -0.06]}>
      <Part name="BACKPACK_BODY" position={[0, 0.54, 0]} size={[0.82, 1.07, 0.53]} color={P.canvas} finish="fabric" radius={0.24} castShadow />
      <Part name="BACKPACK_FRONT_POCKET" position={[0.025, 0.33, 0.285]} size={[0.59, 0.37, 0.13]} color={P.linenShade} finish="fabric" radius={0.06} />
      <Part name="BACKPACK_ZIPPER" position={[0.025, 0.498, 0.355]} size={[0.48, 0.024, 0.015]} color={P.woodDark} finish="fabric" radius={0.006} />
      <Part name="BACKPACK_CLOTH_PATCH" position={[-0.06, 0.72, 0.271]} size={[0.15, 0.13, 0.01]} color={P.linenLight} finish="fabric" radius={0.004} />
      <HouseCurve name="BACKPACK_CARRY_LOOP" points={[[-0.13, 1, 0], [-0.12, 1.15, 0], [0, 1.18, 0], [0.12, 1.15, 0], [0.13, 1, 0]]} radius={0.031} color={P.woodDark} finish="fabric" />
      <HouseCurve name="BACKPACK_LOOSE_STRAP" points={[[0.27, 0.95, -0.19], [0.45, 0.67, -0.24], [0.52, 0.25, -0.13], [0.46, 0.07, 0.12], [0.32, 0.3, 0.1]]} radius={0.036} color={P.woodDark} finish="fabric" />
    </group>
    <mesh name="ENTRY_KEY_BOWL" position={[0.96, 0.87, 0.03]}>
      <sphereGeometry args={[0.23, 24, 12, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.45]} />
      <HouseMaterial color={P.clay} finish="ceramic" side={2} />
    </mesh>
    <mesh name="ENTRY_KEY_RING" position={[0.96, 0.91, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.071, 0.008, 6, 16]} /><HouseMaterial color={P.brass} finish="metal" />
    </mesh>
    {[-0.13, 0.15].map((x, i) => <group key={i} name="EVERYDAY_SHOES_UNDER_BENCH" position={[x + 0.68, 0.1, 0.03]} rotation={[0, i * 0.15 - 0.05, 0]}>
      <Part name="SHOE_SOLE" position={[0, -0.05, 0]} size={[0.26, 0.085, 0.6]} color={P.paperEdge} finish="fabric" radius={0.04} />
      <SoftObject name="SHOE_CANVAS_UPPER" position={[0, 0.035, 0.015]} size={[0.25, 0.25, 0.58]} color={P.slate} />
    </group>)}
  </group>;
}

export function HouseRug({ position, size, name }: { position: Point3; size: [number, number]; name: string }) {
  const [w, d] = size;
  const fringe: FieldInstance[] = Array.from({ length: Math.floor(w / 0.11) * 2 }, (_, i) => ({
    position: [-w / 2 + 0.04 + Math.floor(i / 2) * 0.11, 0, (i % 2 ? 1 : -1) * (d / 2 + 0.065)],
    scale: [0.028, 0.012, 0.16 + (i % 3) * 0.018], color: P.paperEdge,
  }));
  return <group name={name} position={position}>
    <Part name="RUG_WOVEN_BASE" position={[0, 0, 0]} size={[w, 0.029, d]} color={P.floorRug} finish="fabric" radius={0.014} />
    {[-1, 1].map(side => <group key={side}>
      <Part name="RUG_LONG_WOVEN_BORDER" position={[side * (w / 2 - 0.16), 0.019, 0]}
        size={[0.09, 0.008, d - 0.23]} color={P.rugBorder} finish="fabric" radius={0.003} />
      <Part name="RUG_SHORT_WOVEN_BORDER" position={[0, 0.019, side * (d / 2 - 0.16)]}
        size={[w - 0.23, 0.008, 0.09]} color={P.rugBorder} finish="fabric" radius={0.003} />
      <Part name="RUG_FINE_TERRACOTTA_STRIPE" position={[0, 0.024, side * (d / 2 - 0.32)]}
        size={[w - 0.46, 0.005, 0.018]} color={P.clay} finish="fabric" radius={0.002} />
    </group>)}
    <HouseInstances name="RUG_INSTANCED_FRINGE" instances={fringe} finish="fabric" />
  </group>;
}

export function HousePersonalDetails() {
  return <group name="HOUSE_PERSONAL_OBJECTS_VISUAL_PROTOTYPE">
    <Bookshelf />
    <ReferenceBoard />
    <WallStudies />
    <HouseEntryDetails />
  </group>;
}
