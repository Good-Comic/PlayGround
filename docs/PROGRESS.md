# Project Forge AI — Progress

Last verified: 2026-10-24 (Asia/Taipei; Debian cloud development container)

## Current isolation model

- Forge platform branch: `codex/project-forge-task-06`, based exactly on Task 05 commit `e178ca5c1bc68f6e22f869c6f9a4380ac67f0afc`.
- Riftwatch game branch: `codex/riftwatch-forge-integration`, in the ignored linked worktree `workspace/riftwatch`, based on checkpoint `3674a33d95c5165dc9ee5813a051f894a8c72378`.
- No merge into `main` was performed. No `opencode-resume/*` or `opencode-checkpoints/*` reference was moved or deleted.
- The game mount is read-only inside Forge Studio. Task 03 Git writes are confined to isolated data-volume clones and fixed commands; the API does not expose arbitrary shell or write to the imported worktree.

## Source identification and comparison

### Verified

- Remote `opencode-resume/4fabd2594ea403f912e7` resolves to `15b8a9c8065652e295d3e42fd10bb48bce76ff70`, whose commit subject says issue #11.
- Remote `codex/project-forge-task-01` resolves to `3c5a0b9888535b956f6c7ead0b81512e0f33bc81`.
- GitHub Issue #15 is open and in progress. Its body points back to the issue #11 checkpoint and commit `15b8a9c…`; the automation comment says restored changes are not yet verified.
- `opencode-resume/ffa6c7ab68e84d153534` at `5f7359c0793147b9031b880970acefa24b9988c9` is a direct descendant of `15b8a9c…` and adds 702 lines/removes 23 lines across 12 game files.
- `opencode-checkpoints/14` at `3674a33d95c5165dc9ee5813a051f894a8c72378` is a direct descendant of `5f7359c…`, adds 719 lines/removes 304 lines, and is the latest inspected, locally verified game result.
- The checkpoint was selected for the isolated integration because it contains the exact four requested Riftwatch titles and passed the checks below. This does not re-label Issue #15 as complete.

### Game execution evidence

The three candidate revisions were served from separate detached worktrees and exercised with their existing browser game plus the repository's locale validator.

| Revision | Existing locale test | Browser load / Start Game | Nemesis Director | Controlled 10-wave state traversal |
| --- | --- | --- | --- | --- |
| `15b8a9c…` | 4 locales × 472 keys, pass | pass | present | victory, 10 reports |
| `5f7359c…` | 4 locales × 525 keys, pass | pass | present | victory, 10 reports |
| `3674a33…` | 4 locales × 573 keys, pass | pass | present | victory, 10 reports |

For `3674a33…`, the four browser titles were verified as:

- `Age of Empires II: Riftwatch`
- `世紀帝國二：裂境守望`
- `世纪帝国二：裂境守望`
- `エイジ オブ エンパイア II：裂境の守り`

The Start Game check rendered a 1440×900 canvas with 13 player units and 6 buildings, entered `prep`, instantiated `NemesisDirector`, and displayed `0 / 10`. Browser automation completed ten transitions through the game's own `startWave`, `completeWave`, boon-selection UI, and victory state; it produced ten reports and 48 units at wave 10. This is a state-machine integration check, not a claim that a human or combat bot played every encounter in real time.

No console or page errors occurred in the final Forge-hosted browser run.

## Forge Studio integration

### Implemented and verified

- Local project import constrained to an existing directory below the mounted workspace.
- Read-only file inventory and UTF-8 file viewer; `.git`, parent traversal, absolute paths, binary content, oversized text, and files outside the selected project are rejected.
- Same-origin, read-only game preview suitable for Riftwatch HTML/CSS/JavaScript/font assets.
- Allowlisted Build action: verifies `index.html` and runs `node --check` for all 15 JavaScript files.
- Allowlisted Test action: runs the game's existing `node scripts/validate-locales.mjs` command.
- SQLite execution history records action, fixed command description, status, exit code, output, and timestamps across container recreation.
- Arbitrary commands are not accepted from the browser or API.
- Container includes pinned Node.js 24.19.0 for build/test execution and retains the pinned Python base image.
- Final unit suite: 11 tests passed. Python compilation, JavaScript syntax, Compose validation, image build, and container health checks passed.
- Real Studio API runs: Build passed; Test passed with 4 locales and 573 keys each.
- Real browser integration: HTTP 200, 29 files listed, embedded game title loaded, Start Game worked, test history increased, and browser console/page errors were empty.
- Security probes: file traversal returned 400, preview of `.git/config` returned 404, arbitrary `shell` action returned 400, and file inventory exposed zero `.git` entries.

