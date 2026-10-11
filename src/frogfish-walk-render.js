import {walkerPose,WALK_GRAPH} from './frogfish-walk.js';
import {PaintedParts} from './part-motion.js';
import {creatureWidth,setCreatureDisplayFrame} from './geometry.js';

// These landmarks belong to the existing painted Antennarius pictus silhouette.
// Its walking feet replace the swimming fin pieces, rather than covering them.
const LANDMARKS={
 pectoral:{root:[.643,.647],tip:[.546,.792]},
 // The distal ray is opaque in the live 343×243 extracted/cut sprite. The
 // neighbouring atlas fringe is translucent and cannot serve as a planted toe.
 pelvic:{root:[.658,.806],tip:[213/343,238/243]},
};
const artPaths={ledge:'assets/story-walker/limestone-ledge-v1.png',sponge:'assets/story-walker/orange-sponge-v1.png'};
const image=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not load '+src));im.src=src;});
export async function loadWalkerArt(renderer){
 if(renderer.walkerArt)return renderer.walkerArt;
 renderer.walkerArt=Object.fromEntries(await Promise.all(Object.entries(artPaths).map(async([key,path])=>[key,await image(path)])));
 return renderer.walkerArt;
}
function active(sim){return ['walker','frogfish-walk'].includes(sim?.reefStories?.active)&&sim?.current===WALK_GRAPH.reef;}
export function appearanceFor(renderer,sim,fish,time=0){
 if(!sim||!fish)return null;
 const pose=walkerPose(sim,fish);
 return pose?{pose,rotation:pose.body.rotation||0,physical:true}:null;
}

// Map source root and painted toe to their authoritative world positions.
// Along-limb extension follows support transfer; transverse width stays painted.
// The distal landmark is exact even while the shoulder travels over its foot.
export function finPlacement(pose,contact,width,height){
 const points=LANDMARKS[contact.kind];if(!points)return null;
 const angle=pose.body.rotation||0,facing=pose.body.facing??1,cos=Math.cos(angle),sin=Math.sin(angle);
 const localX=(points.root[0]-.5)*width*facing,localY=(points.root[1]-.5)*height;
 const root={x:pose.body.x+localX*cos-localY*sin,y:pose.body.y+localX*sin+localY*cos};
 const sourceRoot={x:points.root[0]*width,y:points.root[1]*height};
 const sourceTip={x:points.tip[0]*width,y:points.tip[1]*height};
 const sx=sourceTip.x-sourceRoot.x,sy=sourceTip.y-sourceRoot.y,length=Math.hypot(sx,sy),ux=sx/length,uy=sy/length;
 const dx=contact.x-root.x,dy=contact.y-root.y,distance=Math.hypot(dx,dy),far=contact.id.endsWith('-far');
 const vx=dx/length,vy=dy/length,spread=far?.68:1,nx=-dy/Math.max(.001,distance)*spread,ny=dx/Math.max(.001,distance)*spread;
 // Source basis [u, perpendicular(u)] -> target [root-to-toe, fan width].
 const matrix=[vx*ux-nx*uy,vy*ux-ny*uy,vx*uy+nx*ux,vy*uy+ny*ux,root.x,root.y];
 return {id:contact.id,kind:contact.kind,root,tip:{x:contact.x,y:contact.y},sourceRoot,sourceTip,matrix,planted:!!contact.planted,far};
}
export function walkLandmarks(pose,width,height){return pose.contacts.map(contact=>finPlacement(pose,contact,width,height));}

