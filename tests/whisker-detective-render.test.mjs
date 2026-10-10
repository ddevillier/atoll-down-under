import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {mouthPoint} from '../src/feeding-contact.js';
import {barbelPoseFor,barbelTips,drawStory} from '../src/whisker-detective-render.js';

function fixture(distance=25){
 const player={id:'player',species:SPECIES[9],x:420,y:370,facing:1,angle:0,health:100,alive:true};
 const mouth=mouthPoint(player),food={id:'buried',food:'worm',kind:'food',x:mouth.x+distance,y:mouth.y,size:20,amount:100,regrow:0};
 const section={food:[food],entities:[]},sections=[];sections[7]=section;
 const detective={reef:7,patches:[{id:food.id,x:food.x,y:food.y,found:false,choice:null,amount:100}],current:0,stage:'search',complete:false,reveal:0,reaction:0,shareReveal:0,probe:null,neighbor:null,witnessed:false};
 const sim={player,section,sections,current:7,reefStories:{active:'detective',detective}};
 return {sim,food,detective};
}
function painter(reducedMotion=false){
 const paint=[],stack=[];
 const ctx={globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},beginPath(){},rect(){},clip(){},ellipse(x,y,rx,ry){paint.push({kind:'ellipse',x,y,rx,ry,alpha:this.globalAlpha});},fill(){},moveTo(x,y){paint.push({kind:'move',x,y,alpha:this.globalAlpha});},lineTo(x,y){paint.push({kind:'line',x,y,alpha:this.globalAlpha});},stroke(){}};
 return {ctx,paint,reducedMotion,poses:new Map()};
}

test('hidden detective meals produce only tactile grains at painted barbel tips',()=>{
 const {sim,food}=fixture(80),renderer=painter(),before=JSON.stringify(sim),tips=barbelTips(renderer,sim,.3);
 drawStory(renderer,sim,.3);
 assert.equal(JSON.stringify(sim),before,'painting must never mutate ecology or story state');
 assert.equal(tips.length,2);assert.ok(renderer.paint.length>0);
 for(const mark of renderer.paint){assert.ok(tips.some(tip=>Math.hypot(mark.x-tip.x,mark.y-tip.y)<20));assert.ok(Math.hypot(mark.x-food.x,mark.y-food.y)>35,'the buried food position must remain unmarked');}
 sim.player.x=50;const far=painter();drawStory(far,sim,1);assert.equal(far.paint.length,0,'distant food must produce no clue');
});

test('proximity strengthens local tactile intensity without a directional target pose',()=>{
 const weak=fixture(185).sim,strong=fixture(25).sim,a=barbelPoseFor(weak,weak.player),b=barbelPoseFor(strong,strong.player);
 assert.ok(b.probe>a.probe);assert.ok(b.tactile>a.tactile);assert.equal(a.barbelContact,0);assert.equal(b.barbelContact,1);
 assert.equal('dx' in b,false);assert.equal('dy' in b,false);
 const wa=painter(),wb=painter();drawStory(wa,weak,.3);drawStory(wb,strong,.3);
 assert.ok(wb.paint.length>wa.paint.length);assert.ok(Math.max(...wb.paint.map(m=>m.alpha))>Math.max(...wa.paint.map(m=>m.alpha)));
 strong.player.hidden=true;assert.equal(barbelPoseFor(strong,strong.player),null);
 assert.equal(barbelPoseFor(weak,{...weak.player,id:99}),null);
});

test('tactile landmarks mirror the actual fish and reduced motion stays static',()=>{
 const {sim,food,detective}=fixture(20),renderer=painter(),right=barbelTips(renderer,sim,.4);
 sim.player.facing=-1;food.x=sim.player.x*2-food.x;detective.patches[0].x=food.x;const left=barbelTips(renderer,sim,.4);
 for(let i=0;i<2;i++){assert.ok(Math.abs(right[i].x+left[i].x-sim.player.x*2)<1e-8);assert.ok(Math.abs(right[i].y-left[i].y)<1e-8);}
 sim.player.facing=1;food.x=sim.player.x*2-food.x;detective.patches[0].x=food.x;const a=painter(true),b=painter(true);drawStory(a,sim,1);drawStory(b,sim,20);assert.deepEqual(a.paint,b.paint);
 const movingA=painter(),movingB=painter();drawStory(movingA,sim,1);drawStory(movingB,sim,2);assert.notDeepEqual(movingA.paint,movingB.paint);
});

test('uncovered meals and witnessed neighbors receive finite local feedback',()=>{
 const {sim,food,detective}=fixture(80);detective.stage='choice';detective.patches[0].found=true;detective.reveal=1.5;
 const revealed=painter();drawStory(revealed,sim,.3);assert.equal(revealed.paint.length,18);assert.ok(revealed.paint.every(mark=>Math.hypot(mark.x-food.x,mark.y-food.y)<6));
 detective.reveal=0;const quiet=painter();drawStory(quiet,sim,.3);assert.equal(quiet.paint.length,0);
 const neighbor={id:44,incarnation:0,species:SPECIES[12],x:350,y:310,facing:1,alive:true};sim.section.entities=[neighbor];detective.neighbor={id:44,incarnation:0};detective.reaction=1.2;
 const noticed=painter();drawStory(noticed,sim,.3);assert.ok(noticed.paint.length>0);assert.ok(noticed.paint.every(mark=>Math.hypot(mark.x-neighbor.x,mark.y-neighbor.y)<80));
 detective.complete=true;detective.witnessed=true;detective.stage='complete';detective.reaction=0;detective.shareReveal=1.4;
 const shared=painter();drawStory(shared,sim,.3);assert.equal(shared.paint.length,3);
 detective.shareReveal=0;const finished=painter();drawStory(finished,sim,.3);assert.equal(finished.paint.length,0);
});

