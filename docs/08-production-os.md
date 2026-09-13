# v0.8 — Production Documentation & Codex Operating System

## Objetivo

Transformar a pré-produção em um processo que o Codex consiga executar com pouca ambiguidade, inclusive utilizando um modelo mais econômico em raciocínio máximo.

## Regra de granularidade

Cada tarefa deve conter:

1. **um objetivo técnico principal**;
2. **um conjunto pequeno de arquivos**;
3. **um escopo explícito**;
4. **critérios de aceite verificáveis**;
5. **um teste claro**.

Evitar tarefas como:
> “Implemente o vertical slice.”

Preferir:
> “Implemente movimento cinemático do player no playground de teste, sem arte final e sem modificar câmera.”

## Estrutura de documentação

```text
/
├── AGENTS.md
├── START_HERE.md
├── docs/
│   ├── 01-conceito.md
│   ├── 02-experiencia.md
│   ├── 03-direcao-artistica.md
│   ├── 04-identidade-pessoal.md
│   ├── 05-sistemas.md
│   ├── 06-arquitetura-tecnica.md
│   ├── 07-vertical-slice.md
│   ├── 08-production-os.md
│   ├── DECISIONS.md
│   └── TASK_TEMPLATE.md
├── prompts/
│   └── 001-foundation.md
└── skills/
    └── linguagem-profissional-natural.md
```

## Fluxo de trabalho

### Antes de uma tarefa

O prompt informa exatamente:
- quais documentos ler;
- quais arquivos inspecionar;
- o que não tocar.

O agente apresenta um plano curto.

### Durante

O agente:
- respeita escopo;
- não implementa extras;
- não muda direção visual;
- não adiciona dependências sem justificativa.

### Depois

Relatório obrigatório:
- arquivos alterados;
- resumo objetivo;
- comandos executados;
- testes executados;
- limitações conhecidas;
- próximo risco técnico, se houver.

## Modelo recomendado

Usar o modelo econômico/rápido em raciocínio máximo como padrão.

Escalar para um modelo mais caro apenas quando houver:
- bug persistente;
- decisão arquitetônica difícil;
- regressão que o modelo não consegue isolar;
- problema gráfico/matemático complexo;
- repetidas tentativas falhas.

A divisão de trabalho existe exatamente para reduzir a necessidade de usar o modelo mais caro em tarefas rotineiras.

## Política de commits

Um milestone técnico deve produzir commits pequenos e compreensíveis.

Nunca misturar:
- refactor amplo;
- nova feature;
- mudança visual;
- atualização de dependências

no mesmo commit sem necessidade.

## Gate de milestone

Uma tarefa só avança quando:
- build passa;
- typecheck/lint relevantes passam;
- fluxo solicitado funciona;
- nenhum comportamento fora de escopo foi adicionado;
- revisão visual/técnica foi aprovada quando aplicável.

## Como iniciar novo chat do Codex

Primeira mensagem deve:

1. informar que o projeto possui documentação local;
2. pedir leitura de `AGENTS.md`, `START_HERE.md` e documentos específicos da tarefa;
3. proibir alterações antes de apresentar plano;
4. executar somente o prompt do milestone atual.

Não enviar toda a história da conversa. A documentação é a fonte de contexto.
