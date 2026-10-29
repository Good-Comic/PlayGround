# 文明步兵精簡 QA 接續 / Compact civilization-infantry QA handoff

| 切片 / Slice | 遊戲來源 / Game source | 定向驗收 / Focused acceptance | 保存 / Saving |
|---|---|---|---|
| TEU 板甲長盾 / plate/tower-shield guard | 6079cd8b4c53b0afbb811aa29f47a9f482f28621 | 9 Node / 13 Chromium PASS | Remote evidence951a4845e5dc12ae20a4c9b4182c3b21891673f6 |
| AZT 棉甲羽冠／黑曜石刃武器 / quilted armor/feathers/obsidian weapon | a7900ce7b833f65720206c3f611e0180a29e024d | 3 Node / 13 Chromium PASS | Local only; GitHub authentication blocked |

繁體中文：主要 Diff 為 CIV_UNIT_SPRITE_ATLASES 兩個文明 key、原創 SVG／PNG／生成器、descriptor 血條高度與 renderer 讀取；game.js、data.js 及規則未改。原生玩家流程為首頁選 TEU／AZT、Start、發展至適用時代，軍營付費訓練 guard／militia，再右鍵移動、攻擊。自動證據明示受控時代、準備時間及清場，使用同一真正訓練產出單位，不是自然戰役。報告／圖片／影片／原始繪製樣本見 docs/evidence/v240-teu-guard 與 v240-azt-militia。

English: Main diff adds two CIV_UNIT_SPRITE_ATLASES keys, original SVG/PNG/generator and descriptor/renderer health-bar height; game.js/data.js/rules are unchanged. Native player steps: select TEU/AZT, Start, progress to the applicable age, pay barracks training for guard/militia, then right-click move/attack. Automated evidence explicitly controls age/preparation/scene clearing and uses the same real trained output; not natural-campaign acceptance. Reports/images/videos/raw drawing samples are in docs/evidence/v240-teu-guard and v240-azt-militia.

繁體中文：已檢視代表方向、縮放、近戰與死亡；160 格邊界與實際四格攻擊／死亡通過，繪製比較通過，沒有本切片遊戲 FAIL。仍需獨立 QA 檢視擁擠戰場、實際生態遮擋、其他裝置、長戰鬥與完整美術品質。全部既有自然十波／NG+、低 FPS、嚴格 Save/Load、歷史渲染性能、Rift／硬體缺口保留。沒有啟動第二 Agent。認證失敗是真實保存阻塞；先重新核對遠端及所有權再 Push 本地提交，不重做素材／測試、不強制覆蓋遠端；之後接續 BYZ 槍兵。

English: Representative directions/zoom/melee/death were reviewed; 160 frame borders, actual four-frame attack/death and drawing comparisons pass, with no game FAIL in these slices. Independent QA should examine crowded combat, natural-biome occlusion, other devices, long battles and full art quality. Existing natural ten-wave/NG+, low-FPS, strict Save/Load, historical render-performance, Rift/hardware gaps remain. No second Agent was launched. Authentication failure actually blocks remote saving: revalidate remote/ownership before pushing local commits without recreation/retests/force, then continue BYZ spearmen.

BILINGUAL_DOCUMENTATION_REQUIRED = true
