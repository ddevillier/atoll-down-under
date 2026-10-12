import {approachCleaning} from './cleaning-stations.js';
import {contactGap} from './feeding-contact.js';
import {parasiteDamage} from './player-cleaner.js';
import {meetFish} from './reef-memories.js';

// Authored grazing choices on the Sunlit Crest's existing algae ledges.
// Meal geometry always belongs to the existing food/contact system.
export const LOOKOUT_SITES=Object.freeze([
 {id:'crest-open',reef:0,x:190,y:460,r:62,name:'Open grazing ledge',lookout:{x:240,y:370},view:'An open view across the water'},
 {id:'crest-sheltered',reef:0,x:360,y:575,r:62,name:'Sheltered grazing nook',lookout:{x:410,y:485},view:'A view along the sheltered ledge'}
]);
const phases=['choose','approach','watch','signal','relocating','partner-feed','swap','player-feed','complete','unavailable'];
const statuses=[null,'partner-away','passer-away','busy','digesting','resting','food-away','too-far'];
const species=['s8','s52'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const bounded=(n,max)=>Number.isFinite(n)&&n>=0&&n<=max;
const only=(o,keys)=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k));
const validId=id=>typeof id==='string'&&id.length>0&&id.length<100&&id!=='player'||Number.isInteger(id)&&bounded(id,1e9);
const reference=r=>only(r,['reef','id','incarnation','species'])&&r.reef===0&&validId(r.id)&&Number.isInteger(r.incarnation)&&bounded(r.incarnation,1e6)&&typeof r.species==='string'&&/^s\d{1,2}$/.test(r.species)&&r.species==='s'+Number(r.species.slice(1))&&Number(r.species.slice(1))<64;
const state=sim=>sim.reefStories?.lookout;
const active=sim=>sim.reefStories?.active==='lookout'&&species.includes(sim.player?.species?.id);
const playing=sim=>active(sim)&&sim.phase==='playing'&&!sim.paused&&sim.player.alive!==false&&sim.player.health>0&&sim.player.energy>0;
const local=sim=>playing(sim)&&state(sim)?.reef===sim.current;
const siteFor=s=>LOOKOUT_SITES.find(p=>p.id===s?.site&&p.reef===s?.reef);
const actor=(sim,r)=>r&&sim.sections[r.reef]?.entities.find(e=>e.alive&&e.id===r.id&&(e.incarnation||0)===r.incarnation&&e.species.id===r.species);
const ref=(sim,e)=>({reef:sim.current,id:e.id,incarnation:e.incarnation||0,species:e.species.id});
const watching=s=>s?.role==='player'&&['watch','signal','partner-feed'].includes(s.phase);
const danger=e=>e.activity==='avoiding'||e.behavior?.startsWith('Moving away');
const care=(sim,e)=>e.cleanTime>0||e.cleanerTarget||e.species.parasites&&parasiteDamage(e)>35&&sim.section.entities.some(b=>b.alive&&b.species.ability==='clean');
const busy=(sim,e)=>e.hidden||e.stun>0||care(sim,e)||danger(e)||e.entering;
const free=(sim,e)=>e.alive&&e.health>0&&!busy(sim,e)&&!e.target&&!e.feeding&&!(e.actionTime>0);
const relationshipAvailable=(sim,e)=>(!e.ecology?.partner||e.ecology.partner===sim.player.id)&&!sim.section.entities.some(b=>b!==e&&b.alive&&b.ecology?.partner===e.id);
const message=(sim,text)=>sim.event('message',text);

