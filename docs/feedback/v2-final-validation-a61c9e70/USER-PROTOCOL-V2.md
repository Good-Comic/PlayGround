# Riftwatch — Universal Autonomous Resume & Multi-Agent Development Protocol v2.0

## 通用自動喚醒、斷點恢復、玩家測試與持續開發協議

【使用者正式授權｜取代舊版 Universal Autonomous Resume Protocol】

專案：《世紀帝國二：裂境守望》（Age of Empires II: Riftwatch）

Repository：`Good-Comic/PlayGround`

最高目標：

**持續接續最新已授權的遊戲開發工作，結合三層級 AI 玩家測試、Game Director 評估及實際遊玩驗證，持續提升 Riftwatch 的趣味性、戰術深度、操作體驗、效能與完整戰役品質。**

核心原則：

**GAME FIRST · PLAYER FUN FIRST · EVIDENCE FIRST · SAFE RESUME**

本協議持續適用於後續版本，不綁定固定 Strategy 版本、Commit SHA、Ownership 版本或開發分支。

所有詢問、進度更新、測試分析及交接報告，一律使用**臺灣正體中文**。程式識別符、路徑及 SHA 保留原文；正式遊戲維持原有四語支援。

## P0 — 排程轉送與實際開發分離

外部排程僅負責將喚醒指令送達指定對話，不代表已完成開發。

每次觸發需區分：

- `DELIVERY_SUCCEEDED`：訊息已成功送達。
- `DELIVERY_FAILED`：轉送失敗。
- `SCHEDULED_RESUME_EXECUTED`：接收端確實恢復並執行工作。
- `RESUME_SKIPPED_ACTIVE_TASK`：偵測到同範圍有效任務。
- `RESUME_BLOCKED_QUOTA`：額度不足。
- `RESUME_BLOCKED_ENVIRONMENT`：環境不可用。
- `RESUME_BLOCKED_APPROVAL`：需要額外授權。
- `RESUME_BLOCKED_OWNERSHIP`：所有權無法安全確認。
- `NO_PENDING_TASK`：沒有已授權待執行工作。

不得將訊息送達、Agent 啟動、程式修改、測試通過與遠端交付混為同一狀態。

若平台限制訊息傳送或執行，記錄實際結果，不宣稱已成功喚醒。

## P1 — 最新狀態與有效指令

每次喚醒先取得並核對：

1. 最新遠端 Git HEAD、分支及有效繼承鏈。
2. 目前生效且已授權的 Strategy。
3. GDD 與正式需求矩陣。
4. Recovery Manifest、Handoff、NEXT-TASKS。
5. 最新 Task Ownership、租約、執行收據及實際執行狀態。
6. Player Feedback、Human Playtest 及 Multi-Agent Fun Lab 報告。
7. 已完成、失敗及尚未驗證的測試證據。
8. 其他 Agent 的有效工作範圍。

指令優先順序：

使用者最新正式授權 ＞ 已確認生效 Strategy ＞ 正式 GDD ＞ 實際程式與測試證據 ＞ Recovery／Handoff。

文件存在不代表內容已獲批准；舊檔不得自動覆蓋新決策。

## P2 — Ownership 與防重複

不得僅憑 `OWNED`、任務名稱、最後提交時間或雲端環境中斷，判定原 Agent 一定正在執行或已停止。

必須檢查：

- Task ID 與 Execution ID。
- 原執行者的合法身分。
- 租約有效性及可取得的心跳。
- 遠端認領與釋放收據。
- 分支／Worktree 是否衝突。
- 恢復協議是否允許原執行實例接續。

如果有效任務正在執行，記錄 `RESUME_SKIPPED_ACTIVE_TASK`，不再啟動同範圍工作。

如果租約或原執行身分無法確認，不得冒用、搶占或擅自釋放舊 Owner。

可以在正式授權範圍內另行認領互不衝突的工作；否則記錄 `RESUME_BLOCKED_OWNERSHIP` 並安全停止。

新任務一律依專案既有 CAS／Ownership 規則合法認領。

## P3 — 恢復狀態判斷

依實際狀態選擇：

**INTERRUPTED／PAUSED_QUOTA**

確認原身分及 Checkpoint 有效後恢復；不得無條件重新認領。

**BLOCKED**

檢查阻塞是否解除。需要額外決策時，保留原任務並考慮不衝突的已授權工作。

**TASK_COMPLETED**

核對程式、證據、SHA、Handoff 與驗收限制，從正式 NEXT-TASKS 選擇下一項工作。

**IN_PROGRESS**

確認正在執行的工作，避免重複啟動。

**NO_PENDING_TASK**

沒有適當工作時安全結束，不製造無意義 Commit。

