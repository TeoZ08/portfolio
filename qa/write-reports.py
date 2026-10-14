"""Consolidate observed GOAL18B runs without replacing historical evidence."""
from pathlib import Path
from collections import Counter, defaultdict
import json, csv, html, subprocess, datetime, sys
root=Path(sys.argv[1]).resolve(); project=Path(__file__).resolve().parents[1]
registry=json.loads((root/'REGISTRO-285-CASOS.json').read_text()); summary=json.loads((root/'EVIDENCIAS/registry-summary.json').read_text())
runs=[]; latest={}; red={}
for file in root.glob('*/EVIDENCIAS/run.json'):
 d=json.loads(file.read_text());runs.append((file,d))
for file,d in sorted(runs,key=lambda x:x[1]['startedAt']):
 for t in d['tests']:
  item=(file,t)
  if 'red' in d['phase'] or ':3152' in d.get('baseURL',''):
   if t['status']=='failing':red[t['id']]=item
  else:latest[t['id']]=item
head=subprocess.check_output(['git','-C',str(project),'rev-parse','HEAD'],text=True).strip()
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
write=lambda name,text:(root/name).write_text(text.rstrip()+'\n')
items=[]
fixes={
'D01':('Escape do PC','Foco voltou ao BODY após remoção da row/link; Escape não chegou ao Desktop.','Foco da janela/desktop acompanha app, minimização e projectSlug; três Esc navegam até o quarto.','src/computer/Desktop.tsx','article-after-Esc'),
'D02':('Persistência no arquivo direto','low/reduced sumiam no refresh quando a primeira rota era arquivo.','Bootstrap de preferências também em arquivo, com showArrival=false.','src/app/arquivo/page.tsx; src/ui/Arrival.tsx','after-reload'),
'D03':('Queda em DEV','SpawnFIELDz26 fica fora do pisoDEVz±7; queda/recovery repetidos.','SpawnDEVz4,5; piso e dois alvos públicos alcançáveis. FIELD/HOUSE preservados.','src/world/player/player-motion.ts; src/world/player/DevPlayer.tsx','spawn'),
'D04':('Teto da Casa','Câmera terceira pessoa passa acima do teto visual em pitch extremo.','Enclosure e collider compartilham HOUSE_CEILING; esfera encontra teto antes da lente atravessar.','src/world/regions/house/house-layout.ts; HouseInterior.tsx; HouseShell.tsx','extreme'),
'D05':('Aproximação atrás de bancos','Prompt oferecia sentar, mas approach retilíneo encontrava collider e prendia input.','Sweep de corredor para dois bancosFIELD recusa antes de travar, informa contorno; frontais continuam funcionando.','src/world/interactions/InteractionSystem.tsx; src/ui/WorldPresentation.tsx','HILL_BENCH-rear-after'),
'D06':('Nome acessível dos apps','Seis ícones mobile com name vazio no AX nativo.','aria-label preserva nome independente do span oculto; AX, tap e teclado conferidos.','src/computer/Desktop.tsx','sidebar'),
'D07':('Área de toque das janelas','Handlers14×14px, próximos. Centros automatizados funcionavam.','Círculos visuais14px conservados; handlers44×44 semoverlap; tap fora do visual confirma área real.','src/computer/desktop.css','hitbox'),
'D08':('Movimento reduzido HTML','Manualtrue deixava window-appear220ms.','Data attribute/estado e mediaquery reduzem CSS a10ms; fontes de preferência testadas separadas.','src/computer/Desktop.tsx; desktop.css','manual-reduced'),
'D09':('Menu durante fade','Callback replace publicavaidle durante runtimeentering, habilitando pedido de mapa ignorado.','TransitionActive também gateia menus; callback replace não reseta debug; sequência rápida bloqueia menu, lenta viaja.','src/ui/WorldPresentation.tsx; src/world/interactions/InteractionSystem.tsx','fast-Esc-map'),
'D10.POINTER_LOCK_CLICK':('Clique com mouse capturado','setPointerCapture lançou InvalidStateError em clique já locked.','Guard preserva captura relativa existente; cliques e olhar não geram exceção.','src/world/camera/CameraRig.tsx','captured-after-clicks'),
'D11.FAVICON.RESOURCE':('Recurso favicon','GETfavicon.ico404 gera erro de recurso no console.','ICO16/32 reutiliza exatamente texto m., Georgia bolditalic e cores aprovadas; HTTP200 e metadata nativos.','src/app/favicon.ico; qa/render-favicon.py','favicon-resource')}
regtext=['# Regressões D01–D09 e achados adicionais','','Nove achados originais P2 reproduzidos em vermelho antes das correções. D03 é exclusivo DEV; D07 é atrito medido, sem alegar falha humana. D10 é exceção adicional de gameplay; D11 é recurso ausente conhecido da18A e novamente reproduzido18B. Nenhum P0/P1 foi confirmado nesta fase.','', '| ID | Reprodução vermelha | Execução verde | Mudança |','|---|---|---|---|']
for id,(title,before,after,files,label) in fixes.items():
 rf,rt=red[id];gf,gt=latest[id]
 assert rt['status']=='failing' and gt['status']=='passing',(id,rt['status'],gt['status'])
 rd=json.loads((rf.parent.parent/rt['evidence']).read_text());gd=json.loads((gf.parent.parent/gt['evidence']).read_text())
 def choose(data):
  steps=[s for s in data['steps'] if s.get('screenshot')]
  return next((s for s in steps if label in s['label']),steps[-1])
 rs,gs=choose(rd),choose(gd)
 beforepath=(rf.parent.parent/rs['screenshot']).relative_to(root).as_posix();afterpath=(gf.parent.parent/gs['screenshot']).relative_to(root).as_posix()
 redref=(rf.parent.parent/rt['evidence']).relative_to(root).as_posix();greenref=(gf.parent.parent/gt['evidence']).relative_to(root).as_posix()
 items.append({'id':id,'title':title,'before':beforepath,'after':afterpath,'expected':before,'change':after,'red':redref,'green':greenref,'files':files})
 regtext.append(f'| {id} | [JSON]({redref}) · [captura]({beforepath}) | [JSON]({greenref}) · [captura]({afterpath}) | {after} |')
 regtext+=[]
