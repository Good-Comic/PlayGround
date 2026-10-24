# Private-host deployment

This is a deployment procedure, not evidence that a Windows or permanent private host has been tested. The verified environment is the Debian Codex container only.

## Prerequisites and network

- Linux: current Docker Engine with Compose v2. Windows: supported Docker Desktop with WSL2 and Linux containers.
- Keep ports bound to `127.0.0.1`. For LAN access, place an authenticated HTTPS reverse proxy in front; do not change Compose to `0.0.0.0` directly.
- Prefer WireGuard/Tailscale/private VPN access. Firewall the host so only the proxy/VPN is reachable. Public GitHub webhooks require a separately reviewed HTTPS relay as described in `GITHUB_WEBHOOK_DEPLOYMENT.md`.
- Never mount `/var/run/docker.sock`, the home SSH directory, cloud credentials, or GitHub CLI configuration into Forge or preview containers.

Run `scripts/forge-linux.sh check` or `scripts/forge-windows.ps1 check` before startup.

## Authentication and secrets

Generate a PBKDF2 password hash offline without placing the password in shell history. The Python API is `server.security.password_hash`; assign only its output to `FORGE_ADMIN_PASSWORD_HASH`. Forge never stores the plaintext. For HTTPS set `FORGE_COOKIE_SECURE=1`.

Use Docker secrets, systemd credentials, Windows Credential Manager plus a restricted materialization step, or a host vault. OpenAI and webhook secrets support private files through `FORGE_OPENAI_API_KEY_FILE` and `FORGE_GITHUB_WEBHOOK_SECRET_FILE`. The GitHub private key already uses `FORGE_GITHUB_APP_PRIVATE_KEY_FILE`. Secret files must be regular, non-symlink files readable only by their owner. Do not commit `.env`, secret files, hashes, or PEM files.

For centralized encryption at rest, use the host's KMS/vault and inject short-lived files into `/run/secrets`; Forge intentionally does not invent a local master key beside encrypted ciphertext. Rotate provider keys first at the provider, replace the mounted secret atomically, restart Forge, validate, then revoke the old key. Rotate webhook secrets with an overlap plan at the relay/GitHub App. Revoke all sessions after suspected host compromise.

## Start, health, update, and rollback

Linux:

```sh
./scripts/forge-linux.sh start
./scripts/forge-linux.sh health
```

Windows PowerShell:

```powershell
.\scripts\forge-windows.ps1 start
.\scripts\forge-windows.ps1 health
```

Pin deployment to a reviewed commit. Before update: stop new jobs, create and restore-test a backup, fetch the named platform branch, build, run tests, then recreate containers. Roll back by checking out the prior reviewed commit and recreating the image; restore data only when a schema/data problem requires it.

The image installs production Node dependencies inside a digest-pinned build stage with `npm ci --omit=dev --ignore-scripts`. Never copy a host `node_modules` directory into the build context. A cache-cold build requires the configured npm registry; preserve TLS, lockfile integrity and package checks rather than bypassing them. A TLS-inspecting corporate proxy may provide its reviewed CA only as an ephemeral BuildKit secret: `docker build --secret id=npm_ca,src=/approved/combined-ca.pem server`. The CA is not copied into an image layer. For disconnected recovery, mirror the exact lockfile artifacts in an authenticated internal registry and validate that mirror before the outage.

## Isolated runner requirement

For untrusted Agent changes or game previews, use `compose.hardened.yaml` only after deploying an independently managed runner conforming to `deploy/runner-policy.json`. Studio receives only a private mTLS endpoint or owner-only runner socket, never `/var/run/docker.sock`. The runner must translate allowlisted action profiles into digest-pinned, disposable non-root containers with network disabled by default, read-only source/root, a quota-limited output volume, CPU/RAM/PID/disk/time limits, dropped capabilities, no-new-privileges, seccomp/AppArmor and removal after exit. It must not forward host environment variables, SSH material, provider secrets, GitHub credentials, unrelated workspaces, or its engine socket.

The checked-in policy and validation tests do not prove kernel enforcement. Until the private runner, firewall/egress rules, storage quota and cleanup are exercised on the target host, untrusted execution remains release-blocking.

## Backup and restore

Stop task admission or use a maintenance window, then execute inside a one-off container with the Forge volume and a host backup mount:

```sh
python /app/ops_cli.py backup /backup/forge-YYYYMMDD-HHMMSS
python /app/ops_cli.py restore-drill /backup/forge-YYYYMMDD-HHMMSS /data/restore-drills/forge-YYYYMMDD-HHMMSS
```

The backup uses SQLite's online backup API, saves all Git refs, archives task/Git/automation/artifact workspaces, and hashes every artifact. The drill checks hashes, runs `PRAGMA integrity_check`, and safely extracts into a new target. Use a volume with capacity for the uncompressed archive: the hardened `/tmp` is intentionally only 32 MiB and is not a restore target. Back up external secret-manager configuration separately; never put plaintext credentials in the workspace archive. Encrypt backup media and test restore on a schedule.

Approved visual baselines also support a focused portable package. `golden-export` writes the PNG plus project, adapter, viewport, browser version, original approval and SHA-256 manifest. Store that package on encrypted backup media. On a fresh volume, start the matching project preview and run `golden-import ... --confirm`; the import rejects mismatched identity, unexpected archive entries, digest changes and missing explicit approval. Run Playwright after import. Forge never treats `no_baseline` as a visual comparison and never auto-approves a Golden.

## Monitoring and diagnosis

The authenticated Operations dashboard reads persisted SQLite data for automation success, token/cost totals, Quality Gate rate, queue state, GitHub sync/errors, plus current cgroup memory/CPU. It does not synthesize live values. Configure host alerts for unhealthy containers, disk pressure, dead letters, repeated authentication failures, GitHub conflicts, and backup age.

Use `docker compose ps`, `docker compose logs --tail=200 forge-studio`, `/health`, and the authenticated metrics view. Redact logs before sharing. Common safe degradation is: models unavailable → retain queued/retryable state; GitHub unavailable/conflicted → stop before external write; browser unavailable → fail Quality Gate; expired worker lease → requeue or dead-letter without repeating a completed idempotency key.

## Real-service acceptance checklist

Ollama/cloud model and GitHub acceptance require separately authorized credentials. Diagnose connectivity, use a non-production canary with strict token/cost limits, verify that secrets do not enter prompts/logs, then test an approved feature branch push and draft PR. Verify the HTTPS webhook HMAC/replay path through the real relay. Never interpret Mock success as real service authorization.
