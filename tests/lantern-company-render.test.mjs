import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {LANTERN_CASE_STUDY} from '../src/lantern-company.js';
import {appearanceFor,drawStory,drawLanternOrgan,loadLanternArt,LANTERN_ORGAN} from '../src/lantern-company-render.js';

function painter(){
 const calls=[],stack=[],c={globalAlpha:1,globalCompositeOperation:'source-over',save(){stack.push({globalAlpha:this.globalAlpha,globalCompositeOperation:this.globalCompositeOperation});calls.push(['save']);},restore(){Object.assign(this,stack.pop());calls.push(['restore']);},createRadialGradient(...a){calls.push(['gradient',...a]);return {addColorStop(...b){calls.push(['colorStop',...b]);}};}};
 for(const k of ['beginPath','closePath','moveTo','lineTo','arc','ellipse','fill','stroke','clip','drawImage','clearRect','translate','rotate','transform'])c[k]=(...a)=>calls.push([k,...a]);
 return {ctx:c,calls};
}
function scene(){
 const player={id:'player',incarnation:0,species:SPECIES[53],alive:true,health:95,x:620,y:300,facing:1,lanternCaseStudy:LANTERN_CASE_STUDY,lanternLight:1,lanternOrganShown:true};
 const neighbor={...player,id:32,incarnation:2,x:670,y:280,lanternLight:.6};
 const participant={id:32,incarnation:2,gate:0,travel:0,response:false,contact:false};
 const lantern={version:1,reef:8,caseStudy:LANTERN_CASE_STUDY,stage:'route',route:'upper',participants:[participant],organShown:true,playerGate:0,complete:false};
 return {player,neighbor,lantern,sim:{player,current:8,mode:'practice',section:{entities:[neighbor]},reefStories:{active:'lantern',lantern}}};
}

test('photophore rotates locally below the eye and dark exposure produces no glow',()=>{
 const dark=painter(),bright=painter(),partial=painter();
 drawLanternOrgan(dark.ctx,720,315,1,false);drawLanternOrgan(bright.ctx,720,315,1,true);drawLanternOrgan(partial.ctx,720,315,.2,true);
 assert.equal(dark.calls.filter(c=>c[0]==='fill').length,0);assert.equal(dark.calls.filter(c=>c[0]==='gradient').length,0);
 assert.deepEqual(bright.calls.find(c=>c[0]==='translate'),['translate',720*LANTERN_ORGAN.x,315*LANTERN_ORGAN.y]);
 const open=bright.calls.filter(c=>c[0]==='ellipse').at(-1),turning=partial.calls.filter(c=>c[0]==='ellipse').at(-1);
 assert.ok(turning[4]<open[4],'inward rotation narrows the light-emitting face');
 assert.ok(bright.calls.filter(c=>c[0]==='ellipse').every(c=>c[3]<720*.07),'light is smaller than the head');
 assert.equal(bright.ctx.globalAlpha,1);
});

test('reduced flashes has stable exposed and occluded outlines without a light halo',()=>{
 const shown=painter(),hidden=painter();drawLanternOrgan(shown.ctx,720,315,1,true,true);drawLanternOrgan(hidden.ctx,720,315,0,false,true);
 assert.equal(shown.calls.filter(c=>c[0]==='gradient').length,0);assert.equal(hidden.calls.filter(c=>c[0]==='gradient').length,0);
 assert.equal(shown.calls.filter(c=>c[0]==='stroke').length,1);assert.equal(hidden.calls.filter(c=>c[0]==='stroke').length,1);
 assert.equal(shown.calls.filter(c=>c[0]==='fill').length,1);assert.equal(hidden.calls.filter(c=>c[0]==='fill').length,0);
});

test('world presentation is pure and cues use actual actor positions and incarnations',()=>{
 const {sim,neighbor}=scene(),p=painter(),tags=[];
 const r={...p,inspect:true,reducedMotion:true,uiUnit:1,tag:(c,x,y,text)=>tags.push({x,y,text})};
 const before=JSON.stringify(sim);drawStory(r,sim,0);const first=p.calls.splice(0);drawStory(r,sim,500);
 assert.deepEqual(first,p.calls);assert.equal(JSON.stringify(sim),before);assert.equal(p.ctx.globalAlpha,1);
 assert.ok(tags.some(t=>t.text==='Anomalops katoptron case study'));
 const mark=p.calls.find(c=>c[0]==='lineTo'&&c[1]>neighbor.x&&c[1]<neighbor.x+30);
 assert.ok(mark,'participant marker derives from the current fish frame');
 neighbor.incarnation=3;p.calls.length=0;drawStory(r,sim,0);
 assert.equal(p.calls.filter(c=>c[0]==='moveTo'&&c[1]>neighbor.x&&c[1]<neighbor.x+30).length,0,'a replaced fish gets no participant marker');
});

test('presentation stays confined to the active case-study reef',()=>{
 const {sim}=scene(),p=painter(),r={...p,inspect:true};
 sim.current=7;drawStory(r,sim,0);assert.equal(p.calls.length,0);sim.current=8;sim.reefStories.active=null;drawStory(r,sim,0);assert.equal(p.calls.length,0);
});

test('loader isolates dedicated art once, appearance requires exact identity, and reduced frames remain stable',async()=>{
 const savedImage=globalThis.Image,savedDocument=globalThis.document,created=[];let loads=0;
 globalThis.Image=class{set src(value){loads++;this.path=value;queueMicrotask(()=>this.onload());}};
 globalThis.document={createElement(){const p=painter(),canvas={width:720,height:315,getContext:()=>p.ctx,calls:p.calls};created.push(canvas);return canvas;}};
 try{
  const {sim,player,neighbor}=scene(),r={reducedMotion:true,extractCell:()=>({width:720,height:315})};
  assert.equal(appearanceFor(r,sim,player,0),null);await Promise.all([loadLanternArt(r),loadLanternArt(r)]);assert.equal(loads,2);
  const before=JSON.stringify(sim),a=appearanceFor(r,sim,player,0),first=a.sprite.calls.splice(0),b=appearanceFor(r,sim,player,999);
  assert.deepEqual(first,b.sprite.calls);assert.equal(JSON.stringify(sim),before);assert.equal(a.heightRatio,315/720);assert.equal(a.pose.flash,0);
  player.lanternCaseStudy=true;assert.equal(appearanceFor(r,sim,player,0),null);player.lanternCaseStudy=LANTERN_CASE_STUDY;
  neighbor.incarnation++;assert.equal(appearanceFor(r,sim,neighbor,0),null);
  sim.current=7;assert.equal(appearanceFor(r,sim,player,0),null);
  assert.ok(created.some(c=>c.width===384),'outcrop composites use a bounded source resolution');
 }finally{globalThis.Image=savedImage;globalThis.document=savedDocument;}
});

test('missing named art rejects loading instead of presenting the unidentified family sprite',async()=>{
 const saved=globalThis.Image;globalThis.Image=class{set src(value){queueMicrotask(()=>this.onerror());}};
 try{await assert.rejects(loadLanternArt({extractCell:()=>{throw new Error('unexpected fallback');}}),/Lantern Company illustration/);}finally{globalThis.Image=saved;}
});
