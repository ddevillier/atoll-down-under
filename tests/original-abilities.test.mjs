import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES,ABILITIES,REEFS} from '../src/data.js';
import {DEFAULT_BLUEPRINT,abilityIssue} from '../src/creations.js';
import {triggerAbility,defended,mimicTrusted,approachMimic} from '../src/ability-rules.js';
import {edible} from '../src/diet.js';
import {exportDive,importDive} from '../src/save-files.js';
import {displayPose} from '../src/ability-visuals.js';
function world(ability){const s=new Simulation(42);s.start('create','custom',{...DEFAULT_BLUEPRINT,ability,diet:'hunter'});s.section.entities=[];s.section.food=[];s.protected=false;s.point(s.player.x,s.player.y);s.events=[];return s;}
function animal(s,index,dx=70,dy=0){const e=structuredClone(s.player);Object.assign(e,{id:'a'+s.section.entities.length,species:SPECIES[index],x:s.player.x+dx,y:s.player.y+dy,target:null,stun:0,cooldown:0,abilityTime:0,energy:100,health:100,life:100,think:0,satiated:0,rest:0,behavior:'Exploring',activity:'cruising'});s.section.entities.push(e);return e;}
function tick(s,seconds){for(let i=0;i<Math.ceil(seconds/.05);i++)s.step(.05);}

