import test from 'node:test';
import assert from 'node:assert/strict';
import {drawStory} from '../src/sandcastle-engineer-render.js';
import {SPECIES} from '../src/data.js';

const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
function fixture(change={}){
 const calls=[],stack=[];
 const ctx=new Proxy({globalAlpha:.7,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();}},{get(o,k){if(k in o)return o[k];return (...args)=>calls.push([k,...args]);}});
 const patch={id:'f-one',reef:0,x:550,y:370,baseline:100,after:65,algae:65,sand:.35,deposit:.175,quiet:7,meals:1,...change};
 const sim={current:0,reefStories:{active:'engineer',engineer:{patches:[patch],selected:patch.id,neighbor:null}},section:{entities:[],food:[{id:patch.id,food:'algae',x:patch.x,y:patch.y,amount:patch.algae,regrow:0}]}};
 const renderer={ctx,reducedMotion:false,foodSprites:[{width:300,height:360}]};
 return {calls,sim,renderer,ctx,patch};
}
const count=(f,name)=>f.calls.filter(c=>c[0]===name).length;

test('Engineer presentation leaves frozen story and renderer state unchanged',()=>{
 const f=fixture();freeze(f.sim);const before=JSON.stringify(f.sim);Object.freeze(f.renderer);
 drawStory(f.renderer,f.sim,12);assert.equal(JSON.stringify(f.sim),before);assert.equal(f.ctx.globalAlpha,.7);
 assert.ok(count(f,'drawImage')>0);assert.ok(count(f,'ellipse')>0);assert.equal(count(f,'arc'),0);
});

test('real algae reductions remove upper painted foliage and renewal adds young blades',()=>{
 const full=fixture({after:100,algae:100,sand:0,deposit:0}),bite=fixture({after:65,algae:65,sand:0,deposit:0}),bare=fixture({after:0,algae:0,sand:0,deposit:0}),grown=fixture({after:30,algae:55,sand:0,deposit:0});
 for(const f of [full,bite,bare,grown])drawStory(f.renderer,f.sim,1);
 assert.equal(count(full,'drawImage'),5);assert.equal(count(bite,'drawImage'),4);assert.equal(count(bare,'drawImage'),0);
 assert.ok(bite.calls.filter(c=>c[0]==='drawImage').some(c=>c[4]<360),'A partial tuft loses its upper leaves instead of whole-object scaling');
 assert.ok(count(grown,'bezierCurveTo')>0,'New algae blades appear only as the food resource renews');
});

test('deposition is local and changes with actual pending time; reduced motion retains settled grains',()=>{
 const early=fixture({deposit:.3}),late=fixture({deposit:.1}),reduced=fixture({deposit:.3});reduced.renderer.reducedMotion=true;
 for(const f of [early,late,reduced])drawStory(f.renderer,f.sim,4);
 const grains=f=>f.calls.filter(c=>c[0]==='ellipse');
 assert.notDeepEqual(grains(early),grains(late));assert.ok(grains(reduced).length>0);assert.ok(grains(early).length>grains(reduced).length);
 for(const f of [early,late,reduced])for(const grain of grains(f)){assert.ok(Math.abs(grain[1]-f.patch.x)<95);assert.ok(Math.abs(grain[2]-f.patch.y)<50);assert.ok(grain[3]<3&&grain[4]<2);}
 const still=fixture({deposit:.3});still.renderer.reducedMotion=true;drawStory(still.renderer,still.sim,999);assert.deepEqual(grains(still),grains(reduced));
});

test('selected untouched algae uses the same food geometry; other reefs receive no recorded overlay',()=>{
 const f=fixture({after:100,algae:100,sand:0,deposit:0});f.sim.reefStories.engineer.patches=[];drawStory(f.renderer,f.sim,0);assert.equal(count(f,'drawImage'),5);
 f.calls.length=0;f.sim.current=3;f.sim.reefStories.active=null;f.sim.reefStories.engineer.patches=[f.patch];drawStory(f.renderer,f.sim,0);assert.equal(count(f,'drawImage'),0);assert.equal(count(f,'ellipse'),0);
});

test('neighbor fragments require its committed normal mouth-contact meal',()=>{
 const f=fixture({sand:0,deposit:0});f.sim.reefStories.engineer.neighbor={id:'neighbor',incarnation:0,patch:f.patch.id};
 const e={id:'neighbor',alive:true,x:520,y:365,facing:1,species:structuredClone(SPECIES[5]),feeding:{target:f.patch.id,committed:false,elapsed:.1,contactAt:.18,x:540,y:370}};f.sim.section.entities.push(e);
 drawStory(f.renderer,f.sim,0);const anticipation=count(f,'quadraticCurveTo');f.calls.length=0;
 e.feeding.committed=true;e.feeding.elapsed=.25;drawStory(f.renderer,f.sim,0);assert.equal(count(f,'quadraticCurveTo'),anticipation+3);
});
