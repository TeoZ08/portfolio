"use client";

import { useMemo } from "react";
import type { FieldInstance } from "../field/field-geometry";
import { HouseMaterial } from "../house/HouseMaterial";
import { Part, HouseInstances, HouseCurve, PLACE_PALETTE as P } from "./PlaceObjects";

export function PaperStudy({ position, rotationY = 0, variant = 0 }: {
  position: [number, number, number]; rotationY?: number; variant?: number;
}) {
  const marks = useMemo<FieldInstance[]>(() => {
    const lines: FieldInstance[] = [];
    for (let i = 0; i < 6; i++) lines.push({ position: [-.14, .009, -.26 + i * .09], scale: [.24 + (i % 3) * .055, .002, .009], color: P.sage });
    for (let i = 0; i < 3; i++) {
      const x = .15 + i % 2 * .22, z = -.17 + i * .2;
      lines.push({ position: [x, .01, z], scale: [.15, .002, .12], color: variant ? P.canvas : P.sage });
      if (i < 2) lines.push({ position: [x + .075, .011, z + .095], scale: [.012, .002, .15], rotation: [0, i % 2 ? -.7 : .7, 0], color: P.ink });
    }
    return lines;
  }, [variant]);
  return <group name="PAPER_STUDY_WITH_PENCIL_MARKS" position={position} rotation={[0, rotationY, 0]}>
    <Part name="STUDY_PAPER" position={[0, 0, 0]} size={[.86, .012, .82]} color={P.paper} finish="paper" radius={.004} />
    <HouseInstances name="DRAWN_NOTES_AND_DIAGRAM" instances={marks} finish="paper" />
    <Part name="STUDY_PENCIL" position={[.34, .037, -.16]} size={[.022, .022, .58]} color={P.clay} rotation={[0, -.2, 0]} radius={.009} />
  </group>;
}

export function FieldNotebook({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return <group name="OPEN_NOTEBOOK" position={position} rotation={[0, rotationY, 0]}>
    <Part name="NOTEBOOK_SOFT_COVER" position={[0, 0, 0]} size={[.86, .035, .63]} color={P.sage} radius={.016} />
    {[-1, 1].map(side => <group key={side} position={[side * .207, .033, 0]} rotation={[0, 0, side * -.065]}>
      <Part name="NOTEBOOK_OPEN_PAGES" position={[0, 0, 0]} size={[.407, .035, .6]} color={P.paper} finish="paper" radius={.01} />
      {[0, 1, 2, 3, 4].map(line => <Part key={line} name="NOTEBOOK_WRITING" position={[-.02, .02, -.16 + line * .074]}
        size={[.27 - (line % 3) * .037, .002, .007]} color={P.sage} finish="paper" radius={0} />)}
    </group>)}
    <HouseCurve name="NOTEBOOK_RIBBON" points={[[0, .06, -.18], [0, .062, .18], [.03, .04, .32], [.06, .005, .39]]} radius={.009} color={P.clay} finish="fabric" />
  </group>;
}

export function WaterBottle({ position, color = P.sage }: { position: [number, number, number]; color?: string }) {
  return <group name="EVERYDAY_WATER_BOTTLE" position={position}>
    <mesh position={[0, .23, 0]} castShadow><capsuleGeometry args={[.115, .29, 5, 16]} /><HouseMaterial color={color} finish="paint" /></mesh>
    <Part name="BOTTLE_CAP" position={[0, .45, 0]} size={[.14, .085, .14]} color={P.iron} radius={.055} />
    <HouseCurve name="BOTTLE_CARRY_LOOP" points={[[-.05, .49, 0], [-.055, .55, 0], [.05, .55, 0], [.05, .49, 0]]} radius={.012} color={P.woodDark} finish="fabric" />
  </group>;
}

export function BookRow({ position, width = 1.5, seed = 1 }: { position: [number, number, number]; width?: number; seed?: number }) {
  const books = useMemo<FieldInstance[]>(() => {
    const instances: FieldInstance[] = [], colors = [P.sage, P.clay, P.paper, P.ink, P.canvas];
    let x = -width / 2;
    for (let i = 0; x < width / 2 - .14; i++) {
      const w = .09 + ((i * 3 + seed) % 4) * .026, h = .43 + ((i + seed) % 3) * .065;
      instances.push({ position: [x + w / 2, h / 2, 0], scale: [w, h, .36], color: colors[(i + seed) % colors.length] });
      instances.push({ position: [x + w / 2, h * .74, .183], scale: [w * .55, .021, .008], color: P.paper });
      x += w + .018;
    }
    return instances;
  }, [width, seed]);
  return <group name="BOOKS_WITH_UNEVEN_SPINES" position={position}><HouseInstances name="BOOK_ROW" instances={books} finish="fabric" /></group>;
}

export function StorageBox({ position, color = P.canvas, rotationY = 0 }: { position: [number, number, number]; color?: string; rotationY?: number }) {
  return <group name="PAPER_ARCHIVE_BOX" position={position} rotation={[0, rotationY, 0]}>
    <Part name="ARCHIVE_BOX" position={[0, .18, 0]} size={[.66, .36, .48]} color={color} finish="paper" radius={.018} />
    <Part name="ARCHIVE_BOX_LID" position={[0, .37, 0]} size={[.69, .05, .5]} color={P.paper} finish="paper" radius={.018} />
    <Part name="ARCHIVE_BOX_LABEL" position={[0, .23, .245]} size={[.23, .1, .009]} color={P.paper} finish="paper" radius={.003} />
    <Part name="ARCHIVE_BOX_HANDLE" position={[0, .115, .246]} size={[.18, .034, .01]} color={P.woodDark} radius={.013} />
  </group>;
}
