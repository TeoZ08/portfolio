import assert from 'node:assert/strict';
import { world } from './lib/gameplay.mjs';
async function escapeFocusedLink(g) {
  await g.open();
  await g.ready();
  await g.pc();
  await g.click(g.page.getByRole('button', {
    name: /Abrir os projetos/
  }));
  await g.click(g.page.locator('.project-file-row').filter({
    hasText: 'Portal UnAPI'
  }));
  let found = false;
  for (let i = 0; i < 35; i++) {
    await g.key('Tab');
    if (await g.page.evaluate(() => document.activeElement.matches('.article-footer a'))) {
      found = true;
      break;
    }
  }
  assert(found, 'Reach real article link by native Tab, no focus setter');
  await g.shot('article-link-natively-focused');
  await g.key('Escape');
  await g.shot('focused-link-Esc-list');
  assert.equal(await g.page.locator('.project-article').count(), 0);
  await g.key('Escape');
  assert.equal(await g.page.locator('.desktop-window').count(), 0);
  await g.key('Escape');
  await g.idle();
  await g.shot('focused-link-Esc-exit');
  await g.verify('Escape from removed article link', ['PC.ESCARTICLE', 'PC.ESCAPP', 'PC.ESCEXIT'], async () => {
    assert.equal(await g.page.locator('.world-device-overlay').count(), 0);
    assert((await g.read()).control.manualInputEnabled);
  });
}
async function fieldFade(g) {
  await g.open();
  await g.ready();
  const mode = (await g.read()).env.perspective.selected;
  await g.menu();
  await g.click(g.page.getByRole('button', {
    name: /Abrir o mapa/
  }));
  await g.page.evaluate(() => {
    window.__fieldTravelSamples = [];
    const start = performance.now();
    function sample() {
      window.__fieldTravelSamples.push({
        time: performance.now(),
        fade: !!document.querySelector('.world-transition--active'),
        disabled: document.querySelector('.world-menu-access')?.disabled,
        menu: document.querySelector('.pause-menu')?.open,
        interaction: window.__environmentQA.read().perspective.interaction
      });
      if (performance.now() - start < 1600) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await g.click(g.page.getByRole('button').filter({
    hasText: 'Galeria · Jarvis'
  }).first());
  await g.page.waitForFunction(() => !!document.querySelector('.world-transition--active'));
  await g.key('F5');
  await g.key('Escape');
  await g.idle();
  const after = await g.shot('FIELD-to-FIELD-map-fade');
  const samples = await g.page.evaluate(() => window.__fieldTravelSamples);
  g.data.observations.push({
    samples
  });
  await g.verify('FIELD map fade gates menu and consumes F5 reload', ['UI.TRANSITION', 'SEQUENCE.MENU_DURING_ENTER'], async () => {
    const fade = samples.filter(s => s.fade);
    assert(fade.length > 0);
    assert(fade.every(s => s.disabled && !s.menu));
    assert.equal(after.region, 'FIELD');
    const target = world.targets.find(t => t.id === 'UNIVERSITY_NOTEBOOK');
    assert(Math.hypot(after.motion.position.x - target.interactionPoint[0], after.motion.position.z - target.interactionPoint[2]) < 1.2);
    assert.equal(after.env.perspective.selected, 'third-person-front');
  }, {
    coverage: 'partial',
    scope: 'FIELD→FIELD contrast: menu stays blocked; F5 retains existing camera cycling when focus is not HTML, without reload or losing travel. No new camera policy.'
  });
}
async function prompts(g) {
  await g.open();
  await g.ready();
  await g.route('chegada-eixo', 1, 3);
  await g.route('casa', 1);
  await g.near('HOUSE_ENTRY_DOOR');
  assert((await g.page.locator('.world-interaction-prompt').innerText()).includes('Entrar na casa'));
  await g.interact();
  await g.status('approaching');
  assert((await g.page.locator('.world-interaction-prompt').innerText()).includes('Cancelar'));
  await g.shot('prompt-approaching');
  await g.key('Escape');
  await g.idle();
  await g.go(-8.5, 10, 'away-from-house-radius');
  await g.shot('prompt-absent-outside-radius');
  assert.equal(await g.page.locator('.world-interaction-prompt').count(), 0);
  await g.map('Galeria · processo');
  await g.interact();
  await g.status('using');
  await g.shot('prompt-using-return');
  await g.verify('native prompt phases', ['UI.PROMPT'], async () => {
    assert((await g.page.locator('.world-interaction-prompt').innerText()).includes('Voltar'));
    assert.equal((await g.read()).env.interaction.activeTargetId, 'WORKSHOP_LIGHT_TABLE');
  });
  await g.leave('WORKSHOP_LIGHT_TABLE');
}
export const contractRegressions = [{
  id: 'CONTRACT.ESC.FOCUSED.LINK',
  run: escapeFocusedLink
}, {
  id: 'CONTRAST.FIELD.MAP.FADE',
  run: fieldFade
}, {
  id: 'CONTRACT.PROMPT.PHASES',
  run: prompts
}];
