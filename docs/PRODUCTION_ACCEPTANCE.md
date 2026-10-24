# Production Acceptance 01

Date: 2026-10-24 (Asia/Taipei)
Environment: Debian Codex cloud development container
Platform source: `codex/project-forge-task-06` at `90f7b82bf03f455ae2d0f81a9d6ff9567678161c`
Acceptance branch: `codex/project-forge-acceptance-01`
Riftwatch source: `3674a33d95c5165dc9ee5813a051f894a8c72378`

This is an evidence log, not a production-release declaration. `PASS` means the named check passed in this Debian cloud environment. `BLOCKED` means a required external prerequisite is absent. `NOT TESTED` is never counted as success.

## Acceptance matrix

| Area | Status | Evidence / current finding | Remaining issue |
| --- | --- | --- | --- |
| Exact source and protected refs | PASS | Local and remote Task 06 resolve to `90f7b82…`; Riftwatch is clean at `3674a33…`; remote main is `8ef7358…` | Recheck after acceptance commit |
| Clean locked rebuild | FAIL | Exact `git archive` had no `node_modules`; `docker build` exited 1 because Dockerfile runs `npm ls` but not `npm ci` | Make the Dockerfile install from `package-lock.json`; rerun from an empty checkout |
| Python/JS/unit regression | PASS | Exact-source suite: 40/40 passed; Riftwatch: 15 JS files passed `node --check` | No long-duration or full-combat test |
| Dependency/supply-chain audit | PASS | `npm ci --ignore-scripts`, exact dependency tree and `npm audit --omit=dev --audit-level=high` completed with 0 vulnerabilities | Image/signature/SBOM verification is not implemented |
| Authentication, CSRF, sessions, RBAC | PASS | Unit attack suite passed; fresh runtime returned 401 anonymously and 200 only after login | OIDC and multi-user provisioning remain unverified |
| Secrets and log isolation | PASS | Secret-file permissions, frontend sentinel and plaintext DB tests passed; no real secret was injected | Host vault/KMS rotation remains a private-host exercise |
| Sandbox and egress | FAIL | Compose has non-root, read-only root, dropped caps and limits, but preview/Agent code still shares Studio and lacks kernel-enforced per-job egress/disk isolation | High-risk blocker for untrusted repositories |
| Durable queue crash recovery | PASS | Exact-source tests covered idempotency, heartbeat/lease expiry, bounded retry, DLQ and safe cancellation | Always-on worker supervisor was not exercised |
| Backup and full restore | PASS | Exact-source test performed backup, hash verification, SQLite integrity check and restore, not just existence testing | Off-host encrypted storage and scheduled operation unverified |
| Linux deployment script | FAIL | `check` runs, but clean source image build fails on missing dependencies | Private-host Linux still unavailable |
| Windows deployment script | NOT TESTED | Static checks pending | Windows/Docker Desktop unavailable in this environment |
| Ollama diagnosis | BLOCKED | `127.0.0.1:11434` refused; `host.docker.internal:11434` returned HTTP 403 | Start an approved Ollama endpoint and install a named model |
| OpenAI-compatible diagnosis/canary | BLOCKED | No `FORGE_OPENAI_API_KEY_FILE` binding is present | Add endpoint/model/pricing and secret through private environment settings; authorize a bounded paid canary |
| Real-model Riftwatch change | BLOCKED | No verified real provider | Complete provider canary first; choose an explicit low-risk task |
| GitHub App installation/token | BLOCKED | No App ID/private-key file; `GH_TOKEN` is invalid | Install a least-privilege GitHub App and inject private key securely |
| Webhook HMAC Mock | PASS | Exact-source tests passed HMAC, deduplication, replay rejection, retry, conflict and recovery | This is Mock/in-process evidence only |
| Real HTTPS webhook | BLOCKED | No webhook secret/file or authorized HTTPS relay | Configure secret and reviewed relay without exposing Studio directly |
| Real Push/PR | BLOCKED | No valid GitHub App and no explicit external-write authorization | Provide credentials and separately authorize exact branch/PR; merge remains forbidden |
| Riftwatch locales/build | PASS | 15 JS syntax checks; locale validator reported 4 locales, 573 keys each; game SHA remained exact | — |
| Start Game/Nemesis/10-wave traversal | PASS | Fresh Playwright run: Start Game, 13 units, 6 buildings, `NemesisDirector`, `0 / 10`, victory, 10 reports, no browser errors | Controlled traversal only; full combat is NOT TESTED |
| Golden baseline preservation | FAIL | Fresh volume returned `visual.status=no_baseline`; approved runtime golden is not portable from source/backup in this clean deployment | Define and test a reviewed golden migration/restore path; no golden was updated |
| Private-host production release | BLOCKED | Only Debian cloud validation is available | Windows/Linux private-host deployment, TLS/VPN, backup schedule and operator runbook must be exercised on target hardware |

