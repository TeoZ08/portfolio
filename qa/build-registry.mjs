import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.env.QA_REPORT_ROOT || process.argv[2] || 'qa-results');
const plan = JSON.parse(await readFile(new URL('./fixtures/goal18a-plan.json', import.meta.url)));
const runs = [];
for (const entry of await readdir(root, {
  withFileTypes: true
})) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, entry.name, 'EVIDENCIAS/run.json');
  try {
    const report = JSON.parse(await readFile(file));
    runs.push({
      report,
      file
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const observations = new Map();
const latestTests = new Map();
for (const {
  report,
  file
} of runs.sort((a, b) => a.report.startedAt.localeCompare(b.report.startedAt))) {
  if (report.phase.includes('red') || report.baseURL?.includes(':3152')) continue;
  for (const test of report.tests) {
    latestTests.set(test.id, {
      test,
      file
    });
    if (test.status !== 'passing') continue;
    const entries = [...(test.assertions || [])];
    for (const contract of test.contracts || []) {
      entries.push({
        contracts: [contract],
        status: 'passing',
        coverage: 'partial',
        scope: 'Scenario assertion recorded outside per-contract verify; inspect native trace and scope before broad acceptance'
      });
    }
    for (const a of entries.filter(a => a.status === 'passing')) {
      for (const contract of a.contracts) {
        const list = observations.get(contract) || [];
        list.push({
          test: test.id,
          run: path.relative(root, file),
          evidence: path.relative(root, path.join(path.dirname(file), '..', test.evidence)) + (a.step >= 0 ? '#/steps/' + a.step : ''),
          coverage: a.coverage,
          scope: a.scope,
          command: test.command,
          startedAt: test.startedAt
        });
        observations.set(contract, list);
      }
    }
  }
}
const regressionTest = {
  'RG.D01': 'D01',
  'RG.D02': 'D02',
  'RG.D03': 'D03',
  'RG.D04': 'D04',
  'RG.D05': 'D05',
  'RG.D06': 'D06',
  'RG.D07': 'D07',
  'RG.D08': 'D08',
  'RG.D09': 'D09'
};
const registry = plan.map(c => {
  const contracts = c.inventario_IDs;
  const observed = contracts.flatMap(id => observations.get(id) || []);
  const missing = contracts.filter(id => !observations.has(id));
  let status = missing.length ? observed.length ? 'partial' : 'not-implemented' : contracts.every(id => observations.get(id).some(a => a.coverage === 'full')) ? 'automated-passing' : 'partial';
  let rationale = status === 'automated-passing' ? 'Assert funcional específico registrado em execução nova18B; consultar escopo da fixture, não extrapolar aparelho físico.' : status === 'partial' ? 'Parte dos contratos/variantes tem observação nova18B. Não significa aprovação integral do GIVEN–WHEN–THEN.' : 'Nenhuma execução específica nova18B; evidência18A não é passe18B.';
  if (c.caso_ID.startsWith('MAN.')) {
    status = 'manual-hardware';
    rationale = 'Requer foco do SO, aparelho físico ou audição humana; emulação não certifica o caso.';
  }
  if (contracts.includes('SEQUENCE.PC_ARCHIVE_RETURN')) {
    status = 'needs-product-decision';
    rationale = 'H09: decidir retomar quarto ou reiniciar Chegada; não mudar contrato por inferência.';
  }
  if (regressionTest[c.caso_ID]) {
    const executed = latestTests.get(regressionTest[c.caso_ID]);
    if (executed?.test.status === 'passing') {
      status = 'partial';
      rationale = 'Regressão reproduzida e cenário específico verde; catálogo dirigido contém variantes adicionais. Relatório vermelho/verde não equivale a todas variantes do plano.';
    }
  }
  if (contracts.some(id => id.endsWith('.BOUNDARY'))) {
    status = 'partial';
    rationale = 'Fora/dentro observados por caminhada com margem150mm; igualdade/tie em regra pura de unidade. Igualdade em coordenada global nativa não foi medida.';
  }
  if (contracts.some(id => id.endsWith('.BACK'))) {
    status = observed.length ? 'partial' : 'not-implemented';
    rationale = 'Orientação180° no ponto frontal não prova contorno fisicamente traseiro. Bancos FIELD, bancoHOUSE e lateralPC têm escopos próprios.';
  }
  return {
    case_ID: c.caso_ID,
    contracts,
    category: c.grupo,
    priority: c.prioridade,
    status,
    command: [...new Set(observed.map(a => a.command))].join(' ; '),
    evidence: [...new Set(observed.map(a => a.evidence))],
    rationale,
    missingContracts: missing,
    assertions: observed
  };
});
await writeFile(path.join(root, 'REGISTRO-285-CASOS.json'), JSON.stringify(registry, null, 2));
const columns = ['case_ID', 'contracts', 'category', 'priority', 'status', 'command', 'evidence', 'rationale', 'missingContracts'];
const quote = value => '"' + (Array.isArray(value) ? value.join(' ; ') : String(value)).replaceAll('"', '""') + '"';
await writeFile(path.join(root, 'REGISTRO-285-CASOS.csv'), columns.join(',') + '\n' + registry.map(r => columns.map(k => quote(r[k])).join(',')).join('\n') + '\n');
const counts = Object.fromEntries([...new Set(registry.map(r => r.status))].map(s => [s, registry.filter(r => r.status === s).length]));
const weight = c => c.priority === 'P1' ? 3 : c.priority === 'P0' ? 5 : 1;
const summary = {
  updatedAt: new Date().toISOString(),
  cases: registry.length,
  counts,
  casePassingPercent: registry.filter(r => r.status === 'automated-passing').length / registry.length * 100,
  riskPassingPercent: registry.filter(r => r.status === 'automated-passing').reduce((sum, r) => sum + weight(r), 0) / registry.reduce((sum, r) => sum + weight(r), 0) * 100,
  weights: {
    P0: 5,
    P1: 3,
    P2: 1
  },
  observedContracts: observations.size,
  riskMethod: 'Only complete automated-passing cases in numerator; partial, hardware and pending decision earn zero full-coverage credit.',
  provisional: true,
  scope: 'Incremental registry; final audit must inspect GWT against linked assertions, not treat ID union as universal coverage'
};
await writeFile(path.join(root, 'EVIDENCIAS/registry-summary.json'), JSON.stringify(summary, null, 2));
console.log(summary);
