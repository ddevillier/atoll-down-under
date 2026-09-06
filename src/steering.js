const TAU=Math.PI*2;
const wrap=angle=>((angle+Math.PI)%TAU+TAU)%TAU-Math.PI;

// Headings differing by whole turns describe the same direction. Normalize
// both the difference and the result so long dives and old saves steer alike.
export function turnTowards(angle,target,limit){
 const current=wrap(angle),difference=wrap(target-current);
 return wrap(current+Math.max(-limit,Math.min(limit,difference)));
}

// The visible water edge is a navigation target. A small intent band avoids
// requiring the cursor to land on the last few pixels beside the HUD.
export function edgeDestination(value,extent){
 return value<24?0:value>extent-24?extent:value;
}
