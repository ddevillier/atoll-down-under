import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {readFile} from 'node:fs/promises';

// Menu-started worlds and ordinary input only. The sole write-side injection is
// a narrow localStorage failure. Read-only world geometry chooses real food;
// these checks establish UI integration, not human visual discoverability.
async function practice(page){
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});
 await page.getByRole('searchbox').fill('Neon damselfish');
 await page.getByRole('option',{name:/Neon damselfish/}).click();
 await clickButton(page,{name:'Explore freely',exact:true});
}
async function clickSponge(page){
 const point=await page.evaluate(()=>{
  const s=window.atoll.simulation,b=document.querySelector('#reef').getBoundingClientRect();
  for(const f of s.section.food.filter(f=>f.food==='sponge'&&f.regrow<=0)){
   for(const dx of [0,-5,5])for(const dy of [0,-5,5]){
    const x=f.x+dx,y=f.y+dy,cx=b.x+x/1600*b.width,cy=b.y+(y+55)/900*b.height;
    if(s.findAt(x,y)===f&&document.elementFromPoint(cx,cy)?.id==='reef')return {x:cx,y:cy};
   }
  }
  return null;
 });
 expect(point,'A real generated sponge must be selectable without an overlay intercept').not.toBeNull();
 await page.mouse.click(point.x,point.y);
}
async function ordinaryPoisonEnding(page){
 await practice(page);
 // Repeated poisonous food contact creates the terminal state naturally. No
 // direct consume/die calls, acceleration, resource edits or score assignments.
 for(let attempt=0;attempt<6;attempt++){
  const before=await page.evaluate(()=>({phase:window.atoll.simulation.phase,damage:window.atoll.simulation.player.poisonDamage||0}));
  if(before.phase==='dead')break;
  await clickSponge(page);
  await page.waitForFunction(previous=>{const s=window.atoll.simulation;return s.phase==='dead'||(s.player.poisonDamage||0)>previous;},before.damage,{timeout:20000});
  if(await page.evaluate(()=>window.atoll.simulation.phase!=='dead'))await page.waitForTimeout(650);
 }
 await expect(page.getByRole('dialog')).toContainText('poisoned by Sponge');
 expect(await page.evaluate(()=>window.atoll.simulation.phase)).toBe('dead');
}

test('Space activates the focused game button without spending an ability',async({page})=>{
 await practice(page);
 await page.getByRole('button',{name:'Field guide',exact:true}).focus();
 const before=await page.evaluate(()=>({cooldown:window.atoll.simulation.player.cooldown,energy:window.atoll.simulation.player.energy}));
 await page.keyboard.press('Space');
 await expect(page.getByRole('dialog')).toBeVisible();
 expect(await page.evaluate(()=>window.atoll.simulation.player.cooldown)).toBe(before.cooldown);
 expect(await page.evaluate(()=>window.atoll.simulation.player.energy)).toBe(before.energy);
});

test('explicit pause survives modal visits and keyboard focus stays inside dialogs',async({page})=>{
 await practice(page);await page.keyboard.press('Escape');
 for(const name of ['Settings','Field guide']){
  await clickButton(page,{name,exact:true});
  const snapshot=await page.evaluate(()=>window.atoll.simulation.serialize());
  for(let i=0;i<16;i++){
   await page.keyboard.press(i<8?'Tab':'Shift+Tab');
   expect(await page.evaluate(()=>!!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  }
  await page.keyboard.press('e');await page.keyboard.press('h');
  expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(snapshot);
  await clickButton(page,{name:'Close dialog',exact:true});
  expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 }
 const before=await page.evaluate(()=>window.atoll.simulation.time);
 await page.getByRole('button',{name:'Resume',exact:true}).focus();await page.keyboard.press('Space');
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.time)).toBeGreaterThan(before);
});

test('terminal close retains modal focus and cannot expose background controls',async({page})=>{
 test.setTimeout(120000);await ordinaryPoisonEnding(page);
 await clickButton(page,{name:'Close dialog',exact:true});
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>!!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
 for(let i=0;i<12;i++){
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>!!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
 }
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toBeVisible();
 expect(await page.evaluate(()=>window.atoll.simulation.phase)).toBe('dead');
});

test('failed terminal save keeps the actual ended dive recoverable until retry succeeds',async({page})=>{
 test.setTimeout(120000);await ordinaryPoisonEnding(page);
 const terminal=await page.evaluate(()=>window.atoll.simulation.serialize());
 await page.evaluate(()=>{
  const original=Storage.prototype.setItem;
  window.audit30RestoreStorage=()=>{Storage.prototype.setItem=original;};
  Storage.prototype.setItem=function(key,value){
   if(this===localStorage&&String(key).startsWith('atoll-save-'))throw new DOMException('Audit storage unavailable','QuotaExceededError');
   return original.call(this,key,value);
  };
 });
 try{
  await clickButton(page,{name:'Return home',exact:true});
  await expect(page.getByRole('status')).toContainText(/still open.*Export a backup or retry saving/i);
  expect(await page.evaluate(()=>window.atoll.simulation?.serialize())).toBe(terminal);
  await expect(page.getByRole('dialog',{name:'Your saved dives',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Save here',exact:true}).first()).toBeEnabled();
  const downloading=page.waitForEvent('download');
  await clickButton(page,{name:'Export dive file',exact:true});
  const backup=await downloading;
  expect(await backup.failure()).toBeNull();
  expect(backup.suggestedFilename()).toMatch(/\.atoll$/);
  const exported=JSON.parse(await readFile(await backup.path(),'utf8'));
  expect(exported.format).toBe('atoll-dive');
  expect(exported.state).toEqual(JSON.parse(terminal));
  expect(await page.evaluate(()=>window.atoll.simulation?.serialize())).toBe(terminal);
 }finally{await page.evaluate(()=>window.audit30RestoreStorage?.());}
 await clickButton(page,{name:'Done',exact:true});
 await expect(page.getByRole('dialog')).toContainText('poisoned by Sponge');
 expect(await page.evaluate(()=>window.atoll.simulation?.serialize())).toBe(terminal);
 await clickButton(page,{name:'Return home',exact:true});
 await expect(page.locator('.splash-bar')).toBeVisible();
 await clickButton(page,{name:'Saved dives',exact:true});
 await clickButton(page,{name:'Load dive',exact:true});
 await expect(page.getByRole('dialog')).toContainText('poisoned by Sponge');
 expect(await page.evaluate(()=>window.atoll.simulation.phase)).toBe('dead');
});
