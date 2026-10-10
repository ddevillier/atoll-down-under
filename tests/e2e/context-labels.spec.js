import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {clickButton} from '../../scripts/ui-actions.mjs';

const folder=process.env.CONTEXT_LABEL_ARTIFACTS||'artifacts/quiet-labels';
test('fractional display widths paint the complete Cleaner word',async({page})=>{
 for(const width of [1561,1025]){
  await page.setViewportSize({width,height:Math.round(width*9/16)});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const painted=await page.evaluate(async()=>{
   await document.fonts.ready;const {Simulation}=await import('/src/simulation.js'),s=new Simulation(42),r=window.atoll.renderer;
   s.start('practice','s33');s.paused=true;r.syncScene(s);r.inspect=true;r.hover=null;r.foodHints=false;
   const output=[],fill=r.ctx.fillText;r.ctx.fillText=function(text,...args){output.push(text);return fill.call(this,text,...args);};
   try{r.draw(s,0);}finally{r.ctx.fillText=fill;}
   return {output,labels:r.labelLayout.map(l=>l.text)};
  });
  expect(painted.labels).toContain('Cleaner');expect(painted.output).toContain('Cleaner');expect(painted.output).not.toContain('Clean…');
 }
});
for(const [width,height] of [[1600,900],[1024,768]]){
 test(`shelter markers obey fit across the roster, habitats and created fish at ${width}`,async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const rows=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),{PRACTICE_SPECIES,REEFS}=await import('/src/data.js'),{blueprint}=await import('/src/creations.js'),{creationTrial}=await import('/src/creation-trial.js');
   const r=window.atoll.renderer,rows=[];r.foodHints=false;
   function inspect(s,name){
    s.paused=true;s.adventure.visible=false;s.section.entities=[];s.section.food=[];r.syncScene(s);r.inspect=true;
    const shelters=REEFS[s.current].shelters,arcs=[],ellipseMarks=[],arc=r.ctx.arc,ellipse=r.ctx.ellipse;
    r.ctx.arc=function(x,y,radius,...args){if(shelters.some(site=>site.x===x&&site.y===y&&site.r===radius))arcs.push([x,y,radius]);return arc.call(this,x,y,radius,...args);};
    r.ctx.ellipse=function(x,y,rx,ry,...args){if(shelters.some(site=>site.x===x&&site.y===y&&site.r*.65===rx&&site.r*.3===ry))ellipseMarks.push([x,y]);return ellipse.call(this,x,y,rx,ry,...args);};
    try{r.draw(s,0);}finally{r.ctx.arc=arc;r.ctx.ellipse=ellipse;}
    rows.push({name,size:s.player.species.size,reef:s.current,trial:!!s.trial,shelters:shelters.length,labels:r.labelLayout.map(l=>l.text),arcs:arcs.length,ellipseMarks:ellipseMarks.length});
   }
   // Controlled renderer fixtures isolate labels; they do not claim natural play.
   for(const species of PRACTICE_SPECIES){const s=new Simulation(42);s.start('practice',species.id);inspect(s,species.id);}
   for(const reef of REEFS)for(const id of ['s1','s33']){const s=new Simulation(42);s.start('practice',id);s.current=reef.id;inspect(s,id+'-reef-'+reef.id);}
   for(const size of [124,125,180]){
    const config=blueprint({size}),kept=new Simulation(42);kept.start('create','custom',config);inspect(kept,'kept-'+size);
    const trial=creationTrial(config);inspect(trial,'trial-'+size);
   }
   return rows;
  });
  expect(rows).toHaveLength(81);
  for(const row of rows){
   const count=row.labels.filter(label=>label==='Shelter').length;
   expect(row.labels.every(label=>!label.includes('Too small')&&!label.includes('Settle here')),row.name).toBe(true);
   if(row.size>=125){expect(count,row.name).toBe(0);expect(row.arcs,row.name).toBe(0);expect(row.ellipseMarks,row.name).toBe(0);}
   else{expect(count,row.name).toBe(row.shelters);expect(row.arcs+row.ellipseMarks,row.name).toBe(row.shelters);}
  }
  await mkdir(folder,{recursive:true});await writeFile(`${folder}/shelter-matrix-${width}.json`,JSON.stringify(rows,null,2));
 });

 test(`cleaner callouts stay short while species facts remain inspectable at ${width}`,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Neon damselfish');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');
  const cleaner=await page.evaluate(()=>{
   const s=window.atoll.simulation,e=s.section.entities.find(e=>e.alive&&e.species.ability==='clean');if(!e)throw Error('Generated cleaner missing');
   Object.assign(e,{x:1050,y:350,angle:0,facing:1});s.section.entities=[e];s.section.food=[];return {x:e.x,y:e.y,name:e.species.name};
  });
  const box=await page.locator('#reef').boundingBox();await page.mouse.move(box.x+cleaner.x/1600*box.width,box.y+(cleaner.y+55)/900*box.height);
  await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.labelLayout.some(l=>l.text==='Cleaner'))).toBe(true);
  expect(await page.evaluate(()=>window.atoll.renderer.labelLayout.map(l=>l.text))).not.toContain('Cleaner · '+cleaner.name);
  await page.mouse.click(box.x+cleaner.x/1600*box.width,box.y+(cleaner.y+55)/900*box.height);
  await expect(page.locator('.inspect-card h3')).toHaveText(cleaner.name);await expect(page.locator('.inspect-card [data-action="guide-current"]')).toBeVisible();
  await mkdir(folder,{recursive:true});await page.screenshot({path:`${folder}/cleaner-inspection-${width}.png`});
  const rows=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),r=window.atoll.renderer,rows=[];
   for(const id of ['s1','s12'])for(const [inspect,hover,working]of [[true,false,false],[true,false,true],[false,true,false],[true,true,true]]){
    const s=new Simulation(42);s.start('practice',id);s.current=s.sections.findIndex(section=>section.entities.some(e=>e.alive&&e.species.ability==='clean'));s.paused=true;
    const e=s.section.entities.find(e=>e.alive&&e.species.ability==='clean');if(working)e.behavior='Cleaning a client';
    s.adventure.visible=false;r.syncScene(s);r.inspect=inspect;r.hover=hover?e:null;r.foodHints=false;r.draw(s,0);
    rows.push({id,inspect,hover,working,species:e.species.id,name:e.species.name,labels:r.labelLayout.map(l=>l.text)});
   }
   return rows;
  });
  expect(new Set(rows.map(row=>row.species))).toEqual(new Set(['s43','s45']));
  for(const row of rows){expect(row.labels.filter(text=>text==='Cleaner'),JSON.stringify(row)).toHaveLength(1);expect(row.labels.some(text=>text.includes(row.name)||text.startsWith('Cleaner · '))).toBe(false);}
  await writeFile(`${folder}/cleaner-matrix-${width}.json`,JSON.stringify(rows,null,2));
 });

 test(`food and activity callouts avoid instructions and redundant shelter labels at ${width}`,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const result=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),{REEFS}=await import('/src/data.js'),{creationTrial}=await import('/src/creation-trial.js'),{blueprint}=await import('/src/creations.js'),r=window.atoll.renderer;
   const s=new Simulation(42);s.start('practice','s1');s.paused=true;s.adventure.visible=false;s.section.entities=[];
   const f=s.section.food.find(f=>f.food==='algae');s.player.x=f.x;s.player.y=f.y-80;r.syncScene(s);r.inspect=false;r.foodHints=true;r.draw(s,0);const hints=r.labelLayout.map(l=>l.text);
   s.paused=false;s.eatAt(f.x,f.y);r.foodHints=false;r.draw(s,0);const meal=r.labelLayout.map(l=>l.text),target=s.mealTarget?.id;
   s.adventure.visible=true;s.player.x=REEFS[s.current].shelters[0].x;s.player.y=REEFS[s.current].shelters[0].y;s.point(s.player.x,s.player.y);s.useContext();s.paused=true;r.inspect=true;r.draw(s,0);const home=r.labelLayout.map(l=>l.text);
   const trial=creationTrial(blueprint());trial.paused=true;r.syncScene(trial);r.inspect=true;r.foodHints=false;r.draw(trial,0);const trialLabels=r.labelLayout.map(l=>l.text);
   return {hints,meal,target,home,homeShelters:REEFS[s.current].shelters.length,trialLabels,trialShelters:REEFS[trial.current].shelters.length};
  });
  expect(result.hints).toEqual(['Food']);expect(result.meal).toEqual(['Food']);expect(result.target).toBeTruthy();
  expect(result.home).toContain('Home');expect(result.home.filter(text=>text==='Shelter')).toHaveLength(result.homeShelters-1);
  expect(result.trialLabels.filter(text=>text==='Shelter')).toHaveLength(result.trialShelters);
  for(const text of [...result.hints,...result.meal,...result.home,...result.trialLabels])expect(text).not.toMatch(/ · |Settle|Recovering|Your |Watching|Inspecting/);
 });
}
