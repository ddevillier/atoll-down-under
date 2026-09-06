import {chromium} from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1200,height:900}});
await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
for(let sheet=0;sheet<4;sheet++){
 const data=await page.evaluate(async sheet=>{
  const {SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,c=document.createElement('canvas');c.width=1200;c.height=900;const ctx=c.getContext('2d');ctx.fillStyle='#f4f0df';ctx.fillRect(0,0,1200,900);
  for(let n=0;n<16;n++){const s=SPECIES[sheet*16+n],b=r.bounds[s.index],x=n%4*300+150,y=Math.floor(n/4)*225+100,w=Math.min(260,150*b.w/b.h);r.drawSprite(ctx,s,x,y,w,1,0);ctx.font='15px AtollSans';ctx.textAlign='center';ctx.fillStyle='#163c43';ctx.fillText(s.index+' · '+s.name,x,y+102);}
  return c.toDataURL('image/png').split(',')[1];
 },sheet);
 fs.writeFileSync(`artifacts/sprite-sheet-${sheet}.png`,Buffer.from(data,'base64'));
}
await browser.close();console.log('Rendered all 64 extracted sprites.');
