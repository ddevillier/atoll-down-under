import {creatureFrame} from './geometry.js';import {individualSeed} from './individual-motion.js';import {turnTowards} from './steering.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function restingFootprint(e){const f=creatureFrame(e);return e.species.id==='s41'?{width:f.width*Math.cos(1.1)+f.height*Math.sin(1.1),height:f.width*Math.sin(1.1)+f.height*Math.cos(1.1)}:f;}
export function validHome(h){return h==null||typeof h==='object'&&!Array.isArray(h)&&Number.isFinite(h.x)&&Number.isFinite(h.y)&&h.x>=10&&h.x<=1590&&h.y>=25&&h.y<=720&&(h.host==null||typeof h.host==='string'||typeof h.host==='number'&&Number.isFinite(h.host));}
function chooseRoom(sim,e,candidates){
 const a=restingFootprint(e),occupied=sim.section.entities.filter(b=>b!==e&&b.alive&&b.ecology?.reef===sim.current&&validHome(b.ecology?.home)&&b.ecology?.home);
 let best=candidates[0],bestGap=-Infinity;
 for(const p of candidates){const gap=Math.min(Infinity,...occupied.map(b=>{const f=restingFootprint(b),h=b.ecology.home;return Math.hypot((p.x-h.x)/((a.width+f.width)*.5+12),(p.y-h.y)/((a.height+f.height)*.5+12));}));if(gap>=1)return p;if(gap>bestGap){bestGap=gap;best=p;}}
 return best;
}
export function refugeHome(sim,e,reef,bottom=false){
 if(validHome(e.ecology.home)&&e.ecology.home&&!e.ecology.home.host)return e.ecology.home;
 const frame=creatureFrame(e),seed=individualSeed(e.id),candidates=[];
 if(bottom){
  for(let n=0;n<reef.bottomRoutes.length;n++){const route=reef.bottomRoutes[(seed+n)%reef.bottomRoutes.length];for(let i=1;i<route.length;i++)for(const t of [.25,.5,.75])candidates.push({x:route[i-1][0]+(route[i][0]-route[i-1][0])*t,y:clamp(route[i-1][1]+(route[i][1]-route[i-1][1])*t-frame.height*.45,25,710)});}
 }else{
  for(const ring of [0,.6,1.05,1.6,2.1])for(let n=0;n<reef.shelters.length;n++){const site=reef.shelters[(seed+n)%reef.shelters.length],radius=site.r*ring;for(let i=0;i<(ring?8:1);i++){const angle=(seed%31)/31*Math.PI*2+i*Math.PI/4;candidates.push({x:clamp(site.x+Math.cos(angle)*radius,35,1565),y:clamp(site.y+Math.sin(angle)*radius,45,700)});}}
 }
 e.ecology.home=chooseRoom(sim,e,candidates);return e.ecology.home;
}
export function anemoneHome(sim,e,host){
 if(e.ecology.home?.host===host.id&&validHome(e.ecology.home))return e.ecology.home;
 const frame=creatureFrame(host),own=creatureFrame(e),first=individualSeed(e.id)%2?1:-1,candidates=[];
 for(let row=0;row<5;row++)for(const side of [first,-first])candidates.push({x:clamp(frame.x+side*(frame.width*.32+own.width*.16+row*8),35,1565),y:clamp(frame.y-frame.height*.2-row*(own.height*.8+10),45,700),host:host.id});
 e.ecology.home=chooseRoom(sim,e,candidates);return e.ecology.home;
}
export function approachRefuge(e,dest,dt,speed,stop=10,heading=null){
 const dx=dest.x-e.x,dy=dest.y-e.y,d=Math.hypot(dx,dy),near=d<Math.max(45,creatureFrame(e).width*.4);
 e.angle=turnTowards(e.angle,near&&heading!=null?heading:Math.atan2(dy,dx),e.species.agility*dt);
 if(d<=stop)return 0;
 if(near){const step=Math.min(d-stop,speed*.5*dt,(d-stop)*3*dt);e.x+=dx/d*step;e.y+=dy/d*step;return 0;}
 return Math.min(speed,(d-stop)*1.3,(d-stop)/Math.max(dt,.001));
}
export function compatibleShadow(e,b){
 if(b===e||!b.alive||b.hidden||b.target||b.cleanTime||b.cleanerTarget||b.stun>0||b.holdfast||b.groundRoute||b.species.ability==='clean'||b.species.speed<=0)return false;
 if(b.species.diet.includes('fish')&&e.species.size<b.species.size*.77)return false;
 const a=creatureFrame(e),f=creatureFrame(b);return f.width>a.width*.7&&f.width*f.height>a.width*a.height*1.25;
}
export function refugeLayers(entities){
 const ordered=[...entities].sort((a,b)=>a.species.size-b.species.size);
 for(const e of entities.filter(e=>e.activity==='shadowing')){const host=ordered.find(b=>b.id===e.ecology?.host);if(!host)continue;ordered.splice(ordered.indexOf(e),1);ordered.splice(ordered.indexOf(host),0,e);}
 return ordered;
}
