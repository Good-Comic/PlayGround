# Worktree Recovery Manifest

Snapshot ID: ec12c1dcf956d5a3aca3f329fbb9781dc04e2d14a5f564680a985d12f1ca8f1b
Captured UTC: 2026-10-28T01:14:04.765423+00:00 · Trigger: FINAL_CHECKPOINT
Collector source: `3b6a5b87fdaf2fe6468003e73dfeb32b6c4e9d8a` · LOCAL_INVENTORIED_NOT_A_PUSH

Point-in-time observation before writing output; snapshot publication commit is necessarily later. No recursive commit loop; pending dirty files remain explicitly unsaved.

| Worktree | Branch | HEAD | Remote HEAD | Status | Dirty |
|---|---|---|---|---|---|
| /workspace/PlayGround | work | e35a73329ee7942627496e55b844d02b2501e685 | None | REMOTE_BRANCH_ABSENT | False |
| /workspace/riftwatch | codex/riftwatch-v222-recovery | 317ef162b4f4b69c43644cb0e7c031387dc898c1 | 317ef162b4f4b69c43644cb0e7c031387dc898c1 | REMOTE_SAVED | False |
| /workspace/riftwatch-civ | codex/riftwatch-v22-civ-alignment | c456cae581b3ec85a7dd222d017453d2e589e095 | c456cae581b3ec85a7dd222d017453d2e589e095 | REMOTE_SAVED | False |
| /workspace/riftwatch-integration | codex/riftwatch-gameplay-integration | 2cd6f099d72a980bfa24dd7ae0f79676918884e8 | 2cd6f099d72a980bfa24dd7ae0f79676918884e8 | REMOTE_SAVED | False |
| /workspace/riftwatch-monitor | codex/riftwatch-v224-monitor | fa520ae3006329bd2b1c54ac90938519465bf320 | fa520ae3006329bd2b1c54ac90938519465bf320 | REMOTE_SAVED | False |
| /workspace/riftwatch-playtest | codex/riftwatch-playtest-candidate | 3779c5d50876cb2e28590b9d250fb355fc0f8e38 | 3779c5d50876cb2e28590b9d250fb355fc0f8e38 | REMOTE_SAVED | False |
| /workspace/riftwatch-pop | codex/riftwatch-v22-population | 0094fabc6507b41253b8869e2dacf8b0e56e3263 | 0094fabc6507b41253b8869e2dacf8b0e56e3263 | REMOTE_SAVED | False |
| /workspace/riftwatch-prediction | codex/riftwatch-v222-prediction | b72f9603bf2d8fd865da5cf9dccc32be1dd90830 | b72f9603bf2d8fd865da5cf9dccc32be1dd90830 | REMOTE_SAVED | False |
| /workspace/riftwatch-rally | codex/riftwatch-b1-rally | 2a0da8a7320336ac342c1af0953a424d08ef1515 | 2a0da8a7320336ac342c1af0953a424d08ef1515 | REMOTE_SAVED | False |
| /workspace/riftwatch-v22 | codex/riftwatch-v22-target-state | 2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec | 2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec | REMOTE_SAVED | False |
| /workspace/riftwatch-v226 | codex/riftwatch-v226-delivery | ee0d219a916d8388fab5d66ff86e3bd650aa66af | ee0d219a916d8388fab5d66ff86e3bd650aa66af | REMOTE_SAVED | False |
| /workspace/riftwatch-v240 | codex/riftwatch-v240-game-first | 3b6a5b87fdaf2fe6468003e73dfeb32b6c4e9d8a | 3b6a5b87fdaf2fe6468003e73dfeb32b6c4e9d8a | REMOTE_SAVED | True |

## work

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v222-recovery

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "/workspace/diagnostics/riftwatch/v22-quality-baseline/results.json", "source_commit": "11f8a6a29c481da0613d2765bb06739e5ce6a8b8", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "b3bf19051816248b1dccd9bbd38e7bfe2221c6eb1f8e70d4092c4f816974d41d", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Publish framework; preserve other worktrees; do not rerun valid12 baseline cases

