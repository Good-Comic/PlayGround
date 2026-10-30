# 文明英雄精簡 QA 接續 / Compact civilization-hero QA handoff

| 英雄 / Hero | 精確來源 / Exact source | 定向結果 / Scoped result |
|---|---|---|
| TEU 戰鎚翼冠 / Hammer/winged helm | e5ccf8d1042aefed8cbd240045b3995c6ae86341 | 8 Node / 16 Chromium PASS |
| JPN 雙手刀背旗 / Sword/back banner | 9d8a9f9710a1b1701b36c17e6d32bb15d05cdc3a | 5 Node / 17 Chromium PASS; 1 affected TEU check |
| AZT 美洲虎黑曜石 / Jaguar/obsidian | 0333583ff5db69404272f20d058518eef9a10443 | 8 Node / 16 Chromium PASS; 2 affected crop checks |

繁體中文：主要 Diff 為三個文明獨立原創 SVG／PNG／生成器、六種八方向動作（含施法，共各192格）、身體點選 descriptor、技能徽記、離線透明裁格資訊及 renderer 快取矩形重用。game.js、data.js、hero-skills.js 未變更；不是普通盾衛換色，也沒有改碰撞、導航、英雄數值、技能效果／冷卻。三者在目前 renderer 按文明載入，其餘英雄保留共用 fallback。Node 數含共用回歸，不能相加當獨立覆蓋。

English: Main diff adds three original civilization SVG/PNG/generators, six eight-direction actions including cast (192 cells each), body-picking descriptors, skill emblems, offline alpha crops and cached renderer rectangles. game.js/data.js/hero-skills.js are unchanged. These are beyond guard recoloring, without collision/navigation/hero-stat/skill-effect/cooldown changes. Active-civ loading applies; other heroes retain shared fallback. Node counts include shared regression, not additive unique coverage.

繁體中文：玩家步驟：首頁選 TEU／JPN／AZT、Start；左鍵英雄頭部，右鍵地面移動，再右鍵敵軍近戰；選取英雄後使用 Mark／Aegis 按鈕。觀察不同裝備、攻擊、受擊、金色標記／藍色護盾徽記及施法動作。證據位於 docs/evidence/v240-teu-hero、v240-jpn-hero、v240-azt-hero，含實際影片、畫面、來源 manifest 與原始繪製樣本。QA fixture 清場、500 HP 目標、240秒準備不是自然戰役。192格在單位繪製倍率下裁格／完整繪製像素完全相同，不代表任意倍率逐像素都已驗證。

English: Player steps: select TEU/JPN/AZT, Start, click hero head, right-click movement/enemy melee, then native Mark/Aegis buttons. Observe distinct kit/attack/hit, gold mark/blue shield emblems and cast poses. Evidence directories docs/evidence/v240-teu-hero, v240-jpn-hero and v240-azt-hero contain actual video/images/source manifests/raw draw samples. Cleared scenes/500-HP targets/240s preparation are QA fixtures, not natural campaigns. All192 frames have identical cropped/full pixels at unit draw scale; arbitrary fractional-scale pixel equality is not fully certified.

繁體中文：保留 TEU 首次時間假設 FAIL、裁格前性能 FAIL，JPN 普通近戰被既有格擋擋掉的 fixture FAIL，及 AZT 隔離前後兩個首組 +30% 性能 FAIL。最終來源通過原門檻，不抹除變異。共用快取熱路徑已修改，獨立 QA 應查不同倍率、擁擠／遮擋、選取相鄰單位、慢速載入、其他兵種裁格與其他裝置；不可從100英雄 renderer-only 比較推論 FPS／硬體通過。

English: Preserve TEU timing-assumption/pre-crop performance FAIL, JPN fixture damage correctly absorbed by existing block, and two AZT first-pair +30% performance failures before/after measurement isolation. Final sources pass original gates without erasing variability. Shared crop-cache hot path changed: independent QA should examine fractional zoom/crowding/occlusion/adjacent selection/slow loads/other-unit crops/other devices. A100-hero renderer-only comparison is not FPS/hardware acceptance.

繁體中文：舊 GDD 的 Aegis 範圍4與現有 hero-skills.js 範圍5有既存差異；依本次保留現有技能規則的指令沒有修改。歷史自然十波／NG+、時鐘、嚴格 Save/Load、渲染性能、Rift 與硬體缺口保留。沒有啟動或等待第二 Agent，不寫 QA 分支，不公開部署。主開發接續英雄兵器音效。

English: Legacy GDD Aegis radius4 differs from existing hero-skills.js radius5; this inherited discrepancy remains under the instruction to retain current skill rules. Historical natural ten-wave/NG+, clock, strict saves, rendering, Rift/hardware gaps remain. No second Agent launched/waited for, no QA-branch writes or public deployment. Main development continues hero weapon sound.

BILINGUAL_DOCUMENTATION_REQUIRED = true
