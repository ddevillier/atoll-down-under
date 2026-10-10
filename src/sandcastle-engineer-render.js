import {displayedMouthPoint} from './feeding-contact.js';

const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const grainColors=['#ecdcae','#c4b38c','#fff0c7','#d9c899'];
const algaeColors=['#98b855','#b0c878','#779848'];
const seedOf=id=>Array.from(String(id)).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);
const noise=(seed,n)=>{const x=Math.sin(seed*.013+n*127.1)*43758.5453;return x-Math.floor(x);};

// Changes belong to the recorded food resource, not a decorative scene overlay.
// Drawing consumes state only: observation, screenshots, and reduced motion must
// never advance deposition, algae recovery, or a neighbor's actual meal.
export function drawStory(renderer,sim,time=0){
 const story=sim?.reefStories?.engineer,c=renderer?.ctx;
 if(!c||!story)return;
 const reduced=!!renderer.reducedMotion,t=reduced?0:time;
 const active=['engineer','sandcastle-engineer'].includes(sim.reefStories.active)&&[0,1].includes(sim.current);
 const patches=story.patches.filter(p=>p.reef===sim.current);
 // Before a first bite, use the very same live footprint for existing algae.
 // A meal therefore removes visible foliage, rather than enlarging the artwork.
 const untouched=active?(sim.section?.food||[]).filter(f=>f.food==='algae'&&!patches.some(p=>p.id===f.id)):[];
 c.save();
 for(const food of untouched)drawPatch(c,renderer.foodSprites?.[0],{...food,algae:food.regrow>0?0:food.amount,after:food.regrow>0?0:food.amount,sand:0,deposit:0},t,reduced);
 for(const patch of patches){
  if(!Number.isFinite(patch.x)||!Number.isFinite(patch.y))continue;
  drawPatch(c,renderer.foodSprites?.[0],patch,t,reduced);
 }
 if(active){
  const selected=(sim.section?.food||[]).find(f=>f.id===story.selected&&f.food==='algae');
  if(selected){
   // Ground ticks identify the chosen resource without outlining every organism.
   c.lineCap='round';c.beginPath();
   for(const side of [-1,1]){c.moveTo(selected.x+side*48,selected.y+11);c.lineTo(selected.x+side*48,selected.y+21);c.lineTo(selected.x+side*40,selected.y+21);}
   c.strokeStyle='#123d41';c.lineWidth=3.5;c.stroke();c.strokeStyle='#f2dda0';c.lineWidth=1.5;c.stroke();
  }
 }
 drawNeighbor(c,sim,story,reduced);
 c.restore();
}
function drawPatch(c,sprite,p,t,reduced){
 const seed=seedOf(p.id),ground=p.y+18;
 drawSettledSand(c,p,seed,ground);
 // Five staggered tufts form one food patch. A bite opens a real gap in that
 // patch's silhouette; the unchanged habitat painting remains visible through it.
 const remaining=clamp(p.algae||0,0,100)/20,old=clamp(Math.min(p.after??p.algae,p.algae)||0,0,100)/20;
 for(let i=0;i<5;i++){
  const rank=(i+(seed%5))%5,health=clamp(remaining-rank,0,1),older=clamp(old-rank,0,1);
  if(health<=0)continue;
  const x=p.x+(i-2)*17+noise(seed,i)*4-2,y=ground+Math.sin(i*1.9+seed)*2;
  const height=31+noise(seed,i+11)*13,width=height*(sprite?sprite.width/sprite.height:.7)*.73;
  const young=Math.max(0,health-older);
  c.save();c.translate(x,y);
  if(!reduced)c.rotate(Math.sin(t*.65+i+seed)*.025);
  if(sprite&&older>0){
   // Remove upper foliage while preserving the food painting's little substrate
   // base. This is a bite scar, rather than shrinking the whole food and its rock.
   const visible=height*(.28+.72*older),sourceHeight=sprite.height*visible/height;
   c.drawImage(sprite,0,sprite.height-sourceHeight,sprite.width,sourceHeight,-width/2,-visible,width,visible);
  }
  if(young>0){
   // The same painted foliage returns as shorter young tufts. Sparse live blade
   // geometry adds tender tips without turning the reef into a drawn grass scene.
   const h=height*(.18+.78*health),w=width*(.4+.6*health);
   if(sprite)c.drawImage(sprite,0,0,sprite.width,sprite.height*.78,-w/2,-h,w,h);
   const blades=sprite?2:Math.max(2,Math.ceil(young*7));
   c.lineCap='round';
   for(let j=0;j<blades;j++){
    const start=(j-(blades-1)/2)*3.5,lean=(noise(seed,i*17+j+31)-.5)*5;
    const tip=-Math.min(sprite?12:height,h)*(.7+.3*noise(seed,i*19+j+64));
    c.strokeStyle=algaeColors[j%3];c.lineWidth=.85;
    c.beginPath();c.moveTo(start,-2);c.bezierCurveTo(start-lean*.25,tip*.35,start+lean,tip*.75,start+lean*.7,tip);c.stroke();
   }
  }  c.restore();
 }
 if(p.deposit>0&&!reduced)drawFallingSand(c,p,seed,ground);
}

