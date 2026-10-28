# 工作樹恢復清單 / Worktree Recovery Manifest

`BILINGUAL_DOCUMENTATION_REQUIRED = true`

本清單記錄產生當下的本地 Git 與實際遠端查詢；本地記錄不代表已 Push。快照的提交必然晚於其觀察版本，不能反覆追寫自身 SHA。機器欄位及歷史原始資料保留原文，歷史敘述仍依優先級逐步補譯。
This manifest records local Git state and actual remote queries at capture time; a local record is not a push. The snapshot publication commit necessarily follows its observed version; do not recursively update its own SHA. Machine fields and historical raw data remain unchanged; historical narrative is translated incrementally by priority.

快照 ID / Snapshot ID: cdbd43b05a096231eab43ff4fde554f063785085713687ace47954bfd74d6fdb
擷取時間 UTC / Captured UTC: 2026-10-28T16:29:01.981320+00:00 · 觸發 / Trigger: FINAL_CHECKPOINT
來源 / Collector source: `d33810af147bbde8f1ea7ef00e30314f33f305a7` · LOCAL_INVENTORIED_NOT_A_PUSH

| 工作樹 / Worktree | 分支 / Branch | HEAD | 遠端 / Remote HEAD | 狀態 / Status | Dirty |
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
| /workspace/riftwatch-v240 | codex/riftwatch-v240-game-first | d33810af147bbde8f1ea7ef00e30314f33f305a7 | d33810af147bbde8f1ea7ef00e30314f33f305a7 | REMOTE_SAVED | True |

## work

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [],
  "blockers": [
    "NOT_ASSESSED"
  ],
  "next_steps": [
    "Inspect task registry and relevant diff before writing"
  ]
}
```

## codex/riftwatch-v222-recovery

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "/workspace/diagnostics/riftwatch/v22-quality-baseline/results.json",
      "source_commit": "11f8a6a29c481da0613d2765bb06739e5ce6a8b8",
      "result": "REFER_TO_EVIDENCE; no automatic PASS inferred",
      "exists": true,
      "storage": "LOCAL_ONLY_OR_MISSING",
      "sha256": "b3bf19051816248b1dccd9bbd38e7bfe2221c6eb1f8e70d4092c4f816974d41d",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "Feature-specific remaining gates; see handoff"
  ],
  "next_steps": [
    "Publish framework; preserve other worktrees; do not rerun valid12 baseline cases"
  ]
}
```

## codex/riftwatch-v22-civ-alignment

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "docs/evidence/strategy-v222/civ-results.json",
      "source_commit": "da0823c6341b1ee85e32d1b6c0f776ef3008255c",
      "result": "PASS8 browser,47 full Node,4locales; prior description FAIL fixed",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "ed43181fc96ec3f6463dfff37203727a307e9c5eba443a51dd92e361e99f3908",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    },
    {
      "path": "docs/evidence/strategy-v222/civ-p0-summary.json",
      "source_commit": "2ad2fe4a6466c6c38a033d1194f004924dbfda37",
      "result": "PASS normal P0; performance/combined B1/B2 still pending",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "d5d392bea72713c02c184baca4f00558da547abe0ed016e6b74caa9c50a0f5e2",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "Feature-specific remaining gates; see handoff"
  ],
  "next_steps": [
    "Persist normal P0 evidence; performance/combined B1/B2 gates pending"
  ]
}
```

## codex/riftwatch-gameplay-integration

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "/workspace/diagnostics/riftwatch/v222-tooling-smoke/result.json",
      "source_commit": "72e978417afd3c95f897cc7cb35395f00008c313",
      "result": "INTEGRATED_VERIFIED tooling only;44Node+8dev+4locales and actual Start/Save/Continue pass; no game resource changes",
      "exists": true,
      "storage": "LOCAL_ONLY_OR_MISSING",
      "sha256": "62f412196a38f35f655c092d31e06ef6cb9dee08d2613ff03a5d37f182848fb4",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "Gameplay feature gates not yet complete"
  ],
  "next_steps": [
    "Keep Boss/Population/Target/Civ/Rally game changes isolated until gates"
  ]
}
```

