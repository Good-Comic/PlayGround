> **Audit correction:** the p0.2 narrow-corridor PASS below is withdrawn: units could bypass the outer ends. See evidence/phase-a/narrow-audit-correction.json. Build p0.3 fixes lattice alignment and convoy yielding, with forced-channel/actual-destination checks. Fresh browser/performance acceptance is pending for that new build.

# Phase A completion attempt and GitHub preservation

Current gameplay implementation: **8ba384889d3eb3d782ce9a5eb98f569afbd14d6d**, Build ID **riftwatch-gameplay-p0.2**.
Branch: `codex/riftwatch-gameplay-improvement` at `Good-Comic/PlayGround`.
The following acceptance/documentation commit changes only tests, QA tools and evidence; all served game resources remain identical to the implementation commit.

## Preservation

Initial worktree was clean at `b7e968be2eb6e67ff1892d3dcfec10389f3d81f7`, with the prior fix `6b17befb18b8707dbd2fb2a767cb079c37d807a4` and base `6476a4bc6d18f688b9c44db9a95c45901d76b741`. The remote feature branch did not yet exist. A normal, explicitly scoped push created it; `ls-remote` confirmed the exact initial HEAD. No force push, merge, default-branch edit, checkpoint edit, Git credential change, OmGitHub workspace write or deployment was performed. The final push/remote verification is recorded in the task output; no self-referential commit hash is fabricated in this file.

Remote main and checkpoint #17 were still `e35a73329ee7942627496e55b844d02b2501e685` and `6476a4bc6d18f688b9c44db9a95c45901d76b741` respectively at the pre-final-push read.

## Phase A gate: NOT COMPLETE; Phase B BLOCKED

Functional scenarios below pass their declared, bounded acceptance criteria. The **1000-unit performance/progress test FAILS**. This is not a full Phase A sign-off, an all-map guarantee, a complete Guard/Attack-Move system, full campaign verification, or deployed acceptance. Do not start large Phase B–E work.

| Requirement in this round | Status | Threshold and actual observation |
|---|---|---|
| Multi-unit congestion / blocking | PASS, bounded scenarios | 24/24 reach formation within 70 simulation seconds; no static clips; max overlap tolerance <=0.025. Integration result: 24/24, penetration 0. Browser real drag/right-click: 24/24 in 9.10 wall seconds. |
| Narrow passage between buildings | PASS, bounded scenarios | One-tile corridor, 8 opposing queued units, all arrive <=80 simulation seconds, static clips 0, penetration <=0.025. Integration: 8/8, max0.01333. Browser: 8/8 in14.27s, max0.01441, no clipped samples. |
| Unreachable combat target recovery | PASS, integration | Manual target across a full water barrier abandoned <=5s; reachable replacement acquired; no crossing. Actual0.05s, failure reason `unreachable`, replacement acquired. |
| Death cleanup / continuous retarget | PASS | Zero dangling references immediately after each of3 synthetic kills. Normal browser play records7 death-to-living target transitions and0 stale-dead-target samples. |
| Four stances | PASS, tested contracts | Aggressive/Defensive acquire and retaliate; Hold only fires in range and never pursues; Passive never auto-acquires/retaliates, including directly controlled hero. Explicit movement/attack priority and defensive leash tested. Real UI cycle reaches all4 states, and save migration preserves/defaults stance. Full Guard/Attack-Move remains a distinct unfinished requirement. |
| Long economy / contention | PASS, bounded scenarios | Each resource separately:12 workers,2 contested nodes,300 simulation seconds, every worker>=3 unloads, conservation error<1e-6. Food/Gold/Stone: minimum9 cycles each; Wood: minimum8. Worst error1.33e-9; collision tolerance<=0.025. |
| FPS / frame time / path load | FAIL at1000; PASS at25–500 for this workload | See benchmark below. Admission <=2 searches/update at all scales; fairness fixed, but1000 units miss both frame-time and movement-progress thresholds. |
| Save/Load state recovery | PASS, tested contracts | Integration restores movement, gathering/return cargo, valid combat refs and stances; move finishes, gold delta47 (includes subsequent gathering), dead refs0. Real local UI Pause→Save Run→reload→Continue restores same seed/unit count and time within1s. Uses a fresh disposable browser context only. |

36 Node unit/integration tests pass. Four-language validation passes:653 keys per locale. JS syntax checks pass. These are corroborating checks, not the only evidence.

## Three original LIVE_VERIFIED regressions

Same scenario: seed text `riftwatch-p0-v1` (numeric3215474622), TEU, steppe, speed1. Real Playwright menu selections, Start Game, left-select and right-command; no GM/state injection for this normal run.

AFTER_LOCAL captured144 samples through128.32 simulation seconds during135 wall seconds:

