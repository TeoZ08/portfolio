"use client";

import { useEffect } from "react";
import { Desktop } from "@/computer/Desktop";
import { requestCameraRecenter, useExperienceState, requestWorldInteraction, touchMovement, resetTouchControls } from "@/systems/experience-state";
import { useInteractionDebugState } from "@/world/interactions/interaction-state";
import {
  HOUSE_BOOKSHELF_TARGET_ID,
  HOUSE_COMPUTER_TARGET_ID,
  HOUSE_REFERENCE_BOARD_TARGET_ID,
} from "@/world/regions/house/house-interaction-targets";
import { DevPanel } from "./DevPanel";
import { TouchJoystick } from "./TouchJoystick";
import { PauseMenu } from "./PauseMenu";
import { Arrival, ExperiencePreferences } from "./Arrival";
import { PlaceExperience } from "./PlaceExperience";

const HOUSE_INSPECTIONS = {
  [HOUSE_REFERENCE_BOARD_TARGET_ID]: {
    title: "Mural de referências",
    lines: [
      "Estudos de computação conectam redes, inteligência artificial e arquitetura.",
      "Papéis e cadernos registram aprendizados e atividades de extensão.",
    ],
  },
  [HOUSE_BOOKSHELF_TARGET_ID]: {
    title: "Estante de estudos",
    lines: [
      "Livros e cadernos mantêm o aprendizado sempre ao alcance.",
      "Cartões de idiomas dividem espaço com anotações de estudo.",
    ],
  },
} as const;

export function WorldPresentation() {
  const label=useInteractionDebugState(state=>state.candidateLabel);
  const status=useInteractionDebugState(state=>state.status);
  const activeTargetId=useInteractionDebugState(state=>state.activeTargetId);
  const debugVisible=useExperienceState(state=>state.debugVisible);
  const overlay=useExperienceState(state=>state.overlay);
  const menuOpen=overlay === "menu";
  const deviceActive=useExperienceState(state=>state.deviceActive);
  const inspection=status==="using"
    ? HOUSE_INSPECTIONS[activeTargetId as keyof typeof HOUSE_INSPECTIONS]
    : undefined;
  useEffect(()=>{
    const shouldUseComputer=status==="using" && activeTargetId===HOUSE_COMPUTER_TARGET_ID;
    useExperienceState.getState().setDevice(shouldUseComputer);
  },[activeTargetId,status]);
  useEffect(()=>{
    const keyboard=(event:KeyboardEvent)=>{
      const state=useExperienceState.getState();
      if(event.key==="F2" && process.env.NODE_ENV!=="production") {
        event.preventDefault();
        if(!event.repeat) state.toggleDebug();
      }
      // Capture Escape only while exploring or inside the menu. The desktop
      // layer owns Escape while the visitor is using the computer.
      if(event.key!=="Escape" || state.deviceActive) return;
      if(state.overlay === "menu" || (state.overlay === null && useInteractionDebugState.getState().status === "idle")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.repeat) return;
        resetTouchControls();
        if(state.overlay === "menu") state.closeOverlay(); else state.openMenu();
      }
    };
    window.addEventListener("keydown",keyboard,true);
    const clear=()=>{touchMovement.x=0;touchMovement.z=0;};
    window.addEventListener("blur",clear);document.addEventListener("visibilitychange",clear);
    return()=>{window.removeEventListener("keydown",keyboard,true);window.removeEventListener("blur",clear);document.removeEventListener("visibilitychange",clear);clear();};
  },[]);
  useEffect(() => {
    if (status === "idle" && !menuOpen && !deviceActive) {
      document.querySelector<HTMLElement>(".world-canvas")?.focus({ preventScroll: true });
    }
  }, [status, menuOpen, deviceActive]);
  const hint=status==="idle"?label:status==="approaching"?"Cancelar aproximação":status==="entering"||status==="exiting"?null:"Voltar a explorar";
  return <div className="world-presentation" data-world-ui>
    {!deviceActive && <button className="world-menu-access" aria-label="Pausa e arquivos (Escape)" disabled={status!=="idle"} onClick={()=>useExperienceState.getState().openMenu()}><span aria-hidden="true">···</span><span className="world-menu-access-label">Pausa e arquivos</span></button>}
    {!menuOpen && !deviceActive && <button type="button" className="camera-help" onClick={requestCameraRecenter} aria-keyshortcuts="C" aria-label="Recentralizar câmera" title="Arraste: girar · trackpad: orbitar · roda: zoom · C: recentralizar"><span aria-hidden="true">↻</span> Câmera <kbd>C</kbd></button>}
    {!menuOpen && !deviceActive && status==="idle" && <div className="traversal-help" aria-label="Shift para correr, Espaço para saltar"><kbd>Shift</kbd> correr <span aria-hidden="true">·</span> <kbd>Espaço</kbd> salto</div>}
    {!menuOpen && !deviceActive && hint && <button className="world-interaction-prompt" onClick={()=>requestWorldInteraction()}><kbd>E</kbd>{hint}</button>}
    {!menuOpen && !deviceActive && inspection && <aside className="world-inspection-card" aria-live="polite" aria-labelledby="world-inspection-title">
      <span className="world-inspection-overline">Detalhe do quarto</span>
      <h2 id="world-inspection-title">{inspection.title}</h2>
      {inspection.lines.map(line=><p key={line}>{line}</p>)}
      <button type="button" onClick={()=>requestWorldInteraction(true)}><span>Voltar</span><kbd>Esc</kbd></button>
    </aside>}
    {overlay === null && !deviceActive && status === "idle" && <>
      <TouchJoystick />
      <button
        type="button"
        className="touch-jump"
        aria-label="Saltar"
        onPointerDown={event => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          event.preventDefault();
          touchMovement.jumpQueued = true;
        }}
        onClick={event => { if (event.detail === 0) touchMovement.jumpQueued = true; }}
      >
        <span aria-hidden="true">↑</span>
        <span>Salto</span>
      </button>
    </>}
    {status === "using" && !menuOpen && <PlaceExperience targetId={activeTargetId} />}
    <ExperiencePreferences />
    <Arrival />
    <PauseMenu open={menuOpen} />
    {deviceActive && <div className="world-device-overlay" aria-label="Computador do quarto"><Desktop onExit={()=>requestWorldInteraction(true)} /></div>}
    {process.env.NODE_ENV!=="production"&&debugVisible&&!deviceActive&&<DevPanel title="DEV / Mundo · F2 para ocultar" />}
  </div>;
}
