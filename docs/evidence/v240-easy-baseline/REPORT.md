# 最終狀態摘要 / Final status summary

**中文：** 本輪未建立Easy自然十波勝利路徑：Easy第五波戰敗，Normal有效配對第四波戰敗；首組Normal因停滯中斷，排除自然勝敗比較。受控十波／Boss／勝利／New Game+／周目存讀限定通過，不替代自然驗收。保持RELEASE_BLOCKED，未修改遊戲難度數值、main、Pages或OmGitHub。

**English:** This round establishes no natural Easy ten-wave winning route: Easy lost wave5and the valid Normal pair lost wave4. Initial Normal stalled and is excluded from natural win/loss comparison. Controlled ten-wave/Boss/victory/New Game+/cycle-save flow passes within scope, never replacing natural acceptance. Retain RELEASE_BLOCKED; no difficulty-stat, main, Pages or OmGitHub changes.

|指標 / Metric|Easy自然 / Natural Easy|Normal有效補測 / Valid Normal|
|---|---|---|
|結果／最遠波 / Outcome/farthest wave|NATURAL_DEFEAT /5|NATURAL_DEFEAT /4|
|模擬秒 / Simulation seconds|731.64|581.93|
|牆鐘秒 / Wall seconds|763.58|605.47|
|終點村民／軍事人口 / Final workers/military|0/0|0/0|
|終點食物／木／金／石 / Final food/wood/gold/stone|11.18 / 283.99 / 22.28 / 93.15|33.73 / 338.16 / 1.77 / 73.73|
|終點時代 / Final age|2|1|
|觀測村民傷害死亡 / Observed worker damage deaths|34|27|
|觀測軍事單位消失下限 / Observed military disappearance lower bound|≥36|≥37|
|建築損失 / Buildings lost|core×1|core×1|
|觀測攻城單位ID / Observed siege unit IDs|8|7|
|Boss / Boss|warlord2042/2124HP存活 / alive|未抵達Boss波 / Boss wave not reached|
|Console／Page／失敗請求 / Console/Page/failed requests|0|0|

**中文：** 軍事消失為稀疏存活名單的下限，不假稱逐擊完整軍損；村民死亡由逐擊觀測記錄。兩組卡牌不同（完整列表見comparison.json），例如Easy取得siege_math增加建築生命，Normal沒有；不能把單次差異全歸於難度。相同策略只涵蓋民兵／弓兵、塔與有限科技，尚未驗證完整兵種反制與經濟投資路徑。共同可確認的是村民與補兵在後期崩潰，Normal停留第一時代且黃金不足；尚未確認遊戲平衡Bug。

**English:** Military disappearances are lower bounds from sparse live rosters, not complete per-hit losses; worker deaths are directly observed. Cards differ (full lists incomparison.json), includingEasy'ssiege_mathbuilding-health bonus absent in Normal, so one-run differences are not entirely attributable to difficulty. The shared policy covers militia/archers, towers and limited technology, not complete counters/economic investment. Confirmed common failure is late worker/reinforcement collapse; Normal remained age1with low gold. No balance bug is established.

|驗收 / Acceptance|狀態 / Status|
|---|---|
|原生Easy／Normal參數 / Native Easy/Normal parameters|PASS，含實際存檔 / including actual saves|
|Easy自然十波 / Natural Easy ten waves|FAIL（該策略樣本 / this policy sample）|
|Normal自然十波 / Natural Normal ten waves|FAIL（有效補測 / valid rerun）|
|受控十波、Boss正式死亡、勝利 / Controlled ten waves, production Boss deaths and victory|CONTROLLED_FIXTURE PASS；三次前置FAIL保留 /3preceding FAIL retained|
|受控原生NG+、三卡、重置、二周目與存讀 / Controlled native NG+,3cards, reset,cycle2and save/load|PASS，非自然 / not natural|
|自然Easy／Normal NG+ / Natural Easy/Normal NG+|NOT_TESTED（無自然勝利 / no natural victory）|
|低FPS／嚴格確定性／性能／目標硬體 / Low-FPS/strict determinism/performance/target hardware|歷史FAIL／PENDING保留 / historical FAIL/PENDING retained|

**中文：** 下一步先檢查科技與補兵的全資源預算、採集區防守／命令延遲與攻城反制，再設計具有明確差異的最小驗證；不立即新增多輪相同自動玩家。所有測試已停止，本輪因執行窗口安全保存。HARDWARE_TEST_PENDING，牆鐘／模擬時間不等同FPS或時鐘正確性。無公開發布，跨對話寫入不可用，不宣稱送達。

**English:** Next inspect full-resource technology/reinforcement budgets, resource-line defense/command latency and siege counters before a materially different minimal test; do not immediately add repeated similar player versions. Tests have stopped, checkpointed at the execution-window boundary. HARDWARE_TEST_PENDING; wall/simulation time is neither FPS nor clock-correctness certification. No publication; cross-thread writing unavailable and delivery not claimed.

