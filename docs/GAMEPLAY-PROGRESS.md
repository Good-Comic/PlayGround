# 最新 D6 Pages 線上驗收（2026-10-26 Asia/Taipei）

AFTER_DEPLOY_LIVE_VERIFIED **僅限已記錄場景**，維持PLAYTEST-EXPERIMENTAL。公開站點Build `d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c`，Pages發布Commit `6c98a8e6b7f7759ca57a9c9f94f675e2b6070381`。這是GitHub Pages，非OmGitHub新版Preview。

本輪實際線上驗收：28payload雜湊、583/583HAR/Git資源、原生Start/選取/移動/建築/訓練/SaveLoad/四語/匯出；300.9秒正常場景8次重新索敵、木85/金73/食51/石32次卸貨、無≥20模擬秒零載貨採集停滯；受控線上Rally/FIFO/諸葛弩/Boss4→8→12/Pause/戰鬥→選卡→第二波倒數均通過。614次請求、Console/Page/request/HTTP400+皆0。全部使用實際公開瀏覽器；沒有本地遊戲替代。

界限：Boss時計／建築／兩敵戰鬥採顯式fixture，不是自然十波。五分鐘自然場景仍第一波有活攻城槌，根因未確認；非英文Start Game保留英文。歷史效能FAIL、低FPS模擬時間問題、HARDWARE_TEST_PENDING、完整十波/全文明/高負載/任意舊存檔待驗均保留。B1/B2不因此自動正式整合。

詳見 [線上驗收報告](evidence/live-d6/REPORT.md)、[範圍與版本](evidence/live-d6/manifest.json)、[網路統計](evidence/live-d6/network-summary.json)。本分支是驗收工具／證據，非遊戲候選來源；實際遊戲Source仍D6、Candidate3779c5。以下是歷史紀錄，當時的Pages403/白名單阻塞已由本次實際built/HTTP200/瀏覽器驗證解除；原始失敗紀錄不刪除。

---

# Current v2.2.6 delivery status (2026-10-26 Asia/Taipei)

This branch contains delivery/monitoring tools and historical Integration game source, NOT the new playable Candidate. Gameplay authority: Candidate3779c5d50876cb2e28590b9d250fb355fc0f8e38, approved Buildd6ee34a5c5d3f2082ee635adb27d6405a41e5f3c. Experimental Boss/Population/Target/Civ/B1/B2 local evidence is on that Candidate; no formal Integration promotion. No existing gameplay modified here.

Exact approved Pages package pushed to codex/riftwatch-playtest-site6c98a8e6b7f7759ca57a9c9f94f675e2b6070381; Pages POST403integration permission and host CONNECTEnvoy403 leave AFTER_DEPLOY_LIVE BLOCKED/NOT_TESTED. Current user authorization permits this exact site but cannot replace missing platform permission. No additional publication approval needed for D6; required UI operations in docs/evidence/v226-deployment/STATUS.md.

Monitor30tests PASS, rawHTTP4/API4 real pinned reads; old503 and historical game/performance FAIL preserved. REVIEW_PENDING / DISPATCH_NOT_CONNECTED / HARDWARE_TEST_PENDING. Independent game work remains allowed;500/1000 not a blanket gate. The historical sections below retain original dated results and are not current development embargoes. New authoritative instruction: docs/handoff/STRATEGY-V2.2.6.md; continuity restrictions: docs/omgithub/CONTINUITY-V226.md.

---

## Strategy v2.2.2 recovery status — current override

Recovery/handoff framework implemented and normally pushed; actual source/test/evidence state is in [STRATEGY-V2.2-EXECUTION.md](STRATEGY-V2.2-EXECUTION.md), [Recovery Manifest](recovery/WORKTREE-RECOVERY.md) and handoff/ACTIVE-TASK.json. Historical records below remain unchanged. Recovered12/12 corrected-window baseline cases (source11f8a6a),9PASS/3FAIL; no missing sample rerun. Target/Population/Civ bounded local acceptance does not equal integration.500/1000 FAIL remains research, not a project-wide lock. Simulation integrity, physical hardware and online deployment remain independent blocked/pending gates.

# Current progress — strategy v2

**Independent development enabled. No1000-unit blanket embargo.** Tooling/strategy only is now INTEGRATED_VERIFIED; production game bytes remain the7faa21a baseline. B1/B2 gameplay is explicitly unmerged; see INTEGRATION-STATUS.json. Original branch remains7faa21a274847ca649a7a96b88700d4cdda5fe2e. New QA/budget/clock/candidate work and independent B1/B2 feature branches are preserved. Details: [STRATEGY-V2-EXECUTION.md](STRATEGY-V2-EXECUTION.md), [roadmap](GAMEPLAY-ROADMAP.md), [acceptance](GAMEPLAY-ACCEPTANCE.md).