**UNCERTAIN**

若遠端、租約或執行身分無法驗證，保留狀態，不推測成功或失敗。

## P4 — GAME FIRST 開發優先級

依最新有效 Strategy、玩家回饋、風險及功能依賴動態排序。

一般優先順序：

1. 崩潰、Softlock、重大操作錯誤及資料損壞。
2. 真人玩家與三層級 AI 玩家共同重現的高影響問題。
3. 核心戰鬥手感、回防、索敵、英雄與有效戰術決策。
4. 經濟、建造、軍事生產、總管與資源配置。
5. 自然十波、Boss、完整戰役及重玩價值。
6. 文明特色、恩賜構築、已批准科技與探索玩法。
7. 2D／2.5D／3D 美術、動畫、音效及視覺回饋。
8. 效能、迷霧、尋路、Save／Load 及長期穩定性。
9. 已完成系統的整合、精簡與使用便利性。

效能、存檔或其他穩定性問題若嚴重影響遊戲，應立即提高優先級，不必固定排在最後。

**新增功能不是唯一的進展。修復、整合、移除無效複雜度、優化效能及查明失敗原因，同樣是有價值的開發成果。**

## P5 — Multi-Agent Player Fun Lab

在已具備合法環境與執行資源時，持續維護三種隔離 AI 玩家：

- Agent A：高階策略玩家。
- Agent B：一般休閒玩家。
- Agent C：低熟練新手玩家。

由 Game Director 負責獨立分析與改善優先級。

三個角色應有不同的知識、反應、操作頻率與策略能力，不得直接共享彼此的玩家情報。

測試採用實際 Chromium、合法滑鼠／鍵盤與現有遊戲 HUD。

優先評估：

- 能否理解當前目標。
- 能否找到必要操作。
- 發出的命令是否真正被接受。
- 是否正確執行並產生戰術效果。
- 是否理解失敗原因。
- 文明與卡牌是否形成不同玩法。
- 有無無意義等待、重複操作或挫折。

玩家測試回報必須區分：

`INTENT → COMMAND_SENT → COMMAND_ACCEPTED → EXECUTED → EFFECT_OBSERVED`

Agent 的趣味評價屬模擬玩家意見，不得冒稱真人主觀感受。

每輪優先分析已封存的有效結果，避免為了取得更多數據而反覆重跑相同場景。

## P6 — 改善決策與開發閉環

每輪依下列程序處理最高價值的問題：

玩家觀察 → 證據核對 → Game Director 評估 → 確認 GDD 與授權 → 最小可驗證修正 → 定向測試 → 玩家重新測試 → 前後比較 → Commit／Push／Handoff。

改善項目分類：

**A：已確認程式缺陷**

在合法範圍內直接修復。

**B：已批准玩法與操作改善**

經風險及功能依賴評估後，可進行實作。

**C：未批准的核心設計或平衡**

僅提出方案，標記 `SPEC_DECISION_REQUIRED`，等待使用者批准。

不要只因通關率上升，就認定遊戲更有趣；也不要為了取得 PASS 而增加資源、削弱 Boss 或跳過正式規則。

## P7 — 測試與品質門檻

依修改內容選擇必要測試：

- Node 定向回歸。
- 真實 Chromium 操作。
- 遊戲內截圖／錄影。
- 正式構建與資源 SHA-256。
- 四語與視窗尺寸。
- Save／Load、RNG、NG+。
- 自然戰役。
- 性能 P50／P95、FPS、記憶體與長時間觀察。

明確區分：

`PASS / FAIL / INCONCLUSIVE / NOT_TESTED / SPEC_DECISION_REQUIRED`

受控場景、自然存檔續玩、全新自然開局與真人遊玩必須分開記錄。

不得把局部 Node PASS 當作完整遊戲認證。

不得把雲端 SwiftShader 結果視為 Windows 實體 GPU 性能。

若測試 Agent 遇到額度中斷，保留原始輸入、最後狀態與未封存限制，不補造玩家回報。

## P8 — 執行額度與環境保護

若正式介面能查到剩餘額度：

- ≤10%：避免啟動大型長時間任務。
- ≤3%：優先保存與安全停止。

無法查到則記錄：

`QUOTA_PERCENT_UNKNOWN`

不可猜測百分比、重置時間或恢復時刻。

環境中斷時：

1. 保存現有資料與合法 Checkpoint。
2. 記錄已完成與未完成內容。
3. 保留原始 FAIL 及中斷證據。
4. 不高頻重試。
5. 確認遠端 Push 是否真的成功。
6. 按正式機制等待下一次喚醒。

不得承諾不存在的背景持續執行。

## P9 — Commit、Push、Recovery 與證據

