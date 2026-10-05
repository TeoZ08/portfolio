"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PROJECTS, PROFILE, NOTES } from "@/content/portfolio";
import { ProjectArticle } from "@/content/ProjectArticle";
import { useExperienceState, type ArchiveApp } from "@/systems/experience-state";
import { Icon, type IconName } from "@/ui/Icon";
import { Wallpaper } from "./Wallpaper";

const APPS: { id: ArchiveApp; label: string; icon: IconName; subtitle: string }[] = [
  { id: "projects", label: "Projetos", icon: "folder", subtitle: "Ideias que ganharam forma" },
  { id: "faculty", label: "Faculdade", icon: "book", subtitle: "Ciência da Computação" },
  { id: "notes", label: "Notas", icon: "note", subtitle: "Cadernos & observações" },
  { id: "terminal", label: "Terminal", icon: "terminal", subtitle: "Um caminho por comandos" },
  { id: "about", label: "Matteo", icon: "person", subtitle: "Um pouco de contexto" },
  { id: "contact", label: "Contato", icon: "mail", subtitle: "Continuar a conversa" },
  { id: "settings", label: "Preferências", icon: "settings", subtitle: "A experiência no seu ritmo" },
];

function Preferences() {
  const reducedMotion = useExperienceState(state => state.reducedMotion);
  const quality = useExperienceState(state => state.quality);
  return <div className="document-page preferences-page">
    <p className="eyebrow">Do seu jeito</p><h1>Preferências</h1><p>Pequenos ajustes para uma visita confortável.</p>
    <label className="setting-row"><span><strong>Movimento reduzido</strong><small>Transições mais curtas e ambiente sem animação decorativa.</small></span><input type="checkbox" checked={reducedMotion} onChange={event => useExperienceState.getState().setReducedMotion(event.target.checked)} /></label>
    <label className="setting-row"><span><strong>Qualidade do mundo</strong><small>Econômica reduz resolução e sombras.</small></span><select value={quality} onChange={event => useExperienceState.getState().setQuality(event.target.value as "balanced" | "low")}><option value="balanced">Equilibrada</option><option value="low">Econômica</option></select></label>
    <div className="quiet-note"><Icon name="walk" /><p>Você também pode consultar todos os arquivos sem carregar o mundo 3D.</p><Link href="/arquivo">Abrir modo direto ↗</Link></div>
    <h2>Controles</h2><dl className="control-list"><div><dt>WASD / setas</dt><dd>Caminhar</dd></div><div><dt>Arrastar / dois dedos</dt><dd>Girar a câmera</dd></div><div><dt>Roda / pinça</dt><dd>Aproximar</dd></div><div><dt>C</dt><dd>Recentralizar câmera</dd></div><div><dt>E</dt><dd>Interagir / sair da interação</dd></div><div><dt>Esc</dt><dd>Voltar / abrir o menu</dd></div></dl>
  </div>;
}

function Terminal({ openApp }: { openApp: (app: ArchiveApp) => void }) {
  const [lines, setLines] = useState(["Arquivo pessoal de Matteo.", "Digite ajuda para conhecer os comandos. Este terminal só navega pelo portfólio."]);
  const [command, setCommand] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [lines]);
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = command.trim().toLowerCase();
    setCommand("");
    if (!value) return;
    if (value === "limpar" || value === "clear") { setLines([]); return; }
    const commands: Record<string, ArchiveApp> = { projetos: "projects", faculdade: "faculty", notas: "notes", sobre: "about", contato: "contact" };
    const response = value === "ajuda" || value === "help" ? "projetos · faculdade · notas · sobre · contato · limpar" : value === "ls" ? "projetos/   faculdade/   notas/   sobre.txt   contato.txt" : commands[value] ? `Abrindo ${value}…` : `Comando não encontrado: ${value}. Digite ajuda.`;
    setLines(previous => [...previous.slice(-60), `matteo ~ ${command.trim()}`, response]);
    if (commands[value]) openApp(commands[value]);
  }
  return <div className="terminal-page"><div role="log" aria-label="Saída do terminal">{lines.map((line, index) => <p key={index}>{line}</p>)}<div ref={endRef} /></div><form onSubmit={submit}><label htmlFor="terminal-command">matteo <span>~</span> $</label><input id="terminal-command" value={command} onChange={event => setCommand(event.target.value)} autoComplete="off" spellCheck={false} aria-label="Comando do terminal" /></form><span className="terminal-footnote">Sem acesso ao sistema, à rede ou aos seus arquivos.</span></div>;
}

