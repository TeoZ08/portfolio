"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

export function WorldUnavailable() {
  return <section className="world-unavailable" aria-labelledby="world-unavailable-title"><span className="place-overline">Matteo Lima Scotti</span><h1 id="world-unavailable-title">Os projetos continuam aqui.</h1><p>Não foi possível iniciar o mundo 3D neste navegador. Você pode conhecer os trabalhos e ler sobre mim nas páginas abaixo.</p><nav aria-label="Portfólio sem 3D"><Link href="/projetos">Ver projetos ↗</Link><Link href="/perfil">Sobre Matteo ↗</Link><Link href="/arquivo">Arquivo pessoal ↗</Link></nav><button onClick={() => window.location.reload()}>Tentar abrir o mundo novamente</button></section>;
}
export class WorldAvailability extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <WorldUnavailable /> : this.props.children; }
}
