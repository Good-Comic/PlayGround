# 目前接續 / Current continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**中文：** 最新工作為剩餘項目盤點與V5.10–V5.13真實本地Chromium比較。V5.12與已覆核設定的V5.13均第三波自然戰敗，十波／自然New Game+未通過。已修復Continue後設定未套用的測試工具缺陷，不能將修正誤報為遊戲平衡改善。最新詳細索引：`docs/evidence/v240-remaining-audit/REPORT.md`；發布判定：`docs/release/v240/REMAINING-WORK-AUDIT.md`，RELEASE_BLOCKED。遊戲來源0f85357303bf2bca809e6ff32b490769e1d3f836不變。所有戰役已結束。

**English:** Latest work is the remaining-work audit and actual local ChromiumV5.10–V5.13comparisons. V5.12 and settings-verifiedV5.13 naturally lost at wave3; ten waves/natural New Game+ have not passed. Fixed the harness defect where settings were not applied after Continue; this is not a game-balance improvement. Detailed index: `docs/evidence/v240-remaining-audit/REPORT.md`; verdict: `docs/release/v240/REMAINING-WORK-AUDIT.md`, RELEASE_BLOCKED. Game source0f85357303bf2bca809e6ff32b490769e1d3f836 is unchanged. All campaigns ended.

**中文：** 下一步設計V6開局投資／集中防禦，勿再次重跑同一失敗策略。延後科技必須正式Start，因舊存活快照已第二時代，禁止退款／灌資源。若要接續存活樣本，使用 `docs/evidence/v240-remaining-audit/v510-continuation/save-snapshot.json`，SHA256 `e07a7b23206c206556ade0ec44a4f1cb85dbdd00e4eee5e80217ee78315bd8ba`；後續V5.13快照已戰敗。停止原因是執行窗口，不是額度百分比。所有權於推送後釋放，以遠端ownership.json為準。

**English:** Next designV6opening investment/concentrated defense; do not rerun the same failed policy. Delayed technology requires native Start because old living saves are already age2; no refunds/resource injection. For a living continuation use `docs/evidence/v240-remaining-audit/v510-continuation/save-snapshot.json`, SHA256 `e07a7b23206c206556ade0ec44a4f1cb85dbdd00e4eee5e80217ee78315bd8ba`; laterV5.13saves are defeated. Stop reason is execution window, not quota percentage. Ownership is released after push; remoteownership.json is authoritative.

---

## 歷史接續摘要 / Historical continuation summaries

## 最新安全接續點 / Latest safe resume point

**中文：** V5.7、V5.8及V5.9於第三波自然戰敗，不能推論 Normal 無法通關。V5.10僅完成30.53秒開局檢查：8村民、第二時代、7軍事人口、兩間初始房屋、射箭場施工中，木材212.01。八項策略測試通過。完整十波及 New Game+ 尚未通過。遊戲來源仍為 `0f85357303bf2bca809e6ff32b490769e1d3f836`，本輪只修改自動玩家與證據。

**English:** V5.7, V5.8 and V5.9 naturally lost at wave three; this does not establish that Normal is unwinnable. V5.10 completed only a30.53-second opening check:8workers, age2,7military, two initial houses, a range under construction and212.01wood. Eight policy tests passed. Full ten-wave and New Game+ acceptance remain incomplete. The tested game source remains `0f85357303bf2bca809e6ff32b490769e1d3f836`; this round changed only the automated player and evidence.

**中文：** 下一步由 `docs/evidence/v240-v55-economy/v510/save-snapshot.json` 繼續1× Normal，原生戰爭管家開啟。快照 SHA256：`fac53498b0379a8f6ef35b390f2b30ba4c09275b1f9854b02256622e689d576f`。本次因執行窗口結束保存；沒有正在執行的戰役。保留低FPS、Save/Load非確定性、性能FAIL與硬體待測。跨對話傳送不可用，不宣稱送達。

**English:** Next, continue `docs/evidence/v240-v55-economy/v510/save-snapshot.json` at1× Normal with the native army steward enabled. Snapshot SHA256: `fac53498b0379a8f6ef35b390f2b30ba4c09275b1f9854b02256622e689d576f`. This checkpoint ends the execution window; no campaign remains active. Low-FPS, Save/Load nondeterminism, performance FAIL and hardware-pending issues remain. Cross-thread delivery is unavailable and is not claimed.

BILINGUAL_DOCUMENTATION_REQUIRED = true

---

