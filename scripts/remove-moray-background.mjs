// User-authorized local cleanup of the generated extended pose. Only neutral,
// light pixels connected to the outer background are removed; interior markings
// remain intact. Original generated source is never modified.
import sharp from 'sharp';
import fs from 'node:fs';
const [source,destination]=process.argv.slice(2);
if(!source||!destination)throw new Error('Usage: node scripts/remove-moray-background.mjs input.png output.png');
if(fs.existsSync(destination))throw new Error('Output exists; choose a new version');
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const {width:w,height:h}=info,n=w*h,mask=new Uint8Array(n),queue=new Int32Array(n);
const background=i=>{const p=i*3,r=data[p],g=data[p+1],b=data[p+2];return Math.min(r,g,b)>160&&Math.max(r,g,b)-Math.min(r,g,b)<26;};
let head=0,tail=0;
function visit(i){if(!mask[i]&&background(i)){mask[i]=1;queue[tail++]=i;}}
for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x);}for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1);}
while(head<tail){const i=queue[head++],x=i%w;if(x)visit(i-1);if(x<w-1)visit(i+1);if(i>=w)visit(i-w);if(i<n-w)visit(i+w);}
const out=Buffer.alloc(n*4);let soft=0;
for(let i=0;i<n;i++){
 if(mask[i])continue;
 const p=i*3,q=i*4;let alpha=1,r=data[p],g=data[p+1],b=data[p+2];
 const x=i%w,y=Math.floor(i/w);let edge=false,best=null,bestD=Infinity;
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
  if(x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;
  const j=i+dy*w+dx;if(mask[j]){edge=true;continue;}
  const k=j*3,lo=Math.min(data[k],data[k+1],data[k+2]),hi=Math.max(data[k],data[k+1],data[k+2]);
  if(lo<115&&hi-lo>45&&dx*dx+dy*dy<bestD){bestD=dx*dx+dy*dy;best=[data[k],data[k+1],data[k+2]];}
 }
 if(edge&&best){
  // Recover fractional edge coverage against the pale checker, then decontaminate
  // RGB. This prevents a white fringe on dark reef paintings.
  const bg=248,v=best.map(c=>c-bg),c=[r-bg,g-bg,b-bg];
  alpha=Math.max(.05,Math.min(1,c.reduce((s,a,k)=>s+a*v[k],0)/v.reduce((s,a)=>s+a*a,0)));
  if(alpha<.98){[r,g,b]=[r,g,b].map(c=>Math.max(0,Math.min(255,(c-bg*(1-alpha))/alpha)));soft++;}
 }
 out[q]=r;out[q+1]=g;out[q+2]=b;out[q+3]=Math.round(alpha*255);
}
// Keep the source resolution; transparent padding satisfies the source canvas
// minimum without inventing pixels or stretching the animal.
await sharp(out,{raw:{width:w,height:h,channels:4}}).extend({top:Math.max(0,Math.ceil((1000-h)/2)),bottom:Math.max(0,Math.floor((1000-h)/2)),left:0,right:0,background:'#00000000'}).png().toFile(destination);
console.log(JSON.stringify({source,destination,width:w,height:h,removed:tail,softEdges:soft}));
