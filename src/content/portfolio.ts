// Public editorial content only. Do not infer private project details or links.
export const PROFILE = {
  name: "Matteo Lima Scotti",
  shortName: "Matteo Scotti",
  description: "Software, experiências visuais e um pouco da vida fora da tela.",
  about: [
    "Sou Matteo Lima Scotti, estudante de Ciência da Computação e estagiário backend no CISSESI MS, trabalhando com softwares de segurança no trabalho.",
    "Gosto de construir coisas completas: o funcionamento por trás da tela e a experiência de quem usa. Quero seguir como desenvolvedor full stack. Extensão universitária, idiomas e Songahm Taekwondo também fazem parte da minha vida.",
    "A casa, o campo e os objetos deste mundo foram pensados como uma forma de apresentar esse contexto. Você pode explorar com calma ou consultar os arquivos diretamente.",
  ],
  // Public links verified from the project repositories.
  links: [
    { label: "GitHub", href: "https://github.com/TeoZ08" },
    { label: "Hugging Face", href: "https://huggingface.co/TeoZ08" },
  ] as { label: string; href: string }[],
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  state: "available" | "editorial";
  year?: string;
  tools: readonly string[];
  coverImage?: string;
  coverAlt?: string;
  coverCaption?: string;
  links?: readonly { label: string; href: string }[];
  gallery?: readonly { src: string; alt: string; caption: string }[];
  chapters: readonly { title: string; paragraphs: readonly string[] }[];
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "portal-unapi",
    title: "Portal UnAPI",
    category: "Extensão · Tecnologia no cotidiano",
    description: "Atividades e simulações para apoiar oficinas de informática: aprender fazendo, com situações reconhecíveis do dia a dia.",
    state: "available",
    tools: ["HTML", "CSS", "JavaScript", "Leaflet", "GitHub Pages"],
    links: [
      { label: "Visitar as oficinas", href: "https://pet-sistemas.github.io/unapi-oficinas/" },
      { label: "Código e documentação", href: "https://github.com/TeoZ08/homeUnapi" },
    ],
    chapters: [
      { title: "Aprender usando", paragraphs: ["O portal apoia as oficinas de informática da UnAPI UFMS. Reúne ferramentas práticas, vídeos e atividades de mouse e teclado, além de experiências sobre segurança digital e serviços do cotidiano.", "O material permite repetir uma tarefa, experimentar os controles e discutir as escolhas durante a oficina."] },
      { title: "Um ambiente de treinamento", paragraphs: ["Os guias de gov.br, prova de vida e assinatura eletrônica utilizam simulações educativas. Não realizam operações oficiais. O Desafio Antigolpe apresenta decisões em conversas fictícias de WhatsApp, e-mail e SMS com a orientação PARE → CONFIRA → DECIDA.", "As experiências de mobilidade incluem busca explícita de locais e planejamento de rotas. Não solicitam corridas reais nem processam pagamentos."] },
      { title: "Como foi construído", paragraphs: ["O site usa HTML, CSS e JavaScript, sem uma etapa de build. Os estilos compartilhados concentram tokens e elementos de navegação; cada atividade possui seu próprio comportamento.", "Os mapas de mobilidade usam Leaflet e serviços públicos de mapas e roteamento. As escolhas dessas atividades permanecem temporárias na sessão. O código e suas limitações estão documentados no repositório público."] },
    ],
  },
  {
    slug: "portfolio-world",
    title: "Um portfólio para explorar",
    category: "Projeto pessoal · Web & 3D",
    description: "Um pequeno mundo habitado, com caminhos, objetos e um computador que abre os projetos.",
    state: "available",
    tools: ["Next.js", "React", "TypeScript", "Three.js", "React Three Fiber", "Rapier", "Zustand"],
    chapters: [
      { title: "Um lugar como ponto de partida", paragraphs: ["O projeto investiga uma forma espacial de apresentar um portfólio. O visitante chega por um caminho, atravessa o campo e encontra uma casa. Dentro dela, o computador dá acesso ao conteúdo profissional.", "A exploração é opcional. Os mesmos arquivos podem ser consultados diretamente, sem percorrer o cenário ou carregar a experiência 3D. Movimento reduzido, renderização leve e som opcional ajudam a ajustar a visita."] },
      { title: "Direção e processo", paragraphs: ["O desenvolvimento foi orientado por documentos de produto, experiência, identidade pessoal e direção artística. Player, câmera e interações foram construídos em um playground separado antes da composição do mundo.", "O cenário utiliza materiais foscos, uma paleta natural e luz que pode mudar entre manhã, tarde e anoitecer. No quarto, livros, anotações e objetos de uso cotidiano ajudam a contextualizar o ambiente."] },
      { title: "Como a experiência funciona", paragraphs: ["Next.js organiza as rotas e o conteúdo HTML. React Three Fiber apresenta o mundo, enquanto Rapier controla o movimento e as colisões do personagem.", "As interações compartilham alinhamento de posição e orientação. A câmera acompanha o deslocamento e pode ser girada manualmente. Dados físicos ficam em refs; as stores guardam mudanças semânticas, como a região e a interação ativa."] },
      { title: "Do mundo ao documento", paragraphs: ["A mesa conecta o espaço 3D ao desktop HTML. Projetos, notas e páginas diretas utilizam a mesma fonte de conteúdo, evitando versões diferentes de um mesmo trabalho.", "Este é o próprio projeto que você está visitando. A casa, o ateliê, o pátio de estudos, o jardim comunitário, o dojang, o bosque e o mirante oferecem ações próprias. Um mapa permite chegar diretamente a cada lugar."] },
    ],
  },
  {
    slug: "jarvis-academico",
    title: "Jarvis Acadêmico",
    category: "Formação · Inteligência Artificial",
    description: "Assistente acadêmico com RAG, tool calling e evidências técnicas para consultar materiais, organizar estudos e tornar as respostas auditáveis.",
    state: "available",
    year: "2026",
    tools: ["Python", "FastAPI", "React", "Vite", "Docker", "BM25", "FAISS", "Hugging Face Spaces"],
    coverImage: "/assets/projects/jarvis/chat.webp",
    coverAlt: "Interface do Jarvis Acadêmico com chat, navegação e inspector de contexto",
    coverCaption: "JARVIS Acadêmico · interface de estudo",
    links: [
      { label: "Abrir sistema", href: "https://teoz08-jarvis-academico.hf.space" },
      { label: "GitHub", href: "https://github.com/TeoZ08/jarvis-academico" },
    ],
    gallery: [
      { src: "/assets/projects/jarvis/chat.webp", alt: "Tela principal do Jarvis Acadêmico", caption: "Chat, materiais, tarefas, agenda e contexto acadêmico na mesma sessão." },
      { src: "/assets/projects/jarvis/evidencias.webp", alt: "Painel de evidências técnicas do Jarvis Acadêmico", caption: "Painel dedicado a RAG, tool calling, fontes, scores e tratamento de erros." },
      { src: "/assets/projects/jarvis/fallback.webp", alt: "Fluxo do Jarvis operando com fallback sem LLM", caption: "O RAG local continua útil quando a LLM remota não está disponível." },
    ],
    chapters: [
      { title: "Um assistente para estudar com contexto", paragraphs: ["O JARVIS Acadêmico foi desenvolvido para a disciplina de Inteligência Artificial da FACOM/UFMS por Matteo Lima e Pedro Bertoncelo. A proposta reúne consulta de materiais, planejamento de estudos, exercícios, agenda e revisão ativa em uma interface única.", "Mais do que responder perguntas, o projeto procura deixar visível o caminho técnico de cada resposta: quais fontes foram recuperadas, quais ferramentas foram acionadas e quando o sistema precisou recorrer a um fallback."] },
      { title: "RAG com fontes e recuperação híbrida", paragraphs: ["Os documentos são divididos em chunks e recuperados antes da geração da resposta. O mecanismo suporta busca lexical com BM25, embeddings, FAISS e modo híbrido; a interface exibe fontes, scores e trechos usados como contexto.", "A base inicial foi criada em Markdown a partir dos conteúdos trabalhados na disciplina e pode ser ampliada com arquivos PDF, TXT e MD. Quando não há evidência suficiente no dataset, o sistema sinaliza a ausência de contexto em vez de atribuir uma fonte inexistente."] },
      { title: "Tool calling e fallback auditável", paragraphs: ["O agente pode acionar ferramentas para buscar material, planejar estudos, consultar ou adicionar eventos, gerar exercícios, iniciar revisão ativa e registrar dificuldades. Um painel de evidências registra entrada, saída resumida, fontes recuperadas e o JSON técnico usado na execução.", "Se a LLM remota falha durante a decisão de ferramentas, perguntas acadêmicas ainda podem acionar o RAG local por uma heurística simples. Com evidência disponível, os trechos são apresentados sem reescrita da LLM; sem evidência, a interface informa a limitação de forma explícita."] },
      { title: "Arquitetura e entrega", paragraphs: ["O frontend usa React e Vite; o backend usa FastAPI e concentra agente, integração com a LLM, RAG, ferramentas e persistência acadêmica. A integração de linguagem segue uma API OpenAI-compatible fornecida pelo ambiente LIA/UFMS, enquanto Docker empacota a aplicação para o deploy.", "O projeto está publicado no Hugging Face Spaces e mantém limitações documentadas: o dataset inicial é pequeno, a qualidade da recuperação depende dos materiais cadastrados e ambientes gratuitos podem impor limites de memória e latência. Essas restrições fazem parte do estudo de engenharia, não ficam escondidas da apresentação."] },
    ],
  },
];

