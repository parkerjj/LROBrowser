"""Set and verify Windows fixed metadata for a canonical Native release."""

import os
from pathlib import Path
import re
import struct
import sys

import pefile


def windows_version(version):
    match = re.fullmatch(r"1\.([1-9][0-9]{0,4})\.[1-9][0-9]([0-9]{4})", version)
    if not match or int(match[1]) > 65535:
        raise ValueError(f"Version cannot be represented in Windows metadata: {version}")
    return 1, int(match[1]), int(match[2]), 0


def read_pe_version(data, version):
    pe = pefile.PE(data=data, fast_load=True)
    pe.parse_data_directories(directories=[pefile.DIRECTORY_ENTRY["IMAGE_DIRECTORY_ENTRY_RESOURCE"]])
    fixed = getattr(pe, "VS_FIXEDFILEINFO", ())
    if len(fixed) != 1:
        raise ValueError("Expected one Windows fixed version resource")

    tables = [
        table.entries
        for info in pe.FileInfo
        for entry in info
        for table in getattr(entry, "StringTable", ())
    ]
    canonical = version.encode("ascii")
    if not tables or any(
        table.get(b"FileVersion") != canonical or table.get(b"ProductVersion") != canonical
        for table in tables
    ):
        raise ValueError(f"Expected Windows FileVersion and ProductVersion to display {version}")
    return pe, fixed[0]


def set_app_version(path, version, fixed_version):
    data = path.read_bytes()
    pe, fixed = read_pe_version(data, version)
    if pe.OPTIONAL_HEADER.DATA_DIRECTORY[pefile.DIRECTORY_ENTRY["IMAGE_DIRECTORY_ENTRY_SECURITY"]].Size:
        raise ValueError("Expected the Windows executable to be unsigned")
    # tauri-build 2.7.4 writes the canonical strings but spills the oversized
    # date into the minor version. Replace only the four fixed version fields.
    updated = bytearray(data)
    offset = fixed.get_field_absolute_offset("FileVersionMS")
    struct.pack_into("<4I", updated, offset, *fixed_version)
    if pe.OPTIONAL_HEADER.CheckSum:
        checksum = pefile.PE(data=bytes(updated), fast_load=True).generate_checksum()
        struct.pack_into("<I", updated, pe.OPTIONAL_HEADER.get_field_absolute_offset("CheckSum"), checksum)
    verify_version(bytes(updated), version, fixed_version)
    temporary = path.with_suffix(".version.tmp")
    temporary.write_bytes(updated)
    temporary.chmod(path.stat().st_mode)
    temporary.replace(path)


def verify_version(data, version, fixed_version):
    _, fixed = read_pe_version(data, version)
    actual = (fixed.FileVersionMS, fixed.FileVersionLS, fixed.ProductVersionMS, fixed.ProductVersionLS)
    if actual != fixed_version:
        raise ValueError(f"Wrong Windows fixed version fields: {actual}, expected {fixed_version}")


def compile_nsis(arguments, canonical, version_parts):
    # The pinned Tauri CLI passes its rendered installer.nsi as the final
    # argument. NSIS uses this define only for fixed metadata.
    script = Path(arguments[-1])
    original = f'!define VERSIONWITHBUILD "{canonical}.0"'.encode("ascii")
    version = ".".join(map(str, version_parts))
    replacement = f'!define VERSIONWITHBUILD "{version}"'.encode("ascii")
    definition = re.compile(rb"^" + re.escape(original) + rb"(?=\r?$)", re.MULTILINE)
    content, replacements = definition.subn(replacement, script.read_bytes())
    if script.name != "installer.nsi" or replacements != 1:
        raise ValueError("Expected one Tauri NSIS fixed version definition")
    script.write_bytes(content)
    makensis = os.environ["NATIVE_MAKENSIS"]
    os.execv(makensis, [makensis, *arguments])


def main(command, *arguments):
    version = os.environ["NATIVE_VERSION"]
    version_parts = windows_version(version)
    major, minor, date, revision = version_parts
    high, low = (major << 16) | minor, (date << 16) | revision
    fixed_version = (high, low, high, low)
    if command == "prepare-app":
        set_app_version(Path(arguments[0]), version, fixed_version)
    elif command == "verify":
        verify_version(Path(arguments[0]).read_bytes(), version, fixed_version)
    elif command == "compile-nsis":
        compile_nsis(arguments, version, version_parts)
    else:
        raise ValueError(f"Unknown Windows version command: {command}")


if __name__ == "__main__":
    main(*sys.argv[1:])