## Task 02 — Model router and controlled Agent workflow

### Implemented

- Provider adapter interface with deterministic Mock, Ollama OpenAI-compatible, and cloud OpenAI-compatible adapters. OpenHands is advertised as an unavailable optional adapter while Canvas is stopped.
- Provider records include model ID, local/cloud classification, capability values (`Yes`, `No`, or `Unknown`), context window, timeout, retry count, input/output token limits, pricing, and per-task cost cap.
- Ollama URLs are restricted to localhost, `host.docker.internal`, or literal loopback/private IP addresses. Cloud endpoints require HTTPS and reject local/private literal targets, credentials in URLs, query strings, fragments, and redirects.
- Cloud credentials are read only from the server-side `FORGE_OPENAI_API_KEY` process environment. Provider create requests containing key/token/authorization/secret fields are rejected. GET responses and browser state expose only a configured/not-configured boolean.
- Cloud inference requires explicit input/output pricing. A projected worst-case cost check runs before the request, and reported usage is checked again against the cap.
- Agent state machine with queued, running, awaiting approval, approved, validating, completed, failed, cancelled, retried, and rolled-back transitions. Every transition is stored in SQLite with timestamps and messages.
- Provider failure messages, bounded retry, timeout, cooperative cancellation, token usage, cost, proposal, validation output, and task attempts are persisted.
- A provider may name one fallback provider. The same task keeps its instruction, indexed context, attempt, and audit trail; fallback selection is recorded, and capability downgrade rules are reapplied.
- If tool-call support is not positively confirmed, Edit/Test requests are downgraded to Plan and the reason is recorded rather than pretending an edit occurred.
- Each task receives a bounded file index plus at most one explicitly selected text file. It never receives the entire project specification automatically.
- Edit proposals are constrained to the selected existing file. A unified diff is shown before approval; no provider response is applied to the source project.
- Explicit approval applies the proposal only to `/data/agent-tasks/<task>/attempt-<n>/project`. Fixed `node --check` and existing locale-validation commands run there without accepting provider-supplied shell.
- Rollback restores the sandbox target from the read-only source. No commit, push, PR, merge, or write-back endpoint exists.

### Mock and integration verification

- Unit suite: 20 tests passed, including the OpenAI-compatible wire contract, provider URL/secret boundaries, capability downgrade, fallback state preservation, cancellation/retry, Mock plan, Mock edit proposal, explicit approval, fixed validation, unchanged source, audit events, and rollback.
- Container Mock diagnosis returned OK with model `forge-mock-v1`.
- A real Riftwatch Mock task proposed a `README.md` change in the isolated task workspace, waited for approval, then passed all 15 JavaScript syntax checks and `4 locales, 573 keys each`.
- Original Riftwatch `README.md` SHA-256 remained `7148c7e3bcb62e354e0af02d29e49cf27a9cb521ffc005d1fb852a3e321b769f` before approval, after validation, and after rollback. The game worktree stayed clean.
- Browser E2E returned HTTP 200, listed all three configured provider types, completed Plan and Edit/Test Mock tasks, displayed the diff and validation record, rolled back, and reported no console/page errors.
- Browser regression rechecked all four exact localized titles, started Riftwatch with 13 units and 6 buildings, verified `prep`, `NemesisDirector`, and `0 / 10`, then completed the controlled ten-wave state traversal with victory, 10 completed waves, 10 reports, and no console/page errors.

### Real model verification

