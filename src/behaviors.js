// Authored behavior profiles are independent of the habitat label.
// Sources and biological limits are documented in SPECIES-ADVENTURES.md.
import {animalProfile} from './animal-profiles.js';
import {individualSeed} from './individual-motion.js';
export const profileFor=s=>{const p=animalProfile(s);return {...p,social:p.social==='school'||p.social==='small-group'};};
export const ACTIVITY={school:'schooling',feed:'feeding',clean:'cleaning',home:'at-home',return:'returning-home',search:'searching-sand',blend:'blending',avoid:'avoiding',cruise:'cruising'};
export function animationPhase(id){return individualSeed(id)/4294967296*Math.PI*2;}
export function activityOf(e){return e.activity||'cruising';}
export function setActivity(e,id){e.activity=id;}
