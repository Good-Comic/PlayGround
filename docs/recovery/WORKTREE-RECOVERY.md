# Worktree Recovery Manifest

Captured UTC: 2026-10-25T18:24:55.017517+00:00 · Trigger: SLICE_COMPLETE
Collector source: `11f8a6a29c481da0613d2765bb06739e5ce6a8b8` · LOCAL_INVENTORIED_NOT_A_PUSH

Point-in-time observation before writing output; snapshot publication commit is necessarily later. No recursive commit loop; pending dirty files remain explicitly unsaved.

| Worktree | Branch | HEAD | Remote HEAD | Status | Dirty |
|---|---|---|---|---|---|
| /workspace/PlayGround | work | 8ef7358d61980eada812ae16b8e12c2f1e28baa8 | None | REMOTE_BRANCH_ABSENT | False |
| /workspace/riftwatch | codex/riftwatch-v222-recovery | 11f8a6a29c481da0613d2765bb06739e5ce6a8b8 | None | REMOTE_BRANCH_ABSENT | True |
| /workspace/riftwatch-civ | codex/riftwatch-v22-civ-alignment | 0b072b7ae211deb8789a88290b495ce2c58773c9 | None | REMOTE_BRANCH_ABSENT | True |
| /workspace/riftwatch-pop | codex/riftwatch-v22-population | 46759494baa05ba3d1be7c59b2c7f78a1735e89d | 46759494baa05ba3d1be7c59b2c7f78a1735e89d | REMOTE_SAVED | True |
| /workspace/riftwatch-rally | codex/riftwatch-b1-rally | 2a0da8a7320336ac342c1af0953a424d08ef1515 | 2a0da8a7320336ac342c1af0953a424d08ef1515 | REMOTE_SAVED | False |
| /workspace/riftwatch-v22 | codex/riftwatch-v22-target-state | ee0784a40db8134abbd1ae92bfa7ee61a1cedc93 | None | REMOTE_BRANCH_ABSENT | True |

## work

Unpushed commits: []
Uncommitted paths: []
Validation: []
Blockers: NOT_ASSESSED
Next: Inspect task registry and relevant diff before writing

## codex/riftwatch-v222-recovery

Unpushed commits: ["11f8a6a29c481da0613d2765bb06739e5ce6a8b8"]
Uncommitted paths: [{"status": "??", "path": ".github/copilot-instructions.md"}, {"status": "??", "path": "AGENTS.md"}, {"status": "??", "path": "CLAUDE.md"}, {"status": "??", "path": "GEMINI.md"}, {"status": "??", "path": "docs/evidence/strategy-v222/recovery-tests.log.txt"}, {"status": "??", "path": "docs/handoff/ACTIVE-TASK.json"}, {"status": "??", "path": "docs/handoff/HANDOFF.md"}, {"status": "??", "path": "docs/handoff/NEXT-AGENT-PROMPT.md"}, {"status": "??", "path": "docs/handoff/NEXT-TASKS.json"}, {"status": "??", "path": "docs/handoff/SHARED-RULES.md"}, {"status": "??", "path": "docs/handoff/STRATEGY-V2.2.1-V2.2.2.md"}, {"status": "??", "path": "docs/handoff/handoff-package.json"}, {"status": "??", "path": "docs/recovery/WORKTREE-RECOVERY.md"}, {"status": "??", "path": "docs/recovery/task-registry.json"}, {"status": "??", "path": "docs/recovery/worktree-recovery.json"}, {"status": "??", "path": "tests/dev/test_recovery.py"}, {"status": "??", "path": "tools/dev/agent_dispatch.py"}, {"status": "??", "path": "tools/dev/agent_handoff.py"}, {"status": "??", "path": "tools/dev/checkpoint.py"}, {"status": "??", "path": "tools/dev/worktree_recovery.py"}]
Validation: [{"path": "/workspace/diagnostics/riftwatch/v22-quality-baseline/results.json", "source_commit": "11f8a6a29c481da0613d2765bb06739e5ce6a8b8", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "LOCAL_ONLY_OR_MISSING", "sha256": "b3bf19051816248b1dccd9bbd38e7bfe2221c6eb1f8e70d4092c4f816974d41d", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Publish framework; preserve other worktrees; do not rerun valid12 baseline cases

## codex/riftwatch-v22-civ-alignment

Unpushed commits: []
Uncommitted paths: [{"status": " M", "path": "docs/GAMEPLAY-PROGRESS.md"}, {"status": " M", "path": "js/data.js"}, {"status": " M", "path": "tests/civ-training.test.mjs"}, {"status": " M", "path": "tools/qa/feature_browser.py"}]
Validation: [{"path": "docs/evidence/strategy-v2/v2-civ-feature/results.json", "source_commit": "dc4698a3f8801ea5ada37a908951900fca6a8ef6", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": false, "storage": "LOCAL_ONLY_OR_MISSING", "resource_freshness": "SOURCE_CHANGED"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Run amended R-template/cost tests and native browser training

## codex/riftwatch-v22-population

Unpushed commits: []
Uncommitted paths: [{"status": " M", "path": "docs/GAMEPLAY-PROGRESS.md"}, {"status": " M", "path": "docs/GAMEPLAY-REQUIREMENTS.md"}, {"status": " M", "path": "js/data.js"}, {"status": " M", "path": "js/game.js"}, {"status": " M", "path": "tests/population.test.mjs"}, {"status": " M", "path": "tools/qa/population_browser.py"}]
Validation: [{"path": "docs/evidence/strategy-v22/population-browser.json", "source_commit": "fe1919643945f62c251ff68f75cde241ea3221fa", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "REMOTE_SAVED", "sha256": "bc17dd55cb3c22b3aa8140c924a719fd0c117c55befdae2d2b6af017a0e38c0f", "resource_freshness": "SOURCE_CHANGED"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Run updated population tests and browser for core20

## codex/riftwatch-b1-rally

Unpushed commits: []
Uncommitted paths: []
Validation: [{"path": "docs/evidence/strategy-v2/acceptance.json", "source_commit": "2f148c3e3877fc04b6566c0fc6c680b699c73895", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "REMOTE_SAVED", "sha256": "e1b3656c28533bd787dff6db01c70f40fcdbd1400d36075debd2409c6ae08455", "resource_freshness": "MATCHES_WORKING_RESOURCES"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Latest source2f148c3 needs full three-repeat performance

## codex/riftwatch-v22-target-state

Unpushed commits: ["ee0784a40db8134abbd1ae92bfa7ee61a1cedc93", "f6f8aa0c0bcca9fdc0beb917aafc406f78397b60", "8375b6211900eae75c78fad4a08b73e28ed46888", "198b19aba1854600ec7171b6409a96e1aea8b730"]
Uncommitted paths: [{"status": " M", "path": "js/game.js"}, {"status": "??", "path": "tests/target-state.test.mjs"}]
Validation: [{"path": "docs/evidence/strategy-v22/boss-browser.json", "source_commit": "8375b6211900eae75c78fad4a08b73e28ed46888", "result": "REFER_TO_EVIDENCE; no automatic PASS inferred", "exists": true, "storage": "COMMITTED_LOCAL_REMOTE_UNCONFIRMED", "sha256": "4f86e3b92b3b89f8c4ca8d40b3f892edb4adfb2c4c611d15b7ee8bf760380056", "resource_freshness": "SOURCE_CHANGED"}]
Blockers: Feature-specific remaining gates; see handoff
Next: Run new target-state tests; source changed since Boss browser
