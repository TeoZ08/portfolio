"""Write the human-review handoff only after release gates and a clean commit."""
from pathlib import Path
import datetime
import json
import re
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
project = Path(__file__).resolve().parents[1]
reg = json.loads((root / 'final-regressions/EVIDENCIAS/run.json').read_text())
assert reg.get('finishedAt') and len(reg['tests']) == 11
assert all(t['status'] == 'passing' for t in reg['tests'])
prod = json.loads((root / 'production-release/EVIDENCIAS/production-smoke.json').read_text())
assert prod.get('finishedAt') and all(f['status'] == 'passing' for f in prod['fixtures'])
assert json.loads((root / 'EVIDENCIAS/viewer-qa/report.json').read_text())['status'] == 'passing'
registry = json.loads((root / 'REGISTRO-285-CASOS.json').read_text())
assert len(registry) == 285 and len({c['case_ID'] for c in registry}) == 285
summary = json.loads((root / 'EVIDENCIAS/registry-summary.json').read_text())
cons = json.loads((root / 'EVIDENCIAS/consolidation-summary.json').read_text())
head = subprocess.check_output(['git', '-C', str(project), 'rev-parse', 'HEAD'], text=True).strip()
status = subprocess.check_output(['git', '-C', str(project), 'status', '--short'], text=True).strip()
assert not status
assert 'pass 133' in (root / 'EVIDENCIAS/release-tests.log').read_text()
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

def write(name, content):
    (root / name).write_text(content.strip() + '\n')

