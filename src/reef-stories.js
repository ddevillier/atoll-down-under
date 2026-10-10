import * as clinic from './reef-clinic.js';
import * as artist from './disappearing-artist.js';
import * as engineer from './sandcastle-engineer.js';
import * as detective from './whisker-detective.js';
import * as nursery from './cardinalfish-nursery.js';
import {REEF_STORIES,storyKeyFor} from './reef-story-data.js';
import {REEFS} from './data.js';
import {cancelPlayerService} from './player-cleaner.js';
const modules={clinic,artist,engineer,detective,nursery};
export const freshStories=()=>({version:1,active:null,clinic:null,artist:null,engineer:null,detective:null,nursery:null});
export function validStories(s){return s===undefined||!!s&&typeof s==='object'&&!Array.isArray(s)&&s.version===1&&(s.active===null||Object.hasOwn(modules,s.active))&&Object.keys(s).every(k=>['version','active',...Object.keys(modules)].includes(k))&&Object.entries(modules).every(([key,m])=>m.validStory(s[key]??null));}
export function activeStory(sim){const key=sim?.reefStories?.active;return sim?.mode==='practice'&&!sim.trial&&REEF_STORIES[key]?.species.includes(sim.player?.species?.id)?key:null;}
const habitatFor=sim=>({clinic:sim.player?.species.id==='s45'?8:4,artist:7,engineer:0,detective:7,nursery:6})[sim.reefStories?.active];
const prepareStory=sim=>{const key=activeStory(sim);if(!key||sim.reefStories[key])return;modules[key].initStory(sim);if(!sim.reefStories[key])sim.setDestination(habitatFor(sim));};
export function beginStory(sim){const key=sim?.mode==='practice'&&!sim.trial?storyKeyFor(sim.player?.species?.id):null;if(!key||sim.phase!=='playing'||sim.player.health<=0||sim.player.energy<=0)return false;sim.reefStories??=freshStories();sim.reefStories.active=key;sim.residentFocus=null;sim.adventure.visible=true;prepareStory(sim);if(sim.reefStories[key]?.reef!=null&&sim.reefStories[key].reef!==sim.current)sim.setDestination(sim.reefStories[key].reef);return true;}
export function stopStory(sim){if(!activeStory(sim))return false;cancelPlayerService(sim);sim.player.blending=null;sim.player.blendTime=0;sim.player.sandProbe=null;sim.player.cardinalBrooding=false;sim.player.broodPose=0;sim.player.target=null;sim.pointer={x:sim.player.x,y:sim.player.y};sim.reefStories.active=null;return true;}
export function storyAction(sim,action,value){const key=activeStory(sim);if(!key||sim.paused||sim.phase!=='playing'||sim.player.stun>0||sim.player.health<=0||sim.player.energy<=0)return false;if(action==='story-route'){sim.setDestination(sim.reefStories[key]?.reef??habitatFor(sim));return true;}prepareStory(sim);return sim.reefStories[key]?modules[key].storyAction(sim,action,value):false;}
export function tickStories(sim,dt){if(!sim||sim.paused||sim.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;const key=activeStory(sim);if(key&&sim.player.health>0&&sim.player.energy>0){prepareStory(sim);if(sim.reefStories[key])modules[key].tickStory(sim,dt);}if(key!=='nursery')nursery.tickBackground(sim,dt);if(key!=='engineer')engineer.tickBackground(sim,dt);}
export function storyMeal(sim,food){const key=activeStory(sim);if(key)modules[key].storyMeal(sim,food);}
export function storyNPC(sim,e,dt){const key=activeStory(sim);return !!(key&&modules[key].storyNPC(sim,e,dt));}
export function storyView(sim){const key=activeStory(sim);if(!key)return null;const pending=!sim.reefStories[key],reef=habitatFor(sim);return {...REEF_STORIES[key],key,...(pending?{step:'Visit '+REEFS[reef].name,detail:'Swim along the map route. Your adventure begins when you arrive.',actions:[{id:'story-route',label:'Show route'}],complete:false}:modules[key].storyView(sim))};}
export function storyFoodHidden(sim,food){return activeStory(sim)==='detective'&&detective.storyFoodHidden(sim,food);}

export function storyFoodReserved(sim,food,actor){return activeStory(sim)==='detective'&&detective.storyFoodReserved(sim,food,actor);}
