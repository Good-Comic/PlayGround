# Worktree Recovery Manifest

Snapshot ID: 88f963cb2105df6e84a1b54c424028c3c53bc83836dd902fe833f390a07c0afa
Captured UTC: 2026-10-25T18:52:52.923888+00:00 · Trigger: POST_PUSH
Collector source: `763ba6c1c4b285f9523a7ef342b57024be6e7326` · LOCAL_INVENTORIED_NOT_A_PUSH

Point-in-time observation before writing output; snapshot publication commit is necessarily later. No recursive commit loop; pending dirty files remain explicitly unsaved.

| Worktree | Branch | HEAD | Remote HEAD | Status | Dirty |
|---|---|---|---|---|---|
| /workspace/PlayGround | work | 8ef7358d61980eada812ae16b8e12c2f1e28baa8 | None | REMOTE_BRANCH_ABSENT | False |
| /workspace/riftwatch | codex/riftwatch-v222-recovery | 763ba6c1c4b285f9523a7ef342b57024be6e7326 | 763ba6c1c4b285f9523a7ef342b57024be6e7326 | REMOTE_SAVED | True |
| /workspace/riftwatch-civ | codex/riftwatch-v22-civ-alignment | c456cae581b3ec85a7dd222d017453d2e589e095 | c456cae581b3ec85a7dd222d017453d2e589e095 | REMOTE_SAVED | False |
| /workspace/riftwatch-integration | codex/riftwatch-gameplay-integration | 72e978417afd3c95f897cc7cb35395f00008c313 | 72e978417afd3c95f897cc7cb35395f00008c313 | REMOTE_SAVED | False |
| /workspace/riftwatch-pop | codex/riftwatch-v22-population | 0094fabc6507b41253b8869e2dacf8b0e56e3263 | 0094fabc6507b41253b8869e2dacf8b0e56e3263 | REMOTE_SAVED | False |
| /workspace/riftwatch-prediction | codex/riftwatch-v222-prediction | 0ac8effc8c99cc4524e2a90279fdb41eacc3e7dc | 0ac8effc8c99cc4524e2a90279fdb41eacc3e7dc | REMOTE_SAVED | False |
| /workspace/riftwatch-rally | codex/riftwatch-b1-rally | 2a0da8a7320336ac342c1af0953a424d08ef1515 | 2a0da8a7320336ac342c1af0953a424d08ef1515 | REMOTE_SAVED | False |
| /workspace/riftwatch-v22 | codex/riftwatch-v22-target-state | 2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec | 2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec | REMOTE_SAVED | False |

## work

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v222-recovery

Unpushed commits: []
Uncommitted paths: [{"status": " M", "path": "docs/STRATEGY-V2.2-EXECUTION.md"}, {"status": " M", "path": "docs/handoff/ACTIVE-TASK.json"}, {"status": " M", "path": "docs/handoff/NEXT-TASKS.json"}, {"status": " M", "path": "docs/recovery/WORKTREE-RECOVERY.md"}, {"status": " M", "path": "docs/recovery/task-registry.json"}, {"status": " M", "path": "docs/recovery/worktree-recovery.json"}, {"status": "??", "path": "docs/evidence/strategy-v222/integration-smoke-resources.json"}, {"status": "??", "path": "docs/recovery/post-merge-72e9784.json"}, {"status": "??", "path": "docs/recovery/pre-merge-763ba6c.json"}]
Validation: [{"path": "/workspace/diagnostics/riftwatch/v22-quality-baseline/results.json", "source_commit": "11f8a6a29c481da0613d2765bb06739e5ce6a8b8", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "b3bf19051816248b1dccd9bbd38e7bfe2221c6eb1f8e70d4092c4f816974d41d", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Publish framework; preserve other worktrees; do not rerun valid12 baseline cases

## codex/riftwatch-v22-civ-alignment

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/civ-results.json", "source_commit": "da0823c6341b1ee85e32d1b6c0f776ef3008255c", "result": "PASS8 browser,47 full Node,4locales; prior description FAIL fixed", "exists": true, "storage": "REMOTE_SAVED", "sha256": "ed43181fc96ec3f6463dfff37203727a307e9c5eba443a51dd92e361e99f3908", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Persist normal P0 evidence; performance/combined B1/B2 gates pending

## codex/riftwatch-gameplay-integration

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "/workspace/diagnostics/riftwatch/v222-tooling-smoke/result.json", "source_commit": "72e978417afd3c95f897cc7cb35395f00008c313", "result": "INTEGRATED_VERIFIED tooling only;44Node+8dev+4locales and actual Start/Save/Continue pass; no game resource changes", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "62f412196a38f35f655c092d31e06ef6cb9dee08d2613ff03a5d37f182848fb4", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Gameplay feature gates not yet complete
Next: Keep Boss/Population/Target/Civ/Rally game changes isolated until gates

## codex/riftwatch-v22-population

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/pop-results.json", "source_commit": "86d7e81394eaab7a2aa579bd30dbbbc278224c3c", "result": "PASS7 browser,50 full Node,4locales", "exists": true, "storage": "REMOTE_SAVED", "sha256": "10ff353b42f23f07713bcfcdae147e0d44b0a04ccfd14ffb42e7d6b7998f6161", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
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
Validation: [{"path": "/workspace/diagnostics/riftwatch/v222-target-browser-r1/results.json", "source_commit": "77c20609da28b38fa405531a0215a8261dc6b1ef", "result": "PASS5 bounded real browser; full51 Node tests also pass; P0 run in progress", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "4012770c17e3bf0b5b4a2769b726f2e45dd12683d0066fca1e68fc6c68d14e05", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Finish performance batch source294fa287; never overwrite initial FAILs
