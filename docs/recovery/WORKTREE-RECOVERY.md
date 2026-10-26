# Worktree Recovery Manifest

Snapshot ID: fd3b0bb880a993180ff92b698f5fb405ccde4c1646e0abb0f9d9a1b0661ee183
Captured UTC: 2026-10-26T09:05:11.240474+00:00 · Trigger: FINAL_CHECKPOINT
Collector source: `35bb4dcf8d0e48843b68831a89a1d07c41d33c36` · LOCAL_INVENTORIED_NOT_A_PUSH

Point-in-time observation before writing output; snapshot publication commit is necessarily later. No recursive commit loop; pending dirty files remain explicitly unsaved.

| Worktree | Branch | HEAD | Remote HEAD | Status | Dirty |
|---|---|---|---|---|---|
| /workspace/PlayGround | work | 8ef7358d61980eada812ae16b8e12c2f1e28baa8 | None | REMOTE_BRANCH_ABSENT | False |
| /workspace/riftwatch | codex/riftwatch-v222-recovery | 317ef162b4f4b69c43644cb0e7c031387dc898c1 | 317ef162b4f4b69c43644cb0e7c031387dc898c1 | REMOTE_SAVED | False |
| /workspace/riftwatch-civ | codex/riftwatch-v22-civ-alignment | c456cae581b3ec85a7dd222d017453d2e589e095 | c456cae581b3ec85a7dd222d017453d2e589e095 | REMOTE_SAVED | False |
| /workspace/riftwatch-integration | codex/riftwatch-gameplay-integration | 2cd6f099d72a980bfa24dd7ae0f79676918884e8 | 2cd6f099d72a980bfa24dd7ae0f79676918884e8 | REMOTE_SAVED | False |
| /workspace/riftwatch-live | codex/riftwatch-v226-live-acceptance | 1a5a67c5373bdd5ede925484776339f95ded78a0 | 1a5a67c5373bdd5ede925484776339f95ded78a0 | REMOTE_SAVED | False |
| /workspace/riftwatch-monitor | codex/riftwatch-v224-monitor | fa520ae3006329bd2b1c54ac90938519465bf320 | fa520ae3006329bd2b1c54ac90938519465bf320 | REMOTE_SAVED | False |
| /workspace/riftwatch-orders | codex/riftwatch-v227-orders | 0239a308838dab06ec9f5e2dda4e413cda48d046 | 0239a308838dab06ec9f5e2dda4e413cda48d046 | REMOTE_SAVED | False |
| /workspace/riftwatch-playtest | codex/riftwatch-playtest-candidate | 3779c5d50876cb2e28590b9d250fb355fc0f8e38 | 3779c5d50876cb2e28590b9d250fb355fc0f8e38 | REMOTE_SAVED | False |
| /workspace/riftwatch-pop | codex/riftwatch-v22-population | 0094fabc6507b41253b8869e2dacf8b0e56e3263 | 0094fabc6507b41253b8869e2dacf8b0e56e3263 | REMOTE_SAVED | False |
| /workspace/riftwatch-prediction | codex/riftwatch-v222-prediction | b72f9603bf2d8fd865da5cf9dccc32be1dd90830 | b72f9603bf2d8fd865da5cf9dccc32be1dd90830 | REMOTE_SAVED | False |
| /workspace/riftwatch-rally | codex/riftwatch-b1-rally | 2a0da8a7320336ac342c1af0953a424d08ef1515 | 2a0da8a7320336ac342c1af0953a424d08ef1515 | REMOTE_SAVED | False |
| /workspace/riftwatch-ui | codex/riftwatch-v227-ui | 6ad09704c184ee772bf88d92949e8889fca086ce | 6ad09704c184ee772bf88d92949e8889fca086ce | REMOTE_SAVED | False |
| /workspace/riftwatch-v22 | codex/riftwatch-v22-target-state | 2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec | 2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec | REMOTE_SAVED | False |
| /workspace/riftwatch-v226 | codex/riftwatch-v226-delivery | ee0d219a916d8388fab5d66ff86e3bd650aa66af | ee0d219a916d8388fab5d66ff86e3bd650aa66af | REMOTE_SAVED | False |
| /workspace/riftwatch-wave | codex/riftwatch-v227-wave | 35bb4dcf8d0e48843b68831a89a1d07c41d33c36 | 35bb4dcf8d0e48843b68831a89a1d07c41d33c36 | REMOTE_SAVED | False |

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

## codex/riftwatch-v226-live-acceptance

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v224-monitor

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v227-orders

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

## codex/riftwatch-v227-ui

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

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

## codex/riftwatch-v227-wave

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing
