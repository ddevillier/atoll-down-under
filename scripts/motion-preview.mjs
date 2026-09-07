import {ReefRenderer} from '/src/render.js';
import {SPECIES} from '/src/data.js';
import {creatureWidth} from '/src/geometry.js';
import {PaintedParts,PART_RIGS,bodyPoint} from '/src/part-motion.js';
import {contactDelay,feedingEnvelope} from '/src/feeding-motion.js';
const canvas=document.querySelector('canvas'),r=new ReefRenderer(canvas),parts=new PaintedParts(),c=canvas.getContext('2d'),groups={examples:[23,32,42,27],sharks:[32,33,34,35],schools:[0,28,42,49],long:[17,18,28,49,41],hover:[1,2,7,30],grazers:[5,8,52],wrasses:[10,15,29],hunters:[16,21,38,39]};
await r.load();let time=0,last=performance.now(),layoutHeight=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause=document.querySelector('#pause');function update(){pause.textContent=paused?'Play motion':'Pause motion';}update();pause.onclick=()=>{paused=!paused;update();};
function draw(){
 const ids=groups[document.querySelector('#animals').value],scale=Number(document.querySelector('#size').value),cycle=time%9;
 const mealControl=document.querySelector('#meal'),hasJaws=ids.some(id=>PART_RIGS[SPECIES[id].id].parts.some(p=>p.mode==='jaw'));
 mealControl.disabled=!hasJaws;
 canvas.setAttribute('aria-label','Live swimming comparison: '+ids.map(id=>SPECIES[id].name).join(', '));
 const rowHeight=Math.max(255,...ids.map(id=>creatureWidth(SPECIES[id])*scale*r.sprites[id].height/r.sprites[id].width+110)),displayHeight=90+ids.length*rowHeight;
 if(layoutHeight!==displayHeight){layoutHeight=displayHeight;canvas.style.aspectRatio='1600 / '+displayHeight;r.resize();}
 const effort=cycle<3?1:cycle<4?1-(cycle-3):cycle<6?0:Math.min(1,(cycle-6)*1.5),brake=cycle>=3&&cycle<4?Math.sin((cycle-3)*Math.PI):0;
 c.setTransform(canvas.width/1600,0,0,canvas.height/displayHeight,0,0);c.fillStyle='#123e47';c.fillRect(0,0,1600,displayHeight);
 if(document.querySelector('#reef').checked)c.drawImage(r.reefs[1],0,0,1600,displayHeight);
 c.fillStyle='#fff6da';c.font='24px AtollSans, sans-serif';c.fillText('Unchanged painting',360,44);c.fillText('Moving parts',1090,44);
 for(const [row,id] of ids.entries()){
  const sp=SPECIES[id],im=r.sprites[id],w=creatureWidth(sp)*scale,h=w*im.height/im.width,top=80+row*rowHeight,y=top+65+(rowHeight-95)/2;
  c.fillStyle='#fff6da';c.font='23px AtollSans, sans-serif';c.fillText(sp.name,25,top+22);
  // Shared translation makes the difference between sliding and articulation
  // directly comparable without pretending this showcase is ordinary play.
  const drift=Math.sin(time*.55)*26;
  c.drawImage(im,480+drift-w/2,y-h/2,w,h);
  const elapsed=cycle-3,contactAt=contactDelay(sp),feed=mealControl.checked&&hasJaws&&elapsed>=0&&elapsed<contactAt+.36?feedingEnvelope({feeding:{elapsed,contactAt,committed:elapsed>=contactAt}}):0;
  c.save();c.translate(1200+drift,y);parts.draw(c,im,sp.id,w,h,time,effort,{brake,feed});
  if(document.querySelector('#guides').checked){c.strokeStyle='#fff6da';c.fillStyle='#f4c76e';c.lineWidth=2;for(const p of PART_RIGS[sp.id].parts){const [a,b]=p.hinge.map(([u,v])=>bodyPoint(sp.id,u,v,time,effort,{aspect:h/w}));c.beginPath();c.moveTo((a.x-.5)*w,(a.y-.5)*h);c.lineTo((b.x-.5)*w,(b.y-.5)*h);c.stroke();for(const q of [a,b]){c.beginPath();c.arc((q.x-.5)*w,(q.y-.5)*h,3,0,Math.PI*2);c.fill();}}}c.restore();
 }
 document.querySelector('#status').textContent=(paused?'Paused · ':'')+(cycle<3?'Swimming':cycle<4?(mealControl.checked&&hasJaws?'Braking · feeding gesture':'Braking'):cycle<6?'Settled':'Resuming')+' · '+(scale===1?'Game-world size (scales with this window)':'Enlarged inspection');
}
window.motionPreview={renderer:r,parts,setTime(t){time=t;draw();},setPaused(v){paused=v;update();},draw};
function frame(now){if(!paused)time+=Math.min(.05,(now-last)/1000)*Number(document.querySelector('#speed').value);last=now;draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
