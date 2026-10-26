#!/bin/sh
# Task-local public CA store; no HOME override, TLS-ignore flag or network namespace change.
set -eu
browser_task_dir=/workspace/diagnostics/riftwatch/v228-deploy
browser_nss_dir="$browser_task_dir/isolated-nss"
browser_nss_target=$(python -c "from pathlib import Path;print(Path.home()/'.pki/nssdb')")
mkdir -p "$browser_nss_dir"
if [ ! -f "$browser_nss_dir/cert9.db" ]; then
  certutil -N -d "sql:$browser_nss_dir" --empty-password
  for browser_ca in /usr/local/share/ca-certificates/*.crt; do
    certutil -A -d "sql:$browser_nss_dir" -n "$(basename "$browser_ca")" -t C,, -i "$browser_ca"
  done
fi
exec bwrap --die-with-parent --ro-bind / / --bind /workspace /workspace --bind /tmp /tmp --dev-bind /dev /dev --proc /proc --bind "$browser_nss_dir" "$browser_nss_target" -- /usr/bin/chromium --headless --no-sandbox --disable-background-networking --no-first-run --proxy-server="${HTTPS_PROXY:-http://proxy:8080}" --remote-debugging-address=127.0.0.1 --remote-debugging-port=9229 --user-data-dir="$browser_task_dir/live-browser-profile" about:blank
