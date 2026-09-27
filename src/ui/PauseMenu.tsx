"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useExperienceState } from "@/systems/experience-state";

// Native modal semantics provide focus containment and keep pointer input off
// the Canvas. The existing semantic overlay flag blocks manual player input.
export function PauseMenu({ open }: { open: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const resume = useRef<HTMLButtonElement>(null);
  const close = useExperienceState(state => state.closeOverlay);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    resume.current?.focus();
    return () => { element?.close(); previous?.focus({ preventScroll: true }); };
  }, [open]);

  return <dialog ref={dialog} className="pause-menu" aria-labelledby="pause-title"
    onCancel={event => { event.preventDefault(); close(); }}
    onKeyDown={event => event.stopPropagation()}>
    <div className="pause-paper">
      <div className="pause-overline"><span className="pause-compass" aria-hidden="true" /><span>Uma pausa no caminho</span></div>
      <h1 id="pause-title">Fique um pouco.</h1>
      <p className="pause-copy">O mundo continua lá fora.</p>
      <button ref={resume} className="pause-resume" onClick={close}>Continuar explorando <span aria-hidden="true">↗</span></button>
      <nav className="pause-links" aria-label="Acesso direto ao portfólio">
        <Link href="/projetos" onClick={close}>Projetos <span>01</span></Link>
        <Link href="/perfil" onClick={close}>Sobre Matteo <span>02</span></Link>
        <Link href="/arquivo" onClick={close}>Arquivo pessoal <span>03</span></Link>
      </nav>
      <dl className="pause-controls">
        <div><dt>WASD / setas</dt><dd>Caminhar</dd></div>
        <div><dt>Arrastar no cenário</dt><dd>Olhar ao redor</dd></div>
        <div><dt>E</dt><dd>Interagir / encerrar</dd></div>
        <div><dt>Esc</dt><dd>Voltar / pausar</dd></div>
      </dl>
      <footer className="pause-footer"><span>Matteo Lima Scotti</span><span aria-hidden="true">m.</span></footer>
    </div>
  </dialog>;
}
