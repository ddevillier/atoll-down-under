"""User-authorized local matting of generated creation components; sources stay intact."""
from pathlib import Path
import sys, os, json
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'artifacts/matting-env'))
os.environ['U2NET_HOME']=str(root/'artifacts/matting-models')
os.environ['OMP_NUM_THREADS']='4'
from PIL import Image
import numpy as np
from scipy import ndimage
from rembg import new_session,remove
source=Path(sys.argv[1]);dest=root/'assets/creatures/creation-v1';dest.mkdir(parents=True,exist_ok=True)
session=new_session('isnet-general-use',providers=['CPUExecutionProvider'])
groups=[('exec-28a1b069-be5f-44fb-a002-d3a5b84a9b7e.png',[
 ('body-rounded',(180,0,1380,395)),('body-slender',(100,395,1440,630)),('body-sturdy',(150,630,1400,1024))]),
 ('exec-52e98741-5b9c-4d17-be6c-29067d07b3a3.png',[
 ('tail-fan',(0,0,390,365)),('tail-fork',(390,0,760,365)),('tail-lyre',(760,0,1140,365)),('tail-point',(1140,0,1536,365)),
 ('dorsal-low',(0,365,410,640)),('dorsal-sail',(410,365,768,640)),('dorsal-spiny',(768,365,1140,640)),('dorsal-ribbon',(1140,365,1536,640)),
 ('pectoral-paddle',(0,640,375,1024)),('pectoral-wing',(375,640,780,1024)),('pectoral-point',(780,640,1130,1024)),('pelvic',(1130,640,1536,1024))]),
 ('exec-66906f99-45df-4b44-9c38-384a51147874.png',[
 ('head-small',(0,0,768,505)),('head-wide',(768,0,1536,505)),('head-beak',(0,505,768,1024)),('head-tube',(768,505,1536,1024))])]
report=[]
for filename,items in groups:
 im=Image.open(source/filename).convert('RGBA')
 for name,box in items:
  target=dest/(name+'.png')
  if target.exists():continue
  crop=im.crop(box);out=remove(crop,session=session)
  arr=np.array(out);mask=arr[:,:,3]>70;labels,n=ndimage.label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0
  if not n:raise RuntimeError('No foreground: '+name)
  largest=labels==sizes.argmax();interior=ndimage.binary_fill_holes(largest)
  # Keep antialiased perimeter but discard disconnected background haze.
  support=ndimage.binary_dilation(interior,iterations=2);arr[:,:,3]=np.where(support,arr[:,:,3],0)
  if name.startswith(('body-','head-')):arr[:,:,3]=np.where(ndimage.binary_erosion(interior,iterations=1),255,arr[:,:,3])
  out=Image.fromarray(arr);bbox=out.getbbox();out=out.crop(bbox)
  padded=Image.new('RGBA',(out.width+8,out.height+8));padded.alpha_composite(out,(4,4));padded.save(target)
  report.append({'name':name,'source':filename,'crop':box,'bounds':bbox,'size':list(padded.size)})
  print(name,padded.size,flush=True)
(root/'artifacts/anatomy-art-extraction.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
