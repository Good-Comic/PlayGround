# 資源選取介面例外修復 / Resource Selection UI Exception Fix

**繁體中文：** V5.3 自然戰役在第二波遭遇 `BROWSER_ERROR`：`UI.renderSelection` 將資源當作兵種，讀取不存在的 `typeDef.attack`。這不是戰敗。原始遊戲來源 `a5a538d287b9c29951a83ebede5431db9fce7dc7`；真實 Chromium 從正常入口點擊可見食物資源，獨立重現同一例外。原版的觀察時間仍有前進，因此此證據不代表永久主迴圈停止，也不等於原玩家 Rift Prototype 當機已重現。

**English:** V5.3 encountered `BROWSER_ERROR` during wave2: `UI.renderSelection` treated a resource as a unit and accessed nonexistent `typeDef.attack`. This was not defeat. Original game source `a5a538d287b9c29951a83ebede5431db9fce7dc7`; independent real Chromium normal-start clicking of a visible food resource reproduced the same exception. Observed original game time still advanced, so this evidence does not establish a permanently stopped main loop or reproduce the player's Rift Prototype crash.

**繁體中文：** 修復來源 `0f85357303bf2bca809e6ff32b490769e1d3f836`。資源選取現在顯示名稱、剩餘量、資源類別與既有四語系的採集指引，不讀取兵種戰鬥屬性；後續面板更新同樣辨識資源。未改 `js/game.js`、`js/data.js`、`js/world.js` 或 Normal 規則。原始失敗單元測試與瀏覽器錯誤保留。

**English:** Fix source `0f85357303bf2bca809e6ff32b490769e1d3f836`. Resource selection now shows its name, remaining amount, resource category and gathering guidance in all four existing locales without reading unit combat attributes; subsequent panel updates also recognize resources. `js/game.js`, `js/data.js`, `js/world.js` and Normal rules are unchanged. Preserve the original failing unit test and browser exception.

**繁體中文：** 定向10項 Node 測試通過。精確34檔修復 Artifact 以真實 Chromium 驗證食物／木材／黃金／石材，分別使用英文／繁中／簡中／日文；四次資源選取與原生 Save／Reload／Continue 均通過，Page Error 為0，觀察期間遊戲時間持續前進。四語各704個鍵。這是限定 `LOCAL_VERIFIED`；未公開部署、未宣稱完整 QA、十波或硬體驗收通過。原始影像與連續錄影在 before／after 目錄。

**English:** All10 directed Node tests passed. The exact34-file fixed artifact was tested in real Chromium for food/wood/gold/stone using English/Traditional Chinese/Simplified Chinese/Japanese respectively. All four resource selections and native Save/Reload/Continue checks passed with0Page Errors and advancing game time. Each locale has704keys. This is scoped `LOCAL_VERIFIED`, not public deployment, full QA, ten-wave or hardware acceptance. Actual images and continuous video are in before/after.
