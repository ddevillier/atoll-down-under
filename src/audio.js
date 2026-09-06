export class Soundscape{
 constructor(){this.enabled=true;this.musicVolume=.42;this.effectsVolume=.55;this.music=null;this.track='';this.unlocked=false;this.cache=new Map();}
 unlock(){this.unlocked=true;this.setTrack(this.track||'blue-passage');}
 setTrack(name){if(this.track===name&&this.music){this.music.volume=this.enabled?this.musicVolume:0;return;}this.track=name;if(!this.unlocked)return;this.music?.pause();this.music=new Audio('assets/audio/'+name+'.ogg');this.music.loop=true;this.music.volume=this.enabled?this.musicVolume:0;this.music.play().catch(()=>{});}
 effect(name){if(!this.enabled||!this.unlocked)return;const aliases={eat:'meal',message:'ui',start:'bubble',won:'win',ability:'sonic',poison:'poison',clean:'clean',dead:'death',poisonAbility:'ink'};name=aliases[name]||name;const file='assets/audio/'+name+'.ogg';const a=new Audio(file);a.volume=this.effectsVolume;a.play().catch(()=>{});}
 update(settings){this.enabled=settings.sound!==false;this.musicVolume=Number(settings.musicVolume??.42);this.effectsVolume=Number(settings.effectsVolume??.55);if(this.music)this.music.volume=this.enabled?this.musicVolume:0;}
}
