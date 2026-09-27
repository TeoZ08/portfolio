"use client";

import { useEffect } from "react";
import { useExperienceState, requestWorldInteraction, touchMovement } from "@/systems/experience-state";
import { useInteractionDebugState } from "@/world/interactions/interaction-state";
import { DevPanel } from "./DevPanel";
import { PauseMenu } from "./PauseMenu";

export function WorldPresentation() {
  const label=useInteractionDebugState(state=>state.candidateLabel);
  const status=useInteractionDebugState(state=>state.status);
  const debugVisible=useExperienceState(state=>state.debugVisible);
  const menuOpen=useExperienceState(state=>state.overlay === "menu");
  useEffect(()=>{
    const keyboard=(event:KeyboardEvent)=>{
      const state=useExperienceState.getState();
      if(event.key==="F2" && process.env.NODE_ENV!=="production") {
        event.preventDefault();
        if(!event.repeat) state.toggleDebug();
      }
      // Capture Escape only while exploring or inside the menu. An active
      // interaction keeps its existing Escape exit/cancellation behavior.
      if(event.key!=="Escape" || state.deviceActive) return;
      if(state.overlay === "menu" || (state.overlay === null && useInteractionDebugState.getState().status === "idle")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.repeat) return;
        touchMovement.x=0; touchMovement.z=0;
        if(state.overlay === "menu") state.closeOverlay(); else state.openMenu();
      }
    };
    window.addEventListener("keydown",keyboard,true);
    const clear=()=>{touchMovement.x=0;touchMovement.z=0;};
    window.addEventListener("blur",clear);document.addEventListener("visibilitychange",clear);
    return()=>{window.removeEventListener("keydown",keyboard,true);window.removeEventListener("blur",clear);document.removeEventListener("visibilitychange",clear);clear();useExperienceState.getState().closeOverlay();};
  },[]);
  const hint=status==="idle"?label:status==="approaching"?"Cancelar aproximação":status==="entering"||status==="exiting"?null:"Voltar a explorar";
  return <div className="world-presentation" data-world-ui>
    <button className="world-menu-access" aria-label="Pausa e arquivos (Escape)" disabled={status!=="idle"} onClick={()=>useExperienceState.getState().openMenu()}><span aria-hidden="true">···</span><span className="world-menu-access-label">Pausa e arquivos</span></button>
    {!menuOpen && hint && <button className="world-interaction-prompt" onClick={()=>requestWorldInteraction()}><kbd>E</kbd>{hint}</button>}
    {!menuOpen && <div className="touch-movement" aria-label="Controles de movimento">
      {([['↑',0,-1,'Frente'],['←',-1,0,'Esquerda'],['↓',0,1,'Trás'],['→',1,0,'Direita']] as const).map(([symbol,x,z,title])=><button key={title} aria-label={title} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);touchMovement.x=x;touchMovement.z=z;}} onPointerUp={()=>{touchMovement.x=0;touchMovement.z=0;}} onPointerCancel={()=>{touchMovement.x=0;touchMovement.z=0;}} onLostPointerCapture={()=>{touchMovement.x=0;touchMovement.z=0;}}>{symbol}</button>)}
    </div>}
    <PauseMenu open={menuOpen} />
    {process.env.NODE_ENV!=="production"&&debugVisible&&<DevPanel title="DEV / Mundo · F2 para ocultar" />}
  </div>;
}
