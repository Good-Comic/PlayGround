# 英雄／招募使／Boss 頭部選取修復 / Hero/recruiter/Boss head-picking fix

來源／Source: `4e6d62ece169a34d98f8b9beced063172daba02b`. 原始失敗／Original failure: `4c5ae01fb886067443aa5bc51204f4e2e6b78ec9`.

繁體中文：真實左鍵重現四個可見頭部選取 FAIL，四個腳部正向對照均 PASS，遊戲未暫停。沿用既有英雄、招募使及雙 Boss Atlas，新增 UI 身體橢圓；兩種敵軍 Boss 正確包含既有 typeDef.scale。沒有重製圖檔，也沒有修改物理半徑、成本、平衡、技能或導航。杖尖、身體外長兵器、血條與遠處空地不擴大為選取區。

English: Real left clicks reproduce four visible-head selection failures, with all four foot positive controls passing and the game unpaused. Existing hero/recruiter/two-Boss atlases gain UI body ellipses, including existing typeDef.scale for enemy Bosses. No image recreation or radius/cost/balance/skill/navigation changes. Staff tips, weapons outside the body, health bars and distant ground are excluded.

繁體中文：9 Node PASS（新操作 3、受影響英雄 Atlas／裁格 3、相關資源／同型選取 3）；15 真實 Chromium PASS。英雄與招募使頭部左鍵選取後接受實際右鍵移動；英雄選取後原生 Aegis 按鈕確實賦予既有 60 護盾並進入既有冷卻；以玩家盾衛原生右鍵點兩種 Boss 頭部均指定正確攻擊目標。無瀏覽器／資源錯誤。已人工檢視 Aegis、招募使與 Boss 目標圖片，原始 FAIL、前後影片保留。

English: Nine Node checks PASS (three new input, three affected champion atlas/crop, three related resource/same-type checks); 15 actual Chromium checks PASS. Head-selected hero/recruiter accept real right-click moves. The native Aegis button grants the existing 60 shield and existing cooldown. Native right clicks by a player guard on both Boss heads target the correct Boss. No browser/resource errors. Aegis/recruiter/Boss-target images were manually inspected; original FAIL and before/after video remain.

繁體中文：100 英雄、2000 查詢均正確；此序列基準／修復平均 0.0695／0.05785 ms，p95 0.16／0.10 ms，低於本地 1 ms 輸入預算；不宣稱跨硬體提速或 FPS。受控場景清除了建築與其他單位，因此 HUD 城鎮中心顯示 LOST；這是 fixture 狀態，不是自然戰役結果。Boss 測試只驗證選取／攻擊命令，不是自然 Boss 戰鬥或十波通關。所有歷史 FAIL 與硬體缺口保留，未公開發布。下一項為 TEU 等文明英雄的獨立裝備與既有技能視覺。

English: All 2,000 queries over 100 heroes are correct; serial baseline/fix mean is 0.0695/0.05785 ms and p95 0.16/0.10 ms, below the local 1 ms input budget. No cross-hardware speedup or FPS claim. Controlled scenes clear buildings/other units, so the Town Center HUD reads LOST; this is fixture state, not a natural-campaign outcome. Boss checks cover picking/attack orders, not natural Boss combat or ten-wave victory. Historical FAIL/hardware gaps remain; no public deployment. Next: independent civilization-hero equipment and existing-skill visuals, beginning with TEU.

BILINGUAL_DOCUMENTATION_REQUIRED = true