---

## 執行歷程與範圍 / Execution history and scope

# Easy自然基準與Normal配對 / Easy natural baseline and Normal pairing

**中文：** 按使用者最新決策，優先正式Start／Easy／TEU／steppe／MILESTONE-NORMAL（數字Seed1376821427）、1×、手動經濟／軍費、單步兵護衛與庫存感知策略。不使用戰術暫停、跳波、單位／資源／時間注入，不改Easy或Normal。遊戲來源798bcffdfe8e97bdd4e8abe6c67f18223b540877；harness新增難度選擇並讀回實際值，不假設UI預設。自然測試進行中，VALIDATION_IN_PROGRESS，尚未通過十波。

**English:** Following the latest user decision, prioritize native Start/Easy/TEU/steppe/MILESTONE-NORMAL (numeric seed1376821427),1×, manual economy/military spending, single infantry escort and stock-aware strategy. No tactical pause, wave skips, unit/resource/time injection or Easy/Normal changes. Game source798bcffdfe8e97bdd4e8abe6c67f18223b540877; harness adds difficulty selection and reads back the actual value rather than assuming defaults. Natural validation is active: VALIDATION_IN_PROGRESS, not a ten-wave pass.

**中文：** 實際第一波存檔：Easy初始準備56.25秒、8民兵／3弓兵／2攻城槌；同Seed的Normal計畫45秒、10／4／2。paired-plans.json為十組隔離計畫對照，普通敵軍依類型總數×0.8四捨五入，Boss數量／定義屬性不變；不是十波自然實測。未來波次因實際報告與RNG消耗可能分歧，不要求不同難度整場敵軍完全相同。

**English:** Actual wave1save: Easy initial preparation56.25seconds and8militia/3archers/2rams, versus matched Normal plan45seconds and10/4/2. paired-plans.json contains ten isolated plan comparisons: ordinary per-type totals round at×0.8; Boss counts/definition statistics remain unchanged. This is not ten-wave natural observation. Later waves may diverge through actual reports/RNG consumption, so entire campaigns across difficulties need not have identical enemies.

**中文：** 另準備CONTROLLED_FIXTURE流程測試，明確注入大量守軍與城心生命，使用正式攻擊／波次結算而非直接殺敵或跳波。尚未執行，不冒充自然通關。重型受控測試將與自然瀏覽器串行，避免CPU競爭。歷史低FPS、嚴格Save/Load、性能FAIL與硬體待測保留；不公開發布。

**English:** A separate CONTROLLED_FIXTURE flow test is prepared, explicitly injecting a large defending army/core health while using production attacks/settlement instead of direct kills/wave skips. Not yet executed; never a natural victory. Run heavy controlled testing serially with the natural browser to avoid CPU competition. Retain historical low-FPS, strict Save/Load, performance FAIL and hardware-pending status; no public deployment.

## Easy第一輪自然結果 / Easy first natural outcome

**中文：** Easy正式自然戰敗於第五波，runTime731.6406秒、實際牆鐘763.576秒；Console／Page／失敗請求0。第五波之前村民與部隊已大量損失：第二波入場8村民／15軍事，第三波8／14，第四波10／11，第五波入場1／6。終點村民／軍隊0、城心摧毀，第二時代。Boss仍有2042/2124HP。此結果未建立Easy可通關路徑，也不證明Easy不可通關；沒有自然NG+可驗證。

**English:** Easy naturally lost at wave5,runTime731.6406seconds over763.576wall seconds;0Console/Page/failed-request errors. Workers/army had already deteriorated before the Boss: wave2entry8workers/15military, wave3entry8/14, wave4entry10/11, wave5entry1/6. Ended with0workers/army, destroyed core, age2; Boss still2042/2124HP. This establishes no winning Easy route and does not prove Easy unwinnable; natural NG+ cannot yet be verified.

## 受控測試失敗對照 / Controlled-test failure comparison

**中文：** 第一受控場景於第五波240秒正式Boss超時，守軍留在入口，Boss已到城心；第二組透過Attack-Move集中守軍，仍有164守軍idle、9攻擊，Boss1308HP，並非已確認流程Softlock。兩組均FLOW_NOT_VERIFIED，失敗保留，不是自然結果。第三組根據此差異明確透過正式issueCommand對Boss集火，不直接改Boss生命或跳波。它只驗證流程，不驗證自然兵力／經濟平衡。

**English:** First controlled scene reached the formal wave5Boss240-second timeout while defenders remained at gates and the Boss reached the core. Second used Attack-Move to concentrate defenders but ended with164idle/9attacking guards and a1308HPBoss; this is not an established flow softlock. Both are FLOW_NOT_VERIFIED with failures retained, never natural results. A third cohort responds specifically through productionissueCommand Boss focus, without directly changing Boss HP or skipping waves. It tests flow, not natural army/economy balance.