// Call before the ordinary creature renderer, in the current world transform.
// Returning true means the complete creature was painted here exactly once.
export function drawCreature(renderer,sim,fish,time=0,normalDrawFn=null){
 const appearance=appearanceFor(renderer,sim,fish,time),c=renderer?.ctx,im=renderer?.sprites?.[fish.species.index];
 if(!appearance||!c||!im)return false;
 const pose=appearance.pose,width=creatureWidth(fish.species),height=width*im.height/im.width;
 renderer.walkerParts??=new PaintedParts();
 const prepared=renderer.walkerParts.prepare(im,'s54'),limbs=walkLandmarks(pose,width,height);
 const frame={x:pose.body.x,y:pose.body.y,width:width*Math.abs(pose.body.facing??1),height,rotation:pose.body.rotation||0,facing:pose.body.facing??1};
 setCreatureDisplayFrame(fish,frame);
 renderer.poses??=new Map();
 const previous=renderer.poses.get(fish.id)||{};
 renderer.poses.set(fish.id,{...previous,x:fish.x,y:fish.y,facing:frame.facing,frame,incarnation:fish.incarnation||0,walking:true,walkingLimbs:limbs});
 c.save();
 // Contact shadows stay tied to the foot and vanish while that fin swings.
 for(const limb of limbs)if(limb.planted){c.fillStyle='#172e22';c.globalAlpha=limb.far?.16:.32;c.beginPath();c.ellipse(limb.tip.x,limb.tip.y+1.2,3.8,1.25,0,0,Math.PI*2);c.fill();}
 c.globalAlpha=1;
 for(const limb of limbs.filter(l=>l.far))drawFin(c,prepared,im,limb,width,height);
 c.save();c.translate(frame.x,frame.y);c.rotate(frame.rotation);c.scale(frame.facing,1);
 c.drawImage(prepared.body,-width/2,-height/2,width,height);
 // Rigid tail, anal fin, folded lure and closed jaw reconstruct the intact body.
 // None runs a swimming cycle while the animal owns grounded contacts.
 for(const p of prepared.pieces)if(!LANDMARKS[p.name])c.drawImage(p.canvas,p.left/im.width*width-width/2,p.top/im.height*height-height/2,p.canvas.width/im.width*width,p.canvas.height/im.height*height);
 c.restore();
 for(const limb of limbs.filter(l=>!l.far))drawFin(c,prepared,im,limb,width,height);
 c.restore();
 return true;
}
function drawFin(c,prepared,image,limb,width,height){
 const piece=prepared.pieces.find(p=>p.name===limb.kind);if(!piece)return;
 c.save();c.globalAlpha=limb.far?.74:1;c.transform(...limb.matrix);
 c.drawImage(piece.canvas,piece.left/image.width*width-limb.sourceRoot.x,piece.top/image.height*height-limb.sourceRoot.y,piece.canvas.width/image.width*width,piece.canvas.height/image.height*height);
 c.restore();
 // Publish this only after the real cutout draw, so inspection can distinguish
 // painted geometry from a requested contact whose sprite part was absent.
 limb.painted=true;
 limb.sourcePiece={left:piece.left,top:piece.top,width:piece.canvas.width,height:piece.canvas.height};
}

// Terrain uses painted alpha contours. Small support strokes are interaction
// marks on its real upper edge, not replacement rock illustrations.
export function drawStory(renderer,sim,time=0){
 if(!active(sim)||!renderer?.ctx)return;
 const c=renderer.ctx,story=sim.reefStories.walker,art=renderer.walkerArt;
 if(!art)return;
 c.save();
 for(const edge of WALK_GRAPH.edges)drawSupport(c,art.ledge,edge.surface);
 for(const node of WALK_GRAPH.nodes)drawSupport(c,art.ledge,node.surface);
 for(const obstacle of WALK_GRAPH.obstacles){
  // The opaque sponge sits inside the same authored collision envelope.
  c.drawImage(art.sponge,obstacle.x-obstacle.radius,obstacle.y-obstacle.radius,obstacle.radius*2,obstacle.radius*2);
 }
 const node=WALK_GRAPH.nodes.find(n=>n.id===story?.node);
 if(node&&['walk','inspect','settle'].includes(story.stage)){
  const options=WALK_GRAPH.edges.filter(e=>e.from===node.id);
  c.lineCap='round';
  const targets=story.phase==='detached'||story.phase==='approach'?[node]:options.map(edge=>WALK_GRAPH.nodes.find(n=>n.id===edge.to));
  for(const target of targets){c.beginPath();c.moveTo(target.x-13,target.y+2);c.lineTo(target.x+13,target.y+2);c.strokeStyle='#163c43';c.lineWidth=4;c.stroke();c.strokeStyle='#f5dfa2';c.lineWidth=1.6;c.stroke();}
 }
 c.restore();
}
function drawSupport(c,image,surface){
 if(!Array.isArray(surface)||surface.length!==4)return;
 // Store support direction independently from traversal direction. A leftward
 // route still has its painted stone face below the roof, never upside down.
 const [a,b,d,e]=surface,[x1,y1,x2,y2]=a<=d?[a,b,d,e]:[d,e,a,b],angle=Math.atan2(y2-y1,x2-x1),length=Math.hypot(x2-x1,y2-y1);
 c.save();c.translate(x1,y1);c.rotate(angle);
 // The central painted plateau supplies the support; rounded alpha edges
 // overhang it by a small fixed amount. Author physics against that footprint.
 c.drawImage(image,-5,-5.92,length+10,18);c.restore();
}
