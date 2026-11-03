#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export CAPTURE_READY_SELECTOR="#btn-start:not([disabled])"
export CAPTURE_START_SELECTOR="#btn-start"
/usr/bin/time -p node "${RUNTIME_DIR:?}/scripts/default-capture.mjs"