- Ollama configuration and diagnosis paths were exercised. The configured `host.docker.internal:11434` endpoint returned HTTP 403 in this container, so no Ollama model inference was performed.
- Cloud OpenAI-compatible configuration was exercised without sending a credential. Diagnosis failed explicitly because `FORGE_OPENAI_API_KEY` is not configured; no paid request or real cloud inference was performed.
- Therefore real-model inference, real token accounting, and provider-specific tool-call quality are **not verified**. Mock success must not be interpreted as model success.

### Task 02 safety limitations

- Cancellation is checked before retries and after responses; an in-flight blocking HTTP request may continue until its configured timeout.
- Token estimates use a conservative character approximation before the call. Final accounting depends on usage values reported by the provider.
- DNS names for cloud providers are not resolved and pinned by this application; production deployment still needs an outbound proxy/allowlist to prevent DNS rebinding and restrict secret destinations.
- Task sandboxes share the Studio container and network namespace. They are writable copies with fixed validation commands, not hardened per-job containers.
- Provider configuration editing/deletion, encrypted multi-key vault storage, multi-hop fallback chains, and OpenHands backend execution are not yet implemented.

## Task 03 — GitHub App and guarded Git workflow

### Implemented

- Repository registration is scoped to one imported Studio project and the exact minimum GitHub App permissions: Metadata read, Contents read/write, and Pull requests read/write. Real mode also requires an installation ID.
- GitHub App ID, private-key file path, and webhook secret are server-only environment configuration. API/UI responses expose booleans only. Installation tokens are requested with an App JWT, cached in process memory until shortly before expiry, and are not stored in SQLite or logs.
- Webhooks accept only `push`, `pull_request`, and `ping`, require `X-Hub-Signature-256`, compare HMAC-SHA256 in constant time, cap bodies at 1 MiB, verify the authorized repository, and store only normalized fields plus a SHA-256 payload digest.
- Delivery IDs are idempotent. Reusing an ID with a changed body is rejected as a replay. Failed processing records bounded retry metadata; dirty state and forced updates stop synchronization for review.
- Mock reconciliation uses a durable cursor to recover events received while disconnected without double-processing them.
- Every approved Agent proposal is cloned into `/data/git-tasks/<task>/...`, checked out from the registered exact base SHA, and placed on a unique `forge/task-*` feature branch. The read-only source and imported Riftwatch worktree are never edited.
- Before local commit the service rechecks the feature branch, exact diff, high-confidence secret patterns, all 15 JavaScript syntax checks, and the existing locale validator. Only the reviewed target file is staged.
- Commit, push, and PR are separate explicit-confirmation API/UI actions. Push is always non-force, rejects protected branches, and real external writes additionally require `FORGE_GITHUB_EXTERNAL_WRITES=1`. There is no merge endpoint.
- The Studio displays GitHub configuration state, repository sync/conflict state, deliveries, changes, diffs, validation output, and an action audit.
- Runtime images are digest-pinned. The final image uses official `buildpack-deps:bookworm` for Git/OpenSSL, with pinned Python 3.12.12 and Node 24.19.0 runtimes copied in; this avoided the cloud Docker daemon's Debian-mirror DNS failure without disabling package verification.

### Verification evidence

- Unit/integration suite: 27 tests passed. Task 03 cases cover invalid HMAC, duplicate delivery, changed-body replay, unauthorized repository, retry/recovery, dirty and force-update conflicts, conflict-safe and idempotent reconciliation, isolated clone/branch, source preservation, diff/secret scan, allowlisted Build/Test, explicit commit, Mock push, PR dry-run, Mock PR, base-SHA conflict, least permissions, real-installation requirement, and real-write authorization rejection.
- Python compilation, browser JavaScript syntax, Compose validation, and `git diff --check` passed.
- Container health returned `status=ok`, `database=ready`, and `workspace=mounted`. Runtime versions were Git 2.39.5, OpenSSL 3.0.22, Node 24.19.0, and Python 3.12.12.
- HTTP Mock E2E completed Agent task 6, processed a signed webhook, identified its duplicate, rejected an altered replay with HTTP 409, prepared `forge/task-6-d1696ce8`, created a reviewed local commit, performed a Mock push, recovered one offline event, completed a PR dry-run, and created `mock://github/Good-Comic/PlayGround/pull/1`.
- Tests confirmed that neither the webhook secret nor a private-key marker was present in SQLite. Mock success is not real GitHub App authorization.
- Riftwatch regression passed Build, `4 locales, 573 keys each`, all four localized titles, Start Game with 13 units and 6 buildings, `NemesisDirector`, `0 / 10`, and controlled victory after 10 waves with 10 reports and no browser errors. Game commit remained `3674a33d…`, README SHA-256 remained `7148c7e3…`, and its worktree remained clean.