## codex/riftwatch-v224-monitor

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [],
  "blockers": [
    "NOT_ASSESSED"
  ],
  "next_steps": [
    "Inspect task registry and relevant diff before writing"
  ]
}
```

## codex/riftwatch-playtest-candidate

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "docs/evidence/playtest-candidate/acceptance.json",
      "source_commit": "d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c",
      "result": "LOCAL_VERIFIED bounded experimental candidate; Pages approval pending",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "f7aa32e6797823b1d48a98ed1ef8803526435c67261a360c04284351c6e9dd67",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "DEPLOYMENT_BLOCKED_AWAITING_USER_APPROVAL",
    "HARDWARE_TEST_PENDING",
    "SIMULATION_INTEGRITY_BLOCKED"
  ],
  "next_steps": [
    "Obtain user approval for APPROVAL-PLAN.json",
    "If approved recheck no existing Pages,deploy only approved artifact toisolated site branch,enablePages then actual remote acceptance",
    "Keep full formal feature gates unchanged; independent performance and B–E work can continue"
  ]
}
```

## codex/riftwatch-v22-population

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "docs/evidence/strategy-v222/pop-results.json",
      "source_commit": "86d7e81394eaab7a2aa579bd30dbbbc278224c3c",
      "result": "PASS7 browser,50 full Node,4locales",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "10ff353b42f23f07713bcfcdae147e0d44b0a04ccfd14ffb42e7d6b7998f6161",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    },
    {
      "path": "docs/evidence/strategy-v222/pop-p0-summary.json",
      "source_commit": "8d0902877564872ee5382155ebf38474c125c950",
      "result": "PASS normal P0; performance/spec ceilings still pending",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "674edd4b6b044f1d425c213947d73424ae9db612c467fdcec334a5389b7a7403",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "Feature-specific remaining gates; see handoff"
  ],
  "next_steps": [
    "P0/bounded browser pass; performance and spec ceilings still need gating"
  ]
}
```

## codex/riftwatch-v222-prediction

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "/workspace/diagnostics/riftwatch/v222-prediction-committed-tests.log.txt",
      "source_commit": "0ac8effc8c99cc4524e2a90279fdb41eacc3e7dc",
      "result": "5 actual committed-tool tests PASS; synthetic model fixtures only; real hardware prediction INSUFFICIENT_DATA",
      "exists": true,
      "storage": "LOCAL_ONLY_OR_MISSING",
      "sha256": "76cc889252eafc122067ecebc2cdc76f06378d97cd42c08e421280b5f03f3523",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "No matched physical hardware calibration"
  ],
  "next_steps": [
    "Collect comparable actual measurements; do not translate cloud ratios to verified FPS"
  ]
}
```

## codex/riftwatch-b1-rally

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "docs/evidence/strategy-v2/acceptance.json",
      "source_commit": "2f148c3e3877fc04b6566c0fc6c680b699c73895",
      "result": "REFER_TO_EVIDENCE; no automatic PASS inferred",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "e1b3656c28533bd787dff6db01c70f40fcdbd1400d36075debd2409c6ae08455",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "Feature-specific remaining gates; see handoff"
  ],
  "next_steps": [
    "Latest source2f148c3 needs full three-repeat performance"
  ]
}
```

## codex/riftwatch-v22-target-state

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [
    {
      "path": "docs/evidence/strategy-v222/target-p0-summary.json",
      "source_commit": "77c20609da28b38fa405531a0215a8261dc6b1ef",
      "result": "PASS full normal P0 and51Node/fourlocales/5native browser checks",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "a74ca0c7c7c6c650b110ae41dfc2dce5bea5e8c4843e94ec689172d36fe9f851",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    },
    {
      "path": "docs/evidence/strategy-v222/target-performance-summary.json",
      "source_commit": "294fa287aed37af7820e682d175577a89867380f",
      "result": "9/12qualityPASS;12/12stuck+movementPASS;3FAIL retained; integration BLOCKED",
      "exists": true,
      "storage": "REMOTE_SAVED",
      "sha256": "b07b652f31cbea97ef32217b7b166b4e4c60b51e766ef0e22f1a737c47253ae3",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "New100r1 severe rAF stall;250r1/r3 clock-progress loss; no retry/waiver"
  ],
  "next_steps": [
    "Diagnose stalls/time loss in separate diagnostic cohort, no repeated acceptance retry",
    "Then gate feature merge; do not label all collisions fixed"
  ]
}
```

