# Strategy v2.3.0 handoff

`V231_HERO_SKILL_PREVIEW_PUSHED`. Branch `codex/riftwatch-v231-hero-skill-preview` has a verified remote checkpoint at `2d7699e712c614da1a36124bad4b7b408b8a3393`; application source is `5df177bee911b8f9251248115e6128aa92b7b563`, based on required preflight SHA `45435a323c729a28da1de454a3e53740fc9159f2`.

The hero vertical slice now shares production Mark radius `9` and Aegis radius `5` between gameplay and rendering, previews the selected range on command hover or keyboard focus, and adds a persistent gold ground ring/ticks/sigil so the commander is identifiable in a crowd. Focused and full Node tests are 109/109, all four locales retain 678 keys, and 8/8 real local Chromium artifact checks pass without Console, Page, or request errors. Evidence is in `docs/evidence/v231-hero-skill-preview/`; immutable recovery snapshot is `docs/recovery/v231/WORKTREE-RECOVERY.md`.

The reported Rift Prototype crash remains open and is still the P0 reproduction gap: the controlled real-UI boon path passes. Resume with a natural wave-end offer while recording seed, state, browser errors, and the precise input sequence. A separate specification decision is required before changing production hero stats or the GDD's Aegis radius `4`; this slice did not alter balance. Preserve public v228, main, Issue #17, OpenCode Checkpoints, historical FAIL, strict Save/Load failure, low-FPS clock loss, and `HARDWARE_TEST_PENDING`.

Actual quota percentage is unavailable and no authorized dispatcher is connected: `QUOTA_PERCENT_UNKNOWN`, `RESUME_READY_MANUAL_DISPATCH`.

## v232 Rift Prototype / Issue #18 checkpoint

Issue #18's code run succeeded but its publication lifecycle did not. The official App Tunnel targeted port 3000, while OpenCode QA used 8018/8019/8020; all twenty recorded deployment-registration callbacks returned HTTP 409 `This deployment was superseded`, no public-readiness log or Preview URL exists, and no deploy-only control is available to this actor. Do not equate the Actions success or local Chromium PASS with online Preview verification. A new official Resume/Continue execution requires separate approval.

Gameplay branch `codex/riftwatch-v232-rift-prototype` preserves application source `86704e1fe6d8ef356a6706c0218854ca6aa593b7` and complete evidence checkpoint `f57946fc0cbdb4c8b15f2b81d3f4473ef34dd6d1`. A real natural Chromium first wave reached boon without errors, but Rift Prototype was not among the three cards, so the reported natural crash stays `NOT_REPRODUCED`. The new dedicated awakening cue is locally verified: 110/110 Node and exact 28-file artifact Chromium spawn/cue/move PASS. Continue with an original player save/seed if available, additional natural campaigns, or a separate GAME FIRST visual/audio slice. Public v228, Issue #17, main, Checkpoints, low-FPS/SaveLoad FAIL, and HARDWARE_TEST_PENDING remain unchanged.
