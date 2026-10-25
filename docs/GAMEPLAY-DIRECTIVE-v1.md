# 《世紀帝國二：裂境守望》— Master Gameplay Improvement Directive v1.0
## OmGitHub → Codex 正式接手 × P0 Bug 修復 × RTS/Roguelite 全面改善 × 三階段真實驗收

### 一、最高角色與總體目標

你是《世紀帝國二：裂境守望》（Age of Empires II: Riftwatch）的首席遊戲架構師、RTS AI 工程師、Roguelite 系統設計師、資深全端遊戲工程師、遊戲 QA 總監及版本管理負責人。

本次任務不只修復三個已確認的 P0 Bug，而是完整接手 OmGitHub 最新遊戲成果，建立長期可持續的遊戲改善與驗收流程。

採用三大分析維度：

- **高度**：整體遊戲可玩性、玩家體驗、技術可維護性、長期開發與重玩價值。
- **深度**：實際程式架構、尋路演算法、戰鬥狀態機、遊戲資料契約、自動化測試與回歸驗收。
- **廣度**：參考成熟 RTS、Tower Defense 與 Roguelite 遊戲的設計方法，進行紅藍隊交叉審查。

**最高原則：先讓遊戲真正好玩、能正常操作，再逐步增加功能與視覺表現。**

不得只產生規劃文件，必須執行目前環境允許的程式修改、測試及提交。

### 二、Repository 與版本保護

Repository：`Good-Comic/PlayGround`

OmGitHub 來源：

`https://omgithub.com/Good-Comic/PlayGround/issues/17`

已取得 LIVE_VERIFIED 的線上遊戲資源版本：

`914016dae8a7eb131b7e06c49a36c6a3276247d0`

已觀察到較新的 OpenCode Checkpoint：

`6476a4bc6d18f688b9c44db9a95c45901d76b741`

開始時重新核對最新遠端 Commit、當前 Codex 工作區與 OmGitHub 線上版本。

先比較版本差異，確認使用最新、有效且可驗證的遊戲程式作為開發基準。

建立獨立遊戲開發分支：

`codex/riftwatch-gameplay-improvement`

不得直接修改 main、Project Forge AI 平台歷史、OpenCode checkpoints 或尚未提交的使用者資料。

不得強制推送、自動 Merge 或擅自覆蓋線上 Preview。

### 三、建立永久三階段驗收制度

所有重要 Gameplay 修改都必須遵守：

**BEFORE_LIVE → AFTER_LOCAL → AFTER_DEPLOY_LIVE**

#### BEFORE_LIVE

使用 Playwright 直接操作 OmGitHub 真實 Preview，保存修改前的 Bug 或功能缺失證據。

#### AFTER_LOCAL

在 Codex 獨立工作區中啟動實際遊戲，從修改後 Commit 重新載入並操作，通過單元、整合、Playwright 與實際遊玩驗證。

#### AFTER_DEPLOY_LIVE

當使用者授權並完成線上 Preview 的更新／部署後，再次進入實際線上遊戲，重跑相同情境。

若無法將 Codex 修復版更新到 OmGitHub，必須標記 `DEPLOYMENT_BLOCKED`，不能把本地成功當成線上已修復。

每次保存：

- Git Commit SHA 與分支。
- 遊戲 Build ID。
- 測試環境與 URL。
- 固定 Seed、文明、地貌。
- 操作步驟與 Playwright 腳本。
- 截圖或錄影。
- 單位狀態時間序列。
- Console、Page Errors 與 Network。
- 修改前後差異。
- 最終驗收狀態。

將流程實作成可重複使用的 QA 工具，避免每次人工重建驗收步驟。

### 四、Phase A — P0 核心可玩性修復

**此階段為最高優先，必須先完成，才能進入較大範圍的功能擴充。**

#### A1. 單位尋路與卡住

已在線上驗證：

- 輕騎兵移向農田內部目標，卡住超過 50 秒。
- 部分村民位於資源點附近，44 秒無法開始正常採集。

修復要求：

1. 建立真正的路徑規劃機制，例如適合 50×50 戰場的 A*。
2. 支援房屋、農田、樹林、河流、建築及地形避障。
3. 對建築內部和不可通行終點選擇合法目的地。
4. 建立動態路徑重算與局部避障。
5. 處理狹窄通道與多單位擁擠。
6. 建立卡住計時器、無進展偵測與安全恢復。
7. 不得以穿牆、穿水或瞬移掩蓋尋路問題。
8. 避免大量單位同時 A* 重算造成效能崩潰。

驗證村民、近戰、遠程、騎兵、英雄與大型攻城單位。

#### A2. 自動索敵與戰鬥 AI

