from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

try:
    from server.operations import create_backup, restore_drill
except ModuleNotFoundError:
    from operations import create_backup, restore_drill


def main() -> None:
    parser = argparse.ArgumentParser(description="Project Forge offline backup/restore drill")
    sub = parser.add_subparsers(dest="command", required=True)
    backup = sub.add_parser("backup")
    backup.add_argument("destination", type=Path)
    restore = sub.add_parser("restore-drill")
    restore.add_argument("backup", type=Path)
    restore.add_argument("target", type=Path)
    args = parser.parse_args()
    if args.command == "backup":
        result = create_backup(
            Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db")),
            Path(os.environ.get("FORGE_GIT_SOURCE_ROOT", "/source-repository")),
            Path(os.environ.get("FORGE_DATA_ROOT", "/data")), args.destination,
        )
    else:
        result = restore_drill(args.backup, args.target)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
