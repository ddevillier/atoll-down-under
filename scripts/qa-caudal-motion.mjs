import fs from 'node:fs';import {SPECIES} from '../src/data.js';import {PART_RIGS,partPose,bodyPoint,partTransform} from '../src/part-motion.js';import {animalProfile} from '../src/animal-profiles.js';import {deformPoint} from '../src/articulated-motion.js';import {FIN_RIGS} from '../src/fin-motion.js';import {RIGID_RIGS} from '../src/rigid-motion.js';import {SPRITE_DIMENSIONS} from '../src/sprite-metrics.js';import {creatureWidth} from '../src/geometry.js';
const excluded=new Set(['s19','s27','s37','s44','s45','s46','s47','s60','s61','s62','s63']);
function paintedPoint(id,p,u,v,time,effort,aspect){
 const {ax,ay,matrix:m}=partTransform(id,p,1,aspect,time,effort),x=u-ax,y=v*aspect-ay;
 return {x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]};
}
const results=[];
for(const s of SPECIES.filter(s=>!excluded.has(s.id))){const profile=animalProfile(s),rig=PART_RIGS[s.id],part=rig?.parts.find(p=>p.name==='tail'),dims=SPRITE_DIMENSIONS[s.index],aspect=dims[1]/dims[0],width=creatureWidth(s);const fin=(FIN_RIGS[s.id]||RIGID_RIGS[s.id])?.tail;
 const points=part?part.polygon.filter(([u])=>u<Math.max(...part.hinge.map(a=>a[0]))-.02):fin?[fin.tip,[fin.tip[0],fin.tip[1]-.06],[fin.tip[0],fin.tip[1]+.06]]:[[.02,profile.axis],[.06,profile.axis-.06],[.06,profile.axis+.06]];
 for(const effort of [.15,.5,1]){const tracks=points.map(()=>[]);for(let k=0;k<240;k++){const time=k/240/(rig?.frequency||profile.frequency);points.forEach(([u,v],j)=>{let q=part?paintedPoint(s.id,part,u,v,time,effort,aspect):deformPoint(profile,u,v,time,effort,{aspect});if(!part)q={x:q.x,y:q.y*aspect};tracks[j].push(q);});}const span=axis=>Math.max(...tracks.map(t=>Math.max(...t.map(q=>q[axis]))-Math.min(...t.map(q=>q[axis]))));results.push({id:s.id,name:s.name,path:part?'painted':'mesh',effort,width,verticalPercent:span('y')*100,verticalPixels:span('y')*width,horizontalPercent:span('x')*100});}
}
if(results.length!==159||results.some(r=>r.verticalPercent>=1||r.effort===1&&r.horizontalPercent<.1))throw Error('Caudal coverage or movement acceptance failed');
const file=process.argv[2]||'artifacts/caudal-audit.json';fs.writeFileSync(file,JSON.stringify({scope:'Peak-to-peak displacement of the same authored tail landmarks over 240 phases. Body-local coordinates exclude whole-animal translation, pitch and turning. Percent of sprite width. Three effort levels per caudal fish; rays, cuttlefish, seahorse and invertebrates excluded.',species:results.length/3,results},null,2));console.log(JSON.stringify(results.filter(x=>x.effort===1).sort((a,b)=>b.verticalPercent-a.verticalPercent).slice(0,10),null,2));
