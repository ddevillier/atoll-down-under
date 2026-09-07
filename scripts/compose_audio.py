"""Original Atoll score and effects. Deterministic synthesis; no samples or borrowed melodies.
Requires numpy and ffmpeg. Run from the project root. WAV masters and OGG game files.
"""
from pathlib import Path
import numpy as np
import wave, subprocess, json, sys
title_only="--title-only" in sys.argv
SR=32000
OUT=Path('assets/audio'); OUT.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(70421)
def hz(note):return 440*2**((note-69)/12)
def pan(signal,p):return np.column_stack((signal*np.sqrt((1-p)/2),signal*np.sqrt((1+p)/2)))
def add(buf,signal,start,p=0):
 s=pan(signal,p) if signal.ndim==1 else signal
 at=int(start*SR)%len(buf)
 # Circular mixing keeps reverb tails continuous across a musical loop.
 for off in range(0,len(s),len(buf)):
  piece=s[off:off+len(buf)];a=(at+off)%len(buf);n=min(len(piece),len(buf)-a);buf[a:a+n]+=piece[:n]
  if n<len(piece):buf[:len(piece)-n]+=piece[n:]
def pad(note,duration,phase=0):
 t=np.arange(int((duration+2)*SR))/SR; f=hz(note)
 env=np.minimum(t/1.4,1)*np.minimum(np.maximum(duration+2-t,0)/2.8,1)
 s=(np.sin(2*np.pi*f*t+phase)+.35*np.sin(2*np.pi*f*1.002*t)+.28*np.sin(2*np.pi*f*.998*t)+.1*np.sin(2*np.pi*f*2*t))*.027
 return s*env*(.9+.1*np.sin(2*np.pi*.13*t+phase))
def bell(note,duration=3,amp=.11,soft=False):
 t=np.arange(int(duration*SR))/SR;f=hz(note)
 if soft:s=np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*2*f*t)*np.exp(-t*2)
 else:s=np.sin(2*np.pi*f*t)*np.exp(-t*1.5)+.23*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*3)+.12*np.sin(2*np.pi*f*3.98*t)*np.exp(-t*8)
 return amp*s*np.minimum(t/.012,1)*np.exp(-t/(1.15 if soft else .95))*np.minimum((duration-t)/.1,1)
def save(name,buf,loop=False):
 if buf.ndim==1:buf=pan(buf,0)
 peak=np.max(np.abs(buf));buf=buf/max(1,peak/.7)
 if not loop:
  n=min(len(buf)//3,int(SR*.012));buf[:n]*=np.linspace(0,1,n)[:,None];buf[-n:]*=np.linspace(1,0,n)[:,None]
 path=OUT/(name+'.wav');pcm=(np.clip(buf,-1,1)*32767).astype('<i2')
 with wave.open(str(path),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(path),'-c:a','libvorbis','-q:a','5',str(OUT/(name+'.ogg'))],check=True)
 return {'file':name+'.ogg','duration':round(len(buf)/SR,3),'peak':round(float(np.max(np.abs(buf))),4),'rms':round(float(np.sqrt(np.mean(buf**2))),4)}
