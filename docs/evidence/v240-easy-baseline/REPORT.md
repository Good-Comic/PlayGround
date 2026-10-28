# Easy自然基準與Normal配對 / Easy natural baseline and Normal pairing

**中文：** 按使用者最新決策，優先正式Start／Easy／TEU／steppe／MILESTONE-NORMAL（數字Seed1376821427）、1×、手動經濟／軍費、單步兵護衛與庫存感知策略。不使用戰術暫停、跳波、單位／資源／時間注入，不改Easy或Normal。遊戲來源798bcffdfe8e97bdd4e8abe6c67f18223b540877；harness新增難度選擇並讀回實際值，不假設UI預設。自然測試進行中，VALIDATION_IN_PROGRESS，尚未通過十波。

**English:** Following the latest user decision, prioritize native Start/Easy/TEU/steppe/MILESTONE-NORMAL (numeric seed1376821427),1×, manual economy/military spending, single infantry escort and stock-aware strategy. No tactical pause, wave skips, unit/resource/time injection or Easy/Normal changes. Game source798bcffdfe8e97bdd4e8abe6c67f18223b540877; harness adds difficulty selection and reads back the actual value rather than assuming defaults. Natural validation is active: VALIDATION_IN_PROGRESS, not a ten-wave pass.

**中文：** 實際第一波存檔：Easy初始準備56.25秒、8民兵／3弓兵／2攻城槌；同Seed的Normal計畫45秒、10／4／2。paired-plans.json為十組隔離計畫對照，普通敵軍依類型總數×0.8四捨五入，Boss數量／定義屬性不變；不是十波自然實測。未來波次因實際報告與RNG消耗可能分歧，不要求不同難度整場敵軍完全相同。

**English:** Actual wave1save: Easy initial preparation56.25seconds and8militia/3archers/2rams, versus matched Normal plan45seconds and10/4/2. paired-plans.json contains ten isolated plan comparisons: ordinary per-type totals round at×0.8; Boss counts/definition statistics remain unchanged. This is not ten-wave natural observation. Later waves may diverge through actual reports/RNG consumption, so entire campaigns across difficulties need not have identical enemies.

**中文：** 另準備CONTROLLED_FIXTURE流程測試，明確注入大量守軍與城心生命，使用正式攻擊／波次結算而非直接殺敵或跳波。尚未執行，不冒充自然通關。重型受控測試將與自然瀏覽器串行，避免CPU競爭。歷史低FPS、嚴格Save/Load、性能FAIL與硬體待測保留；不公開發布。

**English:** A separate CONTROLLED_FIXTURE flow test is prepared, explicitly injecting a large defending army/core health while using production attacks/settlement instead of direct kills/wave skips. Not yet executed; never a natural victory. Run heavy controlled testing serially with the natural browser to avoid CPU competition. Retain historical low-FPS, strict Save/Load, performance FAIL and hardware-pending status; no public deployment.
