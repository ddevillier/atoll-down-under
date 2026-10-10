import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import sharp from 'sharp';

const directory=process.argv[2]||'artifacts/living-reef/care',report=JSON.parse(fs.readFileSync(directory+'/report.json','utf8')),boards=[];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for(const result of report.results){
 const stem=result.name.replaceAll(' ','-')+'-'+result.width,video=path.join(directory,stem+'.webm'),samples=path.join(directory,stem+'-frames');fs.mkdirSync(samples,{recursive:true});
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',video,'-vf','fps=5,scale=400:-1','-y',path.join(samples,'sample-%03d.png')]);
 const frames=fs.readdirSync(samples).filter(f=>f.startsWith('sample-')).sort();
 async function closest(suffix){
  const reference=await sharp(path.join(directory,stem+suffix+'.png')).resize({width:400}).removeAlpha().raw().toBuffer({resolveWithObject:true});let best=Infinity,index=0;
  for(let i=0;i<frames.length;i++){
   const current=await sharp(path.join(samples,frames[i])).resize(reference.info.width,reference.info.height).removeAlpha().raw().toBuffer();let difference=0;
   for(let n=0;n<current.length;n++)difference+=Math.abs(current[n]-reference.data[n]);
   if(difference<best){best=difference;index=i;}
  }
  return {time:(index+.5)/5,error:best/reference.data.length};
 }
 const working=await closest('-working'),complete=await closest('-complete');
 const targets=[Math.max(0,working.time-.75),working.time,Math.max(working.time+.1,complete.time-1.5),complete.time],labels=['Arrival','Early inspection','Later inspection','After care'];
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_frames','-show_entries','stream=width,height:frame=best_effort_timestamp_time','-of','json',video],{encoding:'utf8'})),metadata=probe.streams[0],frameTimes=probe.frames.map(f=>Number(f.best_effort_timestamp_time));
 const frameIndices=targets.map(time=>frameTimes.reduce((best,current,index)=>Math.abs(current-time)<Math.abs(frameTimes[best]-time)?index:best,0)),times=frameIndices.map(index=>frameTimes[index]);
 const stageWidth=metadata.width,stageHeight=stageWidth*9/16,offset=(metadata.height-stageHeight)/2,contact=result.working.pose.contact;
 const boxes=result.working.canvasBox,cleaner=result.working.cleanerFrame,client=result.working.clientFrame,scale=metadata.width/result.width;
 const world=cleaner&&client?{x:(cleaner.x+client.x)/2,y:(cleaner.y+client.y)/2}:contact;
 const center=boxes?{x:(boxes.left+world.x/1600*boxes.width)*scale,y:(boxes.top+(world.y+55)/900*boxes.height)*scale}:{x:world.x/1600*stageWidth,y:(world.y+55)/900*stageHeight+offset};
 const w=Math.min(metadata.width,Math.round(350/1600*(boxes?.width||stageWidth/scale)*scale)),h=Math.min(metadata.height,Math.round(210/900*(boxes?.height||stageHeight/scale)*scale));
 const crop={left:Math.max(0,Math.min(metadata.width-w,Math.round(center.x-w/2))),top:Math.max(0,Math.min(metadata.height-h,Math.round(center.y-h/2))),width:w,height:h};
 const layers=[];
 for(let i=0;i<times.length;i++){
  const file=path.join(samples,'phase-'+i+'.png');execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',video,'-vf',`select=eq(n\\,${frameIndices[i]})`,'-frames:v','1','-y',file]);
  const pixels=await sharp(file).extract(crop).resize(650,390,{fit:'contain',background:'#0b2930'}).png().toBuffer(),x=i%2*650,y=65+Math.floor(i/2)*435;
  layers.push({input:pixels,left:x,top:y+35});
  const label=Buffer.from(`<svg width="650" height="35"><rect width="650" height="35" fill="#f4f0df"/><text x="14" y="23" font-family="Arial" font-size="18" fill="#163c43">${labels[i]} · video ${times[i].toFixed(2)}s</text></svg>`);layers.push({input:label,left:x,top:y});
 }
 const title=Buffer.from(`<svg width="1300" height="65"><rect width="1300" height="65" fill="#f4f0df"/><text x="18" y="27" font-family="Arial" font-size="22" fill="#163c43">${result.name} · ${result.width}px · ${result.client.name}</text><text x="18" y="51" font-family="Arial" font-size="16" fill="#426269">Actual video crops. Client health ${result.client.health.toFixed(1)} → ${result.complete.clientHealth.toFixed(1)}. No animals or health replaced.</text></svg>`);layers.push({input:title,left:0,top:0});
 const board=path.join(directory,stem+'-storyboard.png');await sharp({create:{width:1300,height:935,channels:4,background:'#0b2930'}}).composite(layers).png().toFile(board);
 boards.push({video,sha256:hash(video),board,boardSha256:hash(board),times,frameIndices,crop,workingMatch:working,completeMatch:complete,scope:'Four literal crops from the recorded live visit. Phase labels describe the visible visit, not new reconstructed frames.'});
}
fs.writeFileSync(directory+'/storyboards.json',JSON.stringify({boards},null,2));console.log(JSON.stringify({boards:boards.length}));
