# Continuous acceptance v2

Statuses: IMPLEMENTED (code), LOCAL_VERIFIED (actual local browser/tests), INTEGRATED_VERIFIED (combined integration build passed), DEPLOYED_VERIFIED (authorized actual online build verified), BLOCKED, NOT_TESTED. Never promote a local result to deployed.

For every feature: unique ID and branch, reviewed diff, actual served commit/hashes, unit/integration result, real pointer/key actions, original three P0 regressions, Save/Load,4 locales, before/after perf delta. Only then merge into Gameplay Integration. Failure quarantines that branch; it does not halt independent designs/features.

Performance:100/200/250 both-team total actual combat,250 mixed (40 villagers+1hero+209 fighters; buildings/resources separate),3 fresh browser processes each, fixed seed/browser/viewport,8s warmup/20s measure. Original gates mean rAF<=33.3ms,P95<=50ms,>=90% moved>.15 by15s. Additional declared checks: actual pointer-command response<=250ms and completion, simulation/wall>=90%, no order failures, actual attacks>=100; mixed>=4 unloads and positive economic credit. Record P50/P99,long-animation-frame durations, >50/>100ms stalls and raw JS spans. Single-pass counts or open-move fixtures cannot certify combat.

Full-ten-wave natural campaign3-run peak/stability is a separate release gate. Synthetic director envelope is CODE_INFERRED only. Product250 remains a stress target until actual repeated combat/mixed and campaign evidence support it.500/1000 historical failures are retained in extension reports and no longer prohibit Phase B–E development.

Three stages: preserve BEFORE_LIVE historical evidence; fresh AFTER_LOCAL per actual source; AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED until explicit supported deployment authorization. Original#17 never modified. Candidate exact SHA must be recorded and served-resource hashes checked; rollback is switching/stopping the isolated candidate, never rewriting Git history. Current OmGitHub workflow starts a modifying OpenCode run, not an exact-commit deploy-only contract. No workflow/issue invocation is authorized here.
