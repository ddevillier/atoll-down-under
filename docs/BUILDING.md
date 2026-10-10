# Building and testing

## Supported setup

Windows x64 is the supported Electron desktop target. The verified development
runtime is Node.js 22.18.0 (see .nvmrc). Install Node and Git, clone the repository,
then run npm ci, npm run check and npm start. npm ci uses package-lock.json; do not
substitute npm install when reproducing a build. The assets are ordinary Git files,
so no Git LFS, external asset archive, API account or original game is needed.
The source includes WAV music/effect masters; desktop packages include compressed
OGG files and omit WAV masters. All 270 spoken clips are included as OGG files.

## Commands

| Command | Purpose |
|---|---|
| npm ci | Install exact locked dependencies and Electron |
| npm run check | Check Node, dependency installation and required offline assets |
| npm start | Open the fullscreen Electron game |
| npm run dev | Start a localhost browser preview on port 4173 |
| npm test | Run the unit and source asset tests |
| npx playwright install chromium | Download the browser used by UI tests |
| npm run test:e2e | Run the browser suite against an automatic local server |
| npm run test:desktop | Exercise Electron using an isolated temporary profile |
| npm run build:win | Build a fresh Windows x64 folder and verify its packaged source |

A browser preview and unit tests may work on other Node-supported systems, but
macOS/Linux desktop delivery is not supported or tested by this workflow.
There is no Apple Silicon build in CI.

## Build outputs

npm run build:win creates a new timestamped dist/windows-... folder. An explicit
output can be supplied with -- --out dist/my-build. Existing outputs are rejected,
and the directory must stay inside this checkout's dist/ folder. The output includes
Atoll Down Under-win32-x64/Atoll Down Under.exe, a packaged-source.json report and
a build.json receipt binding source, lockfile, Electron version and Git revision.
A Git revision alone does not represent uncommitted edits; the receipt records
whether the checkout was dirty and hashes the packaged files.

Do not move only the EXE. The Electron runtime, resources/app.asar and license
notices must remain with it. Builds are unsigned; code signing is not configured.

## Optional ZIP creation

Python 3 is needed only for the verified archive helper, not normal setup or the
Windows folder build. After building into a fresh dist/my-build directory:

```sh
python scripts/archive-living-reef.py --built-folder "dist/my-build/Atoll Down Under-win32-x64" --zip dist/my-build.zip
```

The helper refuses an existing ZIP/receipt, checks every extracted payload's SHA256
and size, validates ZIP CRCs, and confirms the built folder did not change. It writes
my-build.receipt.json. Archive integrity does not establish gameplay correctness;
run the relevant native checks on the exact packaged executable too:

```sh
node scripts/qa-reef-stories-native.mjs "dist/my-build/Atoll Down Under-win32-x64/Atoll Down Under.exe" artifacts/my-build-native
```

## GitHub Actions

.github/workflows/windows.yml uses a clean Windows runner, pinned Node, npm ci,
setup checks, the full unit and browser suites, source Electron checks, packaging,
packaged adventure/audio/save checks and verified ZIP creation. Successful runs
upload the portable ZIP, build/source/archive receipts and QA evidence. Failure
logs and captures are uploaded separately where available. The job has read-only
repository permissions and requires no project secrets. A manual workflow_dispatch
is also available to maintainers and on forks.

The lockfile pins dependency versions; this is a reproducible source/dependency
build, not a claim of byte-identical signed executables or ZIP timestamps across hosts.

## Optional authoring tools

Changing ordinary gameplay or building the app does not invoke any generative API.
Existing narration, fonts, illustrations and music are already in assets/.

To synthesize replacement music/effects, install Python numpy and FFmpeg, then run
python scripts/compose_audio.py. To generate replacement activity/discovery speech,
install FFmpeg/ffprobe and set OPENAI_API_KEY in your own environment, or point
ATOLL_NARRATION_ENV at your own untracked .env.local file. The generators are dry
runs unless --execute is supplied. Paid generation is an explicit authoring action.
Never commit credentials. The older manual-guide Realtime generator additionally
needs @openai/agents in an operator-managed package, selected by ATOLL_NARRATION_SDK_ROOT.
It is not part of the normal build and is not exercised by CI.

## Troubleshooting

- Missing Electron or assets: rerun npm ci and npm run check from the repository root.
- Download/proxy errors: npm ci needs access to npm and Electron's download hosts.
  Install behind your normal approved proxy; do not disable TLS verification.
- Blank file:// browser page: use npm run dev, or npm start for the desktop application.
- Port 4173 already in use: stop the existing preview before starting another.
- Output already exists: choose a different --out directory; old builds are preserved.
- Native checks: use an interactive Windows desktop. They start in fullscreen and
  use temporary profiles. All CI native tests run only on Windows.
- Save files are local Electron user data. Deleting the checkout or a build folder
  is not a method for migrating saves; use the in-game export/backup controls.