regtext+=['','## Critérios e limites','','- D05 RED18B reproduz HILL_BENCH; a ocorrência original FOREST_BENCH tem baseline18A separado. GREEN18B exerce ambos e o contorno frontal. Não atribuir aproximação bloqueada a todos13alvos.','- D06 nomeAX não é aferível por screenshot. D08timing e D09gating também exigem JSON/inputs; imagem final isolada não aprova comportamento.','- F5 em FIELDfade com foco livre preserva o ciclo publicado, consumindo reload. A expectativa inicial de modo imutável era um oracle errado, não novo defeito.','- Destino/yaw das portas é medido ao aplicar transição. Após liberar controle, corpo segue olhar conforme GOAL17. Não foi imposto yaw fixo apósidle.','- As falhas de selector, waypoint, readiness, root.traverse, contagem de capa+galeria e área medida durante animação estão preservadas. Não foram convertidas em defeitos.','- Gate11GREEN é complementado por journeys/controles estritos sem console/network errors depois de D11; execuções antigas de controls tinham asserts verdes mas D10 no console e não valem como release limpo.','', '## Arquivos e impactos','',''+ '\n'.join('- '+id+': '+value[3]+'.' for id,value in fixes.items()),'', 'Nenhum collider de banco foi removido, nem houve teleporte para concluir aproximação. A posição de assento autoral e o mapa público já existentes são mecanismos do produto, separados da caminhada. H09 não foi alterado.']
write('REGRESSOES-D01-D09.md','\n'.join(regtext))
(root/'COMPARATIVOS').mkdir(exist_ok=True)
(root/'COMPARATIVOS/dados.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
payload=json.dumps(items,ensure_ascii=False).replace('<','\\u003c')
viewer='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GOAL18B · comparativos reais</title><style>body{font:16px system-ui;margin:24px;background:#f0ebdf;color:#303c34}main{max-width:1240px;margin:auto}select{font:inherit;padding:8px;margin:8px 0 16px;box-sizing:border-box;max-width:100%;width:min(100%,40rem)}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}figure{min-width:0;margin:0;padding:8px;background:#fff9;border:1px solid #d8d8c7}img{display:block;max-width:100%;max-height:72vh;margin:auto}figcaption{margin:8px 0}p{line-height:1.5}a{color:#375b40}@media(max-width:700px){.pair{grid-template-columns:minmax(0,1fr)}body{margin:16px}}</style><main><h1>GOAL18B · antes e depois</h1><p>Capturas originais18B. Imagem mostra aparência; logs comprovam ação/estado. D06,D08,D09 exigem AX/timing/amostras. O favicon é recurso de aba e não aparece no conteúdo da página.</p><label>Regressão <select id="choice"></select></label><h2 id="title"></h2><p id="reason"></p><div class="pair"><figure><img id="before"><figcaption>Antes · <a id="red">reprodução vermelha</a></figcaption></figure><figure><img id="after"><figcaption>Depois · <a id="green">execução verde</a></figcaption></figure></div><p id="change"></p><p><a href="../REGRESSOES-D01-D09.md">Relatório</a> · <a href="../COBERTURA-E-RISCOS.md">Cobertura</a> · <a href="http://localhost:3154/?avatarQA">Prévia3154</a></p></main><script>const rows=PAYLOAD;const choice=document.querySelector('#choice');rows.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.id+' · '+r.title;choice.append(o)});function render(){const r=rows[choice.value];document.querySelector('#title').textContent=r.title;document.querySelector('#reason').textContent=r.expected;document.querySelector('#change').textContent=r.change;for(const key of ['before','after'])document.querySelector('#'+key).src='../'+r[key];for(const key of ['red','green'])document.querySelector('#'+key).href='../'+r[key]}choice.onchange=render;render();</script></html>'''.replace('PAYLOAD',payload)
write('COMPARATIVOS/index.html',viewer)
counts=summary['counts'];passing=counts.get('automated-passing',0);category=defaultdict(Counter)
for row in registry:category[row['category']][row['status']]+=1
statuses=['automated-passing','partial','manual-hardware','needs-product-decision','automated-failing','blocked','not-implemented']
with (root/'MATRIZ-CATEGORIAS.csv').open('w') as f:
 writer=csv.writer(f);writer.writerow(['categoria','total']+statuses)
 for cat,c in sorted(category.items()):writer.writerow([cat,sum(c.values())]+[c[s] for s in statuses])
write('COBERTURA-E-RISCOS.md',f'''# Cobertura e riscos — GOAL18B

Registro dos285casos da18A, revisado por GIVEN–WHEN–THEN e vinculado a provas novas18B. Os270contratos são o denominador de inventário;285é o de casos planejados. Nem um nem outro é quantidade de jornadas executadas.

| Estado do caso | Quantidade |
|---|---:|
'''+'\n'.join(f'| {s} | {counts.get(s,0)} |' for s in statuses)+f'''

**Cobertura completa por caso: {passing}/285 = {summary['casePassingPercent']:.2f}%. Ponderada por risco: {summary['riskPassingPercent']:.2f}%.** PesoP1=3,P2=1 (P0=5 se existir), baseado na prioridade do plano e não na severidade real dosD. Somente automated-passing entra no numerador; parcial/manual/decisão tem crédito0 de cobertura completa. Fontes: [registro](REGISTRO-285-CASOS.json), [resumo](EVIDENCIAS/registry-summary.json), [matriz de categorias](MATRIZ-CATEGORIAS.csv).

## Denominadores observados

-13/13pontos: ativação/cancelamento/reentrada por Edesktop e CTA touch, mais Esc em jornada frontal. Traces guardam aligned de verdade, destino/yaw no momento da transição, poses/controles e retorno.
-7/7destinos: trajetos contínuos desde Chegada desktop/touch e retorno, separados dos7mapas por superfície. Nenhum setter de posição/câmera/store para passar uma rota.
-3câmeras×2qualidades×2superfícies:12fixtures de controles; latest final-native é estrito sem console/network errors. Não significa13alvos×12profis×todas variantes completamente executados.
-13limiares: fora/dentro por caminhada com margem150mm e distânciaXYZ efetiva; igualdade/tie em unidade normalizada.13BOUNDARY continuam parciais, sem fingir precisão global perfeita.
-PC7apps/3artigos/4notas/terminal: desktop e tap/teclado emulado; conteúdos/capítulos/filtros, retorno por botão/Esc, retenção de notas e reset de terminal verificados. Isso não certifica IME físico.
-Galeria3painéis/4obras/3notas de sino: conteúdo real, links, busca local, escolhas fictícias, imagens e decaimento visual observados. Audição humana continua manual.

## Limitações preservadas

A orientação180° frontal não equivale ao contorno atrás de todos13móveis/prédios;13BACK permanecem parciais. Colisões, steps/slopes e limite leste têm escopos específicos; não todas as bordas. Alguns valores/tempos exatos de física não foram estimados no navegador, apesar das regras puras e movimentos reais. Avatar1P e câmera/pose têm medidas mas não toda relação cabeça/olho ou threshold de distância. Casos parciais guardam o motivo e a assertion ligada, em vez de desaparecer.

Foco nativo da janela, trackpad físico, telefone/IME/multitouch físico e audição não foram certificados. O probe headless novo não gerou blur da janela e não usa dispatchEvent. H09tem2casos needs-product-decision com política preservada. Não existe caso pendente convertido em verde porherança18A.

## Risco material

Todas nove correções têm RED→GREEN. D10/D11 também. Nenhum limbo persistente apareceu nas jornadas novas. Isso é evidência finita, não promessa universal. Há advisories pré-existentes de dependências em [audit](EVIDENCIAS/dependency-audit.json); não foi feita migração não autorizada nem publicação. Aprovação visual e decisões/hardware permanecem humanos.
''')
latestpass={id:item for id,item in latest.items() if item[1]['status']=='passing'}
checks=sum(len(t.get('assertions',[])) for f,t in latestpass.values())
write('IMPLEMENTACAO-TESTES.md',f'''# Implementação de testes funcionais

Suíte persistente em `{project}/qa`, Playwright1.62.1 devDependency, Chrome instalado, WebGL/Rapier efetivos. README do harness descreve reprodução e pré-requisitos. Normalmente headless; nunca roubar foco do Codex/Xpra.

**{len(latestpass)}cenários distintos possuem última execução verde**, com{checks}registros verify nessa seleção. Há asserts adicionais dentro dos cenários, não contados como verify. Isso é separado dos133testes de unidade e dos285casos planejados. Runs repetidos/red/harness não inflam o denominador. O probe de foco e medições de performance são diagnósticos separados.

## Organização

| Família | Arquivo | Prova principal |
|---|---|---|
| TDD | regressions.mjs | D01–D11; baseline real e after |
| Jornadas/mapas | journeys.mjs |13/7, controles reais, aligned/destino/retorno |
| Deep content | content.mjs | PC7apps,3artigos,4notas,terminal; Galeria/sino |
| Controls | controls.mjs |12perfis, teclas,touchCDP,câmeras,F5,saídaS |
| Elegibilidade | related-approach.mjs/boundaries.mjs | backstage/side, feedbackmobile,13radii |
| Robustez | surfaces.mjs/preferences-assets.mjs | noWebGL,sandbox,Retry,media/storage/qualidade |
| Complementos | completion-surfaces.mjs/contract-regressions.mjs | links,inspeções,DEV,Tab/Enter,fade |
| Mecânica | turn-boundary.mjs/interior-camera.mjs |90/180/360,W+look,borda,teto/cantos/roof |
| Faults | faults.mjs | recuperação isolada, explicitamente não pública |
| Release | production-smoke.mjs | produção desktop/touch semglobalsQA |

Matriz por categoria em MATRIZ-CATEGORIAS.csv. Um campo contractID não é automaticamente passe de todas variantes; coverage-adjudication.json guarda a revisão e os cenários obrigatórios. O registro usa última execução por cenário, preserva histórico e não aceita falha atual como passe antigo.

## Reproduzir

```sh
npm run test:all
npm run typecheck
npm run build
QA_SUITE=regressions QA_OUT=/diretorio/novo npm run test:functional
QA_SUITE=journeys QA_OUT=/diretorio/novo npm run test:functional
QA_SUITE=controls QA_OUT=/diretorio/novo npm run test:functional
QA_SUITE=all QA_OUT=/diretorio/novo npm run test:functional
node qa/build-registry.mjs /diretorio/relatorios
```

Use3154;3152 é baseline preservada. Não sobrescrever pastas de execução. Falhas injetadas são declaradas: abort porasset, storage JSONmalformado antes do mount e hook DEV recoveryQA. Elas não provam caminhada nem acessibilidade pública. Observers normais somente leem. O iframe sandbox e Chrome--disable-webgl são nativos, sem mock de captura/WebGL.

## Lifecycle e performance

CameraRig desconecta pointerlock/subscriptions e remove listeners pelos mesmos callbacks; Desktop limpa interval; ExperiencePreferences unsubscribe/audio; InteractionSystem libera frame callback por identidade e reseta debug apenas ao unmount; WorldDiagnostics apaga global ao sair. Nenhum novoRAF foi acrescentado em produto. Observer de fases do harness cancelaRAF explicitamente, em contexto descartável. Métricas de3ciclos e suas limitações estão em PERFORMANCE.md; não provar leak universal por3amostras.

Commits atuais: `{head}`. Evidências anteriores a commit guardam HEADbase+dirty snapshot/fingerprint; não foram descritas como base limpa após mudança. Próximo gate: conferência final de fonte/main/18A, produção, referências e hashes.
''')
(root/'EVIDENCIAS/consolidation-summary.json').write_text(json.dumps({'generatedAt':now,'headAtConsolidation':head,'latestDistinctPassingScenarios':len(latestpass),'latestVerifyRecords':checks,'cases':285,'regressionPairs':len(items),'statusCounts':counts},ensure_ascii=False,indent=2)+'\n')
print('Reports and original-image comparison viewer generated',len(items),len(latestpass))