### Real GitHub verification and limitations

- `gh auth status` reports the current `GH_TOKEN` is invalid. No valid GitHub App ID, installation, private key, or production webhook secret was supplied.
- No real installation token was requested; no real commit was pushed; no real PR or merge was created. `FORGE_GITHUB_EXTERNAL_WRITES` remained disabled.
- Studio remains bound to `127.0.0.1:8080`; GitHub cannot deliver public webhooks to it. The future relay design in `docs/GITHUB_WEBHOOK_DEPLOYMENT.md` was not deployed.
- Conflict handling stops and surfaces forced/dirty conditions; it does not automatically resolve them. Retry scheduling is recorded, while a production worker must invoke due retries.
- The Studio has no user authentication or role model and must not be exposed directly. Production approval controls require authenticated users and authorization.
- See `docs/GITHUB_APP_SECURITY.md` for threats, controls, and residual risks.

## Task 04 — Isolated live game preview and quality gate

### Implemented

- A replaceable `GameEngineAdapter` interface now selects `web-rts-esm` for the existing Riftwatch HTML/CSS/JavaScript ES-module project. No engine conversion or game-source migration was performed.
- A preview starts from a copy of either the read-only imported project or a completed Agent task workspace under `/data/previews`. Vite 7.1.12 runs on a bounded loopback port with HMR; Studio restart marks orphaned sessions stopped.
- The Studio iframe uses `sandbox="allow-scripts allow-pointer-lock"` without `allow-same-origin`, a no-referrer policy, and a separate port origin. Preview assets allow only opaque `Origin: null`; the Forge API does not enable CORS. Browser probing confirmed `document.cookie` raises `SecurityError` and a preview fetch to the 8080 API fails with `TypeError`.
- Vite, Playwright Core, pixelmatch, and pngjs are exact-version locked. Task 06 upgrades Vite to 8.3.5 after a high-severity audit finding on 7.1.12. A digest-pinned `chromedp/headless-shell` sidecar exposes CDP only to the private Compose network; no browser port is published.
- Quality runs persist console errors, page errors, failed requests, changed files, metrics, success/failure screenshots, logs, and a full rollback copy in SQLite/data volume. Screenshots are served through a constrained PNG-only endpoint.
- Golden baselines are scoped by project and adapter. Initial creation and every update require `confirm: true` from an explicit Studio action and a passing source run.
- The fixed Playwright scenario verifies the four exact titles, Start Game, major UI selectors, 13 initial units, 6 buildings, `NemesisDirector`, `0 / 10`, all ten controlled wave transitions, victory, and ten reports. It labels this a controlled state-machine traversal, not a real-time combat playthrough.
- No model-supplied shell is accepted. Task 01–03 Build/Test, Provider, Agent, and GitHub flows remain available.

### Verification evidence

- Unit/integration suite: 30 tests passed, including real Vite startup, adapter detection, isolated file change visibility, source preservation, restart cleanup, and explicit golden approval rejection/acceptance.
- HMR browser probe changed only the isolated preview CSS and observed the outline update from `3px` to `7px` without reload or browser errors. The preview file was restored from a passing rollback point and matched the source SHA-256.
- Passing Quality Run 8 created the initial approved baseline. Run 10 compared against it with 418 changed pixels (`0.0323%`, threshold `1%`) and passed. Run 12 passed after rollback with 686 changed pixels (`0.0529%`).
- Final-image Quality Run 13 inherited the project/adapter baseline in a new preview, passed with 1,018 changed pixels (`0.0785%`), and recorded no console, page, or load errors.
- A deliberate syntax error was placed only in preview 8. Quality Run 11 rejected it, recorded `Unexpected token ';'`, identified `js/main.js` as modified, saved a failure screenshot and rollback path, and did not alter the Riftwatch worktree. Restoring Run 10's rollback returned `js/main.js` to SHA-256 `c03a0fab…`; Run 12 then passed.
- Isolated iframe UI E2E confirmed the adapter, sandbox flags, blocked cookie/API access, and no unexpected browser errors.
- Final static checks passed: Python compilation, browser/quality JavaScript syntax, npm dependency tree, Compose validation, and `git diff --check`.