B1 Rally/flags/resource work/save/clear and B2 scoped Chinese training/16-civ entries have actual local browser and original P0 PASS evidence. Both are BLOCKED for integration by current-scale clock/stuck/final-source/full-GDD gates, not by500/1000. Features are not merged or deployed. Fixed-step prototype4 tests expose the runtime slowdown and strict Save/Load determinism failure; runtime unchanged. Local exact-SHA Candidate/rollback/resources25/25 verified; AFTER_DEPLOY_LIVE remains DEPLOYMENT_BLOCKED. Full natural-ten-wave peaks x3 remain NOT_TESTED, product250 is still a provisional stress target, no hard cap or Boss deletion.

Current43-test QA log and feature-specific47+focused7 /46 test logs,4 language checks, raw3x100/200/250 combat+250mixed, before/after and DOM latency, reviews and failures are retained under evidence/strategy-v2. Precise source/status/next steps are in acceptance.json. Remaining B3/D/C/E design matrix is established, implementation not falsely claimed.

## Historical v1 record — superseded gate; all failures retained

> Strategy v2 supersedes the historical blanket Phase B block below.500/1000 FAILs remain unchanged; they are extension goals, not current development blockers. Current gate and statuses: GAMEPLAY-ROADMAP.md and GAMEPLAY-ACCEPTANCE.md.250 is a provisional stress target, not a supported-scale claim.

# Phase A preservation and current acceptance

**PERF_IN_PROGRESS — Phase A not released; Phase B NOT_STARTED.** All final browser/performance runs used clean commit `8549065da8b727737f14a596fc104658d408ffd3`, gameplay source `59c852911bef17ce1376efa4970937bb8da96308`, Build ID `riftwatch-gameplay-p0.4`. Subsequent evidence commits do not change served game resources.

Recovered workspace and normal feature-branch checkpoint push completed; remote checkpoint8549065 verified. Three independent repeats at all five scales and1000 actual combat complete. Original gates unchanged:25/100/250 PASS3/3;500 FAIL2/3;1000 move FAIL1/3;1000 combat FAIL0/3. Every final1000 case starts100% by15s. Negative-delta smoke-loop bug fixed and tested. All39 existing/new unit tests, three statistics tests and four locales pass; completed checks were reused when source was identical.

AFTER_LOCAL P0 regression PASS:12 real death→living target transitions, four-resource unload counts24/33/18/8, no20s zero-cargo stall, cavalry move completes. Real input stance/Save/Reload/Continue/crowd24/narrow8 PASS; no console/page/resource failures, HAR bytes match actual commit. BEFORE_LIVE historical evidence retained; AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED. No issue, workflow, Preview, main or checkpoints changed.

Full per-run results, profiling root causes/remaining limits, hardware, negative-delta failure, long-pause failure, vector-cache ablation failure, and deployment investigation: [PERFORMANCE-RECOVERY.md](PERFORMANCE-RECOVERY.md). Machine-readable acceptance and raw compressed evidence: [evidence/performance-recovery/acceptance.json](evidence/performance-recovery/acceptance.json). Remaining work: reliable500/1000 frame gates and1000 combat cost, then authorized live deployment acceptance. No candidate deployment launch or Phase B work.

## Retained checkpoint and p0.3 historical record


## Performance recovery checkpoint — PERF_IN_PROGRESS

Workspace recovered intact on the same feature branch. Current gameplay source: `59c852911bef17ce1376efa4970937bb8da96308` (p0.4); six new commits preserve the profiler, direct-route/crowd/render caches and negative-delta fix. Working tree was clean at resume; prior test/profile processes finished, local server remains running. No untracked source was found. Raw baseline failures and candidate diagnostics are preserved in `docs/evidence/performance-recovery/` archives with hashes.

39 Node tests and four locales (653 keys each) passed. The attempted unittest discovery selected zero tests and is not counted; the statistics suite must be invoked directly. Final three-repeat perf and browser P0 regression remain pending. Single candidate1952997 run: move1000 mean32.10/P9550.00ms, movement100%; combat1000 mean41.07/P9566.60ms FAIL. The later lighting/shadow source has pixel-identical terrain tests at DPR1/2 but no final load acceptance yet. **Phase A remains incomplete, Phase B blocked, AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED.** Earlier p0.3 results below are historical and unchanged.


**Gameplay commit: c305aec96afd6c499f5b82046d991c5a0da02a3d · Build ID: riftwatch-gameplay-p0.3.**
Branch: `codex/riftwatch-gameplay-improvement`, repository `Good-Comic/PlayGround`.
Latest evidence: `docs/evidence/phase-a-v3/acceptance.json`. Subsequent evidence/tool/documentation commits do not change the game resources.

