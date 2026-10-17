"use client";

import { useEffect } from "react";
import { worldInputBlocked } from "@/systems/experience-state";
import { usePlayerDebugState } from "@/world/player/player-state";
import {
  explorationComplete,
  LAB_DISCOVERIES,
  nearestAvailableDiscovery,
} from "./discovery-logic";
import { useDiscoveryLabStore } from "./discovery-store";
import styles from "./discovery-lab.module.css";

export function DiscoveryHUD() {
  const position = usePlayerDebugState((state) => state.position);
  const found = useDiscoveryLabStore((state) => state.found);
  const tryCollect = useDiscoveryLabStore((state) => state.tryCollect);
  const reset = useDiscoveryLabStore((state) => state.reset);
  const nearby = nearestAvailableDiscovery(found, position);
  const complete = explorationComplete(found);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "f" || event.repeat ||
          event.ctrlKey || event.metaKey || event.altKey || worldInputBlocked()) return;
      const el = event.target;
      if (el instanceof HTMLElement && el.closest("input, textarea, select, button, a, [contenteditable]")) return;
      const snapshot = useDiscoveryLabStore.getState();
      const playerPosition = usePlayerDebugState.getState().position;
      const candidate = nearestAvailableDiscovery(snapshot.found, playerPosition);
      if (candidate) {
        event.preventDefault();
        snapshot.tryCollect(candidate.target.id, playerPosition);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <aside className={styles.panel} aria-label="Laboratório de exploração" data-player-position={position.join(",")} data-found={found.join(",")}>
      <p className={styles.eyebrow}>GAMEPLAY LAB · protótipo local</p>
      <h1 className={styles.heading}>Descobertas contextuais</h1>
      <p className={styles.caption}>Explore com WASD. Aproxime-se dos objetos e pressione F ou clique neles.</p>
      <p className={styles.progress} data-discovery-count>{found.length} / {LAB_DISCOVERIES.length} encontrados</p>

      <div className={styles.discoveryList}>
        {LAB_DISCOVERIES.map((item) => (
          <div className={styles.discoveryRow} key={item.id}>
            <span className={found.includes(item.id) ? styles.check : styles.pending} aria-hidden="true">
              {found.includes(item.id) ? "●" : "○"}
            </span>
            <div>
              <strong>{found.includes(item.id) ? item.label : "Objeto não descoberto"}</strong>
              {found.includes(item.id) ? <p>{item.description}</p> : null}
            </div>
          </div>
        ))}
      </div>

      {complete ? (
        <p className={styles.feedback} role="status">Exploração concluída. O conteúdo permanece disponível também pelo acesso direto.</p>
      ) : nearby ? (
        <div className={styles.nearby} aria-live="polite">
          <p>Objeto próximo: <strong>{nearby.target.label}</strong></p>
          <button className={styles.action} onClick={() => tryCollect(nearby.target.id, position)}>F · Descobrir</button>
        </div>
      ) : (
        <p className={styles.feedback} aria-live="polite">Aproxime-se de um marcador para interagir.</p>
      )}
      <button className={styles.reset} onClick={reset}>Reiniciar demonstração</button>
      <a className={styles.link} href="/dev/playground">Abrir playground original</a>
    </aside>
  );
}
