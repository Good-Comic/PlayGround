# 自然戰役策略根因對照與 V5.1 / Campaign Policy Comparison and V5.1

## V1–V4 對照 / V1–V4 Comparison

|版本 / Version|實際結果 / Observed result|有證據支持的限制 / Evidenced limitation|
|---|---|---|
|V1|第五波戰敗 / Wave5 defeat|無軍隊集結指令，科技停留第一時代 / No army regroup orders; age1 throughout|
|V2|第四波工具中斷 / Wave4 harness interruption|建造按鈕因冷卻更新而被重建；不能當戰敗 / Cooldown rebuild detached build button; not a defeat|
|V3|第四波戰敗 / Wave4 defeat|25次弓兵訓練點擊、僅2次民兵；錯誤600食物門檻，未升級 / 25 archer-training clicks vs2 militia clicks; incorrect600-food threshold prevented technology|
|V4|第四波戰敗，第二時代 / Wave4 defeat, age2|第二波村民7→1；結束木材692.54、黃金13.59；資源分配與防守不足 / Workers7→1 in wave2; final692.54wood/13.59gold; allocation and protection gaps|

**繁體中文：** 來源為 `docs/evidence/v240-campaign-natural/policy-v*/events.jsonl` 與各版本結果。點擊次數不是完成訓練或成功指令的證明。V1–V3 的錯誤科技門檻屬工具策略問題；V2 曾辨識並修正命令列重建問題。其他損失只能先列為策略與操作限制，不能直接判定引擎故障或 Normal 無法通關。

**English:** Sources are `docs/evidence/v240-campaign-natural/policy-v*/events.jsonl` and their results. Click counts do not prove completed training or successful orders. V1–V3's incorrect technology threshold was a policy defect; V2 identified a subsequently fixed command-grid rebuild issue. Other losses initially establish strategy/input limitations, not engine failure or Normal impossibility.

## V5 試跑的新證據 / New V5 Pilot Evidence

**繁體中文：** 已保存 V5 試跑到第二波，完成第二時代與8間房屋，但村民為0。關閉自動經濟後，策略沒有補訓村民；原採集點擊亦未核對實際 gatherTarget，且畫面外單位會被略過。V5.1 從該真實存活戰役存檔接續，先用原生市鎮中心訓練恢復經濟，透過原生 Minimap 移動鏡頭及 read-only pickAt 選擇實際可點位置，並驗證隊列、採集目標與移動結果。相同戰役接續仍須分組記錄，不能聲稱嚴格 Save/Load 確定性。

**English:** The saved V5 pilot reached wave2, age2 and8houses, but had0workers. After disabling automatic economy, the policy never retrained workers; gathering clicks did not verify gatherTarget, and off-screen units were skipped. V5.1 continues that actual living campaign save, first recovering workers through native Town Center training, panning through the native minimap and using read-only pickAt to locate clickable positions, then checking queues, gathering targets and movement outcomes. Record this saved-run continuation as a distinct cohort; it does not establish strict Save/Load determinism.

## 預先定義的驗收 / Predeclared Acceptance

**繁體中文：** 先確認0村民可合法補訓且資源正常扣除；新村民能實際收到安全採集／撤退命令。若失敗，保存實際點選對象、隊列與資源差異，先分辨工具、引擎及策略問題。主目標仍為自然十波，勝利後才用原生入口選卡並開始 New Game+；不灌資源、不改 Normal、不跳波。所有歷史 FAIL、低 FPS、Save/Load 與 Rift Prototype 問題保留。測試為本地真實 Chromium，不是線上發布或硬體驗收。

**English:** First verify legal recovery from0workers with normal resource deductions, then verify new workers actually receive safe gathering/withdrawal orders. On failure, preserve picked entities, queues and resource deltas to separate harness, engine and strategy defects. The main target remains ten natural waves, followed only after victory by native card selection and New Game+. No resource grants, Normal changes or wave skips. Preserve historical FAIL, low-FPS, Save/Load and Rift Prototype gaps. Tests use real local Chromium, not public deployment or hardware acceptance.
