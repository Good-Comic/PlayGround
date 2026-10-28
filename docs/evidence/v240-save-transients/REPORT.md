# 戰鬥暫態存檔修復 / Combat transient save repair

**中文：** 原版本424e246在Save/Load後清空飛行投射物與傷害／煙霧區域，最小測試確認投射物數由1變0。修復保存剩餘計時、位置與來源／目標引用，於實體重建後解析；舊存檔缺少欄位仍可讀。36項定向戰鬥、姿態、命令及暫態測試通過。真實瀏覽器待驗，不宣稱嚴格Save/Load確定性或自然戰役通過。

**English:** Version424e246 clears in-flight projectiles and damage/smoke zones after Save/Load; the minimal test confirms projectile count drops from1to0. The fix preserves remaining timers, position and source/target references, resolving them after entity reconstruction. Legacy saves without these fields remain loadable.36directed combat, stance, order and transient tests pass. Actual browser verification is pending; strict Save/Load determinism and natural campaign acceptance are not claimed.
