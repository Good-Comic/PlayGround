# Riftwatch isolated development workflow

Riftwatch and Project Forge AI share a GitHub repository but are intentionally kept on unrelated branches and separate worktrees. Do not merge the game history into the platform history.

## Current layout

- Platform checkout: repository root, branch `codex/project-forge-task-05`.
- Game checkout: `workspace/riftwatch`, branch `codex/riftwatch-forge-integration`.
- Studio mount: host `./workspace` to container `/workspace`, read-only.
- Studio project path: `riftwatch`.

`workspace/` is ignored by the platform branch, so game files cannot accidentally enter a platform commit. The read-only container mount prevents Studio preview/build/test operations from altering game files.

## Before changing the game

Run these checks from the platform checkout:

```sh
git branch --show-current
git status --short
git -C workspace/riftwatch branch --show-current
git -C workspace/riftwatch status --short
```

Both worktrees must be on their named development branches. Stop if the game worktree is detached, on an `opencode-*` reference, or has unexpected changes.

## Verify a game change

Use the game's own validator and the Forge allowlisted checks:

```sh
node workspace/riftwatch/scripts/validate-locales.mjs
docker compose up -d --build forge-studio
curl -fsS http://127.0.0.1:8080/health
```

In Studio, select `riftwatch`, confirm the preview loads, then run Build and Test. Build checks every JavaScript source file; Test invokes the existing locale validator and stores the result.

For Task 04 live preview, start the `web-rts-esm` adapter from the read-only project or a completed Agent task. Studio copies it to `/data/previews`, starts Vite with HMR, and embeds its separate loopback origin in a sandboxed iframe. Run the Playwright Quality Gate before Git preparation. A golden baseline is shared by project/adapter, but creating or replacing it requires a separate explicit approval. A passing ten-wave traversal verifies state transitions only; it is not a claim of complete combat play.

## Write changes back safely

1. Edit only inside `workspace/riftwatch` while it is on `codex/riftwatch-forge-integration` (or a newly named game-only branch).
2. Review `git -C workspace/riftwatch diff` and rerun all relevant tests.
3. Commit from the game worktree only. Never commit game files from the platform checkout.
4. Push only the named game development branch. Never force-push or update `main`, `opencode-resume/*`, or `opencode-checkpoints/*`.
5. Creating a PR requires explicit authorization. Merging that PR requires a separate explicit authorization after checks pass.

Task 03 adds a guarded write-back path without writing to this imported game worktree. It clones the registered game ref at the exact base SHA into `/data/git-tasks`, applies only an already approved Agent proposal, and creates a unique `forge/task-*` branch. Review the displayed diff and validation record before separately approving local commit, push, and PR. Real external writes stay disabled unless a GitHub App is configured and the operator explicitly enables them. Force-push, protected-branch push, checkpoint edits, and merge are not supported.

## AI proposal workflow

Agent Edit/Test requests first create a separate copy under the Forge data volume, show a unified diff, and wait for explicit approval before changing even that copy. Approval runs only Forge-owned validation commands. Task 03 may then import that exact reviewed proposal into a second isolated Git clone and re-run branch, diff, secret, Build, and Test gates. Neither stage writes to `workspace/riftwatch`. See `docs/AI_PROVIDER_SECURITY.md` and `docs/GITHUB_APP_SECURITY.md` for the boundaries.

Task 05 adds a closed loop in `/data/automation-jobs`. It clones the exact registered SHA, takes a single-writer lease, limits edits to a predeclared multi-file allowlist, and runs QA, red/blue review, and the Task 04 Quality Gate. A pass creates only PR draft metadata; external commit/push/PR still requires Task 03 approvals and valid authorization. See `docs/AUTOMATION_SECURITY.md`.
