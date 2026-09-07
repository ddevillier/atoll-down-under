// Actual displacement, including avoidance and docking, is used for following a
// moving meal. Teleports/respawns must not become a one-frame velocity impulse.
export function recordVelocity(e,previous,dt){
 const dx=e.x-previous.x,dy=e.y-previous.y,limit=Math.max(1,e.species.speed*2.5);
 if(dt>0&&e.alive&&previous.alive&&Math.hypot(dx,dy)<=limit*dt){e.vx=dx/dt;e.vy=dy/dt;}
 else{e.vx=0;e.vy=0;}
}