# 目前接續狀態 / Current Handoff

`ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md`
`BILINGUAL_DOCUMENTATION_REQUIRED = true`

**目前接續繁體中文：** 本輪以真正最新遠端 e00ce53 接續，並建立 V1–V4 根因對照。自然操作發現資源選取 TypeError，已修於 `0f85357303bf2bca809e6ff32b490769e1d3f836`，四資源／四語原生選取與 SaveContinue 通過。V5.4修復後仍第四波戰敗、無瀏覽器錯誤；缺食物但木材／黃金富餘，先修自動玩家資源／軍費／科技預算，不改 Normal。原生撤退限定驗證通過，尚未自然全戰役驗證。所有測試程序已停止；本輪因執行窗口安全保存。完整十波與自然 New Game+ 仍未通過；不要把任何受控 Fixture當自然通關。最新索引 `docs/evidence/v240-v5-playability/REPORT.md`。V5.4最終快照已戰敗，不可誤當存活接續。

**Current English:** Resumed from actual latest remote e00ce53 and compared V1–V4 causes. Natural input exposed a resource-selection TypeError, fixed in `0f85357303bf2bca809e6ff32b490769e1d3f836`; native selection/SaveContinue passed across4resources/locales. Post-fix V5.4 still lost at wave4 without browser errors; food shortage despite wood/gold surplus points first to policy allocation/reinforcement/technology budgeting, not Normal-stat changes. Native withdrawal passed scoped input verification, not full-campaign testing. All test processes are stopped; safely checkpointed for this execution window. Ten-wave and natural New Game+ acceptance remain incomplete; never substitute controlled fixtures. Latest index: `docs/evidence/v240-v5-playability/REPORT.md`. V5.4's final save is defeated, not a living continuation.

## 先前快照觀察（歷史，非最新狀態） / Earlier snapshot observations (historical, not current)

**最新繁體中文：** 本輪永久雙語規範已整合。V5 180秒試跑自然完成第一波並到第二波，第二時代與8間房屋已完成，但最終村民為0，存活目標 FAIL。市鎮中心仍存活，最新完整快照在 `docs/evidence/v240-bilingual-v5/pilot/save-snapshot.json`；SHA-256 見相鄰 `verification.json`。原生 Continue 接續與錯誤雜湊拒絕均已測試；嚴格確定性未通過。下一輪以此 V5 存活戰役為準，先處理村民損失，不從 V4 戰敗狀態恢復。完整十波／自然 New Game+ 仍 NOT_PASSED。

**Latest English:** The permanent bilingual policy is integrated. V5's180-second pilot naturally completed wave1 and entered wave2, reaching age2 and8houses, but ended with0workers: worker-survival goal FAIL. The Town Center remains alive; the latest complete snapshot is `docs/evidence/v240-bilingual-v5/pilot/save-snapshot.json`, with SHA-256 in the adjacent `verification.json`. Native Continue and incorrect-digest rejection were tested; strict determinism has not passed. Continue this living V5 campaign next, prioritize worker losses, and do not restore V4's defeated state. Full ten-wave/natural New Game+ acceptance remains NOT_PASSED.

**繁體中文：** 有效開發分支為 `codex/riftwatch-v240-game-first`，本輪開始前已核對遠端 `f2438d965a7bd86faf2baebd46de69a06ed7d7c2`。遊戲來源為 `a5a538d287b9c29951a83ebede5431db9fce7dc7`。舊歷史段落中的 Strategy 分支限定敘述不代表目前未整合；本分支已採用 v2.4.0 與最新雙語規範。每次恢復仍須重新查詢最新遠端及 Task Ownership。

**English:** The active development branch is `codex/riftwatch-v240-game-first`; its remote was verified as `f2438d965a7bd86faf2baebd46de69a06ed7d7c2` at the start of this turn. Game source is `a5a538d287b9c29951a83ebede5431db9fce7dc7`. Historical Strategy-branch-only statements below do not describe current adoption: this branch has adopted v2.4.0 and the latest bilingual requirement. Re-query current remote refs and Task Ownership on every resume.

**繁體中文：** Seed 地圖、難度與 New Game+ 已有限定本地驗證；自然十波仍未通過。V1 第五波戰敗；V2 第四波工具中斷；V3、V4 第四波戰敗，V4 有實際第二時代研究。V4 最終快照為戰敗診斷資料，不能當成存活戰役接續。保留低 FPS 時鐘、嚴格 Save/Load 非確定性、建築材質效能 FAIL、自然 Rift Prototype 未重現與 `HARDWARE_TEST_PENDING`。

