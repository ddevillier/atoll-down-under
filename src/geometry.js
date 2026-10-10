import {anatomy} from './creation-appearance.js';
// Widescreen readability: small creatures need enough pixels to show anatomy.
// Ecological size remains separate for diets, movement and feeding rules.
import {SPRITE_DIMENSIONS} from './sprite-metrics.js';
export function creatureWidth(species){return Math.max(species.size,28+species.size*.75);}
const SUPPORT={s44:[.64,.93],s46:[.50,.88],s47:[.50,.50],s60:[.50,.89],s61:[.50,.89],s62:[.50,.95],s63:[.50,.98]};
export function groundPitch(e){return e.groundRoute&&['s46','s60','s61'].includes(e.species.id)?Math.max(-.16,Math.min(.16,Math.atan(Math.tan(e.angle||0)))):0;}
export function creatureFrame(e,width=creatureWidth(e.species),rotation=groundPitch(e)){
 const [w,h]=SPRITE_DIMENSIONS[e.species.index]||[1,1],height=e.species.appearance?.appearanceVersion===1?width*anatomy(e.species).height:width*h/w;
 const anchor=(e.groundRoute||e.holdfast)&&SUPPORT[e.species.id]||[.5,.5];
 const facing=['s44','s46','s47','s62','s63'].includes(e.species.id)?1:e.facing||1;
 const dx=(anchor[0]-.5)*width*facing,dy=(anchor[1]-.5)*height,cos=Math.cos(rotation),sin=Math.sin(rotation);
 return {x:e.x-dx*cos+dy*sin,y:e.y-dx*sin-dy*cos,width,height,anchor,rotation};
}
// Display geometry is transient presentation state, never part of a saved animal.
const displayedFrames=new WeakMap();
export function setCreatureDisplayFrame(e,frame){
 displayedFrames.set(e,{frame:{...frame},x:e.x,y:e.y,species:e.species,incarnation:e.incarnation||0});
}
export function creaturePickFrame(e){
 const displayed=displayedFrames.get(e);
 if(!displayed||displayed.species!==e.species||displayed.incarnation!==(e.incarnation||0)||Math.hypot(e.x-displayed.x,e.y-displayed.y)>200)return creatureFrame(e);
 return {...displayed.frame,x:displayed.frame.x+e.x-displayed.x,y:displayed.frame.y+e.y-displayed.y};
}
export function creatureHit(e,point){
 const frame=creaturePickFrame(e),dx=point.x-frame.x,dy=point.y-frame.y;
 const rotation=frame.rotation||0,cos=Math.cos(rotation),sin=Math.sin(rotation),x=dx*cos+dy*sin,y=-dx*sin+dy*cos;
 return (x/Math.max(17,frame.width*.5+6))**2+(y/Math.max(17,frame.height*.5+6))**2<1;
}
