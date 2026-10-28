# Agent entry point

Read [preserved repository instructions](Agents.md), [shared rules](docs/handoff/SHARED-RULES.md), recovery and handoff before writing. This entry supplements, never replaces, Agents.md.

Playtest/monitor addendum: Candidate may contain explicitly labelled PLAYTEST-EXPERIMENTAL features under the user-authorized exception; never promote formal QA/Integration or hide failures. Exact deploy authorization is in docs/playtest/APPROVAL-PLAN.json and must be obtained before public hosting. After each accepted slice/push/material blocker/final response, publish a curated source-pinned progress event using the independent codex/riftwatch-v224-monitor tooling to codex/riftwatch-progress-feed. No hooks/daemon or private Cloud access are assumed; publishing feed must not recursively trigger itself or block unrelated gameplay work.


## 雙語文件 / Bilingual documentation

`BILINGUAL_DOCUMENTATION_REQUIRED = true`

新建或更新的人類可讀文件須以繁體中文在前、英文在後提供實質對等內容；機器格式、識別符、原始日誌與歷史證據不改名、不改結論。舊文件依 ACTIVE STRATEGY 第16節逐步遷移，不能只翻譯標題或為翻譯阻塞 GAME FIRST。

New or updated human-readable documentation must provide substantively equivalent Traditional Chinese followed by English. Preserve machine formats, identifiers, raw logs, and historical conclusions. Migrate existing documents incrementally under ACTIVE STRATEGY section16; headings alone do not suffice, and translation must not block GAME FIRST.
