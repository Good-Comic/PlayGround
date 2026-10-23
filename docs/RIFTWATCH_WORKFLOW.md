# Riftwatch isolated development workflow

Riftwatch and Project Forge AI share a GitHub repository but are intentionally kept on unrelated branches and separate worktrees. Do not merge the game history into the platform history.

## Current layout

- Platform checkout: repository root, branch `codex/project-forge-riftwatch-integration`.
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

## Write changes back safely

1. Edit only inside `workspace/riftwatch` while it is on `codex/riftwatch-forge-integration` (or a newly named game-only branch).
2. Review `git -C workspace/riftwatch diff` and rerun all relevant tests.
3. Commit from the game worktree only. Never commit game files from the platform checkout.
4. Push only the named game development branch. Never force-push or update `main`, `opencode-resume/*`, or `opencode-checkpoints/*`.
5. Creating a PR requires explicit authorization. Merging that PR requires a separate explicit authorization after checks pass.

The current Studio deliberately has no Git write endpoint. Adding one later must preserve branch allowlisting, clean-worktree checks, explicit review, non-force push, audit logging, and separate authorization for PR creation and merge.

## AI proposal workflow

Task 02 does not alter this Git process. Agent Edit/Test requests create a separate copy under the Forge data volume, show a unified diff, and wait for explicit approval before changing even that copy. Approval runs only Forge-owned validation commands in the copy. Completion does not write back to `workspace/riftwatch`; use the manual branch workflow above only after reviewing an approved proposal. See `docs/AI_PROVIDER_SECURITY.md` for the full boundary.
