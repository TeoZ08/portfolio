"use client";

import { useExperienceState } from "@/systems/experience-state";
import { WORLD_DESTINATIONS } from "@/world/regions/field/world-destinations";
import { FIELD_PATH_POINTS } from "@/world/regions/field/field-layout";
import { PLACE_PATHS } from "@/world/regions/places/place-layout";

const point = ([x, z]: readonly number[]) => `${x + 55},${z + 105}`;
export function WorldMap() {
  return <div className="world-map">
    <p>Escolha um lugar para chegar diretamente, ou volte para seguir a pé.</p>
    <svg viewBox="0 0 110 140" role="img" aria-label="Mapa: casa e ateliê na chegada, pátio e jardim ao centro, bosque, dojang e mirante ao fundo">
      <rect width="110" height="140" rx="8" fill="#dfe2cc" />
      {[FIELD_PATH_POINTS, ...PLACE_PATHS].map((points, i) => <polyline key={i} points={points.map(point).join(" ")} fill="none" stroke="#b2a783" strokeWidth="1.8" strokeLinejoin="round" />)}
      {WORLD_DESTINATIONS.map((place, i) => <g key={place.id} transform={`translate(${place.x + 55} ${place.z + 105})`}><circle r="3.5" fill="#4e654f" /><text textAnchor="middle" dominantBaseline="central" fill="#f8f2de" fontSize="4">{i + 1}</text></g>)}
      <circle cx="55" cy="109.5" r="2" fill="#b27653" /><text x="60" y="111" fill="#455941" fontSize="3.6">Chegada</text>
    </svg>
    <ol>{WORLD_DESTINATIONS.map(place => <li key={place.id}><button type="button" onClick={() => {
      useExperienceState.getState().closeOverlay();
      window.dispatchEvent(new CustomEvent("world:travel", { detail: place.id }));
    }}><strong>{place.name}</strong><span>{place.detail}</span></button></li>)}</ol>
  </div>;
}
