# Project Forge AI — Progress

Last verified: 2026-10-23 (Debian cloud development container)

## Current isolation model

- Forge platform branch: `codex/project-forge-riftwatch-integration`, based on platform commit `3c5a0b9888535b956f6c7ead0b81512e0f33bc81`.
- Riftwatch game branch: `codex/riftwatch-forge-integration`, in the ignored linked worktree `workspace/riftwatch`, based on checkpoint `3674a33d95c5165dc9ee5813a051f894a8c72378`.
- No merge into `main` was performed. No `opencode-resume/*` or `opencode-checkpoint/*` reference was moved or deleted.
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

## Not yet implemented

- Local/cloud AI model routing (Task 02).
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