### Measured data and limits

- Results varied materially in this shared cloud container. Run 10 measured load `4.589 s`, Start Game latency `866 ms`, and `23.85 FPS`; Run 12 measured load `7.199 s`, latency `790 ms`, and `4.93 FPS`; final Run 13 measured load `1.042 s`, latency `447 ms`, and `53.66 FPS`. Vite RSS ranged approximately `120–133 MiB`; Forge cgroup memory ranged approximately `133–149 MiB` during these samples.
- These samples are headless, short-duration, and cloud-resource-sensitive. They do not establish good performance, long-session stability, a target FPS, or production capacity.
- Visual comparison covers a deterministic 1440×900 setup/menu capture. It is not a replacement for cross-browser, multi-resolution, animation, or full combat visual testing.
- See `docs/GAME_PREVIEW_SECURITY.md` for the preview boundary and remaining risks.

## Task 05 — Traceable automation closed loop

### Implemented and Mock-verified

- A persisted state machine runs Planner → Engineer → QA → Reviewer → Task 04 Quality Gate and then stops at `awaiting_pr_approval`. Every transition, decision, attempt, usage value, failure, lock event, requirement status, diff, test result, and draft metadata is retained in SQLite.
- Role provider IDs are independently selectable. The verified path uses one deterministic Mock provider sequentially and explicitly records `sequential_mock_role` plus `independent_agent=false`; it is not represented as four independently running agents.
- `specs/v3/MANIFEST.json`, source chunks, and a source-linked requirements matrix were created. The manifest says `source_incomplete` because no full v3.0 planning document exists; no missing content was fabricated. Requests are limited to 6,000 characters and load selected requirement chunks only.
- Engineer work uses a new clone at the registered exact Riftwatch SHA, a unique `forge/automation-*` branch, and a 1–10 file allowlist. Traversal, symlinks, Git metadata, checkpoints, unexpected files, arbitrary shell, base drift, and protected branches are rejected. Multi-file diffs receive fixed Build/locale validation and secret scanning.
- Atomic SQLite leases prevent two jobs writing the same base workspace. Expired leases are recoverable and audited; restart recovery and failed attempts preserve isolated state. The initial attempt plus at most two retries is enforced alongside whole-task timeout, token, cost, and execution limits.
- QA reuses Task 04 Vite/Playwright. Reviewer records red-team security and blue-team requirement/quality decisions. A passing gate creates only a PR draft record with `external_action=not_performed`; there is no automation merge path.
- Studio now includes an Automation Board with requirement selection, role/job state, coverage, attempt and budget data, diff, test/quality evidence, PR draft, failures, retries, and safe-stop reasons.
- A repeatable performance suite runs 3–10 sequential Quality Gate samples and persists raw samples, min/median/p95/max, sample count, viewport, ordering, CPU count, and the uncontrolled-container caveat. This is diagnostic, not a production benchmark.
- Test suite currently passes 34 tests, including the pre-existing Task 01–04 cases plus Mock closed loop, source preservation, multi-file allowlist, audit semantics, input limits, three-attempt safe stop, lock conflict, and expired-lease recovery.

### Not verified

- No Ollama or cloud model inference was performed. The real-provider acceptance checklist exists, but real automation stays disabled by default. Mock results do not demonstrate autonomous AI development quality.
- No valid GitHub App/CLI authorization exists in this container. No external commit, push, PR, merge, paid request, public webhook, or public deployment was performed.
- Real Ollama/cloud inference, a valid GitHub App installation, and production deployment remain unverified. Task 04’s single-run FPS range must not be treated as an acceptance baseline.

### Final container evidence

