import assert from 'node:assert/strict';
async function house(g) {
  await g.open();
  await g.ready();
  await g.house();
  await g.go(-1.6, 1.5, 'bench-front-clearance');
  await g.go(-1.6, 3.4, 'bench-rear-side');
  await g.go(-2.736, 3.4, 'bench-rear');
  for (let i = 0; i < 8 && (await g.read()).env.interaction.candidateId !== 'HOUSE_ENTRY_BENCH'; i++) {
    await g.key('w', 75);
    await g.settle();
  }
  await g.shot('rear-offer');
  const rear = await g.read();
  assert.equal(rear.env.interaction.candidateId, null, 'Solidbench rear is outside its authored1.15m activation radius');
  await g.key('e');
  const sample = await g.page.evaluate(() => new Promise(resolve => {
    const a = [],
      start = performance.now();
    function tick() {
      const s = window.__environmentQA.read();
      a.push({
        time: performance.now(),
        motion: s.playerMotion,
        interaction: s.interaction,
        feedback: document.getElementById('world-approach-feedback')?.innerText
      });
      if (performance.now() - start > 4500) resolve(a);else setTimeout(tick, 100);
    }
    tick();
  }));
  g.data.observations.push({
    sample
  });
  await g.shot('rear-result');
  await g.verify('internal bench obstruction', ['TARGET.HOUSE_ENTRY_BENCH.BACK'], () => {
    assert.notEqual(sample.at(-1).interaction.status, 'approaching');
    assert(sample.every(s => s.interaction.status === 'idle'));
    assert(sample.at(-1).motion.grounded);
  }, {
    coverage: 'partial',
    scope: 'Physicalrear bank is outside activationrange; Edoesnottrap. Hypothesis not reproduced; no productfix'
  });
}
async function computer(g) {
  await g.open();
  await g.ready();
  await g.house();
  await g.go(1.8, 0, 'PC-side-clearance');
  await g.go(1.8, -2.8, 'PC-side');
  await g.go(2.2, -2.7, 'PC-side-near', .04);
  await g.page.waitForFunction(() => window.__environmentQA.read().interaction.candidateId === 'HOUSE_COMPUTER');
  await g.shot('side-offer');
  assert.equal((await g.read()).env.interaction.candidateId, 'HOUSE_COMPUTER');
  await g.key('e');
  const samples = await g.page.evaluate(() => new Promise(resolve => {
    const a = [],
      start = performance.now();
    function tick() {
      const s = window.__environmentQA.read();
      a.push({
        time: performance.now(),
        interaction: s.interaction,
        control: s.playerControl,
        motion: s.playerMotion,
        feedback: document.getElementById('world-approach-feedback')?.innerText
      });
      if (performance.now() - start > 4500) resolve(a);else setTimeout(tick, 100);
    }
    tick();
  }));
  g.data.observations.push({
    samples
  });
  await g.shot('side-result');
  await g.verify('PC chair corridor', ['TARGET.HOUSE_COMPUTER.BACK'], () => {
    assert.notEqual(samples.at(-1).interaction.status, 'approaching');
    assert(samples.some(s => s.interaction.status === 'using' || s.feedback));
  }, {
    coverage: 'partial',
    scope: 'Physicallateral approach behindchair; notallangles'
  });
}
async function mobile(g) {
  await g.open();
  await g.ready();
  await g.map('Bosque');
  await g.go(-15, -5, 'forest-front');
  await g.go(-17, -6.6, 'forest-side-front');
  await g.go(-17.95, -6.6, 'forest-side-rear');
  await g.go(-17.95, -5, 'forest-rear');
  await g.shot('feedback');
  await g.verify('mobilefeedbackclearance', [], async () => {
    const rects = await g.page.evaluate(() => ['.world-approach-feedback', '.touch-jump', '.touch-joystick', '.camera-mode-control'].map(selector => {
      const e = document.querySelector(selector),
        r = e?.getBoundingClientRect();
      return {
        selector,
        rect: r ? {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height
        } : null
      };
    }));
    g.data.observations.push({
      rects
    });
    const f = rects[0].rect;
    assert(f, 'Blocked feedback required');
    for (const {
      rect: r
    } of rects.slice(1)) assert(!(f.x < r.x + r.width && f.x + f.width > r.x && f.y < r.y + r.height && f.y + f.height > r.y), 'Feedback must not cover touch movement/jump');
  });
}
export const related = [{
  id: 'D05.HOUSE.RELATED',
  contracts: [],
  run: house
}, {
  id: 'D05.PC.RELATED',
  contracts: [],
  run: computer
}, {
  id: 'D05.FEEDBACK.MOBILE',
  touch: true,
  contracts: [],
  run: mobile
}];
