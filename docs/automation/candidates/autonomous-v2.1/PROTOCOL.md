# Riftwatch 自動續作與開發協議 v2.1 整合正式候選

狀態：**已授權內容的單一候選規範**。僅保存於獨立分支的本候選路徑，不替換正式 Strategy、AGENTS、其他 Owner 文件或線上排程。本文件不是公開發布或重大平衡變更授權。

## 1. 授權來源與優先順序

整合使用者於本對話正式授權的：

1. Universal Autonomous Resume & Multi-Agent Development Protocol v2.0：安全、Ownership、恢復、交付及轉送基礎。
2. Token-Efficient GAME FIRST Development Override v2.1：工作資源與精準驗證策略。
3. GAME FIRST Development Agent Role Revision：開發主力／玩家輔助的最新職責修訂。
4. 本次「自動續作協議同步補充」：建立本候選規範並續作 C-36 診斷。

衝突順序：最新使用者正式指令 ＞ 最新職責修訂 ＞ v2.1 覆寫 ＞ v2.0 基礎；其下依已確認生效 Strategy、正式 GDD、程式與證據、Recovery／Handoff。文件存在不代表已批准。每次恢復都取最新有效來源，不固定舊 Strategy、SHA、Ownership 版本或分支。

**GAME FIRST · FUN FIRST · DEVELOPMENT FIRST · TOKEN EFFICIENCY · EVIDENCE FIRST**

所有詢問、進度、分析與交接採臺灣正體中文；識別符、路徑、SHA原樣保留；正式遊戲維持繁中、簡中、English、日本語。

## 2. 開發主力與資源分配

- Gameplay Developer 是主要執行者，實作玩法、戰鬥、文明、兵種、卡牌、探索、操作、美術、音效與效能改善。
- AI Player A／B／C 是隔離的高階、一般、新手診斷工具，僅必要時使用，不作每次喚醒預設工作。
- Game Director 優先讀結構化摘要與關鍵證據，評估價值、GDD相容、策略深度與風險。
- QA Automation 優先用 Node、Playwright、現有腳本完成可重複驗證。

規劃約65%實際開發、20%精準測試、10%方向分析、5%交接管理；不是硬性比例，也不免除安全與高風險回歸。單人足以完成就不額外建立角色；互不衝突工作可在合法 Ownership 與資源下並行。

衡量玩家可感受的改善價值與開發／驗證資源，不以PASS、Commit、報告長度或AI通關率作績效。整合、修復、移除無效複雜度、效能優化及重大失敗診斷都屬有效成果。

## 3. 每次喚醒的狀態核對

先核對最新遠端HEAD與繼承鏈、有效Strategy、GDD／需求矩陣、Recovery／Handoff／NEXT-TASKS、Ownership／租約／心跳／執行收據、玩家回饋、完成與失敗證據，以及其他Agent範圍。先回答：「目前能用最少必要分析與測試，完成哪一項最高價值遊戲改善？」

狀態處理：

- INTERRUPTED／PAUSED_QUOTA：確認原身分及Checkpoint有效才恢復，不無條件重認領。
- IN_PROGRESS：查實執行，不重複啟動。
- BLOCKED：核對是否解除；僅阻擋衝突操作，仍可進行其他已授權獨立工作。
- TASK_COMPLETED：核對實作、證據、完整SHA與限制後，從正式NEXT-TASKS選下一項。
- UNCERTAIN：遠端、身分或租約無法確認時保留不確定，不推測停止或成功。
- NO_PENDING_TASK：沒有適當授權工作就結束，不製造時間戳或重複Commit。

Ownership不能只靠OWNED、任務名、提交時間或環境中斷判斷。核對Task／Execution、合法身分、租約與可取得心跳、遠端認領／釋放收據、Worktree／分支衝突、原實例能否合法恢復。有效同範圍執行就略過；無法確認不得冒用、搶占或擅自釋放。獨立不衝突任務依既有Dry Run→版本條件CAS→正常Push→遠端確認流程認領，不使用未證實prior-stopped。

## 4. 開發優先級與閉環

依最新Strategy、玩家影響、風險與相依動態排序：崩潰／Softlock／資料損壞；真人與AI共同高影響問題；戰鬥手感、回防、接敵與英雄；經濟與總管；自然十波／Boss／重玩；文明、恩賜、正式科技與探索；美術音效；效能、迷霧、尋路、存檔；既有系統整合。嚴重效能或存檔問題立即提高優先，不固定排末。

流程：既有玩家觀察→核對證據→必要Director判斷→確認GDD／授權→最小修正→定向驗證→必要玩家複測→前後比較→正常交付。

- A 已確認程式缺陷：合法範圍內修復。
- B 已批准玩法／操作改善：評估風險與相依後實作。
- C 未批准核心設計／平衡：只提方案，標SPEC_DECISION_REQUIRED。

不為勝利增加資源、削弱Boss、跳過規則或直接改傷害／尋路。不得建立重複系統、犧牲既有操作，或無限增加按鈕與提示。

## 5. 玩家診斷與低成本驗證

優先重用封存報告、原生存檔、最小失敗重現、Node與少量Chromium。同版本同條件同問題已有充分證據，禁止只為增加資料而重跑。

只在重大玩法／戰鬥經濟改動、重要里程碑、需要能力差異驗證，或現有資料不足判斷重要問題時，安排較長三角色自然場。各角色有不同知識、反應與操作能力，不互通情報；使用實際Chromium、合法滑鼠鍵盤與HUD，提供完整相同控制說明，不把測試器缺漏當玩家失誤。

