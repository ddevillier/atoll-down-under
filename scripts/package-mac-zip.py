"""Build an unsigned Apple Silicon .app ZIP without materializing symlinks on Windows.
Preserves the official Electron archive's Unix modes and symlink entries byte-for-byte.
The official archive is checksum-verified by @electron/get before this script runs.
"""
import zipfile,plistlib,sys,copy,json
from pathlib import Path
source=Path(sys.argv[1]);asar=Path(sys.argv[2]);out=Path('dist/Atoll-Down-Under-mac-arm64.zip')
root='Atoll Down Under.app/'
def fileinfo(name,mode=0o100644):
 i=zipfile.ZipInfo(name);i.create_system=3;i.external_attr=mode<<16;i.compress_type=zipfile.ZIP_DEFLATED;return i
with zipfile.ZipFile(source)as z,zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6)as target:
 for item in z.infolist():
  if item.filename.startswith('Electron.app/'):
   name=root+item.filename[len('Electron.app/'):]
   if '/Contents/_CodeSignature/' in name and name.startswith(root+'Contents/_CodeSignature/'):continue
   data=z.read(item)
   if name==root+'Contents/MacOS/Electron':name=root+'Contents/MacOS/Atoll Down Under'
   if name==root+'Contents/Info.plist':
    info=plistlib.loads(data);info.update(CFBundleName='Atoll Down Under',CFBundleDisplayName='Atoll Down Under',CFBundleExecutable='Atoll Down Under',CFBundleIdentifier='com.atoll.downunder',CFBundleShortVersionString='0.1.0',CFBundleVersion='0.1.0',CFBundleIconFile='atoll.icns');data=plistlib.dumps(info)
   if name==root+'Contents/Resources/default_app.asar':continue
   new=copy.copy(item);new.filename=name;new.compress_type=zipfile.ZIP_DEFLATED;target.writestr(new,data)
  elif item.filename in ['LICENSE','LICENSES.chromium.html','version']:
   target.writestr(fileinfo(item.filename),z.read(item))
 target.writestr(fileinfo(root+'Contents/Resources/app.asar'),asar.read_bytes())
 target.writestr(fileinfo(root+'Contents/Resources/atoll.icns'),Path('assets/icon.icns').read_bytes())
 target.writestr(fileinfo('READ-ME-FIRST.txt'),'''Atoll Down Under — Apple Silicon macOS build\n\nThis archive preserves the original Electron framework symlinks. Extract it on a Mac.\nThe game is unsigned and has not been runtime-tested on macOS. For personal local testing, you may ad-hoc sign the extracted app:\n\ncodesign --force --deep --sign - "Atoll Down Under.app"\n\nThe complete source project is supplied separately. To build natively on your Mac, run npm ci, then npm start or npm run package:mac.\n'''.encode())
with zipfile.ZipFile(out)as check:
 bad=check.testzip()
 if bad:raise RuntimeError('Corrupt archive member: '+bad)
 names=check.namelist();links=sum(1 for i in check.infolist()if i.external_attr>>16&0o170000==0o120000)
 assert root+'Contents/Resources/app.asar' in names
 binary=check.read(root+'Contents/MacOS/Atoll Down Under')
 assert binary[:4] in [b'\xcf\xfa\xed\xfe',b'\xca\xfe\xba\xbe']
 assert links>0
 report={'archive':str(out),'entries':len(names),'preservedSymlinks':links,'machoHeader':binary[:8].hex(),'crc':'pass','runtimeTested':False,'signed':False}
 Path('artifacts/mac-package-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
