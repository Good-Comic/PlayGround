from __future__ import annotations

import os
from pathlib import Path


class SecretStoreError(RuntimeError):
    pass


def read_secret(name: str) -> str:
    """Prefer a private container-secret file and never expose its value."""
    path_value = os.environ.get(f"{name}_FILE", "").strip()
    direct = os.environ.get(name, "")
    if path_value and direct:
        raise SecretStoreError(f"{name} has multiple configured sources")
    if not path_value:
        return direct
    path = Path(path_value)
    if path.is_symlink() or not path.is_file():
        raise SecretStoreError(f"{name} secret file is invalid")
    if path.stat().st_mode & 0o077:
        raise SecretStoreError(f"{name} secret file permissions are too broad")
    return path.read_text(encoding="utf-8").strip()