for(const ability of ['sonic','shock','ink','spines','puff','sting','flash'])test(ability+' releases a real pursuit, spares cleaners/dead/out-of-range actors and expires',()=>{
 const s=world(ability),predator=animal(s,38),cleaner=animal(s,43,45),far=animal(s,38,600),dead=animal(s,38,50);dead.alive=false;
 predator.target='player';predator.pursuit=2;far.target='player';assert.equal(edible(predator,s.player),true);
 assert.equal(s.useAbility(),true);assert.equal(predator.target,null);assert.ok(predator.stun>0);assert.equal(cleaner.stun,0);assert.equal(dead.stun,0);assert.equal(far.stun,0);assert.equal(far.target,'player');assert.ok(s.events.some(e=>e.type==='pursuit-release'&&e.animalId===predator.id));
 assert.equal(s.player.energy,92);assert.equal(s.useAbility(),false);s.section.entities=[];tick(s,4.1);assert.equal(defended(s.player),false);assert.equal(s.player.abilityTime,0);assert.ok(s.player.cooldown>0);
});
test('sonic and tail sting leave harmless small fish moving; electric pulse can stun prey',()=>{
 for(const ability of ['sonic','sting','shock']){const s=world(ability),prey=animal(s,0,50);s.useAbility();assert.equal(prey.stun>0,ability==='shock');}
});
test('tail sting is a close defense rather than the old full-size area shock',()=>{const s=world('sting'),near=animal(s,38,105),distant=animal(s,38,160);near.target=distant.target='player';s.useAbility();assert.ok(near.stun>0);assert.equal(distant.stun,0);});
test('original poisonous body is passive protection and never consumes ability energy',()=>{
 const s=world('toxic'),p=s.player,hunter=animal(s,38,100);assert.equal(p.species.poison,true);assert.equal(ABILITIES.toxic.passive,true);const before=p.energy;assert.equal(s.useAbility(),false);assert.equal(p.energy,before);assert.equal(p.cooldown,0);
 hunter.target='player';s.stepNpc(hunter,.05);assert.notEqual(hunter.target,'player');s.player.abilityTime=0;s.stepNpc(hunter,.05);assert.notEqual(hunter.target,'player');
 const restored=importDive(exportDive(s,'Toxic')).simulation;assert.equal(restored.player.species.poison,true);assert.equal(restored.player.species.ability,'toxic');
});
test('being poisonous does not grant immunity to poisonous meals',()=>{const s=world('toxic'),slug=animal(s,60);s.consume(slug);assert.equal(s.player.health,75);assert.ok(s.events.some(e=>e.type==='poison'));});
test('the separate existing chemical cloud remains selectable and active',()=>{const s=world('poison');assert.equal(s.player.species.poison,false);assert.equal(s.useAbility(),true);assert.ok(s.player.abilityTime>0);});
test('mimic requires a fish-eating diet and can nip a larger host without killing it',()=>{
 assert.match(abilityIssue({...DEFAULT_BLUEPRINT,ability:'mimic',diet:'grazer'}),/hunter diet/);const s=world('mimic'),host=animal(s,16,130);s.player.energy=60;
 assert.equal(edible(s.player,host),true);assert.equal(s.useAbility(),true);assert.equal(mimicTrusted(s,host,s.player),true);
 const before=host.x;assert.equal(approachMimic(s,host,.05),true);assert.ok(host.x<before);assert.equal(host.cleanTime,0);
 s.consume(host);assert.equal(host.alive,true);assert.equal(host.life,88);assert.equal(host.health,94);assert.equal(host.biteDamage,6);assert.equal(s.player.energy,68);assert.equal(s.player.abilityTime,0);assert.equal(host.mimicMemory.actor,'player');assert.equal(mimicTrusted(s,host,s.player),false);
 s.player.cooldown=0;s.useAbility();assert.equal(approachMimic(s,host,.05),false);assert.match(host.behavior,/Moving away/);assert.equal(s.events.some(e=>e.type==='clean'),false);
});
test('mimic memory and active display survive portable saves; damaged memory rejects',()=>{
 const s=world('mimic'),host=animal(s,16,100);s.consume(host);s.player.cooldown=0;s.useAbility();const loaded=importDive(exportDive(s,'Mimic')).simulation;assert.equal(loaded.player.abilityTime,6);assert.deepEqual(loaded.section.entities[0].mimicMemory,host.mimicMemory);
 const bad=JSON.parse(s.serialize());bad.sections[s.current].entities[0].mimicMemory.until=-1;assert.throws(()=>Simulation.restore(bad),/mimic encounter/);
});
test('mimic invitations exclude cleaners, remembered hosts and experienced predators',()=>{
 const s=world('mimic');s.useAbility();const cleaner=animal(s,43),frogfish=animal(s,54),shark=animal(s,34);assert.equal(approachMimic(s,cleaner,.05),false);assert.equal(mimicTrusted(s,frogfish,s.player),false);assert.equal(mimicTrusted(s,shark,s.player),false);
});
test('NPC defenses respond to an actual incoming attack and stop the player',()=>{
 const s=world('none'),ray=animal(s,37,70);s.player.species={...s.player.species,size:270};s.player.target=ray.id;s.pointer={x:ray.x,y:ray.y};
 s.stepNpc(ray,.05);assert.ok(ray.abilityTime>0);assert.equal(s.player.target,null);assert.ok(s.player.stun>0);const x=s.player.x;s.point(x+400,s.player.y);s.step(.05);assert.equal(s.player.x,x);assert.ok(ray.cooldown>0);
});
test('NPC puff and spines work against NPC hunters and keep cooling down normally',()=>{
 for(const index of [22,5]){const s=world('none'),defender=animal(s,index,300),hunter=animal(s,38,350);hunter.target=defender.id;s.stepNpc(defender,.05);assert.ok(defender.abilityTime>0);assert.equal(hunter.target,null);const time=defender.abilityTime,cd=defender.cooldown;s.stepNpc(defender,.05);assert.ok(defender.abilityTime<time);assert.ok(defender.cooldown<cd);}
});
test('paused, dead, exhausted and stunned fish cannot activate abilities',()=>{
 const s=world('shock');for(const key of ['paused','phase','energy','stun']){s.paused=false;s.phase='playing';s.player.energy=90;s.player.stun=0;if(key==='paused')s.paused=true;if(key==='phase')s.phase='dead';if(key==='energy')s.player.energy=11;if(key==='stun')s.player.stun=1;const before=s.player.energy;assert.equal(s.useAbility(),false);assert.equal(s.player.energy,before);}
});
test('angling attracts appropriate prey without converting them into attackers',async()=>{
 const {attractingLure,approachLure}=await import('../src/lure-motion.js');const s=world('lure'),prey=animal(s,0,200),cleaner=animal(s,43,100);s.useAbility();assert.equal(attractingLure(s,prey,edible),s.player);assert.equal(attractingLure(s,cleaner,edible),null);const before=prey.x;for(let i=0;i<40;i++)approachLure(prey,s.player,.05,prey.species.speed);assert.ok(prey.x<before);assert.equal(prey.target,null);
});
test('illumination draws real plankton toward the light, then lets it drift back; saves preserve the origin',async()=>{
 const {driftTowardLight}=await import('../src/ability-rules.js'),s=world('flash');s.section.food=s.populate(REEFS[4]).food;
 const f=s.section.food.find(f=>f.food==='plankton');assert.ok(f);Object.assign(f,{x:s.player.x+200,y:s.player.y,regrow:0});s.section.food=[f];const before=f.x;s.useAbility();driftTowardLight(s,1);assert.ok(f.x<before);assert.equal(f.lightOrigin.x,before);
 const restored=importDive(exportDive(s,'Light')).simulation;assert.equal(restored.section.food[0].lightOrigin.x,before);s.player.abilityTime=0;const drawn=f.x;driftTowardLight(s,1);assert.ok(f.x>drawn);
 const bad=JSON.parse(s.serialize());bad.sections[s.current].food[0].lightOrigin.x=Infinity;assert.throws(()=>Simulation.restore(bad),/food discovery/);
});

