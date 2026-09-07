import {SPECIES} from './data.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class TitleReef{
 constructor(){this.time=0;this.pointer=null;this.bubbles=[];this.rewards=[];this.reactionUntil=0;this.lastClick=-10;}
 move(x,y){this.pointer={x,y};}
 leave(){this.pointer=null;}
 click(x,y){if(this.time-this.lastClick<.6)return;this.lastClick=this.time;this.reactionUntil=this.time+3;this.bubbles.push({x,y,start:this.time});this.bubbles=this.bubbles.slice(-4);}
 actors(reduced=false){
  const t=reduced?0:this.time,actors=[];
  const add=(id,index,x,y,w,facing=1,behavior='Cruising')=>{
   const r=w*.6;
   // Keep full silhouettes out of the central lettering and menu band.
   if(x+r>540&&x-r<1110&&y+r>250&&y-r<755)y=250-r;
   actors.push({id,species:SPECIES[index],x:clamp(x,r,1600-r),y:clamp(y,65+r,900-r),w,facing,behavior});
  };
  for(let school=0;school<2;school++)for(let i=0;i<5;i++){
   const phase=t*.13+school*Math.PI,x=school?300+Math.cos(phase)*120:940+Math.sin(phase)*340,y=school?440+Math.sin(phase)*130:135+Math.cos(phase)*32;
   const close=this.pointer&&Math.hypot(this.pointer.x-x,this.pointer.y-y)<200;
   add('school-'+school+'-'+i,0,x+(i-2)*38,y+(i%2)*20+(close&&!reduced?25:0),35,(school?-Math.sin(phase):Math.cos(phase))>=0?1:-1,'Schooling');
  }
  for(let i=0;i<4;i++){
   let x=i<2?1300+Math.sin(t*.15+i*2)*110:180+Math.sin(t*.13+i)*90,y=330+i%2*260+Math.cos(t*.2+i)*32;
   if(!reduced&&this.pointer&&Math.hypot(this.pointer.x-x,this.pointer.y-y)<180){x+=(this.pointer.x-x)*.18;y+=(this.pointer.y-y)*.18;}
   add('curious-'+i,[5,7,4,8][i],x,y,[90,64,76,55][i],i<2?-1:1,'Curious');
  }
  const cleaning=t%22<9;
  add('client',12,350+(cleaning?0:Math.sin(t*.28)*80),665,92,-1,cleaning?'Being cleaned':'Visiting cleaner');
  add('cleaner',43,cleaning?320+Math.sin(t*1.8)*12:275,cleaning?675+Math.cos(t*1.8)*9:690,45,1,cleaning?'Cleaning':'Waiting');
  const shy=!reduced&&this.reactionUntil>t;
  add('eel',26,shy?105:140+Math.sin(t*.12)*22,520,shy?50:85,1,'Peeking');
  add('shrimp',45,shy?1490:1420,710,shy?22:42,-1,'Peeking');
  if(this.rewards.includes('ray'))add('reward-ray',27,800+Math.sin(t*.075)*560,150,145,Math.cos(t*.075)>=0?1:-1,'Gliding');
  if(this.rewards.includes('seahorse'))add('reward-seahorse',44,1470,620+Math.sin(t*.2)*5,65,-1,'Among plants');
  if(this.rewards.includes('cuttlefish'))add('reward-cuttlefish',19,1250+Math.sin(t*.12)*60,450+Math.cos(t*.12)*80,96,-1,'Hovering');
  if(this.rewards.includes('school'))for(let i=0;i<3;i++)add('reward-school-'+i,[5,7,4][i],1150+i*65+Math.sin(t*.15)*45,790+i%2*24,48,-1,'Schooling');
  return actors;
 }
 draw(renderer,c,dt,reduced,blocked){
  if(!blocked)this.time+=dt;
  for(const a of this.actors(reduced))renderer.drawSprite(c,a.species,a.x,a.y,a.w,a.facing,reduced?0:this.time,a.id.startsWith('school-')?.72:1);
  if(!reduced){c.save();c.globalAlpha=.035+.015*Math.sin(this.time*.15);c.fillStyle='#d9f5e5';c.beginPath();c.moveTo(1260,65);c.lineTo(1440,65);c.lineTo(1180,790);c.lineTo(1120,790);c.fill();c.restore();}
  this.bubbles=this.bubbles.filter(b=>this.time-b.start<1.6);
  for(const b of this.bubbles){const age=this.time-b.start;c.save();c.globalAlpha=(1-age/1.6)*.55;c.strokeStyle='#e3f5e9';c.lineWidth=1.5;for(let i=0;i<3;i++){c.beginPath();c.arc(b.x+(i-1)*9,b.y-(reduced?0:age*40+i*8),3+i,0,Math.PI*2);c.stroke();}c.restore();}
 }
}
