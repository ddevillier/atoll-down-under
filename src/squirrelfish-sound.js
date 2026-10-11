// A quiet, synthesized encounter cue. This is sound design, not an animal
// recording, and carries no claimed translation of a squirrelfish call.
export function playShadePulse(audioContext,{pan=0,gain=.07}={}){
 if(!audioContext||audioContext.state!=='running'||!Number.isFinite(gain)||gain<=0)return null;
 const now=audioContext.currentTime,level=Math.min(.12,gain);
 let oscillator,filter,envelope,panner,cleaned=false;
 const cleanup=()=>{
  if(cleaned)return;cleaned=true;
  if(oscillator){oscillator.onended=null;try{oscillator.stop();}catch{}}
  for(const node of [oscillator,filter,envelope,panner])try{node?.disconnect();}catch{}
 };
 try{
  oscillator=audioContext.createOscillator();filter=audioContext.createBiquadFilter();envelope=audioContext.createGain();
  oscillator.type='triangle';oscillator.frequency.setValueAtTime(220,now);oscillator.frequency.exponentialRampToValueAtTime(110,now+.18);
  filter.type='lowpass';filter.frequency.setValueAtTime(550,now);filter.Q.setValueAtTime(.5,now);
  envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(level,now+.008);envelope.gain.exponentialRampToValueAtTime(Math.max(Number.MIN_VALUE,Math.min(.0001,level*.001)),now+.2);envelope.gain.linearRampToValueAtTime(0,now+.23);
  oscillator.connect(filter);filter.connect(envelope);
  if(typeof audioContext.createStereoPanner==='function'){
   panner=audioContext.createStereoPanner();panner.pan.setValueAtTime(Number.isFinite(pan)?Math.max(-1,Math.min(1,pan)):0,now);envelope.connect(panner);panner.connect(audioContext.destination);
  }else envelope.connect(audioContext.destination);
  oscillator.onended=cleanup;oscillator.start(now);oscillator.stop(now+.24);
  return {node:envelope,cleanup};
 }catch{cleanup();return null;}
}
