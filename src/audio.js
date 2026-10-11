import {playShadePulse as synthesizeShadePulse} from './squirrelfish-sound.js';
export class Soundscape{
 constructor(){this.enabled=true;this.musicVolume=.42;this.effectsVolume=.55;this.effects=new Map();this.music=null;this.track='';this.unlocked=false;this.blocked=false;this.pending=null;this.fade=null;this.fadeLevel=1;this.narration=null;this.narrationId=null;this.narrationVolume=.85;this.narrationState='stopped';this.narrationSource=null;this.narrationTimers=[];this.cancelNarrationLoad=null;this.userUnlocked=false;this.effectsPaused=false;this.shadeContext=null;this.shadePulses=new Set();this.shadeGeneration=0;}
 unlock(){this.unlocked=true;this.userUnlocked=true;if(this.shadeContext?.state==='suspended'&&this.enabled&&!this.effectsPaused&&this.effectsVolume>0)try{Promise.resolve(this.shadeContext.resume()).catch(()=>{});}catch{}this.setTrack(this.track||'blue-passage');}
 setTrack(name){
  if(this.track!==name||!this.music){clearInterval(this.fade);this.music?.pause();this.track=name;this.music=new Audio('assets/audio/'+name+'.ogg');this.music.loop=true;this.fadeLevel=name==='blue-passage'?0:1;this.pending=null;}
  this.applyVolume();if(this.enabled&&(this.music.paused||this.blocked))this.play();
 }
 applyVolume(){if(this.music)this.music.volume=this.enabled?this.musicVolume*this.fadeLevel*(this.narration?.28:1):0;}
 play(){
  const music=this.music;if(!music||this.pending===music)return;
  this.pending=music;
  Promise.resolve().then(()=>music.play()).then(()=>{
   if(this.music!==music){music.pause();return;}this.blocked=false;this.unlocked=true;
   if(this.fadeLevel<1){clearInterval(this.fade);const start=performance.now();this.fade=setInterval(()=>{if(this.music!==music){clearInterval(this.fade);return;}this.fadeLevel=Math.min(1,(performance.now()-start)/2000);this.applyVolume();if(this.fadeLevel===1)clearInterval(this.fade);},40);}
  }).catch(()=>{if(this.music===music)this.blocked=true;}).finally(()=>{if(this.pending===music)this.pending=null;});
 }
 stopNarration(){const previous=this.narration;this.narration=null;this.narrationId=null;this.narrationSource=null;this.narrationState='stopped';for(const timer of this.narrationTimers)clearTimeout(timer);this.narrationTimers=[];this.cancelNarrationLoad?.();this.cancelNarrationLoad=null;if(previous){previous.onended=null;previous.onerror=null;previous.pause();}this.applyVolume();}
 async playNarration(id,{source='manual',loadTimeoutMs=8000,maxDurationMs=source==='automatic'?20000:0}={}){
  // An automatic cue must never replace speech explicitly requested in the guide.
  if(source==='automatic'&&this.narration&&this.narrationSource!=='automatic')return false;
  this.stopNarration();if(!this.enabled||this.narrationVolume<=0){this.narrationState='muted';return false;}
  if(typeof id!=='string'||!/^[-\w]+(?:\/[-\w]+)*$/.test(id)){this.narrationState='unavailable';return false;}
  let clip;try{clip=new Audio('assets/audio/narration/'+id+'.ogg');}catch{this.narrationState='unavailable';return false;}
  this.narration=clip;this.narrationId=id;this.narrationSource=source;this.narrationState='loading';clip.volume=this.narrationVolume;this.applyVolume();
  const fail=()=>{if(this.narration===clip){this.stopNarration();this.narrationState='unavailable';}};
  clip.onended=()=>{if(this.narration===clip)this.stopNarration();};clip.onerror=fail;
  let loadingTimer;const cancelled=new Promise(resolve=>{this.cancelNarrationLoad=()=>resolve(false);loadingTimer=setTimeout(()=>{fail();resolve(false);},Math.max(1,loadTimeoutMs));this.narrationTimers.push(loadingTimer);});
  try{
   const playback=Promise.resolve().then(()=>{if(this.narration!==clip)return false;return Promise.resolve(clip.play()).then(()=>{if(this.narration!==clip){clip.pause();return false;}return true;});});
   const started=await Promise.race([playback,cancelled]);clearTimeout(loadingTimer);
   if(!started||this.narration!==clip){clip.pause();return false;}
   this.cancelNarrationLoad=null;this.narrationTimers=this.narrationTimers.filter(timer=>timer!==loadingTimer);this.narrationState='playing';
   if(maxDurationMs>0)this.narrationTimers.push(setTimeout(()=>{if(this.narration===clip)this.stopNarration();},maxDurationMs));
   return true;
  }catch{fail();return false;}
 }
 stopShadePulses({suspend=true}={}){
  this.shadeGeneration++;for(const pulse of this.shadePulses){clearTimeout(pulse.timer);pulse.cleanup();}this.shadePulses.clear();
  if(suspend&&this.shadeContext?.state==='running')try{Promise.resolve(this.shadeContext.suspend()).catch(()=>{});}catch{}
 }
 // A paused dive silences its local encounter pulse. Existing one-shot UI
 // sounds and explicit settings previews retain live volume/mute behavior.
 setPaused(paused){const next=!!paused;if(next===this.effectsPaused)return;this.effectsPaused=next;if(next)this.stopShadePulses();}
 async playShadePulse({pan=0,gain=1}={}){
  // Only unlock() called from a user interaction authorizes the lazy context;
  // successful autoplay of the HTML music element is insufficient.
  if(!this.enabled||!this.userUnlocked||this.effectsPaused||this.effectsVolume<=0||!Number.isFinite(gain)||gain<=0)return false;
  const generation=this.shadeGeneration;
  try{
   if(!this.shadeContext||this.shadeContext.state==='closed'){
    const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(typeof Context!=='function')return false;
    this.shadeContext=new Context();
   }
   const context=this.shadeContext;if(context.state==='suspended')await context.resume();
   if(generation!==this.shadeGeneration||!this.enabled||this.effectsPaused||this.effectsVolume<=0||context!==this.shadeContext){if(!this.enabled||this.effectsPaused||this.effectsVolume<=0)this.stopShadePulses();return false;}
   const pulse=synthesizeShadePulse(context,{pan,gain:.07*this.effectsVolume*gain});if(!pulse)return false;
   this.shadePulses.add(pulse);pulse.timer=setTimeout(()=>{pulse.cleanup();this.shadePulses.delete(pulse);},300);return true;
  }catch{return false;}
 }
 stopEffects(){for(const a of this.effects.keys()){a.onended=null;a.onerror=null;a.volume=0;a.pause();}this.effects.clear();this.stopShadePulses();}
 effect(name,gain=1){
  if(!this.enabled||!this.unlocked)return;
  const aliases={eat:'meal',message:'ui',start:'bubble',won:'win',ability:'sonic',poison:'poison',clean:'clean',dead:'death',poisonAbility:'ink',recover:'clean','mimic-bite':'bite'};name=aliases[name]||name;
  const a=new Audio('assets/audio/'+name+'.ogg');a.volume=this.effectsVolume*gain;this.effects.set(a,gain);
  const release=()=>{this.effects.delete(a);a.onended=null;a.onerror=null;};a.onended=release;a.onerror=release;
  try{Promise.resolve(a.play()).then(()=>{if(!this.effects.has(a)){a.volume=0;a.pause();}}).catch(release);}catch{release();}
 }
 update(settings){const volume=(value,fallback)=>Number.isFinite(Number(value??fallback))?Math.max(0,Math.min(1,Number(value??fallback))):fallback,previousEffectsVolume=this.effectsVolume;this.enabled=settings.sound!==false;this.musicVolume=volume(settings.musicVolume,.42);this.effectsVolume=volume(settings.effectsVolume,.55);this.narrationVolume=volume(settings.narrationVolume,.85);if(previousEffectsVolume!==this.effectsVolume)this.stopShadePulses();if(this.narration)this.narration.volume=this.narrationVolume;if(!this.enabled){this.stopNarration();this.stopEffects();}else{if(this.narrationVolume<=0||(settings.automaticNarration===false&&this.narrationSource==='automatic'))this.stopNarration();for(const [a,gain] of this.effects)a.volume=this.effectsVolume*gain;}this.applyVolume();if(this.music){if(!this.enabled)this.music.pause();else if(this.music.paused)this.play();}}
}
