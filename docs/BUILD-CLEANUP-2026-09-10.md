# Windows build cleanup — September 10, 2026

Removed 18 obsolete Windows ZIPs from `dist`, recovering **4,094,973,818 bytes** (4.09 GB / 3.81 GiB of file content). This is the sum of deleted file sizes, not a volume-free-space measurement.

## Retained

- `Atoll-Down-Under-Windows-Full-Animation-2026-09-09.zip` — latest verified release.
- `Atoll-Down-Under-Windows-Motion-Correction-2026-09-09.zip` — immediately preceding verified rollback.
- `Atoll Down Under-win32-x64/` — runnable latest application.

Both retained ZIPs passed their recorded SHA-256 hashes and ZIP CRC checks before deletion, and SHA-256 checks again afterward. All 73 files in the runnable folder matched the latest ZIP. There were no obsolete extracted Windows folders to delete.

Source, assets, documentation, QA evidence, text receipts, historical checksums, family saves and journals were untouched. The source archive and existing non-Windows archive remain outside this Windows cleanup. Earlier build receipts describe historical handoffs; their ZIP-preservation claims and the old `dist/SHA256SUMS.txt` are historical records, not a current archive inventory.

## Removed

| Archive | Bytes |
|---|---:|
| `Atoll-Down-Under-Windows-All-Species-Journeys-2026-09-08.zip` | 260,052,053 |
| `Atoll-Down-Under-Windows-Cleaner-Queues-2026-09-06.zip` | 225,755,715 |
| `Atoll-Down-Under-Windows-Cleaners-2026-09-06.zip` | 225,752,031 |
| `Atoll-Down-Under-Windows-Exploration-2026-09-06.zip` | 219,509,864 |
| `Atoll-Down-Under-Windows-Family-Journal-2026-09-06.zip` | 226,061,988 |
| `Atoll-Down-Under-Windows-Food-Hints-2026-09-06.zip` | 225,760,510 |
| `Atoll-Down-Under-Windows-Fullscreen-2026-09-06.zip` | 211,539,194 |
| `Atoll-Down-Under-Windows-Guide-Options-2026-09-06.zip` | 225,764,438 |
| `Atoll-Down-Under-Windows-Living-Reef-2026-09-07.zip` | 242,804,033 |
| `Atoll-Down-Under-Windows-Populations-2026-09-06.zip` | 216,196,703 |
| `Atoll-Down-Under-Windows-Practice-2026-09-06.zip` | 224,127,464 |
| `Atoll-Down-Under-Windows-Saves-2026-09-06.zip` | 216,204,043 |
| `Atoll-Down-Under-Windows-Species-2026-09-06.zip` | 219,600,954 |
| `Atoll-Down-Under-Windows-Species-Adventures-2026-09-07.zip` | 241,736,658 |
| `Atoll-Down-Under-Windows-Species-Life-2026-09-07.zip` | 242,825,975 |
| `Atoll-Down-Under-Windows-Spoken-Activities-2026-09-08.zip` | 248,226,484 |
| `Atoll-Down-Under-Windows-Testing-2026-09-06.zip` | 211,516,517 |
| `Atoll-Down-Under-Windows-x64.zip` | 211,539,194 |

Every deletion target was resolved and checked as a regular file directly inside the expected project `dist` directory; reparse points were rejected. Deletion used PowerShell `Remove-Item -LiteralPath`. All selected files were confirmed absent afterward. The detailed machine receipt is `artifacts/build-cleanup-2026-09-10.json`.
