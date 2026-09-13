# Prompt 001 — Foundation

Você está iniciando a implementação técnica de um novo portfólio interativo em uma pasta nova e isolada do portfólio atualmente publicado.

## Leia primeiro

Leia integralmente:
- `AGENTS.md`
- `START_HERE.md`
- `docs/06-arquitetura-tecnica.md`
- `docs/08-production-os.md`

Não leia os demais documentos ainda, salvo se encontrar uma dependência conceitual necessária para esta tarefa.

## Objetivo desta tarefa

Criar somente a fundação técnica da aplicação e um ambiente de desenvolvimento mínimo. Não implementar o portfólio, mundo, casa, campo ou arte.

## In scope

1. Inicializar a aplicação com Next.js, React e TypeScript.
2. Adicionar React Three Fiber/Three.js somente se ainda não estiverem presentes.
3. Criar uma rota/página principal capaz de montar um `Canvas` vazio de desenvolvimento.
4. Criar estrutura mínima de pastas coerente com `docs/06-arquitetura-tecnica.md`.
5. Criar uma store mínima de world state com Zustand contendo apenas o necessário para provar a integração.
6. Criar um painel DEV extremamente simples, habilitado somente em desenvolvimento, mostrando pelo menos:
   - região atual;
   - um controle temporário de `timeOfDay`.
7. Garantir que build e typecheck funcionem.
8. Criar um README técnico curto com comandos para executar o projeto localmente.

## Out of scope

Não implemente:

- personagem;
- câmera inteligente;
- física;
- colisão;
- campo;
- casa;
- vegetação;
- modelos 3D;
- iluminação final;
- áudio;
- computador;
- case studies;
- menu de portfólio;
- navbar;
- hero;
- skills;
- projetos;
- arte visual;
- animações cinematográficas;
- mobile específico;
- persistência final.

O Canvas pode exibir apenas um fundo neutro e um helper mínimo de desenvolvimento. Não “embelezar” esta fase.

## Dependências

Antes de instalar qualquer dependência além das explicitamente previstas na arquitetura, explique por que ela seria necessária e espere aprovação.

## Critérios de aceite

1. Projeto inicia localmente sem erro.
2. Página principal monta sem warning relevante.
3. Canvas R3F monta corretamente.
4. Store de world state pode ser lida pelo Canvas e pelo painel DEV.
5. Painel DEV não aparece em produção.
6. `npm/pnpm build` passa.
7. Typecheck passa.
8. Nenhuma estrutura tradicional de portfólio foi criada.
9. Nenhuma arte substituta foi adicionada.

## Antes de alterar arquivos

Primeiro responda apenas com:

1. estrutura atual encontrada;
2. arquivos que pretende criar/alterar;
3. dependências que pretende usar;
4. plano em no máximo 8 passos;
5. riscos ou dúvidas.

Somente após aprovação explícita implemente.