逐段記錄 `INTENT → COMMAND_SENT → COMMAND_ACCEPTED → EXECUTED → EFFECT_OBSERVED`。送出不等接受、抵達不等命中、掉血不等玩家造成、擊殺不等整場反事實減傷。趣味評價是AI意見，不是人體感受或真人留存。

按改動選必要Node、Chromium、截圖／錄影、正式構建與SHA-256、四語／視口、Save／Load／RNG／NG+、自然戰役、P50／P95／FPS／記憶體／長期觀察。明列PASS、FAIL、INCONCLUSIVE、NOT_TESTED、SPEC_DECISION_REQUIRED；受控、原生存檔續玩、全新自然與真人分開。局部Node不是整體認證，SwiftShader不是Windows實體GPU。

可程序比較就不用AI逐項判讀；只讀當前相關程式／GDD／報告。保留原始FAIL，不放寬標準、不偽造因果；中斷玩家保留輸入、最後狀態與未封存限制，不補寫未知報告。

## 6. 當前 Fun Lab V2 續作規則

核對FUN-LAB-V2-8E41D6B2實際Ownership與Checkpoint；B／C封存不重跑。A若仍未完成且能合法恢復，只完成剩餘部分；已完成就引用，不再重新安排。必要資料後由Director用既有三角色提出高價值問題。

C-36優先用原存檔、原地圖與事件，區分路徑、碰撞、射程、冷卻、遮擋與正式規則；先確認哪些單位真正命中。已確認程式錯誤才修，合理但不易懂則改善操作／戰術回饋。不把新的獨立缺陷宣稱為整個衝車案例根因，不以刪碰撞或改數值取得PASS。

## 7. 額度、環境與安全停止

正式介面可讀剩餘額度時，≤10%避免大型長任務、≤3%先保存停止；不可讀則QUOTA_PERCENT_UNKNOWN，不猜比例、重置或恢復時間。先確認環境可用。真實額度／環境／網路錯誤時保存已有資料與合法Checkpoint、標明完成與未完、保留FAIL、不高頻重試、核實Push，不承諾不存在的背景工作。

完成安全點不是自動停止理由；仍有合法可執行工作就接續。需要新決策、無法安全確認Ownership或實際平台限制時，記具體原因；沒有工作不製造Commit。停止記STOP_REASON、EXECUTION_DURATION及範圍、CHECKPOINT_SHA、NEXT_AUTHORIZED_TASK、AUTO_RESUME_AVAILABLE。

## 8. Git、恢復與媒體

每片核Worktree／範圍→必要驗證與證據→合法分支Commit→正常Push→核完整遠端SHA→更新並提交Recovery／Handoff→再核最後交接SHA→有授權才更新Feed→正式釋放或交接。未完成用WIP，不標正式驗收。使用專案恢復工具與精確來源，避免遞迴刷新自己的提交SHA。

大型影片依批准附件／儲存策略，不無限加進Git歷史；無通道保留原檔／SHA並明列本機限定，不把工作區路徑當公開下載。少量關鍵PNG與原始文字證據正常保存，不刪歷史或重寫Git。不得只為刷新時間戳／排程成功宣告建立Commit。

## 9. 永久邊界

未另有明確正式授權，不改main、Pages、公開部署、既有RC／Immutable Playtest Build、OpenCode Checkpoints、受保護OmGitHub Issues（含#17）；不Force Push、不啟動未授權付費API／外部服務、不觸發未授權OpenCode；不覆蓋其他Owner、不自批科技／卡牌／文明平衡／探索獎勵上限，不刪改原始失敗求綠。

## 10. 狀態與簡潔回報

分開記錄：DELIVERY_SUCCEEDED／DELIVERY_FAILED、SCHEDULED_RESUME_EXECUTED、RESUME_SKIPPED_ACTIVE_TASK、RESUME_BLOCKED_QUOTA／ENVIRONMENT／APPROVAL／OWNERSHIP、NO_PENDING_TASK。訊息送達、啟動、修改、測試、遠端保存不是同一狀態。

每輪簡述：實際狀態；遊戲改善或重大診斷及玩家差異；必要驗證與限制；最新完整SHA／分支；Ownership；未解FAIL／決策；單一最高價值合法下一步。只有檢查／保存就照實說，不能宣稱開發完成。

## 11. 外部排程與轉送

指定Good-Comic/PlayGround，接收對話PlayGround-V4，host `durable`，thread `01a19d70-b0ba-7088-beaa-7c0d154e3005`。只用平台正式對話傳訊工具轉送完整有效規範；短訊僅限能確認接收端可靠取得完整整合內容。不得仍只送v2.0而宣稱v2.1已改綁。

每次正式介面允許時可嘗試一次；失敗留真錯誤、不無限重試；轉送成功不等接收端已開發。未提供正式scheduler／對話工具，不建立替代輪詢、背景服務或工作流，不假冒發送／改綁。保留原頻率與指定目標，不建立重複排程，不擅自重啟已暫停監督。

**轉送來源尚未更新：目前未取得排程端已更新至本整合候選的可驗證收據。** 對話已收到授權不等排程設定已改；實際在線狀態維持未驗證，待正式工具與設定收據核對後另記，不以本文件保存冒稱線上成功。

## 12. 本候選的採用與限制

本次僅確認使用者授權內容並保存候選，不自動取代受保護正式Strategy或其他Owner入口。後續合法執行者可由本候選一次讀取有效整合要求；正式入口／排程更新仍須對應權限與實際驗收。以有效Strategy決定方向、合法Ownership決定執行者、真實遊玩證據決定問題、遠端Checkpoint決定續作起點。
