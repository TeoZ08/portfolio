import assert from 'node:assert/strict';
import { launch } from './lib/gameplay.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve(process.env.QA_OUT || 'qa-results/production-smoke'),
  url = process.env.QA_PRODUCTION_URL || 'http://localhost:3155';
await mkdir(path.join(out, 'SCREENSHOTS'), {
  recursive: true
});
await mkdir(path.join(out, 'EVIDENCIAS'), {
  recursive: true
});
const browser = await launch(),
  report = {
    url,
    startedAt: new Date().toISOString(),
    fixtures: []
  };
try {
  for (const touch of [false, true]) {
    const context = await browser.newContext({
      viewport: touch ? {
        width: 390,
        height: 844
      } : {
        width: 1280,
        height: 720
      },
      isMobile: touch,
      hasTouch: touch
    });
    const page = await context.newPage(),
      fixture = {
        touchEmulated: touch,
        errors: [],
        captures: []
      };
    report.fixtures.push(fixture);
    page.on('pageerror', e => fixture.errors.push({
      kind: 'pageerror',
      message: e.message
    }));
    page.on('console', m => {
      if (m.type() === 'error') fixture.errors.push({
        kind: 'console',
        message: m.text()
      });
    });
    page.on('response', r => {
      if (r.status() >= 400) fixture.errors.push({
        kind: 'http',
        url: r.url(),
        status: r.status()
      });
    });
    try {
      const response = await page.goto(url + '/?avatarQA&recoveryQA', {
        waitUntil: 'domcontentloaded'
      });
      assert.equal(response.status(), 200);
      const enter = page.getByRole('button', {
        name: /Entrar e explorar/
      });
      await enter.waitFor();
      if (touch) await enter.tap();else await enter.click();
      await page.waitForFunction(() => document.querySelector('.world-canvas')?.dataset.currentRegion === 'FIELD' && !document.querySelector('.arrival-dialog')?.open);
      assert.equal(await page.locator('.world-canvas').getAttribute('data-time-of-day'), '17.5');
      fixture.hooks = await page.evaluate(() => ({
        environment: typeof window.__environmentQA,
        recovery: typeof window.__recoveryQA,
        avatar: typeof document.querySelector('canvas').__avatarQA
      }));
      assert.deepEqual(fixture.hooks, {
        environment: 'undefined',
        recovery: 'undefined',
        avatar: 'undefined'
      });
      const capture = async label => {
        const file = 'SCREENSHOTS/' + (touch ? 'touch' : 'desktop') + '-' + label + '.png';
        await page.screenshot({
          path: path.join(out, file)
        });
        fixture.captures.push(file);
      };
      await capture('world-ready');
      for (const mode of ['third-person-front', 'first-person', 'third-person-back']) {
        if (touch) await page.locator('.camera-mode-control').tap();else await page.keyboard.press('F5');
        await page.waitForFunction(mode => document.querySelector('.world-canvas').dataset.cameraMode === mode, mode);
        await capture(mode);
      }
      if (touch) assert.equal(await page.evaluate(() => document.pointerLockElement), null);else assert.equal(await page.evaluate(() => document.pointerLockElement?.tagName), 'CANVAS');
      await page.goto(url + '/arquivo', {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForFunction(() => /^\d{2}:\d{2}$/.test(document.querySelector('.desktop time')?.textContent || ''));
      assert.equal(await page.locator('.file-sidebar button').count(), 6);
      await capture('archive');
      const icon = await context.request.get(url + '/favicon.ico');
      assert.equal(icon.status(), 200);
      assert.deepEqual(fixture.errors, []);
      fixture.status = 'passing';
    } catch (error) {
      fixture.status = 'failing';
      fixture.error = error.stack;
    } finally {
      await context.close();
      await writeFile(path.join(out, 'EVIDENCIAS/production-smoke.json'), JSON.stringify(report, null, 2));
    }
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(out, 'EVIDENCIAS/production-smoke.json'), JSON.stringify(report, null, 2));
}
console.log(report.fixtures.map(f => [f.touchEmulated ? 'touch' : 'desktop', f.status, f.error?.split('\n')[0]]));
process.exitCode = report.fixtures.some(f => f.status !== 'passing') ? 1 : 0;
