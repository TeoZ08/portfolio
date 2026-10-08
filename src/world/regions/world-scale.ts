// Authoring coordinates stay intact; the outdoor scene and its Rapier colliders
// share one uniform scale. Avatar, capsule and interaction heights stay in metres.
export const FIELD_SCALE = .72;

export function fieldPlayerPoint(x: number, z: number): readonly [number, number, number] {
  return [x * FIELD_SCALE, .86, z * FIELD_SCALE];
}

export const HOUSE_SCALE = .72;
export function housePlayerPoint(x: number, z: number): readonly [number, number, number] {
  return [x * HOUSE_SCALE, .86, z * HOUSE_SCALE];
}