**Phase A NOT COMPLETE. Phase B BLOCKED.** Functional scenarios pass their bounded criteria; performance FAILS at100 and1000 units in the latest measured run. Full Guard/Attack-Move semantics, exhaustive maps/legacy saves and complete campaign acceptance are not claimed.

## Preservation and version lineage

Started clean at `b7e968be2eb6e67ff1892d3dcfec10389f3d81f7`, preserving prior fix `6b17befb18b8707dbd2fb2a767cb079c37d807a4` and base `6476a4bc6d18f688b9c44db9a95c45901d76b741`. The feature branch did not exist remotely. Normal explicit-ref push created it and `ls-remote` confirmed the exact initial HEAD. An intermediate push preserved add77ec150693dfcbc5cd39b33d1e6ef7c1fd3cc. The final fast-forward push preserves the correction and latest evidence too; its exact remote HEAD is verified in the task output.

No force push, merge, default-branch/checkpoint rewrite, Git credential change, OmGitHub workspace write or deployment was performed. Main/checkpoint17 remained e35a73329ee7942627496e55b844d02b2501e685 /6476a4bc6d18f688b9c44db9a95c45901d76b741 at the pre-push read. The original checkout remains unchanged.

## Current Phase A results

37 Node unit/integration tests pass; syntax checks pass; four-language validation passes with653 keys per locale. Those checks are corroborated by measurements and real-input browser evidence below, rather than treated as sufficient on their own.

| Requirement | Result | Declared threshold and observed evidence |
|---|---|---|
| Multi-unit congestion | PASS, tested scenario |24/24 reach actual separate formation destinations within70 simulation seconds; collision penetration<=0.025, static clips0. Integration24/24, penetration0. Browser24/24 in8.26 wall seconds. |
| Narrow passage / buildings | PASS, tested scenario |The outer routes are sealed by a full-height water barrier; only a one-tile channel remains. All8 opposing queued militia must be observed inside the channel and arrive within0.15 tiles of their own opposite-side goals. Integration8/8 crossing/arrival <=80s; browser8/8 crossing/arrival in14.40s. Browser max penetration0.01484; static clipped samples0. |
| Unreachable combat target | PASS, integration |Across a full water barrier: abandon failed manual target <=5 simulation seconds, acquire reachable enemy, never cross water. Actual0.05s, explicit `unreachable` reason and replacement target. |
| Death cleanup / continuous combat | PASS |Zero dead references immediately after3 synthetic kill events. Normal browser play records11 death-to-living target transitions and0 stale-dead-target samples. |
| Four stances | PASS, tested contracts |Aggressive/Defensive acquire and retaliate; Hold attacks in range without pursuit; Passive never auto-attacks, including directly controlled hero. Manual order precedence, defensive leash and old-save defaults tested. Actual UI cycle reaches all4 states. Full Guard/Attack-Move remains unfinished. |
| Long economy / competition | PASS, tested scenarios |For each of Food/Wood/Gold/Stone:12 workers compete for2 nodes for300 simulation seconds. Every worker must complete>=3 unload cycles, conservation error<1e-6, penetration<=0.025. Observed minimum23 cycles (Wood24); worst conservation error2.01e-9. |
| Frame time / search load | **FAIL** |See measured table:100 and1000 miss thresholds. Per-update search count stays<=2; fairness regression starts100/100 units within4.8 simulation seconds, but this is not proof of1000-unit latency or frame-time compliance. |
| Save/Load recovery | PASS, tested contracts |Integration restores move, gather/return cargo, valid combat refs and stances: actual move finishes, gold delta57 including later gathering, dead refs0. Real local UI Pause→Save Run→reload→Continue restores same seed/unit count and time within1s. Only a fresh disposable local context is used. |

## Original three LIVE_VERIFIED regressions

Scenario: `riftwatch-p0-v1` / seed3215474622, TEU, steppe, speed1. Real menu selections, Start Game, left-select and right-command; no synthetic map or GM injection in this normal-play run.

AFTER_LOCAL captured145 samples through127.91 simulation seconds during135 wall seconds:

- Cavalry reaches a legal point near the farm command, instead of remaining in move at its edge. The analyzer now requires actual position near the destination, not idle alone.
- No zero-cargo stationary gathering interval over20s. Deposits: Wood34, Gold20, Stone10, Food18. These counts are observations, not balance benchmarks.
-11 confirmed switches from dead to living targets. Example: hero19 switches30→28 at71.58–72.36s; soldiers15/16 switch29→34 at82.58–83.38s.
- Console errors0, Page Errors0, failed requests0.
- All25 captured normal-play resources match the exact game commit. The browser fixture suite matched50 resources; the performance suite matched125.

