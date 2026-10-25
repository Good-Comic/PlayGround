# Worktree Recovery Manifest

Snapshot ID: a7592b62047ab980c1648e7e54442a7ae8872355041346cc33a7d19203b10295
Captured UTC: 2026-10-25T18:36:42.005492+00:00 · Trigger: POST_PUSH
Collector source: `1c112ccbac6f53e12cb819ee9962ebfbedff2fbd` · LOCAL_INVENTORIED_NOT_A_PUSH

Point-in-time observation before writing output; snapshot publication commit is necessarily later. No recursive commit loop; pending dirty files remain explicitly unsaved.

| Worktree | Branch | HEAD | Remote HEAD | Status | Dirty |
|---|---|---|---|---|---|
| /workspace/PlayGround | work | 8ef7358d61980eada812ae16b8e12c2f1e28baa8 | None | REMOTE_BRANCH_ABSENT | False |
| /workspace/riftwatch | codex/riftwatch-v222-recovery | 1c112ccbac6f53e12cb819ee9962ebfbedff2fbd | 1c112ccbac6f53e12cb819ee9962ebfbedff2fbd | REMOTE_SAVED | True |
| /workspace/riftwatch-civ | codex/riftwatch-v22-civ-alignment | 2ad2fe4a6466c6c38a033d1194f004924dbfda37 | 2ad2fe4a6466c6c38a033d1194f004924dbfda37 | REMOTE_SAVED | False |
| /workspace/riftwatch-integration | codex/riftwatch-gameplay-integration | d778cf2d8157edd9716b4790bcd29e00e967579f | d778cf2d8157edd9716b4790bcd29e00e967579f | REMOTE_SAVED | False |
| /workspace/riftwatch-pop | codex/riftwatch-v22-population | 8d0902877564872ee5382155ebf38474c125c950 | 8d0902877564872ee5382155ebf38474c125c950 | REMOTE_SAVED | False |
| /workspace/riftwatch-rally | codex/riftwatch-b1-rally | 2a0da8a7320336ac342c1af0953a424d08ef1515 | 2a0da8a7320336ac342c1af0953a424d08ef1515 | REMOTE_SAVED | False |
| /workspace/riftwatch-v22 | codex/riftwatch-v22-target-state | 982bedc5d46207e5251bf592c335f85e3f4140f6 | 982bedc5d46207e5251bf592c335f85e3f4140f6 | REMOTE_SAVED | False |

## work

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v222-recovery

Unpushed commits: []
Uncommitted paths: [{"status": " M", "path": "docs/evidence/strategy-v222/recovery-tests.log.txt"}, {"status": " M", "path": "docs/recovery/WORKTREE-RECOVERY.md"}, {"status": " M", "path": "docs/recovery/worktree-recovery.json"}, {"status": " M", "path": "tests/dev/test_recovery.py"}, {"status": " M", "path": "tools/dev/checkpoint.py"}, {"status": " M", "path": "tools/dev/worktree_recovery.py"}]
Validation: [{"path": "/workspace/diagnostics/riftwatch/v22-quality-baseline/results.json", "source_commit": "11f8a6a29c481da0613d2765bb06739e5ce6a8b8", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "b3bf19051816248b1dccd9bbd38e7bfe2221c6eb1f8e70d4092c4f816974d41d", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Publish framework; preserve other worktrees; do not rerun valid12 baseline cases

## codex/riftwatch-v22-civ-alignment

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/civ-results.json", "source_commit": "da0823c6341b1ee85e32d1b6c0f776ef3008255c", "result": "PASS8 browser,47 full Node,4locales; prior description FAIL fixed", "exists": true, "storage": "REMOTE_SAVED", "sha256": "ed43181fc96ec3f6463dfff37203727a307e9c5eba443a51dd92e361e99f3908", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Run amended R-template/cost tests and native browser training

## codex/riftwatch-gameplay-integration

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: Gameplay features not integrated; tooling-only integration being prepared
Next: Merge only reviewed recovery tooling with unchanged game resources, run scoped tests; keep feature gates

## codex/riftwatch-v22-population

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v222/pop-results.json", "source_commit": "86d7e81394eaab7a2aa579bd30dbbbc278224c3c", "result": "PASS7 browser,50 full Node,4locales", "exists": true, "storage": "REMOTE_SAVED", "sha256": "10ff353b42f23f07713bcfcdae147e0d44b0a04ccfd14ffb42e7d6b7998f6161", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Run updated population tests and browser for core20

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
Next: Run new target-state tests; source changed since Boss browser