已在線上驗證：

兩名民兵持續鎖定死亡敵軍至少 25.33 秒，附近仍有其他存活敵人。

修復要求：

1. 目標死亡後立即清理失效引用。
2. 重新搜尋附近有效敵軍。
3. 受到攻擊時依部隊姿態進行反擊。
4. Idle、Move、Attack、Attack-Move、Guard、Hold 等狀態正確轉換。
5. 近戰與遠程單位保持正確交戰距離。
6. 保留玩家手動命令優先權。
7. 防止守城部隊無限制追敵。
8. 防止戰鬥中出現永久 Idle 或失效 Attack 狀態。

新增四種部隊姿態：

- Aggressive。
- Defensive。
- Hold Position。
- Passive。

預設採 Defensive，玩家可修改。

#### A3. 村民經濟閉環

必須保留已完成的資源卸貨修復。

完整驗證：

- Food、Wood、Gold、Stone。
- 採集與背包容量。
- 自動返回主堡或資源營地。
- 資源實際入帳。
- 卸貨後重新採集。
- 每類至少三輪完整循環。
- 多村民同時工作。
- 目標枯竭。
- 建築摧毀。
- Save/Load 後工作恢復。
- 不可達目標的安全重新分配。

不得出現資源重複入帳、消失或無限卡住。

### 五、Phase B — RTS 操作體驗

#### B1. 生產單位集結點

為每棟可訓練單位的建築建立獨立 Rally Point。

要求：

- 玩家可指定地面位置。
- 可以變更及清除。
- 顯示集結旗標與方向。
- 新單位在合法位置生成。
- 單位自動移向集結地。
- 村民可指定資源點作為工作集結目標。
- 集結地不可達時安全處理。
- Save/Load 可正確保存。

優先接通既有建築 `rally` 資料，不重複建立衝突系統。

#### B2. 文明特色兵種及建築

核對所有 16 個文明與 GDD 既有資料。

建立文明／兵種／建築／時代／科技的完整生產規則。

特別驗證：

- Persian War Elephant。
- Chinese Repeating Crossbow。
- 其他已有 GDD 定義的文明專屬單位。

對應兵種必須能在正確建築、符合條件時生產。

優先沿用合理的既有兵營、馬廄、射箭場與攻城工坊；只有必要時才新增專屬建築。

不得僅增加兵種資料，卻沒有實際訓練入口。

#### B3. 編隊與控制

增補：

- 快捷鍵編隊。
- 多選單位。
- Attack-Move。
- Guard。
- Hold Position。
- 巡邏及防守範圍。
- 集體移動。
- 避免單位集中重疊。

### 六、Phase C — 戰術視野與文明視覺

#### C1. 戰爭迷霧

建立三種可選模式：

- Off。
- Tactical。
- Classic。

預設 Tactical。

Tactical 模式保留地形輪廓，隱藏視野外動態敵軍資訊。

Classic 模式使用探索記憶與目前視野分離機制。

讓瞭望塔具備實際價值：

- 增加視野。
- 預警敵軍進攻方向。
- 提早辨識敵軍種類。
- 提供合理的守城資訊優勢。

不得讓 Fog 破壞 Nemesis Director 的既有機制或無故降低遊戲效能。

#### C2. 文明與兵種外觀

不同文明不能只靠隊伍顏色辨識。

加入：

- 建築風格、屋頂、旗幟、材質差異。
- 兵種輪廓。
- 服裝、頭盔、盔甲與武器。
- 文明特色兵種造型。
- 與地貌相協調的色彩。
- 色盲與高對比辨識。

優先使用現有 Canvas 繪製系統，不擅自更換引擎。

### 七、Phase D — 音效、GM、Settings 與 UI

#### D1. 戰鬥音效

建立分類音效：

- 劍、槍、弓、弩。
- 騎兵、戰象。
- 攻城武器。
- 建築受擊與倒塌。
- 命中、格擋、死亡。
- 地貌環境事件。

需要音效混音、音量分類、重複聲音控制及同時播放上限。

#### D2. GM 功能

保留既有功能，新增：

- 生成與刪除各類單位。
- 指定文明、兵種及科技。
- 資源修改與瞬間採集。
- 強制波次與 Boss。
- 切換地貌與事件。
- AI 狀態、索敵距離及路徑 Debug。
- 碰撞框與阻擋地圖。
- 建築生產與集結點測試。
- Fog 開關。
- FPS 與效能統計。
- 固定 Seed 與遊戲事件追蹤。
- 恢復正常遊戲狀態。

GM 操作不得意外污染正常存檔。

#### D3. Settings

擴充：