export function Desktop({ initialApp = null, onExit, direct = false }: {
  initialApp?: ArchiveApp | null; onExit?: () => void; direct?: boolean;
}) {
  const [app, setApp] = useState<ArchiveApp | null>(initialApp);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string>(NOTES[0].id);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(direct);
  const [clock, setClock] = useState("—:—");
  const active = APPS.find(item => item.id === app);
  const project = PROJECTS.find(item => item.slug === projectSlug);
  const note = NOTES.find(item => item.id === noteId) ?? NOTES[0];
  const windowRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLElement>(null);

  function openApp(value: ArchiveApp) { setApp(value); setProjectSlug(null); setMinimized(false); }
  function goBack() { if (projectSlug) setProjectSlug(null); else if (app && !minimized) setMinimized(true); else onExit?.(); }

  useEffect(() => {
    const tick = () => setClock(new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    tick(); const timer = window.setInterval(tick, 30000); return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { if(app && !minimized) windowRef.current?.focus({ preventScroll: true }); }, [app, minimized]);
  useEffect(() => { if (onExit) desktopRef.current?.focus({ preventScroll: true }); }, [onExit]);

  return <section ref={desktopRef} tabIndex={onExit ? -1 : undefined} className={`desktop ${direct ? "desktop--direct" : ""}`} data-world-ui aria-label="Computador de Matteo" onKeyDown={event => {
    event.stopPropagation();
    if (event.key === "Escape") { event.preventDefault(); goBack(); }
  }}>
    <Wallpaper />
    <header className="desktop-menubar"><button className="desktop-wordmark" onClick={() => { setMinimized(true); }} aria-label="Mostrar mesa de trabalho"><span className="brand-mark">m.</span><span>arquivo pessoal</span></button><span className="desktop-menu-location">{active && !minimized ? active.label : "Mesa de trabalho"}</span><div className="desktop-status"><Icon name="sun" size={15} /><time suppressHydrationWarning>{clock}</time><button onClick={() => openApp("settings")} aria-label="Preferências"><Icon name="settings" size={17} /></button></div></header>
    <div className="desktop-shortcuts">{APPS.slice(0, 4).map(item => <button key={item.id} className={`desktop-file desktop-file--${item.id}`} onClick={() => openApp(item.id)}><span className="file-art"><Icon name={item.icon} size={33} /></span><span>{item.label}</span></button>)}</div>
    {(!app || minimized) && <div className="desktop-welcome"><span className="eyebrow">M. L. Scotti</span><h1>Fique à vontade.</h1><p>Projetos, estudos e anotações.<br />Os arquivos estão logo ali.</p><button onClick={() => openApp("projects")}>Abrir os projetos <Icon name="arrow" size={16} /></button></div>}
    {app && !minimized && <div ref={windowRef} tabIndex={-1} className={`desktop-window ${maximized ? "desktop-window--maximized" : ""}`} aria-label={active?.label}>
      <header className="window-titlebar"><div className="window-actions"><button onClick={() => { setApp(null); setProjectSlug(null); }} aria-label="Fechar janela" className="window-close"><Icon name="close" size={11} /></button><button onClick={() => setMinimized(true)} aria-label="Minimizar janela">−</button><button onClick={() => setMaximized(value => !value)} aria-label={maximized ? "Restaurar janela" : "Ampliar janela"}><Icon name="expand" size={10} /></button></div><span><Icon name={active?.icon ?? "folder"} size={14} />{project?.title ?? active?.label}</span><span className="window-owner">Matteo</span></header>
      <div className="window-layout"><nav className="file-sidebar" aria-label="Aplicativos"><p>MEUS ARQUIVOS</p>{APPS.filter(item => item.id !== "settings").map(item => <button key={item.id} aria-current={app === item.id ? "page" : undefined} onClick={() => openApp(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span></button>)}<div className="sidebar-bottom"><span className="little-status" /> arquivo vivo · 2026</div></nav>
        <div className="window-content">
          {(app === "projects" || app === "faculty") && (project ? <><button className="document-back" onClick={() => setProjectSlug(null)}>← Todos os arquivos</button><ProjectArticle project={project} /></> : <div className="project-directory"><div className="directory-heading"><p className="eyebrow">{app === "faculty" ? "Aprender, testar, registrar" : "Seleção de trabalhos"}</p><h1>{app === "faculty" ? "Faculdade" : "Projetos"}</h1><p>{active?.subtitle}. Abra um arquivo para conhecer o contexto e o processo.</p></div><div className="directory-columns"><span>ARQUIVO</span><span>CONTEXTO</span></div>{PROJECTS.filter(item => app !== "faculty" || item.category.startsWith("Formação")).map((item, index) => <button className="project-file-row" key={item.slug} onClick={() => setProjectSlug(item.slug)}><span className={`document-thumb document-thumb--${item.state}`}>{item.state === "available" ? <Icon name="home" size={30} /> : <Icon name="book" size={30} />}</span><span className="file-row-title"><small>{String(index + 1).padStart(2, "0")} / {item.state === "available" ? "ESTUDO DE CASO" : "REGISTRO"}</small><strong>{item.title}</strong><span>{item.description}</span></span><span className="file-row-category">{item.category.split(" · ")[0]}<Icon name="arrow" size={19} /></span></button>)}<p className="directory-note">Os projetos compartilham o mesmo conteúdo no mundo e no modo direto.</p></div>)}
          {app === "notes" && <div className="notes-layout"><nav aria-label="Cadernos">{NOTES.map(item => <button key={item.id} onClick={() => setNoteId(item.id)} aria-current={note.id === item.id ? "page" : undefined}><strong>{item.title}</strong><small>{item.date}</small></button>)}</nav><article className="document-page note-paper"><p className="eyebrow">{note.date}</p><h1>{note.title}</h1>{note.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="note-signature">Matteo</p></article></div>}
          {app === "about" && <article className="document-page about-page"><div className="profile-monogram">mls<span>caderno pessoal</span></div><p className="eyebrow">Sobre a pessoa por aqui</p><h1>{PROFILE.name}</h1>{PROFILE.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<Link className="text-link" href="/perfil" target="_blank">Abrir perfil para leitura / impressão ↗</Link></article>}
          {app === "contact" && <article className="document-page contact-page"><Icon name="mail" size={46} /><p className="eyebrow">Continuar a conversa</p><h1>Vamos nos conhecer.</h1>{PROFILE.links.length ? <ul>{PROFILE.links.map(link => <li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a></li>)}</ul> : <><p>Os canais públicos de contato ainda aguardam publicação.</p><p className="quiet-copy">Nenhum formulário coleta seus dados. Os links serão incluídos aqui quando confirmados pelo Matteo.</p></>}<div className="contact-signature">Matteo Lima Scotti</div></article>}
          {app === "terminal" && <Terminal openApp={openApp} />}
          {app === "settings" && <Preferences />}
        </div>
      </div>
      <footer className="window-statusbar"><span>{project ? "Documento" : active?.subtitle}</span><span>arquivo / {project?.slug ?? app}</span></footer>
    </div>}
    <nav className="desktop-dock" aria-label="Atalhos do computador">{APPS.filter(item => ["projects", "notes", "about", "contact"].includes(item.id)).map(item => <button key={item.id} onClick={() => openApp(item.id)} aria-label={item.label} title={item.label} className={app === item.id ? "is-active" : ""}><Icon name={item.icon} size={23} /></button>)}<span /><button onClick={() => openApp("settings")} aria-label="Preferências" title="Preferências"><Icon name="settings" size={23} /></button></nav>
    {onExit ? <button className="desktop-exit" onClick={onExit}><Icon name="walk" size={17} />Voltar ao quarto <kbd>Esc</kbd></button> : <Link className="desktop-exit" href="/"><Icon name="walk" size={17} />Explorar o mundo <Icon name="arrow" size={16} /></Link>}
  </section>;
}
