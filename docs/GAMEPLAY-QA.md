# Gameplay acceptance protocol

Every important change follows **BEFORE_LIVE → AFTER_LOCAL → AFTER_DEPLOY_LIVE**. Local success is never a deployed fix. No tool here deploys, writes to GitHub, changes the allowlist, or opens an existing player's saved game.

## Provenance and baseline

Development branch: `codex/riftwatch-gameplay-improvement`; separate worktree `/workspace/riftwatch`. The original `/workspace/PlayGround` checkout remains on its original branch. Remote `main` was `e35a73329ee7942627496e55b844d02b2501e685` and does not contain the complete game. The latest issue-17 checkpoint was `6476a4bc6d18f688b9c44db9a95c45901d76b741`. Its tree is byte-identical to the verified Preview source `914016dae8a7eb131b7e06c49a36c6a3276247d0`; that checkpoint is the development parent. The resume branch `ad016b0` lacks much of this game and was not selected. No checkpoint, platform branch, main, or user changes were overwritten.

The provided Master Gameplay Improvement Directive v1.0 is the requirement source. This checkpoint does not contain `tools/riftwatch/check-package.mjs`, `read-spec.mjs`, or the 14-part GDD package. Do not fabricate completion of their contracts. Existing game modules, Agents.md, README, capture.sh, start.sh and window.ageOfAsh are preserved.

## Reproduce

Prerequisites: Node 24, Python Playwright, system Chromium, `certutil`. Run a persistent local server from the repository:

```sh
python tools/qa/serve.py --port 8008
```

The read-only `/__qa_build.json` endpoint exposes the current Git SHA, branch, dirty state and SHA-256 of every game JS file, HTML and CSS. It is a local diagnostic endpoint, not a production release service. The current UI exposes Build ID `riftwatch-gameplay-p0.2` (the first milestone used p0.1). A release must also record its exact Git SHA and manifest; a Build ID alone is insufficient.

```sh
node --test tests/*.test.mjs
node scripts/validate-locales.mjs
python tools/qa/gameplay.py --stage BEFORE_LIVE --url https://omgithub.com/Good-Comic/PlayGround/issues/17 --out /workspace/diagnostics/riftwatch/before-live
python tools/qa/gameplay.py --stage AFTER_LOCAL --url http://127.0.0.1:8008 --expected-commit COMMIT_SHA --out /workspace/diagnostics/riftwatch/after-local
python tools/qa/analyze.py /workspace/diagnostics/riftwatch/after-local/evidence.json
```

Use the same seed string `riftwatch-p0-v1` (numeric seed `3215474622`), TEU, steppe and speed 1 for paired tests. The tool uses real Playwright inputs for menu selection, Start Game, left-select and right-command. It reads game state without writing it. It creates an isolated browser context and does not invoke Save, Load, GM, Continue, or Publish. CA trust uses the environment-provided certificates; TLS checks remain enabled. For LIVE stages Chromium uses the inherited proxy. It does not retry failed navigation or change permissions. A blocked Preview stops the scenario.

Each output contains screenshot sequence, Playwright trace, HAR, Console, page errors, actions and 500ms state samples. Full output is kept outside the repository to avoid committing large traces. Keep both failed drafts and successful final runs. `analyze.py` reports observations, not universal passes: no combat encounter means no proof of target switching; a deposit count alone does not prove resource conservation. Inspect screenshots and state transitions too.

Use `verify-resources.py` to compare HAR bytes to a specified Git tree. This is content comparison, never a locally run LIVE test. The source Preview has injected HTML; report differences instead of claiming an identical entire deployment.

## Deployment gate

Current state: **DEPLOYMENT_BLOCKED**. There is no authorized mechanism here to replace the OmGitHub Preview with this branch. Do not click Continue to request a different game implementation or Publish to change a user's project. After an authorized deployment, record the new URL/commit, confirm captured game code matches that commit, then run the same tool using `--stage AFTER_DEPLOY_LIVE`. Reject a local URL for either LIVE stage.

## Remaining acceptance

The current functional scenarios cover the three observed P0 failures and the extended crowd, economy, stance and save/load contracts. This is not completion of every Phase A requirement: the measured1000-unit performance/progress gate FAILS, and broader Guard/Attack-Move/all-map endurance remain open. Synthetic contract tests, screenshots and deployed gameplay verification are distinct evidence types.

## Phase A extended acceptance (current)

The latest implementation is8ba384889d3eb3d782ce9a5eb98f569afbd14d6d / Build IDriftwatch-gameplay-p0.2. See GAMEPLAY-PROGRESS.md; it supersedes the initial milestone's remaining-work list. 1000-unit performance FAILS, so no overall Phase A sign-off is granted.

```sh
QA_OUT=/workspace/diagnostics/riftwatch/phase-a/unit-observations.json node --test tests/*.test.mjs
python tools/qa/phase-a-browser.py --expected-commit COMMIT_SHA --out /workspace/diagnostics/riftwatch/phase-a/browser
python tools/qa/performance.py --expected-commit COMMIT_SHA --out /workspace/diagnostics/riftwatch/phase-a/performance-final
```

Use a clean checkout and matching local server. The browser fixture tool performs real local Save/Continue in a fresh disposable context; it never reads or changes an existing user save. It also uses explicitly synthetic maps with actual drag/right-click input to stress crowd/one-tile corridors. These are not online gameplay tests. The performance tool performs actual production update/render/UI work; exit0 only means measurements were saved—inspect each case's `pass` and raw distributions.

Performance must be run without other benchmark/game browser workloads concurrently. Record hardware, cgroup quotas, rendering backend, viewport, warmup/measurement duration and served-file provenance. Do not generalize an open-field passive-unit result to combat or different hardware. The normal seeded gameplay tool remains independent and records real menu and world interaction without synthetic map setup.