**中文：** 第三個受控組集火確實被接受，但第五波仍Boss超時，Boss剩484HP，134守軍idle、6攻擊。三組均未證實十波可完成；不把戰鬥配置與擁擠混為流程Softlock。根因對照後只再準備一組低密度耐久攻城測試：注入8攻城器、明示玩家HP覆寫，保留攻擊／冷卻／射程及Boss屬性，不直接殺敵。它將在Normal自然測試結束後串行執行；若仍失敗，不再繼續調整追綠燈。

**English:** The third controlled focus command was accepted, but wave5still timed out with484BossHP,134idle guards and6attacking. None establishes ten-wave completability; combat setup/crowding is not a proven flow softlock. After this root comparison, prepare one final low-density durable-siege fixture:8injected siege units with explicit player HP overrides, unchanged attack/cooldown/range and Boss statistics, and no direct kills. Run serially after Normal natural testing; if it fails, stop further green-seeking fixture adjustments.

## Normal第一次工具中斷 / First Normal harness interruption

**中文：** Normal第一組第五波runTime644.8958秒後不再前進，狀態輪詢仍正常且無PageError。追查wall684秒的週期存檔Pause點擊逾時，舊工具沒有核對暫停副作用是否已發生，直接略過，沒有恢復。這是確認的操作恢復缺陷，但首組未記錄直接paused值，尚不能排除其他停滯原因；此組NORMAL_HARNESS_INTERRUPTED，不是自然戰敗／即時通過。保留全部停滯樣本及診斷存檔。修復依實際paused狀態透過原生Resume恢復；無Resume介面即報錯，不讓主流程空轉。補測前先以真實瀏覽器受控操作故障驗證，不能把長暫停組悄悄接成自然通關。

**English:** First Normal stopped advancing after wave5runTime644.8958seconds while state polling remained responsive without PageError. At wall684seconds a periodic-save Pause click timed out; the old harness skipped it without checking whether its pause side effect had occurred. This is a confirmed recovery defect, but the first cohort lacked a directpausedvalue, so other stall causes remain unexcluded. Classify NORMAL_HARNESS_INTERRUPTED, not natural defeat or real-time acceptance. Preserve all stalled samples/diagnostic save. The fix reads actualpausedstate and uses native Resume, surfacing an error if recovery controls are absent rather than spinning. Validate the fix with a real-browser controlled operation fault before a fresh rerun; never silently stitch the long-paused cohort into a natural win.

## 受控流程最終結果 / Final controlled-flow result

**中文：** 最後低密度組FLOW_REACHED_VICTORY，36573次0.05秒正式Game.update；第五波warlord與第十波warlord2皆由mangonel投射物正式傷害擊敗，沒有直接kill或跳波。每次波間選卡經JSON Save/Load後正常推進，勝利後第二周目開始、三卡繼承、資源300/300/120/100、時代1、城心baseHP3000；第二周目正式側翼生成且再次存讀保留周目。玩家8攻城器HP1e6及城心1e7是明確控制條件，不代表自然可玩性或Boss平衡通過。三組先前失敗原樣保留。

**English:** Final low-density fixture reachedFLOW_REACHED_VICTORY after36573productionGame.updatecalls of0.05seconds. Wave5warlord and wave10warlord2 died from production mangonel projectile damage, without direct kills/wave skips. Each inter-wave card phase progressed after JSON Save/Load; victory entered cycle2with3cards, resources300/300/120/100, age1and corebaseHP3000. The cycle2flank spawned and another save/load retained cycle information. Eight player siege units at1e6HPand a1e7HPcore are explicit fixture conditions, not natural playability/Boss-balance acceptance. Preserve all three preceding failures.

**中文：** 真實本地Chromium再以該實際受控勝利快照經Continue開啟勝利介面，原生勾選三卡、NextCycle、Pause/Save/Reload/Continue，實際進入第二周目第一波26秒、側翼生成。五項檢查通過，Console／Page／失敗請求0，原始錄影與截圖保留。完整自然Easy／Normal NG+仍NOT_TESTED。Pause恢復另以明示受控操作故障檢查驗證；兩項Node測試通過。

**English:** Actual local Chromium then loaded the genuinely produced controlled-victory snapshot via Continue, opened victory UI, natively selected3cards/NextCycle and Pause/Save/Reload/Continue, reaching actual cycle2wave1at26seconds with the flank spawned. Five checks pass with0Console/Page/failed requests; recordings/screenshots retained. Natural Easy/Normal NG+ remainNOT_TESTED. Pause recovery is separately verified through an explicit controlled operation-fault check;2Node tests pass.
