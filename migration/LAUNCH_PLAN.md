# Estratégia segura de desenvolvimento e lançamento

## Recomendação

Não apagar nem reutilizar agora a pasta/repositório do portfólio que está publicado.

Ele já é referenciado em currículo, LinkedIn e outros lugares. Portanto deve continuar funcionando como produção estável enquanto o novo projeto é desenvolvido.

## Estrutura recomendada

No computador:

```text
Projetos/
├── portfolio-current/       # versão publicada, não tocar
└── portfolio-world-next/    # novo projeto
```

Idealmente, cada pasta possui seu próprio repositório Git.

## Por que um projeto separado

1. O Codex não recebe arquivos antigos e não tenta preservar padrões do portfólio anterior.
2. O site que já está publicado permanece estável.
3. Podemos destruir/refazer o novo projeto quantas vezes forem necessárias.
4. Preview/deploy pode ser testado sem afetar o URL de produção.
5. A troca final é reversível.

## O que fazer com o repositório atual

Não apagar.

Antes da migração final:
- criar uma tag ou branch de segurança, por exemplo `legacy-portfolio`;
- confirmar que o deploy atual funciona;
- guardar o commit atual como rollback.

## Desenvolvimento

Trabalhar apenas em `portfolio-world-next`.

Criar deploy de preview separado.

Não apontar o domínio/URL principal para o novo projeto até que:
- vertical slice esteja aprovado;
- conteúdo essencial esteja pronto;
- mobile esteja validado;
- performance esteja aceitável;
- links de projetos/CV/contato funcionem.

## Troca final

Há duas estratégias seguras.

### A. Mesmo repositório/mesmo URL

Quando a nova versão estiver pronta:
1. criar branch de migração no repo publicado;
2. substituir o conteúdo da aplicação pelo novo projeto, preservando `.git` e configurações realmente necessárias;
3. testar preview;
4. fazer merge para a branch de produção;
5. validar o URL real;
6. manter a tag/branch antiga para rollback.

### B. Novo projeto de deploy

Se o URL usa domínio próprio:
1. manter o projeto antigo no ar;
2. publicar o novo projeto separadamente;
3. validar;
4. apontar o domínio para o novo projeto;
5. manter o antigo disponível para rollback por algum tempo.

## O que não fazer

- não apagar o projeto publicado antes da nova versão estar pronta;
- não desenvolver diretamente em produção;
- não jogar arquivos novos sobre os antigos sem saber quais configurações estão sendo preservadas;
- não deixar o Codex ler o projeto antigo apenas para “se inspirar”, pois isso aumenta a chance de carregar padrões que estamos abandonando.
