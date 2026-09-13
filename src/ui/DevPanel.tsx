"use client";

import { useWorldState } from "@/systems/world-state";

export function DevPanel() {
  const currentRegion = useWorldState((state) => state.currentRegion);
  const timeOfDay = useWorldState((state) => state.timeOfDay);
  const setTimeOfDay = useWorldState((state) => state.setTimeOfDay);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <aside className="dev-panel" data-dev-panel aria-label="Painel DEV">
      <p className="dev-panel__title">DEV / Foundation</p>

      <dl className="dev-panel__readout">
        <div>
          <dt>Região atual</dt>
          <dd data-current-region>{currentRegion}</dd>
        </div>
        <div>
          <dt>timeOfDay</dt>
          <dd data-time-of-day>{timeOfDay.toFixed(1)}</dd>
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
