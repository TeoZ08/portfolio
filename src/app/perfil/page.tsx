import type { Metadata } from "next";
import Link from "next/link";
import { PROFILE } from "@/content/portfolio";

export const metadata: Metadata = { title: "Perfil", description: PROFILE.description };
export default function ProfilePage() {
  return <main className="reading-page profile-reading"><header className="reading-navigation"><Link href="/arquivo">← Arquivo pessoal</Link><span className="brand-mark">m.</span></header><article className="document-page"><p className="eyebrow">Perfil pessoal</p><h1>{PROFILE.name}</h1><p className="article-lead">{PROFILE.description}</p>{PROFILE.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<h2>Áreas de interesse</h2><p>Software, redes, automação, inteligência artificial, extensão universitária, idiomas e Songahm Taekwondo.</p><nav className="profile-public-links" aria-label="Links públicos de Matteo">{PROFILE.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</nav></article></main>;
}
