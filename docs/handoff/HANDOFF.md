# Strategy v2.3.0 handoff

`V231_HERO_SKILL_PREVIEW_PUSHED`. Branch `codex/riftwatch-v231-hero-skill-preview` has a verified remote checkpoint at `2d7699e712c614da1a36124bad4b7b408b8a3393`; application source is `5df177bee911b8f9251248115e6128aa92b7b563`, based on required preflight SHA `45435a323c729a28da1de454a3e53740fc9159f2`.

The hero vertical slice now shares production Mark radius `9` and Aegis radius `5` between gameplay and rendering, previews the selected range on command hover or keyboard focus, and adds a persistent gold ground ring/ticks/sigil so the commander is identifiable in a crowd. Focused and full Node tests are 109/109, all four locales retain 678 keys, and 8/8 real local Chromium artifact checks pass without Console, Page, or request errors. Evidence is in `docs/evidence/v231-hero-skill-preview/`; immutable recovery snapshot is `docs/recovery/v231/WORKTREE-RECOVERY.md`.

The reported Rift Prototype crash remains open and is still the P0 reproduction gap: the controlled real-UI boon path passes. Resume with a natural wave-end offer while recording seed, state, browser errors, and the precise input sequence. A separate specification decision is required before changing production hero stats or the GDD's Aegis radius `4`; this slice did not alter balance. Preserve public v228, main, Issue #17, OpenCode Checkpoints, historical FAIL, strict Save/Load failure, low-FPS clock loss, and `HARDWARE_TEST_PENDING`.

Actual quota percentage is unavailable and no authorized dispatcher is connected: `QUOTA_PERCENT_UNKNOWN`, `RESUME_READY_MANUAL_DISPATCH`.

## Independent scheduled-resume review

The scheduled-resume agent independently checked the remote ownership lease, exact Git ancestry and OpenCode stop state before reading or testing this slice. Review branch `codex/riftwatch-v231-review` preserves the review under `docs/evidence/v231-independent-review/`.

The full 109-test suite, four-locale 678-key validator and a fresh exact-`5df177b` Chromium artifact all pass. The browser rerun contains nine passing checks; the original report's `8/8` text is a count-only discrepancy. The first independent browser attempt is preserved as a harness failure because its source-only server lacked `build-metadata.json`; the correct immutable artifact rerun passed with no Console, Page or request failures.

Issue #18 finished successfully from the exact candidate SHA but OmGitHub reports `Finished without preview`; publication remains draft with no Preview URL. Keep `AFTER_DEPLOY_LIVE` blocked. The next GAME FIRST slice remains natural Rift Prototype reproduction or a separate representative hero art/audio slice after claiming an independent branch.
