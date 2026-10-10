// Automatic speech is driven by earned events, never by periodic simulation ticks.
// The persistent journal is the authority for discoveries; this controller only
// holds short-lived presentation state and never changes progress or rewards.
export class DiscoveryNarration{
 constructor({audio,catalog={},now=()=>performance.now(),quietGap=12000,entryDelay=2000,expiry=30000,maxQueue=4}={}){
  this.audio=audio;this.catalog=catalog;this.now=now;this.quietGap=quietGap;this.entryDelay=entryDelay;this.expiry=expiry;this.maxQueue=maxQueue;
  this.queue=[];this.discoveries=new Set();this.achievements=new Set();this.introductions=new Set();this.attemptedIntroductions=new Set();this.current=null;this.pending=null;this.generation=0;this.nextAt=-Infinity;this.state=null;
 }
 syncJournal(journal={}){for(const id of journal.discoveries||[])this.discoveries.add(id);for(const id of Object.keys(journal.earned||{}))this.achievements.add(id);this.queue=this.queue.filter(c=>c.kind==='introductions'||!(c.kind==='discoveries'?this.discoveries:this.achievements).has(c.key));}
 cue(kind,key){const value=this.catalog[kind]?.[key],id=typeof value==='string'?value:value?.id;return typeof id==='string'&&/^[-\w]+(?:\/[-\w]+)*$/.test(id)?{id,key,kind}:null;}
 enabled(settings={}){return settings.automaticNarration!==false&&settings.sound!==false&&Number(settings.narrationVolume??.85)>0&&this.audio?.enabled!==false&&this.audio?.narrationVolume>0;}
 enqueue(cue,delay=0){
  if(!cue||this.state&&!this.enabled(this.state.settings)||this.queue.some(c=>c.kind===cue.kind&&c.key===cue.key))return false;
  const now=this.now();this.queue.push({...cue,at:now,readyAt:now+delay});
  this.queue.sort((a,b)=>(a.kind==='introductions')-(b.kind==='introductions')||a.at-b.at);
  if(this.queue.length>this.maxQueue)this.queue.length=this.maxQueue;return this.queue.some(c=>c.kind===cue.kind&&c.key===cue.key);
 }
 enterSpecies(id,{resume=false}={}){
  // A save restore is not a new discovery. New dives may introduce an unplayed
  // species once in this app session, but volume zero never counts as heard.
  this.cancel({clear:true});
  if(resume||this.introductions.has(id)||this.attemptedIntroductions.has(id))return false;
  return this.enqueue(this.cue('introductions',id),this.entryDelay);
 }
 discover(id,{fresh=false}={}){if(!fresh||this.discoveries.has(id))return false;this.discoveries.add(id);return this.enqueue(this.cue('discoveries',id));}
 achievement(id,{fresh=false}={}){if(!fresh||this.achievements.has(id))return false;this.achievements.add(id);return this.enqueue(this.cue('achievements',id));}
 cancel({clear=false}={}){
  this.generation++;this.pending=null;this.current=null;
  if(this.audio?.narrationSource==='automatic')this.audio.stopNarration();
  if(clear)this.queue=[];
 }
 update(state={}){
  this.state=state;const now=this.now(),enabled=this.enabled(state.settings);
  this.queue=this.queue.filter(c=>now-c.at<=this.expiry);
  if(!enabled||state.home||state.alive===false||state.trial){if(this.current||this.pending||this.queue.length)this.cancel({clear:true});return;}
  if(state.modal||state.paused){if(this.current||this.pending){this.cancel();this.nextAt=Math.max(this.nextAt,now+this.entryDelay);}return;}
  if(this.current&&this.audio.narrationSource!=='automatic'){this.current=null;this.nextAt=Math.max(this.nextAt,now+this.quietGap);}
  if(this.pending||this.audio.narration||!this.audio.unlocked||now<this.nextAt)return;
  const index=this.queue.findIndex(c=>c.readyAt<=now);if(index<0)return;
  const cue=this.queue.splice(index,1)[0],generation=this.generation;this.current=cue;
  const request=Promise.resolve().then(()=>{
   if(generation!==this.generation||!this.enabled(this.state?.settings))return false;
   if(cue.kind==='introductions')this.attemptedIntroductions.add(cue.key);
   return this.audio.playNarration(cue.id,{source:'automatic'});
  }).catch(()=>false).then(started=>{
   if(generation!==this.generation)return;
   if(started&&cue.kind==='introductions')this.introductions.add(cue.key);
   this.nextAt=this.now()+this.quietGap;if(!started)this.current=null;
  }).finally(()=>{if(this.pending===request)this.pending=null;});this.pending=request;
 }
}
