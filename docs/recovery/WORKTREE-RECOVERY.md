# 排程政策安全點 / Scheduler policy checkpoint

繁體中文：已核對遠端 `46c4c3cbf6d30b3649b8b830a0eaa2a6d01f9509`，修正版 Prompt 與政策已在 GitHub 保存，雜湊已與 Git blob 核對；不是線上排程保存。狀態 PREPARED_NOT_APPLIED_TO_SCHEDULER，沒有排程讀寫介面；每小時任務依使用者報告維持暫停，未啟用／重建／增加輪詢。送達、防重複、閒置恢復分別列於 docs/automation/scheduler-status.json。遊戲程式／素材未改，8 項定向 Python 通過；不重跑歷史 Chromium。遊戲接續仍為 JPN／SPA 音效與狀態回饋。以下為前一遊戲切片紀錄，不代表本輪重新驗收。

English: Remote `46c4c3cbf6d30b3649b8b830a0eaa2a6d01f9509` is verified; replacement prompt/policy are GitHub-saved with matching Git-blob hash, not saved to the online scheduler. Status is PREPARED_NOT_APPLIED_TO_SCHEDULER without a scheduler read/write interface. Hourly supervision remains paused per user report; no enabling/recreation/polling was performed. Delivery/deduplication/idle recovery have separate states in docs/automation/scheduler-status.json. Game code/assets are unchanged; eight focused Python checks pass without repeating historical Chromium. Gameplay continuation remains JPN/SPA sound/status feedback. Prior game-slice records below are not fresh acceptance.

---

# 最新內容切片 / Latest content slice

繁體中文：FRK 披掛騎槍輕騎已完成原生訓練、戰鬥動畫與性能限定驗收。來源 `8774db51cafa8bdcdbc1fead7f82188070f3d050`，證據 `1d42dbf1f346a1ae1345aa2287f1ba6eca7e55b3`，11 Node／13 Chromium PASS。詳見 docs/evidence/v240-frk-cavalry/REPORT.md。接續 JPN 格擋與 SPA 暈擊的獨立音效／狀態視覺回饋，沿用既有冷卻與數值，先核對最新遠端與所有權。既有恢復已完成，不重做；歷史自然戰役、嚴格 Save/Load、低 FPS、性能及硬體缺口保留，未公開發布，排程切換未確認。

English: FRK caparison/lance cavalry accepted for native training, combat animation and scoped drawing performance. Source `8774db51cafa8bdcdbc1fead7f82188070f3d050`, evidence `1d42dbf1f346a1ae1345aa2287f1ba6eca7e55b3`, 11 Node/13 Chromium PASS. See docs/evidence/v240-frk-cavalry/REPORT.md. Continue distinct JPN block and SPA stun sound/status feedback without changing cooldowns or values, after checking latest remote and ownership. Recovery is complete and must not be repeated; historical natural campaign, strict Save/Load, low-FPS, performance and hardware gaps remain. Nothing publicly deployed; scheduler rebinding unconfirmed.

---

BILINGUAL_DOCUMENTATION_REQUIRED = true
