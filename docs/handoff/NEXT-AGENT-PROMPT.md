# 最新切片接續 / Latest slice continuation

繁體中文：PER戰象與MNG騎射文明外觀已完成，分別7 Node／12 Chromium及10 Node／13 Chromium通過，詳見當前ACTIVE-TASK、Handoff與docs/evidence/v240-elephant、v240-mng-horse-archer。不要重做已完成移轉、Atlas、水岸與英雄／Boss。先核對最新遠端及所有權，接續KOR巡防車等既有文明單位或正式事件音效。重複排程喚醒必須檢查目前執行是否仍在進行，不另啟相同分支寫入者；本輪已記錄RESUME_SKIPPED_ACTIVE_TASK。此訊息並不代表排程設定已切換；現況及未知百分比必須如實回報。

English: PER elephant and MNG horse-archer civilization appearance are complete with7Node/12Chromium and10Node/13Chromium passes. See current ACTIVE-TASK, Handoff and docs/evidence/v240-elephant/v240-mng-horse-archer. Do not redo migration, accepted atlases, shorelines or hero/Boss work. Query current remote and ownership, then continue existing civilization units such as KOR patrol cart or production-event audio. On duplicate wakes, check whether execution is already running and do not start another writer on the same branch; this turn recorded RESUME_SKIPPED_ACTIVE_TASK. Delivery does not prove scheduler rebinding; report actual status and unknown quota percentage honestly.

---

# 最新內容接續 / Latest content continuation

繁體中文：移轉、長矛／盾衛與水岸已完成，不重做。英雄、招募使及雙Boss新Atlas已完成；英雄施法、標記／護盾、真正Boss落點預警／傷害與原生移動閃避均已驗收。最新應用來源6fae8aa71f24acc3e0a695218f3fd05009afc771，相關18 Node、12技能Chromium及24整合Champion Chromium通過。優先查最新Git遠端與Ownership，再開發文明特定既有單位（例如PER戰象），不把自然戰役當內容前置。詳讀當前ACTIVE-TASK與Handoff，以下為仍適用的共用規則及歷史切片資訊。

English: Migration, spear/guard and shorelines are complete; do not redo them. New hero/recruiter/two-Boss atlases, hero casting, mark/shield feedback, actual Boss warning/damage and native movement escape are accepted. Latest application source6fae8aa71f24acc3e0a695218f3fd05009afc771 passes18related Node,12skillChromiumand24integratedChampionChromium checks. Query latest Git remote and ownership, then prioritize an existing civilization-specific unit such as the PER war elephant, without a natural-campaign prerequisite. Read current ACTIVE-TASK and Handoff; shared rules and historical slice information follow.

---

# 新主控接續指示 / New primary continuation instructions

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：先讀AGENTS.md、Agents.md、ACTIVE STRATEGY、最新ACTIVE-TASK／NEXT-TASKS、Recovery與Handoff，再查GitHub主分支codex/riftwatch-v240-game-first、Ownership與Progress Feed真實最新SHA。新主工作區/workspace/riftwatch-v240-takeover。codex-migration-20261029為正式新執行者；每切片重新確認Ownership，不以租約過期搶占。移轉已完成，後續正常自主GAME FIRST開發；先接特殊兵種／英雄視覺辨識的最小未完成切片，不重跑全美術流程或把自然十波當成內容前置。已通過長矛／盾衛22Node／14Chromium、水岸5Node／13Chromium的限定證據不重跑，除非有相關變更或新疑點。

English: Read AGENTS.md, Agents.md, ACTIVE STRATEGY, current ACTIVE-TASK/NEXT-TASKS, Recovery and Handoff, then query actual latest GitHub SHAs for development branch codex/riftwatch-v240-game-first, Ownership and Progress Feed. New primary workspace: /workspace/riftwatch-v240-takeover. codex-migration-20261029 is the formally authorized new executor; revalidate ownership before each slice, never take over on lease expiry. Migration is complete; continue autonomous GAME FIRST development with the smallest unfinished special-unit/hero visual identity slice. Do not rerun the whole art pipeline or gate content on natural ten waves. Reuse scoped spear/guard22Node/14Chromium and shoreline5Node/13Chromium evidence unless related changes or new concerns justify retesting.

繁體中文：原環境9a0f19e與未提交QA維持UNPUSHED_WORK_RECOVERY_PENDING，精確位置見ACTIVE-TASK，不阻塞主線。恢復先入獨立Recovery分支審核來源、Diff及相容性，不覆蓋新工作。自然Easy／Normal十波、自然NG+及歷史時鐘／存讀／性能／Rift／硬體缺口仍未通過；原13項測試不是新環境證據。可正常Commit／Push及建內部Build，不修改main、Force Push、Checkpoints、歷史Issue、Pages或公開發布。無排程管理工具，不宣稱310分鐘排程切換或背景自動執行。正常保存後若仍有執行預算，繼續下一切片。

English: Original9a0f19eanduncommittedQA remain UNPUSHED_WORK_RECOVERY_PENDING at the exact locations in ACTIVE-TASK, without blocking the main development line. Review recovered source, diff and compatibility on an independent Recovery branch before integration; never overwrite new work. NaturalEasy/Normalten waves,naturalNG+andhistoricalclock/save/performance/Rift/hardwaregapsremainunpassed;old13testsarenotnew-environmentevidence. Normalcommit/pushandinternalbuildsareauthorized;donotchangemain,forcepush,checkpoints,historicalissues,Pagesorpublicrelease. Noschedulermanagementtool:donotclaimschedulerrebindingorautomaticbackgroundexecution. Continuetothenextsliceaftersavingwhenexecutionbudgetremains.