## codex/riftwatch-v226-delivery

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [],
  "last_validation": [],
  "blockers": [
    "NOT_ASSESSED"
  ],
  "next_steps": [
    "Inspect task registry and relevant diff before writing"
  ]
}
```

## codex/riftwatch-v240-game-first

原始機器資料（欄位不翻譯） / Raw machine data (field names unchanged):

```json
{
  "unpushed_commits": [],
  "changed_files": [
    {
      "status": " M",
      "path": "docs/handoff/ACTIVE-TASK.json"
    },
    {
      "status": " M",
      "path": "docs/handoff/HANDOFF.md"
    },
    {
      "status": " M",
      "path": "docs/handoff/NEXT-TASKS.json"
    },
    {
      "status": " M",
      "path": "docs/recovery/task-registry.json"
    },
    {
      "status": " M",
      "path": "tests/v5-player.test.mjs"
    },
    {
      "status": " M",
      "path": "tools/qa/natural_campaign.mjs"
    },
    {
      "status": " M",
      "path": "tools/qa/v5_player.mjs"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/REPORT.md"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/damage-summary.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-before.txt"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/campaign.mp4"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/checkpoint-96.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/events.jsonl"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/latest-state.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/result.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/save-snapshot.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/wave-3-boon-94.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/wave-3-wave-0.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/wave-3-wave-64.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-not-exercised/wave-4-prep-96.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/campaign.mp4"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/events.jsonl"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/latest-state.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/result.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/resume-integrity.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/save-snapshot.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/escort-verified/wave-3-wave-0.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/final-tests.txt"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/initial-policy-tests.txt"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/campaign.mp4"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/checkpoint-94.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/events.jsonl"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/latest-state.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/result.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/save-snapshot.json"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/wave-3-boon-45.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/wave-3-wave-0.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/wave-4-prep-47.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/wave-4-wave-141.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observed/wave-4-wave-79.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/observer-tests.txt"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/startup-failure/events.jsonl"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/startup-failure/failure.png"
    },
    {
      "status": "??",
      "path": "docs/evidence/v240-worker-hits/startup-failure/result.json"
    },
    {
      "status": "??",
      "path": "tests/worker-observer.test.mjs"
    },
    {
      "status": "??",
      "path": "tools/qa/worker_damage_observer.mjs"
    }
  ],
  "last_validation": [
    {
      "path": "docs/evidence/v240-worker-hits/final-tests.txt",
      "result": "15 PASS",
      "exists": true,
      "storage": "LOCAL_ONLY_OR_MISSING",
      "sha256": "495007174e29ac221e083a1b561f7b193ad4a556442630e1be5c310876ae7db8",
      "resource_freshness": "UNKNOWN"
    },
    {
      "path": "docs/evidence/v240-worker-hits/escort-verified/events.jsonl",
      "source_commit": "798bcffdfe8e97bdd4e8abe6c67f18223b540877",
      "result": "Native escort21 separated from siege focus; not campaign PASS",
      "exists": true,
      "storage": "LOCAL_ONLY_OR_MISSING",
      "sha256": "27ec1db5c3b56759b59255935b9ea314b6c8a8029555bc0bce669a1911051e74",
      "resource_freshness": "MATCHES_WORKING_RESOURCES"
    }
  ],
  "blockers": [
    "V5.4第四波戰敗，食物2.17／木材740.76／黃金227.22；非 Normal 不可能通關證據 / V5.4 defeat4, food2.17/wood740.76/gold227.22; not proof Normal impossible",
    "Original landmark mixed-scene +21.4percent drawing regression FAIL remains",
    "Low-FPS clock, strict deterministic SaveLoad, Rift natural crash NOT_REPRODUCED and hardware pending remain"
  ],
  "next_steps": [
    "由escort-verified存活快照接續；補導航／返程觀測並驗證較長單護衛生存 / Continue living escort-verified save; add navigation/return observations and assess sustained escort survival",
    "地形Custom方案仍待確認 / Custom terrain proposal still pending"
  ]
}
```
