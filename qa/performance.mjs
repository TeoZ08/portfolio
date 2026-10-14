import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launch, Gameplay } from './lib/gameplay.mjs';
const out = path.resolve(process.env.QA_OUT || 'qa-results/performance');
await mkdir(path.join(out, 'EVIDENCIAS'), {
  recursive: true
});
const report = {
  startedAt: new Date().toISOString(),
  method: 'Serial Chrome headless ANGLE Vulkan. Native requestAnimationFrame intervals; not GPU render timing or physical-notebook certification.',
  profiles: []
};
const browser = await launch();
function percentile(values, fraction) {
  return values.slice().sort((a, b) => a - b)[Math.floor((values.length - 1) * fraction)];
}
async function sample(g, label) {
  const intervals = await g.page.evaluate(() => new Promise(resolve => {
    const samples = [];
    let previous;
    function frame(time) {
      if (previous !== undefined) samples.push(time - previous);
      previous = time;
      if (samples.length < 240) requestAnimationFrame(frame);else resolve(samples);
    }
    requestAnimationFrame(frame);
  }));
  const metrics = Object.fromEntries((await g.cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const state = await g.shot('performance-' + label);
  return {
    label,
    intervals,
    p50ms: percentile(intervals, .5),
    p95ms: percentile(intervals, .95),
    rafHzApprox: 1000 / percentile(intervals, .5),
    counters: {
      calls: state.env.calls,
      triangles: state.env.triangles,
      textures: state.env.textures,
      geometries: state.env.geometries
    },
    metrics,
    renderer: state.env.renderer,
    region: state.region,
    pose: state.motion.position
  };
}
try {
  for (const [build, url] of [['baseline', process.env.QA_BASELINE_URL || 'http://localhost:3152'], ['candidate', process.env.QA_CANDIDATE_URL || 'http://localhost:3154']]) {
    for (const quality of ['balanced', 'low']) {
      const g = await new Gameplay(browser, out, 'performance-' + build + '-' + quality, {
        quality
      }).init();
      const profile = {
        build,
        url,
        quality,
        viewport: [1280, 720],
        samples: []
      };
      report.profiles.push(profile);
      try {
        await g.page.goto(url + '/?avatarQA', {
          waitUntil: 'domcontentloaded'
        });
        await g.ready();
        await g.cdp.send('Performance.enable');
        profile.samples.push(await sample(g, 'arrival'));
        await g.map('Mirante');
        profile.samples.push(await sample(g, 'hill'));
        await g.house({
          physical: false
        });
        await g.go(0, 0, 'house-center');
        profile.samples.push(await sample(g, 'house'));
        profile.status = 'observed';
      } catch (error) {
        profile.status = 'failed';
        profile.error = error.stack;
      } finally {
        await g.end();
        await writeFile(path.join(out, 'EVIDENCIAS/performance.json'), JSON.stringify(report, null, 2));
      }
    }
  }
  const g = await new Gameplay(browser, out, 'candidate-lifecycle', {}).init();
  const lifecycle = {
    scope: 'Three native House/Field transitions and map returns. CDP listener/heap snapshots after settled frames; bounded observation, not universal leak proof.',
    samples: []
  };
  report.lifecycle = lifecycle;
  try {
    await g.open();
    await g.ready();
    await g.cdp.send('Performance.enable');
    lifecycle.samples.push(await sample(g, 'initial'));
    for (let cycle = 0; cycle < 3; cycle++) {
      await g.house({
        physical: false
      });
      await g.activate('HOUSE_EXIT_DOOR');
      await g.map('Galeria · processo');
      await g.interact();
      await g.status('using');
      await g.leave('WORKSHOP_LIGHT_TABLE');
      await g.map('Mirante');
      lifecycle.samples.push(await sample(g, 'cycle-' + cycle));
    }
    lifecycle.status = 'observed';
  } catch (error) {
    lifecycle.status = 'failed';
    lifecycle.error = error.stack;
  } finally {
    await g.end();
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(out, 'EVIDENCIAS/performance.json'), JSON.stringify(report, null, 2));
}
console.log(report.profiles.map(p => [p.build, p.quality, p.status]));
console.log('lifecycle', report.lifecycle?.status);
process.exitCode = report.profiles.some(p => p.status !== 'observed') || report.lifecycle?.status !== 'observed' ? 1 : 0;