export const NOTES = [
  { id: "place", title: "Por que um lugar?", date: "Sobre este espaço", body: ["Gosto da ideia de que um portfólio também possa ser visitado. Um caminho leva a uma casa; uma mesa leva a um projeto. Os objetos contam parte da história antes do texto.", "Para quem está com pouco tempo, os arquivos continuam a um clique. Não é necessário explorar tudo para encontrar o trabalho."] },
  { id: "study", title: "Na mesa de estudos", date: "Caderno aberto", body: ["Redes, arquitetura, compiladores e requisitos aparecem entre os temas da formação em Ciência da Computação.", "Este caderno reúne os assuntos que também inspiram os quadros, papéis e livros espalhados pela casa. Os estudos de caso deste arquivo utilizam fontes e contexto verificados."] },
  { id: "community", title: "Tecnologia no cotidiano", date: "Extensão & comunidade", body: ["As oficinas da UnAPI fazem parte do contexto deste mundo. Mouse e teclado, segurança digital, Gov.br e mobilidade com celular são alguns dos temas presentes nos materiais.", "O interesse está na tecnologia sendo compreendida e utilizada por pessoas diferentes, com atenção a tarefas concretas do dia a dia."] },
  { id: "practice", title: "Fora da tela", date: "Movimento & idiomas", body: ["O Songahm Taekwondo e o estudo de idiomas também têm lugar aqui. No quarto, aparecem de forma discreta, entre materiais de treino, livros e fichas de estudo.", "São partes da vida pessoal, sem a necessidade de virar metáforas sobre trabalho."] },
] as const;

export function findProject(slug: string) {
  return PROJECTS.find(project => project.slug === slug);
}