**English:** Seed maps, difficulty, and New Game+ have scoped local verification; natural ten-wave acceptance has not passed. V1 lost at wave5; V2 had a harness interruption at wave4; V3 and V4 lost at wave4, with actual age2 research in V4. V4's final snapshot is defeated-state diagnostic evidence, not a living campaign continuation. Preserve low-FPS clock issues, strict Save/Load nondeterminism, the building-material performance FAIL, the unreproduced natural Rift Prototype crash, and `HARDWARE_TEST_PENDING`.

**繁體中文：** 下一步為以 V4 原始資料改善 V5 合法玩家策略，再繼續自然十波與 New Game+；不能改 Normal 數值、灌資源、跳波或將受控勝利 Fixture 當自然通關。雙語遷移先處理目前接續摘要及新報告；以下歷史英語／簡體內容尚待逐步補譯，原始數據及結論保留。不得為翻譯重跑無關測試或擅自發布。

**English:** Next, use V4 raw evidence to improve the legal V5 player policy, then continue natural ten-wave and New Game+ acceptance. Do not change Normal statistics, inject resources, skip waves, or count controlled victory fixtures as natural wins. Bilingual migration starts with this current handoff and new reports; historical English/Simplified Chinese content below remains pending incremental translation, with original data and conclusions preserved. Do not rerun unrelated tests for translation or publish without authorization.

---

## 歷史交接封存（待逐步補譯） / Historical handoff archive (translation pending)

# CURRENT AUTHORITATIVE STRATEGY — v2.4.0 GAME FIRST

**ACTIVE STRATEGY:** [docs/STRATEGY-V2.4-GAME-FIRST.md](../STRATEGY-V2.4-GAME-FIRST.md)  
**Strategy publication commit (this independent branch):** `9a806169677ea28c07b80bb317f51f34feae5224`
**Effective:** User approved consolidated v2.4.0 and its developer-decision, tool/Skills and browser-visualization amendments.  
**Branch:** `codex/riftwatch-v240-authoritative-strategy`. This handoff is authoritative **within this branch**; downstream gameplay branches and the progress-feed have not yet been rebased/updated. A receiving Agent must reconcile ownership and explicitly adopt it rather than assume the changes were merged.

On next eligible resume: read the single Strategy file once, deduplicate and prioritize work, surface only material architecture/rules/tool authorization decisions to the user, then continue authorized GAME FIRST slices. **Try a genuinely user-viewable live browser session where supported; otherwise record real Chromium gameplay video plus timestamped game-state updates without blocking development.** Preserve v234 unpublished; v2.4.0 is next public Candidate and still requires explicit launch approval. Preserve old failures and protected git/OmGitHub/Pages boundaries.

---

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

## v2.4 GAME FIRST building-state checkpoint

Branch `codex/riftwatch-v240-game-first` adopts the authoritative `docs/STRATEGY-V2.4-GAME-FIRST.md` from `e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d`. Application source `fe7a54be7f362327da054c468f27366ac6f3fb2d` adds durable construction, damage, critical and ruined building presentations without simulation or balance changes; evidence commit `f4c474e8f26f42739e9f28ec73c23684c29c22d8` is remotely verified.

Focused Node tests pass 3/3. A fresh 28-file exact artifact passed 5/5 real Chromium checks after the real Start flow, followed by an explicitly controlled visual fixture. Screenshot, 3.76-second WebM, timeline and raw browser evidence are in `docs/evidence/v240-building-states/`. This is `AFTER_LOCAL`, not a public Candidate or ten-wave acceptance. Existing clock, strict Save/Load, performance, natural Rift crash and hardware gaps remain open. Next resume must revalidate task ownership and choose another independent GAME FIRST slice; no public v2.4 deployment is authorized.

## v2.4 generated and editable Seed checkpoint

Branch `codex/riftwatch-v240-game-first` preserves application source `5cbd58fbf4048c06ce964c44aa973bff2d5e23e0` and evidence checkpoint `229eb6df99b82740641f85e471563d8dbd98d315`. The menu now prefills a shareable Seed, retains manual edits across four locales, offers an explicit reroll control, and records map-generation version 1 in saves and Bug JSON. Prior version-1 saves without the optional generation field remain compatible.

