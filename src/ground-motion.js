export const BOTTOM_RESIDENTS=new Set(['s46','s47','s60','s61','s62','s63']);
const segmentLength=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const routeLength=route=>route.slice(1).reduce((n,p,i)=>n+segmentLength(route[i],p),0);

export function validGroundState(e){
 const route=e.groundRoute;
 return Array.isArray(route)&&route.length>=2&&route.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))&&
  route.slice(1).every((p,i)=>segmentLength(route[i],p)>0)&&Number.isFinite(e.groundDistance)&&
  e.groundDistance>=0&&e.groundDistance<=routeLength(route)&&[-1,1].includes(e.groundDirection);
}

export function positionOnGround(e){
 let remaining=e.groundDistance;
 for(let i=1;i<e.groundRoute.length;i++){
  const a=e.groundRoute[i-1],b=e.groundRoute[i],length=segmentLength(a,b);
  if(remaining<=length||i===e.groundRoute.length-1){
   const fraction=Math.max(0,Math.min(1,remaining/length));
   e.x=a[0]+(b[0]-a[0])*fraction;e.y=a[1]+(b[1]-a[1])*fraction;
   e.angle=Math.atan2((b[1]-a[1])*e.groundDirection,(b[0]-a[0])*e.groundDirection);e.facing=Math.cos(e.angle)>=0?1:-1;return;
  }
  remaining-=length;
 }
}

export function placeOnGround(e,route,fraction){
 e.groundRoute=route.map(p=>[...p]);e.groundDistance=routeLength(route)*fraction;e.groundDirection=1;positionOnGround(e);
}

// Migrate only a recognized previous authored route. Custom/diagnostic routes
// and current saves stay intact. Preserve direction and progress along a ledge.
export function migrateGroundRoutes(entities,previousRoutes,nextRoutes){
 let changed=false;
 for(const e of entities){
  if(!BOTTOM_RESIDENTS.has(e.species.id)||!validGroundState(e))continue;
  const key=JSON.stringify(e.groundRoute),index=previousRoutes.findIndex(r=>JSON.stringify(r)===key);
  if(index<0||JSON.stringify(nextRoutes[index])===key)continue;
  const fraction=e.groundDistance/routeLength(e.groundRoute),direction=e.groundDirection;
  placeOnGround(e,nextRoutes[index],fraction);e.groundDirection=direction;positionOnGround(e);
  // A prepared reach can be abandoned; a consumed meal stays consumed in the
  // food state. Stop only its obsolete visual handling at the former location.
  e.residentMeal=null;e.actionTime=0;changed=true;
 }
 return changed;
}

// Slow tube-foot travel is independent of the catalog's free-swimming speed.
export const groundSpeed=e=>e.species.id==='s47'?1.2:e.species.id==='s62'?.45:e.species.speed*.35;
export function walkOnGround(e,dt,speed=groundSpeed(e)){
 const length=routeLength(e.groundRoute);
 e.groundDistance+=speed*dt*e.groundDirection;
 while(e.groundDistance>length||e.groundDistance<0){
  if(e.groundDistance>length){e.groundDistance=2*length-e.groundDistance;e.groundDirection=-1;}
  else{e.groundDistance=-e.groundDistance;e.groundDirection=1;}
 }
 positionOnGround(e);
}

export function projectToGround(point,route){
 let best=null,along=0;
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=segmentLength(a,b);
  const t=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/(length*length)));
  const x=a[0]+dx*t,y=a[1]+dy*t,distance=Math.hypot(point.x-x,point.y-y);
  if(!best||distance<best.distance)best={x,y,distance,along:along+length*t};
  along+=length;
 }
 return best;
}

// Earlier saves have free-swimming bottom residents. Attach them to the nearest
// point on a local route when their simulation resumes, without consuming RNG.
export function attachToNearestGround(e,routes){
 let closest=null;
 for(const route of routes){let travelled=0;
  for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],length=segmentLength(a,b);
   const fraction=Math.max(0,Math.min(1,((e.x-a[0])*dx+(e.y-a[1])*dy)/(length*length)));
   const distance=Math.hypot(e.x-a[0]-dx*fraction,e.y-a[1]-dy*fraction);
   if(!closest||distance<closest.distance)closest={route,distance,along:travelled+length*fraction};
   travelled+=length;
  }
 }
 if(closest){placeOnGround(e,closest.route,0);e.groundDistance=closest.along;positionOnGround(e);}
}
