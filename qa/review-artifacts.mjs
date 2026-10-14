import { launch } from './lib/gameplay.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(process.argv[2]),
  browser = await launch();
const report = {
  scope: 'Comparison-report viewer, not gameplay coverage',
  images: [],
  viewports: [],
  errors: []
};
await mkdir(path.join(root, 'EVIDENCIAS/viewer-qa'), {
  recursive: true
});
try {
  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 900
    }
  });
  page.on('pageerror', e => report.errors.push(e.message));
  await page.goto('file://' + root + '/COMPARATIVOS/index.html');
  for (let i = 0; i < 11; i++) {
    await page.locator('select').selectOption(String(i));
    await page.locator('.pair img').evaluateAll(async es => Promise.all(es.map(e => e.decode())));
    const images = await page.locator('.pair img').evaluateAll(es => es.map(e => ({
      src: e.src,
      width: e.naturalWidth,
      height: e.naturalHeight
    })));
    assert(images.every(e => e.width > 0 && e.height > 0));
    report.images.push({
      choice: i,
      images
    });
  }
  for (const width of [1280, 390]) {
    await page.setViewportSize({
      width,
      height: 900
    });
    await page.locator('select').selectOption('3');
    await page.locator('.pair img').evaluateAll(async es => Promise.all(es.map(e => e.decode())));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const capture = 'EVIDENCIAS/viewer-qa/viewer-' + width + '.png';
    await page.screenshot({
      path: path.join(root, capture)
    });
    report.viewports.push({
      width,
      capture
    });
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passing';
} catch (e) {
  report.status = 'failing';
  report.error = e.stack;
} finally {
  await browser.close();
  await writeFile(path.join(root, 'EVIDENCIAS/viewer-qa/report.json'), JSON.stringify(report, null, 2));
}
console.log(report.status);
process.exitCode = report.status === 'passing' ? 0 : 1;
