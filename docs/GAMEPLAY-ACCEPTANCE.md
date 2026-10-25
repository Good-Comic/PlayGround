# Continuous acceptance v2

Statuses: IMPLEMENTED (code), LOCAL_VERIFIED (actual local browser/tests), INTEGRATED_VERIFIED (combined integration build passed), DEPLOYED_VERIFIED (authorized actual online build verified), BLOCKED, NOT_TESTED. Never promote a local result to deployed.

For every feature: unique ID and branch, reviewed diff, actual served commit/hashes, unit/integration result, real pointer/key actions, original three P0 regressions, Save/Load,4 locales, before/after perf delta. Only then merge into Gameplay Integration. Failure quarantines that branch; it does not halt independent designs/features.

Performance:100/200/250 both-team total actual combat,250 mixed (40 villagers+1hero+209 fighters; buildings/resources separate),3 fresh browser processes each, fixed seed/browser/viewport,8s warmup/20s measure. Original gates mean rAF<=33.3ms,P95<=50ms,>=90% moved>.15 by15s. Additional declared checks: actual pointer-command response<=250ms and completion, simulation/wall>=90%, persistent wanting-to-move/no-progress>=8s fraction<=2%; historical orderFailure flags are reported separately (they persist after recovery), actual attacks>=100; mixed>=4 unloads and positive economic credit. Record P50/P99,long-animation-frame durations, >50/>100ms stalls and raw JS spans. Single-pass counts or open-move fixtures cannot certify combat.

Full-ten-wave natural campaign3-run peak/stability is a separate release gate. Synthetic director envelope is CODE_INFERRED only. Product250 remains a stress target until actual repeated combat/mixed and campaign evidence support it.500/1000 historical failures are retained in extension reports and no longer prohibit Phase B–E development.

Three stages: preserve BEFORE_LIVE historical evidence; fresh AFTER_LOCAL per actual source; AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED until explicit supported deployment authorization. Original#17 never modified. Candidate exact SHA must be recorded and served-resource hashes checked; rollback is switching/stopping the isolated candidate, never rewriting Git history. Current OmGitHub workflow starts a modifying OpenCode run, not an exact-commit deploy-only contract. No workflow/issue invocation is authorized here.

## Current actual verdicts

B1 and B2 are IMPLEMENTED/LOCAL_VERIFIED in bounded feature/P0 cases, but **BLOCKED for integration**. Baseline100 rAF3/3 passes but stuck fraction fails2/3;200 quality1/3;250 combat3/3;250 mixed2/3. After B1 tested91569e2 mixed clock89.659% fails; final2f148c3 incremental fixes have focused native checks but full performance NOT_TESTED. B2 dc4698a has first combat stuck3.6% failure. Do not pool/retry away failures. Full natural ten-wave peak x3 remains NOT_TESTED, no final release budget. Full GDD remaining roster/tech and production clock switch remain BLOCKED. See STRATEGY-V2-EXECUTION.md and evidence/strategy-v2/acceptance.json for all actual SHAs and scope.

Input metric caveat: tiered runs record handler-to-movement; separate3x/source DOM-pointer-event-to-movement tests95.9–176.4ms before,51.7–110ms Rally,64.1–125.5ms civ pass250ms in normal-start scenes only, not OS hardware latency or250-unit end-to-end certification. New clock/stuck criteria do not rewrite original rAF/15s gates. Nominal20s capture can be shortened by warmup overrun; raw actual span is retained.
