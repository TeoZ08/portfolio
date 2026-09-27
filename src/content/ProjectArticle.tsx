import Link from "next/link";
import type { Project } from "./portfolio";
import { Wallpaper } from "@/computer/Wallpaper";

export function ProjectArticle({ project, standalone = false }: { project: Project; standalone?: boolean }) {
  return <article className="project-article">
    <div className={`project-cover project-cover--${project.state}`}>
      {project.state === "available" ? <Wallpaper /> : <div className="document-sketch" aria-hidden="true"><span>J</span><i /><i /><i /></div>}
      <span className="cover-caption">{project.state === "available" ? "Um lugar para conhecer o trabalho" : "Arquivo acadêmico · registro em preparação"}</span>
    </div>
    <div className="article-body">
      <p className="eyebrow">{project.category}</p>
      <h1>{project.title}</h1>
      <p className="article-lead">{project.description}</p>
      {project.tools.length > 0 && <ul className="technology-line" aria-label="Tecnologias">{project.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>}
      {project.chapters.map((chapter, index) => <section key={chapter.title} className="article-chapter">
        <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
        <div><h2>{chapter.title}</h2>{chapter.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>)}
      <footer className="article-footer">
        <span>Matteo Lima Scotti · arquivo pessoal</span>
        {!standalone && <Link href={`/projetos/${project.slug}`} target="_blank" rel="noopener">Abrir página de leitura ↗</Link>}
      </footer>
    </div>
  </article>;
}
