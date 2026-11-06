# 救援後英雄護衛城心

本輪使用者明確指定提問、進度、測試報告與交接一律使用臺灣正體中文，覆寫倉庫預設雙語文件規範；遊戲維持四語，識別符與原始日誌不改。

救援完成後，原「派英雄前往」的位置改顯示獨立 `type=button`「英雄護衛城心」。只在明確點擊時，暫選當下存活己方英雄，透過原生 `command('order:guard')` 與 `issueTacticalCommand` 指定原生 `pickAt` 確認的同一己方城心，再還原原有存活選取及待落點模式。成功提示只表示命令已下達。英雄沿原生尋路與護衛行為回防，其他軍民不改令；手動後令可接管，不自動重發。原 go DOM／邏輯保留；新局未完成救援時恢復原按鈕。

遊戲來源 `564a85a2a22e3754b1990f359962e96cef45468c`；前一功能來源 `40a352ce56aa29a13ab0003904a05eb3a3a62ac8`。獨立分支 `codex/riftwatch-hero-guard-71f3c9a2`，基線 `8c4933b3963df07f4306b10b2e5650a94e3558a0`。新模組 `js/hero-core-guard.js`、最小 main 安裝點與新四語 key。沒有修改 Game／expeditions／battleArmy／core-defense、AI、數值、碰撞、費用、資源、RNG、技能、波次；沒有自動回城、治療、傳送或復活。

設計分類為新便利性玩家控制，並非已確認程式缺陷。依據父端已封存自然 Director 的 `single_next_slice`；REVIEW.json SHA256 `b81ac66c5453e2b7d2eba2ffd765407a86a110521c6a2a2187835a6c5d74482c`，REVIEW.md `a1e96daa9ddea1fec720772986fa3dd8ebd13442412a00e282a29ea94f055d2a`，本輪 `sha256sum -c` 兩項通過。父端報告保存 commit `652ab0ed0c9f6a9f4ec6dadb7a73eea19c91bb71`。沒有補玩或改寫 C2 封存，沒有把第4波敗北變成勝利。

本輪 46 Node 通過；正式已 commit 構建 167 項資源 SHA256 全部通過。35 Chromium 檢查涵蓋原生 Start→派英雄→真實救援→明確點擊→原生行走／護衛，以及後令直控／右鍵、失效事件、四語、三種寬度與 Space／Enter／Tab。自然段只到準備期救援回防，沒有自然戰役或勝利宣稱；顯示矩陣與失效狀態明標受控夾具。詳 TestMatrix 與原始 JSON／錄影／截圖。

Ownership 新 task `HERO-CORE-GUARD-71F3C9A2`，agent `codex-hero-guard-71f3c9a2`，execution `codex-hero-guard-71f3c9a2-20261106`，root `/workspace/riftwatch-hero-guard-71f3c9a2/worktree`。正常 dry-run 後以預期282發布為 OWNED283，receipt `f43ca3aed5e1381d839e4ed421f179c809c75a1c`；未使用 prior-stopped，未接管 FUN273／RAM282。父端後來釋放 RAM 為全域284，並未改動本 task。最終釋放／推送 receipt 留在新 root 的樹外，避免遞迴文件雜湊。

未寫他人 Feed、main、RC、Pages、Om Issues／OpenCode 或公開部署。既有嚴格 Save/Load、低 FPS 時鐘、長期效能、十波與實體 GPU／硬體缺口全部保留。本輪原生存讀僅驗護衛狀態保留；未認證完整決定性。下一步由父任務評估此獨立切片與必要自然玩家回饋，完整列出原生輸入介面；不得補測 C2 或宣稱本次便利控制已提高勝率／樂趣。
