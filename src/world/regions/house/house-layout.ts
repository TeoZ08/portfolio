import { fieldPlayerPoint, housePlayerPoint } from "../world-scale";

export const HOUSE_INTERIOR_ENTRY_POINT = housePlayerPoint(0, 5);
export const HOUSE_INTERIOR_DOOR_POINT = housePlayerPoint(0, 5);

export const HOUSE_FIELD_EXIT_POINT = fieldPlayerPoint(-16, -28.8);

// Reachable point immediately in front of the desk chair. Keeping the point
// outside the chair collider lets the shared approach/alignment system finish
// naturally before the computer takes over the screen.
export const HOUSE_COMPUTER_INTERACTION_POINT = housePlayerPoint(4.25, -2.35);
// Separate the reachable approach point from the actual chair seat.
export const HOUSE_COMPUTER_SEAT_POINT = housePlayerPoint(4.25, -3.55);

export const HOUSE_ENTRY_BENCH_INTERACTION_POINT = housePlayerPoint(-3.8, 2.4);
export const HOUSE_ENTRY_BENCH_SEAT_POINT = housePlayerPoint(-3.8, 3.55);
export const HOUSE_REFERENCE_BOARD_INTERACTION_POINT = housePlayerPoint(0, -4.4);
export const HOUSE_BOOKSHELF_INTERACTION_POINT = housePlayerPoint(5.95, -1);

export const HOUSE_INTERIOR_WIDTH = 16;
export const HOUSE_INTERIOR_DEPTH = 12;
export const HOUSE_INTERIOR_WALL_HEIGHT = 4.5;
