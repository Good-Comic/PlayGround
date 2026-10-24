from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

try:
    from server.operations import create_backup, restore_drill
    from server.preview_runtime import export_golden, import_golden
except ModuleNotFoundError:
    from operations import create_backup, restore_drill
    from preview_runtime import export_golden, import_golden


def main() -> None:
    parser = argparse.ArgumentParser(description="Project Forge offline backup/restore drill")
    sub = parser.add_subparsers(dest="command", required=True)
    backup = sub.add_parser("backup")
    backup.add_argument("destination", type=Path)
    restore = sub.add_parser("restore-drill")
    restore.add_argument("backup", type=Path)
    restore.add_argument("target", type=Path)
    golden_export = sub.add_parser("golden-export")
    golden_export.add_argument("project_id", type=int)
    golden_export.add_argument("adapter_id")
    golden_export.add_argument("package", type=Path)
    golden_import = sub.add_parser("golden-import")
    golden_import.add_argument("preview_id", type=int)
    golden_import.add_argument("package", type=Path)
    golden_import.add_argument("--confirm", action="store_true")
    args = parser.parse_args()
    if args.command == "backup":
        result = create_backup(
            Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db")),
            Path(os.environ.get("FORGE_GIT_SOURCE_ROOT", "/source-repository")),
            Path(os.environ.get("FORGE_DATA_ROOT", "/data")), args.destination,
        )
    elif args.command == "restore-drill":
        result = restore_drill(args.backup, args.target)
    elif args.command == "golden-export":
        result = export_golden(args.project_id, args.adapter_id, args.package,
                               Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db")))
    else:
        result = import_golden(args.preview_id, args.package, args.confirm,
                               Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db")),
                               Path(os.environ.get("FORGE_PREVIEW_ARTIFACT_ROOT", "/data/preview-artifacts")))
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
