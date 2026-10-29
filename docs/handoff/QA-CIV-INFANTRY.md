# 文明步兵精簡 QA 接續 / Compact civilization-infantry QA handoff

| 切片 / Slice | 遊戲來源 / Game source | 定向驗收 / Focused acceptance | 保存 / Saving |
|---|---|---|---|
| TEU 板甲長盾 / plate/tower-shield guard | 6079cd8b4c53b0afbb811aa29f47a9f482f28621 | 9 Node / 13 Chromium PASS | Remote evidence951a4845e5dc12ae20a4c9b4182c3b21891673f6 |
| AZT 棉甲羽冠／黑曜石刃武器 / quilted armor/feathers/obsidian weapon | a7900ce7b833f65720206c3f611e0180a29e024d | 3 Node / 13 Chromium PASS | Remote-saved through a1fa940d926a467f2d231232eff39a0f0bcf4d10 |
| BYZ 札甲圓盾槍兵 / lamellar/round-shield spearman | c8c4ec1444e5b84cba935bff70dd06897fd6a982 | 3 Node / 13 Chromium PASS | Source pushed; evidence included with this packet |

繁體中文：主要 Diff 為 CIV_UNIT_SPRITE_ATLASES 三個文明 key、原創 SVG／PNG／生成器、descriptor 血條高度與 renderer 讀取；game.js、data.js 及規則未改。原生玩家流程為首頁選 TEU／AZT／BYZ、Start、發展至適用時代，軍營付費訓練 guard／militia／spearman，再右鍵移動、攻擊。自動證據明示受控時代、準備時間及清場，使用同一真正訓練產出單位，不是自然戰役。報告／圖片／影片／原始繪製樣本見 docs/evidence/v240-teu-guard、v240-azt-militia 與 v240-byz-spearman。

English: Main diff adds three CIV_UNIT_SPRITE_ATLASES keys, original SVG/PNG/generator and descriptor/renderer health-bar height; game.js/data.js/rules are unchanged. Native player steps: select TEU/AZT/BYZ, Start, progress to the applicable age, pay barracks training for guard/militia/spearman, then right-click move/attack. Automated evidence explicitly controls age/preparation/scene clearing and uses the same real trained output; not natural-campaign acceptance. Reports/images/videos/raw drawing samples are in docs/evidence/v240-teu-guard, v240-azt-militia and v240-byz-spearman.

繁體中文：已檢視代表方向、縮放、近戰與死亡；160 格邊界與實際四格攻擊／死亡通過，繪製比較通過，沒有本切片遊戲 FAIL。仍需獨立 QA 檢視擁擠戰場、實際生態遮擋、其他裝置、長戰鬥與完整美術品質。全部既有自然十波／NG+、低 FPS、嚴格 Save/Load、歷史渲染性能、Rift／硬體缺口保留。沒有啟動第二 Agent。曾觀測認證失敗，之後正常 Git 讀寫／Push 已恢復，停止準備已取消。原失敗保留，不強制覆蓋遠端。主開發接續檢查新步兵頭部可選取性；QA 應特別查上下遮擋與羽冠／武器是否誤選鄰近單位。

English: Representative directions/zoom/melee/death were reviewed; 160 frame borders, actual four-frame attack/death and drawing comparisons pass, with no game FAIL in these slices. Independent QA should examine crowded combat, natural-biome occlusion, other devices, long battles and full art quality. Existing natural ten-wave/NG+, low-FPS, strict Save/Load, historical render-performance, Rift/hardware gaps remain. No second Agent was launched. Authentication failure was observed, then normal Git reads/writes/push recovered and the provisional stop was cancelled. Original failures remain; do not force-overwrite remote. Main development continues with native head picking; QA should examine vertical occlusion and whether feathers/weapons misselect nearby units.

BILINGUAL_DOCUMENTATION_REQUIRED = true

## 第四切片輸入修復 / Fourth-slice input correction

繁體中文：頭部點選原始 FAIL 已重現並修復，來源 `659b1b2ba472150da5abb75c22550ee86873b737`，8 Node／16 Chromium PASS。見 docs/evidence/v240-infantry-picking/REPORT.md 與原始失敗／前後影片。實體半徑不變，獨立 QA 仍需檢查擁擠遮擋／相鄰單位誤選。

English: Native head-picking FAIL reproduced and fixed at `659b1b2ba472150da5abb75c22550ee86873b737`, eight Node/16 Chromium PASS; see docs/evidence/v240-infantry-picking/REPORT.md and original failure/before-after video. Physical radii unchanged; independent QA should still check crowded occlusion and adjacent-unit misselection.

## 第五切片 MAG 輕騎 / Fifth-slice MAG light cavalry

繁體中文：來源 `4dfeb7d57512bcde07b9876d15b9a4a596b346d7`；4 Node／13 Chromium PASS，軍廄原生付費訓練、移動、近戰、受擊、實際死亡、方向與縮放圖片／影片及繪製樣本見 docs/evidence/v240-mag-cavalry。與 FRK 披掛騎槍不同的裸馬、弧刀、圓盾、皮甲、尖頂盔；成本折扣與首擊規則不變。下一組從近戰聲音差異開始，沒有啟動 QA Agent。

English: Source `4dfeb7d57512bcde07b9876d15b9a4a596b346d7`; four Node/13 Chromium PASS. Native paid stable training, movement, melee, hit, actual death, directional/zoom images/video and drawing samples: docs/evidence/v240-mag-cavalry. Unbarded horse/sabre/round shield/leather/conical helm differ from Frankish caparison/lance; discounted cost/first-hit rules unchanged. Next group begins with melee sound differentiation; no QA Agent launched.