## Commands and evidence

Commands are recorded as they are run. Secret values are never included.

### Source identification

```sh
git rev-parse HEAD
git rev-parse origin/codex/project-forge-task-06
git -C workspace/riftwatch rev-parse HEAD
git ls-remote origin refs/heads/codex/project-forge-task-06 refs/heads/main
```

Result: exact Task 06 commit and Riftwatch baseline matched; no protected reference was changed.

### External prerequisites

```sh
gh auth status
curl --max-time 5 http://127.0.0.1:11434/api/tags
curl --max-time 5 http://host.docker.internal:11434/api/tags
```

Result: GitHub CLI reports its token invalid. Ollama is absent locally and the host endpoint returns HTTP 403. Presence-only checks found no Forge OpenAI secret file, GitHub App ID/private-key file, or webhook-secret file binding. No secret value was printed.

### Clean build and dependency evidence

```sh
git archive 90f7b82bf03f455ae2d0f81a9d6ff9567678161c | tar -x -C "$clean"
npm_config_cache=/tmp/forge-accept-npm-cache npm --prefix "$clean/server" ci --ignore-scripts
npm --prefix "$clean/server" audit --omit=dev --audit-level=high
docker build --progress=plain -t project-forge-acceptance-pure:90f7b82 "$pure/server"
```

The locked host install and audit passed (20 packages, 0 vulnerabilities), and an image built after that explicit install. The product's clean Docker build failed with `UNMET DEPENDENCY` for `pixelmatch@7.1.0`, `playwright-core@1.55.1`, `pngjs@7.0.0`, and `vite@8.3.5`. This is a release-blocking reproducibility defect, not an environment-only pass.

### Regression and fresh runtime evidence

```sh
python3 -m unittest discover -s server/tests -v
find workspace/riftwatch/js -name '*.js' -print0 | xargs -0 -n1 node --check
node workspace/riftwatch/scripts/validate-locales.mjs
curl http://127.0.0.1:8080/health
```

The exact-source suite passed 40/40. The game passed 15 JavaScript syntax checks and `4 locales, 573 keys each`. An isolated acceptance data volume returned health `status=ok`, `database=ready`, `workspace=mounted`; anonymous `/api/projects` returned 401, authenticated import returned 201, and preview creation returned 201.

Fresh Playwright Quality Run 1 passed with all four exact localized titles, Start Game, 13 player units, 6 buildings, `NemesisDirector`, `0 / 10`, controlled victory after ten waves and ten reports, with empty console/page/load error arrays. Its `traversal_kind` is explicitly `controlled_state_machine_not_full_combat`. Observed load was 4,043 ms, interaction latency 1,279 ms, and measured FPS 0.45 from only one frame in this loaded cloud container; this is poor/insufficient diagnostic data, not a production performance pass.

The clean volume had `visual.status=no_baseline`. No golden creation or update was authorized or performed. Compose also encountered a cloud Docker daemon name-index race while creating the isolated project; an equivalent manually constrained container served the health/API/preview checks. Compose lifecycle reliability must be rerun on the target private host.

### Security and recovery evidence

The 40-test suite includes anonymous/CSRF rejection, session expiry/revocation, reauthentication, lockout, RBAC, secret-file permissions and frontend leakage, provider URL boundaries, path traversal, arbitrary action rejection, webhook HMAC/replay/deduplication, Git base-conflict/secret-scan protection, queue recovery/DLQ/cancellation, and a backup/restore drill with manifest hashes plus SQLite integrity verification.

Static Compose review confirms loopback-only published ports, read-only root filesystem, non-root image user, `no-new-privileges`, all capabilities dropped, cgroup/PID/tmpfs/file-descriptor/log limits, and no Docker socket, SSH directory or cloud credential mounts. It also confirms the known release blocker: untrusted task/preview execution is not placed in a disposable per-job container with kernel-enforced network egress and disk quota.

## Release decision

**FAIL / RELEASE BLOCKED.** The first acceptance found two concrete release blockers: clean Docker builds are not self-contained, and untrusted work still lacks disposable per-job isolation with kernel-enforced egress/disk policy. Golden portability also failed. Real providers, GitHub App/webhook, real model change, external Push/PR, Windows/Linux private-host deployment, TLS/VPN, full combat and soak/performance acceptance remain BLOCKED or NOT TESTED. No public deployment, paid model request, Push, PR, golden update or merge was performed.
