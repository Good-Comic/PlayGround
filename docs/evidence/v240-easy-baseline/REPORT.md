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
