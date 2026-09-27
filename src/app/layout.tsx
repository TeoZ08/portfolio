import type { Metadata } from "next";
import "./globals.css";
import "@/ui/experience.css";
import "@/computer/desktop.css";

export const metadata: Metadata = {
  title: { default: "Matteo Scotti — Um lugar para explorar", template: "%s · Matteo Scotti" },
  description: "Um mundo pessoal e explorável. Conheça os projetos, estudos e experiências de Matteo Lima Scotti, no seu ritmo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
