import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve(process.argv[2] || process.env.QA_REPORT_ROOT || 'qa-results');
const excluded = ['EVIDENCIAS/INDICE.json', 'EVIDENCIAS/INDICE.md', 'EVIDENCIAS/SHA256SUMS'];
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, {
    withFileTypes: true
  })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));else {
      const file = path.relative(root, absolute);
      if (excluded.includes(file)) continue;
      const bytes = await readFile(absolute);
      files.push({
        file,
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        kind: file.startsWith('EVIDENCIAS/viewer-qa/') && file.endsWith('.png') ? 'report-viewer capture; not gameplay' : file === 'SCREENSHOTS/favicon-approved-mark.png' ? 'generated brand asset preview; not a browser capture' : file.endsWith('.png') ? 'real browser screenshot' : file.endsWith('.json') ? 'structured evidence/report' : 'source/report/log',
        mutable: file.endsWith('.log')
      });
    }
  }
  return files;
}
const files = (await walk(root)).sort((a, b) => a.file.localeCompare(b.file));
const index = {
  indexedAt: new Date().toISOString(),
  root,
  hashAlgorithm: 'SHA256',
  exclusions: excluded,
  provisional: true,
  note: 'Index snapshot; live logs or running reports may append. Regenerate after terminal QA and final report edits. Screenshot presence is not a functional pass.',
  files
};
await writeFile(path.join(root, 'EVIDENCIAS/INDICE.json'), JSON.stringify(index, null, 2));
await writeFile(path.join(root, 'EVIDENCIAS/SHA256SUMS'), files.map(f => f.sha256 + '  ' + f.file).join('\n') + '\n');
await writeFile(path.join(root, 'EVIDENCIAS/INDICE.md'), '# Índice incremental GOAL18B\n\n' + index.indexedAt + '. ' + files.length + ' arquivos; ' + files.filter(f => f.kind === 'real browser screenshot').length + ' capturas reais. Não representa contagem de passes.\n\n[Manifesto JSON](INDICE.json) e [SHA256SUMS](SHA256SUMS). Execute `sha256sum -c EVIDENCIAS/SHA256SUMS` da raiz dos relatórios. Logs ativos podem receber linhas após este snapshot; preservar as versões e gerar índice final depois do QA terminal.\n\n' + files.filter(f => f.file.endsWith('run.json') || f.file.endsWith('performance.json')).map(f => '- [' + f.file + '](../' + f.file + ')').join('\n') + '\n');
console.log({
  files: files.length,
  screenshots: files.filter(f => f.kind === 'real browser screenshot').length
});
