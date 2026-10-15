"use client";

import { useWorldState } from "@/systems/world-state";
import { useEffect } from "react";
import {usePointerControl,requestGameplayPointerLock,releaseGameplayPointerLock} from "@/world/camera/pointer-lock";
import {useCameraState} from "@/world/camera/camera-state";
import {CAMERA_MODE_LABELS} from "@/world/camera/camera-perspectives";
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

const PROJECT_CONTEXT: Record<string, string> = {
  WORKSHOP_LIGHT_TABLE: "Galeria · processo e imagens deste mundo",
  UNIVERSITY_NOTEBOOK: "Galeria · Jarvis Acadêmico e fontes",
  COMMUNITY_WORKSHOP: "Galeria · Portal UnAPI e oficinas",
  HOUSE_COMPUTER: "Casa · projetos, estudos e sobre Matteo",
};

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
  const transitionActive = useWorldState(state => state.transitionActive);
  const pointerStatus=usePointerControl(state=>state.status);
  const pointerReady=usePointerControl(state=>state.ready);
  const crosshair=useExperienceState(state=>state.crosshair);
  const cameraMode=useCameraState(s=>s.mode);
  const blockedReason = useInteractionDebugState(state => state.candidateBlockedReason);
  const candidateId=useInteractionDebugState(state=>state.candidateId);
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
      if(event.key==='Escape' && document.pointerLockElement)releaseGameplayPointerLock();
      if(event.key!=="Escape" || state.deviceActive || useWorldState.getState().transitionActive) return;
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
    if (status === "idle" && !transitionActive && !menuOpen && !deviceActive) {
      document.querySelector<HTMLElement>(".world-canvas")?.focus({ preventScroll: true });
    }
  }, [status, transitionActive, menuOpen, deviceActive]);
  const hint=status==="idle"?label:status==="approaching"?"Cancelar aproximação":status==="entering"||status==="exiting"?null:"Voltar a explorar";
  return <div className="world-presentation" data-world-ui>
    {!deviceActive && <button className="world-menu-access" aria-label="Mapa e projetos · pausa e arquivos (Escape)" disabled={status!=="idle" || transitionActive} onClick={()=>useExperienceState.getState().openMenu()}><span aria-hidden="true">···</span><span className="world-menu-access-label">Mapa e projetos</span></button>}
    {overlay===null && !deviceActive && status==='idle' && <button type="button" className="camera-mode-control" aria-keyshortcuts="F5" aria-label={`Câmera F5: ${CAMERA_MODE_LABELS[cameraMode]}`} onClick={()=>{useCameraState.getState().cycle();document.querySelector<HTMLElement>(".world-canvas")?.focus({preventScroll:true});}}><span>Câmera <kbd>F5</kbd></span><span aria-live="polite">{CAMERA_MODE_LABELS[cameraMode]}</span></button>}
    {overlay===null && !deviceActive && status==='idle' && <div className="mouse-control-status" data-pointer-status={pointerStatus}>
      {pointerStatus==='locked'?<span role="status">Mouse controla o olhar · Esc libera</span>:<button type="button" disabled={!pointerReady || pointerStatus==='pending'} onClick={requestGameplayPointerLock}>
        <span>{!pointerReady?'Preparando o mundo…':pointerStatus==='denied'?'Captura não permitida':pointerStatus==='unavailable'?'Mouse livre':pointerStatus==='pending'?'Capturando mouse…':'Mouse livre'}</span>
        <strong>{pointerStatus==='denied' || pointerStatus==='unavailable'?'Tentar capturar · ou arraste para olhar':'Clique para controlar o olhar'}</strong>
      </button>}
    </div>}
    {crosshair && cameraMode==='first-person' && pointerStatus==='locked' && overlay===null && !deviceActive && status==='idle' && <span className="camera-crosshair" aria-hidden="true">+</span>}
    {!menuOpen && !deviceActive && <button type="button" className="camera-help" onClick={requestCameraRecenter} aria-keyshortcuts="C" aria-label="Recentralizar câmera" title="Clique: capturar mouse · Esc: soltar · arraste: olhar · roda: distância em terceira pessoa · C: recentralizar"><span aria-hidden="true">↻</span> Câmera <kbd>C</kbd></button>}
    {!menuOpen && !deviceActive && status==="idle" && <div className="traversal-help" aria-label="Shift para correr, Espaço para saltar"><kbd>Shift</kbd> correr <span aria-hidden="true">·</span> <kbd>Espaço</kbd> salto</div>}
    {!menuOpen && !deviceActive && hint && <button className="world-interaction-prompt" disabled={status === "idle" && !!blockedReason} aria-describedby={status === "idle" && blockedReason ? "world-approach-feedback" : undefined} onClick={()=>requestWorldInteraction()}><kbd>E</kbd><span>{hint}{status === "idle" && candidateId && PROJECT_CONTEXT[candidateId] && <small className="interaction-context">{PROJECT_CONTEXT[candidateId]}</small>}</span></button>}
    {!menuOpen && !deviceActive && overlay === null && status === "idle" && blockedReason &&
      <p id="world-approach-feedback" className="world-approach-feedback" role="status">{blockedReason}</p>}
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
