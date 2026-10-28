# Shared Agent Development Rules

Read root AGENTS.md and preserved Agents.md, Strategy v2.2 plus docs/handoff/STRATEGY-V2.2.1-V2.2.2.md, latest recovery manifest, ACTIVE-TASK/NEXT-TASKS, related GDD and actual diffs/evidence before writing. Git and current remote refs prevail over stale summaries. No credentials in any handoff, logs or commits.

Only one confirmed writer per branch. Ownership lives in the dedicated codex/riftwatch-task-ownership branch, ownership.json. Use agent_handoff.py ownership dry-run first, then explicit --publish with expected global version. Normal fast-forward publication is the distributed CAS: a racing writer is rejected. Claim is effective only after verified remote publication; local JSON is not ownership. Revalidate before each writing slice. Another owner must be confirmed stopped or use an independent branch/task. Expiration is never automatic takeover. Do not invent account/quota status. External API/CLI execution requires approved resources/cost limits; current dispatch is manual plan only.

At long-task start/resume, post-commit, post-push, pre/post-important merge, slice completion and final checkpoint run tools/dev/worktree_recovery.py with matching --trigger. Run diff --check, focused tests, ordinary commit, ordinary branch push, exact ls-remote verification, then update recovery/handoff. tools/dev/checkpoint.py automates commit/push snapshots with explicit --stage/--message/--push. No auto staging/commit/push by collector or packer. Use immutable snapshot copies after verification when needed.

Snapshot documents describe observed commits BEFORE their own publication. Publish a bounded snapshot commit; do not keep committing the snapshot's own commit hash. The final generated working snapshot can remain explicitly uncommitted, with a separately committed immutable snapshot recording the last verified application commits. Preserve its remote publication SHA in task output or a receipt outside the tracked snapshot. LOCAL_INVENTORIED is never REMOTE_SAVED. Report dirty/unpushed and local-only evidence honestly.

No main changes, force push, checkpoint overwrite, new OmGitHub/OpenCode workflow/Issue, old #17 Preview update or public release without new authorization. Gameplay integration only after feature-specific gates. Do not drop collisions, AI, units, Boss mechanics, quality or historical FAIL to get green results. Reuse valid completed tests; group by actual source/tool versions. Heavy perf runs serially. Cloud SwiftShader is not physical GPU verification. Fixed-step prototype is not production. HARDWARE_TEST_PENDING without physical data; BENCHMARK_REFERENCE/INSUFFICIENT_DATA without matched calibration. BEFORE_LIVE/AFTER_LOCAL/AFTER_DEPLOY_LIVE remain distinct; deployment is blocked until separately authorized.

Specs: Issue8/11 recovered GDD sections and SOURCES hashes; full package remains incomplete. SPEC_DECISION_REQUIRED for unsupported balance rules; continue independent deterministic fixes. Preserve all Strategy v2.2 requirements and existing matrix. No500/1000 blanket development block. Each safe slice gets tests, actual gameplay where applicable, evidence, commit/push and precise next step. Stop only the conflicting or unauthorized operation, not unrelated work.

Final snapshot publishing: use publish_recovery_index.py --out a-fresh-outside-tree-directory (local-only by default). Explicit --publish requires confirmed codex/riftwatch-recovery-index ownership. Verify index HEAD; this immutable index can reference final clean application commits without recursively committing its own HEAD. On fresh feature-only clones, bootstrap these shared instructions from the verified Gameplay Integration ref before editing older feature branches.


## 雙語文件 / Bilingual documentation

`BILINGUAL_DOCUMENTATION_REQUIRED = true`

新建或更新的人類可讀文件須以繁體中文在前、英文在後提供實質對等內容；機器格式、識別符、原始日誌與歷史證據不改名、不改結論。舊文件依 ACTIVE STRATEGY 第16節逐步遷移，不能只翻譯標題或為翻譯阻塞 GAME FIRST。

New or updated human-readable documentation must provide substantively equivalent Traditional Chinese followed by English. Preserve machine formats, identifiers, raw logs, and historical conclusions. Migrate existing documents incrementally under ACTIVE STRATEGY section16; headings alone do not suffice, and translation must not block GAME FIRST.