- Cavalry completes the command into the farm footprint by stopping at a legal reachable point.
- No zero-cargo stationary gathering interval exceeding20s.
- Deposits observed: Wood30, Gold12, Stone11, Food20. These counts are observations, not a balance comparison.
- Seven confirmed transitions from a dead target to a living target; e.g. soldiers15/16 switch27→34 at72.53–73.33s, hero19 switches43→33→42→39 later.
- Console errors0; Page Errors0; failed requests0.
- All25 captured game resources match the implementation commit. The browser fixture suite matched50 resources; the five performance cases matched125. No local run is labelled LIVE_VERIFIED.

## Performance — actual cloud measurements

Hardware: Intel Xeon Platinum8573C,5 logical CPUs visible, cgroup quota4 CPU cores,32GiB cgroup memory. Linux6.18.55; Chromium154.0.8037.57; Playwright1.62.0. Headless Canvas2D,1600×1100; ANGLE reports SwiftShader Vulkan software rendering. No hardware GPU claim.

Synthetic open-field fixture using the production game update/draw/UI loop, passive militia, continuous per-unit movement, full-map camera. No concurrent browser workload was started during the final benchmark. Each case:3s warmup +12s measured. Thresholds: mean frame<=33.3ms, P95<=50ms, >=90% of units move>0.15 tiles during the total15s window, <=2 searches/update. These thresholds and measurements do not certify equivalent combat performance. Timing breakdown in raw data includes warmup; frame/nav distributions exclude warmup.

| Units | Mean frame ms | P95 ms | FPS | Units starting movement | Mean navigation ms/frame | Result |
|---:|---:|---:|---:|---:|---:|---|
|25|19.01|33.40|52.60|100%|0.467|PASS|
|100|17.96|16.80|55.68|100%|0.420|PASS|
|250|22.01|33.40|45.42|100%|0.507|PASS|
|500|22.71|33.40|44.02|100%|0.418|PASS|
|1000|40.60|66.70|24.63|74%|0.353|**FAIL**|

1000-unit mean update/draw costs were2.93/9.34ms, but complete frame cadence is40.60ms; those costs alone do not explain all compositor/scheduling delay. Max queued/pending count984. Do not reinterpret a two-search budget or a passing process exit as gameplay scalability success. Next work must profile both software-rendered frame cadence and high-count path admission latency. No claim of1000-unit pass is made.

## Failures retained and corrected

- First crowd candidate:18/24 arrived; retained as `failed-crowd-first.json`. Compact groups now preserve relative formation, and stalled units can replan around parked neighbours.
- First performance candidate:100-unit movement fraction42% despite~60FPS. Stable unit iteration starved high IDs. FIFO admission fixed it; a continuous-demand regression now starts100/100 within4.8 simulation seconds with<=2 searches/update. Initial performance results are retained.
- First synthetic browser drag selected23/24 because the test rectangle omitted the top unit's20px selection anchor. The test rectangle was corrected; production selection logic was not changed. Failed screenshot/log remain locally under `browser-failed-drag`.

## Evidence and reproducibility

Committed under `docs/evidence/phase-a/`: normal game, crowd/narrow/stance and1000-unit FAIL screenshots; acceptance/hardware/threshold records; full compressed normal-state evidence; compressed HAR for normal play, browser fixtures and performance; raw performance frame distributions; served-resource Git blob comparisons; retained failed candidate summaries. This preserves reviewable evidence in GitHub, not just ephemeral paths.

Full Playwright traces are354MiB and87MiB, so they are **not committed**. Their local paths, sizes and SHA-256 hashes are in `large-artifacts.json`. Full traces remain under `/workspace/diagnostics/riftwatch/phase-a/`; they must be exported separately if needed after this environment is discarded. No GitHub Release or other upload was created.

Reproduce with tools/qa/serve.py, gameplay.py, phase-a-browser.py, performance.py and analyze.py as documented in GAMEPLAY-QA.md. Browser map fixtures are explicitly synthetic; normal seeded play is separate. All are AFTER_LOCAL.

## Three-stage status and deployment

- BEFORE_LIVE: **LIVE_VERIFIED**, already captured against original source914016d; retained screenshot and previous evidence remain valid for this fix lineage.
- AFTER_LOCAL: **functional scenario PASS**, performance **FAIL at1000**. Tested game commit8ba384889d3eb3d782ce9a5eb98f569afbd14d6d.
- AFTER_DEPLOY_LIVE: **DEPLOYMENT_BLOCKED / NOT_TESTED**. Original issue17 still references914016d; no Preview update performed.

See OMGITHUB-DEPLOYMENT.md for supported branch-selection findings and what remains unconfirmed. Phase B remains blocked by the failed1000-unit gate and the outstanding full-contract requirements in GAMEPLAY-REQUIREMENTS.md.