- UI Scale：75–200%。
- 文字大小。
- 戰鬥浮動文字大小。
- 高對比／色盲設定。
- Master、BGM、SFX、Combat、Ambient 音量。
- 戰爭迷霧選擇。
- 鏡頭速度與縮放。
- 遊戲速度。
- 自動經濟與軍事。
- 操作快捷鍵。
- 動畫品質與特效。
- FPS 顯示。
- 降低動態效果。

設定需持久保存，不得只在當次畫面生效。

#### D4. UI 可讀性

修正過小文字、狀態提示難以閱讀、介面遮擋與不同解析度布局問題。

桌面、筆電、平板、手機都需驗證。

### 八、Phase E — Roguelite 體驗深化

在既有十波模式上進一步增強：

- 波次預警與敵軍情報。
- 精英敵人與 Boss 攻擊提示。
- 卡牌 Build 協同。
- 文明與地貌差異化策略。
- 戰後損失與資源分析。
- 玩家失敗原因回饋。
- 可重玩性。
- 難度與遊戲節奏。
- 重要戰鬥事件通知。
- 有策略價值的隨機事件。

已知未完成項目需建立獨立需求：

- Mongol Mobile Camp。
- Replay Determinism。
- Endless Mode。
- GDD 626-key 母表追蹤。
- 1000-unit 效能驗收。
- 母語 LQA。
- 正式美術與動畫資產。

不得為追求功能數量而破壞既有 RTS 可玩性。

### 九、開發執行與上下文管理

各 Phase 應拆成可獨立完成的任務。

每次只載入相關規格、程式與測試，不一次讀入全部大型 GDD。

建立需求追蹤矩陣，記錄：

- Requirement ID。
- Source Section。
- Implementation Status。
- Changed Files。
- Test Cases。
- Commit SHA。
- Gameplay Evidence。
- Known Limitations。

每一階段必須有實際程式修改與真實驗證，並保留可回滾節點。

若模型上下文不足，先完成當前最小可驗收任務，提交後再進入下一個任務。

不得跳過 P0。

### 十、驗收與品質閘門

每一個重要 Gameplay 變更必須經過：

**BEFORE_LIVE → AFTER_LOCAL → AFTER_DEPLOY_LIVE**

其中：

- 修復前有真實線上復現證據。
- 修復後有實際瀏覽器測試與操作結果。
- 部署後確認真正線上版本載入了修復 Commit。

每次執行：

1. JavaScript Syntax Checks。
2. Locale Validation。
3. Gameplay Unit／Integration Tests。
4. Playwright E2E。
5. Console／Page／Network Error Checks。
6. Screenshot／Video Evidence。
7. Build SHA 對照。
8. 主要 RTS 與 Roguelite Regression。
9. Game State 時間序列檢查。
10. 修改後實際遊戲畫面確認。

不能只以十波狀態機 traversal 宣稱完整遊戲品質通過。

若 OmGitHub 不支援自動部署 Codex 修復版，則停在 AFTER_LOCAL，並標記 `DEPLOYMENT_BLOCKED`。

### 十一、版本與提交

每個 Phase 或可驗收子任務採獨立 Commit。

不得直接覆寫：

- main。
- OpenCode Checkpoints。
- Riftwatch 原始基準。
- Project Forge AI 平台分支。

禁止自動 Merge、Force Push 或未授權的正式發布。

每次提交後提供：

- 實際完成項目。
- Commit SHA。
- Diff 摘要。
- 測試證據。
- Gameplay 截圖。
- 回歸結果。
- 未完成及阻塞項目。

### 十二、立即執行順序

**第一優先：Phase A**

先修復三個已在線上確認的 P0 問題：

1. 死亡目標不重新索敵。
2. 村民採集停滯。
3. 單位無法繞過不可通行地形及建築。

同步建立三階段驗收工具。

**第二優先：Phase B**

完成集結點、文明特色兵種訓練入口及基本部隊控制。

**第三優先：Phase C、D、E**

依序改善戰術視野、文明外觀、音效、GM、Settings、文字可讀性及 Roguelite 系統。

若執行時間或上下文有限，完成當前階段、保存 Git Commit、更新進度文件，讓後續 Codex 任務能從精確的接續點繼續。

不要只提供設計，立即開始實際修復與測試。

### 最終驗收標準

本專案的成功不以 AI 回報「All tests pass」作為唯一依據。

真正的成功必須滿足：

**程式確實修改 → 實際遊戲能運行 → 玩家操作行為正確 → 自動化測試通過 → 新版本線上驗收成功。**

最終目標是讓《世紀帝國二：裂境守望》成為一款具有真正 RTS 戰術操作深度、Roguelite 成長策略、文明差異與穩定可玩性的完整遊戲。