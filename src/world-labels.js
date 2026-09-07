const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function overlaps(a,b,gap=0){return a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;}
export function projectedBounds(frame,padding=0){
 const cos=Math.abs(Math.cos(frame.rotation||0)),sin=Math.abs(Math.sin(frame.rotation||0));
 const width=frame.width*cos+frame.height*sin+padding*2,height=frame.width*sin+frame.height*cos+padding*2;
 return {x:frame.x-width/2,y:frame.y-height/2,width,height};
}
export function playerLocator(frame,unit=1,bounds={width:1600,height:745}){
 const body=projectedBounds(frame,5*unit),width=42*unit,height=23*unit,gap=10*unit;
 const below=body.y<height+gap+6*unit;
 const x=clamp(frame.x-width/2,6*unit,bounds.width-width-6*unit);
 const y=clamp(below?body.y+body.height+gap:body.y-height-gap,6*unit,bounds.height-height-6*unit);
 return {x,y,width,height,anchor:{x:clamp(frame.x,6*unit,bounds.width-6*unit),y:clamp(below?body.y+body.height:body.y,0,bounds.height)},below,body};
}

// A small foreground layout, recomputed from world anchors each frame. Stable
// priority and candidate ordering keep identical paused frames deterministic.
export function arrangeLabels(labels,obstacles=[],bounds={width:1600,height:745},gap=6){
 const placed=[],occupied=[...obstacles],margin=8;
 for(const label of [...labels].sort((a,b)=>(b.priority||0)-(a.priority||0))){
  const width=Math.min(label.width,bounds.width-margin*2),height=label.height;
  const at=(x,y)=>({...label,x:clamp(x-width/2,margin,bounds.width-width-margin),y:clamp(y-height/2,margin,bounds.height-height-margin),width,height});
  const candidates=[];
  for(let row=0;row<=Math.ceil(bounds.height/(height+gap));row++){
   const offsets=row===0?[0]:[-row*(height+gap),row*(height+gap)];
   for(const dy of offsets)for(const dx of [0,-width/2-gap,width/2+gap])candidates.push(at(label.anchor.x+dx,label.anchor.y+dy));
  }
  candidates.sort((a,b)=>Math.hypot(a.x+a.width/2-label.anchor.x,a.y+a.height/2-label.anchor.y)-Math.hypot(b.x+b.width/2-label.anchor.x,b.y+b.height/2-label.anchor.y));
  const box=candidates.find(box=>occupied.every(other=>!overlaps(box,other,gap)))||candidates[0];
  placed.push(box);occupied.push(box);
 }
 return placed;
}
