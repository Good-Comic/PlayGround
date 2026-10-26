指定套件已推送至獨立發布分支，但 **Pages 尚未啟用，線上遊戲驗收仍為 BLOCKED**。

目前需要兩項 UI 操作：

1. [GitHub Settings → Pages](https://github.com/Good-Comic/PlayGround/settings/pages)：選擇 **Deploy from a branch → `codex/riftwatch-playtest-site` → `/(root)` → Save**。啟用 API 回傳403 `Resource not accessible by integration`，最後查詢仍為404。
2. Codex UI 允許精確網域 `good-comic.github.io`。首次 CONNECT 回傳 Envoy403；未重試或繞過。

預計網址：`https://good-comic.github.io/PlayGround/`，**目前尚未發布／驗證**。

已保存版本：

- Build：`d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c`；兩個 ZIP 與28個資源重新核對通過。
- 發布分支 Commit：`6c98a8e6b7f7759ca57a9c9f94f675e2b6070381`，逐檔與核准套件相同。
- 開發交付分支 `codex/riftwatch-v226-delivery`：`ee0d219a916d8388fab5d66ff86e3bd650aa66af`。

其他交付：

- **Feed**：raw HTTP與GitHub Contents API各四檔實讀成功，保留原503證據；新增固定SHA讀取、API備援及標準事件。39項定向工具／Recovery測試通過。[證據](https://github.com/Good-Comic/PlayGround/tree/ee0d219a916d8388fab5d66ff86e3bd650aa66af/docs/evidence/v226-monitor)
- **OmGitHub**：已確認分支metadata、Resume覆寫來源SHA，以及checkpoint的force-with-lease限制；保存[隔離接續方案](https://github.com/Good-Comic/PlayGround/blob/ee0d219a916d8388fab5d66ff86e3bd650aa66af/docs/omgithub/CONTINUITY-V226.md)。新Issue／OpenCode執行仍須另外授權並先解決安全衝突。
- **Supervisor／Dispatcher**：交接欄位缺項曾被打包器拒絕，已修復並保留失敗；待審交換資料已建立，實際本地計畫及去重流程通過；仍為 `REVIEW_PENDING`、`DISPATCH_NOT_CONNECTED`，未執行Gemini或偽造審查通過。
- [Progress Feed](https://github.com/Good-Comic/PlayGround/tree/codex/riftwatch-progress-feed/docs/monitor)、[Recovery／Handoff索引](https://github.com/Good-Comic/PlayGround/tree/codex/riftwatch-recovery-index/docs) 已保存接續狀態。

本輪沒有線上遊戲截圖或玩法PASS；歷史性能FAIL與硬體待驗狀態保留。main、Integration、既有Candidate、#17及Checkpoints未改動。UI兩項設定完成後，下一步是指定D6版本的真實公開瀏覽器驗收，不需要重新取得同一發布授權。
