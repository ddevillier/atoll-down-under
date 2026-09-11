import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import fs from 'node:fs';
async function editor(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Create a fish/});}
test('anatomy and three color regions follow ordinary editor, trial, save and return controls',async({page})=>{
 await editor(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const choices={body:'slender',shapeMode:'free',tail:'lyre',dorsal:'sail',pectoral:'wing',mouth:'tube',marking:'bands'};
 for(const [k,v]of Object.entries(choices))await page.locator(`[data-config="${k}"]`).selectOption(v);
 for(const [k,v]of Object.entries({color:'#a05082',finColor:'#42b9ba',markingColor:'#eed784'}))await page.locator(`[data-config="${k}"]`).fill(v);
 await page.getByRole('slider',{name:'Body length',exact:true}).fill('125');await page.getByRole('slider',{name:'Body depth',exact:true}).fill('80');
 await page.locator('#fish-name').fill('Ribbon');await page.getByRole('button',{name:'Test swim',exact:true}).click();
 const trial=await page.evaluate(()=>window.atoll.simulation.player.species.appearance);const {body,...partChoices}=choices;expect(trial).toMatchObject(partChoices);
 await page.getByRole('button',{name:'Change my fish'}).click();await expect(page.locator('[data-config="tail"]')).toHaveValue('lyre');
 await page.getByRole('button',{name:'Keep and meet the reef'}).click();const id=await page.evaluate(()=>window.atoll.simulation.creation.id);
 await page.getByRole('button',{name:'My creations',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'My creations',exact:true});await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForFunction(id=>window.atoll.simulation?.creation?.id===id,id);
 expect(await page.evaluate(()=>window.atoll.simulation.player.species.appearance)).toEqual(trial);expect(errors).toEqual([]);
});
test('every part and color choice changes rendered pixels; extreme fins remain inside source layers',async({page})=>{
 await editor(page);
 const report=await page.evaluate(async()=>{
  const {DEFAULT_BLUEPRINT}=await import('/src/creations.js'),{APPEARANCE_OPTIONS}=await import('/src/creation-appearance.js'),{createSpecies}=await import('/src/data.js');
  const renderer=window.atoll.renderer,c=document.createElement('canvas');c.width=600;c.height=600;const ctx=c.getContext('2d',{willReadFrequently:true});
  const render=config=>{ctx.clearRect(0,0,600,600);renderer.drawSprite(ctx,createSpecies({...DEFAULT_BLUEPRINT,...config}),300,300,400,1,0);return new Uint8ClampedArray(ctx.getImageData(0,0,600,600).data);};
  const changed={},alphaChanged={};for(const k of ['tail','dorsal','pectoral','mouth','marking']){const options=APPEARANCE_OPTIONS[k],base=render({[k]:options[0][0]});for(const [v]of options.slice(1)){const data=render({[k]:v});let n=0,a=0;for(let i=0;i<data.length;i+=4){if(Math.abs(data[i]-base[i])+Math.abs(data[i+1]-base[i+1])+Math.abs(data[i+2]-base[i+2])+Math.abs(data[i+3]-base[i+3])>20)n++;if(data[i+3]!==base[i+3])a++;}changed[k+':'+v]=n;alphaChanged[k+':'+v]=a;}}
  for(const k of ['color','finColor','markingColor']){const b=render({[k]:'#dd1122'}),d=render({[k]:'#1166dd'});changed[k]=Array.from(d).filter((v,i)=>Math.abs(v-b[i])>20).length;}
  const clipped=[];for(const body of ['rounded','slender','sturdy'])for(const dorsal of ['low','sail','spiny','ribbon']){const s=createSpecies({...DEFAULT_BLUEPRINT,body,dorsal,shapeMode:'free',bodyDepth:135,bodyLength:135});renderer.drawSprite(ctx,s,300,300,400,1,0);const parts=renderer.creationPainter.prepare(s,renderer.sprites[s.index]);for(const k of ['body','tail','dorsal','pectoral']){const im=parts[k].image,cx=im.getContext('2d');for(const y of [0,im.height-1])if(cx.getImageData(0,y,im.width,1).data.some((v,i)=>i%4===3&&v>0))clipped.push(body+':'+dorsal+':'+k);}}
  return {changed,alphaChanged,clipped};
 });
 fs.writeFileSync('artifacts/anatomy-pixel-report.json',JSON.stringify(report,null,2));
 for(const n of Object.values(report.changed))expect(n).toBeGreaterThan(60);expect(report.clipped).toEqual([]);
 for(const [key,n]of Object.entries(report.alphaChanged))if(!key.startsWith('marking:')&&!key.startsWith('pectoral:'))expect(n).toBeGreaterThan(10);
});
test('anatomy visual matrix and motion proof',async({page})=>{
 await editor(page);const result=await page.evaluate(async()=>{
  const {DEFAULT_BLUEPRINT}=await import('/src/creations.js'),{createSpecies}=await import('/src/data.js');const r=window.atoll.renderer;
  const variants=[{}, {body:'slender',tail:'point',dorsal:'low',mouth:'tube',color:'#95bcc9',finColor:'#7a609b',marking:'stripes'}, {body:'sturdy',tail:'fan',dorsal:'spiny',mouth:'wide',marking:'bands',color:'#d78552',finColor:'#873e52'}, {tail:'lyre',dorsal:'sail',pectoral:'wing',mouth:'beak',marking:'saddle',color:'#8174b2',finColor:'#b6d8b8'}, {body:'slender',tail:'fork',dorsal:'ribbon',pectoral:'point',marking:'plain',color:'#65a9be',finColor:'#caaa53'}, {shapeMode:'free',bodyDepth:135,bodyLength:70,tail:'fan',dorsal:'sail',mouth:'wide',color:'#c3b356',finColor:'#378c8e'}];
  const c=document.createElement('canvas');c.width=1500;c.height=1060;const ctx=c.getContext('2d');ctx.fillStyle='#e5e6d6';ctx.fillRect(0,0,c.width,c.height);
  variants.forEach((v,i)=>{const x=i%3*500,y=Math.floor(i/3)*350;ctx.fillStyle='#244a50';ctx.font='18px sans-serif';ctx.fillText(['Lagoon grazer','Needle swimmer','Crested hunter','Sailfin wanderer','Ribbon cruiser','Deep-bodied explorer'][i],x+28,y+30);r.drawSprite(ctx,createSpecies({...DEFAULT_BLUEPRINT,...v}),x+250,y+180,345,1,.13,1);});
  const fish=createSpecies({...DEFAULT_BLUEPRINT,tail:'lyre',dorsal:'sail',pectoral:'wing',mouth:'wide'});for(let i=0;i<5;i++)r.drawSprite(ctx,fish,150+i*300,885,230,1,.15+i*.10,1,1,null,{feed:i/4});
  ctx.fillStyle='#244a50';ctx.font='18px sans-serif';ctx.fillText('One fish across a swim stroke and opening bite — fixed position and scale',28,735);return c.toDataURL();
 });fs.writeFileSync('artifacts/anatomy-matrix.png',Buffer.from(result.split(',')[1],'base64'));
 for(const width of [1280,1920]){await page.setViewportSize({width,height:width*9/16});await page.screenshot({path:`artifacts/anatomy-editor-${width}.png`});expect(await page.locator('.panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);await expect(page.locator('#budget')).toBeVisible();}
});
test('painted joints change shape, feeding moves the jaw, and appearance cache is bounded',async({page})=>{
 await editor(page);
 const result=await page.evaluate(async()=>{
  const {DEFAULT_BLUEPRINT}=await import('/src/creations.js'),{createSpecies}=await import('/src/data.js');const r=window.atoll.renderer;
  const c=document.createElement('canvas');c.width=800;c.height=800;const ctx=c.getContext('2d',{willReadFrequently:true});
  const pixels=(s,t=0,state={})=>{ctx.clearRect(0,0,800,800);r.drawSprite(ctx,s,400,400,500,1,t,1,1,null,state);return ctx.getImageData(0,0,800,800).data;};
  const difference=(a,b,alpha=false)=>{let n=0;for(let i=0;i<a.length;i+=4)if(alpha?Math.abs(a[i+3]-b[i+3])>10:Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])+Math.abs(a[i+3]-b[i+3])>30)n++;return n;};
  const finPixels=v=>{const s=createSpecies({...DEFAULT_BLUEPRINT,pectoral:v});pixels(s);const p=r.creationPainter.prepare(s).pectoral;ctx.clearRect(0,0,800,800);ctx.drawImage(p.image,400+p.x*500,400+p.y*500,p.w*500,p.h*500);return ctx.getImageData(0,0,800,800).data;};
  const baseFin=finPixels('paddle'),finShape=['wing','point'].map(v=>difference(baseFin,finPixels(v),true));
  const jaws={};for(const mouth of ['small','wide','beak','tube']){const s=createSpecies({...DEFAULT_BLUEPRINT,mouth});jaws[mouth]=difference(pixels(s),pixels(s,0,{feed:1}));}
  const s=createSpecies(DEFAULT_BLUEPRINT),swim=difference(pixels(s,.1),pixels(s,.35)),puff=difference(pixels(s),pixels(s,0,{puff:1}),true);
  for(let i=0;i<30;i++)pixels(createSpecies({...DEFAULT_BLUEPRINT,color:'#'+(0x557700+i*123).toString(16)}));
  const cache=r.creationPainter.cache,bytes=[...cache.values()].reduce((n,v)=>n+Object.values(v).reduce((m,p)=>m+(p?.image?p.image.width*p.image.height*4:0),0),0);
  return {finShape,jaws,swim,puff,cacheSize:cache.size,cacheBytes:bytes};
 });
 fs.writeFileSync('artifacts/anatomy-joint-report.json',JSON.stringify(result,null,2));
 for(const n of result.finShape)expect(n).toBeGreaterThan(100);for(const n of Object.values(result.jaws))expect(n).toBeGreaterThan(40);
 expect(result.swim).toBeGreaterThan(100);expect(result.puff).toBeGreaterThan(100);expect(result.cacheSize).toBe(12);expect(result.cacheBytes).toBeLessThan(64*1024*1024);
});
