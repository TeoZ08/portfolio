import { FIELD_INTERACTION_TARGETS } from "./field-interaction-targets";
import { FIELD_SCALE } from "../world-scale";
const metadata=[
 ["HOUSE_ENTRY_DOOR","Casa","Computador, projetos e objetos pessoais"],
 ["WORKSHOP_LIGHT_TABLE","Galeria · processo","Experimente a luz deste mundo"],
 ["UNIVERSITY_NOTEBOOK","Galeria · Jarvis","Jarvis Acadêmico e suas fontes"],
 ["COMMUNITY_WORKSHOP","Galeria · UnAPI","Oficinas UnAPI e tecnologia no cotidiano"],
 ["DOJO_PRACTICE","Dojang","Songahm e movimento"],
 ["FOREST_CHIMES","Bosque","Um sino de vento entre as árvores"],
 ["HILL_BENCH","Mirante","Sente e veja o caminho percorrido"],
] as const;
export const WORLD_DESTINATIONS=metadata.map(([id,name,detail])=>{
 const target=FIELD_INTERACTION_TARGETS.find(t=>t.id===id)!;
 return {id,name,detail,x:target.interactionPoint[0]/FIELD_SCALE,z:target.interactionPoint[2]/FIELD_SCALE};
});
export function findWorldDestination(id:unknown){if(!WORLD_DESTINATIONS.some(d=>d.id===id))return undefined;return FIELD_INTERACTION_TARGETS.find(t=>t.id===id);}
