#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PROJECT_DIR="${PROJECT_DIR:-$PWD}"
SOURCE_SHA="${RIFTWATCH_SOURCE_SHA:-055fb12c92e3d48945315937058f1423b732241c}"
PORT="${PORT:-3000}"
BUILD_ID="${RIFTWATCH_BUILD_ID:-riftwatch-playtest-v2.3.3}"
ARTIFACT_ROOT="$PROJECT_DIR/.preview-artifact"

if [[ ! "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ ]]; then
  echo "RIFTWATCH_SOURCE_SHA must be a full 40-character commit" >&2
  exit 1
fi

mkdir -p "$ARTIFACT_ROOT"
ARTIFACT="$ARTIFACT_ROOT/riftwatch-$SOURCE_SHA-$(date -u +%Y%m%dT%H%M%SZ)-$$"

/usr/bin/time -p python3 "$PROJECT_DIR/tools/qa/build_playtest.py" \
  --repo "$PROJECT_DIR" \
  --commit "$SOURCE_SHA" \
  --out "$ARTIFACT" \
  --build-id "$BUILD_ID"

/usr/bin/time -p python3 - "$ARTIFACT" "$SOURCE_SHA" <<'PY'
import hashlib, json, sys
from pathlib import Path

artifact = Path(sys.argv[1])
source = sys.argv[2]
meta = json.loads((artifact / 'build-metadata.json').read_text())
if meta.get('commit') != source:
    raise SystemExit(f"build-metadata commit mismatch: {meta.get('commit')}")
files = meta.get('files') or {}
if len(files) != 28:
    raise SystemExit(f"expected 28 artifact files, got {len(files)}")
for relative, expected in files.items():
    actual = hashlib.sha256((artifact / relative).read_bytes()).hexdigest()
    if actual != expected:
        raise SystemExit(f"resource SHA-256 mismatch: {relative}")
print(json.dumps({'commit': meta['commit'], 'files': len(files), 'verification': 'SHA256_MATCH_28_FILES', 'artifact': str(artifact)}))
PY

if [[ -n "${OPENCODE_WEB_DIR:-}" ]]; then
  python3 - "$PROJECT_DIR" "$ARTIFACT" "$OPENCODE_WEB_DIR" <<'PY'
import json, sys
from pathlib import Path

project, artifact, web = map(Path, sys.argv[1:4])
(web / 'deployment-output.json').write_text(json.dumps({
    'project': str(project.resolve()),
    'directory': str(artifact.resolve()),
}) + '\n')
PY
fi

exec python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$ARTIFACT"
