# 剩餘工作與自然策略 / Remaining work and natural policy

**中文：** 由遠端4aff2c38接續，已完成需求／證據盤點，見 `docs/release/v240/REMAINING-WORK-AUDIT.md`。遊戲來源保持 `0f85357303bf2bca809e6ff32b490769e1d3f836`。V5.10從前次存活快照以1× Normal、原生戰爭管家、手動經濟接續，自然完成第一波，於第二波存活保存（模擬202.7879秒），無瀏覽器例外。這是資訊增益後的主動檢查點，不是完整十波通過或戰敗。原始狀態、操作及存檔位於v510-continuation。

**English:** Resumed from remote4aff2c38 and audited requirements against evidence; see `docs/release/v240/REMAINING-WORK-AUDIT.md`. Game source remains `0f85357303bf2bca809e6ff32b490769e1d3f836`. V5.10 continued the prior living save at1× Normal with the native army steward and manual economy, naturally completed wave1, and checkpointed alive at wave2 (simulation202.7879seconds) without browser exceptions. This was an intentional informative checkpoint, not a ten-wave pass or defeat. Raw states, inputs and save are in v510-continuation.

**中文：** 原策略在模擬130–156秒約有6/7村民閒置：八格威脅半徑即使對射程1的步兵也觸發撤退／庇護。V5.11改以實際武器射程+1.25格緩衝或直接目標判斷，並保留資源點六格安全檢查。9項定向測試通過，明確區分五格外步兵與弓兵、近身與直接鎖定。這只修改測試玩家，不改Normal。V5.11真實Chromium接續正在進行，尚未宣稱改善存活或通關。

**English:** Around simulation130–156seconds, roughly6of7workers were idle: the eight-tile threat radius triggered retreat/sheltering even for range1infantry. V5.11 uses actual weapon range plus a1.25-tile buffer or direct targeting, retaining the six-tile resource-node safety filter. Nine directed tests pass, distinguishing infantry versus archers five tiles away, proximity and direct targeting. This changes only the test player, not Normal. Actual Chromium continuation withV5.11 is underway; improved survival or victory is not yet claimed.

## V5.11結果與V5.12差異 / V5.11 result and V5.12 distinction

**中文：** V5.11於第二波損失全部村民及軍隊，模擬314.5618秒主動保存；市鎮中心尚存活，因此是「存活目標FAIL／限定樣本未完成」，不是自然戰敗結算。無瀏覽器例外。縮小撤退半徑未證明改善，不作推薦結論。V5.12回到相同已驗證30.53秒存活開局，增加以真實成本80木／60石建造第二塔的防守策略；原本資源沒有用於防禦建設。兩組工具雜湊及樣本分開保存，不合併成同一驗收批次。

**English:** V5.11 lost all workers and army at wave2 and deliberately checkpointed at simulation314.5618seconds. The core remained alive, so this is a survival-goal FAIL/incomplete bounded sample, not a natural defeat settlement. No browser exceptions occurred. Reduced retreat distance has not demonstrated improvement and is not recommended as proven. V5.12 returns to the same verified30.53-second living opening and adds a second tower at the real80wood/60stone cost; those resources previously went unused for defensive construction. Keep tool hashes and samples separate rather than combine acceptance cohorts.

## 設定覆核缺陷 / Settings-verification defect

**中文：** 發現接續工具原本只於新開局套用軍事輔助旗標；Continue會保留快照設定。因此第一次V5.13要求off但實際仍on，於模擬47.2633秒停止，列無效比較，不當作off樣本。既有V5.10／11／12要求on與存檔on一致，但舊工具本身沒有實際旗標收據。修正後新開局及Continue皆透過原生Pause設定，再讀取軍事輔助、經濟輔助及倍速核對；不一致即停止，不再只記錄CLI宣告。只於啟動設定使用Pause，不採戰術暫停。

**English:** The continuation harness previously applied the army-aid flag only for fresh starts; Continue retained saved settings. Thus the firstV5.13 requested off but actually remained on; stopped at simulation47.2633seconds, it is an invalid comparison, not an off cohort. V5.10/11/12 requested on and their saved setting was on, but the old harness lacked an actual-setting receipt. The fix applies native Pause settings after both Start and Continue, then reads army aid, economy aid and speed, stopping on mismatch instead of recording only CLI claims. Pause is used for startup configuration, not tactical assistance.