function drawSettledSand(c,p,seed,ground){
 const sand=clamp(p.sand||0,0,4);if(sand<=0)return;
 const count=Math.min(88,Math.ceil(sand*58)),spread=25+Math.sqrt(sand)*22;
 for(let i=0;i<count;i++){
  // Asymmetric grains accumulate beneath and down-current from this meal.
  // No filled ellipse, ring, or procedural replacement for the painted reef.
  const r=noise(seed,i+110),x=p.x+8+(r*r)*spread-9;
  const y=ground+4+noise(seed,i+220)*9+Math.sin(r*4)*3;
  c.fillStyle=grainColors[i%grainColors.length];c.globalAlpha=.64+noise(seed,i+330)*.26;
  c.beginPath();c.ellipse(x,y,.6+noise(seed,i+440)*.9,.3+noise(seed,i+550)*.5,noise(seed,i+660)*.65,0,TAU);c.fill();
 }
 c.globalAlpha=1;
}

function drawFallingSand(c,p,seed,ground){
 const pending=clamp(p.deposit,0,.8),age=(1-Math.min(1,pending/.35))*2;
 for(let i=0;i<22;i++){
  const released=noise(seed,i+710)*.48,elapsed=age-released;
  if(elapsed<0||elapsed>1.6)continue;
  const life=elapsed/1.6,fan=(noise(seed,i+720)-.5)*(5+life*24);
  const x=p.x+7+fan+life*20,y=p.y-16+noise(seed,i+740)*4+(ground-p.y+25)*life*life;
  c.globalAlpha=(1-life*.58)*.76;c.fillStyle=grainColors[i%grainColors.length];
  c.beginPath();c.ellipse(x,y,.65+noise(seed,i+760)*.7,.4+noise(seed,i+780)*.45,.25,0,TAU);c.fill();
 }
 c.globalAlpha=1;
}

function drawNeighbor(c,sim,story,reduced){
 const record=story.neighbor;if(!record)return;
 const patch=story.patches.find(p=>p.id===record.patch&&p.reef===sim.current);
 const neighbor=sim.section?.entities?.find(e=>e.id===record.id&&(e.incarnation||0)===record.incarnation&&e.alive&&!e.hidden);
 if(!patch||!neighbor)return;
 const meal=neighbor.feeding;
 if(!meal?.committed||meal.target!==patch.id)return;
 const elapsed=meal.elapsed-meal.contactAt;
 if(elapsed<0||elapsed>.36)return;
 const mouth=displayedMouthPoint(neighbor),progress=reduced?1:clamp(elapsed/.18,0,1),ease=progress*progress*(3-2*progress);
 // Three algae fragments meet the existing neighbor's displayed mouth at the
 // committed feeding contact. Approaching fish get no invented success effect.
 const x=meal.x+(mouth.x-meal.x)*ease,y=meal.y+(mouth.y-meal.y)*ease;
 c.globalAlpha=clamp((.36-elapsed)/.18,0,1);
 for(let i=0;i<3;i++){
  c.strokeStyle=algaeColors[i];c.lineWidth=1.5;c.lineCap='round';c.beginPath();
  c.moveTo(x+(i-1)*2,y+2-i);c.quadraticCurveTo(x+(i-1)*3,y-1-i,x+(i-1)*2+2,y-3-i);c.stroke();
 }
 c.globalAlpha=1;
}



