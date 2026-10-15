import {launch, Gameplay} from './lib/gameplay.mjs';
import path from 'node:path';
const out=path.resolve(process.env.QA_OUT || 'qa-results/first-visit');
const browser=await launch();
try {
 for(const touch of [false,true]) {
  const g=await new Gameplay(browser,out,`audit-${touch?'touch':'desktop'}`,{touch}).init();
  try {
   await g.open();
   await g.page.waitForFunction(()=>document.querySelector('.arrival-dialog')?.open && window.__environmentQA?.read().playerMotion?.grounded,null,{timeout:90000});
   await g.shot('first-arrival');
   g.data.observations.push(await g.page.locator('.arrival-dialog').evaluate(el=>({text:el.innerText,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight})));
   await g.ready(); await g.shot('first-world');
   await g.menu(); await g.shot('menu'); await g.click(g.page.getByRole('button',{name:'Abrir o mapa dos lugares'})); await g.shot('map');
   const drawing=g.page.locator('.map-drawing summary'); if(await drawing.count()){await g.click(drawing);await g.shot('map-drawing');await g.click(drawing);}
   await g.click(g.page.getByRole('button',{name:'Continuar explorando'}));
   if(touch){await g.stick('w',600); await g.shot('touch-moved');}
   await g.page.setViewportSize({width:touch?390:1280,height:390});await g.menu();await g.shot('short-menu');
   await g.page.setViewportSize({width:touch?390:1280,height:touch?844:720});
   await g.click(g.page.getByRole('button',{name:'Continuar explorando'}));
   for(const name of ['Galeria · processo','Galeria · Jarvis','Galeria · UnAPI']) {await g.map(name);await g.shot('context-'+name);}
   await g.house({physical:false});await g.near('HOUSE_COMPUTER');await g.shot('context-PC');
   g.data.status='observed';
  } catch(e){g.data.status='harness-error';g.data.error=e.stack;throw e;}
  finally {await g.end();}
 }
} finally {await browser.close();}