Focused checks pass 9/9, locales pass 679 keys each, and the exact 28-file artifact passes 8/8 real Chromium checks. Seed `PLAYER-240` produced numeric Seed `3188753779` and world signature `d534c2770fb71870eeda6fce202b579354eccf4f4a470f39534a389261d2c79d` at initial Start, Save/Reload/Continue and a repeated Start. Evidence is in `docs/evidence/v240-seed-setup/`. This validates generated-frontier identity, not strict whole-simulation determinism. Continue with an independent 2.5D civilization/animation slice after ownership revalidation.

## v2.4 civilization visual-family checkpoint

Branch `codex/riftwatch-v240-game-first` preserves application `2a6dc068c3ee3fc59912cd7e76fb095a615e01f0` and evidence `0fb83fb0666b63aa678cc412e4f49c548f55be89`. All sixteen civilizations map to five data-driven non-color architecture/kit families. Focused tests pass 5/5 and the exact 29-file artifact passes 4/4 real Chromium checks across MNG/TEU/SAR/CHN/AZT with distinct frames, unchanged collision values and zero browser errors. Evidence is in `docs/evidence/v240-civ-visuals/`. This is a representative visual pipeline, not complete unique art for every civilization. Continue with direction-aware representative animation or landmark material expansion after ownership revalidation.


## v2.4 direction-aware animation checkpoint

Branch `codex/riftwatch-v240-game-first` preserves application `8e8fd67712431cf46cbcd2bae3f7285d33384e1a` and evidence `7b32f49cc469c0e830a140c519734f6144fb0411`. The procedural renderer now tracks eight movement/attack facings and visible walk, attack, hit and death-fall states without changing unit radii, pathfinding, damage, cadence or balance. Focused regressions pass 18/18; the exact 29-file artifact passes 5/5 real Chromium checks with all eight directions, representative militia/archer/cavalry attacks, three distinct non-reviving death frames and zero browser errors. Evidence is in `docs/evidence/v240-directional-animation/`. This is `AFTER_LOCAL`, not an authored atlas, natural ten-wave acceptance or public deployment. Next resume should revalidate ownership and continue an independent authored-frame/atlas descriptor, landmark-material, or Seed-driven terrain slice. Existing clock, strict Save/Load, performance, natural Rift crash and hardware gaps remain open.

## v2.4 Sprite Atlas recovery checkpoint

The prior environment lost its unpushed objects after application source `18d9947a14ab5aa4eaf6a023545df29bee4a7bcf` was safely pushed. A new worktree recovered from that remote commit, rebuilt the confirmed scale correction as `39767c4b58a37353b4f51bea13bd451a614fb2fc`, and verified it through an exact 31-file artifact: focused Node 20/20 and real Chromium 6/6 PASS with eight directions, five states, Canvas fallback and zero browser/request errors. Evidence is in `docs/evidence/v240-sprite-atlas/`. Original local-only SHA values are historical and must not be claimed remote.

`USER-APPROVED OVERRIDE` 2026-10-27 revokes the 10%/3% and all other percentage stop thresholds. Percentage is informational only; `QUOTA_PERCENT_UNKNOWN` never blocks work. Stop only on an actual platform refusal, context/execution exhaustion, environment/tool/auth failure, permission or ownership conflict. Continue with archer/cavalry atlas only after this recovery evidence and Progress Feed are remotely saved.

## v2.4 archer and cavalry atlas checkpoint

Application `b9a3d527787cd2384902f259dcec9bc695aa2d42` and evidence `833ec9517f603000355d9ed1cbbf0c17fa876a94` add independent longbow/quiver archer and horse/rider/lance light-cavalry atlases. Focused tests pass 15/15 and the exact 33-file artifact passes 7/7 real Chromium checks with eight directions per unit, live three-unit combat, hit/death states, Canvas fallback and zero errors. Evidence: `docs/evidence/v240-archer-cavalry-atlases/`. This is AFTER_LOCAL. Continue with representative civilization buildings or Seed-driven terrain after ownership revalidation; existing simulation, Save/Load, performance, Rift, ten-wave and hardware gaps remain.

## V240-LANDMARK-MATERIALS in-progress checkpoint

Source commit 61755f0 adds renderer-only five-family structural material layers: canvas ribs, masonry, arches, timber pillars/eaves, and stepped stone. Focused visual regression 6/6 PASS; Chromium screenshots/video, building-state overlay inspection and mixed-scene performance are NOT_TESTED. Status IMPLEMENTED / QA_PENDING, not LOCAL_VERIFIED. Resume with an exact artifact gallery containing house and barracks for MNG/TEU/SAR/CHN/AZT, inspect foundation/scaffold/damage/critical/ruin, and compare before/after rendering on the same mixed scene. Do not promote until those gates pass. After this slice prioritize terrain, rules/settings, difficulty, natural ten-wave campaign and New Game+ over further art expansion.


