# 戰鬥暫態存檔修復 / Combat transient save repair

**中文：** 原版本424e246在Save/Load後清空飛行投射物與傷害／煙霧區域，最小測試確認投射物數由1變0。修復保存剩餘計時、位置與來源／目標引用，於實體重建後解析；舊存檔缺少欄位仍可讀。36項定向戰鬥、姿態、命令及暫態測試通過。真實瀏覽器待驗，不宣稱嚴格Save/Load確定性或自然戰役通過。

**English:** Version424e246 clears in-flight projectiles and damage/smoke zones after Save/Load; the minimal test confirms projectile count drops from1to0. The fix preserves remaining timers, position and source/target references, resolving them after entity reconstruction. Legacy saves without these fields remain loadable.36directed combat, stance, order and transient tests pass. Actual browser verification is pending; strict Save/Load determinism and natural campaign acceptance are not claimed.

## 真實瀏覽器與剩餘缺口 / Actual browser and remaining gaps

**中文：** 精確來源 `a58abaf370376b8085ea0c852c40a60dba04fae5` 的34檔本地Artifact，真實Chromium原生Start／Pause／Save／Reload／Continue通過三項檢查：特定投射物與來源／目標保留、Boss及煙霧剩餘時間保留、恢復後攻擊實際結算。這是明確標示CONTROLLED_FIXTURE的戰鬥準備，不是自然戰役或公開網站。Console／Page／失敗請求皆0。第一次工具錯誤要求所有投射物總數等於1，但恢復後其他實體正常產生新投射物；失敗原始結果保留。修正後追蹤特定投射物，沒有修改遊戲來滿足測試。

**English:** The exact34-file local artifact from `a58abaf370376b8085ea0c852c40a60dba04fae5` passed three actual Chromium checks through native Start/Pause/Save/Reload/Continue: preserved the identified projectile and typed references, retained Boss/smoke remaining times, and resolved attacks after resuming. Combat preparation is explicitly CONTROLLED_FIXTURE, not natural campaign or public-site acceptance. Console/Page/failed requests:0. The initial harness incorrectly required total projectile count1although other entities legitimately launched new attacks; original failure retained. Corrected checks track the identified projectile, without changing gameplay to satisfy the test.

**中文：** 受影響固定步長原型4項測試通過，但輸出仍明示determinism_equal=false。10Hz正式更新10秒僅模擬5秒；主迴圈與Game.update各自截斷0.05秒。原型仍不安裝，導航與其他暫態仍需處理。本修復只完成投射物／區域的限定Save/Load一致性，不解決全部RNG、導航、時鐘或舊存檔已遺失的攻擊。

**English:** Four affected fixed-step prototype tests pass, but explicitly report determinism_equal=false. Ten seconds at10Hz through production updates advances only5simulation seconds; main loop and Game.update independently clip to0.05seconds. The prototype remains uninstalled; navigation and other transients still need work. This fix provides scoped projectile/zone Save/Load consistency, not complete RNG/navigation/clock determinism or recovery of attacks already omitted in old saves.

## 第二個確定性缺陷：暈眩強度 / Second deterministic defect: stun strength

**中文：** 另已重現Save/Load只保存slowUntil而未保存slowAmount：完整暈眩原應速度0，讀檔後卻變2.04。新增強度欄位後，全暈與40%緩速在原到期時間前後保持一致；21項受影響測試通過。此修正不改技能數值，只保留既有效果；真實瀏覽器新來源驗證尚待完成。

**English:** Also reproduced Save/Load retaining slowUntil but omitting slowAmount: a full stun should yield speed0but resumed at2.04. Saving the strength field preserves full stun and40%slow before/after the original expiry;21affected tests pass. This retains existing effects without changing skill values. Actual browser verification of the new source remains pending.

## 暫停期間的戰鬥時鐘 / Combat clock while paused

**中文：** 最小重現亦確認：暫停或選卡時Game.time仍增加，讓以slowUntil表示的完整暈眩在暫停中自然消失。修復只把戰鬥絕對時間累計移至活動模擬區塊；相機與粒子仍走既有更新，不安裝固定步長、不改正式低FPS截斷。42項受影響測試通過，包括暫停／選卡／主選單不消耗狀態時間。真實瀏覽器新來源驗證待完成。

**English:** A minimal reproduction also confirms Game.time advanced while paused or choosing cards, allowing full stuns expressed with slowUntil to expire during pause. The fix only moves combat absolute-time accumulation into active simulation; camera/particles retain their existing updates. No fixed-step installation or change to production low-FPS clipping.42affected tests pass, including pause/card/menu preserving status time. Actual browser verification of this source is pending.

## 最新來源瀏覽器驗證 / Latest-source browser validation

**中文：** `8f202458a5b11f9e96b937aefd26ce175b17ba3b` 四項原生瀏覽器檢查通過，包括完整暈眩讀檔後速度0。`cfc42ee511b35cbefe1359af476fbd9396054a70` 五項通過，新增原生Pause等待1.5秒後戰鬥時間不變；投射物、Boss／煙霧及恢復結算仍通過。兩組皆34檔精確Artifact，Console／Page／失敗請求0；原始WebM與截圖分別保存，不合併來源。此為實際本地Chromium且使用受控戰鬥場景，不是公開網站或自然通關。

**English:** Four native-browser checks pass at `8f202458a5b11f9e96b937aefd26ce175b17ba3b`, including zero-speed full stun after loading. Five pass at `cfc42ee511b35cbefe1359af476fbd9396054a70`, adding unchanged combat time after1.5seconds in native Pause; projectile, Boss/smoke and resumed resolution checks remain passing. Both use exact34-file artifacts with0Console/Page/failed-request errors. Original WebM and screenshots are stored separately by source. This is actual local Chromium with controlled combat, not public-site or natural-victory acceptance.
