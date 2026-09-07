export class Soundscape{
 constructor(){this.enabled=true;this.musicVolume=.42;this.effectsVolume=.55;this.music=null;this.track='';this.unlocked=false;this.blocked=false;this.pending=null;this.fade=null;this.fadeLevel=1;}
 unlock(){this.unlocked=true;this.setTrack(this.track||'blue-passage');}
 setTrack(name){
  if(this.track!==name||!this.music){clearInterval(this.fade);this.music?.pause();this.track=name;this.music=new Audio('assets/audio/'+name+'.ogg');this.music.loop=true;this.fadeLevel=name==='blue-passage'?0:1;this.pending=null;}
  this.applyVolume();if(this.enabled&&(this.music.paused||this.blocked))this.play();
 }
 applyVolume(){if(this.music)this.music.volume=this.enabled?this.musicVolume*this.fadeLevel:0;}
 play(){
  const music=this.music;if(!music||this.pending===music)return;
  this.pending=music;
  Promise.resolve().then(()=>music.play()).then(()=>{
   if(this.music!==music){music.pause();return;}this.blocked=false;this.unlocked=true;
   if(this.fadeLevel<1){clearInterval(this.fade);const start=performance.now();this.fade=setInterval(()=>{if(this.music!==music){clearInterval(this.fade);return;}this.fadeLevel=Math.min(1,(performance.now()-start)/2000);this.applyVolume();if(this.fadeLevel===1)clearInterval(this.fade);},40);}
  }).catch(()=>{if(this.music===music)this.blocked=true;}).finally(()=>{if(this.pending===music)this.pending=null;});
 }
 effect(name,gain=1){if(!this.enabled||!this.unlocked)return;const aliases={eat:'meal',message:'ui',start:'bubble',won:'win',ability:'sonic',poison:'poison',clean:'clean',dead:'death',poisonAbility:'ink'};name=aliases[name]||name;const a=new Audio('assets/audio/'+name+'.ogg');a.volume=this.effectsVolume*gain;a.play().catch(()=>{});}
 update(settings){this.enabled=settings.sound!==false;this.musicVolume=Math.max(0,Math.min(1,Number(settings.musicVolume??.42)));this.effectsVolume=Math.max(0,Math.min(1,Number(settings.effectsVolume??.55)));this.applyVolume();if(this.music){if(!this.enabled)this.music.pause();else if(this.music.paused)this.play();}}
}