## V240-LANDMARK-MATERIALS QA checkpoint

Original artifact ffc201e visually failed because materials floated on roofs. Repair d07e4f1634d730a163f607800d1ed9a305ebedef projects them onto both wall planes. Final application 9fc6db69227432b162651017819e23cbd4b9153f is payload-identical after a rejected cache experiment. Evidence d9aaab69293590007c60d7db69ebb9f4a24ecd6d: 7/7 Node, 10/10 Chromium state checks, direct five-family visual review, footage, three before/after raw performance repeats. Visual/state LOCAL_VERIFIED; absolute cloud frame gates FAIL and renderer JS median increases21.4%, so full QA is NOT_ACCEPTED. See docs/evidence/v240-landmarks/REPORT.md. All failed samples and rejected optimization retained. No further pure-art expansion: next read-only pre-game rules summary, then Seed/terrain accessibility and natural campaign/difficulty/New Game+. Existing clock, deterministic Save/Load, Rift, hardware and ten-wave gaps persist.


## V240-SETUP-RULES verified checkpoint

Source 5ded54f43212116bdf966b537796849325c295bf, evidence 30c7fc4bc9356f7c1eb12f0dde1d459760b0a7a0: real pre-game rules dialog, 46/46 affected tests, four locales692 keys each, 17/17 real Chromium natural-UI checks at1280x720/130percent text. Queried selected FRK/TEU limits, correct Seed/terrain/ten-wave/Boss5+10/settings; Escape and Enter isolation; actual Start/selection/right-click movement/SaveReloadContinue/BugJSON. No state fixtures. See docs/evidence/v240-setup-rules/REPORT.md and video. LOCAL_VERIFIED only. Next is Seed/terrain route accessibility and natural campaigns; not more art. Landmark visual repair passes but performance QA remains FAIL, and all historical simulation/SaveLoad/Rift/hardware gaps remain.


## Continuous Gameplay Milestone checkpoint

ACTIVE STRATEGY: `docs/STRATEGY-V2.4-GAME-FIRST.md`. Latest saved evidence c40e42f57bc1c23258cba59c8f463530b44dfd74; application `5f63a939f64f3d3d40c66abfd4af655732dae7b0`. Map generator2 and native river crossing pass, historical v1 maps preserved. Approved difficulty and optional three-card NG+ implemented;95 affected tests pass. NG+ browser proof uses a clearly labelled controlled completed-victory fixture, not a natural win. Natural policyV1 lost wave5; policyV2 is actively running with native army Attack-Move/Rally. Do not launch a duplicate campaign while it runs. Source/recordings in `docs/evidence/v240-map-generation`, `v240-difficulty`, `v240-new-game-plus`, `v240-campaign-natural`. Standard-opening material risk sample did not reproduce blocking overhead but original mixed-scene performance FAIL remains. Whole milestone incomplete; keep continuous work, save at boundaries, no public deploy, no arbitrary quota percentage stop. Cross-thread delivery unavailable.


## Final continuous-milestone recovery point

Application a5a538d287b9c29951a83ebede5431db9fce7dc7; newer source-pinned evidence through 3b6a5b87fdaf2fe6468003e73dfeb32b6c4e9d8a plus this final snapshot. All natural processes have stopped: V1 defeat5; V2 harness timeout4; V3 defeat4; V4 age2 then defeat4. No natural ten-wave or NG+ PASS. V4 final save is a DEFEATED snapshot for diagnosis, not an alive continuation. STOP_REQUESTED arrived after defeat. Read docs/evidence/v240-campaign-natural/REPORT.md before choosing a new bounded real strategy. Do not repeat unrelated history or falsely infer Normal impossible from these policies. Latest UI/Save features have scoped native evidence; victory recovery uses a controlled fixture. Execution-window stop, not a weekly percentage threshold or claimed quota refusal. Cross-thread send interface unavailable; structured handoff persists in Git. Branch owner is released after final push; next agent must query the dedicated ownership ref (snapshot ownership observation precedes release). All known clock/SaveLoad/performance/Rift/hardware gaps preserved. Continue actual gameplay milestone, no publication.
