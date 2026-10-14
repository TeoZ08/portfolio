import assert from 'node:assert/strict';
import { Gameplay, world } from './lib/gameplay.mjs';
export const regressions = [{
  id: 'D01',
  contracts: ['PC.ESCARTICLE', 'PC.ESCAPP', 'PC.ESCEXIT'],
  async run(g) {
    await g.open();
    await g.ready();
    await g.pc();
    await g.click(g.page.getByRole('button', {
      name: /Abrir os projetos/
    }));
    await g.page.locator('.project-file-row').filter({
      hasText: 'Portal UnAPI'
    }).click();
    await g.page.locator('.project-article h1').waitFor();
    await g.shot('article-before-Esc');
    await g.key('Escape');
    await g.shot('article-after-Esc');
    assert.equal(await g.page.locator('.project-article').count(), 0, 'Escape must return article→list after focused row disappears');
    await g.key('Escape');
    assert.equal(await g.page.locator('.desktop-window').count(), 0, 'Second Escape minimizes app');
    await g.key('Escape');
    await g.idle();
    assert.equal((await g.read()).env.perspective.interaction, 'idle');
    assert.equal(await g.page.locator('.world-device-overlay').count(), 0);
    await g.shot('returned-room');
  }
}, {
  id: 'D02',
  contracts: ['PC.SETMOTION', 'PC.SETQUALITY', 'PREF.STORAGE'],
  async run(g) {
    await g.open('/arquivo');
    await g.page.locator('.desktop-status button').click();
    await g.page.getByLabel('Movimento reduzido').check();
    await g.page.getByLabel('Qualidade do mundo').selectOption('low');
    await g.shot('changed');
    await g.page.reload();
    await g.page.locator('.desktop-status button').click();
    await g.shot('after-reload');
    const saved = await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1'));
    g.data.observations.push({
      saved
    });
    assert.equal(await g.page.getByLabel('Movimento reduzido').isChecked(), true, 'Reduced motion must survive first-route /arquivo reload');
    assert.equal(await g.page.getByLabel('Qualidade do mundo').inputValue(), 'low');
    assert.equal(JSON.parse(saved).quality, 'low');
  }
}, {
  id: 'D03',
  contracts: ['URL._dev_playground', 'DEV.CHAIR', 'DEV.CONSOLE', 'MOVEMENT.RECOVERY'],
  async run(g) {
    await g.open('/dev/playground');
    await g.page.waitForFunction(() => window.__environmentQA, null, {
      timeout: 60000
    });
    await g.key('F2');
    await g.page.locator('.dev-panel').waitFor();
    const samples = await g.page.evaluate(() => new Promise(resolve => {
      const samples = [],
        start = performance.now();
      function step() {
        const env = window.__environmentQA.read();
        samples.push({
          time: performance.now(),
          eye: env.perspective.eye,
          grounded: document.querySelector('[data-player-grounded]')?.textContent === 'true',
          body: document.body.innerText
        });
        if (samples.length >= 30) resolve(samples);else setTimeout(step, 200);
      }
      step();
    }));
    g.data.observations.push({
      samples
    });
    await g.shot('spawn-after30x200ms');
    assert(samples.every(s => Math.abs(s.eye[2]) < 7), 'DEV spawn/recovery must remain on DEV floor, not Field z26');
    assert(samples.filter(s => s.grounded).length >= samples.length * .8, 'DEV must stay grounded, not merely display the Grounded label');
    assert(samples.every(s => s.eye[1] > .8 && s.eye[1] < 1.6), 'DEV observer must never descend into repeated recovery');
  }
}, {
  id: 'D04',
  contracts: ['CAMERA.RETRACT', 'CAMERA.PITCH'],
  async run(g) {
    await g.open();
    await g.ready();
    await g.house();
    await g.go(0, 0, 'house-center');
    await g.page.locator('canvas').click({
      position: {
        x: 640,
        y: 340
      }
    });
    await g.mode('third-person-back');
    await g.key('c');
    await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch + .16) < .001);
    await g.page.mouse.move(640, 0);
    await g.page.mouse.move(640, 4000);
    await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch) > 1.4);
    const s = await g.shot('extreme');
    g.data.observations.push({
      camera: s.env.camera,
      eye: s.env.perspective.eye
    });
    assert(s.env.camera[1] < 3.24, 'Camera sphere must stay below visible ceilingY3.24');
    assert(Math.abs(s.motion.position.y - .86) < .05);
    await g.key('c');
    await g.shot('recovered');
  }
}, {
  id: 'D05',
  contracts: ['TARGET.HILL_BENCH.BACK', 'TARGET.FOREST_BENCH.BACK'],
  async run(g) {
    await g.open();
    await g.ready();
    for (const [id, name] of [['HILL_BENCH', 'Mirante'], ['FOREST_BENCH', 'Bosque']]) {
      await g.map(name);
      const t = world.targets.find(t => t.id === id),
        p = t.interactionPoint,
        y = t.interactionRotationY;
      const place = id === 'HILL_BENCH' ? world.plan.hill : world.plan.forestBench;
      const local = (x, z) => [place.x * .72 + x * Math.cos(place.yaw) + z * Math.sin(place.yaw), place.z * .72 - x * Math.sin(place.yaw) + z * Math.cos(place.yaw)];
      const width = id === 'HILL_BENCH' ? 1.9 : 1.65;
      const front = local(width, -1.25),
        side = local(width, .95),
        rear = local(0, .95);
      if (id === 'FOREST_BENCH') {
        await g.go(-15, -5, 'forest-front-path');
        await g.go(...local(0, -1.4), 'forest-front');
      }
      await g.go(...front, id + '-side-front');
      await g.go(...side, id + '-side-rear');
      await g.go(...rear, id + '-rear');
      await g.shot(id + '-rear-before');
      await g.key('e');
      const samples = await g.page.evaluate(() => new Promise(resolve => {
        const a = [],
          start = performance.now();
        function step() {
          a.push({
            time: performance.now(),
            state: window.__environmentQA.read().perspective.interaction,
            prompt: document.querySelector('.world-interaction-prompt')?.innerText,
            feedback: document.body.innerText
          });
          if (performance.now() - start >= 5000) resolve(a);else setTimeout(step, 100);
        }
        step();
      }));
      g.data.observations.push({
        id,
        samples
      });
      await g.shot(id + '-rear-after');
      assert.notEqual(samples.at(-1).state, 'approaching', 'An offered rear sit cannot leave input locked behind the solid bench');
      assert(samples.some(s => s.state === 'sitting' || /frente|passagem|aproximação.*bloque|imped|contorn/i.test(s.feedback)), 'Rear sit must complete or explain obstacle');
      if ((await g.read()).env.perspective.interaction !== 'idle') await g.key('Escape');
      await g.idle();
      await g.go(...side, id + '-return-side');
      await g.go(...front, id + '-return-front');
      await g.activate(id);
      assert.equal((await g.read()).env.perspective.interaction, 'sitting');
      await g.leave(id);
    }
  }
}, {
  id: 'D06',
  touch: true,
  contracts: ['A11Y.PC.SIDEBAR'],
  async run(g) {
    await g.open('/arquivo');
    await g.page.locator('.file-sidebar button').first().waitFor();
    const cdp = await g.context.newCDPSession(g.page);
    const ax = await cdp.send('Accessibility.getFullAXTree');
    const buttons = await g.page.locator('.file-sidebar button').evaluateAll(es => es.map(e => ({
      label: e.getAttribute('aria-label'),
      text: e.innerText
    })));
    g.data.observations.push({
      buttons,
      ax: ax.nodes.filter(n => n.role?.value === 'button').map(n => ({
        name: n.name?.value,
        ignored: n.ignored
      }))
    });
    await g.shot('sidebar');
    const doc = await cdp.send('DOM.getDocument');
    const query = await cdp.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: '.file-sidebar button'
    });
    const backend = await Promise.all(query.nodeIds.map(async nodeId => (await cdp.send('DOM.describeNode', {
      nodeId
    })).node.backendNodeId));
    const sidebarAX = ax.nodes.filter(n => backend.includes(n.backendDOMNodeId));
    g.data.observations.push({
      sidebarAX: sidebarAX.map(n => ({
        backend: n.backendDOMNodeId,
        role: n.role?.value,
        name: n.name?.value,
        ignored: n.ignored
      }))
    });
    const expected = ['Projetos', 'Faculdade', 'Notas', 'Terminal', 'Matteo', 'Contato'];
    for (const name of expected) {
      assert(sidebarAX.some(n => n.role?.value === 'button' && n.name?.value === name && !n.ignored), 'AX sidebar button name required: ' + name);
      await g.page.locator('.file-sidebar').getByRole('button', {
        name,
        exact: true
      }).tap();
      assert(await g.page.locator('.desktop-window').isVisible());
    }
    await cdp.detach();
  }
}, {
  id: 'D07',
  touch: true,
  contracts: ['A11Y.PC.WINDOW_TARGETS'],
  async run(g) {
    await g.open('/arquivo');
    await g.page.locator('.window-actions button').first().waitFor();
    await g.page.locator('.desktop-window').evaluate(e => Promise.all(e.getAnimations().map(animation => animation.finished)));
    const boxes = await g.page.locator('.window-actions button').evaluateAll(es => es.map(e => ({
      name: e.getAttribute('aria-label'),
      x: e.getBoundingClientRect().x,
      y: e.getBoundingClientRect().y,
      width: e.getBoundingClientRect().width,
      height: e.getBoundingClientRect().height
    })));
    g.data.observations.push({
      boxes
    });
    await g.shot('hitbox');
    assert(boxes.every(b => b.width >= 44 && b.height >= 44), 'Interactive hitboxes must be at least44×44 CSSpx');
    assert(boxes.slice(1).every((b, i) => b.x >= boxes[i].x + boxes[i].width), 'Window hitboxes must not overlap');
    assert.equal(await g.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    async function tapEdge(locator) {
      await g.page.locator('.desktop-window').evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)));
      const box = await locator.boundingBox();
      const x = box.x + 2,
        y = box.y + box.height / 2;
      g.data.inputs.push({
        nativeTouch: '44px handler edge, outside14px dot',
        x,
        y
      });
      await g.cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{
          id: 1,
          x,
          y,
          radiusX: 3,
          radiusY: 3,
          force: 1
        }]
      });
      await g.cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      });
    }
    await tapEdge(g.page.getByRole('button', {
      name: /Restaurar janela|Ampliar janela/
    }));
    await tapEdge(g.page.getByRole('button', {
      name: 'Minimizar janela'
    }));
    assert.equal(await g.page.locator('.desktop-window').count(), 0);
    await g.page.getByRole('button', {
      name: /Abrir os projetos/
    }).tap();
    await tapEdge(g.page.getByRole('button', {
      name: 'Fechar janela'
    }));
    assert.equal(await g.page.locator('.desktop-window').count(), 0);
    await g.shot('closed');
  }
}, {
  id: 'D08',
  touch: true,
  contracts: ['PREF.MOTION.DESKTOP_ANIMATION'],
  async run(g) {
    await g.open('/arquivo');
    await g.page.locator('.desktop-status button').tap();
    await g.page.getByLabel('Movimento reduzido').check();
    await g.page.getByRole('button', {
      name: 'Minimizar janela'
    }).tap();
    await g.page.getByRole('button', {
      name: /Abrir os projetos/
    }).tap();
    const timing = await g.page.locator('.desktop-window').evaluate(e => ({
      computed: getComputedStyle(e).animationDuration,
      animations: e.getAnimations().map(a => a.effect.getTiming())
    }));
    g.data.observations.push({
      timing
    });
    await g.shot('manual-reduced');
    assert(timing.computed.split(',').every(s => parseFloat(s) <= .05), 'Manual reduced motion must reduce window CSS animation, not leave220ms');
  }
}, {
  id: 'D09',
  contracts: ['SEQUENCE.MENU_DURING_ENTER', 'UI.TRANSITION'],
  async run(g) {
    await g.open();
    await g.ready();
    await g.route('chegada-eixo', 1, 3);
    await g.route('casa', 1);
    await g.near('HOUSE_ENTRY_DOOR');
    await g.page.evaluate(() => {
      window.__fadeSamples = [];
      const start = performance.now();
      function sample() {
        const fade = document.querySelector('.world-transition')?.classList.contains('world-transition--active');
        window.__fadeSamples.push({
          time: performance.now(),
          fade,
          disabled: document.querySelector('.world-menu-access')?.disabled,
          status: window.__environmentQA?.read().perspective.interaction,
          menu: document.querySelector('.pause-menu')?.open,
          region: document.querySelector('.world-canvas')?.dataset.currentRegion
        });
        if (performance.now() - start < 1600) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await g.key('e');
    await g.page.waitForFunction(() => document.querySelector('.world-transition--active'), null, {
      timeout: 8000
    });
    await g.page.keyboard.press('Escape');
    for (const k of ['Tab', 'Enter', 'Tab', 'Tab', 'Enter']) await g.page.keyboard.press(k);
    await g.idle();
    await g.shot('fast-Esc-map');
    const samples = await g.page.evaluate(() => window.__fadeSamples);
    g.data.observations.push({
      samples
    });
    assert(samples.some(s => s.fade), 'Must observe actual region fade');
    assert(samples.filter(s => s.fade).every(s => s.disabled === true && !s.menu), 'Menu must stay disabled while actual fade active');
    assert.equal((await g.read()).region, 'HOUSE');
    await g.map('Galeria · processo');
    assert.equal((await g.read()).region, 'FIELD');
    await g.shot('slow-map-arrived');
  }
}];
regressions.push({
  id: 'D10.POINTER_LOCK_CLICK',
  contracts: ['CAMERA.LOCKMANUAL', 'CAMERA.LOOK'],
  async run(g) {
    await g.open();
    await g.ready();
    await g.page.waitForFunction(() => !!document.pointerLockElement);
    const count = g.data.errors.filter(e => e.kind === 'pageerror').length;
    await g.shot('captured-before');
    await g.page.locator('canvas').click({
      position: {
        x: 640,
        y: 340
      }
    });
    await g.page.locator('canvas').click({
      position: {
        x: 640,
        y: 340
      }
    });
    await g.shot('captured-after-clicks');
    assert.equal(g.data.errors.filter(e => e.kind === 'pageerror').length, count, 'Clicking with mouse already locked must not throw setPointerCaptureInvalidStateError');
    assert((await g.read()).env.perspective.locked);
    const before = (await g.read()).env.perspective.yaw;
    await g.page.mouse.move(710, 360);
    await g.page.waitForFunction(y => Math.abs(window.__environmentQA.read().perspective.yaw - y) > .05, before);
    await g.shot('look-still-works');
  }
});
regressions.push({
  id: 'D11.FAVICON.RESOURCE',
  contracts: [],
  async run(g) {
    const response = await g.context.request.get((process.env.QA_BASE_URL || 'http://localhost:3154') + '/favicon.ico');
    const bytes = await response.body();
    g.data.observations.push({
      url: response.url(),
      status: response.status(),
      bytes: bytes.length,
      scope: 'Existing m. brand icon, no gameplay or remote request'
    });
    await g.open('/arquivo');
    await g.shot('favicon-resource');
    assert.equal(response.status(), 200, 'Known missing favicon must no longer emit404');
    assert.deepEqual([...bytes.subarray(0, 4)], [0, 0, 1, 0], 'Actual ICO signature, not a misleading extension');
    assert((await g.page.locator('head link[rel="icon"]').count()) > 0);
  }
});
