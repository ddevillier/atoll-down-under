# Named and portable dives

Included in the [Windows Saves testing build](WINDOWS-SAVES-BUILD.md). The earlier population ZIP does not include these controls.

Open **Save / load** during a dive. Give it a name, then choose **Save here** for one of the three local slots or **Export dive file** for a portable `.atoll` file. The name stays with later local saves. Export copies the paused dive without depending on available local-storage space. To export an older slot, load it first.

From the title screen, choose **File → Saved dives → Import dive file**. During a dive, Import is in the same Save / load panel. Choose a file, check the displayed name, fish, mode and habitat, then select **Open dive**. Back leaves the current dive intact. Opening an imported dive updates Last dive; it does not overwrite slots 1–3. Invalid files leave both the active simulation and existing slots intact. Loading still works for old unnamed local slots.

The file contains the simulation, including its actual nine habitat populations, RNG state, fish/custom traits, energy and health, score and progression, visited places, map destination and observations. It does not transfer display/audio preferences or the separate Reef Rulers list. Old crowded populations remain crowded when saved or imported; start a new dive for revised populations.

Files use a versioned JSON envelope and an 8 MB limit. Imports validate the envelope, supported states, creature data, progression references and all nine sections before restoration. Unknown simulation-root properties, prototype keys, excessive nesting and malformed numeric fields are rejected. An import preview is created only after validation. Original Odell files and arbitrary raw simulation JSON are not supported.

The original Windows manual, printed pages 12–13, documents named Save As and opening saved games. This implements that portability and naming intent. One deliberate modern difference remains: Ctrl+S updates the local Last dive; it does not silently overwrite a previously exported file. Use Export again for a fresh backup. A download-start message reports only the request, not a claim that the user completed a save dialog.

## Verification

- 113 unit/asset tests pass. Portable round trips cover all 55 playable creatures after simulation updates, identical serialized worlds and the next RNG draw; Challenge/Tournament phases; custom crushing-jaw fish; older health fields; malformed files and Windows filenames.
- Four focused browser scenarios pass: portable files (including names, invalid input and cancellation), existing save/storage errors, existing reload behavior, and Tournament keyboard preview. Screens inspected at 1600×900 and 1024×768; the compact dialog scrolls its local slots while retaining access to file controls.
- `node scripts/qa-save-files-desktop.mjs` verifies actual Electron download completion, reads the disk file, imports it through the UI and resumes a Cuttlefish night dive at `atoll://game`. It uses a temporary isolated profile and a test download path. `artifacts/native-save-files-report.json` records `downloaded: true`, `imported: true` and no page errors. The first test attempt incorrectly waited for a browser download event; the file existed, and the corrected check uses Electron's completion event.
- Packaged-binary verification now passes with the Windows Saves build: completed disk export, successful UI import and resumed night dive, with no page errors. All 30 browser scenarios also passed before parking that build.
