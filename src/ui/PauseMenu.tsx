"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { requestGameplayPointerLock } from "@/world/camera/pointer-lock";
import { setAmbientSound } from "@/systems/ambient-audio";
import { WorldMap } from "./WorldMap";
import { useExperienceState } from "@/systems/experience-state";

// Native modal semantics provide focus containment and keep pointer input off
// the Canvas. The existing semantic overlay flag blocks manual player input.
export function PauseMenu({ open }: { open: boolean }) {
  const mouseSensitivity=useExperienceState(state=>state.mouseSensitivity);
  const invertMouseY=useExperienceState(state=>state.invertMouseY);
  const crosshair=useExperienceState(state=>state.crosshair);
  const ambientSound = useExperienceState(state => state.ambientSound);
  const [audioPending, setAudioPending] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const reducedMotion = useExperienceState(state => state.reducedMotion);
  const lowQuality = useExperienceState(state => state.quality === "low");
  const [mapOpen, setMapOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const resume = useRef<HTMLButtonElement>(null);
  const close = useExperienceState(state => state.closeOverlay);
  useEffect(() => {
    if (!open) { setMapOpen(false); return; }
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    resume.current?.focus();
    return () => { element?.close(); if(useExperienceState.getState().overlay===null)document.querySelector<HTMLElement>(".world-canvas")?.focus({preventScroll:true});else previous?.focus({ preventScroll: true }); };
  }, [open]);

  return <dialog ref={dialog} className="pause-menu" aria-labelledby="pause-title"
    onCancel={event => { event.preventDefault(); close(); }}
    onKeyDown={event => event.stopPropagation()}>
    <div className="pause-paper" data-map-open={mapOpen}>
      <div className="pause-overline"><span className="pause-compass" aria-hidden="true" /><span>Uma pausa no caminho</span></div>
      <h1 id="pause-title">{mapOpen ? "Mapa dos lugares" : "Fique um pouco."}</h1>
      <p className="pause-copy">Galeria: UnAPI, Jarvis e processo. Casa: arquivos e história.</p>
      <button ref={resume} className="pause-resume" onClick={event=>{dialog.current?.close();close();requestGameplayPointerLock(event);}}>Continuar explorando <span aria-hidden="true">↗</span></button>
      <button className="pause-map-toggle" aria-expanded={mapOpen} onClick={() => setMapOpen(value => !value)}>{mapOpen ? "Guardar o mapa" : "Abrir o mapa dos lugares"}</button>
      {mapOpen && <WorldMap />}
      <nav className="pause-links" aria-label="Acesso direto ao portfólio">
        <Link href="/projetos" onClick={close}>Ler os projetos <span>01</span></Link>
        <Link href="/perfil" onClick={close}>Sobre Matteo <span>02</span></Link>
        <Link href="/arquivo" onClick={close}>Arquivo pessoal <span>03</span></Link>
      </nav>
      <fieldset className="pause-preferences"><legend>Conforto</legend>
        <label><input type="checkbox" checked={reducedMotion} onChange={event => useExperienceState.getState().setReducedMotion(event.target.checked)} /> Movimento reduzido</label>
        <label><input type="checkbox" checked={lowQuality} onChange={event => useExperienceState.getState().setQuality(event.target.checked ? "low" : "balanced")} /> Renderização leve</label>
        <label><input type="checkbox" checked={ambientSound} disabled={audioPending} onChange={event => {
          const value = event.target.checked;
          setAudioPending(true);
          void setAmbientSound(value).then(() => { useExperienceState.getState().setAmbientSound(value); setAudioError(false); }).catch(() => setAudioError(true)).finally(() => setAudioPending(false));
        }} /> Sons do ambiente</label>
        {audioError && <p role="status">O navegador não conseguiu ativar o som.</p>}
      </fieldset>
      <fieldset className="pause-preferences mouse-preferences"><legend>Olhar com o mouse</legend>
        <label htmlFor="mouse-sensitivity">Sensibilidade <output>{Math.round(mouseSensitivity/.0025*100)}%</output></label>
        <input id="mouse-sensitivity" aria-label="Sensibilidade do mouse" type="range" min="0.0005" max="0.008" step="0.00025" value={mouseSensitivity} onChange={event=>useExperienceState.getState().setMouseSensitivity(Number(event.target.value))}/>
        <label><input type="checkbox" checked={invertMouseY} onChange={event=>useExperienceState.getState().setInvertMouseY(event.target.checked)}/> Inverter eixo Y do mouse</label>
        <label><input type="checkbox" checked={crosshair} onChange={event=>useExperienceState.getState().setCrosshair(event.target.checked)}/> Mira na primeira pessoa</label>
      </fieldset>
      <button className="pause-map-toggle" onClick={() => useExperienceState.getState().openArrival()}>Rever a chegada e os controles</button>
      <dl className="pause-controls">
        <div><dt>WASD / setas</dt><dd>Caminhar</dd></div>
        <div><dt>F5 / Câmera</dt><dd>Primeira pessoa → por trás → de frente</dd></div>
        <div><dt>Entrar / continuar</dt><dd>Mouse controla o olhar; Esc libera o cursor</dd></div>
        <div><dt>Arrastar / lado direito</dt><dd>Olhar ao redor sem captura</dd></div>
        <div><dt>Roda / pinça</dt><dd>Distância em terceira pessoa</dd></div>
        <div><dt>C</dt><dd>Recentralizar câmera</dd></div>
        <div><dt>E</dt><dd>Interagir / encerrar</dd></div>
        <div><dt>Esc</dt><dd>Voltar / pausar</dd></div>
      </dl>
      <footer className="pause-footer"><span>Matteo Lima Scotti</span><span aria-hidden="true">m.</span></footer>
    </div>
  </dialog>;
}
