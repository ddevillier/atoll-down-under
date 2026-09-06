"""Archive the built Windows app and editable source; verify ZIPs and hash releases."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
(root / 'artifacts').mkdir(exist_ok=True)
dist = root / 'dist'
windows = dist / 'Atoll Down Under-win32-x64'
assert (windows / 'Atoll Down Under.exe').is_file(), 'Build Windows first.'
skip = {'.git', 'node_modules', 'dist', 'artifacts', '__pycache__'}

def archive(output, files, base, prefix=''):
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for file in sorted(files):
            z.write(file, prefix + file.relative_to(base).as_posix())
    with zipfile.ZipFile(output) as z:
        bad = z.testzip()
        if bad:
            raise RuntimeError('Corrupt archive entry: ' + bad)
        return {'file': output.name, 'entries': len(z.infolist()), 'crc': 'pass'}

reports = [archive(dist / 'Atoll-Down-Under-Windows-x64.zip',
                   (f for f in windows.rglob('*') if f.is_file()), dist)]
source_files = []
def collect(directory):
    for entry in directory.iterdir():
        if entry.is_dir():
            if entry.name not in skip:
                collect(entry)
        elif entry.suffix != '.log':
            source_files.append(entry)
collect(root)
reports.append(archive(dist / 'Atoll-Down-Under-Source.zip', source_files, root, 'atoll-down-under/'))
checksums = []
for file in [dist / 'Atoll-Down-Under-Windows-x64.zip', dist / 'Atoll-Down-Under-Source.zip']:
    with file.open('rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    checksums.append(f'{digest}  {file.name}')
(dist / 'SHA256SUMS.txt').write_text('\n'.join(checksums) + '\n', encoding='utf-8')
(root / 'artifacts' / 'release-report.json').write_text(json.dumps(reports, indent=2), encoding='utf-8')
print(json.dumps(reports))
