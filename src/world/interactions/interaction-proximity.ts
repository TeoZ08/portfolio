import type { InteractionTarget } from "./interaction-types";

export function getNearestTarget(
  position: { x: number; y: number; z: number },
  targets: readonly InteractionTarget[],
) {
  let nearest: InteractionTarget | null = null;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    const dx = target.interactionPoint[0] - position.x;
    const dy = target.interactionPoint[1] - position.y;
    const dz = target.interactionPoint[2] - position.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const radiusSquared = target.activationRadius * target.activationRadius;

    if (distanceSquared > radiusSquared) {
      continue;
    }

    const isCloser = distanceSquared < nearestDistanceSquared;
    const isTie =
      distanceSquared === nearestDistanceSquared &&
      nearest !== null &&
      target.id < nearest.id;

    if (isCloser || isTie) {
      nearest = target;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest;
}
