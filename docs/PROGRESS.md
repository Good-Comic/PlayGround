# Project Forge AI — Progress

Last verified: 2026-10-24 (Asia/Taipei; Debian cloud development container)

## Current isolation model

- Forge platform branch: `codex/project-forge-task-02`, based on integration commit `a1f9c0f5dcbd6dd0270cde7e6c5a02c7d1d8ac90`.
- Riftwatch game branch: `codex/riftwatch-forge-integration`, in the ignored linked worktree `workspace/riftwatch`, based on checkpoint `3674a33d95c5165dc9ee5813a051f894a8c72378`.
- No merge into `main` was performed. No `opencode-resume/*` or `opencode-checkpoints/*` reference was moved or deleted.
- The game mount is read-only inside Forge Studio. The Studio API does not expose Git writes or arbitrary shell commands.

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

## Not yet implemented

- Authenticated GitHub App/API integration and PR creation (Task 03).
- Automatic source editing, Git commit, push, or merge from the Studio UI.
- Full real-time ten-wave combat playthrough, performance acceptance, visual regression baselines, or cross-browser testing.
- Authentication, multi-user authorization, TLS termination, public exposure, backups, and production operations.

## Environment limitations

- OpenHands Agent Canvas 1.29.0 remains optional and was not started. Its image pull exhausted the cloud daemon's storage while using the `vfs` driver (`no space left on device`). No unrelated Docker data was deleted.
- The checked-in `start.sh` requires the OpenCode runtime's `default-start.mjs`, which is unavailable in this container; the game was served with a local HTTP server for verification instead.
- GitHub CLI authentication is invalid here. Read-only Git/HTTP inspection and branch pushes use the environment's proxied Git credentials.
- This is successful verification in an ephemeral Debian cloud development container. It is not evidence of a permanent private-host deployment.

## Safe continuation

See `docs/RIFTWATCH_WORKFLOW.md`. Any future game change must remain on the dedicated game branch, pass its existing tests and Forge checks, and be reviewed before a separately authorized PR or merge. Platform and game histories must not be merged directly.
