import {creatureFrame} from './geometry.js';
import {rigFor} from './animal-rigs.js';

const clamp=n=>Math.max(0,Math.min(1,n));
// Authored inspection landmarks on side-view paintings. The shrimp reaches
// down with its painted claws; the wrasse works along the lower flank.
// Progress comes from the existing treatment, never from a visual-only clock.
export function cleanerInspection(cleaner,client){
 const frame=creatureFrame(client),shrimp=cleaner.species.id==='s45';
 const phase=clamp((client.cleanTime||0)/(client.id==='player'?2:3));
 const stage=Math.min(2,Math.floor(phase*3)),local=phase*3-stage;
 // Inspect, then glide to the next area without a target-position jump.
 // Each third retains a stationary picking interval before its short transfer.
 const t=clamp((local-.65)/.35),transfer=t*t*(3-2*t),areas=[.72,.52,.35];
 const along=areas[stage]+((areas[stage+1]??areas[stage])-areas[stage])*transfer;
 const contact={x:frame.x+(along-.5)*frame.width*(client.facing||1),y:frame.y+frame.height*(shrimp?-.17:.16)};
 const facing=client.facing||1,tip=shrimp?[.94,.82]:rigFor({id:cleaner.species.id}).mouth,own=creatureFrame(cleaner);
 const x=contact.x-(tip[0]-.5)*own.width*facing,y=contact.y-(tip[1]-.5)*own.height;
 return {x,y,facing,contact,stage,phase,picking:stage===2?1:1-transfer,gap:Math.hypot(cleaner.x-x,cleaner.y-y)};
}

export function moveCleaner(cleaner,client,dt){
 const plan=client?cleanerInspection(cleaner,client):null,dest=plan||cleaner.station;
 const treating=client?.cleanTime>0;
 if(dest){const blend=1-Math.exp(-dt*(client?10:3));cleaner.x+=(dest.x-cleaner.x)*blend;cleaner.y+=(dest.y-cleaner.y)*blend;}
 // A service stance is lateral, so the contact landmark and drawn appendages
 // share a frame. Return facing stays stable until the cleaner reaches home.
 if(plan){cleaner.facing=plan.facing;cleaner.angle=plan.facing<0?Math.PI:0;}
 else if(dest&&Math.hypot(dest.x-cleaner.x,dest.y-cleaner.y)>8){cleaner.angle=Math.atan2(dest.y-cleaner.y,dest.x-cleaner.x);cleaner.facing=Math.cos(cleaner.angle)>=0?1:-1;}
 const touching=plan&&Math.hypot(cleaner.x-plan.x,cleaner.y-plan.y)<6;
 cleaner.actionTime=treating&&touching?(1+Math.sin(plan.phase*Math.PI*18))*.15*plan.picking:0;
 cleaner.behavior=treating?'Cleaning '+client.species.name:client?'Approaching a cleaning client':dest&&Math.hypot(dest.x-cleaner.x,dest.y-cleaner.y)>8?'Returning to the cleaning station':'At a cleaning station';
}

// Draw working/approaching cleaners after clients, including the player.
// Otherwise size sorting hides their mouth/claws behind the animal they help.
export function foregroundCleaner(e){return e.species.ability==='clean'&&(/^(Cleaning |Approaching a cleaning client)/).test(e.behavior||'');}
