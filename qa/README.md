# QA funcional do portfólio

Esta infraestrutura executa o produto real em Chrome, Next, React Three Fiber e Rapier. A fixture da GOAL18A contém 285 casos planejados; eles não representam 285 testes executados. O registro incremental distingue execução específica, parcial, manual e decisão pendente.

## Executar

Requer Node com `node:module.stripTypeScriptTypes`, dependências locais do projeto e Chrome instalado. Playwright é dependência de desenvolvimento, com versão fixa. Nenhuma dependência entra no bundle do mundo.

```sh
npm ci
npm run dev -- --port 3154
```

Em outro terminal, na mesma worktree:

```sh
npm run test:all
QA_BASE_URL=http://localhost:3154 QA_OUT=/caminho/absoluto/qa-nova QA_SUITE=regressions npm run test:functional
```

As suítes disponíveis são `regressions`, `journeys`, `content`, `controls`, `related`, `boundaries`, `surfaces`, `interiors`, `sequences`, `completion`, `turns`, `faults`, `contracts`, `preferences`, `small` e `all`. Um nome inválido ou seleção vazia falha, em vez de aprovar uma execução sem testes.

```sh
QA_SUITE=journeys QA_ONLY=JOURNEY.FRONT.ORIENTATION.ESC QA_OUT=/caminho/absoluto/qa-jornada npm run test:functional
QA_SUITE=surfaces QA_OUT=/caminho/absoluto/qa-superficies npm run test:functional
QA_OUT=/caminho/absoluto/qa-performance node qa/performance.mjs
node qa/build-registry.mjs /caminho/absoluto/relatorios
```

`QA_ONLY` aceita IDs separados por vírgulas. `QA_PHASE` identifica a rodada. Use diretórios novos para preservar evidências. `QA_CHROME` pode fornecer o executável do Chrome; o padrão é o canal instalado `chrome`. `QA_HEADED=1` abre janela somente quando houver ambiente autorizado para isso; não roubar foco da sessão compartilhada. As medições de performance usam `QA_BASELINE_URL` e `QA_CANDIDATE_URL`, com padrões 3152 e 3154, em série.

## Prova e limites

- Caminhada usa WASD/setas ou joystick CDP. O mapa público é setup complementar e tem evidência distinta da caminhada desde a Chegada.
- Os observers DEV apenas leem estados, geometria e contadores; o harness não escreve posição, câmera, stores ou colliders.
- Capturas têm nomes únicos por etapa. JSONs conservam inputs nativos, estados clonados, console, assertions e waypoints. `run.json` guarda SHA Git, alterações locais e fingerprint das fontes efetivamente disponíveis na rodada.
- Os tempos de tecla/contato são duração do gesto. Esperas de prontidão consultam sinais reais do produto. Calibração de C tem uma janela explícita de 90ms; não usar o frame anterior como baseline.
- `boundaries` mede distância XYZ efetiva fora/dentro com margem150mm. Igualdade e empate pertencem a testes de regra pura. Não alegar igualdade global perfeita a partir deles.
- Falhas de rede são fixtures isoladas, removidas antes do Retry. Negação de captura usa sandbox nativo. WebGL indisponível usa outro Chrome com `--disable-webgl`; não substitui `getContext` por mock.
- `failing` indica assertion não atendida; ainda requer diagnóstico para separar oracle errado de defeito. `harness-error` preserva timeout/seletor/rota, sem automaticamente reprovar produto.
- Touch é emulado. Alt+Tab do SO, IME, telefone físico e audibilidade humana ficam manuais. RAF não mede tempo de GPU nem certifica FPS do equipamento físico.

O registro usa adjudicação por GIVEN–WHEN–THEN em `fixtures/coverage-adjudication.json` e cenários obrigatórios da última execução. Um ID ligado a um teste não prova todas variantes desse contrato. Nenhuma operação desta infraestrutura faz merge, push ou deploy.

A suíte `faults` e o caso de storage malformado fazem injeção explícita de falha, em contexto novo. Não contam como navegação pública. `focus-probe.mjs` registra tentativa nativa de foco sem aprovar comportamento quando nenhum blur ocorre. `production-smoke.mjs` verifica a build servida em3155 sem globals DEV. O helper opcional `render-favicon.py` usa Pillow e a fonte Georgia Bold Italic instalada; não redistribui a fonte nem afeta runtime.
