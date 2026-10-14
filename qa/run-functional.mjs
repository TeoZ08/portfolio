import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { launch, Gameplay, baseURL } from './lib/gameplay.mjs';
import { regressions } from './regressions.mjs';
import { journeys } from './journeys.mjs';
import { content } from './content.mjs';
import { controls } from './controls.mjs';
import { related } from './related-approach.mjs';
import { boundaries } from './boundaries.mjs';
import { surfaces } from './surfaces.mjs';
import { interiors } from './interior-camera.mjs';
import { sequences } from './sequences.mjs';
import { completion } from './completion-surfaces.mjs';
import { turnBoundary } from './turn-boundary.mjs';
import { faults } from './faults.mjs';
import { contractRegressions } from './contract-regressions.mjs';
import { preferencesAssets } from './preferences-assets.mjs';
import { smallContracts } from './final-small-contracts.mjs';
const suite = process.env.QA_SUITE || 'regressions',
  phase = process.env.QA_PHASE || 'green';
const out = path.resolve(process.env.QA_OUT || 'qa-results/' + new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(path.join(out, 'EVIDENCIAS'), {
  recursive: true
});
async function fingerprint(dir) {
  const items = [];
  for (const item of await readdir(dir, {
    withFileTypes: true
  })) {
    const name = path.join(dir, item.name);
    if (item.isDirectory()) items.push(...(await fingerprint(name)));else items.push({
      file: name,
      sha256: createHash('sha256').update(await readFile(name)).digest('hex')
    });
  }
  return items;
}
const sources = [...(await fingerprint('src')), ...(await fingerprint('qa')), ...(await fingerprint('scripts'))];
for (const file of ['package.json', 'package-lock.json']) sources.push({
  file,
  sha256: createHash('sha256').update(await readFile(file)).digest('hex')
});
await writeFile(path.join(out, 'EVIDENCIAS/source-fingerprint.json'), JSON.stringify(sources, null, 2));
const report = {
  sourceFingerprint: createHash('sha256').update(JSON.stringify(sources)).digest('hex'),
  gitStatus: execFileSync('git', ['status', '--short'], {
    encoding: 'utf8'
  }),
  phase,
  suite,
  baseURL,
  gitHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8'
  }).trim(),
  startedAt: new Date().toISOString(),
  tests: []
};
const definitions = suite === 'small' ? smallContracts : suite === 'preferences' ? preferencesAssets : suite === 'contracts' ? contractRegressions : suite === 'faults' ? faults : suite === 'turns' ? turnBoundary : suite === 'completion' ? completion : suite === 'sequences' ? sequences : suite === 'interiors' ? interiors : suite === 'surfaces' ? surfaces : suite === 'boundaries' ? boundaries : suite === 'related' ? related : suite === 'controls' ? controls : suite === 'content' ? content : suite === 'journeys' ? journeys : suite === 'all' ? [...regressions, ...journeys, ...content, ...controls, ...related, ...boundaries, ...surfaces, ...interiors, ...sequences, ...completion, ...turnBoundary, ...faults, ...contractRegressions, ...preferencesAssets, ...smallContracts] : regressions;
if (!['regressions', 'journeys', 'content', 'controls', 'related', 'boundaries', 'surfaces', 'interiors', 'sequences', 'completion', 'turns', 'faults', 'contracts', 'preferences', 'small', 'all'].includes(suite)) throw Error('Unknown QA_SUITE: ' + suite);
const tests = definitions.filter(t => !process.env.QA_ONLY || process.env.QA_ONLY.split(',').includes(t.id));
if (!tests.length) throw Error('QA_ONLY selected no scenarios; an empty run cannot pass');
const browser = await launch();
try {
  for (const t of tests) {
    const g = await new Gameplay(browser, out, phase + '-' + t.id, {
      touch: t.touch,
      quality: t.quality
    }).init();
    const test = {
      id: t.id,
      contracts: t.contracts,
      command: `QA_SUITE=${suite} QA_ONLY=${t.id} QA_PHASE=${phase} npm run test:functional`,
      startedAt: new Date().toISOString(),
      evidence: 'EVIDENCIAS/' + g.name + '.json'
    };
    try {
      await t.run(g);
      test.status = 'passing';
      g.data.result = 'passing';
    } catch (e) {
      test.status = e.code === 'ERR_ASSERTION' ? 'failing' : 'harness-error';
      test.error = e.stack;
      g.data.result = test.status;
      g.data.error = e.stack;
      await g.shot('failure').catch(() => {});
    } finally {
      await g.end();
      test.finishedAt = new Date().toISOString();
      test.assertions = g.data.assertions;
      report.tests.push(test);
      await writeFile(path.join(out, 'EVIDENCIAS/run.json'), JSON.stringify(report, null, 2));
      console.log(t.id, test.status, test.error?.split('\n')[0] || '');
    }
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(out, 'EVIDENCIAS/run.json'), JSON.stringify(report, null, 2));
}
process.exitCode = report.tests.some(t => t.status !== 'passing') ? 1 : 0;