每個有效切片完成後：

1. 核對 Worktree 與修改範圍。
2. 執行必要測試。
3. 更新必要的測試證據。
4. Commit 至合法分支。
5. 正常 Push。
6. 核實遠端完整 SHA。
7. 更新並提交 Recovery／Handoff。
8. 對最後的交接提交再次核實遠端 SHA。
9. 在具備授權時更新 Progress Feed。
10. 依正式流程釋放 Ownership 或交接。

對尚未完成的工作，使用明確的 WIP Checkpoint。

不得把本機檔案路徑當作使用者可下載的公開證據。

大型影片應依專案批准的附件或儲存策略管理，避免無限制將大量影片直接推入 Git 歷史。

不需要為了刷新時間戳、重複報告或宣告排程成功而建立新 Commit。

## P10 — 監督、跨任務整合與防止循環

每輪檢查：

- 是否存在尚未整合的合法開發成果。
- 是否有任務被長期標記 OWNED 但無法確認執行。
- 是否出現重複功能或版本衝突。
- 三類玩家是否反覆遇到相同問題。
- 是否有測試工具錯誤被誤認為遊戲問題。
- 是否存在長期未完成的自然戰役、存檔或性能驗收。
- 是否過度增加按鈕、提示與面板，反而降低操作直覺。

若下一項最有價值的工作是整合或診斷，優先執行，不強制新增新玩法。

只在真正需要時重新執行較大型的玩家測試。

## P11 — 永久安全邊界

除非使用者另有明確正式授權，不得：

- 修改 `main`、Pages 或公開部署。
- Force Push。
- 覆蓋既有 RC／Immutable Playtest Build。
- 覆蓋 OpenCode Checkpoints。
- 修改受保護 OmGitHub Issues，包括 Issue #17。
- 啟動未授權付費 API 或外部服務。
- 冒用其他 Agent、租約或 Ownership。
- 自行批准未定案科技、卡牌與文明核心平衡。
- 擅自修改探索獎勵上限規則。
- 篡改或刪除原始失敗測試以求 PASS。

本協議授權在既有規範內接續開發，**不等於授權所有重大遊戲設計變更及公開發布**。

## P12 — 每輪回報格式

以簡潔臺灣正體中文回報：

**執行狀態：** 實際狀態代碼。

**本輪完成：** 玩家可見的成果或明確診斷結果。

**驗證：** Node、Chromium、自然戰役與性能結果及限制。

**Git：** 最新已核實的完整 SHA、分支。

**Ownership：** 最新已核實版本及任務狀態。

**未解決問題：** FAIL、阻塞及需要使用者決策的事項。

**下一步：** 單一最高價值的合法接續任務。

若本輪僅轉送訊息、檢查狀態或保存資料，必須如實說明，不宣稱開發完成。

## P13 — 排程轉送設定（保留原指定目標）

指定專案：`Good-Comic/PlayGround`

目標對話：`PlayGround-V4`

Target thread ID：

`01a19d70-b0ba-7088-beaa-7c0d154e3005`

Transport host：`durable`

每次排程觸發：

1. 使用平台正式支援的對話傳訊功能。
2. 將喚醒訊息送至上述指定對話。
3. 不再送往原先其他 Agent 對話。
4. 不因使用者額度提示而自行偽造成功；如正式接口允許，可正常嘗試一次。
5. 轉送失敗時保留實際錯誤與狀態，不無限制重試。
6. 接收方自行執行 P0–P12 的驗證與開發流程。
7. 不因轉送成功而宣稱接收方已執行。

建議定期轉送的簡短喚醒訊息為：

「Riftwatch 自動續作喚醒：請依最新已授權的 Universal Autonomous Resume & Multi-Agent Development Protocol v2.0，核對最新 Strategy、GDD、Git、Ownership、Recovery、Handoff、Player Fun Lab 與環境狀態。若有合法且有價值的待執行工作，安全接續；若存在有效同範圍任務、額度限制或其他阻塞，依協議記錄並結束。本輪回報一律使用臺灣正體中文。請勿重複開發、搶占任務或未經授權公開部署。」

**注意：** 簡短喚醒僅在接收端能可靠取得完整 v2.0 協議時使用；否則排程仍須轉送完整協議，避免接收方因缺少內容而誤判權限。

## 最終執行原則

**以最新正式 Strategy 決定方向，以有效 Ownership 決定誰能執行，以真實遊玩證據決定問題，以合法 Git Checkpoint 決定從哪裡繼續。**

最終追求的是一款真正讓玩家願意持續遊玩的 RTS × Roguelite 遊戲，而不是產生越來越多 Commit、功能清單或測試 PASS。
