# 剩餘工作與自然策略 / Remaining work and natural policy

**中文：** 由遠端4aff2c38接續，已完成需求／證據盤點，見 `docs/release/v240/REMAINING-WORK-AUDIT.md`。遊戲來源保持 `0f85357303bf2bca809e6ff32b490769e1d3f836`。V5.10從前次存活快照以1× Normal、原生戰爭管家、手動經濟接續，自然完成第一波，於第二波存活保存（模擬202.7879秒），無瀏覽器例外。這是資訊增益後的主動檢查點，不是完整十波通過或戰敗。原始狀態、操作及存檔位於v510-continuation。

**English:** Resumed from remote4aff2c38 and audited requirements against evidence; see `docs/release/v240/REMAINING-WORK-AUDIT.md`. Game source remains `0f85357303bf2bca809e6ff32b490769e1d3f836`. V5.10 continued the prior living save at1× Normal with the native army steward and manual economy, naturally completed wave1, and checkpointed alive at wave2 (simulation202.7879seconds) without browser exceptions. This was an intentional informative checkpoint, not a ten-wave pass or defeat. Raw states, inputs and save are in v510-continuation.

**中文：** 原策略在模擬130–156秒約有6/7村民閒置：八格威脅半徑即使對射程1的步兵也觸發撤退／庇護。V5.11改以實際武器射程+1.25格緩衝或直接目標判斷，並保留資源點六格安全檢查。9項定向測試通過，明確區分五格外步兵與弓兵、近身與直接鎖定。這只修改測試玩家，不改Normal。V5.11真實Chromium接續正在進行，尚未宣稱改善存活或通關。

**English:** Around simulation130–156seconds, roughly6of7workers were idle: the eight-tile threat radius triggered retreat/sheltering even for range1infantry. V5.11 uses actual weapon range plus a1.25-tile buffer or direct targeting, retaining the six-tile resource-node safety filter. Nine directed tests pass, distinguishing infantry versus archers five tiles away, proximity and direct targeting. This changes only the test player, not Normal. Actual Chromium continuation withV5.11 is underway; improved survival or victory is not yet claimed.
