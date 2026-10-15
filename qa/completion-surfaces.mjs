import assert from 'node:assert/strict';
import { sourceModule } from './lib/source-module.mjs';
const {
  PROJECTS,
  PROFILE
} = await sourceModule('src/content/portfolio.ts');
const externalHTTP = new Map();
async function external(g, locator, id, expected) {
  const href = await locator.getAttribute('href');
  assert.equal(href, expected);
  let observation = externalHTTP.get(href);
  if (!observation) {
    try {
      const response = await g.context.request.head(href, {
        timeout: 15000,
        failOnStatusCode: false
      });
      observation = {
        href,
        method: 'HEAD',
        status: response.status()
      };
      if (response.status() === 405) {
        const get = await g.context.request.get(href, {
          timeout: 15000,
          failOnStatusCode: false
        });
        observation = {
          href,
          method: 'HEAD→GET',
          headStatus: 405,
          status: get.status()
        };
      }
    } catch (error) {
      observation = {
        href,
        method: 'HEAD',
        error: error.message.split('\n')[0],
        status: null
      };
    }
    externalHTTP.set(href, observation);
  }
  g.data.observations.push({
    id,
    ...observation,
    scope: 'Public HEAD only, no application JS, IA endpoint or form submission'
  });
  await g.verify('external ' + id, [id], async () => {
    assert.equal(await locator.getAttribute('target'), '_blank');
    assert((await locator.getAttribute('rel')).includes('noreferrer'));
  }, {
    coverage: observation.status === 200 ? 'full' : 'partial',
    scope: 'URL and native link attributes; HEAD=' + observation.status + '. Timeout/non200 is not classified as product defect.'
  });
}
async function navigation(g) {
  await g.open();
  await g.page.waitForFunction(() => window.__environmentQA && !document.querySelector('.arrival-dialog button').disabled, null, {
    timeout: 60000
  });
  await g.click(g.page.getByRole('link', {
    name: /Ir direto aos projetos/
  }));
  await g.page.waitForURL('**/arquivo');
  await g.shot('arrival-direct-projects');
  await g.verify('arrival direct projects', ['UI.ARRIVALPROJECTS'], async () => assert(g.page.url().endsWith('/arquivo')));
  await g.click(g.page.getByRole('link', {
    name: /Explorar o mundo/
  }));
  await g.ready();
  await g.shot('archive-explore-world');
  await g.verify('archive explore link', ['PC.EXPLORE', 'URL._'], async () => assert.equal((await g.read()).region, 'FIELD'));
  for (const [name, url, id] of [['Projetos', '/arquivo', 'UI.DIRECTPROJECTS'], ['Sobre Matteo', '/perfil', 'UI.DIRECTPROFILE'], ['Arquivo pessoal', '/arquivo', 'UI.DIRECTARCHIVE']]) {
    await g.menu();
    await g.click(g.page.locator('.pause-links').getByRole('link', {
      name: new RegExp(name, 'i')
    }));
    await g.page.waitForURL('**' + url);
    await g.shot(id);
    await g.verify('pause navigation ' + name, [id], async () => assert(g.page.url().endsWith(url)));
    await g.open();
    await g.ready();
  }
  await g.open('/projetos/portfolio-world');
  await g.click(g.page.locator('.reading-navigation').getByRole('link', {
    name: /Voltar aos arquivos/
  }));
  await g.page.waitForURL('**/arquivo');
  await g.verify('article archive backlink', ['HTML.ARTICLE.BACK'], async () => assert(g.page.url().endsWith('/arquivo')));
  await g.open('/projetos/portfolio-world');
  await g.click(g.page.locator('.reading-navigation .brand-mark'));
  await g.ready();
  await g.shot('article-brand-world');
  await g.verify('article brand to world', ['HTML.ARTICLE.BRAND'], async () => assert.equal((await g.read()).region, 'FIELD'));
  await g.open('/perfil');
  for (const [i, link] of PROFILE.links.entries()) await external(g, g.page.locator('.profile-public-links a').nth(i), 'LINK.PROFILE.' + (i + 1), link.href);
  for (const project of PROJECTS.filter(p => p.links?.length)) {
    await g.open('/projetos/' + project.slug);
    for (const [i, link] of project.links.entries()) await external(g, g.page.locator('.project-links a').nth(i), 'LINK.PROJECT.' + project.slug + '.' + (i + 1), link.href);
    await g.shot('external-links-' + project.slug);
  }
  await g.open('/arquivo');
  await g.click(g.page.locator('.file-sidebar').getByRole('button', {
    name: 'Matteo',
    exact: true
  }));
  const popupPromise = g.context.waitForEvent('page');
  await g.click(g.page.getByRole('link', {
    name: /Abrir perfil para leitura/
  }));
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await g.verify('PC profile popup', ['LINK.PC.PROFILE'], async () => {
    assert(popup.url().endsWith('/perfil'));
    assert.equal(await popup.locator('h1').innerText(), PROFILE.name);
  });
  await popup.close();
}
async function houseDetails(g) {
  await g.open();
  await g.ready();
  await g.house();
  for (const [id, title, texts, contract] of [['HOUSE_REFERENCE_BOARD', 'Mural de referências', ['Estudos de computação conectam redes, inteligência artificial e arquitetura.', 'Papéis e cadernos registram aprendizados e atividades de extensão.'], 'HOUSE.BOARD'], ['HOUSE_BOOKSHELF', 'Estante de estudos', ['Livros e cadernos mantêm o aprendizado sempre ao alcance.', 'Cartões de idiomas dividem espaço com anotações de estudo.'], 'HOUSE.BOOKS']]) {
    await g.activate(id);
    const card = g.page.locator('.world-inspection-card');
    await g.verify('inspection ' + id, [contract], async () => {
      assert.equal(await card.locator('h2').innerText(), title);
      const text = await card.innerText();
      assert(texts.every(t => text.includes(t)));
      assert.equal(await card.locator('a').count(), 0);
      assert.equal(await card.locator('button').count(), 1);
    });
    await g.key('Escape');
    await g.idle();
    await g.shot(id + '-Esc');
    await g.verify('inspection Escape exit', ['HOUSE.INSPECTEXIT'], async () => assert.equal(await card.count(), 0), {
      coverage: 'partial',
      scope: 'Escape and public E; CTA variant measured separately'
    });
    await g.activate(id);
    await g.leave(id);
    await g.activate(id);
    await g.click(card.getByRole('button', {
      name: /Voltar/
    }));
    await g.idle();
    await g.shot(id + '-CTA');
    await g.verify('inspection native CTA', ['HOUSE.INSPECTEXIT'], async () => assert.equal(await card.count(), 0), {
      coverage: 'full',
      scope: 'Escape, E and visible return CTA all executed on each inspection'
    });
  }
  await g.activate('HOUSE_ENTRY_BENCH');
  await g.verify('House bench authored seat', ['HOUSE.BENCH'], async () => {
    const s = await g.read();
    assert.equal(s.env.interaction.activeTargetId, 'HOUSE_ENTRY_BENCH');
    assert(s.control.physicsLocked);
    assert(Math.abs(s.motion.position.x - -3.8 * .72) < .1);
  });
  await g.leave('HOUSE_ENTRY_BENCH');
  await g.verify('bench restores input', ['HOUSE.BENCH'], async () => {
    assert((await g.read()).control.manualInputEnabled);
    await g.key('d', 180);
    await g.settle();
  });
}
async function galleryLinks(g) {
  await g.open();
  await g.ready();
  for (const [name, target, id, href] of [['Galeria · Jarvis', 'UNIVERSITY_NOTEBOOK', 'GALLERY.JARVIS.EXTERNAL', PROJECTS.find(p => p.slug === 'jarvis-academico').links[0].href], ['Galeria · UnAPI', 'COMMUNITY_WORKSHOP', 'GALLERY.UNAPI.EXTERNAL', PROJECTS.find(p => p.slug === 'portal-unapi').links[0].href]]) {
    await g.map(name);
    await g.interact();
    await g.status('using');
    await external(g, g.page.locator('.place-links a[target="_blank"]').first(), id, href);
    await g.shot(id);
    await g.leave(target);
  }
  for (const exit of ['Escape', 'e', 'button']) {
    await g.map('Galeria · processo');
    await g.interact();
    await g.status('using');
    if (exit === 'button') await g.click(g.page.getByRole('button', {
      name: /Fechar e voltar a explorar/
    }));else await g.key(exit);
    await g.idle();
    await g.shot('process-exit-' + exit);
    await g.verify('process exit ' + exit, ['GALLERY.PROCESS.CLOSE'], async () => {
      assert.equal(await g.page.locator('.place-experience').count(), 0);
      assert((await g.read()).control.manualInputEnabled);
    });
  }
}
async function devOptions(g) {
  await g.open();
  await g.ready();
  await g.key('F2');
  await g.page.locator('.dev-panel').waitFor();
  await g.verify('F2 shows panel', ['DEV.F2'], async () => assert(await g.page.locator('.dev-panel').isVisible()));
  const range = g.page.locator('.dev-panel input[type="range"]');
  await range.focus();
  await range.press('End');
  await range.press('ArrowLeft');
  await g.verify('DEV hour public slider', ['DEV.HOUR'], async () => {
    assert.equal(await range.inputValue(), '23.5');
    assert.equal(await g.page.locator('.world-canvas').getAttribute('data-time-of-day'), '23.5');
  });
  await range.press('Home');
  for (let i = 0; i < 35; i++) await range.press('ArrowRight');
  assert.equal(await range.inputValue(), '17.5');
  await g.key('F2');
  await g.shot('debug-hidden-sunset-restored');
  assert.equal(await g.page.locator('.dev-panel').count(), 0);
  await g.verify('DEV avatar observer readable', ['DEV.AVATARQA'], async () => {
    const s = await g.read();
    assert(s.motion.grounded);
    assert(s.env.camera.every(Number.isFinite));
  }, {
    coverage: 'partial',
    scope: 'Opt-in DEV observer read, no setter. Production absence verified by build/static review.'
  });
  for (const [query, id, name] of [['sky=procedural', 'DEV.SKY', 'FIELD_PROCEDURAL_SKY_FALLBACK'], ['materialPilot=baseline', 'DEV.MATERIAL', 'HOUSE_INTERIOR_VISUAL_PROTOTYPE']]) {
    await g.open('/?avatarQA&' + query);
    await g.ready();
    if (id === 'DEV.MATERIAL') await g.house({
      physical: false
    });
    const names = await g.page.evaluate(name => {
      const scene = document.querySelector('canvas').__avatarQA.root.scene;
      return {
        present: !!scene.getObjectByName(name),
        panoramic: !!scene.getObjectByName('FIELD_PANORAMA_SKY')
      };
    }, name);
    g.data.observations.push({
      id,
      names
    });
    await g.shot(id);
    await g.verify('DEV query ' + query, [id], async () => {
      assert(names.present);
      if (id === 'DEV.SKY') assert.equal(names.panoramic, false);
      if (id === 'DEV.MATERIAL') {
        const keys = await g.page.evaluate(() => {
          const rows = [];
          document.querySelector('canvas').__avatarQA.root.scene.getObjectByName('HOUSE_INTERIOR_VISUAL_PROTOTYPE').traverse(o => {
            if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
              const key = m.customProgramCacheKey();
              if (key.startsWith('world-014-pbr-v1')) rows.push(key);
            }
          });
          return rows;
        });
        g.data.observations.push({
          baselineShaderKeys: keys
        });
        assert(keys.length > 0);
        assert(keys.every(k => k.includes('-false-')));
      }
    }, {
      coverage: 'partial',
      scope: 'Real query rendering observed; material response requires image comparison, not mere object presence'
    });
  }
}
export const completion = [{
  id: 'COMPLETE.NAVIGATION.LINKS',
  run: navigation
}, {
  id: 'COMPLETE.HOUSE.DETAILS',
  run: houseDetails
}, {
  id: 'COMPLETE.GALLERY.LINKS.EXITS',
  run: galleryLinks
}, {
  id: 'COMPLETE.DEV.OPTIONS',
  run: devOptions
}];
