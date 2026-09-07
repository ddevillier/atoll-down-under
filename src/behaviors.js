// Authored behavior profiles are independent of the habitat label.
// Sources and biological limits are documented in SPECIES-ADVENTURES.md.
export const PROFILES={s0:{social:true},s11:{social:true},s42:{social:true},s55:{social:true},s28:{social:true},s53:{social:true},s2:{routine:'home'},s23:{routine:'sand'},s19:{routine:'blend'}};
export const profileFor=s=>PROFILES[s.id]||{};
export const ACTIVITY={school:'schooling',feed:'feeding',clean:'cleaning',home:'at-home',return:'returning-home',search:'searching-sand',blend:'blending',avoid:'avoiding',cruise:'cruising'};
export function animationPhase(id){let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return (h%997)/997*6.283;}
export function activityOf(e){return e.activity||'cruising';}
export function setActivity(e,id){e.activity=id;}
