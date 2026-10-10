"use client";

import Link from "next/link";
import Image from "next/image";
import { GALLERY_ARTWORKS } from "@/content/gallery";
import { useEffect, useRef, useState } from "react";
import { findProject } from "@/content/portfolio";
import { searchStudy } from "@/content/study-search";
import { playChime } from "@/systems/ambient-audio";
import { requestWorldInteraction } from "@/systems/experience-state";
import { SUNSET_DEFAULT_HOUR } from "@/world/regions/field/field-daylight";
import { useWorldState } from "@/systems/world-state";

const TITLES: Record<string, readonly [string, string]> = {
  WORKSHOP_LIGHT_TABLE: ["Galeria · Processo", "A luz muda o lugar."],
  UNIVERSITY_NOTEBOOK: ["Galeria · Jarvis", "Um caderno com fontes."],
  COMMUNITY_WORKSHOP: ["Galeria · UnAPI", "Uma pausa antes do clique."],
  DOJO_PRACTICE: ["Dojang · Songahm", "Tempo para praticar."],
  FOREST_CHIMES: ["Bosque", "Três notas ao vento."],
};

function LightTable() {
  const time = useWorldState(state => state.timeOfDay);
  return <>
    <p>Experimente o mesmo mundo em outro horário. A luz, o céu e a distância das sombras respondem à sua escolha.</p>
    <fieldset className="place-choices"><legend>Hora do dia</legend>{[[9, "Manhã"], [SUNSET_DEFAULT_HOUR, "Fim de tarde"], [20, "Anoitecer"]].map(([hour, label]) => <button key={hour} aria-pressed={time === hour} onClick={() => useWorldState.getState().setTimeOfDay(Number(hour))}>{label}</button>)}</fieldset>
    <Link className="place-text-link" href="/projetos/portfolio-world">Por dentro deste portfólio ↗</Link>
  </>;
}
function StudyNotebook() {
  const project = findProject("jarvis-academico")!;
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const results = searchStudy(project.chapters, submitted);
  return <>
    <p>O Jarvis reúne materiais e mostra as evidências usadas nas respostas. Aqui você pode procurar trechos do estudo de caso.</p>
    <p className="place-caption">Busca local neste caderno. Os resultados são citações do projeto.</p>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(query.trim()); }}><label htmlFor="study-query">O que você quer entender?</label><div className="place-search"><input id="study-query" value={query} maxLength={160} onChange={event => setQuery(event.target.value)} placeholder="Ex.: como funciona o fallback?" /><button type="submit">Buscar</button></div></form>
    <div className="place-choices" aria-label="Sugestões de busca">{["RAG e fontes", "Fallback", "Arquitetura"].map(text => <button key={text} onClick={() => { setQuery(text); setSubmitted(text); }}>{text}</button>)}</div>
    <div aria-live="polite" className="place-results">{submitted && (results.length ? results.map(result => <blockquote key={result.text}><p>{result.text}</p><cite>Jarvis Acadêmico · {result.title}</cite></blockquote>) : <p>Nenhum trecho encontrado. Tente “fontes”, “ferramentas” ou “backend”.</p>)}</div>
    <div className="place-links"><Link href="/projetos/jarvis-academico">Ler o projeto ↗</Link><a href={project.links![0].href} target="_blank" rel="noreferrer">Abrir o Jarvis ↗</a></div>
  </>;
}
function CommunityWorkshop() {
  const [choice, setChoice] = useState<"check" | "click" | null>(null);
  return <>
    <p>Nas oficinas UnAPI, tecnologia aparece em tarefas do cotidiano. Experimente uma pequena decisão de segurança digital.</p>
    <div className="place-message"><span>Exemplo fictício · mensagem recebida</span><p>“Sua conta será bloqueada hoje. Entre neste link e informe sua senha para evitar o bloqueio.”</p></div>
    <p>Qual seria seu primeiro passo?</p>
    <div className="place-choices"><button aria-pressed={choice === "check"} onClick={() => setChoice("check")}>Conferir pelo canal oficial</button><button aria-pressed={choice === "click"} onClick={() => setChoice("click")}>Abrir o link da mensagem</button></div>
    <p className="place-feedback" role="status">{choice === "check" ? "Isso. Acesse o aplicativo ou site oficial por conta própria. Urgência e pedido de senha são motivos para parar e conferir." : choice === "click" ? "Pare antes de abrir. O link pode levar a uma página falsa. Confirme a informação por um canal oficial que você já conhece." : "Pare → confira → decida."}</p>
    <div className="place-links"><Link href="/projetos/portal-unapi">Conhecer o projeto ↗</Link><a href="https://pet-sistemas.github.io/unapi-oficinas/" target="_blank" rel="noreferrer">Visitar as oficinas ↗</a></div>
  </>;
}
function ExhibitionImages({project}:{project:"unapi"|"jarvis"}) {
  return <details className="gallery-captures"><summary>Ampliar as capturas da exposição</summary>
    {GALLERY_ARTWORKS.filter(a=>a.project===project).map(a=><figure key={a.id}><a href={a.src} target="_blank" rel="noreferrer" aria-label={`Abrir captura completa: ${a.title}`}><Image src={a.src} alt={a.alt} width={a.imageWidth} height={a.imageHeight} sizes="(max-width:600px) 90vw, 420px" /></a><figcaption>{a.title} · {a.caption}</figcaption></figure>)}
  </details>;
}
function ForestChimes() {
  const [last, setLast] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  return <><p>Toque uma lâmina por vez e escute a nota desaparecer entre as árvores.</p><div className="place-chime-keys">{["Sol", "Lá", "Dó"].map((note, index) => <button key={note} aria-label={`Tocar ${note}`} onClick={() => { void playChime(index).then(() => { setLast(note); setFailed(false); window.dispatchEvent(new CustomEvent("world:chime", { detail: index })); }).catch(() => setFailed(true)); }}>{note}</button>)}</div><p className="place-caption" role="status">{failed ? "O navegador não conseguiu ativar o áudio." : last ? `${last} · deixe a nota respirar.` : "O som começa apenas quando você tocar."}</p></>;
}
export function PlaceExperience({ targetId }: { targetId: string | null }) {
  const title = targetId ? TITLES[targetId] : undefined;
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!title) return;
    panel.current?.focus({ preventScroll: true });
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); requestWorldInteraction(true); }
      if (event.key !== "Tab") return;
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("button, a, input, select, summary, [tabindex='0']") ?? []).filter(item => item.getClientRects().length > 0 && (item.tagName === "SUMMARY" || !item.closest("details:not([open])")));
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keyboard, true);
    return () => window.removeEventListener("keydown", keyboard, true);
  }, [title]);
  if (!title) return null;
  return <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="place-title" className="place-experience" data-place={targetId}>
    <header><span className="place-overline">{title[0]}</span><button onClick={() => requestWorldInteraction(true)} aria-label="Fechar e voltar a explorar">Fechar <kbd>Esc</kbd></button></header>
    <h2 id="place-title">{title[1]}</h2>
    {targetId === "WORKSHOP_LIGHT_TABLE" && <LightTable />}
    {targetId === "UNIVERSITY_NOTEBOOK" && <><StudyNotebook /><ExhibitionImages project="jarvis" /></>}
    {targetId === "COMMUNITY_WORKSHOP" && <><CommunityWorkshop /><ExhibitionImages project="unapi" /></>}
    {targetId === "FOREST_CHIMES" && <ForestChimes />}
    {targetId === "DOJO_PRACTICE" && <><p>O Songahm Taekwondo faz parte da vida que quero construir. Este é o espaço reservado ao treino, à repetição e ao movimento.</p><p className="place-caption">Estudo livre de movimento: guarda, elevação do joelho e extensão controlada. Não representa uma forma oficial do Songahm.</p></>}
  </section>;
}