test('an active NPC defense cannot be bypassed by clicking again or by an existing NPC target',()=>{
 const s=world('none'),defender=animal(s,5),hunter=animal(s,38,90);s.player.species={...s.player.species,size:270};triggerAbility(s,defender);s.player.stun=0;s.player.biteCooldown=0;s.consume(defender);assert.equal(defender.alive,true);assert.match(s.events.at(-1).text||s.events.at(-1).message||'',/defending/);
 hunter.stun=0;hunter.target=defender.id;hunter.think=10;s.stepNpc(hunter,.05);assert.notEqual(hunter.target,defender.id);
 defender.abilityTime=0;s.player.biteCooldown=0;s.consume(defender);assert.equal(defender.alive,false);
});
test('stun blocks food, context actions and cleaning requests until it wears off',()=>{
 const s=world('shock'),food=animal(s,0);s.player.stun=1;const before=s.player.energy;s.consume(food);assert.equal(food.alive,true);assert.equal(s.player.energy,before);assert.equal(s.eatAt(food.x,food.y),false);assert.equal(s.useContext(),false);assert.equal(s.requestCleaning(),false);tick(s,1.1);assert.equal(s.player.stun,0);
});
test('cleaner invitation dances stop for service and reduced motion; mimic dance ends when targeting',()=>{
 const cleaner={id:'player',species:SPECIES[43],still:1};assert.notEqual(displayPose(cleaner,.3).pitch,0);assert.deepEqual(displayPose(cleaner,.3,true),{x:0,y:0,pitch:0});cleaner.service={};assert.equal(displayPose(cleaner,.3).pitch,0);
 const s=world('mimic');s.useAbility();assert.notEqual(displayPose(s.player,.3).pitch,0);s.player.target='host';assert.equal(displayPose(s.player,.3).pitch,0);
});
test('mimic memory expires, follows its host across sections, and clears on respawn',()=>{
 const s=world('mimic'),host=animal(s,16);s.consume(host);s.time=61;assert.equal(mimicTrusted(s,host,s.player),true);host.alive=false;host.respawn=0;s.stepNpc(host,.05);assert.equal(host.mimicMemory,undefined);
});
test('a rested NPC can recover defense energy for later encounters',()=>{const s=world('none'),ray=animal(s,37,500);ray.energy=11;ray.satiated=100;for(let i=0;i<40;i++)s.stepNpc(ray,.05);assert.ok(ray.energy>12);assert.equal(triggerAbility(s,ray),true);});
