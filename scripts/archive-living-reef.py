"""Archive an explicitly selected Windows build and verify every payload byte.

Usage:
  python scripts/archive-living-reef.py --built-folder "dist/NEW/Atoll Down Under-win32-x64" --zip "dist/NEW.zip"

The ZIP contains one portable top-level folder with its executable/resources.
Existing ZIPs or receipts are never replaced. On failure, a newly created ZIP
is retained for inspection and no success receipt is emitted. This verifies
archive integrity, not the executable format, source freshness or gameplay.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
import zipfile


def digest(stream) -> tuple[str, int]:
    checksum = hashlib.sha256()
    length = 0
    while block := stream.read(1024 * 1024):
        checksum.update(block)
        length += len(block)
    return checksum.hexdigest(), length


def file_digest(path: Path) -> tuple[str, int]:
    with path.open("rb") as stream:
        return digest(stream)


def reject_link(path: Path) -> None:
    attrs = getattr(path.lstat(), "st_file_attributes", 0)
    if path.is_symlink() or attrs & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0):
        raise ValueError(f"Build contains a link/reparse point: {path}")


def inventory(folder: Path) -> dict[str, dict]:
    files = {}
    reject_link(folder)
    for directory, subdirs, names in os.walk(folder, followlinks=False):
        current = Path(directory)
        for name in subdirs:
            reject_link(current / name)
        for name in names:
            path = current / name
            reject_link(path)
            if not path.is_file():
                raise ValueError(f"Build contains a non-regular file: {path}")
            checksum, length = file_digest(path)
            files[path.relative_to(folder).as_posix()] = {"sha256": checksum, "bytes": length}
    return dict(sorted(files.items()))


def archive_windows(built_folder: Path, archive: Path, receipt: Path | None = None) -> dict:
    # Check links before resolve so a caller cannot accidentally select an
    # external linked folder as the purported portable build.
    if not built_folder.is_dir():
        raise ValueError(f"Built Windows folder does not exist: {built_folder}")
    reject_link(built_folder)
    built_folder = built_folder.resolve()
    receipt = receipt or archive.with_suffix(".receipt.json")
    for output in (archive, receipt):
        if os.path.lexists(output):
            raise FileExistsError(f"Refusing to replace an existing output: {output}")
    archive = archive.resolve()
    receipt = receipt.resolve()
    if archive.suffix.lower() != ".zip":
        raise ValueError("The new archive path must have a .zip extension")
    for output in (archive, receipt):
        if output.exists() or output.is_symlink():
            raise FileExistsError(f"Refusing to replace an existing output: {output}")
        if output.is_relative_to(built_folder):
            raise ValueError(f"Output must be outside the built Windows folder: {output}")
    if archive == receipt:
        raise ValueError("ZIP and receipt paths must differ")
    if not built_folder.name:
        raise ValueError("The portable build must have a named folder root")
    resources = built_folder / "resources"
    if not resources.is_dir():
        raise ValueError("Portable build root must contain a resources directory")
    before = inventory(built_folder)
    executables = [name for name in before if "/" not in name and name.lower().endswith(".exe")]
    if not executables:
        raise ValueError("Portable build root must contain a Windows .exe")
    if not any(name.startswith("resources/") for name in before):
        raise ValueError("The resources directory must contain packaged files")
    prefix = built_folder.name + "/"
    archive.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive filesystem creation also handles a competing writer after
    # preflight. No overwrite or removal of any preexisting build/archive.
    with archive.open("xb") as stream:
        with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED,
                             compresslevel=6, allowZip64=True, strict_timestamps=False) as output:
            for name in before:
                output.write(built_folder / name, prefix + name)
    with zipfile.ZipFile(archive, "r") as check:
        members = check.infolist()
        expected = {prefix + name for name in before}
        if len(members) != len(before) or {member.filename for member in members} != expected:
            raise ValueError("ZIP inventory differs from the complete built folder")
        bad = check.testzip()
        if bad is not None:
            raise ValueError(f"ZIP CRC check failed: {bad}")
        for member in members:
            original = before[member.filename[len(prefix):]]
            with check.open(member) as stream:
                checksum, length = digest(stream)
            if (checksum, length, member.file_size) != (
                    original["sha256"], original["bytes"], original["bytes"]):
                raise ValueError(f"ZIP payload SHA256/length differs: {member.filename}")
    after = inventory(built_folder)
    if after != before:
        raise ValueError("Built folder files changed during archiving/verification")
    checksum, length = file_digest(archive)
    report = {
        "schema": "living-reef-windows-archive-receipt-v1",
        "builtFolder": str(built_folder), "archive": str(archive), "receipt": str(receipt),
        "portableFolderRoot": built_folder.name, "rootExecutables": executables,
        "fileCount": len(before), "payloadBytes": sum(row["bytes"] for row in before.values()),
        "zipBytes": length, "zipSha256": checksum,
        "payloadManifestSha256": hashlib.sha256(json.dumps(before, sort_keys=True,
            separators=(",", ":"), ensure_ascii=False).encode("utf-8")).hexdigest(),
        "crcPassed": True, "allPayloadSha256AndLengthsMatched": True,
        "builtFolderUnchanged": True, "existingOutputsReplaced": False,
    }
    receipt.parent.mkdir(parents=True, exist_ok=True)
    with receipt.open("x", encoding="utf-8", newline="\n") as stream:
        json.dump(report, stream, indent=2, ensure_ascii=False)
        stream.write("\n")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--built-folder", type=Path, required=True,
                        help="Explicit completed NEW Windows portable build folder")
    parser.add_argument("--zip", dest="archive", type=Path, required=True,
                        help="Explicit NEW ZIP path; existing files are refused")
    parser.add_argument("--receipt", type=Path,
                        help="Optional NEW JSON path; default is <ZIP-stem>.receipt.json")
    args = parser.parse_args()
    try:
        print(json.dumps(archive_windows(args.built_folder, args.archive, args.receipt), indent=2))
        return 0
    except (OSError, ValueError, zipfile.BadZipFile, zipfile.LargeZipFile) as error:
        print(f"Archive verification failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
