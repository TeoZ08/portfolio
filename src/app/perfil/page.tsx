import type { Metadata } from "next";
import Link from "next/link";
import { PROFILE } from "@/content/portfolio";

export const metadata: Metadata = { title: "Perfil", description: PROFILE.description };
export default function ProfilePage() {
  return <main className="reading-page profile-reading"><header className="reading-navigation"><Link href="/arquivo">← Arquivo pessoal</Link><span className="brand-mark">m.</span></header><article className="document-page"><p className="eyebrow">Perfil pessoal</p><h1>{PROFILE.name}</h1><p className="article-lead">{PROFILE.description}</p>{PROFILE.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<h2>Áreas de interesse</h2><p>Software, redes, automação, inteligência artificial, extensão universitária, idiomas e Taekwondo.</p><p className="quiet-copy">Esta página contém apenas as informações confirmadas para publicação. Um currículo com instituições, datas e experiências ainda depende do conteúdo do autor.</p></article></main>;
}
