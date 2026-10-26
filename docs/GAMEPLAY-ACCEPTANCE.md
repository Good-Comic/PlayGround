## v228 published — scoped HTTPS acceptance

Public [v228](https://good-comic.github.io/PlayGround/builds/ab56a5b824fabc5e123cf33e912d11bd3c625911/) is PLAYTEST-EXPERIMENTAL. Initialdeploy92e426327cfcfa6e27b2d400880681edd5256688;finalsite5b30bda085197cfa820a594224e2f6df929bf60d.59actualpublicbrowserassertionsPASS,31hostingfilesmatch,1007Gitresourcecomparisons; [report](evidence/live-v228/REPORT.md). D6treeunchanged,Pagesconfigunchanged,main/Integration/#17/Checkpointsuntouched. This is AFTER_DEPLOY_LIVE_SCOPED_PASS, not fullQA/hardware/performance/GameplayIntegration. ProductionlowFPS/strictSaveLoadFAIL andhistoricalFAIL remain. Independentresearch03e3a8423e4956be7face8009d7bfff48aa6a11e isolates sharedvisualRNG throttle andprojectileloss; localgroupclear80bec7a68cb0f822b3071642dc02bd9ff3964750 isNOTpublished.

## Strategy v2.2.8 — current scoped checkpoint

Candidate `codex/riftwatch-playtest-v228`, game Build `ab56a5b824fabc5e123cf33e912d11bd3c625911`. [Report](evidence/v228-candidate/REPORT.md), [exact release proposal](playtest/v228/APPROVAL-PLAN.json). NAV-228-01 LOCAL_VERIFIED: recordednative dt reproduces7/8 exactly; dynamicdetour fix gives8/8native16.73s plusaffectedP0/orders/24crowd. B-GROUP-228-01 LOCAL_VERIFIED: clickablegroups/Settingsvisibility,18targetedNode/19native/fourlocale678keys;100selectedMOVE-only impact3+3PASS, notcombat/hardware. DEV-QUOTA-228-01 local8fixturesPASS; actualQUOTA_PERCENT_UNKNOWN/manualdispatchonly. SIM-228-01 remainsFAIL/BLOCKED:20realvirtualseconds at10Hz→10sim; fixedprototype SaveLoaddeterminismfails, notinstalled. No new publicSHA, GameplayIntegration orD6changes. Fullcampaign/current-scalecombat/hardware/independentSupervisor remainpending; historicalFAIL preserved. Formationeditor/Fog/newRoguelite slices queued.

## Strategy v2.2.7 — current scoped update

Independent candidate `codex/riftwatch-playtest-v227`, game SHA `27b279410db1bb9c14b3c1b921b146059a6c6341`. Wave softlock-risk reproduction/fix, Attack-Move/unit Guard/two-point Patrol/control groups and UI text scale implemented with scoped local evidence. See [v227 report](evidence/v227-candidate/REPORT.md) and [exact new-SHA deployment proposal](playtest/v227/APPROVAL-PLAN.json). OPEN-NAV-NARROW-01 remains FAIL (7/8destination despite8cross); public D6 and Gameplay Integration remain unchanged; no new online QA claim. Historical FAIL, low-FPS clock error and HARDWARE_TEST_PENDING remain. New formation editor, complete campaign and full current-scale combat acceptance pending. Start Game fixed English is GDD BY_DESIGN.

## Strategy v2.2.2 recovery status — current override

Recovery/handoff framework implemented and normally pushed; actual source/test/evidence state is in [STRATEGY-V2.2-EXECUTION.md](STRATEGY-V2.2-EXECUTION.md), [Recovery Manifest](recovery/WORKTREE-RECOVERY.md) and handoff/ACTIVE-TASK.json. Historical records below remain unchanged. Recovered12/12 corrected-window baseline cases (source11f8a6a),9PASS/3FAIL; no missing sample rerun. Target/Population/Civ bounded local acceptance does not equal integration.500/1000 FAIL remains research, not a project-wide lock. Simulation integrity, physical hardware and online deployment remain independent blocked/pending gates.

# Continuous acceptance v2

Statuses: IMPLEMENTED (code), LOCAL_VERIFIED (actual local browser/tests), INTEGRATED_VERIFIED (combined integration build passed), DEPLOYED_VERIFIED (authorized actual online build verified), BLOCKED, NOT_TESTED. Never promote a local result to deployed.

For every feature: unique ID and branch, reviewed diff, actual served commit/hashes, unit/integration result, real pointer/key actions, original three P0 regressions, Save/Load,4 locales, before/after perf delta. Only then merge into Gameplay Integration. Failure quarantines that branch; it does not halt independent designs/features.

Performance:100/200/250 both-team total actual combat,250 mixed (40 villagers+1hero+209 fighters; buildings/resources separate),3 fresh browser processes each, fixed seed/browser/viewport,8s warmup/20s measure. Original gates mean rAF<=33.3ms,P95<=50ms,>=90% moved>.15 by15s. Additional declared checks: actual pointer-command response<=250ms and completion, simulation/wall>=90%, persistent wanting-to-move/no-progress>=8s fraction<=2%; historical orderFailure flags are reported separately (they persist after recovery), actual attacks>=100; mixed>=4 unloads and positive economic credit. Record P50/P99,long-animation-frame durations, >50/>100ms stalls and raw JS spans. Single-pass counts or open-move fixtures cannot certify combat.

Full-ten-wave natural campaign3-run peak/stability is a separate release gate. Synthetic director envelope is CODE_INFERRED only. Product250 remains a stress target until actual repeated combat/mixed and campaign evidence support it.500/1000 historical failures are retained in extension reports and no longer prohibit Phase B–E development.

Three stages: preserve BEFORE_LIVE historical evidence; fresh AFTER_LOCAL per actual source; AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED until explicit supported deployment authorization. Original#17 never modified. Candidate exact SHA must be recorded and served-resource hashes checked; rollback is switching/stopping the isolated candidate, never rewriting Git history. Current OmGitHub workflow starts a modifying OpenCode run, not an exact-commit deploy-only contract. No workflow/issue invocation is authorized here.

## Current actual verdicts

B1 and B2 are IMPLEMENTED/LOCAL_VERIFIED in bounded feature/P0 cases, but **BLOCKED for integration**. Baseline100 rAF3/3 passes but stuck fraction fails2/3;200 quality1/3;250 combat3/3;250 mixed2/3. After B1 tested91569e2 mixed clock89.659% fails; final2f148c3 incremental fixes have focused native checks but full performance NOT_TESTED. B2 dc4698a has first combat stuck3.6% failure. Do not pool/retry away failures. Full natural ten-wave peak x3 remains NOT_TESTED, no final release budget. Full GDD remaining roster/tech and production clock switch remain BLOCKED. See STRATEGY-V2-EXECUTION.md and evidence/strategy-v2/acceptance.json for all actual SHAs and scope.

Input metric caveat: tiered runs record handler-to-movement; separate3x/source DOM-pointer-event-to-movement tests95.9–176.4ms before,51.7–110ms Rally,64.1–125.5ms civ pass250ms in normal-start scenes only, not OS hardware latency or250-unit end-to-end certification. New clock/stuck criteria do not rewrite original rAF/15s gates. Nominal20s capture can be shortened by warmup overrun; raw actual span is retained.
