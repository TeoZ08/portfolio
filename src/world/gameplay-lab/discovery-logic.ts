// Concept adapted from thaslle/world's discovery-and-collection loop (MIT).
// Our stable IDs, distance-gated interaction and optional progression are independent.
export const DISCOVERY_REACH = 1.75;

export const LAB_DISCOVERIES = [
  {
    id: "jarvis",
    label: "Jarvis Acadêmico",
    description: "IA aplicada, recuperação de informação e ferramentas.",
    position: [-5.2, 0.85, -3.5] as const,
    color: "#9da7e3",
  },
  {
    id: "unapi",
    label: "Oficinas UnAPI",
    description: "Tecnologia acessível e aprendizagem prática.",
    position: [1.2, 0.85, 4.5] as const,
    color: "#a3c8b4",
  },
  {
    id: "aquaia",
    label: "AquaIA",
    description: "Um protótipo para identificar e comunicar vazamentos.",
    position: [5.5, 0.85, -4.5] as const,
    color: "#99bbd5",
  },
] as const;

export type DiscoveryId = (typeof LAB_DISCOVERIES)[number]["id"];
export type Position3 = readonly [number, number, number];

export function horizontalDistance(a: Position3, b: Position3): number {
  if (![...a, ...b].every(Number.isFinite)) return Infinity;
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

export function nearestAvailableDiscovery(
  found: readonly DiscoveryId[],
  playerPosition: Position3,
) {
  let nearest: { target: (typeof LAB_DISCOVERIES)[number]; distance: number } | null = null;
  for (const target of LAB_DISCOVERIES) {
    if (found.includes(target.id)) continue;
    const distance = horizontalDistance(playerPosition, target.position);
    if (distance > DISCOVERY_REACH) continue;
    if (!nearest || distance < nearest.distance) nearest = { target, distance };
  }
  return nearest;
}

export function discover(
  found: readonly DiscoveryId[],
  requestedId: string,
  playerPosition: Position3,
): readonly DiscoveryId[] {
  const target = LAB_DISCOVERIES.find((candidate) => candidate.id === requestedId);
  if (!target || found.includes(target.id)) return found;
  if (horizontalDistance(playerPosition, target.position) > DISCOVERY_REACH) return found;
  return [...found, target.id];
}

export function explorationComplete(found: readonly DiscoveryId[]) {
  return LAB_DISCOVERIES.every((target) => found.includes(target.id));
}
