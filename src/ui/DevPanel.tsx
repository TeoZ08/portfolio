"use client";

import { useWorldState } from "@/systems/world-state";
import { usePlayerDebugState } from "@/world/player/player-state";

function formatVector([x, y, z]: [number, number, number]) {
  return `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`;
}

export function DevPanel() {
  const currentRegion = useWorldState((state) => state.currentRegion);
  const timeOfDay = useWorldState((state) => state.timeOfDay);
  const setTimeOfDay = useWorldState((state) => state.setTimeOfDay);
  const position = usePlayerDebugState((state) => state.position);
  const velocity = usePlayerDebugState((state) => state.velocity);
  const grounded = usePlayerDebugState((state) => state.grounded);
  const moving = usePlayerDebugState((state) => state.moving);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <aside className="dev-panel" data-dev-panel aria-label="Painel DEV">
      <p className="dev-panel__title">DEV / Physics Playground</p>

      <dl className="dev-panel__readout">
        <div>
          <dt>Região atual</dt>
          <dd data-current-region>{currentRegion}</dd>
        </div>
        <div>
          <dt>timeOfDay</dt>
          <dd data-time-of-day>{timeOfDay.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Player</dt>
          <dd>DEV_PLAYER_CAPSULE</dd>
        </div>
        <div>
          <dt>Posição</dt>
          <dd data-player-position>{formatVector(position)}</dd>
        </div>
        <div>
          <dt>Velocidade</dt>
          <dd data-player-velocity>{formatVector(velocity)}</dd>
        </div>
        <div>
          <dt>Grounded</dt>
          <dd data-player-grounded>{grounded ? "true" : "false"}</dd>
        </div>
        <div>
          <dt>Movendo</dt>
          <dd data-player-moving>{moving ? "true" : "false"}</dd>
        </div>
      </dl>

      <label className="dev-panel__control">
        <span className="dev-panel__control-label">
          <span>Controle temporário</span>
          <output>{timeOfDay.toFixed(1)}</output>
        </span>
        <input
          aria-label="timeOfDay"
          type="range"
          min="0"
          max="24"
          step="0.5"
          value={timeOfDay}
          onChange={(event) => setTimeOfDay(Number(event.target.value))}
        />
      </label>
    </aside>
  );
}
