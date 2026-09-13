# Portfolio World — Pré-produção

Este pacote reúne a direção criativa, de experiência e técnica do novo portfólio interativo de Matteo Lima Scotti.

A premissa é simples: o projeto não deve parecer um portfólio tradicional com efeitos visuais. Ele deve funcionar como um pequeno mundo autoral, explorável, no qual os lugares, objetos, cenas e interações revelam diferentes dimensões da vida do Matteo.

## Ordem de leitura

1. `START_HERE.md`
2. `AGENTS.md`
3. `docs/01-conceito.md`
4. `docs/02-experiencia.md`
5. `docs/03-direcao-artistica.md`
6. `docs/04-identidade-pessoal.md`
7. `docs/05-sistemas.md`
8. `docs/06-arquitetura-tecnica.md`
9. `docs/07-vertical-slice.md`
10. `docs/08-production-os.md`
11. `prompts/001-foundation.md`

## Regra principal

O Codex implementa. Ele não redefine o produto, a narrativa, a direção visual ou a arquitetura da experiência sem aprovação explícita.

## Estratégia de desenvolvimento

O desenvolvimento deve ocorrer em uma pasta/repositório separado do portfólio atualmente publicado. O portfólio atual permanece online até que a nova versão seja aprovada, testada e preparada para substituição.

## Execução técnica local

```bash
npm install --include=optional --omit=peer
npm run dev
npm run typecheck
npm run build
```
