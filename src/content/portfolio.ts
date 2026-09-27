// Public editorial content only. Do not infer private project details or links.
export const PROFILE = {
  name: "Matteo Lima Scotti",
  shortName: "Matteo Scotti",
  description: "Ciência da Computação, projetos e um pouco da vida fora da tela.",
  about: [
    "Meu nome é Matteo Lima Scotti. Este espaço reúne minha formação em Ciência da Computação, projetos pessoais e experiências com tecnologia.",
    "Entre os assuntos que estudo estão software, redes, automação e inteligência artificial. Também há espaço para idiomas, extensão universitária e Taekwondo, que fazem parte da minha vida para além dos projetos.",
    "A casa, o campo e os objetos deste mundo foram pensados como uma forma de apresentar esse contexto. Você pode explorar com calma ou consultar os arquivos diretamente.",
  ],
  // Populate only with links supplied or verified by Matteo.
  links: [] as { label: string; href: string }[],
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  state: "available" | "editorial";
  year?: string;
  tools: readonly string[];
  chapters: readonly { title: string; paragraphs: readonly string[] }[];
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "portfolio-world",
    title: "Um portfólio para explorar",
    category: "Projeto pessoal · Web & 3D",
    description: "Um pequeno mundo habitado, com caminhos, objetos e um computador que abre os projetos.",
    state: "available",
    tools: ["Next.js", "React", "TypeScript", "Three.js", "React Three Fiber", "Rapier", "Zustand"],
    chapters: [
      { title: "Um lugar como ponto de partida", paragraphs: ["O projeto investiga uma forma espacial de apresentar um portfólio. O visitante chega por um caminho, atravessa o campo e encontra uma casa. Dentro dela, o computador dá acesso ao conteúdo profissional.", "A exploração é opcional. Os mesmos arquivos podem ser consultados diretamente, sem percorrer o cenário ou carregar a experiência 3D."] },
      { title: "Direção e processo", paragraphs: ["O desenvolvimento foi orientado por documentos de produto, experiência, identidade pessoal e direção artística. Player, câmera e interações foram construídos em um playground separado antes da composição do mundo.", "O cenário utiliza materiais foscos, uma paleta natural e iluminação de fim de tarde. No quarto, livros, anotações e objetos de uso cotidiano ajudam a contextualizar o ambiente."] },
      { title: "Como a experiência funciona", paragraphs: ["Next.js organiza as rotas e o conteúdo HTML. React Three Fiber apresenta o mundo, enquanto Rapier controla o movimento e as colisões do personagem.", "As interações compartilham alinhamento de posição e orientação. A câmera acompanha o deslocamento e pode ser girada manualmente. Dados físicos ficam em refs; as stores guardam mudanças semânticas, como a região e a interação ativa."] },
      { title: "Do mundo ao documento", paragraphs: ["A mesa conecta o espaço 3D ao desktop HTML. Projetos, notas e páginas diretas utilizam a mesma fonte de conteúdo, evitando versões diferentes de um mesmo trabalho.", "Este é o próprio projeto que você está visitando. A implementação e sua direção visual continuam abertas a refinamentos."] },
    ],
  },
  {
    slug: "jarvis-academico",
    title: "Jarvis Acadêmico",
    category: "Formação · Projeto acadêmico",
    description: "Um dos projetos escolhidos para integrar os arquivos da faculdade.",
    state: "editorial",
    tools: [],
    chapters: [{ title: "Registro em preparação", paragraphs: ["Jarvis Acadêmico faz parte da seleção de projetos deste portfólio. O estudo de caso ainda aguarda a inclusão das fontes, da participação individual e dos resultados verificados.", "Para não atribuir ao projeto funcionalidades ou resultados sem confirmação, este registro apresenta apenas as informações já documentadas."] }],
  },
];

export const NOTES = [
  { id: "place", title: "Por que um lugar?", date: "Sobre este espaço", body: ["Gosto da ideia de que um portfólio também possa ser visitado. Um caminho leva a uma casa; uma mesa leva a um projeto. Os objetos contam parte da história antes do texto.", "Para quem está com pouco tempo, os arquivos continuam a um clique. Não é necessário explorar tudo para encontrar o trabalho."] },
  { id: "study", title: "Na mesa de estudos", date: "Caderno aberto", body: ["Redes, arquitetura, compiladores e requisitos aparecem entre os temas da formação em Ciência da Computação.", "Este caderno reúne os assuntos que também inspiram os quadros, papéis e livros espalhados pela casa. Os estudos de caso serão publicados apenas com suas fontes e contexto."] },
  { id: "community", title: "Tecnologia no cotidiano", date: "Extensão & comunidade", body: ["As oficinas da UnAPI fazem parte do contexto deste mundo. Mouse e teclado, segurança digital, Gov.br e mobilidade com celular são alguns dos temas presentes nos materiais.", "O interesse está na tecnologia sendo compreendida e utilizada por pessoas diferentes, com atenção a tarefas concretas do dia a dia."] },
  { id: "practice", title: "Fora da tela", date: "Movimento & idiomas", body: ["O Taekwondo e o estudo de idiomas também têm lugar aqui. No quarto, aparecem de forma discreta, entre materiais de treino, livros e fichas de estudo.", "São partes da vida pessoal, sem a necessidade de virar metáforas sobre trabalho."] },
] as const;

export function findProject(slug: string) {
  return PROJECTS.find(project => project.slug === slug);
}
