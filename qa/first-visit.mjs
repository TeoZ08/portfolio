import assert from 'node:assert/strict';

// Public first-visit flows. State observers only read; native inputs drive all changes.
export const firstVisit = [false, true].map(touch => ({
  id: `FIRSTVISIT.${touch ? 'TOUCH' : 'DESKTOP'}`,
  touch,
  async run(g) {
    const p=g.page;
    if(touch) await p.emulateMedia({reducedMotion:'reduce'});
    await g.open();
    const enter=p.getByRole('button',{name:/Entrar e explorar/});
    await enter.waitFor();
    await p.waitForFunction(()=>document.querySelector('.arrival-dialog button')?.disabled===false);
    await g.shot('welcome');
    await g.verify('device instructions and optional controls',[],async()=>{
      const text=await p.locator(touch?'.arrival-touch':'.arrival-desktop').innerText();
      assert.match(text,touch?/Joystick.*Arraste/s:/WASD.*mouse/s);
      assert.match(await p.locator('.arrival-dialog').innerText(),/UnAPI e Jarvis na Galeria/);
      assert(await p.getByRole('link',{name:'Ir direto aos projetos'}).isVisible());
      assert((await p.getByRole('link',{name:'Ir direto aos projetos'}).boundingBox()).height>=44);
      assert.equal(await p.locator('.arrival-more').getAttribute('open'),null);
    });
    // Keyboard activation of summary, then Enter returns to the initial action.
    if(!touch){
      for(let i=0;i<5 && !(await p.locator('.arrival-more summary').evaluate(e=>e===document.activeElement));i++)await g.key('Tab');
      assert(await p.locator('.arrival-more summary').evaluate(e=>e===document.activeElement));
      await g.key('Enter');
    } else await g.click(p.locator('.arrival-more summary'));
    assert.equal(await p.locator('.arrival-more').evaluate(e=>e.open),true);
    await g.shot('controls-expanded');
    await g.click(p.locator('.arrival-more summary'));
    if(touch) await g.click(enter); else {await p.keyboard.press('Shift+Tab');await p.keyboard.press('Shift+Tab');assert(await enter.evaluate(e=>e===document.activeElement));await g.key('Enter');}
    await g.settle();
    if(!touch)await p.waitForFunction(()=>!!document.pointerLockElement);
    for(const mode of ['first-person','third-person-front','third-person-back'])await g.mode(mode);
    const before=await g.read();
    if(touch) {
      const b=await p.locator('.touch-joystick-pad').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
      const point=(id,x,y)=>({id,x,y,radiusX:5,radiusY:5,force:1});
      const send=async(type,touchPoints)=>{g.data.inputs.push({type,touchPoints});await g.cdp.send('Input.dispatchTouchEvent',{type,touchPoints});};
      await send('touchStart',[point(1,x,y)]);
      await send('touchMove',[point(1,x,y-40)]);
      await send('touchStart',[point(1,x,y-40),point(2,260,350)]);
      await send('touchMove',[point(1,x,y-40),point(2,300,370)]);
      await p.waitForFunction(yaw=>{const e=window.__environmentQA.read();return e.playerMotion.moving && Math.abs(e.perspective.yaw-yaw)>.05;},before.env.perspective.yaw);
      await g.shot('two-finger-walk-look');
      await send('touchEnd',[]);
    } else {await g.key('w',400);await g.key('a',200);await g.key('s',200);await g.key('d',200);await g.key('c');}
    await g.settle();
    assert(await p.getByRole('button',{name:/Mapa e projetos/}).isVisible());
    await g.verify('controls move safely',[],async()=>{const s=await g.read();assert(s.motion.grounded);assert(Math.hypot(s.motion.position.x-before.motion.position.x,s.motion.position.z-before.motion.position.z)>.2);});
    await g.menu();
    if(touch) {assert(await p.getByLabel('Movimento reduzido').isChecked());await g.click(p.getByLabel('Renderização leve'));}
    await g.click(p.getByRole('button',{name:'Abrir o mapa dos lugares'}));
    await g.shot('map-list');
    await g.verify('map has seven real destinations and readable actions',[],async()=>{
      assert.equal(await p.locator('.world-map li button').count(),7);
      assert.equal(await p.locator('.map-drawing').evaluate(e=>e.open),false);
      assert.equal(await p.locator('#pause-title').innerText(),'Mapa dos lugares');
      assert(await p.getByRole('dialog',{name:'Mapa dos lugares'}).isVisible());
      const ax=await g.cdp.send('Accessibility.getFullAXTree');
      g.data.observations.push({accessibility:ax.nodes.filter(n=>!n.ignored).map(n=>({role:n.role?.value,name:n.name?.value})),scope:'Browser AX tree; not physical screen-reader validation'});
      for(const b of await p.locator('.world-map li button').all()){const box=await b.boundingBox();assert(box.height>=44);assert(box.x>=0&&box.x+box.width<= (touch?390:1280));}
    });
    await g.click(p.locator('.map-drawing summary'));await g.shot('map-paths');
    assert(await p.getByRole('img',{name:/Mapa dos lugares/}).isVisible());
    await g.click(p.locator('.map-drawing summary'));
    await g.click(p.getByRole('button').filter({hasText:'Galeria · Jarvis'}).first());await g.idle();
    assert.match(await p.locator('.world-interaction-prompt').innerText(),/Jarvis Acadêmico/);
    await g.shot('context-before-jarvis');
    if(touch) {
      for(const [width,height] of [[390,844],[320,390]]) {
        await p.setViewportSize({width,height});
        await g.verify(`context action avoids controls ${width}x${height}`,[],async()=>{
          const action=await p.locator('.world-interaction-prompt').boundingBox();
          assert(action.height>=44 && action.x>=0 && action.x+action.width<=width);
          for(const sel of ['.touch-jump','.touch-joystick-pad']){
            const b=await p.locator(sel).boundingBox();
            assert(!(action.x<b.x+b.width && action.x+action.width>b.x && action.y<b.y+b.height && action.y+action.height>b.y),sel+' overlaps action');
          }
        });
        await g.shot(`context-size-${width}x${height}`);
      }
      await p.setViewportSize({width:390,height:844});
    }
    await g.interact();await g.status('using');await g.shot('jarvis-open');
    assert.equal((await g.read()).env.interaction.activeTargetId,'UNIVERSITY_NOTEBOOK');
    await g.leave('UNIVERSITY_NOTEBOOK');
    await g.house({physical:false});await g.near('HOUSE_COMPUTER');
    assert.match(await p.locator('.world-interaction-prompt').innerText(),/projetos, estudos/);await g.shot('computer-context');
    await g.menu();await g.click(p.getByRole('link',{name:/Ler os projetos/}));
    await p.waitForURL('**/arquivo');
    await p.waitForFunction(()=>/^\d{2}:\d{2}$/.test(document.querySelector('.desktop time')?.textContent||''));
    await g.click(p.locator('.project-file-row').filter({hasText:'Portal UnAPI'}));
    await p.locator('.project-article h1').waitFor();await g.shot('real-project');
    await g.verify('actual project reading',[],async()=>assert.match(await p.locator('.project-article h1').innerText(),/UnAPI/));
    // Preserve H09: test the existing safe return, without choosing a destination policy.
    await p.goBack();await g.ready();await g.shot('return-world');
    await g.menu();await g.key('Escape');
    await g.verify('Escape resumes canvas',[],async()=>{assert.equal(await p.locator('.pause-menu').evaluate(e=>e.open),false);assert(await p.locator('.world-canvas').evaluate(e=>e===document.activeElement));});
    await p.setViewportSize({width:touch?320:1280,height:390});await g.menu();
    await g.click(p.getByRole('button',{name:/Rever a chegada/}));
    await g.shot('short-arrival');
    await g.verify('short viewport scroll and exit',[],async()=>{
      const r=await p.locator('.arrival-dialog').evaluate(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,scroll:e.scrollHeight,client:e.clientHeight}));
      assert(r.w<= (touch?320:1280));assert(r.h<=390);assert(r.scroll>=r.client);
    });
    await g.click(p.locator('.arrival-more summary'));await g.shot('short-controls-expanded');
    assert.equal(await p.locator('.arrival-more').evaluate(e=>e.open),true);
    assert(await p.locator('.arrival-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
    await g.key('Escape');await g.settle();
    await g.verify('strict browser errors',[],()=>assert.deepEqual(g.data.errors,[]));
  }
}));
