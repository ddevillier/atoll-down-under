const TAU=Math.PI*2;
export function displayPose(e,time,reduced=false){
 const mimic=e.species.ability==='mimic'&&e.abilityTime>0&&!e.target;
 const idleCleaner=e.species.ability==='clean'&&!e.service&&!e.cleanTime&&!e.cleanerTarget&&!e.behavior?.startsWith('Cleaning')&&(e.id==='player'?e.still>.3:e.station&&Math.hypot(e.x-e.station.x,e.y-e.station.y)<12);
 if(reduced||e.stun>0||(!mimic&&!idleCleaner))return {x:0,y:0,pitch:0};
 const phase=time*(mimic?5:3.8);return {x:Math.sin(phase)*2,y:Math.sin(phase*2)*(mimic?4:2),pitch:Math.sin(phase)*(mimic?.18:.10)};
}
export function abilityWater(c,e,time,reduced=false){
 if(!e.alive||e.hidden||!(e.abilityTime>0))return;
 const a=e.species.ability,t=reduced?1:time;c.save();c.translate(e.x,e.y);c.lineWidth=1.6;
 if(a==='shock'){
  c.strokeStyle='#bcebf2';c.globalAlpha=.55;
  for(let branch=0;branch<7;branch++){const angle=branch*TAU/7;c.beginPath();for(let j=0;j<5;j++){const r=18+j*17,theta=angle+Math.sin(j*2.1+branch+t*3)*.09,x=Math.cos(theta)*r,y=Math.sin(theta)*r*.65;if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
 }else if(a==='sonic'){
  c.strokeStyle='#d5ede7';for(let i=0;i<3;i++){const phase=reduced?(i+1)/4:(t*.65+i/3)%1;c.globalAlpha=(1-phase)*.45;c.beginPath();c.ellipse(0,0,22+phase*95,15+phase*60,0,0,TAU);c.stroke();}
 }else if(a==='ink'||a==='poison'){
  c.globalAlpha=.30;c.fillStyle=a==='ink'?'#142b40':'#629b71';for(let i=0;i<7;i++){c.beginPath();c.ellipse(-(e.facing||1)*(15+i*10),Math.sin(i*2.1+t*.4)*15,27+i*3,18+i*2,Math.sin(i)*.3,0,TAU);c.fill();}
 }
 c.restore();
}
