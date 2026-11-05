# 獨立證據恢復交接

目前遊戲來源為 `6852cf85acca5c08923e0191a1e0703189f4d3e6`，分支 `codex/riftwatch-fun-lab-281169b5`，已正常推送並核對完整遠端 SHA。正式遊戲已包含八個控制、資訊與生產診斷改善；本次不重做既有沙暴、PixelFX、真人修復或雙欄恩賜功能。

本任務為 `FUN-EVIDENCE-051216A4`，Execution `codex-fun-evidence-051216a4-20261105`，獨立分支 `codex/riftwatch-fun-evidence-051216a4`。取得權限時已經過 expected version 273 的 Dry Run 與正常 fast-forward 發布，Ownership version 274／收據 `975b10bff76294812e827f49b272c523e6ae378e`。這是專案級自聲明身分，不是平台對原 Owner 的延續認證。

**恢復與原 Owner 邊界**

環境重啟後，原角色上下文與原玩家 A 報告封存中斷，無法據此確認原遊戲 Owner 已停止。原 `FUN-LAB-281169B5` 仍為 OWNED／revision 273，原 Execution `codex-fun-lab-281169b5-20261105` 沒有被替換，也沒有使用 `--prior-stopped`。原工作樹七個已修改文件及五個未追蹤路徑仍保留；其 407 檔原樣快照已另行雜湊保存。

本次只寫自己的證據路徑與 `tools/qa/fun-evidence-051216a4/`。原最新 A 對局完整遊戲結束但原角色報告未封存，新復核者的報告清楚標示 `UNSEALED_ORIGINAL_REPORT`。公開紀錄可以證明成本摘要、後續經濟操作、完整明細、儲存與敗北；不能補造原玩家滿意度、勝率或決策因果。

**已完成與剩餘**

新生產介面有效證據為 Node 64／64、正式資源 163／163、Chromium 32／32。結算輸入與來源操作有效證據保留在其實測來源：Node 213／213、Chromium 19＋38＋29。新測試工具修正另有 Chromium 14／14 與選單完整輸入管線驗證。詳見[測試矩陣](TEST-MATRIX.md)，不可把不同來源或重疊回歸加總成一輪全新驗收。

主要遊戲改善已提交，整體樂趣與通關改善仍未證明。AI 玩家仍在第 4／5 波敗北；最近自然續玩採原封觀察快照，不是每次重新自然十波。200 單位短測受 SwiftShader 限制約 13 FPS；初次 P95 警訊、歷史 strict RNG Restore FAIL、自然 NG+ 未測、真人樂趣與實體 GPU 未測全部保留。

**下一個合法接續點**

1. 先讀最新遠端 Ownership、本交接、Strategy、GDD 及實際工作樹。此次發布後若本證據任務已 RELEASED，不自動沿用其身分。
2. 原遊戲 Owner 的合法交接或停止仍需證據；不得因同一聊天、時間經過或環境重啟直接接管其分支及未提交文件。可由原 Owner 整合本分支報告，或依協議選取確實不衝突的獨立工作。
3. 下次自然玩家驗證應採新的穩定控制器，在輸入後核對畫面與意圖；原 @數字 記錄保留原樣。新玩家不能冒稱為恢復出原 A 的主觀報告。
4. 優先驗證生產阻塞資訊是否幫助玩家完成實際資源調整與恢復生產，再根據公開遊玩證據選擇下一個改善；不要直接改費用或難度來取得勝利。

第一份證據提交 `4d364f779a91230df16f4a3935c146861ba335db` 已正常推送並完整核對遠端，見 [推送收據](PUBLICATION-RECEIPT.json)。新證據分支包含本收據的最終完整 SHA 由最後推送後獨立收據及最終回報提供。本次快照描述發布自身前的已知提交，不為填入自己的 SHA 持續新增文件提交。`pre-save-recovery` 對新分支列出的祖先提交未推送，只表示該新分支當時尚不存在；遊戲來源 685 的原分支已遠端保存，兩者須分開解讀。

**停止與自動恢復紀錄**

本獨立恢復及測試工具切片以驗證、正常提交、正常推送與遠端 SHA 核對為完成條件；原遊戲任務尚未被宣告完成。安全保存後，原遊戲分支寫入資格仍受未確認交接限制。`STOP_REASON=COMPLETED_INDEPENDENT_RECOVERY_GAMEPLAY_OWNER_HANDOFF_UNCONFIRMED`；執行起點、量測範圍與最新牆鐘長度見 [RECOVERY.json](RECOVERY.json)，不是原任務的主動工時。

`NEXT_AUTHORIZED_TASK=核實原遊戲 Owner 交接，採穩定控制映射繼續生產阻塞與戰鬥控制的自然玩家驗證`；`GAME_CHECKPOINT_SHA=6852cf85acca5c08923e0191a1e0703189f4d3e6` 為遊戲來源，`CHECKPOINT_SHA=4d364f779a91230df16f4a3935c146861ba335db` 是本快照已核對的遠端證據提交；包含本段的自身提交另由收據給出。`AUTO_RESUME_AVAILABLE=false`、`QUOTA_PERCENT_UNKNOWN`。排程送達時已有本任務在執行，記錄 `RESUME_SKIPPED_ACTIVE_TASK`；沒有建立重複任務、改頻率或宣稱閒置自動喚醒已驗證。

未修改其他 Owner 的 Progress Feed、main、RC、公開部署、Pages、舊 OmGitHub Issues、OpenCode Checkpoints 或 Immutable Playtest Build；未建立公開 Release。容量稽核只讀，暫存 Git pack 未清理。
