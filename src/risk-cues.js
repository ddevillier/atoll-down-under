export const PROTECTED_WATCHING='Watching safely';
const reasons={meal:'Meal started',ability:'Ability used',travel:'Habitat entered',activity:'Reef life',care:'Helping a fish'};
export const predatorPolicy=sim=>sim.mode==='practice'?{damage:18,grace:4,recoveryDelay:5,recoveryRate:1.2}:{damage:35,grace:1.8,recoveryDelay:10,recoveryRate:.4};
export function enterReefLife(sim,reason='activity'){
 if(!sim.protected)return;
 sim.protected=false;sim.riskCue={reason,until:sim.time+8};
 if(!sim.trial)sim.event('reef-life','Reef life');
}
export function validRiskCue(c){return c==null||typeof c==='object'&&Object.hasOwn(reasons,c.reason)&&Number.isFinite(c.until)&&c.until>=0;}
export function riskStatus(sim){
 if(sim.protected)return PROTECTED_WATCHING;
 const p=sim.player,pursuers=sim.section.entities.filter(e=>e.alive&&e.target==='player');
 if(p.hurtGrace>0)return 'Rest to recover';
 if(pursuers.length){const ability=!['none','toxic','crush','clean'].includes(p.species.ability)&&p.cooldown<=0&&p.energy>=12&&p.stun<=0;return ability?'Cover or Space':'Swim toward cover';}
 if(sim.riskCue?.until>sim.time)return reasons[sim.riskCue.reason];
 return '';
}
