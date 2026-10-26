# OmGitHub Issue #17 upgrade investigation

Captured at `2026-10-26T18:20:41Z`. This report records read-only inspection and local candidate acceptance. It does not claim that Issue #17 or an OmGitHub session was modified.

## Legacy backup

Issue #17 remains open and unchanged. Its OmGitHub session is ended and resumable, with workflow run `40116880325`. The issue body selects `opencode-resume/4fabd2594ea403f912e7` (`ad016b0a5db9bae99f0421044c28c7e27a89c883`) and records resume source `15b8a9c8065652e295d3e42fd10bb48bce76ff70`. The preserved checkpoint is `opencode-checkpoints/17` at `6476a4bc6d18f688b9c44db9a95c45901d76b741`.

The legacy preview is `https://good-comic-playground-914016dae8a7.omgithub.com`. Its downloaded `js/game.js` and `js/main.js` are byte-identical to checkpoint 17. This establishes the actual old preview source without relying on visible page text. The full public issue, comments and OmGitHub API response are preserved under `pre-upgrade/`; hashes and refs are recorded in `PRE-UPGRADE.json`.

## Supported mechanism

The OmGitHub frontend's Resume endpoint accepts a prompt and request ID. It does not accept a replacement branch or SHA, and it starts another OpenCode execution. Resume therefore cannot safely upgrade Issue #17 to this candidate.

The repository's official `.github/workflows/opencode.yml` and its pinned `OhMyGithub` preparation code support a branch selector in a new issue body:

```html
<!-- omgithub-request:v1 {"branch":"codex/riftwatch-omgithub17-upgrade-candidate"} -->
```

On an issue-opened event with the `OpenCode` label, the preparation code queries the GitHub branch endpoint, resolves the branch to a full commit SHA, and passes both `target_ref` and `target_sha` to the reusable workflow. This is the verified, supported way to start a separate OmGitHub task from the latest candidate. It is not a preview-only update, and opening the issue starts OpenCode.

No supported endpoint was found for replacing the existing #17 source branch or preview with an arbitrary SHA. Rewriting its resume branch or checkpoint would be destructive and is excluded.

## Candidate and acceptance

The immutable source branch `codex/riftwatch-omgithub17-upgrade-candidate` resolves to `45435a323c729a28da1de454a3e53740fc9159f2`. Its gameplay commit includes the v2.3 input slice at `d92641dc73e1ea85c4ab585dcecab72cc6f43a82`; later commits on the source branch contain its already-published local evidence and handoff records.

Local Chromium acceptance was run against an artifact built from the exact candidate SHA with 28 resource hashes verified:

- 12/12 core checks passed: startup, pointer selection, movement-capable villagers, house construction, training, Save/Reload/Continue, four locales, Bug JSON, and no runtime/console/request failures.
- 7/7 input and Rally checks passed: same-type double-click, camera pan, Attack-Move, building selection, Rally Point, Rally-facing unit exit, and Rift Prototype playability.
- 6/6 hero checks passed: pointer selection, direct control, movement, Aegis activation, and no browser errors.
- A 70-second natural Chromium observation completed with 101 samples, enemy combat and player kills, resource gathering, prep-to-wave transition, and no page, request or console errors.

These results are `AFTER_LOCAL`; they are not a new OmGitHub online acceptance. Historical performance failures, simulation-time issues and hardware-test pending status remain open.

## Safe continuation

Keep Issue #17 and its current preview as the legacy comparison. Create a separate issue with the `OpenCode` label and the exact request marker above. Immediately verify that the workflow resolved `target_ref` to the candidate branch and `target_sha` to `45435a323c729a28da1de454a3e53740fc9159f2`. The new preview must use a different OmGitHub URL. If the resolved SHA differs, stop the new task before accepting any changes and investigate the branch movement.

Rollback consists of stopping or closing only the new issue/session. No legacy branch, checkpoint or preview needs to be changed.
