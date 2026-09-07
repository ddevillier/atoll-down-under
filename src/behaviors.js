// Authored behavior profiles are independent of the habitat label.
// Sources and biological limits are documented in SPECIES-ADVENTURES.md.
import {animalProfile} from './animal-profiles.js';
export const profileFor=s=>{const p=animalProfile(s);return {...p,social:p.social==='school'||p.social==='small-group'};};
export const ACTIVITY={school:'schooling',feed:'feeding',clean:'cleaning',home:'at-home',return:'returning-home',search:'searching-sand',blend:'blending',avoid:'avoiding',cruise:'cruising'};
export function animationPhase(id){let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return (h%997)/997*6.283;}
export function activityOf(e){return e.activity||'cruising';}
export function setActivity(e,id){e.activity=id;}