## codex/riftwatch-v22-civ-alignment

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/civ-results.json", "source_commit": "da0823c6341b1ee85e32d1b6c0f776ef3008255c", "result": "PASS8 browser,47 full Node,4locales; prior description FAIL fixed", "exists": true, "storage": "REMOTE_SAVED", "sha256": "ed43181fc96ec3f6463dfff37203727a307e9c5eba443a51dd92e361e99f3908", "resource_freshness": "MATCHES_WORKING_RESOURCES"}, {"path": "docs/evidence/strategy-v222/civ-p0-summary.json", "source_commit": "2ad2fe4a6466c6c38a033d1194f004924dbfda37", "result": "PASS normal P0; performance/combined B1/B2 still pending", "exists": true, "storage": "REMOTE_SAVED", "sha256": "d5d392bea72713c02c184baca4f00558da547abe0ed016e6b74caa9c50a0f5e2", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Persist normal P0 evidence; performance/combined B1/B2 gates pending

## codex/riftwatch-gameplay-integration

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "/workspace/diagnostics/riftwatch/v222-tooling-smoke/result.json", "source_commit": "72e978417afd3c95f897cc7cb35395f00008c313", "result": "INTEGRATED_VERIFIED tooling only;44Node+8dev+4locales and actual Start/Save/Continue pass; no game resource changes", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "62f412196a38f35f655c092d31e06ef6cb9dee08d2613ff03a5d37f182848fb4", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Gameplay feature gates not yet complete
Next: Keep Boss/Population/Target/Civ/Rally game changes isolated until gates

## codex/riftwatch-v224-monitor

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-playtest-candidate

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/playtest-candidate/acceptance.json", "source_commit": "d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c", "result": "LOCAL_VERIFIED bounded experimental candidate; Pages approval pending", "exists": true, "storage": "REMOTE_SAVED", "sha256": "f7aa32e6797823b1d48a98ed1ef8803526435c67261a360c04284351c6e9dd67", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: DEPLOYMENT_BLOCKED_AWAITING_USER_APPROVAL; HARDWARE_TEST_PENDING; SIMULATION_INTEGRITY_BLOCKED
Next: Obtain user approval for APPROVAL-PLAN.json; If approved recheck no existing Pages,deploy only approved artifact toisolated site branch,enablePages then actual remote acceptance; Keep full formal feature gates unchanged; independent performance and B–E work can continue

## codex/riftwatch-v22-population

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/pop-results.json", "source_commit": "86d7e81394eaab7a2aa579bd30dbbbc278224c3c", "result": "PASS7 browser,50 full Node,4locales", "exists": true, "storage": "REMOTE_SAVED", "sha256": "10ff353b42f23f07713bcfcdae147e0d44b0a04ccfd14ffb42e7d6b7998f6161", "resource_freshness": "MATCHES_WORKING_RESOURCES"}, {"path": "docs/evidence/strategy-v222/pop-p0-summary.json", "source_commit": "8d0902877564872ee5382155ebf38474c125c950", "result": "PASS normal P0; performance/spec ceilings still pending", "exists": true, "storage": "REMOTE_SAVED", "sha256": "674edd4b6b044f1d425c213947d73424ae9db612c467fdcec334a5389b7a7403", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: P0/bounded browser pass; performance and spec ceilings still need gating

## codex/riftwatch-v222-prediction

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "/workspace/diagnostics/riftwatch/v222-prediction-committed-tests.log.txt", "source_commit": "0ac8effc8c99cc4524e2a90279fdb41eacc3e7dc", "result": "5 actual committed-tool tests PASS; synthetic model fixtures only; real hardware prediction INSUFFICIENT_DATA", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "76cc889252eafc122067ecebc2cdc76f06378d97cd42c08e421280b5f03f3523", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: No matched physical hardware calibration
Next: Collect comparable actual measurements; do not translate cloud ratios to verified FPS

## codex/riftwatch-b1-rally

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v2/acceptance.json", "source_commit": "2f148c3e3877fc04b6566c0fc6c680b699c73895", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "REMOTE_SAVED", "sha256": "e1b3656c28533bd787dff6db01c70f40fcdbd1400d36075debd2409c6ae08455", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Latest source2f148c3 needs full three-repeat performance

## codex/riftwatch-v22-target-state

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/target-p0-summary.json", "source_commit": "77c20609da28b38fa405531a0215a8261dc6b1ef", "result": "PASS full normal P0 and51Node/fourlocales/5native browser checks", "exists": true, "storage": "REMOTE_SAVED", "sha256": "a74ca0c7c7c6c650b110ae41dfc2dce5bea5e8c4843e94ec689172d36fe9f851", "resource_freshness": "MATCHES_WORKING_RESOURCES"}, {"path": "docs/evidence/strategy-v222/target-performance-summary.json", "source_commit": "294fa287aed37af7820e682d175577a89867380f", "result": "9/12qualityPASS;12/12stuck+movementPASS;3FAIL retained; integration BLOCKED", "exists": true, "storage": "REMOTE_SAVED", "sha256": "b07b652f31cbea97ef32217b7b166b4e4c60b51e766ef0e22f1a737c47253ae3", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: New100r1 severe rAF stall;250r1/r3 clock-progress loss; no retry/waiver
Next: Diagnose stalls/time loss in separate diagnostic cohort, no repeated acceptance retry; Then gate feature merge; do not label all collisions fixed

