import {DEFAULT_BLUEPRINT,blueprint,newCreation,abilityIssue,refugeRole,listCreations,getCreation,storeCreation,resolveImportedCreation} from './creations.js';
import {creationEditor,creationShelf,customGuide} from './creation-ui.js';
import {creationTrial} from './creation-trial.js';
import {customInstruction} from './custom-life.js';
import {canUseShelter} from './shelter.js';
import {RESIDENT_JOURNEYS,watchedResident,beginResidentObservation,residentInstruction} from './resident-journeys.js';
import {forgetEscort} from './escort-journeys.js';
import {aimWatch} from './watch-journeys.js';
import {aimAmbush} from './ambush-activity.js';
import {ADVENTURES,JOURNEYS,contextLabel,adventureInstruction} from './adventures.js';
import {BADGES,freshJournal,validateJournal,recordProgress,mergeJournals,journalRewards,careHint} from './journal.js';
import {lengthSummary} from './measurements.js';
import {fullscreenButton,initializeFullscreen,toggleFullscreen} from './fullscreen.js';
import {MAX_SAVE_BYTES,diveName,diveFilename,exportDive,importDive} from './save-files.js';
import {NATURAL_HISTORY} from './natural-history.js';
import {shelterHint,PROTECTION_HINT} from './shelter.js';
import {foodWeb,REEF_LESSONS} from './learning.js';
import {Simulation,healthState} from './simulation.js';
import {routeBetween,availableMeals} from './reef-map.js';
import {SPECIES,BY_ID,PLAYABLE,PRACTICE_SPECIES,REEFS,FOODS,ABILITIES,GLOSSARY,createSpecies} from './data.js';
import {ReefRenderer} from './render.js';
import {Soundscape} from './audio.js';
const narrationCatalog=await fetch('src/narration-catalog.json').then(r=>r.ok?r.json():{}).catch(()=>({}));
const activityNarration=await fetch('src/activity-narration.json').then(r=>r.ok?r.json():{}).catch(()=>({}));
const $=s=>document.querySelector(s),ui=$('#ui'),canvas=$('#reef');
const renderer=new ReefRenderer(canvas),audio=new Soundscape();
let sim=null,home=true,modal=null,selection='s1',pending=null,guideTab='species',search='',toast='',toastUntil=0,inspected=null,last=performance.now(),acc=0,hudClock=0,focusBefore=null;
let mapSelection=4;
let activeDiveName='',importedDive=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let config={...DEFAULT_BLUEPRINT},draftParent=null,creationRecords=[],creationError='',trialReturn=null,renameId=null,portraitPointer=.5;
const creationHelpers={panel,button,escape,dietText};
const defaults={sound:true,musicVolume:.42,effectsVolume:.55,narrationVolume:.85,verbose:false,hints:true,foodHints:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,metric:true};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
let settings={...defaults,...read('atoll-settings',{})};audio.update(settings);renderer.reducedMotion=settings.reducedMotion;renderer.foodHints=settings.foodHints;
let journal=freshJournal(),journalUnsaved=false,badgeQueue=[],careKind='',wellUntil=0,checkpointClock=0;
try{const stored=localStorage.getItem('atoll-journal');if(stored)journal=validateJournal(JSON.parse(stored));}catch{journalUnsaved=true;}
function saveJournal(){try{localStorage.setItem('atoll-journal',JSON.stringify(journal));journalUnsaved=false;return true;}catch{journalUnsaved=true;return false;}}
function progress(kind,value){if(sim?.trial)return;const before=JSON.stringify(journal);badgeQueue.push(...recordProgress(journal,kind,value));if(JSON.stringify(journal)!==before)saveJournal();}
function titleRewards(){renderer.titleReef.rewards=journalRewards(journal);}
titleRewards();
function downloadJournal(){const url=URL.createObjectURL(new Blob([JSON.stringify(journal,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Atoll-Family-Journal.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('Journal backup started. Keep this file with your saved dives.');}
function journalHTML(){
 const art={helper:'s43',meal:'s5',clean:'s43',shelter:'s2',care1:'s7',care3:'s19',play3:'s27',play10:'s4',visit3:'s44',visit9:'s25',night:'s53',neighbor:'s45',school:'s0'};
 const rewards={cuttlefish:'A hovering cuttlefish',ray:'A gliding ray',school:'A mixed school of three fish',seahorse:'A shy seahorse'};
 return panel('Our family journal',`<p class="journal-intro">Small acts of care, many lives to discover. Shared by everyone on this device, across all dives.</p>${journalUnsaved?'<div class="notice" role="alert">Journal progress is not saved on this device. Back up now to keep it safe. Restoring a backup also retries saving.</div>':''}<div class="journal-summary"><strong>${Object.keys(journal.earned).length} / ${BADGES.length} badges</strong><span>${journal.played.length} species played</span><span>${journal.cared.length} care stamps</span><span>${journal.habitats.length} / 9 habitats</span></div><div class="journal-badges">${BADGES.map(b=>{const earned=journal.earned[b.id],secret=b.secret&&!earned;return `<article class="journal-badge ${earned?'earned':''}"><div class="badge-art ${secret?'mystery':''}"><canvas class="species-portrait" data-species="${art[b.id]}" width="240" height="130" aria-hidden="true"></canvas>${secret?'<span>?</span>':''}</div><div><h3>${secret?'A reef secret':escape(b.name)}</h3><p>${secret?'Something unexpected to discover while you play.':escape(b.description)}</p>${b.reward?`<small>Title visitor: ${rewards[b.reward]}. ${earned?'Arrives next time you return home.':'Earn this badge to welcome it.'}</small>`:''}<small class="badge-date">${earned?'Earned '+new Date(earned).toLocaleDateString():secret?'Undiscovered':'Still to discover'}</small></div></article>`;}).join('')}</div><h3 class="stamp-heading">Ways of living</h3><div class="discovery-list">${Object.entries(JOURNEYS).map(([id,a])=>`<div><canvas class="species-portrait" data-species="${id}" width="180" height="95" aria-hidden="true"></canvas><strong>${escape(a.name)}</strong><small>${journal.discoveries.includes(a.id)?'Discovered through play':escape(a.description)}</small></div>`).join('')}</div><h3 class="stamp-heading">Lives we have cared for</h3><p class="subtle">Needed meals restoring at least 10 energy in total, then 30 active seconds with Energy at 70 or more and Health at 80 or more. Pausing gives you time to look. Play a species for one active minute to mark it as played.</p><div class="species-stamps">${PLAYABLE.map(s=>`<div class="species-stamp ${journal.cared.includes(s.id)?'cared':''}"><canvas class="species-portrait" data-species="${s.id}" width="180" height="95" aria-hidden="true"></canvas><span>${escape(s.name)}</span><small>${journal.cared.includes(s.id)?'Care stamp earned':journal.played.includes(s.id)?'Played · Care to discover':'A life to discover'}</small></div>`).join('')}</div><p class="subtle">Created fish can earn activity badges. Species milestones celebrate the playable reef creatures. Every creature is available from the start.</p>`,`<div class="two-buttons">${button('journal-backup','Back up','save','secondary-button')}${button('journal-restore','Restore',null,'secondary-button')}<input id="journal-file" type="file" accept=".json,application/json" hidden></div>${button('close','Return',null,'primary-button')}`);
}
function write(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{notify('Storage is full or unavailable. This dive could not be saved. Keep it open, free local storage, then try saving again.');return false;}}
let creationWrite=Promise.resolve();
function persistCreation(value){
 if(!value?.creation||value.trial)return Promise.resolve();
 const snapshot=Simulation.restore(value.serialize());
 creationWrite=creationWrite.catch(()=>{}).then(()=>storeCreation(snapshot)).then(()=>{creationError='';}).catch(err=>{creationError='Your creation is not saved. Keep this dive open and export a backup. '+err.message;notify(creationError);throw err;});
 creationWrite.catch(()=>{});return creationWrite;
}
function updateCreationFields(){
 const s=createSpecies(config),issue=abilityIssue(config);
 $('#free-proportions').hidden=config.shapeMode==='adapted';$('#proportion-note').textContent=config.shapeMode==='adapted'?'Swimming traits reshape your fish: speed lengthens, agility deepens, endurance streamlines.':'Keep your chosen proportions while experimenting with swimming traits.';
 $('#created-diet').textContent='Diet: '+dietText(s);$('#ability-note').textContent=issue||ABILITIES[s.ability].description;
 for(const key of ['size','speed','endurance','agility','bodyLength','bodyDepth'])$('#config-'+key).textContent=config[key];
 $('#budget').textContent=(1600-s.cost)+' points remaining';$('#budget').classList.toggle('over',s.cost>1600);
 $('#create-begin').disabled=$('#create-test').disabled=s.cost>1600||!!issue;
 $('#shape-note').textContent=canUseShelter(s)?'Small enough to settle inside reef shelters.':'Too large for reef shelters; try a smaller variation.';
}
async function showCreations(){
 if(sim?.creation&&!sim.trial)try{await persistCreation(sim);}catch{}
 try{creationRecords=(await listCreations()).sort((a,b)=>b.savedAt-a.savedAt);}catch(err){creationError='Creations could not be read. Your open dive is still available. '+err.message;}
 openModal('creations');
}
function exitTrial(){
 const back=trialReturn;trialReturn=null;if(!back)return;
 sim=back.sim;home=back.home;activeDiveName=back.name;modal=null;audio.setTrack(home?'blue-passage':sim?.period==='night'?'moon-through-water':'glasswater');openModal('create');
}
async function creationAction(action,el){
 try{
  if(action==='creations'){if(sim?.trial){exitTrial();return true;}await showCreations();return true;}
  if(action==='creation-fresh'){config={...DEFAULT_BLUEPRINT};draftParent=null;openModal('create');return true;}
  if(action==='trial-start'){
   if(createSpecies(config).cost>1600||abilityIssue(config))return true;
   if(sim?.creation)await persistCreation(sim);
   trialReturn={sim,home,name:activeDiveName};enter(creationTrial(blueprint(config)),'Test swim');return true;
  }
  if(action==='trial-exit'){exitTrial();return true;}
  if(action==='trial-reset'){enter(creationTrial(blueprint(config)),'Test swim');return true;}
  if(action==='creation-route'){mapSelection=sim.creation.home.reef;openModal('reef-map');return true;}
  if(action==='guide-real'){selection='s1';guideTab='species';openModal('guide');return true;}
  if(action==='creation-rename'){renameId=el.dataset.id;openModal('creation-rename');return true;}
  if(action==='rename-save'){
   const record=await getCreation(renameId);if(!record)throw new Error('This fish could not be found.');
   const next=sim?.creation?.id===renameId?sim:Simulation.restore(record.state),name=$('#rename-creation').value.trim().slice(0,36)||'Lagoon wanderer';
   next.creation.blueprint.name=name;next.creation.revision++;next.custom.name=name;next.player.species.name=name;await persistCreation(next);await showCreations();return true;
  }
  if(['creation-resume','creation-new','creation-vary'].includes(action)){
   const record=await getCreation(el.dataset.id);if(!record)throw new Error('This fish could not be found.');
   if(action==='creation-vary'){config=blueprint(record.creation.blueprint);draftParent=record.id;openModal('create');return true;}
   if(sim?.creation)await persistCreation(sim);
   const next=Simulation.restore(record.state);
   if(action==='creation-new'){next.continueRun();next.adventure.visible=true;}
   config=blueprint(next.creation.blueprint);draftParent=next.creation.id;resumeDive(next);return true;
  }
 }catch(err){notify('This creation could not be opened or saved. '+err.message);return true;}
 return false;
}
ui.addEventListener('pointermove',e=>{if(e.target.id==='custom-portrait'){const rect=e.target.getBoundingClientRect();portraitPointer=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));}});
function animateCreationPortraits(now){
 if(!renderer.ready)return;const time=settings.reducedMotion?0:now/1000;
 const editor=$('#custom-portrait');if(editor)renderer.portrait(editor,createSpecies(config),time,portraitPointer);
 const guide=$('#custom-guide-portrait');if(guide&&sim)renderer.portrait(guide,sim.player.species,time);
 for(const c of document.querySelectorAll('.creation-portrait')){const record=creationRecords.find(r=>r.id===c.dataset.creation);if(record)renderer.portrait(c,createSpecies(record.creation.blueprint),time);}
}
const paths={fish:'M2 12c5-9 13-9 18 0-5 9-13 9-18 0Zm18 0 5-5v10l-5-5ZM7 10h.01',book:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16',save:'M4 3h13l4 4v14H3V3h1Zm3 0v6h10V3M7 21v-8h10v8',pause:'M8 5v14M16 5v14',play:'m8 4 12 8-12 8V4',arrow:'M4 12h16m-6-6 6 6-6 6',gear:'m9 3 1-2h4l1 2 3 2 2 1 2 4v4l-2 4-2 1-3 2-1 2h-4l-1-2-3-2-2-1-2-4v-4l2-4 2-1 3-2Zm3 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8',sound:'M4 9h4l6-5v16l-6-5H4V9m13-1q6 4 0 8',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',moon:'M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z',info:'M12 11v6m0-10v.1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',ability:'m13 2-9 12h7l-1 8 10-13h-7l0-7',home:'m3 11 9-8 9 8M5 10v11h14V10m-10 11v-7h6v7',trophy:'M7 3h10v7a5 5 0 0 1-10 0V3Zm0 2H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5m-4 2v6m-4 0h8',close:'M6 6l12 12M6 18 18 6'};
function icon(name){return `<svg viewBox="0 0 26 26" aria-hidden="true"><path d="${paths[name]||paths.fish}"/></svg>`;}
function button(action,label,iconName,cls='text-button'){return `<button class="${cls}" data-action="${action}">${iconName?icon(iconName):''}${label}</button>`;}
function notify(text){toast=text;toastUntil=performance.now()+4000;$('#announcer').textContent=text;updateToast();}
function updateToast(){
 const old=$('.toast'),inline=$('.modal-notice');
 if(performance.now()>toastUntil||!toast){old?.remove();inline?.remove();return;}
 if(modal){old?.remove();if(modal==='message')return;if(inline)inline.textContent=toast;else{const body=$('.panel-body');if(body){const e=document.createElement('div');e.className='modal-notice';e.setAttribute('role','status');e.textContent=toast;body.before(e);}}return;}
 if(inspected&&sim?.paused){old?.remove();return;}
 inline?.remove();if(old)old.textContent=toast;else{const e=document.createElement('div');e.className='toast';e.textContent=toast;ui.append(e);}
}
function drawUI(){
 const speechId=modal==='activity'?'activities/'+selection:selection;
 if(!((modal==='guide'&&guideTab==='species')||modal==='activity')||audio.narrationId!==speechId)audio.stopNarration();
 ui.innerHTML=home?homeHTML():gameHTML();
 canvas.setAttribute('aria-label',home?'Atoll Down Under: a stone title in a blue reef, with a shipwreck and swimming fish. Use the Game menu to choose a life.':'Interactive coral reef');
 renderer.titleBlocked=!!modal;if(modal)renderer.titleReef.leave();
 if(modal)ui.insertAdjacentHTML('beforeend',modalHTML());
 if(!home&&renderer.ready){const port=$('#hud-fish');if(port)renderer.portrait(port,sim.player.species);}
 paintPortraits();updateHUD();updateToast();
}
function homeHTML(){
 const modes=[['practice','Practice','Choose a creature. Explore its life.'],['challenge','Challenge','Four lives, from small fry to reef ruler.'],['tournament','Tournament','Journey through all 55 playable species.'],['create','Create a fish','Shape a life of your own.']];
 return `<h1 class="sr-only">Atoll Down Under</h1><nav class="splash-bar" aria-label="Main menu" ${modal?'inert aria-hidden="true"':''}><details class="splash-menu"><summary>File</summary><div class="splash-dropdown">${sim?button('resume','Continue dive','play'):''}${button('saves','Saved dives','save')}${button('creations','My creations','fish')}${button('journal','Family journal','book')}${button('scores','Reef rulers','trophy')}${button('settings','Settings','gear')}${fullscreenButton()}</div></details><details class="splash-menu"><summary>Game</summary><div class="splash-dropdown splash-modes">${modes.map(([m,title,sub])=>`<button data-action="mode-${m}"><span><b>${title}</b><small>${sub}</small></span></button>`).join('')}</div></details><details class="splash-menu splash-help"><summary>Help</summary><div class="splash-dropdown">${button('guide','Field guide','book')}${button('help','How to play','info')}</div></details></nav><button class="sound-enable secondary-button" data-action="enable-sound" hidden>Enable sound</button>`;
}
function dietText(s){return s.diet.map(f=>f==='fish'&&s.ability==='mimic'?'bites from other fish':FOODS[f]?.name||({fish:'smaller fish',crab:'crabs',snail:'snails',urchin:'urchins',star:'sea stars',parasite:'parasites',detritus:'detritus'})[f]||f).join(' · ');}
function reefMapHTML(){
 const selected=REEFS[mapSelection],visited=new Set(sim.visited),route=routeBetween(sim.current,mapSelection),meals=availableMeals(sim.player.species,sim.sections[mapSelection]);
 const tiles=REEFS.map(r=>`<button class="reef-map-tile" data-action="map-select" data-reef="${r.id}" aria-pressed="${r.id===mapSelection}" ${r.id===sim.current?'aria-current="location"':''}><img src="${r.image}" alt=""><span>${escape(r.name)}<small>${r.id===sim.current?'You are here':visited.has(r.id)?'Visited':'Not yet visited'}</small></span></button>`).join('');
 const steps=route.map(leg=>`<li>Swim <strong>${leg.direction}</strong> to ${escape(REEFS[leg.to].name)}.</li>`).join('');
 return panel('Explore the reef',`<div class="reef-map-layout"><div><div class="reef-map-grid" aria-label="Nine reef habitats, arranged as they connect">${tiles}</div><p class="reef-map-key">The left and right edges meet. The top and bottom edges end the reef.</p></div><section class="reef-map-detail" aria-live="polite"><h3>${escape(selected.name)}</h3><p>${sim.period==='day'?'Day reef':'Night reef'} · ${mapSelection===sim.current?'Your current habitat':visited.has(mapSelection)?'Visited on this dive':'A new place to explore'}</p><h4>Meals for ${escape(sim.player.species.name)}</h4><p>${meals.length?escape(meals.join(' · ')):'No suitable meals available here right now.'}</p><h4>From where you are</h4>${steps?`<ol>${steps}</ol>`:'<p>You are already here. Choose another habitat to plan a swim.</p>'}${sim.destination!==null?`<p class="subtle">Current destination: ${escape(REEFS[sim.destination].name)}</p>${button('map-clear','Clear route',null,'secondary-button')}`:''}</section></div>`,`<span class="subtle">${visited.size} of 9 habitats visited</span><div class="map-footer-actions">${button('close','Return',null,'secondary-button')}<button class="primary-button" data-action="map-route" ${route.length?'':'disabled'}>Guide my swim ${icon('arrow')}</button></div>`);
}
function abilityHTML(p){
 const a=ABILITIES[p.species.ability]||ABILITIES.none;
 if(a.passive)return `<div class="passive-ability" title="${escape(a.description)}"><span id="ability-label">${escape(a.name)}</span><small>Always active</small></div>`;
 return `<button data-action="ability" class="tool-button" ${a===ABILITIES.none?'disabled':''}>${icon('ability')}<span id="ability-label">${escape(a.name)}</span><kbd>Space</kbd></button>`;
}
function residentJourneyHTML(){const id=sim.residentFocus,d=RESIDENT_JOURNEYS[id];if(!d)return '';return `<aside class="adventure-note" aria-label="Resident observation"><div class="adventure-heading"><strong>${escape(d.name)}</strong><button data-action="resident-close" aria-label="Stop observing resident">×</button></div><small>${escape(BY_ID[id].name)}</small><p id="resident-step">${escape(residentInstruction(sim))}</p>${sim.paused?'<button class="secondary-button" data-action="resident-resume">Resume watching</button>':''}<button class="text-button" data-action="resident-again" hidden>Watch again</button>${activityNarration[id]?'<button class="text-button activity-listen" data-action="resident-help">Hear this observation</button>':''}</aside>`;}
function adventureHTML(){if(sim.creation&&!sim.trial)return `<aside class="adventure-note" aria-label="Your fish activity">${sim.adventure.visible?`<div class="adventure-heading"><strong>${refugeRole(sim.creation)?'Explore and find refuge':'A life of your own'}</strong><button data-action="adventure-toggle" aria-label="Hide adventure">×</button></div><p id="custom-step">${escape(customInstruction(sim))}</p>`:button('adventure-toggle','Your fish’s life',null,'secondary-button')}${refugeRole(sim.creation)?button('context','Choose refuge · E',null,'secondary-button'):''}${sim.creation.home?button('creation-route','Find my refuge',null,'text-button'):''}${button('creations','My creations',null,'text-button')}</aside>`;if(sim.residentFocus)return residentJourneyHTML();const a=ADVENTURES[sim.player.species.id];if(!a)return '';const state=sim.adventure;return `<aside class="adventure-note" aria-label="Species adventure">${state.visible?`<div class="adventure-heading"><strong>${escape(a.name)}</strong><button data-action="adventure-toggle" aria-label="Hide adventure">×</button></div><p id="adventure-step">${escape(adventureInstruction(sim))}</p>${a.action?`<button class="secondary-button" data-action="context"><span id="context-label">${contextLabel(sim)}</span> <kbd>E</kbd></button>`:'<small>'+(['s5','s15'].includes(sim.player.species.id)?'Revisit patches at your own pace.':'Keep steering freely; your companions follow their own paths.')+'</small>'}`:`<button class="secondary-button" data-action="adventure-toggle">${state.complete?'Your species discovery':'Try this adventure'}</button>${a.action?`<button class="secondary-button" data-action="context"><span id="context-label">${contextLabel(sim)}</span> <kbd>E</kbd></button>`:''}`}${['s41','s53'].includes(sim.player.species.id)?'<button class="text-button" data-action="escort-new" hidden>Choose another neighbor</button>':''}${activityNarration[sim.player.species.id]?'<button class="text-button activity-listen" data-action="activity-help">Hear this activity</button>':''}</aside>`;}
function adventurePreview(s){const a=ADVENTURES[s.id];return a?`<div class="adventure-preview"><h4>${escape(a.name)}</h4><p>${escape(a.description)}</p><small>Optional species adventure · You can explore freely at any time.</small></div>`:'';}
function narrationHTML(s){const n=narrationCatalog[s.id];return n?`<section class="guide-narration"><button class="secondary-button" data-action="narration">${icon('sound')}<span id="narration-label">Play introduction</span></button><small id="narration-status">AI-generated voice · Plays only when you choose</small><p>${escape(n.text)}</p></section>`:'';}
function activityHelpHTML(){return panel(JOURNEYS[selection]?.name||'Your species activity',`<p class="subtle">${escape(SPECIES.find(s=>s.id===selection)?.name||'')} · Your reef is paused while you listen.</p><section class="guide-narration"><button class="secondary-button" data-action="narration">${icon('sound')}<span id="narration-label">Play activity</span></button><small id="narration-status" role="status">AI-generated voice · Plays only when you choose</small><p>${escape(activityNarration[selection]||'Use the activity card for the next step.')}</p></section>`,button('close','Return to the reef',null,'primary-button'),true);}
function gameHTML(){
 const p=sim.player;
 const diet=dietText(p.species);
 return `<header class="topbar"><div class="brand">${button(sim.trial?'trial-exit':'home',sim.trial?'Change my fish':'Atoll','home')}</div><span class="scene-name">${sim.trial?'Test swim · Nothing is saved':escape(REEFS[sim.current].name)}</span><nav class="actions" aria-label="Dive menu">${button('cleaner','Visit cleaner','fish')}${button('guide','Field guide','book')}${sim.trial?button('trial-reset','Reset test','play'):button('saves','Save / load','save')}${button('settings','Settings','gear')}${fullscreenButton()}${button('pause',sim.paused?'Resume':'Pause',sim.paused?'play':'pause')}</nav></header><div class="hud"><div class="fish-identity"><canvas id="hud-fish" width="160" height="110"></canvas><div><strong>${escape(p.species.name)}</strong><small>${escape(sim.mode==='create'?'Created fish':sim.mode.charAt(0).toUpperCase()+sim.mode.slice(1))} ${['challenge','tournament'].includes(sim.mode)?`· ${sim.stage+1}/${sim.sequence.length}`:''}</small><small class="diet-reminder"><span>Diet:</span> ${escape(diet)}</small></div></div><div class="meters">${meter('Energy',p.energy)}${meter('Health',p.health)}</div><div class="map-block"><button class="map-trigger" data-action="reef-map" aria-label="Open reef map: ${escape(REEFS[sim.current].name)}, ${new Set(sim.visited).size} of 9 habitats visited"><span class="mini-map" aria-hidden="true">${REEFS.map(r=>`<span class="${r.id===sim.current?'active':sim.visited.includes(r.id)?'visited':''}"></span>`).join('')}</span><small>Map</small></button><div class="period-icon" title="${sim.period==='day'?'Day reef':'Night reef'}">${icon(sim.period==='day'?'sun':'moon')}</div></div><div class="score"><strong id="score">${sim.mode==='practice'?'Explore':Math.floor(sim.score).toLocaleString()}</strong><small id="goal-label">${['challenge','tournament'].includes(sim.mode)?`${Math.max(0,Math.ceil(sim.required-sim.stageScore)).toLocaleString()} to next life`:sim.mode==='practice'?'No score pressure':'Survival points'}</small></div><div class="hud-actions">${abilityHTML(p)}<button class="tool-button primary" data-action="inspect">${icon(sim.paused?'play':'info')}${sim.paused?'Continue':'Inspect'}<kbd>Esc</kbd></button></div></div>${adventureHTML()}${settings.hints?'<div class="controls-hint">'+(p.species.ability==='clean'?'Click a fish to help · E finds a client · Move to stop':'Move to swim · Esc to observe · Click food to try a meal')+'</div>':''}<div id="state-badge" class="state-badge" aria-live="polite" aria-atomic="true" ${sim.protected?'':'hidden'}>${escape(PROTECTION_HINT)}</div>${inspected&&sim.paused&&!modal?inspectHTML(inspected):''}`;
}
function meter(label,value){const v=Math.max(0,Math.min(100,value));return `<div class="meter-row"><span>${label}</span><div class="meter" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v)}"><i id="${label.toLowerCase()}-fill" class="${v<25?'danger':v<50?'warn':''}" style="width:${v}%"></i></div><span id="${label.toLowerCase()}-value">${Math.round(v)}</span></div>`;}
function panel(title,body,footer='',small=false,subtitle=''){return `<div class="overlay"><section class="panel ${small?'small':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="panel-header"><div><h2 id="dialog-title">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="close" data-action="close" aria-label="Close dialog">×</button></header><div class="panel-body">${body}</div>${footer?`<footer class="panel-footer">${footer}</footer>`:''}</section></div>`;}
function naturalHistoryHTML(s){
 const n=NATURAL_HISTORY[s.id];if(!n)return '';
 return `<details class="natural-history"><summary>Natural history · <i>${escape(n.scientific)}</i></summary><div class="natural-history-body"><p class="subtle">${escape(n.family)}${n.length?' · '+escape(lengthSummary(n.length,settings.metric)):''}</p>${n.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}<h4>Look and compare</h4><p>${escape(n.question)}</p><h4>In this game</h4><p>${escape(n.limit)}</p><details class="history-source"><summary>Source: ${escape(n.source)}</summary><p class="source-url">${escape(n.url)}</p></details></div></details>`;
}
function speciesInfo(s){return `<div class="portrait-stage"><canvas class="species-portrait" data-species="${s.id}" width="640" height="270"></canvas></div><h3>${escape(s.name)}</h3>${modal==='guide'?narrationHTML(s)+naturalHistoryHTML(s):modal==='practice'?adventurePreview(s):''}<p>${escape(s.description)}</p><dl class="facts"><dt>Diet</dt><dd>${s.diet.map(f=>escape(FOODS[f]?.name||f)).join(', ')}</dd><dt>Active</dt><dd>${s.active==='both'?'Day & night':s.active==='night'?'Nighttime':'Daytime'}</dd><dt>Home</dt><dd>${({open:'Open water',school:'Water above the reef',reef:'Coral and ledges',sand:'Sandy bottom'})[s.habitat]}</dd><dt>Ability</dt><dd>${escape(ABILITIES[s.ability]?.name||'None')}${ABILITIES[s.ability]?.passive?' · Always active':''}</dd><dt>Observe</dt><dd>${s.ability==='clean'?'Watch a cleaning interaction. How does each animal benefit?':s.diet.includes('fish')?'Watch a feeding trip, then the quieter period after a meal.':s.diet.includes('algae')||s.diet.includes('grass')?'Watch where this animal grazes. Compare its food with a hunter’s diet.':'Look for small food sources. Compare this animal’s activity by day and night.'}</dd></dl>`;}
function speciesBrowser(list,selectId=selection){const filtered=list.filter(s=>(s.name+' '+(NATURAL_HISTORY[s.id]?.scientific||'')).toLowerCase().includes(search.toLowerCase()));const s=BY_ID[selectId]||list[0];return `<div class="species-layout"><div class="species-browser"><input id="species-search" class="search" type="search" aria-label="Search creatures" placeholder="Find a reef dweller…" value="${escape(search)}"><div class="species-list" role="listbox" aria-label="Reef creatures">${filtered.length?filtered.map(s=>`<button class="species-item ${s.id===selectId?'selected':''}" role="option" aria-selected="${s.id===selectId}" data-species="${s.id}">${escape(s.name)}<small>${s.active==='both'?'Day & night':s.active==='night'?'Night':'Day'} · ${escape(ABILITIES[s.ability]?.name||'None')}${s.ability==='clean'?' · Practice care role':!s.playable?' · Reef resident':''}</small></button>`).join(''):'<p class="subtle">No matching creatures.</p>'}</div></div><div class="species-detail">${speciesInfo(s)}</div></div>`;}
function modalHTML(){
 if(modal==='activity')return activityHelpHTML();
 if(modal==='journal')return journalHTML();
 if(modal==='reef-map')return reefMapHTML();
 if(modal==='practice')return panel('Choose your next life',speciesBrowser(PRACTICE_SPECIES),`<span class="subtle">${PRACTICE_SPECIES.length} Practice lives · Your dive begins in its preferred habitat</span><div class="two-buttons">${ADVENTURES[selection]?button('begin-adventure','Try adventure','fish','primary-button'):''}${button('begin-practice',ADVENTURES[selection]?'Explore freely':'Enter the reef','arrow',ADVENTURES[selection]?'secondary-button':'primary-button')}</div>`);
 if(modal==='challenge'||modal==='tournament')return journeyHTML();
 if(modal==='guide')return panel('The Atoll field guide',`<div class="tabs"><button data-action="journal">Family journal</button><button data-action="guide-species" class="${guideTab==='species'?'active':''}">Creatures</button><button data-action="guide-food" class="${guideTab==='food'?'active':''}">Food & habitats</button><button data-action="guide-glossary" class="${guideTab==='glossary'?'active':''}">Glossary</button><button data-action="guide-web" class="${guideTab==='web'?'active':''}">Food web</button><button data-action="guide-life" class="${guideTab==='life'?'active':''}">Reef life</button><button data-action="guide-notes" class="${guideTab==='notes'?'active':''}">Field notes</button></div>${guideTab==='web'?foodWebHTML():guideTab==='life'?reefLifeHTML():guideTab==='notes'?fieldNotesHTML():guideTab==='species'?speciesBrowser(SPECIES):guideTab==='food'?`<dl class="glossary">${Object.entries(FOODS).map(([id,f])=>`<div><dt>${f.name}</dt><dd>${f.description}</dd></div>`).join('')}<div><dt>Shelter</dt><dd>Stop in a cave or plant cluster. Small fish become hidden after a short still moment. Inspect mode marks the hiding spots.</dd></div><div><dt>Cleaners</dt><dd>Wait beside a bluestreak cleaner wrasse by day or a banded coral shrimp by night. Click a cleaner or choose Visit cleaner to request parasite removal. Move the mouse to leave.</dd></div></dl>`:`<dl class="glossary">${Object.entries(GLOSSARY).map(([k,v])=>`<div><dt>${k.replace('_',' ')}</dt><dd>${v}</dd></div>`).join('')}</dl>`}`,`<span class="subtle">An illustrated game guide. Sizes, diets and abilities include gameplay abstractions.</span>${button('close','Return',null,'primary-button')}`);
 if(modal==='create')return createHTML();
 if(modal==='creations')return creationShelf(creationRecords,creationHelpers,creationError);
 if(modal==='custom-guide')return customGuide(sim,creationHelpers);
 if(modal==='creation-rename')return panel('Rename your fish',`<label class="field">Name<input id="rename-creation" maxlength="36" value="${escape(creationRecords.find(r=>r.id===renameId)?.creation.blueprint.name)}"></label>`,button('creations','Cancel',null,'secondary-button')+button('rename-save','Save name',null,'primary-button'),true);
 if(modal==='settings')return panel('Make yourself at home',`<div class="settings-grid"><div><h3>Display</h3><p class="subtle">Windows starts fullscreen. F11 switches to a window; Escape still pauses your dive.</p>${fullscreenButton('secondary-button')}</div><label class="toggle-row"><input type="checkbox" data-setting="sound" ${settings.sound?'checked':''}>Enable audio</label>${rangeSetting('musicVolume','Music volume',settings.musicVolume)}${rangeSetting('effectsVolume','Sound effects',settings.effectsVolume)}${rangeSetting('narrationVolume','Narration volume',settings.narrationVolume)}<label class="toggle-row"><input type="checkbox" data-setting="verbose" ${settings.verbose?'checked':''}>Pause for feeding messages</label><label class="toggle-row"><input type="checkbox" data-setting="hints" ${settings.hints?'checked':''}>Show control reminders</label><label class="toggle-row"><input type="checkbox" data-setting="foodHints" ${settings.foodHints?'checked':''}>Highlight nearby suitable food (H)</label><p class="subtle">Marks up to three nearby meals that suit your fish. Click to approach; hints do not feed for you.</p><label class="toggle-row"><input type="checkbox" data-setting="metric" ${settings.metric?'checked':''}>Metric length summaries (cm / m)</label><p class="subtle">Switch off for inches and feet. Natural-history paragraphs keep their source wording.</p><label class="toggle-row"><input type="checkbox" data-setting="reducedMotion" ${settings.reducedMotion?'checked':''}>Reduce decorative motion</label></div>`,`${button('help','Controls & exploration','info','secondary-button')}${button('close','Done',null,'primary-button')}`,true);
 if(modal==='saves')return savesHTML();
 if(modal==='import-dive')return panel('Open this dive?',`<h3>${escape(importedDive.name)}</h3><p>${escape(importedDive.simulation.player.species.name)} · ${escape(importedDive.simulation.mode)} · ${escape(REEFS[importedDive.simulation.current].name)}</p><p>This becomes your last dive. Your three other saved slots stay available.</p>`,`${button('cancel-import','Back',null,'secondary-button')}${button('open-import','Open dive','arrow','primary-button')}`,true);
 if(modal==='scores'){const scores=read('atoll-scores',[]);return panel('Reef rulers',scores.length?`<div class="save-list">${scores.slice(0,10).map((s,i)=>`<div class="save-row"><div><strong>${i+1}. ${escape(s.name)}</strong><small>${escape(s.mode)} · ${escape(s.species)}</small></div><strong>${Math.floor(s.score).toLocaleString()}</strong></div>`).join('')}</div>`:'<div class="ending"><h3>The reef is waiting.</h3><p>Finish a Challenge or Tournament, or record a survival run, to leave your name here.</p></div>',button('close','Return',null,'primary-button'),true);}
 if(modal==='help')return panel('A small guide to exploring the reef',`<div class="help-grid">${[['Swim','Move the mouse inside the reef. Your fish follows at its own speed. Move to an edge to enter a neighboring habitat. The reef wraps horizontally. Open Map or press M to see the habitats and plan a swim.'],['Find a meal','Click an organism to approach and bite it. Check your diet: coral, plants, shellfish and small fish suit different mouths. Wrong food wastes energy; poison harms health. Press H or enable food highlights in Settings to mark up to three nearby suitable meals. Press H again to turn them off.'],['Hide','Stop in a marked hiding area. Small fish disappear after a moment. Move to leave cover. Press Escape to see shelter locations.'],['Cleaning and recovery','Cleaners remove parasites, not poison or bite injuries. Click a cleaner, choose Visit cleaner, or press C. Your fish swims over and waits its turn. Health rises as parasites are removed; move the mouse to leave. After an injury or poisonous meal, keep Energy at 50 or more for gradual recovery. These recovery timings are game rules. Hover over Health for a breakdown.'],['Use your ability','Press Space or the ability button. Active abilities cost energy and need twelve seconds to recover. Crushing jaws work whenever you eat, with no activation cost. Some defensive species can survive an attack that others cannot.'],['Observe and compare','Escape pauses for inspection. Click any organism to read about its diet and current activity and record a field note. Compare the same habitat as a different fish. P pauses; F opens the field guide; Ctrl+S saves your last dive; F11 toggles fullscreen.'],['Scoring','Meals earn 500 points for renewable food or 1,000 for a whole creature. Surviving outside shelter adds points. Poisonous meals subtract up to 500 points from your score and current-life progress, stopping at zero. Practice has no score target.'],['Original music','Glasswater accompanies the day reef; Moon Through Water accompanies night; Blue Passage plays on the title screen. Adjust music and effects separately.']].map(([h,p])=>`<div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>`,button('close','Ready to dive','arrow','primary-button'));
 if(modal==='advance'){const next=BY_ID[sim.sequence[sim.stage+1]];return panel('Another life awaits',`<p>You survived as a ${escape(sim.player.species.name)}. Your journey continues.</p><div class="species-detail">${speciesInfo(next)}</div>`,`${button('saves','Save progress','save','secondary-button')}${button('next-stage','Become '+escape(next.name),'arrow','primary-button')}`);}
 if(modal==='dead'||modal==='won')return endingHTML();
 if(modal==='message')return panel('On the reef',`<p>${escape(toast)}</p>`,button('close','Continue',null,'primary-button'),true);
 return '';
}
function savesHTML(){
 const current=sim?`<div class="save-current"><label class="field">Dive name<input id="dive-name" maxlength="60" value="${escape(activeDiveName)}" placeholder="My reef dive"></label>${button('export-dive','Export dive file','save','secondary-button')}</div>`:'';
 const files=`<div class="save-files">${button('choose-dive-file','Import dive file',null,'secondary-button')}<input id="dive-file" type="file" accept=".atoll,application/json" hidden><p class="subtle">Keep an exported .atoll file to open this dive in another Windows build or on another computer.</p></div>`;
 const slots=[0,1,2,3].map(i=>{const s=read('atoll-save-'+i,null);return `<div class="save-row"><div><strong>${s?.name?escape(s.name):i===0?'Last dive':'Dive slot '+i}</strong><small>${s?`${i===0?'Last dive':'Slot '+i} · ${escape(s.species)} · ${escape(s.mode)} · ${new Date(s.date).toLocaleString()}`:'Empty slot'}</small></div><div class="two-buttons">${sim&&i>0?button('save-'+i,'Save here',null,'secondary-button'):''}${s?button('load-'+i,'Load dive',null,'primary-button'):''}</div></div>`;}).join('');
 return panel('Your saved dives',`${current}${files}<div class="save-list">${slots}</div>`,`<span class="subtle">Slots stay on this device. Ctrl+S updates your last dive.</span>${button('close','Done',null,'secondary-button')}`);
}
function journeyHTML(){
 const tournament=modal==='tournament',seq=pending.sequence.map(id=>BY_ID[id]);
 const roster=tournament?`<section class="journey-roster"><h3 id="journey-order">Your ${seq.length} lives, in order</h3><div class="journey-scroll" tabindex="0" role="region" aria-labelledby="journey-order"><ol>${seq.map((s,i)=>`<li${i===0?' aria-current="step"':''}>${escape(s.name)}${i===0?'<small>First life</small>':''}</li>`).join('')}</ol></div></section>`:`<div class="sequence">${seq.map(s=>`<span>${escape(s.name)}</span>`).join('')}</div>`;
 return panel(tournament?'The long swim':'Four lives on the reef',`<div class="${tournament?'journey-layout':'challenge-preview'}">${roster}<div class="species-detail">${speciesInfo(seq[0])}</div></div><div class="notice">${tournament?'Earn 5,000 points in each life to move through the complete playable roster.':'Earn 5,000 points in your first life. Each next stage needs 5,000 more than the previous one.'} You earn points for food and survival. Each completed life adds a 1,500-point bonus.</div>`,`${button('close','Back',null,'secondary-button')}${button('begin-sequence','Begin the journey','arrow','primary-button')}`);
}
function rangeSetting(key,label,v){return `<label class="field"><span class="range-label"><span>${label}</span><span id="setting-${key}">${Math.round(v*100)}%</span></span><input aria-label="${label}" type="range" min="0" max="1" step=".01" value="${v}" data-setting="${key}"></label>`;}
function createHTML(){return creationEditor(config,creationHelpers);}

function endingHTML(){const won=modal==='won';return panel(won?'A place among reef rulers':'The reef carries on',`<div class="ending"><h2>${won?'A life well lived.':'Every life teaches.'}</h2><p>${escape(won?'You completed your journey through the reef.':sim.deathReason||'Your journey has ended.')}</p><div class="big-score">${Math.floor(sim.score).toLocaleString()}</div><p class="subtle">${sim.visited.length} habitats explored · ${Math.floor(sim.time/60)}m ${Math.floor(sim.time%60)}s on the reef</p>${sim.mode!=='practice'?'<label class="field" style="margin-top:20px;text-align:left">Your name on the reef<input id="ruler-name" maxlength="30" placeholder="Reef explorer"></label>':''}</div>`,`<div class="two-buttons">${button('finish-home','Return home',null,'secondary-button')}${!won?button('retry',sim.mode==='tournament'?'Continue · surrender score':'Try this life again','play','primary-button'):''}</div>`,true);}
function inspectHTML(e){const s=e.species,f=FOODS[e.food];return `<aside class="inspect-card">${s?`<canvas class="species-portrait inspect-portrait" data-species="${s.id}" width="560" height="280" role="img" aria-label="Close-up illustration of ${escape(s.name)}"></canvas>`:''}<h3>${escape(s?.name||f?.name||'Reef dweller')}</h3><p>${escape(s?.description||f?.description||'')}</p><p>${escape(sim.relationship(e))}</p><p class="subtle">Observation saved in Field guide → Field notes. The reef is paused while you look.</p>${s?`<dl class="facts"><dt>Activity</dt><dd>${escape(e.behavior||'Resting')}</dd><dt>Diet</dt><dd>${s.diet.join(', ')}</dd></dl>${button('guide-current','Field guide entry','book','secondary-button')}`:''}</aside>`;}
function foodWebHTML(){
 const fish=BY_ID[selection]||sim?.player.species||SPECIES[1],web=foodWeb(fish);
 const links=list=>list.map(s=>`<button class="web-link" data-action="web-${s.id}">${escape(s.name)}${icon('arrow')}</button>`).join('');
 return `<p class="web-intro">Follow food energy from food to eater. Select a creature to explore its connections.</p><div class="food-web" aria-label="Food sources, selected creature, and potential predators"><section><h3>Food sources</h3><div class="web-list">${web.resources.map(f=>`<span class="web-resource">${escape(f.name)}</span>`).join('')}${web.special.map(f=>`<span class="web-resource">${escape(f)}</span>`).join('')}${links(web.prey)||(!web.resources.length&&!web.special.length?'<p class="subtle">No listed food sources.</p>':'')}</div></section><div class="web-arrow" aria-label="is eaten by">${icon('arrow')}</div><section class="web-center"><label class="field">Explore a creature<select id="web-species">${SPECIES.map(s=>`<option value="${s.id}" ${s.id===fish.id?'selected':''}>${escape(s.name)}</option>`).join('')}</select></label><canvas class="species-portrait" data-species="${fish.id}" width="500" height="250"></canvas><h3>${escape(fish.name)}</h3><p>${escape(fish.description)}</p></section><div class="web-arrow" aria-label="is eaten by">${icon('arrow')}</div><section><h3>Potential predators</h3><div class="web-list">${links(web.predators)||'<p class="subtle">None under this model’s diet and size rules.</p>'}</div></section></div><p class="subtle web-limit">This is the game’s food web, calculated from diet, size and armor rules. A connection is a possible meal, not a constant chase. Defenses and active periods also affect encounters.</p>`;
}
function reefLifeHTML(){return `<div class="reef-lessons">${REEF_LESSONS.map((lesson,i)=>`<details ${i===0?'open':''}><summary>${escape(lesson.title)}</summary><div class="lesson-body"><p>${escape(lesson.body)}</p><p>${escape(lesson.detail)}</p><h3>Look, compare, wonder</h3><p>${escape(lesson.question)}</p><h3>In this game</h3><p>${escape(lesson.model)}</p><p class="subtle">Source: ${escape(lesson.source)}<br><span class="source-url">${escape(lesson.url)}</span></p></div></details>`).join('')}</div>`;}
function fieldNotesHTML(){
 const notes=sim?.observations||[];
 return notes.length?`<p class="subtle">Observations from this dive, saved with your fish. These describe the game’s ecological model.</p><dl class="glossary">${[...notes].reverse().map(n=>`<div><dt>${escape(n.name)}</dt><dd>${escape(REEFS[n.habitat]?.name)} · ${escape(n.period)} · ${escape(n.behavior)}<br>${escape(n.relationship)}</dd></div>`).join('')}</dl>`:`<div class="ending"><h3>Look closely. There is a lot to notice.</h3><p>Enter the reef, press Escape, then click a plant or animal. Its activity and relationship to your fish will be recorded here.</p><p>Try comparing a grazer and a hunter, or visiting the same habitat by day and night.</p></div>`;
}
function paintPortraits(){if(!renderer.ready)return;document.querySelectorAll('.species-portrait').forEach(c=>{const s=BY_ID[c.dataset.species];if(s)renderer.portrait(c,s);});if($('#custom-portrait'))renderer.portrait($('#custom-portrait'),createSpecies(config));}
function openModal(name){focusBefore=document.activeElement;if(name!=='message'){toast='';toastUntil=0;}if(sim)sim.paused=true;modal=name;renderer.inspect=false;renderer.hover=null;inspected=null;drawUI();requestAnimationFrame(()=>{const target=$('.panel input:not([hidden])')||$('.panel button');target?.focus();});}
function closeModal(){modal=null;if(sim&&!home){if(sim.phase==='advance'){modal='advance';}else if(sim.phase==='dead'){modal='dead';}else if(sim.phase==='won'){modal='won';}else{sim.paused=false;renderer.inspect=false;}}drawUI();canvas.focus({preventScroll:true});}
function enter(s,name){sim=s;careKind='';wellUntil=0;checkpointClock=0;progress('habitat',s.current);activeDiveName=diveName(name||s.player.species.name+' dive');home=false;modal=null;sim.paused=false;inspected=null;renderer.inspect=false;audio.setTrack(sim.period==='night'?'moon-through-water':'glasswater');drawUI();canvas.focus();saveSlot(0,false);}
function resumeDive(restored,name){enter(restored,name);if(['advance','dead','won'].includes(restored.phase))openModal(restored.phase);notify('Welcome back to the reef.');}
function saveSlot(slot,announce=true){if(!sim||sim.trial)return false;if(sim.creation)persistCreation(sim);const success=write('atoll-save-'+slot,{name:diveName(activeDiveName),date:Date.now(),species:sim.player.species.name,mode:sim.mode,state:sim.serialize()});if(success&&announce){audio.effect('save');notify('Dive saved.');}return success;}
function recordScore(){if(!sim||sim.trial||sim.mode==='practice'||sim.recorded)return;const name=$('#ruler-name')?.value.trim()||'Reef explorer';const scores=read('atoll-scores',[]);scores.push({name,score:sim.score,mode:sim.mode,species:sim.player.species.name,date:Date.now()});scores.sort((a,b)=>b.score-a.score);if(write('atoll-scores',scores.slice(0,30)))sim.recorded=true;}
function closeSplashMenus(){for(const menu of document.querySelectorAll('.splash-menu[open]'))menu.open=false;}
ui.addEventListener('toggle',e=>{if(e.target.matches('.splash-menu')&&e.target.open)for(const other of document.querySelectorAll('.splash-menu[open]'))if(other!==e.target)other.open=false;},true);
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.splash-menu'))closeSplashMenus();});
ui.addEventListener('keydown',e=>{
 const tile=e.target.closest('.reef-map-tile');
 if(tile&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
  e.preventDefault();const id=Number(tile.dataset.reef),dx=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,dy=e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0;
  const row=Math.max(0,Math.min(2,Math.floor(id/3)+dy)),col=(id%3+dx+3)%3;
  document.querySelector('.reef-map-tile[data-reef="'+(row*3+col)+'"]')?.focus();return;
 }
 const menu=e.target.closest('.splash-menu');if(!menu)return;
 const summary=menu.querySelector('summary'),buttons=[...menu.querySelectorAll('button')];
 if(e.key==='Escape'){e.preventDefault();menu.open=false;summary.focus();}
 else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();menu.open=true;const i=buttons.indexOf(document.activeElement),next=i<0?(e.key==='ArrowDown'?0:buttons.length-1):(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();}
 else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const menus=[...document.querySelectorAll('.splash-menu')],i=menus.indexOf(menu),next=menus[(i+(e.key==='ArrowRight'?1:-1)+menus.length)%menus.length];closeSplashMenus();next.open=true;next.querySelector('summary').focus();}
});
ui.addEventListener('click',async event=>{
 audio.unlock();
 const specie=event.target.closest('button[data-species]');if(specie){selection=specie.dataset.species;const listScroll=$('.species-list')?.scrollTop||0;drawUI();if($('.species-list'))$('.species-list').scrollTop=listScroll;document.querySelector('button[data-species="'+selection+'"]')?.focus({preventScroll:true});audio.effect('ui');return;}
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action;audio.effect('ui');
 if(await creationAction(action,el))return;
 if(action.startsWith('mode-')){search='';const mode=action.slice(5);if(mode==='challenge'||mode==='tournament'){pending=new Simulation(Date.now());pending.start(mode);}openModal(mode);}
 else if(action.startsWith('web-')){selection=action.slice(4);drawUI();$('#web-species')?.focus();}
 else if(action==='begin-practice'||action==='begin-adventure'){const s=new Simulation(Date.now());s.start('practice',selection);s.adventure.visible=action==='begin-adventure';enter(s);}
 else if(action==='begin-sequence'){enter(pending);pending=null;}
 else if(action==='begin-create'){if(createSpecies(config).cost>1600||abilityIssue(config))return;const next=new Simulation(Date.now());next.start('create','custom',blueprint(config));next.creation.parentId=draftParent;next.adventure.visible=true;enter(next);}
 else if(action==='reef-map'){mapSelection=sim.destination??sim.current;openModal('reef-map');}
 else if(action==='map-select'){mapSelection=Number(el.dataset.reef);drawUI();document.querySelector('.reef-map-tile[data-reef="'+mapSelection+'"]')?.focus({preventScroll:true});}
 else if(action==='map-route'){if(sim.setDestination(mapSelection)){closeModal();updateHUD();}}
 else if(action==='map-clear'){sim.setDestination(null);drawUI();$('.reef-map-tile[data-reef="'+mapSelection+'"]')?.focus();}
 else if(action==='fullscreen'){toggleFullscreen().catch(()=>notify('Fullscreen could not change. Try F11 in the Windows app.'));}
 else if(action==='close')closeModal();
 else if(action==='resume'){home=false;modal=null;sim.paused=false;audio.setTrack(sim.period==='night'?'moon-through-water':'glasswater');drawUI();}
 else if(action==='home'){toast='';saveSlot(0,false);sim.paused=true;home=true;modal=null;titleRewards();audio.setTrack('blue-passage');drawUI();}
 else if(['guide','journal','saves','settings','help','scores'].includes(action)){if(action==='guide'){if(sim?.creation&&!home){openModal('custom-guide');return;}selection=sim?.player.species.id||selection;guideTab='species';search='';}openModal(action);}
 else if(action.startsWith('guide-')&&action!=='guide-current'){guideTab=action.slice(6);search='';drawUI();document.querySelector('[data-action="'+action+'"]')?.focus();}
 else if(action==='guide-current'){selection=inspected?.species?.id||selection;guideTab='species';search='';openModal('guide');}
 else if(action==='pause'||action==='inspect'){sim.paused=!sim.paused;renderer.inspect=sim.paused;inspected=null;drawUI();}
 else if(action==='adventure-toggle'){sim.adventure.visible=!sim.adventure.visible;drawUI();}
 else if(action==='context'){sim.useContext();canvas.focus();}
 else if(action==='resident-close'){sim.residentFocus=null;drawUI();}
 else if(action==='resident-resume'){sim.paused=false;renderer.inspect=false;inspected=null;drawUI();canvas.focus();}
 else if(action==='resident-again'){const e=watchedResident(sim);if(e)beginResidentObservation(sim,e,true);drawUI();}
 else if(action==='resident-help'){selection=sim.residentFocus;openModal('activity');audio.playNarration('activities/'+selection);}
 else if(action==='escort-new'){forgetEscort(sim);canvas.focus();}
 else if(action==='activity-help'){selection=sim.player.species.id;openModal('activity');audio.playNarration('activities/'+selection);}
 else if(action==='narration'){const id=modal==='activity'?'activities/'+selection:selection;if(audio.narrationId===id)audio.stopNarration();else audio.playNarration(id);}
 else if(action==='ability'){sim.useAbility();}
 else if(action==='cleaner'){if(sim.paused){sim.paused=false;renderer.inspect=false;inspected=null;drawUI();}sim.requestCleaning();canvas.focus();}
 else if(action.startsWith('save-')){saveSlot(Number(action.slice(5)));drawUI();}
 else if(action.startsWith('load-')){try{const data=read('atoll-save-'+action.slice(5),null);resumeDive(Simulation.restore(data?.state),data?.name);}catch(err){notify('Unable to load this dive. '+err.message+' Choose a different saved dive.');}}
 else if(action==='export-dive'&&sim){
  const url=URL.createObjectURL(new Blob([exportDive(sim,activeDiveName)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=diveFilename(activeDiveName);document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('Dive file export started. Keep the .atoll file with your saved games.');
 }
 else if(action==='enable-sound')audio.unlock();
 else if(action==='journal-backup')downloadJournal();
 else if(action==='journal-restore')$('#journal-file').click();
 else if(action==='choose-dive-file')$('#dive-file').click();
 else if(action==='cancel-import'){importedDive=null;openModal('saves');}
 else if(action==='open-import'&&importedDive){const dive=importedDive;try{await resolveImportedCreation(dive.simulation);importedDive=null;resumeDive(dive.simulation,dive.name);}catch(err){notify('Import could not be kept: '+err.message);}}
 else if(action==='next-stage'){sim.next();modal=null;audio.setTrack(sim.period==='night'?'moon-through-water':'glasswater');drawUI();saveSlot(0,false);}
 else if(action==='retry'){recordScore();sim.continueRun();sim.recorded=false;modal=null;drawUI();saveSlot(0,false);}
 else if(action==='finish-home'){recordScore();saveSlot(0,false);sim=null;home=true;modal=null;titleRewards();audio.setTrack('blue-passage');drawUI();}
});
ui.addEventListener('input',e=>{
 const el=e.target;
 if(el.id==='dive-name'){activeDiveName=el.value;return;}
 if(el.id==='web-species'){selection=el.value;drawUI();$('#web-species')?.focus();return;}
 if(el.id==='species-search'){search=el.value;const caret=el.selectionStart;drawUI();const input=$('#species-search');input.focus();try{input.setSelectionRange(caret,caret);}catch{}return;}
 if(el.dataset.setting){const k=el.dataset.setting;settings[k]=el.type==='checkbox'?el.checked:Number(el.value);audio.update(settings);renderer.reducedMotion=settings.reducedMotion;renderer.foodHints=settings.foodHints;write('atoll-settings',settings);const label=$('#setting-'+k);if(label)label.textContent=Math.round(settings[k]*100)+'%';return;}
 if(el.dataset.config){const k=el.dataset.config;config[k]=['size','speed','endurance','agility','bodyLength','bodyDepth'].includes(k)?Number(el.value):el.value;config.appearanceVersion=1;updateCreationFields();}

});
ui.addEventListener('change',async e=>{
 const input=e.target;
 if(input.id==='journal-file'){
  const file=input.files?.[0];if(!file)return;
  try{if(file.size>100000)throw new Error('Choose a family journal file under 100 KB.');const incoming=validateJournal(JSON.parse(await file.text()));if(!input.isConnected)return;journal=mergeJournals(journal,incoming);const saved=saveJournal();drawUI();notify(saved?'Journal restored. Existing discoveries have been kept.':'Journal merged in memory. Back up now: device storage is unavailable.');}catch{notify('This journal could not be restored. Choose a valid Atoll family journal backup.');input.value='';}return;
 }
 if(input.id!=='dive-file')return;
 const file=input.files?.[0];if(!file)return;
 try{
  if(file.size>MAX_SAVE_BYTES)throw new Error('This file is too large. Choose an Atoll dive file under 8 MB.');
  const text=await file.text();if(!input.isConnected||modal!=='saves')return;
  importedDive=importDive(text);openModal('import-dive');
 }catch(err){if(input.isConnected){input.value='';notify(err.message);$('[data-action="choose-dive-file"]')?.focus();}}
});
function pointer(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*1600,y:(e.clientY-r.top)/r.height*900-55};}
canvas.addEventListener('pointerleave',()=>renderer.titleReef.leave());
canvas.addEventListener('pointermove',e=>{if(home&&!modal){const p=pointer(e);renderer.titleReef.move(p.x,p.y+55);return;}if(home||modal||!sim)return;const p=pointer(e);if(!sim.paused){if(sim.adventure.watchJourney?.watching){aimWatch(sim,p.x,p.y);renderer.hover=sim.findAt(p.x,p.y);}else if(sim.player.ambush){aimAmbush(sim,p.x,p.y);renderer.hover=sim.findAt(p.x,p.y);}else{sim.point(p.x,p.y);renderer.hover=null;}}else renderer.hover=sim.findAt(p.x,p.y);});
canvas.addEventListener('pointerdown',e=>{audio.unlock();if(home&&!modal){const p=pointer(e);renderer.titleReef.click(p.x,p.y+55);return;}if(home||modal||!sim)return;const p=pointer(e);if(sim.paused){inspected=sim.findAt(p.x,p.y);sim.observe(inspected);drawUI();}else sim.eatAt(p.x,p.y);canvas.focus();});
document.addEventListener('keydown',e=>{
 if(e.key==='F11'&&window.atollDesktop){e.preventDefault();if(!e.repeat)toggleFullscreen().catch(()=>notify('Fullscreen could not change. Use the display control in Settings.'));return;}
 if(e.key==='Tab'&&modal){const nodes=[...document.querySelectorAll('.panel button:not(:disabled),.panel input,.panel select,.panel [tabindex="0"]')].filter(n=>n.offsetParent!==null);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}return;}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveSlot(0);return;}
 if(e.key==='Escape'){e.preventDefault();if(home&&!modal){closeSplashMenus();return;}if(modal){if(!['dead','won','advance'].includes(modal))closeModal();}else if(sim&&!home){sim.paused=!sim.paused;renderer.inspect=sim.paused;inspected=null;drawUI();}return;}
 if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
 if(e.key===' '&&!home&&!modal){e.preventDefault();audio.unlock();sim.useAbility();}
 if(e.key.toLowerCase()==='m'&&sim&&!home&&!modal&&sim.phase==='playing'){mapSelection=sim.destination??sim.current;openModal('reef-map');}
 if(e.key.toLowerCase()==='e'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&sim&&!home&&!modal&&!sim.paused){e.preventDefault();sim.useContext();}
 if(e.key.toLowerCase()==='c'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&sim&&!home&&!modal&&!sim.paused){e.preventDefault();sim.requestCleaning();}
 if(e.key.toLowerCase()==='h'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&sim&&!home&&!modal&&sim.phase==='playing'){e.preventDefault();settings.foodHints=!settings.foodHints;renderer.foodHints=settings.foodHints;write('atoll-settings',settings);notify(settings.foodHints?'Food hints on. Nearby suitable meals are marked; click one to approach.':'Food hints off.');}
 if(e.key.toLowerCase()==='f'&&!modal){if(sim?.creation&&!home){openModal('custom-guide');return;}selection=sim?.player.species.id||selection;openModal('guide');}
 if(e.key.toLowerCase()==='p'&&sim&&!home&&!modal){sim.paused=!sim.paused;renderer.inspect=sim.paused;drawUI();}
});
window.addEventListener('blur',()=>{if(sim&&!home&&!modal&&sim.phase==='playing'){sim.paused=true;renderer.inspect=true;drawUI();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&sim&&!sim.trial)saveSlot(0,false);});
window.addEventListener('beforeunload',()=>{if(sim)saveSlot(0,false);});
function updateHUD(){const step=$('#custom-step');if(step&&sim)step.textContent=customInstruction(sim);
 if(home||!sim)return;const residentStep=$('#resident-step');if(residentStep)residentStep.textContent=residentInstruction(sim);const again=$('[data-action="resident-again"]');if(again)again.hidden=!sim.residentJourneys?.[sim.residentFocus]?.complete;const newNeighbor=$('[data-action="escort-new"]');if(newNeighbor)newNeighbor.hidden=!sim.adventure.escortJourney;const p=sim.player;$('.adventure-note')?.classList.toggle('avoid-player',p.x<520&&p.y<330);const adventure=ADVENTURES[p.species.id];if(adventure){const el=$('#adventure-step');if(el)el.textContent=adventureInstruction(sim);const label=$('#context-label');if(label)label.textContent=contextLabel(sim);}
 for(const label of ['energy','health']){const v=Math.max(0,Math.min(100,p[label])),fill=$('#'+label+'-fill');if(fill){fill.style.width=v+'%';fill.className=v<25?'danger':v<50?'warn':'';fill.parentElement.setAttribute('aria-valuenow',Math.round(v));$('#'+label+'-value').textContent=Math.round(v);}}
 const healthMeter=$('#health-fill')?.parentElement;
 if(healthMeter){const h=healthState(p),explanation=`Health loss: ${Math.round(h.parasites)} from parasites, ${Math.round(h.injury)} from bites, ${Math.round(h.poison)} from poison. Cleaners remove parasites. Keep Energy at 50 or more to recover from other harm.`;healthMeter.title=explanation;healthMeter.setAttribute('aria-valuetext',Math.round(Math.max(0,p.health))+' of 100. '+explanation);}
 if($('#score'))$('#score').textContent=sim.mode==='practice'?'Explore':Math.floor(sim.score).toLocaleString();
 if($('#goal-label')&&['challenge','tournament'].includes(sim.mode))$('#goal-label').textContent=Math.max(0,Math.ceil(sim.required-sim.stageScore)).toLocaleString()+' to next life';
 if($('#ability-label'))$('#ability-label').textContent=!ABILITIES[p.species.ability].passive&&p.cooldown>0?Math.ceil(p.cooldown)+'s · '+ABILITIES[p.species.ability].name:ABILITIES[p.species.ability].name;
 const meal=sim.mealTarget;
 const leg=routeBetween(sim.current,sim.destination)[0];
 const care=careHint(p,careKind);if(care.kind==='well'&&careKind&&careKind!=='well')wellUntil=performance.now()+4000;careKind=care.kind;
 const message=sim.paused?'Inspection paused · Click a creature or press Esc to continue':sim.cleaningStatus?sim.cleaningStatus:p.hidden?'Hidden · Stay still to avoid being seen':meal?(p.feeding&&!p.feeding.committed?'Taking a bite of ':'Approaching ')+(meal.name||meal.species.name)+' · Move to steer away':leg?REEFS[sim.destination].name+' · Swim '+leg.direction+' to '+REEFS[leg.to].name:sim.protected?PROTECTION_HINT:shelterHint(REEFS[sim.current],p)||(settings.hints&&(care.kind!=='well'||performance.now()<wellUntil)?care.text:'');
 const hint=$('.controls-hint');if(hint)hint.hidden=!!message;
 const badge=$('#state-badge');if(badge){badge.hidden=!message;if(badge.textContent!==message)badge.textContent=message;}
 canvas.style.cursor=sim.paused?'help':p.hidden?'crosshair':'default';
}
function events(){for(const e of sim?.events.splice(0)||[]){
 if(sim.creation&&!sim.trial&&(e.creationChanged||['eat','hide','homecoming','progress','death'].includes(e.type)))persistCreation(sim);
 if(sim.trial&&['progress','discovery'].includes(e.type))continue;
 if(['pursuit-start','pursuit-release','homecoming'].includes(e.type)){renderer.addEffect('eat',e.x,e.y,e.type==='pursuit-start'?'Noticed you':e.type==='homecoming'?'Home again':({concealment:'Lost sight of you',fed:'Digesting',timeout:'Chase ended',threat:'Turned away',defense:'Defense worked',protection:'No longer pursuing',eligibility:'No longer pursuing'})[e.reason]||'Chase ended');audio.effect('bubble');notify(e.text);continue;}
 if(e.type==='discovery'){progress('discovery',e.value);audio.effect('ui',.45);notify(e.text);continue;}
 if(e.type==='sand'){renderer.addEffect('sand',e.x,e.y);audio.effect('bubble');notify(e.text);continue;}
 if(e.type==='progress'){progress(e.kind,e.value);continue;}
 if(e.type==='ability'){audio.effect(e.ability==='mimic'?'clean':e.ability==='poison'?'ink':e.ability,e.actor&&e.actor!=='player'?.35:1);renderer.addEffect(e.ability,e.x,e.y);if(!e.actor||e.actor==='player')notify(ABILITIES[e.ability].name);}
 else{if(['eat','hurt','clean'].includes(e.type))renderer.addEffect(e.type,e.x??sim.player.x,e.y??sim.player.y,e.type==='eat'&&e.energyGained>=1?'+'+Math.round(e.energyGained)+' energy':null);audio.effect(e.type);notify(e.text);}
 if(e.type==='death'){sim.deathReason=e.text;openModal('dead');}
 if(e.type==='advance'||e.type==='won'){openModal(e.type);saveSlot(0,false);}
 if(e.type==='transition'){progress('habitat',sim.current);inspected=null;drawUI();}
 if(settings.verbose&&['eat','poison','reject'].includes(e.type))openModal('message');
}}
function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;if(!home&&sim&&!modal){acc+=dt;while(acc>=1/60){sim.step(1/60);acc-=1/60;}events();}else acc=0;if(sim&&!home&&!sim.paused&&!modal){checkpointClock+=dt;if(checkpointClock>=10){checkpointClock=0;saveSlot(0,false);}}
 if(badgeQueue.length&&!modal&&!inspected&&now>toastUntil){const badge=badgeQueue.shift();audio.effect('ui',.45);notify('New journal badge · '+badge.name);}
 const speechId=modal==='activity'?'activities/'+selection:selection;const spoken=$('#narration-label');if(spoken)spoken.textContent=audio.narrationId===speechId?'Stop':modal==='activity'?'Play activity':'Play introduction';const speechStatus=$('#narration-status');if(speechStatus)speechStatus.textContent=audio.narrationState==='unavailable'?(modal==='activity'?'Audio unavailable · You can read the activity below.':'Audio unavailable · You can read the introduction below.'):audio.narrationState==='muted'?'Enable audio in Settings to listen.':'AI-generated voice · Plays only when you choose';
 const sound=$('.sound-enable');if(sound)sound.hidden=!(audio.blocked&&settings.sound&&!modal);
 let unsaved=$('.journal-unsaved');if(journalUnsaved&&!modal){if(!unsaved){unsaved=document.createElement('button');unsaved.className='journal-unsaved secondary-button';unsaved.dataset.action='journal';unsaved.textContent='Journal unsaved · Back up';ui.append(unsaved);}}else unsaved?.remove();
 let creationWarning=$('.creation-unsaved');if(creationError&&!modal&&sim?.creation&&!sim.trial){if(!creationWarning){creationWarning=document.createElement('button');creationWarning.className='creation-unsaved journal-unsaved secondary-button';creationWarning.dataset.action='saves';creationWarning.textContent='Creation unsaved · Export backup';ui.append(creationWarning);}}else creationWarning?.remove();
 renderer.draw(sim,dt,home);animateCreationPortraits(now);hudClock+=dt;if(hudClock>.15){hudClock=0;updateHUD();updateToast();}requestAnimationFrame(frame);}
ui.innerHTML='<div class="loading"><div><h2>Atoll Down Under</h2><p>The reef is coming to life.</p><div class="loading-bar"></div></div></div>';
try{await initializeFullscreen();await renderer.load();audio.setTrack('blue-passage');drawUI();requestAnimationFrame(frame);}catch(err){ui.innerHTML=`<div class="loading"><div><h2>The reef could not load.</h2><p>${escape(err.message)}</p><p>Check that all assets are included, then reopen the game.</p></div></div>`;console.error(err);}
// Inspection surface for runtime QA. It does not expose Node or filesystem APIs.
window.atoll={get journal(){return structuredClone(journal);},get simulation(){return sim;},get renderer(){return renderer;},get audio(){return audio;},get state(){return {home,modal,selection,settings,trial:!!sim?.trial,creationError};}};
