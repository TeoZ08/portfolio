import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS, findProject } from "@/content/portfolio";
import { ProjectArticle } from "@/content/ProjectArticle";

export function generateStaticParams() { return PROJECTS.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = findProject((await params).slug);
  return { title: project?.title ?? "Arquivo não encontrado", description: project?.description };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = findProject((await params).slug);
  if (!project) notFound();
  return <main className="reading-page"><header className="reading-navigation"><Link href="/arquivo">← Voltar aos arquivos</Link><Link href="/" className="brand-mark">m.</Link></header><ProjectArticle project={project} standalone /><footer className="reading-end"><Link href="/">Conhecer o mundo →</Link></footer></main>;
}
