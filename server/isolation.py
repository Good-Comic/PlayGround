"""Portable contract for a least-privilege external job runner.

Studio deliberately does not receive a container-engine socket. A private-host
runner must accept only this validated specification and create one disposable
container per job. The cloud acceptance environment cannot enforce this
contract at kernel level, so callers must fail closed when no runner is bound.
"""
from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


class IsolationError(ValueError):
    pass


DIGEST_IMAGE = re.compile(r"^[a-z0-9./_-]+(?::[a-z0-9._-]+)?@sha256:[0-9a-f]{64}$")
FORBIDDEN_SOURCES = ("/var/run/docker.sock", "/run/docker.sock", "/root", "/home", "/etc", "/proc", "/sys")
ALLOWED_ACTIONS = {"javascript-check", "locale-check", "vite-preview", "playwright-quality"}


@dataclass(frozen=True)
class IsolationLimits:
    cpus: float = 1.0
    memory_bytes: int = 512 * 1024 * 1024
    pids: int = 128
    disk_bytes: int = 256 * 1024 * 1024
    timeout_seconds: int = 120


def build_job_spec(job_id: str, action: str, image: str, source: Path, output: Path,
                   limits: IsolationLimits = IsolationLimits()) -> dict[str, Any]:
    if not re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", job_id):
        raise IsolationError("invalid job id")
    if action not in ALLOWED_ACTIONS:
        raise IsolationError("action is not allowlisted")
    if not DIGEST_IMAGE.fullmatch(image):
        raise IsolationError("runner image must be digest pinned")
    source, output = source.resolve(strict=True), output.resolve(strict=True)
    if source == output or source in output.parents or output in source.parents:
        raise IsolationError("source and output must be independent")
    for path in (source, output):
        value = str(path)
        if any(value == item or value.startswith(item + "/") for item in FORBIDDEN_SOURCES):
            raise IsolationError("sensitive host path rejected")
    if not (0.1 <= limits.cpus <= 4 and 64 * 1024 * 1024 <= limits.memory_bytes <= 4 * 1024**3
            and 16 <= limits.pids <= 512 and 16 * 1024 * 1024 <= limits.disk_bytes <= 1024**3
            and 1 <= limits.timeout_seconds <= 900):
        raise IsolationError("resource limit outside policy")
    return {
        "version": 1, "job_id": job_id, "action": action, "image": image,
        "command_profile": action, "network": "none", "read_only_root": True,
        "user": "65532:65532", "no_new_privileges": True, "cap_drop": ["ALL"],
        "seccomp": "runtime/default", "apparmor": "forge-job",
        "mounts": [
            {"source": str(source), "target": "/job/source", "read_only": True},
            {"source": str(output), "target": "/job/output", "read_only": False},
        ],
        "environment_allowlist": ["LANG", "TZ"], "secrets": [],
        "limits": asdict(limits), "remove_after_exit": True,
    }


def validate_runner_binding(endpoint: str | None) -> str:
    if not endpoint:
        raise IsolationError("external isolated runner is required")
    if not endpoint.startswith("https://") and not endpoint.startswith("unix://"):
        raise IsolationError("runner requires private TLS or Unix transport")
    return endpoint
