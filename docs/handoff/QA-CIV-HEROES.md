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

## 聲音與肖像 / Audio and portraits

聲音來源／Audio source `3c8a493d32b8fee6ed9e1bb18cc8b756677b4f58`: 7 Node /19 Chromium PASS. 原生開始後右鍵攻擊、靜音及恢復；檢查文明來源與共用節流。 / Native start, right-click attacks, mute/unmute; inspect civilization routing and shared throttling. WAV 為 SFX 分流，不是人工聽感或硬體驗收。 / WAV taps SFX; no human listening or hardware acceptance claim.

肖像來源／Portrait source `296772b1709df5370c58c36e9ea3aee83c0bc446`: 4 Node /32 Chromium PASS. 選取 TEU/JPN/AZT 英雄並對照世界外觀；FRK、村民維持程序肖像。受控載入旗標不是 HTTP 驗收。 / Select TEU/JPN/AZT heroes and compare with world appearance; FRK/villagers retain procedural portraits. Controlled loading flags are not HTTP acceptance.

五個相關切片已備妥獨立 QA 資料，未啟動第二位 Agent。 / Five related slices prepared for independent QA; no second agent launched.

## VIK／FRK 後續 / Subsequent VIK/FRK

來源／Source `97b11b64ce4c13772318e9ddda7387297650d9e1`: 28 affected Node PASS,17 Chromium per civilization PASS. 原生開始後選取英雄，八向移動、近戰及 Q/E 技能；對照圓盾兵／一般盾衛、肩側符文／百合標記和選取肖像。 / Native start, hero selection, eight-direction movement, melee and Q/E skills; compare round-shield/generic guards, shoulder rune/fleur-de-lis feedback and selection portraits. 每文明原始畫面、影片、失敗及性能樣本依各 evidence 目錄保留。 / Raw images, videos, failures and performance samples remain in each evidence folder. 未啟動獨立 QA。 / Independent QA not launched.