- The final digest-pinned image built successfully; Compose reported both Forge Studio and the isolated browser sidecar running, and `/health` returned `status=ok`, `database=ready`, and `workspace=mounted`.
- HTTP Mock Job 1 completed on its first attempt with four sequential role records, 807 recorded tokens, cost `$0`, two reviewed files, secret scan, all 15 JavaScript syntax checks, `4 locales, 573 keys each`, and Playwright Quality Run 14. It stopped at `awaiting_pr_approval` with `external_action=not_performed`.
- Performance Suite 1 ran three sequential 1280×720 headless samples on a 5-CPU shared cloud container. All gates passed with no console/page/load errors. FPS min/median/p95/max was `30.68 / 60.72 / 61.02 / 61.02`; load time was `517.7 / 587.4 / 920.0 / 920.0 ms`; interaction latency was `276.8 / 535.0 / 540.2 / 540.2 ms`; Vite RSS was `119.0 / 124.0 / 131.4 / 131.4 MiB`. Each sample verified four languages, Start Game, 13 units, 6 buildings, `NemesisDirector`, `0 / 10`, and controlled victory with ten reports. The container load was uncontrolled and the sample count is small, so these are diagnostic observations, not a production FPS claim.
- Riftwatch remained clean at `3674a33d95c5165dc9ee5813a051f894a8c72378`; its README SHA-256 remained `7148c7e3bcb62e354e0af02d29e49cf27a9cb521ffc005d1fb852a3e321b769f`.

See `docs/AUTOMATION_SECURITY.md` for controls, threats, and residual risks.

## Task 06 — Security, recovery, and private-host operations

### Implemented and verified in Debian cloud

- API-default authentication now uses a local admin with PBKDF2-SHA256 (600,000 rounds), opaque random session and CSRF tokens stored only as hashes, 8-hour expiry, explicit revocation, five-failure/15-minute lockout, recent reauthentication, and persistent security audit records. Static login and health remain public; anonymous Studio APIs return 401 and authenticated POST without CSRF returns 403.
- Permissions are separated as read, modify, execute, push, PR, and merge. Commit/golden, Push, and PR routes enforce their scoped permission, recent reauthentication, CSRF, and existing explicit confirmation. Merge remains deliberately absent. OIDC is an extension point, not falsely claimed as connected.
- Secret lookup prefers owner-only mounted files for OpenAI and webhook secrets; GitHub private keys remain file-mounted. Symlinks, broad file modes, duplicate sources, browser/API exposure, plaintext database persistence, and a frontend leak sentinel are tested. Host vault/KMS rotation is documented; no local encryption key is stored beside ciphertext.
- Compose retains non-root/read-only execution, all-capability drop, no-new-privileges, loopback ports and bounded tmpfs, and adds PID/file-descriptor/log rotation limits. Source remains read-only, no Docker socket/SSH/cloud credentials are mounted, automation/preview workspaces are mode 0700 with a logical 256 MiB source quota, and existing timeouts remain enforced.
- Durable queue primitives persist idempotency keys, atomic claims, attempts, heartbeat/leases, safe cancel, retry limit, crash recovery, and dead letters. Unit tests exercise duplicate requests, lease expiry, two-attempt dead-lettering, cancellation, and completion. A real container restart recovered running Queue Job 1 to `queued` with `worker lease expired; recovered after crash` without duplicate completion.
- Operations metrics derive only from SQLite/cgroup records: automation success and token/cost totals, Quality Gate rate, queue state, GitHub sync/conflicts, recent errors, memory, and CPU. No fake live feed is generated.
- Backup uses SQLite's online backup API, captures Git refs and workspace records, and creates a SHA-256 manifest. The real backup was 319,488-byte SQLite + 4,159-byte refs + 22,661,951-byte archive. Restore verified all hashes, `PRAGMA integrity_check=ok`, 28 tables, and 1,011 archive entries in a new volume directory.
- The first real restore target under the intentionally limited 32 MiB `/tmp` failed with `ENOSPC`; this failure is retained as evidence. The corrected volume-backed restore passed and the deployment guide now forbids `/tmp` as the restore target.
- Linux and Windows/Docker Desktop check/start/stop/health entry points, private HTTPS/VPN guidance, update/rollback, secrets rotation, backup/restore, monitoring, and real-model/GitHub acceptance procedures are documented. Windows execution itself was not available and is not claimed.
- Red/blue threat analysis covers prompt injection, traversal, SSRF, shell/secret exfiltration, malicious dependencies, Git escalation, API bypass, webhook forgery/replay, queue duplication, and backup tampering. Existing Task 01–05 security tests remain part of the regression suite.
- The initial production dependency audit found one high-severity Vite advisory group. After the exact-version upgrade, preview tests passed and `npm audit --omit=dev --audit-level=high` reports 0 vulnerabilities.
- Vite 8 Quality Run 18 initially failed honestly with `403 Domain forbidden` because cloud Envoy intercepted the browser sidecar's Docker-hostname request. A proposed shared Studio/browser network namespace was rejected as an isolation regression. The final preview-only relay exposes only 5173–5182 inside the browser namespace and no API port. Quality Run 19 then passed with no console/page/load errors: four titles, Start Game, 13 units, 6 buildings, `NemesisDirector`, `0 / 10`, controlled victory, and ten reports. The approved golden was not updated.
- Authenticated Mock Automation Job 2 completed Planner/Engineer/QA/Reviewer and Quality Run 20 on attempt 1, recorded 803 tokens and `$0`, and stopped at `awaiting_pr_approval` with `external_action=not_performed`.
- Final Riftwatch remained clean at `3674a33d95c5165dc9ee5813a051f894a8c72378`; README SHA-256 remained `7148c7e3bcb62e354e0af02d29e49cf27a9cb521ffc005d1fb852a3e321b769f`.

