import { HOUSE_SCALE } from "../world-scale";
// Authoring units. Visual enclosure and Rapier colliders share these extents.
export const HOUSE_FLOOR = { halfWidth: 8, halfDepth: 8.67, centerZ: 2.67, halfThickness: .12 } as const;
export const HOUSE_EXIT_THRESHOLD = { halfWidth: 2.4, z: 6, scale: HOUSE_SCALE } as const;
export function crossedHouseExit(position: {x:number;y:number;z:number}) {
  const door = HOUSE_EXIT_THRESHOLD;
  return Math.abs(position.x) < door.halfWidth * door.scale &&
    position.z >= door.z * door.scale && position.y > .1 && position.y < 2.6;
}
export const RECOVERY_COOLDOWN = .75;
export function needsPlayerRecovery(region: string, position: {x:number;y:number;z:number}, cooldown: number) {
  if (cooldown > 0) return false;
  return !Number.isFinite(position.x + position.y + position.z) ||
    position.y < (region === 'HOUSE' ? -2 : -8);
}
