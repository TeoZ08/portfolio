import type { Metadata } from "next";
import { Desktop } from "@/computer/Desktop";

export const metadata: Metadata = { title: "Arquivo pessoal", description: "Projetos, formação e notas de Matteo Lima Scotti. Acesso direto, sem exploração 3D." };
export default function ArchivePage() { return <main className="archive-page"><Desktop direct initialApp="projects" /></main>; }
