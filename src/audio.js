export class Soundscape{
 constructor(){this.enabled=true;this.musicVolume=.42;this.effectsVolume=.55;this.music=null;this.track='';this.unlocked=false;this.blocked=false;this.pending=null;this.fade=null;this.fadeLevel=1;this.narration=null;this.narrationId=null;this.narrationVolume=.85;this.narrationState='stopped';}
 unlock(){this.unlocked=true;this.setTrack(this.track||'blue-passage');}
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
 stopNarration(){const previous=this.narration;this.narration=null;this.narrationId=null;this.narrationState='stopped';if(previous){previous.onended=null;previous.onerror=null;previous.pause();}this.applyVolume();}
 async playNarration(id){
  this.stopNarration();if(!this.enabled){this.narrationState='muted';return false;}
  const clip=new Audio('assets/audio/narration/'+id+'.ogg');this.narration=clip;this.narrationId=id;this.narrationState='loading';clip.volume=this.narrationVolume;this.applyVolume();
  const fail=()=>{if(this.narration===clip){this.stopNarration();this.narrationState='unavailable';}};
  clip.onended=()=>{if(this.narration===clip)this.stopNarration();};clip.onerror=fail;
  try{await clip.play();if(this.narration!==clip){clip.pause();return false;}this.narrationState='playing';return true;}catch{fail();return false;}
 }
 effect(name,gain=1){if(!this.enabled||!this.unlocked)return;const aliases={eat:'meal',message:'ui',start:'bubble',won:'win',ability:'sonic',poison:'poison',clean:'clean',dead:'death',poisonAbility:'ink'};name=aliases[name]||name;const a=new Audio('assets/audio/'+name+'.ogg');a.volume=this.effectsVolume*gain;a.play().catch(()=>{});}
 update(settings){this.enabled=settings.sound!==false;this.musicVolume=Math.max(0,Math.min(1,Number(settings.musicVolume??.42)));this.effectsVolume=Math.max(0,Math.min(1,Number(settings.effectsVolume??.55)));this.narrationVolume=Math.max(0,Math.min(1,Number(settings.narrationVolume??.85)));if(this.narration)this.narration.volume=this.narrationVolume;if(!this.enabled)this.stopNarration();this.applyVolume();if(this.music){if(!this.enabled)this.music.pause();else if(this.music.paused)this.play();}}
}
