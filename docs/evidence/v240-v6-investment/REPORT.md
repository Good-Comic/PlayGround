# V6投資與集中防守 / V6 investment and concentrated defense

**中文：** 根據既有V1–V4對照（v240-v5-playability）及V5–V5.13原始結果，共同瓶頸是村民／採集區失守造成食物與補兵崩潰，並伴隨資源失衡、過早科技投資、兵力分散及原生輔助競爭預算；V2及無效設定樣本不是戰敗證據。不能因策略失敗判定Normal不可通關。本輪不重跑舊驗收。

**English:** ExistingV1–V4 comparisons (v240-v5-playability) and rawV5–V5.13 results share worker/resource-line losses leading to food/reinforcement collapse, alongside allocation imbalance, early technology investment, split forces and native-aid budget competition. V2 and invalid-settings samples are not defeat evidence. Policy failure does not establish Normal impossibility. No historical acceptance reruns this round.

**中文：** 本輪採正式Start、相同MILESTONE-NORMAL／TEU／steppe、1×、手動經濟與軍費，集中Guard城心並建第二塔。第二時代研究先等軍事人口12，且仍須原生檢查實際200食物／100黃金；不退還資源、不改平衡。這不是只改時間等待。工具記錄opening_policy=economy、defense=core；10項策略測試通過。實際遊戲來源a58abaf370376b8085ea0c852c40a60dba04fae5；後續狀態／暫停修復不套入執行中的遊戲，以免混淆版本。初期另一組短瀏覽器存檔驗證曾並行，故此樣本不是性能基準。

**English:** Uses native Start, the sameMILESTONE-NORMAL/TEU/steppe,1×, manual economy/military spending, concentrated core Guard and a second tower. Age2waits for12military population and still pays the native200food/100gold cost; no refunds or balance changes. This is not a timer-only adjustment. The tool records opening_policy=economy and defense=core;10policy tests pass. Actual game source is a58abaf370376b8085ea0c852c40a60dba04fae5; later status/pause fixes are not applied to the running game, preserving source separation. A short save-browser verification overlapped early in the run, so this is not a performance benchmark.

**中文：** 真實即時Normal戰役進行中，未宣稱十波或New Game+通過。門檻為完整十波自然勝利、原生最多三卡繼承與重置、第二周目實際戰鬥；持續保存實際失敗。

**English:** Actual real-time Normal campaign is active; no ten-wave or New Game+ pass claimed. Gates remain complete natural ten-wave victory, native up-to3-card inheritance/reset and actual cycle2combat; preserve real failures.

## V6正式結果：工具中斷而非戰敗 / V6 result: harness interruption, not defeat

**中文：** V6自然結算第三波後進入選卡，模擬465.0951秒。週期存檔的Pause點擊恰遇boon-overlay，被合法遮擋而逾時，HARNESS_ACTION_TIMEOUT；無遊戲Console／Page例外。終點城心3600/3600，仍存活。不得列十波PASS或自然戰敗。原生第一波結算於wall171.802秒領取rift_prototype，原型單位持續活躍；此Seed／TEU情境未重現自然當機，不是已修復玩家問題。

**English:** V6naturally settled wave3and entered card choice at simulation465.0951seconds. A periodic-save Pause click raced with boon-overlay and legitimately timed out: HARNESS_ACTION_TIMEOUT, without game Console/Page errors. Final core3600/3600and alive. This is neither ten-wave PASS nor natural defeat. Native wave1reward claimedrift_prototype at wall171.802seconds; the prototype remained active. This Seed/TEUcase did not reproduce the natural crash; it does not establish a fix for the player's report.

**中文：** 修正存檔工具：只有活動prep／wave才嘗試原生Pause；若選卡攔截則記錄延後、回到主流程，不強制點擊。終點boon診斷快照未被視作可恢復檢查點，因既有snapshot未保存boonChoices；使用已經原生Save過的checkpoint-380.json（第三波375.2841秒），SHA256 e9911273ed01c69f6bd8e54d2b0c65c9731580a5d3c1aa1ecfbcc91ca9bf49f7。

**English:** The save harness now attempts native Pause only in activeprep/wave. If card choice intercepts it, log a deferral and return to the normal loop without forced clicks. The finalboondiagnostic snapshot is not treated as recoverable because the existing snapshot omitsboonChoices. Use the previously natively savedcheckpoint-380.json (wave3,375.2841seconds), SHA256e9911273ed01c69f6bd8e54d2b0c65c9731580a5d3c1aa1ecfbcc91ca9bf49f7.

**中文：** 下一組限定接續改用已驗證cfc42ee遊戲來源，加入庫存感知採集：以正式弓兵成本×8作木／金預算，充足時轉食物、不足時恢復採木／金。11項策略測試通過。來源、工具與起點均分組；不把兩版本合併成完整自然通關。

**English:** The next scoped continuation uses verified game sourcecfc42eeand stock-aware labor: native archer costs×8define wood/gold buffers, freeing workers for food when stocked and restoring wood/gold labor when depleted. Eleven policy tests pass. Keep sources, tools and continuation points separated; do not combine versions into a full natural victory.

## 限定接續結果與停止 / Scoped continuation and stop

**中文：** cfc42ee來源的45秒接續結束於第三波422.7148秒，BOUNDED_SAMPLE_INCOMPLETE，軍事6、村民2，無例外／失敗請求。四次食物採集原生命令成功，但村民由6降2，策略生存未通過。當前存活快照位於stock-continuation/save-snapshot.json，校驗見resume-integrity.json；其工具、來源及起點不同，不和前段拼接成完整通關。下一步分析死亡地點、護衛範圍與返程／採集資源可達性，而非再調時間等待或更改Normal。

**English:** The45-second continuation fromcfc42eeended at wave3,422.7148simulation seconds: BOUNDED_SAMPLE_INCOMPLETE,6military and2workers, no errors/failed requests. Four native food-gather commands succeeded, but workers fell6→2, so survival has not passed. The current living snapshot isstock-continuation/save-snapshot.json with digest inresume-integrity.json. Different tools/source/start point must not be stitched into a full victory. Next analyze death locations, guard range and return/resource reachability instead of adjusting waiting times or Normal.

**中文：** 本輪因執行窗口安全保存，沒有活躍戰役程序；所有權於Push後釋放。低FPS、嚴格Save/Load、性能FAIL、Rift Prototype未重現與硬體待測保留。地形成本Custom方案已詢問、尚未批准，不實作未決平衡規則。RELEASE_BLOCKED，無公開發布。

**English:** Safely checkpointed at the execution-window limit; no campaign remains active. Ownership is released after push. Retain low-FPS, strict Save/Load, performance FAIL, unreproduced Rift Prototype and hardware-pending issues. The Custom terrain-cost proposal was asked but remains unapproved; do not implement undecided balance rules. RELEASE_BLOCKED; no public deployment.