tracks=[]
for name,bpm,key,night in [('glasswater',72,2,False),('moon-through-water',60,-3,True),('blue-passage',60,7,True)]:
 if title_only and name!='blue-passage':continue
 title=name=='blue-passage'
 beat=60/bpm;bars=32;length=bars*4*beat;buf=np.zeros((round(length*SR),2),dtype=np.float64)
 chords=[[48,55,59,62,64],[45,52,55,59,62],[41,48,52,55,59],[43,50,53,57,62]]
 melody=[[76,74,71,69,67,69,71,74],[71,74,76,79,76,74,71,69],[72,76,79,76,74,72,71,67],[69,74,77,74,72,69,67,62]]
 for bar in range(bars):
  chord=chords[(bar//2)%4];start=bar*4*beat
  if bar%2==0:
   for j,note in enumerate(chord):add(buf,pad(note+key,8*beat,bar+j),start,(j-2)*.3)
   add(buf,bell(chord[0]-12+key,5,.095,True),start,0)
  for step in range(2 if title else 4 if night else 8):
   spacing=beat*(2 if title else 1 if night else .5);note=chord[(step+bar)%len(chord)]+12+key
   s=bell(note,3,.055 if night else .08,night);p=np.sin(bar+step)*.5
   add(buf,s,start+step*spacing,p)
   for delay,gain in [(beat*.75,.25),(beat*1.5,.12)]:add(buf,s*gain,start+step*spacing+delay,-p)
  if bar%2==1 and not title:
   notes=melody[(bar//2)%4]
   for k in range(3):
    note=notes[(bar+k*2)%8]+key;s=bell(note,4,.045 if night else .06,True)
    add(buf,s,start+(k+(.5 if bar%4 else 0))*beat,.25)
 # Gentle stereo reverb: circular delay network, no harsh noise bed.
 dry=buf.copy()
 for sec,gain in [(.113,.1),(.231,.07),(.379,.045),(.577,.025)]:buf+=np.roll(dry,int(SR*sec),axis=0)[:,::-1]*gain
 tracks.append(save(name,buf,True));print('Composed',name,flush=True)
if title_only:
 metrics=json.loads((OUT/'manifest.json').read_text())
 metrics['music']=[tracks[0] if t['file']=='blue-passage.ogg' else t for t in metrics['music']]
 (OUT/'manifest.json').write_text(json.dumps(metrics,indent=2))
 sys.exit(0)

def swoop(start,end,duration=.5,amp=.18,noise=.0):
 t=np.arange(int(SR*duration))/SR;phase=2*np.pi*(start*t+(end-start)/(2*duration)*t*t);env=np.sin(np.pi*t/duration)**2
 return (np.sin(phase)+noise*rng.normal(0,1,len(t)))*env*amp
effects={
 'ui':bell(79,.18,.1), 'bite':swoop(420,90,.17,.19,.15), 'meal':bell(81,.65,.12)+bell(88,.65,.055),
 'reject':swoop(190,120,.24,.13), 'poison':swoop(310,78,.7,.12,.08), 'hurt':swoop(120,62,.32,.17,.25),
 'hide':swoop(480,180,.38,.09), 'reveal':swoop(180,430,.3,.08), 'transition':swoop(150,310,.8,.06,.1),
 'bubble':swoop(320,1350,.19,.065),'dash':swoop(170,630,.5,.1,.18), 'ink':swoop(95,48,.65,.13,.3),
 'spines':swoop(560,920,.35,.08,.2), 'puff':swoop(140,310,.55,.12,.08), 'shock':swoop(80,520,.55,.1,.55),
 'sting':swoop(820,130,.32,.1,.1), 'sonic':swoop(130,350,.9,.1), 'flash':bell(90,.5,.07),
 'lure':bell(86,1.1,.085),'camouflage':swoop(380,130,.6,.08),'crush':swoop(240,55,.26,.17,.28)
}
for name,notes in [('clean',[72,76,79,84]),('advance',[67,71,74,79,83,86]),('save',[76,79,84]),('death',[64,60,57,52]),('win',[67,71,74,79,83,86,91])]:
 buf=np.zeros((int(SR*(len(notes)*.16+2)),2))
 for i,n in enumerate(notes):add(buf,bell(n,1.8,.105,True),i*.16,(i%3-1)*.25)
 effects[name]=buf
metrics={'music':tracks,'effects':[save(n,s)for n,s in effects.items()],'sampleRate':SR,'composition':'All notes, synthesis and arrangements are original to Atoll Down Under. No recorded samples.'}
(OUT/'manifest.json').write_text(json.dumps(metrics,indent=2))
print('Finished',len(effects),'sound effects',flush=True)