## codex/riftwatch-v226-delivery

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v240-game-first

Unpushed commits: []
Uncommitted paths: [{"status": " M", "path": "docs/evidence/v240-campaign-natural/REPORT.md"}, {"status": " M", "path": "docs/handoff/ACTIVE-TASK.json"}, {"status": " M", "path": "docs/handoff/HANDOFF.md"}, {"status": " M", "path": "docs/handoff/NEXT-TASKS.json"}, {"status": " M", "path": "docs/recovery/task-registry.json"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/STOP_REQUESTED"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/campaign.mp4"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/checkpoint-provenance.json"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/events.jsonl"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/result.json"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/save-snapshot.json"}, {"status": "??", "path": "docs/evidence/v240-campaign-natural/policy-v4/wave-4-defeat-367.png"}]
Validation: [{"name": "Map and legacy regression", "path": "docs/evidence/v240-map-generation/REPORT.md", "source_commit": "da97f86f0e3677419f1d58b705b0952dc1beeeae", "result": "132Node/480routes/8native PASS", "exists": true, "storage": "REMOTE_SAVED", "sha256": "0256be620b4b684d8438497e3cc1fc40b649d5390659743dab62a44e32ba12ce", "resource_freshness": "SOURCE_CHANGED"}, {"name": "Approved campaign feature regression", "path": "docs/evidence/v240-new-game-plus/affected-regression.log.txt", "source_commit": "5f63a939f64f3d3d40c66abfd4af655732dae7b0", "result": "95/95 PASS; NG+ natural transition NOT_TESTED", "exists": true, "storage": "REMOTE_SAVED", "sha256": "8b12b5f3e2eb74ba85110a6400b92facc809064dbfdc2ad8f8ddd795c879f60c", "resource_freshness": "SOURCE_CHANGED"}, {"name": "Natural campaignV1", "path": "docs/evidence/v240-campaign-natural/REPORT.md", "source_commit": "da97f86f0e3677419f1d58b705b0952dc1beeeae", "result": "FAIL defeated wave5; policyV2 running, no ten-wave claim", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "8eec8f926685e3a92cc1bfbb61ce6a3e7be424fc75fd69fded2a8a519a284b30", "resource_freshness": "SOURCE_CHANGED"}, {"name": "Native completed-campaign persistence", "path": "docs/evidence/v240-victory-resume/REPORT.md", "source_commit": "a5a538d287b9c29951a83ebede5431db9fce7dc7", "result": "10/10 native controlled-victory checks PASS; not a natural victory", "exists": true, "storage": "REMOTE_SAVED", "sha256": "b45a217cf12bd7ae7bc56c32e1b26881466403d40baeece7c962c66bdd9cc398", "resource_freshness": "MATCHES_WORKING_RESOURCES"}, {"name": "Natural policyV4", "path": "docs/evidence/v240-campaign-natural/REPORT.md", "source_commit": "a5a538d287b9c29951a83ebede5431db9fce7dc7", "result": "FAIL defeated wave4 with actual age2; zero game errors", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "8eec8f926685e3a92cc1bfbb61ce6a3e7be424fc75fd69fded2a8a519a284b30", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Natural V1 defeat5, V2 harness-incomplete4, V3 defeat4, V4 defeat4; ten-wave/NG+ natural end-to-end NOT_PASSED; Original landmark mixed-scene +21.4percent drawing regression FAIL remains; Low-FPS clock, strict deterministic SaveLoad, Rift natural crash NOT_REPRODUCED and hardware pending remain; HARDWARE_TEST_PENDING; CROSS_THREAD_HANDOFF_UNAVAILABLE; public deployment not authorized
Next: No campaign process remains active; read final V4 failure snapshot and all cohort reports; Analyze worker losses, actual technology and defensive army/fortification choices before another bounded natural attempt; avoid rerunning historical valid tests; Use latest exact artifact and legal native UI for natural ten-wave victory then actual NG+; do not alter Normal statistics just to get green; All code/evidence saved; revalidate ownership and actual remote HEAD before writes
