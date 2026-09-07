// Stylized sprite articulation, not a biomechanical model. u runs from tail (0) to head (1).
export function motionKind(species){
 if(species.index===26)return 'eel';
 if([27,37].includes(species.index))return 'ray';
 if(species.index===19)return 'cuttlefish';
 if(species.index===44)return 'seahorse';
 if(species.speed===0)return 'still';
 if(species.food!=='fish')return 'invertebrate';
 if([32,33,34,35,36].includes(species.index))return 'shark';
 return 'fish';
}
export function bodyMotion(kind,u,time,activity=1){
 const effort=.3+.7*Math.max(0,Math.min(1,activity));
 if(kind==='eel')return {offset:Math.sin(time*4.2-u*9)*Math.pow(1-u,.7)*.045*effort,stretch:1};
 if(kind==='ray')return {offset:Math.sin(time*2.8+u*4)*Math.sin(Math.PI*u)*.012*effort,stretch:1+Math.sin(time*2.8+u*4)*.025};
 if(kind==='cuttlefish')return {offset:0,stretch:1+Math.sin(time*4.3-u*12)*Math.max(0,Math.sin(Math.PI*Math.min(u/.8,1)))*.045};
 if(kind==='fish'||kind==='shark')return {offset:Math.sin(time*(kind==='shark'?3.1:5.2)+u*4)*Math.max(0,1-u/.65)**2*(kind==='shark'?.017:.03)*effort,stretch:1};
 return {offset:0,stretch:1};
}

export function poseFor(fish,time,reduced=false){
 if(reduced)return {pitch:0,squash:1};
 const feeding=(fish.actionTime||0)>0||fish.activity==='searching-sand';
 const climb=Math.sin(fish.angle||0)*.12*(fish.facing||1);
 const settle=['at-home','blending'].includes(fish.activity);
 return {pitch:settle?Math.sin(time*.7)*.015:feeding?.12*(fish.facing||1)+Math.sin(time*8)*.025:climb,squash:feeding?1+Math.sin(time*9)*.025:1};
}
