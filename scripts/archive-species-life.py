from pathlib import Path
import hashlib, json, zipfile

root = Path(__file__).resolve().parent.parent
payload = root / 'dist' / 'Atoll Down Under-win32-x64'
archive = root / 'dist' / 'Atoll-Down-Under-Windows-Species-Life-2026-09-07.zip'
preserved = {
    'Atoll-Down-Under-Windows-Living-Reef-2026-09-07.zip': 'bd8a4462d242b229cfbd8cc01d95e4d6c2da85c4b854ea63c880fb6f0ee3e2b2',
    'Atoll-Down-Under-Windows-Species-Adventures-2026-09-07.zip': '3e54302b04334077f3f72a32780fcd66b447b52248557624dca7b374ab6f00e4',
}

def digest(file):
    with file.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

for name, expected in preserved.items():
    assert digest(root / 'dist' / name) == expected, f'Previous archive changed: {name}'
assert not archive.exists(), 'Refuse to overwrite an existing testing archive'
assert (payload / 'Atoll Down Under.exe').is_file()
files = sorted(p for p in payload.rglob('*') if p.is_file())
with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as out:
    for file in files:
        out.write(file, file.relative_to(payload.parent).as_posix())
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None, 'CRC check failed'
    assert len(check.infolist()) == len(files)
    for file in files:
        with check.open(file.relative_to(payload.parent).as_posix()) as stream:
            assert hashlib.file_digest(stream, 'sha256').hexdigest() == digest(file), str(file)
for name, expected in preserved.items():
    assert digest(root / 'dist' / name) == expected
report = dict(archive=archive.name, bytes=archive.stat().st_size, sha256=digest(archive),
              payloadFiles=len(files), allPayloadBytesMatched=True, crcPassed=True,
              asarSha256=digest(payload/'resources'/'app.asar'), preserved=preserved)
(root/'artifacts'/'species-life-archive-report.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
