# Phase A preservation and current acceptance

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