## Performance: actual latest measurements

Intel Xeon Platinum8573C;5 logical CPUs visible, cgroup quota4 CPU cores,32GiB memory cap; Linux6.18.55; Chromium154.0.8037.57; Playwright1.62.0. Headless Canvas2D,1600×1100; ANGLE reports SwiftShader Vulkan software rendering. No hardware GPU claim.

Production update/draw/UI loop on an explicitly synthetic open field, passive militia with continuous per-unit moves and full-map camera. No other game-browser workload was run during the final benchmark. Each case:3s warmup +12s measurement. Thresholds set before running: mean frame<=33.3ms, P95<=50ms, >=90% start moving >0.15 tiles during the total15s window, <=2 path searches/update. Raw frame/nav distributions, rendering identification and manifests are committed.

| Units | Mean ms | P95 ms | FPS | Started movement | Mean navigation ms/frame | Result |
|---:|---:|---:|---:|---:|---:|---|
|25|17.59|16.80|56.84|100%|0.293|PASS|
|100|35.03|50.00|28.54|100%|1.200|**FAIL**|
|250|18.15|33.30|55.09|100%|0.381|PASS|
|500|25.82|33.40|38.73|100%|0.441|PASS|
|1000|36.29|50.00|27.55|82%|0.292|**FAIL**|

The non-monotonic100-unit failure is retained, not replaced by the older version's passing measurement or rerun until green. Its peak observed search wall time was167.6ms. That alone does not establish the cause of the frame-cadence variation.1000-unit max pending count982, mean update/draw costs2.52/8.93ms. Complete frame cadence includes compositor/scheduling effects; these costs do not explain all delay. No stable supported-unit ceiling or combat-performance certification is claimed from these short cloud runs. Further frame-time and high-count admission-latency work is required before Phase B.

## Audit corrections and retained failures

The old p0.2 narrow PASS in add77ec is **withdrawn**. Its open ends allowed a bypass. See `evidence/phase-a/narrow-audit-correction.json`; original samples and history remain preserved.

The forced-channel pre-fix test then showed0 channel crossings despite8 units becoming idle: half-tile nodes missed the legal channel center, and idle was incorrectly treated as arrival. The new lattice includes the center; unreachable moves retain an explicit failure; acceptance requires real destination proximity and crossing. Convoy priorities are propagated within a same-direction queue to prevent alternating-ID yielding deadlocks.

The first p0.3 browser run arrived8/8 but coarse500ms samples observed7 crossings. It is retained as a FAIL in `failed-coarse-sampling.json`. The final test uses an additional read-only animation-frame crossing observer:8/8 actual crossings, plus destination/collision checks. The crossing observer itself does not write game state. Synthetic fixture setup separately invalidates the renderer terrain cache after replacing tiles, so the supplemental narrow-rendered-game.png shows the actual sealed water barrier. That supplemental real-input run also passes8/8 crossings/actual arrivals; source resources match c305. Its manifest truthfully records QA/docs-only uncommitted files, while normal play, the full browser suite and performance started from clean c305.

Earlier crowd18/24 and stable-iteration starvation failures are retained in the prior evidence directory. No failed run is silently relabelled PASS.

## Evidence preservation and deployment

Committed current evidence under `docs/evidence/phase-a-v3/`: game/crowd/narrow/stance/1000-unit-FAIL screenshots, acceptance and hardware, full compressed normal-state evidence, compressed HAR for all3 suites, raw performance distributions, source Git-blob comparisons and failed-run evidence. Large Playwright traces remain local; `large-artifacts.json` records their exact paths/sizes/SHA-256. They were not pushed to GitHub due to size; compressed HAR/state evidence is preserved remotely. No Release/upload service was used.

- BEFORE_LIVE: **LIVE_VERIFIED**, existing original Preview evidence, source914016dae8a7eb131b7e06c49a36c6a3276247d0.
- AFTER_LOCAL: bounded functional scenarios **PASS**, performance **FAIL**; exact game commitc305aec96afd6c499f5b82046d991c5a0da02a3d.
- AFTER_DEPLOY_LIVE: **DEPLOYMENT_BLOCKED / NOT_TESTED**. Final read-only issue17 metadata still points to914016d. No deployment action was taken.

See OMGITHUB-DEPLOYMENT.md. A documented Issue `branch:` directive can select a starting branch for a new OpenCode workflow, not prove direct mirroring into issue17's existing Preview. Starting that run or using Continue/Publish requires separate user authorization and can create/change a commit. No deploy-only direct update mechanism was verified. Phase B remains BLOCKED.
