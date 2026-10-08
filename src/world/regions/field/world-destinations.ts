import { FIELD_INTERACTION_TARGETS, FOREST_CHIME_ANCHOR } from "./field-interaction-targets";
export const WORLD_DESTINATIONS = [
  { id: "HOUSE_ENTRY_DOOR", name: "Casa", detail: "Computador, projetos e objetos pessoais", x: -16, z: -30.25 },
  { id: "WORKSHOP_LIGHT_TABLE", name: "Ateliê", detail: "Experimente a luz deste mundo", x: 30, z: -31 },
  { id: "UNIVERSITY_NOTEBOOK", name: "Pátio de estudos", detail: "Jarvis Acadêmico e suas fontes", x: -19, z: -65 },
  { id: "COMMUNITY_WORKSHOP", name: "Jardim comunitário", detail: "Oficinas UnAPI e tecnologia no cotidiano", x: 28, z: -61 },
  { id: "DOJO_PRACTICE", name: "Dojang", detail: "Songahm e movimento", x: -31, z: -87 },
  { id: "FOREST_CHIMES", name: "Bosque", detail: "Um sino de vento entre as árvores", x: FOREST_CHIME_ANCHOR.x, z: FOREST_CHIME_ANCHOR.z },
  { id: "HILL_BENCH", name: "Mirante", detail: "Sente e veja o caminho percorrido", x: 8, z: -88 },
] as const;
export function findWorldDestination(id: unknown) {
  if (!WORLD_DESTINATIONS.some(destination => destination.id === id)) return undefined;
  return FIELD_INTERACTION_TARGETS.find(target => target.id === id);
}
