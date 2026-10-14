import assert from 'node:assert/strict';
import { sourceModule } from './lib/source-module.mjs';
const {
  PROJECTS,
  NOTES,
  PROFILE
} = await sourceModule('src/content/portfolio.ts');
const {
  GALLERY_ARTWORKS
} = await sourceModule('src/content/gallery.ts');
async function pc(g) {
  await g.open();
  await g.ready();
  await g.pc();
  await g.click(g.page.getByRole('button', {
    name: /Abrir os projetos/
  }));
  await g.shot('welcome-open');
  await g.verify('PC welcome', ['PC.WELCOME', 'PC.APP.projects'], async () => assert.equal(await g.page.locator('.project-file-row').count(), 3));
  for (const project of PROJECTS) {
    await g.click(g.page.locator('.project-file-row').filter({
      hasText: project.title
    }));
    await g.page.locator('.project-article h1').waitFor();
    await g.shot(project.slug);
    await g.verify('article ' + project.slug, ['PC.PROJECT.' + project.slug], async () => {
      assert.equal(await g.page.locator('.project-article h1').innerText(), project.title);
      assert.equal(await g.page.locator('.article-chapter').count(), project.chapters.length);
      for (const [i, chapter] of project.chapters.entries()) {
        const section = g.page.locator('.article-chapter').nth(i);
        assert.equal(await section.locator('h2').innerText(), chapter.title);
        const text = await section.innerText();
        assert(chapter.paragraphs.every(p => text.includes(p)));
      }
      assert.equal(await g.page.locator('.project-links a').count(), project.links?.length || 0);
    });
    const link = g.page.locator('.article-footer a');
    const popupPromise = g.context.waitForEvent('page');
    await g.click(link);
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await g.verify('reading ' + project.slug, ['LINK.READING.' + project.slug], async () => {
      assert(popup.url().endsWith('/projetos/' + project.slug));
      assert.equal(await popup.locator('h1').innerText(), project.title);
    });
    await popup.close();
    await g.page.bringToFront();
    await g.click(g.page.getByRole('button', {
      name: /Todos os arquivos/
    }));
    assert.equal(await g.page.locator('.project-file-row').count(), 3);
    await g.click(g.page.locator('.project-file-row').filter({
      hasText: project.title
    }));
    await g.key('Escape');
    assert.equal(await g.page.locator('.project-article').count(), 0);
  }
  for (const name of ['Faculdade', 'Notas', 'Terminal', 'Matteo', 'Contato']) {
    await g.click(g.page.locator('.file-sidebar').getByRole('button', {
      name,
      exact: true
    }));
    await g.shot('app-' + name);
    const id = {
      Faculdade: 'faculty',
      Notas: 'notes',
      Terminal: 'terminal',
      Matteo: 'about',
      Contato: 'contact'
    }[name];
    await g.verify('app ' + id, ['PC.APP.' + id], async () => {
      assert(await g.page.locator('.desktop-window').isVisible());
      assert.equal(await g.page.locator('.desktop-window').getAttribute('aria-label'), name);
      if (id === 'faculty') {
        const projects = PROJECTS.filter(p => p.category.startsWith('Formação'));
        assert.equal(await g.page.locator('.project-file-row').count(), projects.length);
        for (const p of projects) assert((await g.page.locator('.project-directory').innerText()).includes(p.title));
      }
      if (id === 'about') {
        const text = await g.page.locator('.about-page').innerText();
        assert(PROFILE.about.every(p => text.includes(p)));
      }
      if (id === 'contact') assert.equal(await g.page.locator('.contact-page a').count(), PROFILE.links.length);
    });
  }
  await g.click(g.page.locator('.file-sidebar').getByRole('button', {
    name: 'Notas',
    exact: true
  }));
  for (const note of NOTES) {
    await g.click(g.page.locator('.notes-layout nav button').filter({
      hasText: note.title
    }));
    await g.shot('note-' + note.id);
    await g.verify('note ' + note.id, ['PC.NOTE.' + note.id], async () => {
      assert.equal(await g.page.locator('.note-paper h1').innerText(), note.title);
      const body = await g.page.locator('.note-paper').innerText();
      assert(note.body.every(p => body.includes(p)));
      await g.click(g.page.locator('.file-sidebar').getByRole('button', {
        name: 'Projetos',
        exact: true
      }));
      await g.click(g.page.locator('.file-sidebar').getByRole('button', {
        name: 'Notas',
        exact: true
      }));
      assert.equal(await g.page.locator('.note-paper h1').innerText(), note.title);
    });
  }
  await g.click(g.page.locator('.file-sidebar').getByRole('button', {
    name: 'Projetos',
    exact: true
  }));
  await g.click(g.page.locator('.file-sidebar').getByRole('button', {
    name: 'Notas',
    exact: true
  }));
  assert.equal(await g.page.locator('.note-paper h1').innerText(), NOTES.at(-1).title);
  await g.click(g.page.locator('.file-sidebar').getByRole('button', {
    name: 'Terminal',
    exact: true
  }));
  const input = g.page.getByLabel('Comando do terminal');
  await g.click(input);
  const before = await g.read();
  await input.fill('base ');
  for (const key of ['w', 'a', 's', 'd', 'c', 'Space', 'e', 'F5']) await input.press(key);
  const after = await g.shot('typing');
  await g.verify('typing suppresses controls', ['PC.TEXTBLOCK', 'MOVEMENT.UIBLOCK', 'CAMERA.MODEBLOCK'], async () => {
    assert.deepEqual(after.motion.position, before.motion.position);
    assert.equal(after.env.perspective.selected, before.env.perspective.selected);
    assert((await input.inputValue()).includes('wasdc e'));
    assert(after.control.physicsLocked);
  });
  for (const [cmd, id, expected] of [['ajuda', 'ajuda', 'projetos · faculdade'], ['help', 'help', 'projetos · faculdade'], ['ls', 'ls', 'projetos/'], ['desconhecido', 'unknown', 'Comando não encontrado'], [' AJUDA ', 'case-space', 'projetos · faculdade']]) {
    await input.fill(cmd);
    await input.press('Enter');
    await g.shot('terminal-' + id);
    await g.verify('terminal ' + id, ['TERMINAL.' + id], async () => assert((await g.page.locator('[role="log"]').innerText()).includes(expected)));
  }
  const n = await g.page.locator('[role="log"] p').count();
  await input.fill('   ');
  await input.press('Enter');
  await g.verify('terminal empty', ['TERMINAL.empty'], async () => assert.equal(await g.page.locator('[role="log"] p').count(), n));
  for (const cmd of ['limpar', 'clear']) {
    await input.fill(cmd);
    await input.press('Enter');
    await g.shot('terminal-' + cmd);
    await g.verify('terminal ' + cmd, ['TERMINAL.' + cmd], async () => assert.equal(await g.page.locator('[role="log"] p').count(), 0));
    await input.fill('ls');
    await input.press('Enter');
  }
  for (let i = 0; i < 35; i++) {
    await input.fill('ls');
    await input.press('Enter');
  }
  await g.shot('terminal-history');
  await g.verify('terminal bounded history', ['TERMINAL.history'], async () => assert.equal(await g.page.locator('[role="log"] p').count(), 62));
  for (const [cmd, name] of [['projetos', 'Projetos'], ['faculdade', 'Faculdade'], ['notas', 'Notas'], ['sobre', 'Matteo'], ['contato', 'Contato']]) {
    await g.click(g.page.locator('.file-sidebar').getByRole('button', {
      name: 'Terminal',
      exact: true
    }));
    if (cmd !== 'projetos') await g.verify('terminal fresh mount ' + cmd, ['TERMINAL.history'], async () => assert.equal(await g.page.locator('[role="log"] p').count(), 2));
    await input.fill(cmd);
    await input.press('Enter');
    await g.shot('terminal-opens-' + cmd);
    await g.verify('terminal opens ' + cmd, ['TERMINAL.' + cmd], async () => assert.equal(await g.page.locator('.desktop-window').getAttribute('aria-label'), name));
  }
  await g.click(g.page.locator('.desktop-status button'));
  await g.click(g.page.locator('.desktop').getByLabel('Movimento reduzido'));
  await g.page.locator('.desktop').getByLabel('Qualidade do mundo').selectOption('low');
  await g.shot('preferences-world');
  await g.verify('world persistence', ['PC.SETMOTION', 'PC.SETQUALITY', 'PREF.STORAGE', 'PC.APP.settings'], async () => {
    const s = JSON.parse(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1')));
    assert.equal(s.quality, 'low');
    assert.equal(s.reducedMotion, true);
  });
  await g.click(g.page.getByRole('button', {
    name: /Ampliar janela|Restaurar janela/
  }));
  await g.shot('maximized');
  await g.verify('maximize', ['PC.MAXIMIZE'], async () => assert(await g.page.locator('.desktop-window--maximized').isVisible()));
  await g.click(g.page.getByRole('button', {
    name: 'Minimizar janela'
  }));
  await g.shot('minimized');
  await g.verify('minimize', ['PC.MINIMIZE'], async () => assert.equal(await g.page.locator('.desktop-window').count(), 0));
  await g.click(g.page.locator('.desktop-status button'));
  assert.equal(await g.page.locator('.desktop-window').getAttribute('aria-label'), 'Preferências');
  await g.click(g.page.locator('.desktop').getByLabel('Movimento reduzido'));
  await g.page.locator('.desktop').getByLabel('Qualidade do mundo').selectOption('balanced');
  await g.click(g.page.getByRole('button', {
    name: 'Mostrar mesa de trabalho'
  }));
  await g.shot('wordmark');
  await g.verify('wordmark', ['PC.WORDMARK'], async () => assert(await g.page.getByRole('button', {
    name: /Abrir os projetos/
  }).isVisible()));
  await g.click(g.page.getByRole('button', {
    name: /Abrir os projetos/
  }));
  await g.click(g.page.getByRole('button', {
    name: 'Fechar janela'
  }));
  await g.shot('closed');
  await g.verify('close app', ['PC.CLOSE'], async () => assert.equal(await g.page.locator('.desktop-window').count(), 0));
  await g.leave('HOUSE_COMPUTER');
  await g.verify('PC exit', ['HOUSE.PCEXIT'], async () => {
    const s = await g.read();
    assert.equal(s.control.physicsLocked, false);
    assert.equal(s.control.pose, null);
  });
}
async function gallery(g) {
  await g.open();
  await g.ready();
  await g.map('Galeria · processo');
  await g.interact();
  await g.status('using');
  for (const [label, hour, id] of [['Manhã', 9, 'MORNING'], ['Anoitecer', 20, 'NIGHT'], ['Fim de tarde', 17.5, 'SUNSET']]) {
    await g.click(g.page.getByRole('button', {
      name: label,
      exact: true
    }));
    await g.page.waitForFunction(h => document.querySelector('.world-canvas')?.dataset.timeOfDay === String(h), hour);
    await g.shot('light-' + id);
    await g.verify('light ' + id, ['GALLERY.PROCESS.' + id], async () => {
      assert.equal(await g.page.getByRole('button', {
        name: label,
        exact: true
      }).getAttribute('aria-pressed'), 'true');
      assert.equal(await g.page.locator('.world-canvas').getAttribute('data-time-of-day'), String(hour));
    });
  }
  await g.click(g.page.getByRole('link', {
    name: /Por dentro deste portfólio/
  }));
  await g.page.locator('.project-article h1').waitFor();
  await g.shot('process-article');
  await g.verify('process article', ['GALLERY.PROCESS.ARTICLE'], () => assert(g.page.url().endsWith('/projetos/portfolio-world')));
  await g.page.goBack();
  await g.ready();
  await g.map('Galeria · Jarvis');
  await g.interact();
  await g.status('using');
  for (const [label, id] of [['RAG e fontes', 'RAG'], ['Fallback', 'FALLBACK'], ['Arquitetura', 'ARCHITECTURE']]) {
    await g.click(g.page.getByRole('button', {
      name: label,
      exact: true
    }));
    await g.shot('suggestion-' + id);
    await g.verify('suggestion ' + id, ['GALLERY.JARVIS.' + id], async () => {
      const n = await g.page.locator('.place-results blockquote').count();
      assert(n > 0 && n <= 3);
      assert((await g.page.locator('.place-results').innerText()).includes('Jarvis Acadêmico'));
    });
  }
  const query = g.page.getByLabel('O que você quer entender?');
  for (const [q, id] of [['', 'EMPTY'], ['   ', 'EMPTY'], ['naoexistezzxyz', 'UNKNOWN'], ['de e o a', 'STOPWORDS'], ['fóntes', 'QUERY'], ['BACKEND', 'QUERY']]) {
    await query.fill(q);
    await g.click(g.page.getByRole('button', {
      name: 'Buscar',
      exact: true
    }));
    await g.shot('query-' + id);
    await g.verify('query ' + id, ['GALLERY.JARVIS.' + id], async () => {
      const n = await g.page.locator('.place-results blockquote').count();
      if (['EMPTY', 'UNKNOWN', 'STOPWORDS'].includes(id)) assert.equal(n, 0);else assert(n > 0 && n <= 3);
      if (id === 'EMPTY') assert.equal((await g.page.locator('.place-results').innerText()).trim(), '');
      if (['UNKNOWN', 'STOPWORDS'].includes(id)) assert((await g.page.locator('.place-results').innerText()).includes('Nenhum trecho encontrado'));
    }, {
      coverage: id === 'QUERY' ? 'partial' : 'full',
      scope: 'Local extrative suggestions/negative/accent/uppercase; allparagraphs source-authentic checked separately'
    });
  }
  await query.fill('x'.repeat(200));
  assert.equal((await query.inputValue()).length, 160);
  await art(g, 'jarvis');
  await g.key('Escape');
  await g.idle();
  await g.verify('Jarvis close', ['GALLERY.JARVIS.CLOSE'], async () => assert.equal(await g.page.locator('.place-experience').count(), 0));
  await g.interact();
  await g.status('using');
  assert.equal(await query.inputValue(), '');
  await g.key('Escape');
  await g.idle();
  await g.map('Galeria · UnAPI');
  await g.interact();
  await g.status('using');
  const url = g.page.url();
  for (const [label, id, phrase] of [['Abrir o link da mensagem', 'CLICK', 'Pare antes'], ['Conferir pelo canal oficial', 'CHECK', 'Isso. Acesse']]) {
    await g.click(g.page.getByRole('button', {
      name: label,
      exact: true
    }));
    await g.shot('unapi-' + id);
    await g.verify('unapi ' + id, ['GALLERY.UNAPI.' + id], async () => {
      assert((await g.page.locator('.place-feedback').innerText()).includes(phrase));
      assert.equal(g.page.url(), url);
      assert.equal(await g.page.getByRole('button', {
        name: label,
        exact: true
      }).getAttribute('aria-pressed'), 'true');
    });
  }
  await art(g, 'unapi');
  const focusSteps = [];
  for (let i = 0; i < 15; i++) {
    await g.key('Tab');
    focusSteps.push(await g.page.locator('.place-experience').evaluate(e => ({
      inside: e.contains(document.activeElement),
      element: document.activeElement.outerHTML.slice(0, 200)
    })));
  }
  g.data.observations.push({
    focusSteps
  });
  await g.verify('panel focus trap', ['UI.FOCUS'], () => assert(focusSteps.length === 15 && focusSteps.every(s => s.inside)), {
    coverage: 'partial',
    scope: '15nativeTabs inside UnAPI; otherdialogs/ShiftTab notallcovered'
  });
  await g.key('Escape');
  await g.idle();
  await g.verify('UnAPI close', ['GALLERY.UNAPI.CLOSE'], async () => assert.equal(await g.page.locator('.place-experience').count(), 0));
  await g.interact();
  await g.status('using');
  assert.equal(await g.page.getByRole('button', {
    name: 'Conferir pelo canal oficial',
    exact: true
  }).getAttribute('aria-pressed'), 'false');
  assert.equal(await g.page.getByRole('button', {
    name: 'Abrir o link da mensagem',
    exact: true
  }).getAttribute('aria-pressed'), 'false');
  assert((await g.page.locator('.place-feedback').innerText()).includes('Pare → confira → decida'));
  await g.key('Escape');
  await g.idle();
  await g.map('Bosque');
  await g.interact();
  await g.status('using');
  const audio = [];
  g.cdp.on('WebAudio.audioNodeCreated', x => audio.push(x));
  await g.cdp.send('WebAudio.enable');
  for (const [note, id] of [['Sol', 'SOL'], ['Lá', 'LA'], ['Dó', 'DO'], ['Dó', 'REPEAT']]) {
    const n = await g.page.evaluate(() => window.__functionalEvents.filter(e => e.type === 'world:chime').length);
    await g.click(g.page.getByRole('button', {
      name: 'Tocar ' + note
    }));
    await g.page.waitForFunction(n => window.__functionalEvents.filter(e => e.type === 'world:chime').length > n, n);
    await g.shot('chime-' + id);
    await g.verify('chime ' + id, ['CHIME.' + id], async () => {
      assert((await g.page.locator('.place-caption').innerText()).includes(note));
      assert(audio.length > 0);
    }, {
      coverage: 'partial',
      scope: 'Native click,world:chime,WebAudio nodes andfeedback; physicalaudibility/animationdecay separately'
    });
  }
  await g.click(g.page.getByRole('button', {
    name: 'Tocar Sol'
  }));
  const movement = await g.page.evaluate(() => new Promise(resolve => {
    const a = [],
      start = performance.now();
    function tick() {
      const object = window.__environmentQA.inspect('FOREST_HANDMADE_WIND_CHIME'),
        notes = object?.children.filter(c => c.children.includes('CHIME_THREAD'));
      a.push({
        time: performance.now() - start,
        notes
      });
      if (performance.now() - start > 2500) resolve(a);else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }));
  g.data.observations.push({
    chimeRotation: movement
  });
  await g.verify('physical windchime response', ['CHIME.REPEAT'], () => {
    assert(movement.every(s => s.notes?.length === 3));
    const early = Math.max(...movement.filter(s => s.time < 500).map(s => Math.abs(s.notes[0].rotation[2]))),
      late = Math.max(...movement.filter(s => s.time > 2000).map(s => Math.abs(s.notes[0].rotation[2])));
    assert(early > .07);
    assert(late < early * .6);
  }, {
    coverage: 'partial',
    scope: 'Nativebutton→worldchime→real3Drotation/decay; soundaudibility manual'
  });
  g.data.observations.push({
    webAudioEvents: audio
  });
  await g.key('Escape');
  await g.idle();
  await g.verify('chime close', ['CHIME.CLOSE'], async () => assert.equal(await g.page.locator('.place-experience').count(), 0));
}
async function art(g, project) {
  await g.click(g.page.locator('.place-experience summary'));
  const figs = g.page.locator('.place-experience details figure');
  assert.equal(await figs.count(), 2);
  await g.page.locator('.place-experience details img').evaluateAll(async es => await Promise.all(es.map(e => e.decode())));
  for (let i = 0; i < 2; i++) {
    const fig = figs.nth(i),
      id = project === 'jarvis' ? ['jarvis-chat', 'jarvis-evidencias'][i] : ['unapi-home', 'unapi-antigolpe'][i];
    await g.shot('art-' + id);
    await g.verify('expand ' + id, ['ART.' + id + '.EXPAND'], async () => {
      assert(await fig.isVisible());
      const artwork = GALLERY_ARTWORKS.find(a => a.id === id);
      assert.equal(await fig.locator('img').getAttribute('alt'), artwork.alt);
      assert.equal(await fig.locator('a').getAttribute('href'), artwork.src);
      assert.equal(await fig.locator('figcaption').innerText(), artwork.title + ' · ' + artwork.caption);
      assert((await fig.locator('figcaption').innerText()).length > 0);
    });
    const event = g.context.waitForEvent('page');
    await g.click(fig.locator('a'));
    const tab = await event;
    await tab.waitForLoadState('load');
    await g.verify('image ' + id, ['ART.' + id + '.IMAGE'], async () => {
      assert(tab.url().includes('/assets/projects/'));
      assert.equal(await tab.locator('img').evaluate(e => e.complete && e.naturalWidth > 0), true);
    });
    await tab.close();
    await g.page.bringToFront();
  }
}
export const content = [{
  id: 'PC.DEEP.DESKTOP',
  contracts: [],
  run: pc
}, {
  id: 'PC.DEEP.TOUCH',
  touch: true,
  contracts: [],
  run: pc
}, {
  id: 'GALLERY.DEEP.DESKTOP',
  contracts: [],
  run: gallery
}];
