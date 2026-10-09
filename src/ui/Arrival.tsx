"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { setAmbientSound } from "@/systems/ambient-audio";
import { useExperienceState } from "@/systems/experience-state";

const PREFERENCES_KEY = "matteo-world-preferences-v1";
export function ExperiencePreferences() {
  useEffect(() => {
    const state = useExperienceState.getState();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let welcomed = false;
    try {
      const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "null");
      if (saved) {
        if (typeof saved.reducedMotion === "boolean") state.setReducedMotion(saved.reducedMotion);
        else state.setReducedMotion(motion.matches);
        if (saved.quality === "balanced" || saved.quality === "low") state.setQuality(saved.quality);
        welcomed = saved.welcomed === true;
      } else state.setReducedMotion(motion.matches);
    } catch { state.setReducedMotion(motion.matches); }
    if (!welcomed) state.openArrival();
    const save = useExperienceState.subscribe((next, previous) => {
      if (next.reducedMotion === previous.reducedMotion && next.quality === previous.quality) return;

      try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ reducedMotion: next.reducedMotion, quality: next.quality, welcomed: JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "null")?.welcomed === true })); } catch { /* Storage may be unavailable; the experience remains usable. */ }
    });
    return () => { save(); void setAmbientSound(false); useExperienceState.getState().setAmbientSound(false); };
  }, []);
  return null;
}
export function Arrival() {
  const open = useExperienceState(state => state.overlay === "arrival");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); document.querySelector<HTMLElement>(".world-canvas")?.focus({ preventScroll: true }); };
  }, [open]);
  const enter = () => {
    const state = useExperienceState.getState();
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ reducedMotion: state.reducedMotion, quality: state.quality, welcomed: true })); } catch { /* Optional preference storage. */ }
    state.closeOverlay();
  };
  return <dialog ref={dialog} className="arrival-dialog" aria-labelledby="arrival-title" onCancel={event => { event.preventDefault(); enter(); }}>
    <span className="place-overline">Matteo Lima Scotti</span>
    <h1 id="arrival-title">Um lugar para<br />conhecer o que eu faço.</h1>
    <p>A casa guarda os projetos. O ateliê, os estudos e o jardim mostram outras partes do caminho.</p>
    <button autoFocus onClick={enter}>Entrar e explorar <span aria-hidden="true">↗</span></button>
    <Link href="/projetos" onClick={enter}>Ir direto aos projetos</Link>
    <dl><div><dt>WASD / setas</dt><dd>Caminhar</dd></div><div><dt>Arraste</dt><dd>Olhar ao redor</dd></div><div><dt>E</dt><dd>Usar objetos próximos</dd></div><div><dt>Esc / ···</dt><dd>Mapa e arquivos</dd></div></dl>
    <p className="arrival-touch">No celular, mova-se com o joystick à esquerda, toque em Salto à direita e arraste a tela para olhar.</p>
  </dialog>;
}
