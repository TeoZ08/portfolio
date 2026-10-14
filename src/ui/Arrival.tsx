"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import {requestGameplayPointerLock,usePointerControl} from "@/world/camera/pointer-lock";
import { setAmbientSound } from "@/systems/ambient-audio";
import { useExperienceState } from "@/systems/experience-state";

const PREFERENCES_KEY = "matteo-world-preferences-v1";
export function ExperiencePreferences({ showArrival = true }: { showArrival?: boolean }) {
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
        if(typeof saved.mouseSensitivity === "number")state.setMouseSensitivity(saved.mouseSensitivity);
        if(typeof saved.invertMouseY === "boolean")state.setInvertMouseY(saved.invertMouseY);
        if(typeof saved.crosshair === "boolean")state.setCrosshair(saved.crosshair);
        welcomed = saved.welcomed === true;
      } else state.setReducedMotion(motion.matches);
    } catch { state.setReducedMotion(motion.matches); }
    if (showArrival && !welcomed) state.openArrival();
    const save = useExperienceState.subscribe((next, previous) => {
      if (next.reducedMotion === previous.reducedMotion && next.quality === previous.quality && next.mouseSensitivity===previous.mouseSensitivity && next.invertMouseY===previous.invertMouseY && next.crosshair===previous.crosshair) return;

      try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ reducedMotion: next.reducedMotion, quality: next.quality, mouseSensitivity:next.mouseSensitivity, invertMouseY:next.invertMouseY, crosshair:next.crosshair, welcomed: JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "null")?.welcomed === true })); } catch { /* Storage may be unavailable; the experience remains usable. */ }
    });
    return () => { save(); void setAmbientSound(false); useExperienceState.getState().setAmbientSound(false); };
  }, [showArrival]);
  return null;
}
export function Arrival() {
  const ready=usePointerControl(state=>state.ready);
  const open = useExperienceState(state => state.overlay === "arrival");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); document.querySelector<HTMLElement>(".world-canvas")?.focus({ preventScroll: true }); };
  }, [open]);
  useEffect(()=>{if(open&&ready)dialog.current?.querySelector<HTMLButtonElement>("button")?.focus({preventScroll:true});},[open,ready]);
  const enter = () => {
    const state = useExperienceState.getState();
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ reducedMotion: state.reducedMotion, quality: state.quality, mouseSensitivity:state.mouseSensitivity, invertMouseY:state.invertMouseY, crosshair:state.crosshair, welcomed: true })); } catch { /* Optional preference storage. */ }
    state.closeOverlay();
  };
  const explore=(event:MouseEvent<HTMLButtonElement>)=>{dialog.current?.close();enter();requestGameplayPointerLock(event);};
  return <dialog ref={dialog} className="arrival-dialog" aria-labelledby="arrival-title" onCancel={event => { event.preventDefault(); enter(); }}>
    <span className="place-overline">Matteo Lima Scotti</span>
    <h1 id="arrival-title">Um lugar para<br />conhecer o que eu faço.</h1>
    <p>A casa guarda os projetos. O ateliê, os estudos e o jardim mostram outras partes do caminho.</p>
    <button autoFocus disabled={!ready} onClick={explore}>Entrar e explorar <span aria-hidden="true">↗</span></button>
    {!ready&&<p role="status">Preparando o mundo…</p>}
    <Link href="/projetos" onClick={enter}>Ir direto aos projetos</Link>
    <dl><div><dt>WASD / setas</dt><dd>Caminhar</dd></div><div><dt>F5 / Câmera</dt><dd>Alternar três perspectivas</dd></div><div><dt>Entrar / continuar</dt><dd>Mouse controla o olhar; Esc libera</dd></div><div><dt>E</dt><dd>Usar objetos próximos</dd></div><div><dt>Esc / ···</dt><dd>Mapa e arquivos</dd></div></dl>
    <p className="arrival-touch">No celular, mova-se com o joystick à esquerda, toque em Salto à direita e arraste o lado direito para olhar. O botão Câmera alterna a perspectiva.</p>
  </dialog>;
}