write('QA-FINAL.md', f'''
# QA final — GOAL18B

**GOAL18B EM PRÉVIA — AGUARDANDO APROVAÇÃO HUMANA — SEM PUBLICAÇÃO.**

Commit local `{head}`, branch `codex/goal18b-personalized-functional-qa`, base f1c01e4. Worktree limpa. Main e18A continuam f1c01e4 e limpas;166 fontes iguais ao baseline.1077 artefatos históricos18A foram verificados. Apenas o log live3152 recebeu requests adicionais, com o prefixo original intacto.

| Gate | Resultado | Evidência |
|---|---|---|
| Baseline existente |115/115, typecheck, build | EVIDENCIAS/baseline-*.log |
| Unidades atuais |133/133, zero falha/skip | EVIDENCIAS/release-tests.log |
| Typecheck e build final | passaram | EVIDENCIAS/release-typecheck.log; release-build.log |
| Regressões finais |11/11, D01–D09+D10/D11 | final-regressions/EVIDENCIAS/run.json |
| Jornadas completas |3/3,13 alvos/7 destinos/retorno | final-journeys-followup/EVIDENCIAS/run.json |
| Controles e mapas |12 perfis+2 mapas verdes, zero erro | final-native/EVIDENCIAS/run.json |
| Produção | desktop/touch,3 câmeras,arquivo,zero erro | production-release/EVIDENCIAS/production-smoke.json |
| Globals de QA em produção | environment/avatar/recovery ausentes | produção, mesma evidência |
| Crítica visual |2 rodadas+foco sage,11 comparativos | CICLOS-VISUAIS.md; COMPARATIVOS/index.html |
| Relatório HTML |11 pares decodificados,1280/390 sem overflow | EVIDENCIAS/viewer-qa/report.json |
| Performance | comparação serial e3 ciclos | PERFORMANCE.md |
| Isolamento | main/18A preservados | EVIDENCIAS/ISOLATION-VALIDATION.json |
| Diff | sem whitespace error | git diff f1c01e4 HEAD --check |

Não existe script lint no projeto. Produção local3155 tem hooks DEV desabilitados mesmo com queries;3154 permanece para revisão e3152 como baseline.

## Cobertura sem inflação

{summary['counts']}. Cobertura completa de casos: {summary['casePassingPercent']:.2f}%; ponderada: {summary['riskPassingPercent']:.2f}%. {cons['latestDistinctPassingScenarios']} cenários distintos com última execução verde e {cons['latestVerifyRecords']} registros verify nessa seleção, além de asserts internos. Isso não representa285 testes E2E aprovados.

Foco real, trackpad/telefone/IME e audição continuam manuais. Os13 limiares têm fora/dentro; igualdade global fica parcial. Os13 BACK têm orientação e escopos traseiros próprios, não contornos universais. Valores/tempos físicos não medidos permanecem parciais. H09 tem duas políticas propostas e nenhuma alteração arbitrária. Falha injetada não valida rota pública.

Falhas históricas foram preservadas: selectors, waypoints dentro de collider, readiness, capa+galeria confundidas, RootState.traverse,44px medidos durante animação, canto FIELD rotulado HOUSE e yaw comparado depois de retomar olhar. F5 durante FIELD fade mantém ciclo sem reload: modo imutável era um oracle errado. Controles antigos tinham D10 no console apesar de asserts verdes; foram repetidos estritamente depois da correção.

Nenhum merge, push, deploy, PR ou mudança de Codex/Xpra/GNOME. Advisories pré-existentes estão em EVIDENCIAS/dependency-audit.json, sem migração não autorizada. Nenhuma outra GOAL foi iniciada.
''')
write('CHECKPOINT.md', f'''
# GOAL18B — fase técnica concluída, aprovação pendente

Atualizado em {now}. Commit local `{head}`. Worktree `{project}`, branch `codex/goal18b-personalized-functional-qa`, base f1c01e4. Main e18A preservadas. Nenhum job de QA pendente.

D01–D09 corrigidos após RED real; D10/D11 adicionais.133 unidades, typecheck, build e11 regressões finais passaram. Jornadas13/7, controles12 perfis, conteúdo, negativos, recuperação injetada separada e produção desktop/touch têm evidências. Duas críticas visuais, performance e11 comparativos conservados.

285 casos: {summary['counts']}. Cobertura completa {summary['casePassingPercent']:.2f}%; ponderada {summary['riskPassingPercent']:.2f}%. GWT e escopos estão no registro. Parciais/manuais não são passes integrais.

Próximo passo: somente revisão humana. H09: retomar quarto versus reiniciar Chegada. Telefone/trackpad/foco do SO/audição exigem hardware. Não iniciar GOAL19, integrar ou publicar por inferência.

Previews próprios3154 DEV e3155 produção;3152 original mantida. Harnesses terminalizados. Antes de retomar, conferir ocupação e SHA. Novas execuções precisam de pastas únicas; nunca sobrescrever18A.
''')
write('HANDOFF.md', f'''
# GOAL18B — revisão humana pendente

**GOAL18B EM PRÉVIA — AGUARDANDO APROVAÇÃO HUMANA — SEM PUBLICAÇÃO.**

Worktree `{project}`, branch `codex/goal18b-personalized-functional-qa`, HEAD `{head}`. Histórico local em git log, incluindo b3b6667 e3820cb8. Base única f1c01e4; main/18A limpas. Nenhum push, merge, deploy ou PR.

Ler [00-LEIA-ME](00-LEIA-ME.md), [QA final](QA-FINAL.md), [comparativos](COMPARATIVOS/index.html), [registro285](REGISTRO-285-CASOS.csv), [cobertura](COBERTURA-E-RISCOS.md), [regressões](REGRESSOES-D01-D09.md), [decisões](DECISOES-PENDENTES.md) e [índice](EVIDENCIAS/INDICE.md).

133 testes/typecheck/build,11 regressões, jornadas13/7, controles12 perfis e produção desktop/touch passaram. Registro honesto: {summary['counts']}. H09/hardware aguardam humano; nenhuma política de destino SPA foi imposta.

[Prévia3154](http://localhost:3154/?avatarQA), [produção3155](http://localhost:3155/) e baseline3152 mantida. qa/README.md contém reprodução. Nenhuma outra GOAL iniciada.
''')
write('00-LEIA-ME.md', f'''
# GOAL18B em prévia

**AGUARDANDO APROVAÇÃO HUMANA — SEM PUBLICAÇÃO.**

Nove regressões originais corrigidas, além de D10(captura do mouse) e D11(favicon).133 testes, typecheck, build e produção desktop/touch passaram. Jornadas pelos13 alvos/7 destinos,12 perfis de controle, PC/Galeria profundos e negativos preservam17h30, fog, Hanok, avatar e conteúdo.

285 casos: {summary['counts']}. Cobertura completa {summary['casePassingPercent']:.2f}% e ponderada {summary['riskPassingPercent']:.2f}%. Parciais/manuais conservam limites explícitos; não há alegação de285 passes.

1. [Comparativos reais](COMPARATIVOS/index.html) e [prévia3154](http://localhost:3154/?avatarQA).
2. [QA final](QA-FINAL.md), [regressões](REGRESSOES-D01-D09.md) e [críticas visuais](CICLOS-VISUAIS.md).
3. [RegistroCSV](REGISTRO-285-CASOS.csv)/[JSON](REGISTRO-285-CASOS.json), [cobertura](COBERTURA-E-RISCOS.md), [implementação](IMPLEMENTACAO-TESTES.md), [matriz](MATRIZ-CATEGORIAS.csv).
4. [Performance](PERFORMANCE.md), [decisões H09/hardware](DECISOES-PENDENTES.md), [índice/hash](EVIDENCIAS/INDICE.md), [handoff](HANDOFF.md).

Branch `codex/goal18b-personalized-functional-qa`, commit `{head[:7]}`. Main,18A e previews anteriores preservados. Próximo passo é revisão humana; publicação exige autorização futura.
''')
write('SCREENSHOTS/README.md', '''
# Capturas preservadas

Originais em `<rodada>/SCREENSHOTS/`, ligados a steps JSON. Não foram movidos, duplicados ou editados. Use ../COMPARATIVOS/index.html e ../EVIDENCIAS/INDICE.json.

favicon-approved-mark.png é preview gerado de asset, não captura de browser. Viewer QA é captura do relatório, não gameplay. O índice distingue as classes.
''')
# Readable prose spacing, keeping code and Markdown targets intact.
for name in ['QA-FINAL.md', 'CHECKPOINT.md', 'HANDOFF.md', '00-LEIA-ME.md', 'REGRESSOES-D01-D09.md', 'COBERTURA-E-RISCOS.md', 'IMPLEMENTACAO-TESTES.md', 'DECISOES-PENDENTES.md', 'CICLOS-VISUAIS.md', 'PERFORMANCE.md']:
    file = root / name
    lines = []
    in_code = False
    for line in file.read_text().splitlines():
        if line.startswith('```'):
            in_code = not in_code
        if not in_code:
            pieces = re.split(r'(`[^`]*`|\]\([^)]*\))', line)
            for i in range(0, len(pieces), 2):
                pieces[i] = re.sub(r'(?<![A-Za-z0-9_./])(\d+(?:[.,]\d+)?)([A-Za-zÀ-ÿ])', r'\1 \2', pieces[i])
            line = ''.join(pieces)
        lines.append(line)
    file.write_text('\n'.join(lines) + '\n')
proof = {'observedAt': now, 'head': head, 'gitStatus': status, 'unitTests': 133, 'finalRegressions': 11, 'cases': 285, 'counts': summary['counts'], 'productionDesktopTouch': 'passing', 'comparisonViewer': 'passing', 'humanApprovalPending': True, 'publication': 'none'}
(root / 'EVIDENCIAS/FINAL-VALIDATION.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
print('Human-review handoff saved', head)
