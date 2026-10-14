import { launch, Gameplay } from './lib/gameplay.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve(process.env.QA_OUT || 'qa-results/focus-probe');
await mkdir(path.join(out, 'EVIDENCIAS'), {
  recursive: true
});
const browser = await launch();
const g = await new Gameplay(browser, out, 'native-focus-probe').init();
const report = {
  scope: 'Native Chrome headless tab selection, no dispatchEvent or OS manipulation; not physical Alt+Tab',
  startedAt: new Date().toISOString()
};
try {
  await g.open();
  await g.ready();
  await g.page.evaluate(() => {
    window.__nativeWindowFocus = [];
    for (const type of ['blur', 'focus']) window.addEventListener(type, e => {
      if (e.target === window) window.__nativeWindowFocus.push({
        type,
        isTrusted: e.isTrusted,
        time: performance.now()
      });
    });
  });
  report.before = await g.read();
  await g.page.keyboard.down('w');
  const other = await g.context.newPage();
  await other.goto('http://localhost:3154/perfil');
  await other.bringToFront();
  await other.waitForTimeout(200);
  await other.keyboard.up('w');
  report.events = await g.page.evaluate(() => window.__nativeWindowFocus);
  report.qualifiedBlur = report.events.some(e => e.type === 'blur' && e.isTrusted);
  report.afterTab = await g.read();
  await other.close();
  await g.page.bringToFront();
  if (report.qualifiedBlur) {
    try {
      await g.page.waitForFunction(() => {
        const v = window.__environmentQA.read().playerMotion.velocity;
        return Math.hypot(v.x, v.z) < .04;
      }, null, {
        timeout: 2000
      });
      report.behaviorValidated = true;
    } catch {
      report.behaviorValidated = false;
    }
  }
  await g.page.keyboard.up('w');
  await g.settle();
  report.returned = await g.shot('returned-tab');
  report.behaviorValidated = report.behaviorValidated === true;
  report.status = report.qualifiedBlur ? 'native blur observed; inspect resulting stop' : 'manual-hardware: browser emitted no native window blur';
} catch (error) {
  report.status = 'probe-error';
  report.error = error.stack;
} finally {
  await g.page.keyboard.up('w').catch(() => {});
  await g.end();
  await browser.close();
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(out, 'EVIDENCIAS/focus-probe.json'), JSON.stringify(report, null, 2));
}
console.log(report.status);
process.exitCode = report.error ? 1 : 0;
