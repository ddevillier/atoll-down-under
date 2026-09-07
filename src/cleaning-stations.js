import {creatureWidth} from './geometry.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const radius=fish=>creatureWidth(fish.species)/2+12;

// Recompute from live state, without random draws or a second saved queue.
// The current client finishes first; a requested player visit goes next.
export function planCleaning(cleaner,player,entities,width,height){
 if(!cleaner?.alive)return null;
 const station=cleaner.station||cleaner,dock={x:station.x+35,y:station.y};
 const clients=entities.filter(e=>e!==cleaner&&e.alive&&e.species.parasites&&e.species.speed>0&&!e.holdfast&&e.health<65);
 const active=clients.find(e=>e.target===cleaner.id&&e.cleanTime>0);
 const playerNeedsHelp=player.species.parasites&&100-player.health-(player.poisonDamage||0)-(player.biteDamage||0)>1;
 const playerVisiting=player.cleanerTarget===cleaner.id||player.cleanTime>0||
  (playerNeedsHelp&&!player.target&&player.still>.6&&distance(player,cleaner)<105);
 const client=active||(playerVisiting?player:clients.filter(e=>!(e.stun>0)).sort((a,b)=>distance(a,dock)-distance(b,dock))[0])||null;
 const destinations=new Map();
 if(client)destinations.set(client.id,dock);
 const waiting=[...(playerVisiting&&client!==player?[player]:[]),...clients.filter(e=>e!==client)];
 const occupied=[{...dock,r:client?radius(client):50}];
 const angle=Math.atan2(height/2-station.y,width/2-station.x);
 for(const fish of waiting){
  const r=radius(fish);let chosen=null,best=null,bestClearance=-Infinity;
  // Search outward from the station, preferring the open side of the screen.
  // Full body margins keep stations near an edge from stacking clamped slots.
  for(let ring=1;ring<=12&&!chosen;ring++){
   for(let i=0;i<24;i++){
    const turn=(i%2?1:-1)*Math.ceil(i/2)*Math.PI/12;
    const candidate={x:dock.x+ring*70*Math.cos(angle+turn),y:dock.y+ring*70*Math.sin(angle+turn)};
    if(candidate.x<r||candidate.x>width-r||candidate.y<r||candidate.y>height-r)continue;
    const clearance=Math.min(...occupied.map(p=>distance(candidate,p)-p.r-r));
    if(clearance>bestClearance){best=candidate;bestClearance=clearance;}
    if(clearance>=0){chosen=candidate;break;}
   }
  }
  // Extremely crowded imported saves still receive the best available space.
  chosen=chosen||best||{x:width/2,y:height/2};
  destinations.set(fish.id,chosen);occupied.push({...chosen,r});
 }
 return {cleaner,client,destinations};
}