export function validStory(s){
 if(s==null)return true;
 if(!only(s,['version','reef','phase','role','buddy','passer','site','anchor','aim','pass','response','responded','cueClicked','partnerFood','partnerMeal','playerMeal','settle','status','logged'])||s.version!==1||s.reef!==0||!phases.includes(s.phase)||!['none','player','partner'].includes(s.role))return false;
 if(!(s.site===null||!!siteFor(s))||!(s.buddy===null||reference(s.buddy)&&species.includes(s.buddy.species))||!(s.passer===null||reference(s.passer)&&s.passer.id!==s.buddy?.id))return false;
 if(!(s.anchor===null||only(s.anchor,['x','y'])&&bounded(s.anchor.x,1600)&&bounded(s.anchor.y,740)&&siteFor(s)&&distance(s.anchor,siteFor(s).lookout)<=45))return false;
 if(!Number.isFinite(s.aim)||Math.abs(s.aim)>Math.PI||!bounded(s.settle,3)||!statuses.includes(s.status)||![null,'hold','move','missed'].includes(s.response)||![s.responded,s.cueClicked,s.partnerMeal,s.playerMeal,s.logged].every(v=>typeof v==='boolean')||!(s.partnerFood===null||validId(s.partnerFood)))return false;
 if(s.pass!==null&&(!only(s.pass,['stage','direction','elapsed','seen'])||!['approach','crossing','passed'].includes(s.pass.stage)||![-1,1].includes(s.pass.direction)||!bounded(s.pass.elapsed,30)||typeof s.pass.seen!=='boolean'))return false;
 if(['watch','signal','partner-feed'].includes(s.phase)&&(s.role!=='player'||!s.anchor||!s.buddy||!siteFor(s)))return false;
 if(['swap','player-feed'].includes(s.phase)&&(s.role!=='partner'||!s.partnerMeal||!s.responded||!siteFor(s)||!s.buddy))return false;
 if(!['watch','signal','partner-feed','swap','player-feed'].includes(s.phase)&&s.role!=='none')return false;
 if(['signal','partner-feed','relocating','swap','player-feed','complete'].includes(s.phase)&&(!s.passer||!s.pass))return false;
 if(s.phase==='signal'&&(!s.pass.seen||s.responded))return false;
 if(['partner-feed','relocating'].includes(s.phase)&&!s.responded)return false;
 if(s.anchor&&!watching(s)||s.cueClicked&&!s.pass?.seen||s.responded&&s.response!=='missed'&&!s.cueClicked||s.partnerMeal&&!s.partnerFood)return false;
 if(s.responded!==(s.response!==null)||s.partnerMeal&&!s.responded||s.playerMeal&&!s.partnerMeal)return false;
 if(s.phase==='complete'&&(!s.logged||!s.playerMeal||!s.partnerMeal))return false;
 return true;
}
const fresh=logged=>({version:1,reef:0,phase:'choose',role:'none',buddy:null,passer:null,site:null,anchor:null,aim:-Math.PI/2,pass:null,response:null,responded:false,cueClicked:false,partnerFood:null,partnerMeal:false,playerMeal:false,settle:0,status:null,logged});
export function initStory(sim){
 if(!species.includes(sim.player?.species?.id)||!sim.reefStories)return false;
 if(!state(sim))sim.reefStories.lookout=fresh(false);
 if(sim.current!==0)sim.setDestination?.(0);
 return true;
}
function unavailable(sim,status){const s=state(sim);s.phase='unavailable';s.role='none';s.anchor=null;s.settle=0;s.status=status;}
function partnerCandidates(sim){
 return sim.section.entities.filter(e=>e.species.id===sim.player.species.id&&free(sim,e)&&relationshipAvailable(sim,e)).sort((a,b)=>distance(a,sim.player)-distance(b,sim.player));
}
function selectSite(sim,id){
 const s=state(sim),site=LOOKOUT_SITES.find(p=>p.id===id&&p.reef===sim.current);
 if(!site)return false;
 if(s.partnerMeal){message(sim,'Your companion has already taken its turn. Swim down to food while it watches.');return true;}
 if(actor(sim,s.buddy)?.target||actor(sim,s.buddy)?.feeding){message(sim,'Your companion is finishing its committed meal. Let it finish before choosing another ledge.');return true;}
 Object.assign(s,{site:site.id,phase:s.buddy?'approach':'choose',role:'none',anchor:null,settle:0,status:null,passer:null,pass:null,response:null,responded:false,cueClicked:false});
 sim.pointer={...site.lookout};message(sim,'Swim to the lookout above '+site.name.toLowerCase()+', then press E.');return true;
}
function startWatch(sim){
 const s=state(sim),p=sim.player,site=siteFor(s),e=actor(sim,s.buddy);
 if(s.partnerMeal||s.phase==='unavailable'||s.phase==='complete')return false;
 if(!site||distance(p,site.lookout)>45){message(sim,'Reach the lookout circle before taking your turn.');return true;}
 if(p.target||p.feeding||p.cleanerTarget||p.cleanTime||p.stun>0){message(sim,'Finish your meal or care visit before watching.');return true;}
 if(!e||distance(e,p)>300){s.status='too-far';message(sim,'Swim beside your companion before taking the lookout.');return true;}
 if(e.species.id!==p.species.id||!relationshipAvailable(sim,e)){unavailable(sim,'busy');return true;}
 if(!free(sim,e)){s.status='busy';message(sim,'Your companion is busy. Its care and committed meal come first.');return true;}
 if(e.satiated>0||e.rest>0){s.status=e.satiated>0?'digesting':'resting';message(sim,e.satiated>0?'Your companion is digesting. Explore together and return when it is hungry.':'Your companion is resting. Explore together and return when it is ready.');return true;}
 // Moving nooks keeps the response already made to the same passing fish.
 // Start its feeding turn directly: the NPC loop can run before tickStory,
 // so entering watch again would reopen an already acknowledged signal.
 Object.assign(s,{phase:s.responded?'partner-feed':'watch',role:'player',anchor:{x:p.x,y:p.y},aim:-Math.PI/2,settle:0,status:null});sim.pointer={x:p.x,y:p.y};
 message(sim,s.responded?'You are looking out at the new nook. Your companion is heading to the grazing patch. Keep looking out while it feeds. E or open water releases your watch.':'You are looking out. Move the pointer to aim; click the passing fish to choose a response. E or open water releases your watch.');return true;
}
function invite(sim){
 const s=state(sim);if(!['choose','approach'].includes(s.phase))return false;
 const e=partnerCandidates(sim).find(e=>distance(e,sim.player)<280);
 if(!e){s.status='partner-away';message(sim,'No free rabbitfish is nearby. Existing pairs stay together; explore Sunlit Crest for a free companion.');return true;}
 meetFish(sim,e,{record:false});
 s.buddy=ref(sim,e);s.status=null;s.phase='approach';
 message(sim,'Watch together · Choose a grazing ledge and swim to its lookout.');return true;
}
export function storyAction(sim,action,value){
 if(!playing(sim)||!state(sim))return false;const s=state(sim);
 if(action==='retry'){
  const logged=s.logged,previous=actor(sim,s.buddy);stopStory(sim);sim.reefStories.lookout=fresh(logged);
  // Keep a consenting, nearby companion for another turn. Never take a fish
  // away from its real pair, care, danger or an already committed meal.
  if(sim.current===0&&previous&&free(sim,previous)&&relationshipAvailable(sim,previous)&&distance(previous,sim.player)<280){
   const next=state(sim);next.buddy=ref(sim,previous);next.phase='approach';
  }
  return true;
 }
 if(action==='leave'||action==='lookout-leave'){stopStory(sim);return true;}
 if(sim.current!==0){if(action==='context'||action==='invite'){sim.setDestination?.(0);message(sim,'Follow the route to Sunlit Crest to watch together.');return true;}return false;}
 if(action==='invite'||action==='lookout-invite')return invite(sim);
 if(action==='site'||action==='lookout-site')return selectSite(sim,value);
 if(action==='hold'||action==='move'||action==='lookout-hold'||action==='lookout-move')return respond(sim,action.endsWith('hold')?'hold':'move');
 if(action==='watch'||action==='lookout-watch')return startWatch(sim);
 if(action!=='context')return false;
 if(watching(s)){stopStory(sim);message(sim,'Swimming freely again. Your companion keeps its own feeding and care choices.');return true;}
 if(s.phase==='complete'){message(sim,'A Thoughtful Lookout is in your journal. You can explore together.');return true;}
 if(!s.buddy)return invite(sim);
 if(s.phase==='unavailable'){message(sim,'This encounter is unavailable. Choose Start a new exchange to meet a free companion.');return true;}
 if(!s.site){const nearest=LOOKOUT_SITES.filter(p=>distance(sim.player,p.lookout)<=45).sort((a,b)=>distance(a.lookout,sim.player)-distance(b.lookout,sim.player))[0];return selectSite(sim,nearest?.id??LOOKOUT_SITES[0].id);}
 return startWatch(sim);
}
function recruitPasser(sim){
 const s=state(sim),site=siteFor(s);
 const e=sim.section.entities.filter(e=>e.id!==s.buddy.id&&free(sim,e)&&e.species.speed>0&&!e.species.diet.includes('fish')&&e.species.ability!=='clean'&&!e.groundRoute&&!e.holdfast&&!e.ecology?.partner&&relationshipAvailable(sim,e)&&distance(e,site.lookout)<850).sort((a,b)=>distance(a,site.lookout)-distance(b,site.lookout))[0];
 if(!e){s.status='passer-away';return false;}
 s.passer=ref(sim,e);s.pass={stage:'approach',direction:e.x<=site.lookout.x?1:-1,elapsed:0,seen:false};s.status=null;return true;
}
function respond(sim,response){
 const s=state(sim),e=actor(sim,s.passer);
 if(!local(sim)||s.phase!=='signal'||!e||busy(sim,e)||e.target||e.feeding||!s.pass.seen||!s.cueClicked||distance(e,sim.player)>185)return false;
 s.response=response;s.responded=true;s.settle=0;s.status=null;
 if(response==='hold'){s.phase='partner-feed';message(sim,'Hold here · Your companion continues toward the real grazing patch.');}
 else relocate(sim,false);
 return true;
}
function relocate(sim,missed){
 const s=state(sim);s.site=LOOKOUT_SITES.find(p=>p.id!==s.site).id;s.phase='relocating';s.role='none';s.anchor=null;s.settle=0;
 sim.pointer={...siteFor(s).lookout};message(sim,missed?'The movement passed. Your companion gently moves to the other nook; swim alongside and press E there.':'Move over · Your companion rises and swims to the other nook. Follow it and press E at the new lookout.');
}
export function storyPointer(sim,x,y){
 const s=state(sim);if(!local(sim)||!watching(s)||!Number.isFinite(x)||!Number.isFinite(y))return false;
 s.aim=Math.atan2(y-sim.player.y,x-sim.player.x);sim.pointer={...s.anchor};return true;
}
export function storyClick(sim,x,y){
 if(!local(sim)||!Number.isFinite(x)||!Number.isFinite(y))return false;const s=state(sim),point={x,y};
 if(watching(s)){
  const e=actor(sim,s.passer);
  if(s.phase==='signal'&&e&&distance(e,point)<Math.max(28,e.species.size*.7)){
   const direction=Math.atan2(e.y-sim.player.y,e.x-sim.player.x);
   if(Math.cos(s.aim-direction)<Math.cos(.7)){message(sim,'Turn your lookout attention toward the passing fish, then click its visible movement.');return true;}
   s.cueClicked=true;message(sim,'Passing movement · Choose Hold here or Move over.');return true;
  }
  stopStory(sim);return false;
 }
 if(['choose','approach','relocating'].includes(s.phase)){const site=LOOKOUT_SITES.find(p=>distance(point,p.lookout)<45||distance(point,p)<p.r);if(site)return selectSite(sim,site.id);}
 return false;
}
export function storyPlayer(sim,dt){
 const s=state(sim);if(!local(sim)||!watching(s)||!Number.isFinite(dt)||dt<=0)return false;
 if(!s.anchor||distance(sim.player,s.anchor)>3||sim.player.target||sim.player.feeding||sim.player.cleanerTarget||sim.player.cleanTime||sim.player.stun>0||sim.player.abilityTime>0){stopStory(sim);return false;}
 sim.pointer={...s.anchor};sim.player.vx=0;sim.player.vy=0;sim.player.activity='lookout';return true;
}
function meal(sim,food,who){return food?.kind==='food'&&['algae','grass'].includes(food.food)&&!(food.regrow>0)&&who.feeding?.committed&&who.feeding.target===food.id&&contactGap(who,food)<=3.1&&distance(food,siteFor(state(sim)))<=70;}
// A lookout turn is a small grazing bite, not a full feeding excursion. Only
// genuine contact by the invited companion qualifies for this shorter recovery.
// Existing digestion and all meals outside this exchange retain normal timing.
export function npcMealPortion(sim,food,who){
 if(!local(sim)||!food||!who)return 1;const s=state(sim);
 return s.phase==='partner-feed'&&s.responded&&watching(s)&&who===actor(sim,s.buddy)&&distance(sim.player,s.anchor)<=3&&food?.id===s.partnerFood&&meal(sim,food,who)?1/6:1;
}
export function storyMeal(sim,food,who=sim.player){
 if(!local(sim))return;const s=state(sim),e=actor(sim,s.buddy),site=siteFor(s);if(!site||!e||!meal(sim,food,who))return;
 if(who===e&&s.phase==='partner-feed'&&s.responded&&watching(s)&&distance(sim.player,s.anchor)<=3&&food.id===s.partnerFood){s.partnerMeal=true;s.phase='swap';s.role='partner';s.anchor=null;s.settle=0;s.status=null;message(sim,'Your companion has taken a real bite. It rises to the lookout; wait for it to arrive, then click reachable food for your turn.');}
 if(who===sim.player&&s.phase==='player-feed'&&s.partnerMeal&&distance(e,site.lookout)<=18&&!busy(sim,e)&&!e.target&&!e.feeding){s.playerMeal=true;s.phase='complete';s.role='none';s.anchor=null;if(!s.logged){s.logged=true;sim.event('discovery','A Thoughtful Lookout · You exchanged grazing and lookout roles.',{value:'rabbitfish-lookout'});}message(sim,'A Thoughtful Lookout · Both turns happened through real movement and feeding contact.');}
}
export function tickStory(sim,dt){
 if(!local(sim)||!Number.isFinite(dt)||dt<=0)return;const s=state(sim),p=sim.player,e=actor(sim,s.buddy);
 if(['choose','complete','unavailable'].includes(s.phase))return;
 if(!e){unavailable(sim,'partner-away');return;}
 if(e.species.id!==p.species.id||!relationshipAvailable(sim,e)){unavailable(sim,'busy');return;}
 if(busy(sim,e)){unavailable(sim,'busy');return;}
 if(['watch','signal'].includes(s.phase)&&(e.target||e.feeding)){unavailable(sim,'busy');return;}
 if(s.phase==='partner-feed'&&(e.target&&e.target!==s.partnerFood||e.feeding&&e.feeding.target!==s.partnerFood)){unavailable(sim,'busy');return;}
 if(s.passer&&!actor(sim,s.passer)){unavailable(sim,'passer-away');return;}
 if(distance(p,e)>650){stopStory(sim);s.status='too-far';return;}
 if(watching(s)&&!storyPlayer(sim,dt))return;
 if(s.phase==='watch'){
  s.settle=Math.min(3,s.settle+Math.min(dt,.1));if(s.settle>=.6&&!s.passer)recruitPasser(sim);
  if(s.pass?.seen){s.phase=s.responded?'partner-feed':'signal';}
 }
 if(s.phase==='swap'&&distance(e,siteFor(s).lookout)<=18&&!busy(sim,e)&&!e.target&&!e.feeding){s.phase='player-feed';message(sim,'Your companion is watching now. Click the real algae below and swim into your bite.');}
}
function move(e,dest,dt){approachCleaning(e,dest,Math.min(dt,.1),e.species.speed*.5);e.activity='companionship';}
export function storyNPC(sim,e,dt){
 if(!local(sim)||!Number.isFinite(dt)||dt<=0)return false;const s=state(sim),site=siteFor(s),buddy=actor(sim,s.buddy);if(!buddy||busy(sim,e))return false;
 // Invitation is already a real role choice. Until a nook is selected, the
 // same consenting fish waits here instead of falling through to autonomous
 // meal selection on the tick its initial digestion expires. Care, danger,
 // existing targets and committed mouth actions still retain their priority.
 if(!site){
  if(e!==buddy||s.phase!=='approach'||e.target||e.feeding||e.actionTime>0||distance(e,sim.player)>650)return false;
  e.activity='companionship';e.behavior='Waiting for your grazing nook choice';return true;
 }
 if(e===actor(sim,s.passer)&&s.pass&&s.pass.stage!=='passed'&&!['unavailable','complete','choose','approach'].includes(s.phase)){
  if(e.target||e.feeding||e.actionTime>0)return false;
  const pass=s.pass,dest={x:site.lookout.x+(pass.stage==='approach'?-1:1)*pass.direction*155,y:site.lookout.y-28};
  move(e,dest,dt);e.behavior='Passing the rabbitfish lookout';e.activity='cruising';pass.elapsed=Math.min(30,pass.elapsed+Math.min(dt,.1));
  if(pass.stage==='approach'&&distance(e,dest)<=12)pass.stage='crossing';
  if(pass.stage==='crossing'&&distance(e,sim.player)<=170){pass.seen=true;if(s.phase==='watch')s.phase=s.responded?'partner-feed':'signal';}
  if(pass.stage==='crossing'&&distance(e,{x:site.lookout.x+pass.direction*155,y:site.lookout.y-28})<=12){pass.stage='passed';if(!s.responded&&pass.seen){s.response='missed';s.responded=true;relocate(sim,true);}}
  if(pass.elapsed>=30&&!pass.seen){unavailable(sim,'passer-away');return false;}
  // Simulation owns ordinary physiology, including on handled movement ticks.
  return true;
 }
 if(e!==actor(sim,s.buddy)||['choose','complete','unavailable'].includes(s.phase))return false;
 if(e.target||e.feeding||e.actionTime>0)return false;
 if(s.phase==='partner-feed'){
  if(e.satiated>0){s.status='digesting';return false;}if(e.rest>0){s.status='resting';return false;}
  const food=sim.section.food.filter(f=>f.regrow<=0&&['algae','grass'].includes(f.food)&&distance(f,site)<=70).sort((a,b)=>distance(a,e)-distance(b,e))[0];
  if(!food){s.status='food-away';return false;}
  s.partnerFood=food.id;s.status=null;e.target=food.id;e.think=Math.max(.5,e.think||0);e.pursuit=0;e.behavior='Grazing while you look out';return false;
 }
 if(['swap','player-feed'].includes(s.phase)){
  move(e,site.lookout,dt);e.behavior='Looking out while you graze';e.activity='lookout';
 }else if(['approach','relocating','watch','signal'].includes(s.phase)){
  // Own the approach even while normal digestion/rest clears. Yielding here
  // would let the ordinary AI choose another meal in the exact expiry tick,
  // converting a brief initial condition into a fresh 45–80 second wait.
  s.status=e.rest>0?'resting':e.satiated>0?'digesting':null;
  move(e,{x:site.x+38,y:site.y-42},dt);e.behavior=s.phase==='relocating'?'Rising and moving to the other grazing nook':'Waiting for your lookout signal';
 }else return false;
 return true;
}
export function stopStory(sim){
 const s=state(sim);if(!s)return false;
 s.role='none';s.anchor=null;s.settle=0;if(!['complete','choose'].includes(s.phase))s.phase='unavailable';
 for(const r of [s.buddy,s.passer]){const e=actor(sim,r);if(e&&!e.target&&!e.feeding&&!danger(e)&&!care(sim,e)){e.think=0;e.activity='cruising';e.behavior='Exploring';}}
 return true;
}
export function safety(sim){
 const s=state(sim),site=siteFor(s);
 // The saved geometry still describes an occupied scene while paused. Exit
 // grace and restore checks need the same exact identities without a tick.
 if(!active(sim)||sim.phase!=='playing'||s?.reef!==sim.current||!site||!actor(sim,s.buddy)||s.passer&&!actor(sim,s.passer)||['choose','unavailable','complete'].includes(s.phase))return null;
 const participants=[s.buddy,s.passer].filter(r=>actor(sim,r)).map(({id,incarnation,species})=>({id,incarnation,species}));
 return {reef:s.reef,x:site.lookout.x,y:site.lookout.y+40,radius:220,participants,holdNeeds:watching(s)||['swap','player-feed','relocating'].includes(s.phase)};
}
export function validStoryPlayer(sim){
 const s=state(sim),p=sim.player;
 if(!s||!watching(s)||s.reef!==sim.current)return true;
 return !!(p&&s.anchor&&distance(p,s.anchor)<=3&&!p.target&&!p.feeding&&!p.cleanerTarget&&!(p.cleanTime>0)&&!(p.stun>0)&&!(p.abilityTime>0));
}
export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Watch together',detail:'Begin Your Turn to Look.',actions:[],complete:false};
 const site=siteFor(s),e=actor(sim,s.buddy),passer=actor(sim,s.passer),sites=LOOKOUT_SITES.map(p=>({...p,lookout:{...p.lookout}}));
 let step='Meet a free rabbitfish',detail='Swim near a free companion on Sunlit Crest and choose Watch together.',actions=[{id:'invite',label:'Watch together'}];
 if(sim.current!==0){step='Visit Sunlit Crest';detail='Follow the map route to the two grazing ledges.';actions=[{id:'story-route',label:'Show route'}];}
 else if(s.phase==='unavailable'){step='Explore freely';detail=s.status==='partner-away'?'Your original companion is away. Start a new exchange when a free rabbitfish is nearby.':'This exchange was released or a participant became busy. Your earned discovery stays in the journal.';actions=[{id:'retry',label:'Start a new exchange'}];}
 else if(s.phase==='complete'){step='A Thoughtful Lookout';detail='Your companion grazed while you watched, then rose to watch your real bite. The discovery is in your journal.';actions=[{id:'retry',label:'Try another exchange'}];}
 else if(s.buddy){
  step=({approach:'Choose a grazing nook',watch:'Aim your lookout',signal:'Respond to passing movement',relocating:'Move over together','partner-feed':'Watch while your companion grazes',swap:'Your companion rises to watch','player-feed':'Your turn to graze'})[s.phase]||'Choose a grazing nook';
  detail=({approach:'Choose a ledge, swim to its lookout circle, then press E.',watch:'Move the pointer to look across the water. Click visible passing movement to consider a response.',signal:'A harmless neighbor is passing. Hold here or move to the other nook; your companion follows your choice.',relocating:'Your companion is swimming to the other nook. Reach its lookout circle and press E.','partner-feed':'Keep your lookout until your companion commits a real mouth-contact bite. E or open water lets you leave.',swap:'Wait until your companion physically reaches the lookout before taking your turn.','player-feed':'Click real algae below. Normal swimming and mouth contact take your bite while your companion watches.'})[s.phase]||'Choose a ledge.';
  actions=['approach','relocating'].includes(s.phase)?sites.map(p=>({id:'site',label:p.name,value:p.id})).concat([{id:'watch',label:'Take lookout'}]):s.phase==='signal'&&s.cueClicked?[{id:'hold',label:'Hold here'},{id:'move',label:'Move over'}]:[];
  if(watching(s))actions.push({id:'leave',label:'Leave lookout'});
  const status={busy:'Your companion is busy with care, danger, or a committed meal. Explore freely until it is available.',digesting:'Your companion is digesting its own meal. Explore together or return when it is hungry.',resting:'Your companion is resting between feeding trips. You can explore and return.', 'food-away':'The real grazing patch is unavailable. Let it regrow or choose a new exchange.', 'passer-away':'No calm passing swimmer is available. You can explore and try again.', 'too-far':'Swim closer to your companion before taking the lookout.'}[s.status];if(status)detail=status;
 }
 return {step,detail,actions,complete:s.phase==='complete',site,buddy:e,passer,sites,watching:watching(s),role:s.role,aim:s.aim,cueClicked:s.cueClicked,response:s.response,status:s.status};
}
