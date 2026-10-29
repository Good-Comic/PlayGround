# Agent entry point

Read [preserved repository instructions](Agents.md), [shared rules](docs/handoff/SHARED-RULES.md), recovery and handoff before writing. This entry supplements, never replaces, Agents.md.

Playtest/monitor addendum: Candidate may contain explicitly labelled PLAYTEST-EXPERIMENTAL features under the user-authorized exception; never promote formal QA/Integration or hide failures. Exact deploy authorization is in docs/playtest/APPROVAL-PLAN.json and must be obtained before public hosting. After each accepted slice/push/material blocker/final response, publish a curated source-pinned progress event using the independent codex/riftwatch-v224-monitor tooling to codex/riftwatch-progress-feed. No hooks/daemon or private Cloud access are assumed; publishing feed must not recursively trigger itself or block unrelated gameplay work.


## 雙語文件 / Bilingual documentation

`BILINGUAL_DOCUMENTATION_REQUIRED = true`

新建或更新的人類可讀文件須以繁體中文在前、英文在後提供實質對等內容；機器格式、識別符、原始日誌與歷史證據不改名、不改結論。舊文件依 ACTIVE STRATEGY 第16節逐步遷移，不能只翻譯標題或為翻譯阻塞 GAME FIRST。

New or updated human-readable documentation must provide substantively equivalent Traditional Chinese followed by English. Preserve machine formats, identifiers, raw logs, and historical conclusions. Migrate existing documents incrementally under ACTIVE STRATEGY section16; headings alone do not suffice, and translation must not block GAME FIRST.

## 連續執行與停止紀錄 / Continuous execution and stop records

繁體中文：Commit、Push、Handoff、Feed 與完成一個或數個切片皆不是結束條件。每個安全保存點後核對剩餘授權任務、相依性、所有權與可用環境；沒有實際阻礙便直接接續，不等待「繼續」。不以經過 20／30 分鐘、未知額度百分比或預定切片數推斷平台限制。結束回覆前必須記錄 STOP_REASON、EXECUTION_DURATION（標明量測範圍，無資料則未知）、NEXT_AUTHORIZED_TASK、CHECKPOINT_SHA、AUTO_RESUME_AVAILABLE。仍有可執行任務而無可引用的真實限制卻主動結束，記為 AGENT_EARLY_STOP 並說明。tools/dev/execution_continuity.py 產生決策與稽核紀錄，但不會控制平台回合或自動啟動 Agent。

English: Commit, push, handoff, feed publication and completing one or several slices are not ending conditions. After each safety checkpoint, check remaining authorized tasks, dependencies, ownership and environment, then directly continue if unblocked without waiting for another continue prompt. Do not infer platform limits from 20/30 elapsed minutes, unknown quota percentages or a preset slice count. Before a final response, record STOP_REASON, EXECUTION_DURATION (including measurement scope; unknown when unavailable), NEXT_AUTHORIZED_TASK, CHECKPOINT_SHA and AUTO_RESUME_AVAILABLE. Voluntarily ending with executable work remaining and no citable actual constraint is AGENT_EARLY_STOP and requires an explanation. tools/dev/execution_continuity.py provides decisions/audits, not platform-turn control or automatic Agent dispatch.

繁體中文：310 分鐘排程必須有目前對話目標、有效設定及實際喚醒目前 Agent 的執行證據，才能宣稱可用；GitHub 監督／Feed 更新或舊對話送達不等於新 Agent 自動續跑。缺少排程介面時維持未驗證，不建立背景迴圈、額外服務或擅改 workflow。

English: Claim a working 310-minute schedule only with its current-conversation target, effective configuration and actual execution evidence waking the current Agent. GitHub supervision/feed updates or delivery through an older conversation do not prove current-Agent auto-resume. Without a scheduler interface, retain unverified status; do not create background loops, additional services or alter workflows.
