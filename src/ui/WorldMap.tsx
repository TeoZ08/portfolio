"use client";

import { useExperienceState } from "@/systems/experience-state";
import { WORLD_DESTINATIONS } from "@/world/regions/field/world-destinations";
import { PLAN, ROUTES } from "@/world/regions/masterplan-layout";
import { FIELD_BOUNDS as B } from "@/world/regions/field/field-layout";

const point = ([x, z]: readonly number[]) => `${x-B.minX},${z-B.minZ}`;
export function WorldMap() {
  return <div className="world-map">
    <p>Escolha um lugar para chegar diretamente, ou volte para seguir a pé.</p>
    <svg viewBox={`0 0 ${B.maxX-B.minX} ${B.maxZ-B.minZ}`} role="img" aria-label="Mapa do blockout: Casa oeste, Galeria leste, Songahm norte, Bosque lateral e Mirante nordeste">
      <rect width={B.maxX-B.minX} height={B.maxZ-B.minZ} rx="8" fill="#dfe2cc" />
      {ROUTES.map(r=>r.samples).map((points, i) => <polyline key={i} points={points.map(point).join(" ")} fill="none" stroke="#b2a783" strokeWidth="1.8" strokeLinejoin="round" />)}
      {WORLD_DESTINATIONS.map((place, i) => <g key={place.id} transform={`translate(${place.x-B.minX} ${place.z-B.minZ})`}><circle r="3.5" fill="#4e654f" /><text textAnchor="middle" dominantBaseline="central" fill="#f8f2de" fontSize="4">{i + 1}</text></g>)}
      <circle cx={PLAN.arrival[0]-B.minX} cy={PLAN.arrival[1]-B.minZ} r="2" fill="#b27653" /><text x={PLAN.arrival[0]-B.minX+5} y={PLAN.arrival[1]-B.minZ+1} fill="#455941" fontSize="3.6">Chegada</text>
    </svg>
    <ol>{WORLD_DESTINATIONS.map(place => <li key={place.id}><button type="button" onClick={() => {
      useExperienceState.getState().closeOverlay();
      window.dispatchEvent(new CustomEvent("world:travel", { detail: place.id }));
    }}><strong>{place.name}</strong><span>{place.detail}</span></button></li>)}</ol>
  </div>;
}
