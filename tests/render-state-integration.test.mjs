import test from 'node:test';
import assert from 'node:assert/strict';
import {ReefRenderer} from '../src/render.js';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {readFileSync} from 'node:fs';
import {sitesFor} from '../src/adventures.js';
import {CreationPainter} from '../src/creation-render.js';

function fixture(){
 const arcs=[];
 const ctx=new Proxy({measureText:t=>({width:t.length*8}),createRadialGradient:()=>({addColorStop(){}}),arc:(...a)=>arcs.push(a)},{get:(o,k)=>o[k]??(()=>{})});
 const renderer=Object.assign(Object.create(ReefRenderer.prototype),{ctx,canvas:{width:1600,height:900},reefs:[],ready:true,clock:0,effects:[],uiUnit:1,reducedMotion:false,titleReef:{draw(){}}});
 renderer.drawCreature=()=>{};renderer.drawFood=()=>{};
 const sim=new Simulation();sim.start('practice','s2');sim.events=[];renderer.syncScene(sim);
 return {renderer,sim,arcs};
}

test('effect lifecycle follows reef and dive identity while retaining freshly emitted events',()=>{
 const {renderer:r,sim:s}=fixture();
 r.addEffect('eat',777,333,'Previous reef');r.draw(s,.1);
 s.current=(s.current+1)%9;r.syncScene(s);r.addEffect('eat',888,333,'New reef');r.draw(s,.1);
 assert.deepEqual(r.effects.map(e=>e.label),['New reef']);
 r.draw(s,30,true);assert.equal(r.effects.length,0);
 const fresh=new Simulation();fresh.start('practice','s1');r.syncScene(fresh);r.addEffect('eat',888,333,'New dive');r.draw(fresh,.1);
 assert.deepEqual(r.effects.map(e=>e.label),['New dive']);
 fresh.spawnPlayer(fresh.player.species);r.draw(fresh,.1);assert.equal(r.effects.length,0);
});

test('reduced-motion ability ripples remain stationary and expire; normal ripples expand',()=>{
 for(const reduced of [false,true]){
  const {renderer:r,sim:s,arcs}=fixture();r.reducedMotion=reduced;r.addEffect('sonic',777,333);
  r.draw(s,.1);r.draw(s,.1);
  assert.deepEqual(arcs.filter(a=>a[0]===777&&a[1]===333).map(a=>a[2]),reduced?[12,12]:[18,24]);
  s.paused=true;r.draw(s,.5);assert.equal(r.effects[0].t,.2);
  s.paused=false;r.draw(s,1.3);assert.equal(r.effects.length,0);
 }
});

test('hiding optional activity removes its site labels without changing journey progress',()=>{
 const {renderer:r,sim:s}=fixture();const site=sitesFor(s)[0];assert.ok(site);s.player.x=site.x;s.player.y=site.y;
 s.adventure.visible=true;r.draw(s,.01);assert.ok(r.tagQueue.some(t=>t.text==='Home'));
 const before=JSON.stringify({...s.adventure,visible:false});
 s.adventure.visible=false;r.draw(s,.01);
 assert.ok(!r.tagQueue.some(t=>t.text==='Home'));
 assert.equal(JSON.stringify(s.adventure),before);
});

test('fractional Windows scaling does not ellipsize a label that fits its measured box',()=>{
 const {renderer:r}=fixture(),painted=[],unit=1.0245997110183553,measured=54.74299621582031;
 r.uiUnit=unit;r.ctx.measureText=text=>({width:measured*text.length/7});r.ctx.fillText=text=>painted.push(text);
 r.tagQueue=[{text:'Cleaner',anchor:{x:800,y:300},width:measured+22*unit,height:27*unit,alpha:1}];
 assert.ok(r.tagQueue[0].width-22*unit<measured,'Reproduce the native rounding difference');
 r.drawTags(r.ctx);assert.deepEqual(painted,['Cleaner']);
 painted.length=0;r.tagQueue[0].width-=20*unit;r.drawTags(r.ctx);
 assert.equal(painted.length,1);assert.ok(painted[0].endsWith('…'),'Genuinely constrained text still truncates');
});


test('custom flash respects the inherited opacity of a hidden actor',()=>{
 const layer={image:{},x:0,y:0,w:1,h:1},rig={g:{a:{mouth:'small'},depth:1},root:0,dh:[0,0],hinge:[0,0],ph:[0,0]};
 for(const k of ['tail','dorsal','anal','pelvic','body','head','cavity','jaw','pectoral'])rig[k]=layer;
 const painter=Object.create(CreationPainter.prototype);painter.prepare=()=>rig;
 for(const flash of [0,1]){
  const stack=[],alpha=[];
  const ctx=new Proxy({globalAlpha:.25,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},fill(){alpha.push(this.globalAlpha);}},{get:(o,k)=>o[k]??(()=>{})});
  painter.draw(ctx,{ability:'flash',speed:140},{},100,0,0,{flash});
  assert.deepEqual(alpha,[.25*(flash?1:.18)]);assert.equal(ctx.globalAlpha,.25);
 }
});


test('a transition discards earlier queued effects and preserves later destination effects',()=>{
 const {renderer}=fixture(),sim=new Simulation(77);sim.start('practice',SPECIES.find(s=>s.ability==='dash').id);sim.events=[];renderer.syncScene(sim);
 sim.player.x=1594;sim.player.y=330;sim.pointer={x:1600,y:330};sim.useAbility();sim.step(1/60);
 assert.deepEqual(sim.events.map(e=>e.type),['reef-life','ability','transition']);
 sim.event('ability','Destination ability',{ability:'dash',x:55,y:333});
 const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 const body=source.slice(source.indexOf('function events(){'),source.indexOf('\nfunction frame(now)'));
 const noop=()=>{};
 new Function('sim','renderer','home','audio','notify','announce','ABILITIES','settings','progress','persistCreation','openModal','saveSlot','drawUI','let inspected;'+body+';events();')(sim,renderer,false,{effect:noop},noop,noop,{dash:{name:'Dash'}},{verbose:false},noop,noop,noop,noop,noop);
 assert.deepEqual(renderer.effects.map(e=>[e.type,e.x,e.y]),[['dash',55,333]]);
});