### Deliberate limits and not-yet-verified items

- Per-job disposable containers, kernel-enforced per-job disk quota and egress policy are not implemented in the shared Studio container. Compose-level cgroup and filesystem hardening is real, but hostile public repositories still require an external hardened runner.
- Durable queue storage/recovery is implemented; a separately supervised always-on worker service and production scheduler were not exercised. Existing synchronous Task 01–05 APIs remain unchanged to avoid an unsafe migration.
- OAuth/OIDC, multi-user provisioning, off-host encrypted backup storage, external alerting, Windows private-host runtime, real Ollama/cloud inference, GitHub App installation, public HTTPS relay, and real Push/PR remain unverified.
- No service was exposed publicly, no paid request was made, and no PR or merge was created.

See `docs/HARDENING_THREAT_MODEL.md` and `docs/PRIVATE_HOST_DEPLOYMENT.md`.

## Not yet implemented

- Real GitHub App installation and credential verification.
- Authenticated multi-user/OIDC administration, production worker supervision, and operator-driven conflict resolution.
- Automatic merge (deliberately not implemented).
- Full real-time ten-wave combat playthrough, performance acceptance thresholds, long-duration soak testing, or cross-browser/multi-resolution visual coverage.
- Per-job container/egress isolation, TLS termination, off-host encrypted backup scheduling, and production operations verification.

## Environment limitations

- OpenHands Agent Canvas 1.29.0 remains optional and was not started. Its image pull exhausted the cloud daemon's storage while using the `vfs` driver (`no space left on device`). No unrelated Docker data was deleted.
- Docker-build DNS could not resolve `registry.npmjs.org`; dependencies were installed on the host with npm's lockfile/integrity checks and copied into the image. Unused Task 01–04 build cache and explicitly identified dangling Forge images were removed after approval; no volume, source, or unrelated container was deleted.
- The checked-in `start.sh` requires the OpenCode runtime's `default-start.mjs`, which is unavailable in this container; the game was served with a local HTTP server for verification instead.
- GitHub CLI authentication is invalid here. Read-only Git/HTTP inspection and branch pushes use the environment's proxied Git credentials.
- This is successful verification in an ephemeral Debian cloud development container. It is not evidence of a permanent private-host deployment.

## Safe continuation

See `docs/RIFTWATCH_WORKFLOW.md`. Any future game change must remain on the dedicated game branch, pass its existing tests and Forge checks, and be reviewed before a separately authorized PR or merge. Platform and game histories must not be merged directly.
