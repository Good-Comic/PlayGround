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

## 最終結果與精確接續 / Final results and precise continuation

|樣本 / Sample|實際結果 / Actual outcome|範圍 / Scope|
|---|---|---|
|V5.10 continuation|第二波存活，8村民、9軍事、城心滿血，模擬202.7879秒 / Alive at wave2,8workers,9military, full core, sim202.7879s|主動資訊檢查點，非完整通過 / Deliberate informative checkpoint, not full PASS|
|V5.11|第二波全部村民／部隊損失，模擬314.5618秒 / Lost all workers/army at wave2, sim314.5618s|存活目標FAIL、主動停止，非自然戰敗結算 / Survival FAIL, deliberate stop, not defeat settlement|
|V5.12|第三波自然戰敗，模擬406.9329秒 / Natural defeat wave3, sim406.9329s|第二塔實際扣款、完工；無例外 / Second tower paid/completed; no exceptions|
|V5.13 initial|要求off但未套用 / Requested off not applied|INVALID_SETTINGS_COHORT，不納入策略比較 / Excluded from policy comparison|
|V5.13 verified|第三波自然戰敗，模擬409.7384秒 / Natural defeat wave3, sim409.7384s|實際軍事輔助off、經濟輔助off、1×，無例外／失敗請求 / Actual army aid off, economy aid off,1×; no errors/failed requests|

**中文：** 所有實際結果與錄影分組保存，不能將跨工具版本、輔助設定及接續起點當作同批隨機對照。閒置率摘要為稀疏狀態抽樣估計，非精確工作時間Profile，也不是因果證明。門檻仍是合法即時Normal十波自然勝利，然後原生New Game+最多三卡繼承、經濟／科技重置與第二周目戰鬥；本輪全部未達成。遊戲引擎／平衡未改。

**English:** Keep actual results and recordings separated by cohort; different tool versions, assistance settings and continuation points are not one randomized comparison. Idle ratios are sparse-state estimates, not exact work-time profiles or causal proof. The gate remains legal real-time Normal natural ten-wave victory, followed by native New Game+ with up to3cards, economy/technology reset and actual cycle2combat; none was achieved this round. Engine/balance remain unchanged.

**中文：** 下一個最小工作為V6開局投資與集中防禦策略：以實際200食物／100黃金第二時代成本對比早期補兵、經濟恢復與防禦，不能只改幾個等待時間。V5.10開局已投入第二時代，無法合法退款，因此若測試延後科技，需從正式Start建立新策略，保留相同Seed與Normal，不覆蓋舊樣本。V5.13最終存檔已戰敗，不能繼續；最近存活檢查點仍是v510-continuation/save-snapshot.json，但它同樣已第二時代。自然十波未通過前不啟動自然New Game+宣稱。

**English:** The next minimal task is aV6 opening-investment and concentrated-defense policy: compare the real200food/100gold age2cost against early reinforcements, economic recovery and defense rather than merely adjust waiting times. V5.10 already paid for age2 and cannot legally refund it. Testing delayed technology therefore requires a fresh native Start with the same Seed/Normal, retaining old samples. The finalV5.13save is defeated and cannot continue; the latest living checkpoint remainsv510-continuation/save-snapshot.json, also in age2. Do not claim natural New Game+ before an actual ten-wave win.

**中文：** 本輪因執行窗口結束安全保存，所有戰役程序已結束，無新的公開發布。跨對話寫入不可用，僅保存GitHub交接，未宣稱送達。歷史性能FAIL、低FPS、嚴格Save/Load、Rift Prototype未重現及HARDWARE_TEST_PENDING均保留。

**English:** Safely checkpointed at the execution-window limit; all campaign processes have ended and no public release occurred. Cross-thread writing is unavailable, so only GitHub handoff is persisted; delivery is not claimed. Historical performance FAIL, low-FPS, strict Save/Load, unreproduced Rift Prototype and HARDWARE_TEST_PENDING remain.
