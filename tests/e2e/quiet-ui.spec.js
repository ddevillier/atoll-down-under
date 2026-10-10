import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {Simulation} from '../../src/simulation.js';
import {exportDive} from '../../src/save-files.js';

const folder=process.env.QUIET_UI_ARTIFACTS||'artifacts/quiet-ui';
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}
async function action(page,name){const target=page.locator(`[data-action="${name}"]`).first();if(!await target.isVisible()){const menu=await target.evaluate(e=>e.closest('.splash-menu')?.querySelector('summary').textContent);if(menu)await page.locator('.splash-menu>summary').filter({hasText:menu}).click();}await target.click();}
async function close(page){await page.locator('.panel [data-action="close"]').first().click();}
async function practice(page,name='Neon damselfish',activity=false){await action(page,'mode-practice');await page.getByRole('searchbox').fill(name);await page.getByRole('option').first().click();await action(page,activity?'begin-adventure':'begin-practice');}
async function imported(page,sim){await ready(page);await action(page,'saves');await page.locator('#dive-file').setInputFiles({name:'quiet-ui.atoll',mimeType:'application/json',buffer:Buffer.from(exportDive(sim,'Quiet UI checkpoint'))});await action(page,'open-import');}

for(const [width,height] of [[1600,900],[1024,768]])test(`all main surfaces keep useful controls and disclose extra text at ${width}`,async({page})=>{
 test.setTimeout(120000);await mkdir(folder,{recursive:true});await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));const captures=[];
 async function capture(name,{allowAbout=false}={}){
  const text=await page.locator('#ui').evaluate(ui=>{
   const root=ui.querySelector('.overlay')||ui,walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),parts=[];
   for(let node;node=walker.nextNode();){const value=node.textContent.trim(),parent=node.parentElement;if(!value||parent.closest('.sr-only,select,script,style'))continue;const range=document.createRange();range.selectNodeContents(node);const rects=[...range.getClientRects()];const visible=rects.some(r=>{if(r.width<=1||r.height<=1||r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return false;for(let p=parent;p;p=p.parentElement){if(p.tagName==='DETAILS'&&!p.open&&!p.querySelector(':scope > summary')?.contains(parent))return false;const style=getComputedStyle(p);if(style.visibility==='hidden'||style.display==='none')return false;if(/hidden|auto|scroll|clip/.test(style.overflow)){const b=p.getBoundingClientRect();if(r.right<=b.left||r.left>=b.right||r.bottom<=b.top||r.top>=b.bottom)return false;}}return true;});if(visible)parts.push(value);
   }return parts.join('\n');
  });
  if(!allowAbout)expect(text).not.toMatch(/Small acts of care|Explore its life|AI-generated voice|gameplay abstractions|ecological model|Your journey continues|Every life teaches|Keep steering freely|You can explore freely at any time/);
  const body=page.locator('.panel-body');if(await body.count())expect(await body.evaluate(e=>e.scrollWidth<=e.clientWidth+1),`${name} has no horizontal overflow`).toBe(true);
  const foreground=await page.locator('.overlay').count()?page.locator('.overlay'):page.locator('#ui');captures.push({name,text,contentText:await foreground.innerText()});await page.screenshot({path:`${folder}/${width}-${name}.png`});
 }
 await ready(page);expect(await page.evaluate(()=>window.atoll.state.settings.hints)).toBe(false);await capture('splash');
 for(const menu of ['File','Game','Help']){await page.locator('.splash-menu>summary').filter({hasText:menu}).click();await capture('menu-'+menu.toLowerCase());await page.locator('.splash-menu>summary').filter({hasText:menu}).click();}
 await action(page,'mode-practice');await capture('practice');await close(page);
 for(const mode of ['challenge','tournament']){await action(page,'mode-'+mode);await capture(mode);await expect(page.getByText('Score goals',{exact:true})).toBeVisible();await expect(page.locator('details').filter({has:page.locator('summary').filter({hasText:'Score goals'})})).not.toHaveAttribute('open','');await page.getByText('Score goals',{exact:true}).click();await expect(page.getByRole('dialog')).toContainText('bonus points');await close(page);}
 await action(page,'mode-create');await capture('create');await close(page);
 await action(page,'guide');
 for(const tab of ['species','food','glossary','web','life','notes']){if(tab!=='species')await action(page,'guide-'+tab);await capture('guide-'+tab);}
 await action(page,'guide-species');await page.getByText('Read introduction',{exact:true}).click();await expect(page.locator('.guide-narration p')).toBeVisible();await page.locator('.natural-history>summary').click();await expect(page.locator('.natural-history-body')).toBeVisible();await capture('guide-reading');await close(page);
 await action(page,'journal');await capture('journal');await page.locator('.journal-stamps>summary').click();await page.getByText('How to earn a care stamp',{exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Restore at least 10 Energy');await close(page);
 await action(page,'saves');await capture('saves-empty');await close(page);
 await action(page,'settings');await capture('settings');await page.getByText('Setting details',{exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toContainText('F11 changes fullscreen');await close(page);
 await action(page,'scores');await capture('scores-empty');await close(page);
 await action(page,'help');await capture('help');await page.getByText('About Atoll',{exact:true}).click();await capture('about',{allowAbout:true});await close(page);
 await practice(page);await capture('gameplay');await expect(page.locator('.controls-hint')).toHaveCount(0);await expect(page.locator('.toast')).toHaveCount(0);await expect(page.locator('#state-badge')).toContainText('Watching safely');await expect(page.locator('#dive-state-cue')).toHaveAttribute('data-state','shield');
 await action(page,'reef-map');await capture('map');await page.locator('[data-action="map-select"][data-reef="0"]').click();await expect(page.getByRole('button',{name:'Guide my swim'})).toBeEnabled();await close(page);
 await action(page,'saves');await capture('saves-current');await page.locator('#dive-file').setInputFiles({name:'broken.atoll',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.locator('.modal-notice')).toBeVisible();await capture('save-error');await close(page);
 await action(page,'pause');await capture('pause');const target=await page.evaluate(()=>{const s=window.atoll.simulation,e=s.section.entities.find(e=>e.alive&&e.species.id==='s46');s.section.entities=[e];s.section.food=[];Object.assign(e,{x:1050,y:380,angle:0,facing:1});return {x:e.x,y:e.y};});
 const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+target.x/1600*box.width,box.y+(target.y+55)/900*box.height);await expect(page.locator('.inspect-card')).toBeVisible();await capture('inspection');await expect(page.locator('.inspect-card')).not.toContainText('The reef is paused while');await capture('resident');await page.getByText('Observation details',{exact:true}).click();await expect(page.locator('#resident-step')).toBeVisible();await action(page,'resident-close');await action(page,'pause');
 await ready(page);await practice(page,'Bluestreak cleaner wrasse',true);await capture('activity');await expect(page.locator('#adventure-step')).toBeHidden();await page.getByText('Activity details',{exact:true}).click();await expect(page.locator('#adventure-step')).toBeVisible();await capture('activity-details');await action(page,'activity-help');await capture('activity-audio');await expect(page.locator('#narration-status')).toBeHidden();await close(page);
 const dead=new Simulation(6101);dead.start('practice','s1');dead.die('Your fish needs another try.');await imported(page,dead);await capture('ending-dead');await action(page,'retry');await expect(page.getByRole('dialog')).toHaveCount(0);
 const advance=new Simulation(6102);advance.start('challenge');advance.phase='advance';advance.stageScore=advance.required;await imported(page,advance);await capture('ending-advance');await action(page,'next-stage');await expect(page.getByRole('dialog')).toHaveCount(0);
 const won=new Simulation(6103);won.start('challenge');won.stage=won.sequence.length-1;won.spawnPlayer((await import('../../src/data.js')).BY_ID[won.sequence[won.stage]]);won.phase='won';await imported(page,won);await capture('ending-won');await action(page,'finish-home');await expect.poll(()=>page.evaluate(()=>window.atoll.state.home)).toBe(true);
 await writeFile(`${folder}/${width}-visible-text.json`,JSON.stringify(captures,null,2));expect(errors).toEqual([]);
});

test('ordinary progress uses visual effects and accessible announcements without routine toasts',async({page})=>{
 await ready(page);await practice(page);
 await page.evaluate(()=>{const s=window.atoll.simulation;s.section.entities=[];s.events=[];window.quietEffects=[];const r=window.atoll.renderer,add=r.addEffect;r.addEffect=function(...args){window.quietEffects.push(args);return add.apply(this,args);};s.event('eat','Meal eaten',{x:s.player.x,y:s.player.y,energyGained:10});s.event('homecoming','Home again',{x:s.player.x,y:s.player.y});s.event('reunion','Welcome back',{x:s.player.x,y:s.player.y});});
 await expect.poll(()=>page.evaluate(()=>window.quietEffects.length)).toBe(3);await expect(page.locator('.toast')).toHaveCount(0);await expect(page.locator('#announcer')).toHaveText('Welcome back');expect(await page.evaluate(()=>window.quietEffects.map(a=>[a[0],a[3]??null]))).toEqual([['eat',null],['homecoming',null],['reunion',null]]);
 await page.evaluate(()=>{const s=window.atoll.simulation;s.event('discovery','Sand search discovered',{value:'sand-search'});s.event('discovery','Another discovery',{value:'grazing-route'});});await expect.poll(()=>page.evaluate(()=>window.quietEffects.filter(a=>a[0]==='discovery').length)).toBe(1);await expect(page.locator('.toast')).toHaveCount(0);
 await page.evaluate(()=>{window.atoll.simulation.event('message','Cleaner unavailable. Try another habitat.');});await expect(page.locator('.toast')).toHaveText('Cleaner unavailable. Try another habitat.');
});

test('existing preferences and explicit feeding-message mode remain available',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('atoll-settings',JSON.stringify({hints:true,verbose:true})));await ready(page);await practice(page);expect(await page.evaluate(()=>window.atoll.state.settings.hints)).toBe(true);await page.evaluate(()=>window.atoll.simulation.event('eat','A meal restored 10 Energy.'));await expect(page.getByRole('dialog')).toContainText('A meal restored 10 Energy.');await action(page,'close');
});
