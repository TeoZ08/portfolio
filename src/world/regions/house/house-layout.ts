export const HOUSE_INTERIOR_ENTRY_POINT = [0, 0.86, 5] as const;
export const HOUSE_INTERIOR_DOOR_POINT = [0, 0.86, 5] as const;

export const HOUSE_FIELD_EXIT_POINT = [-16, 0.86, -28.8] as const;

// Reachable point immediately in front of the desk chair. Keeping the point
// outside the chair collider lets the shared approach/alignment system finish
// naturally before the computer takes over the screen.
export const HOUSE_COMPUTER_INTERACTION_POINT = [4.25, 0.86, -2.35] as const;

export const HOUSE_ENTRY_BENCH_INTERACTION_POINT = [-3.8, 0.86, 2.4] as const;
export const HOUSE_ENTRY_BENCH_SEAT_POINT = [-3.8, 0.86, 3.55] as const;
export const HOUSE_REFERENCE_BOARD_INTERACTION_POINT = [0, 0.86, -4.4] as const;
export const HOUSE_BOOKSHELF_INTERACTION_POINT = [5.95, 0.86, -1] as const;

export const HOUSE_INTERIOR_WIDTH = 16;
export const HOUSE_INTERIOR_DEPTH = 12;
export const HOUSE_INTERIOR_WALL_HEIGHT = 4.5;
