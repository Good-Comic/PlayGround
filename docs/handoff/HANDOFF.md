# Strategy v2.3.0 handoff

`V231_HERO_SKILL_PREVIEW_PUSHED`. Branch `codex/riftwatch-v231-hero-skill-preview` has a verified remote checkpoint at `2d7699e712c614da1a36124bad4b7b408b8a3393`; application source is `5df177bee911b8f9251248115e6128aa92b7b563`, based on required preflight SHA `45435a323c729a28da1de454a3e53740fc9159f2`.

The hero vertical slice now shares production Mark radius `9` and Aegis radius `5` between gameplay and rendering, previews the selected range on command hover or keyboard focus, and adds a persistent gold ground ring/ticks/sigil so the commander is identifiable in a crowd. Focused and full Node tests are 109/109, all four locales retain 678 keys, and 8/8 real local Chromium artifact checks pass without Console, Page, or request errors. Evidence is in `docs/evidence/v231-hero-skill-preview/`; immutable recovery snapshot is `docs/recovery/v231/WORKTREE-RECOVERY.md`.

The reported Rift Prototype crash remains open and is still the P0 reproduction gap: the controlled real-UI boon path passes. Resume with a natural wave-end offer while recording seed, state, browser errors, and the precise input sequence. A separate specification decision is required before changing production hero stats or the GDD's Aegis radius `4`; this slice did not alter balance. Preserve public v228, main, Issue #17, OpenCode Checkpoints, historical FAIL, strict Save/Load failure, low-FPS clock loss, and `HARDWARE_TEST_PENDING`.

Actual quota percentage is unavailable and no authorized dispatcher is connected: `QUOTA_PERCENT_UNKNOWN`, `RESUME_READY_MANUAL_DISPATCH`.

## v232 Rift Prototype / Issue #18 checkpoint

Issue #18's code run succeeded but its publication lifecycle did not. The official App Tunnel targeted port 3000, while OpenCode QA used 8018/8019/8020; all twenty recorded deployment-registration callbacks returned HTTP 409 `This deployment was superseded`, no public-readiness log or Preview URL exists, and no deploy-only control is available to this actor. Do not equate the Actions success or local Chromium PASS with online Preview verification. A new official Resume/Continue execution requires separate approval.

Gameplay branch `codex/riftwatch-v232-rift-prototype` preserves application source `86704e1fe6d8ef356a6706c0218854ca6aa593b7` and complete evidence checkpoint `f57946fc0cbdb4c8b15f2b81d3f4473ef34dd6d1`. A real natural Chromium first wave reached boon without errors, but Rift Prototype was not among the three cards, so the reported natural crash stays `NOT_REPRODUCED`. The new dedicated awakening cue is locally verified: 110/110 Node and exact 28-file artifact Chromium spawn/cue/move PASS. Continue with an original player save/seed if available, additional natural campaigns, or a separate GAME FIRST visual/audio slice. Public v228, Issue #17, main, Checkpoints, low-FPS/SaveLoad FAIL, and HARDWARE_TEST_PENDING remain unchanged.

## v233 Issue #18 generation diagnosis / adaptive score

Issue #18 latest internal identity is run `40377196806`, attempt 1, generation 234, stage identity `40377196806:1`; OmGitHub exposes no separate Deployment ID. The twenty HTTP409 callbacks (generations5–221) are older generations within the same run/attempt. No second Worker, Actions run or GitHub Deployment was found. The official port3000 Tunnel registered and was publicly captured, but its Riftwatch page showed `PLAYTEST · BUILD BLOCKED` and the v228 label: the source root, not OpenCode's later valid immutable artifact on8019/8020, was bound to the official App Tunnel. No deploy-only repair interface is exposed. Resume is a new execution and remains unauthorized. See `docs/evidence/v233-omgithub18-preview/`.

GAME FIRST branch `codex/riftwatch-v233-dynamic-score` preserves application `f9d458ac5e578d4e1b6ce0f764aac844774f7fcf` and evidence checkpoint `a6a54ef7674e033432f4233694f87ff1303ad6b6`. It adds an adaptive procedural score for menu/prep/wave/Boss/boon/pause without external assets or gameplay/RNG changes. 111/111 Node and7/7 exact-artifact Chromium pass; real 48kHz stereo Opus prep/battle recordings are saved. Continue with natural campaign/Rift save reproduction or a representative visual/battle-alert slice. Preserve #17, Pages, main, Checkpoints, clock/SaveLoad FAIL and HARDWARE_TEST_PENDING.


## v233 source-switch preflight / battlefield silhouettes

Branch `codex/riftwatch-v233-visual-silhouettes` preserves application source `d989bb7236cb7e6bc4bee6892ff0fae9196bc2da` and evidence checkpoint `eb9d0acc4486fd8ede3136ac134b90d828e56dfa`. The #18 client Resume API sends only prompt/request_id and cannot enforce a branch or full SHA; its Issue marker still names the old upgrade-candidate branch. No Resume/Continue/new Issue was triggered. The minimum observed source-selecting path is one new isolated Issue against a frozen branch, with exact-SHA preflight and the generated 28-file artifact served on official port3000; separate authorization is required.

GAME FIRST adds distinct silhouettes for archer/skirmisher/Chu Ko Nu, militia/guard and knight/light cavalry/horse archer. 113/113 Node and 4/4 exact-artifact real local Chromium checks pass; screenshot and hashes are in `docs/evidence/v233-visual-silhouettes/`. This is AFTER_LOCAL, not OmGitHub or public Preview verification. Continue with civilization/building landmarks, battle alerts, and natural campaign/Rift sampling. Preserve #17, public Pages, main, Checkpoints, low-FPS/SaveLoad/history FAIL and HARDWARE_TEST_PENDING.

## v234 Playtest Candidate checkpoint

Branch `codex/riftwatch-playtest-v234` packages Build SHA `34873f76e8ad88d1f238210cfea87ff12f0fa587`; artifact/evidence commit `d4078fb6cf21db8a75bf69ec4f455cb6b279ada8` is remotely verified. ZIP SHA-256 is `6553da1178ede1cb0af4539b0851f617a2753082c978d4f05d26e3bf266b1b90`; canonical 28-file manifest SHA-256 is `3db2378a3c9fc6d986135213ef45a5e20ce3af46e419065c7cc0e95123cde71e`; the archive has31 hosting files. Compared with gameplay predecessor `055fb12c92e3d48945315937058f1423b732241c`, only the two Known Issues payloads changed and the other26 hashes match.

113/113 Node tests remain valid because the following candidate change is documentation-only. Real Chromium on the exact v234 artifact passed12/12 core playtest,7/7 input/Rally/Prototype,9/9 hero, and4/4 silhouette checks with zero Console/Page/request failures. Basic Save/Load and four locales pass; strict determinism, low-FPS clock, historical performance, natural Rift crash reproduction, full ten-wave stability and physical hardware remain open.

Publication is prepared but blocked pending explicit v234 Pages authorization. Plan: `docs/playtest/v234/APPROVAL-PLAN.json`. The proposed immutable URL is <https://good-comic.github.io/PlayGround/builds/34873f76e8ad88d1f238210cfea87ff12f0fa587/>. Current site branch remains `5b30bda085197cfa820a594224e2f6df929bf60d`; no Pages branch/root/configuration or existing full-SHA directory was changed.
