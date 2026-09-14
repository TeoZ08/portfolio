"use client";

import { HouseBlockout } from "./HouseBlockout";
import { HOUSE_PALETTE as P } from "./house-palette";

function Bed() {
  return (
    <group name="HOUSE_ROOM_BED" position={[-4.4, 0, -3.25]}>
      <HouseBlockout
        name="DEV_BED_FRAME"
        position={[0, 0.38, 0]}
        size={[3.5, 0.76, 4.5]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="DEV_BED_MATTRESS"
        position={[0, 0.88, 0]}
        size={[3.24, 0.34, 4.22]}
        color={P.linenLight}
      />
      <HouseBlockout
        name="DEV_BED_COVER"
        position={[0, 1.08, 0.72]}
        size={[3.16, 0.1, 2.35]}
        color={P.linen}
      />
      <HouseBlockout
        name="DEV_BED_PILLOW"
        position={[0, 1.12, -1.42]}
        size={[2.55, 0.16, 0.7]}
        color={P.paper}
      />
      <HouseBlockout
        name="DEV_BED_HEADBOARD"
        position={[0, 1.68, -2.05]}
        size={[3.5, 1.55, 0.16]}
        color={P.wood}
      />
    </group>
  );
}

function DeskAndComputer() {
  return (
    <group name="HOUSE_ROOM_DESK_COMPUTER">
      <HouseBlockout
        name="DEV_DESK_TOP"
        position={[4.25, 1.42, -5.18]}
        size={[4.25, 0.22, 1.1]}
        color={P.wood}
      />
      <HouseBlockout
        name="DEV_DESK_LEFT_LEG"
        position={[2.55, 0.7, -5.18]}
        size={[0.22, 1.45, 0.82]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="DEV_DESK_RIGHT_LEG"
        position={[5.95, 0.7, -5.18]}
        size={[0.22, 1.45, 0.82]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="DEV_COMPUTER_MONITOR_FRAME"
        position={[4.25, 2.28, -5.22]}
        size={[2.15, 1.25, 0.16]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="DEV_COMPUTER_MONITOR_SCREEN"
        position={[4.25, 2.28, -5.11]}
        size={[1.84, 0.91, 0.05]}
        color={P.screen}
      />
      <HouseBlockout
        name="DEV_COMPUTER_MONITOR_STAND"
        position={[4.25, 1.62, -5.17]}
        size={[0.24, 0.55, 0.2]}
        color={P.metal}
      />
      <HouseBlockout
        name="DEV_COMPUTER_KEYBOARD"
        position={[4.25, 1.59, -4.7]}
        size={[1.75, 0.08, 0.42]}
        color={P.screenLight}
      />
      <HouseBlockout
        name="DEV_COMPUTER_PLACEHOLDER_MARKER"
        position={[4.25, 2.28, -5.03]}
        size={[1.15, 0.07, 0.06]}
        color={P.devMarker}
        receiveShadow={false}
      />
    </group>
  );
}

function DeskChair() {
  return (
    <group name="HOUSE_ROOM_DESK_CHAIR" position={[4.25, 0, -3.55]}>
      <HouseBlockout
        name="DEV_DESK_CHAIR_SEAT"
        position={[0, 0.62, 0]}
        size={[1.3, 0.22, 1.3]}
        color={P.linen}
      />
      <HouseBlockout
        name="DEV_DESK_CHAIR_BACK"
        position={[0, 1.25, 0.54]}
        size={[1.3, 1.4, 0.18]}
        color={P.linen}
      />
      <HouseBlockout
        name="DEV_DESK_CHAIR_POST"
        position={[0, 0.28, 0]}
        size={[0.16, 0.62, 0.16]}
        color={P.metal}
      />
    </group>
  );
}

function Bookshelf() {
  return (
    <group name="HOUSE_ROOM_BOOKSHELF" position={[7.1, 0, -2.15]}>
      <HouseBlockout
        name="DEV_BOOKSHELF_FRAME"
        position={[0, 1.7, 0]}
        size={[1.05, 3.4, 3.35]}
        color={P.woodDark}
      />
      {[0.5, 1.38, 2.26].map((y) => (
        <HouseBlockout
          key={y}
          name={`DEV_BOOKSHELF_SHELF_${y}`}
          position={[0, y, 0]}
          size={[1.12, 0.12, 3.12]}
          color={P.wood}
        />
      ))}
      <HouseBlockout
        name="DEV_BOOKSHELF_BOOKS"
        position={[0, 2.72, 0.1]}
        size={[0.78, 0.55, 2.45]}
        color={P.paper}
      />
    </group>
  );
}

function ReferenceBoard() {
  return (
    <group name="HOUSE_ROOM_REFERENCE_BOARD" position={[0, 2.72, -6.02]}>
      <HouseBlockout
        name="DEV_REFERENCE_BOARD_FRAME"
        position={[0, 0, 0]}
        size={[3.4, 1.9, 0.14]}
        color={P.woodDark}
      />
      <HouseBlockout
        name="DEV_REFERENCE_BOARD_SURFACE"
        position={[0, 0, 0.1]}
        size={[3.08, 1.58, 0.04]}
        color={P.paper}
        receiveShadow={false}
      />
      {[-0.9, 0, 0.9].map((x) => (
        <HouseBlockout
          key={x}
          name={`DEV_REFERENCE_NOTE_${x}`}
          position={[x, 0.15 * (x === 0 ? 1 : -1), 0.15]}
          size={[0.48, 0.64, 0.04]}
          color={x === 0 ? P.screenLight : P.linen}
          receiveShadow={false}
        />
      ))}
    </group>
  );
}

function EntryBench() {
  return (
    <group name="HOUSE_ENTRY_BENCH" position={[-5.05, 0, 3.55]}>
      <HouseBlockout
        name="DEV_ENTRY_BENCH_TOP"
        position={[0, 0.72, 0]}
        size={[3.1, 0.24, 0.9]}
        color={P.wood}
      />
      <HouseBlockout
        name="DEV_ENTRY_BENCH_LEGS"
        position={[0, 0.34, 0]}
        size={[2.65, 0.62, 0.58]}
        color={P.woodDark}
      />
    </group>
  );
}

export function HouseRoom() {
  return (
    <group name="HOUSE_ROOM_OFFICE_BLOCKOUT">
      <Bed />
      <DeskAndComputer />
      <DeskChair />
      <Bookshelf />
      <ReferenceBoard />
      <EntryBench />
      <HouseBlockout
        name="DEV_ROOM_RUG"
        position={[0.8, 0.018, -2.25]}
        size={[7.2, 0.04, 4.15]}
        color={P.floorRug}
        receiveShadow={false}
      />
    </group>
  );
}
