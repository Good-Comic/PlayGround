# 第三組精簡 QA / Third compact QA group

| 成果 / Outcome | 來源 / Source | 定向結果 / Scoped result |
|---|---|---|
| TUR 反曲弓 / Recurve archer | ce26f7f405e1cdb1d5a46cc51b4c25bbcad79dda | 3 Node / 14 Chromium PASS |
| 文明解碼生命週期 / Civ decode lifecycle | 4c5ae01fb886067443aa5bc51204f4e2e6b78ec9 | 15 Node / 15 Chromium PASS |
| 英雄／Boss 頭部命令 / Hero/Boss head input | 4e6d62ece169a34d98f8b9beced063172daba02b | 9 Node / 15 Chromium PASS |

繁體中文：Diff 為 TUR 原創圖集／生成器／descriptor，文明圖集按需 Image 解碼與舊裁格引用釋放，以及既有英雄／Boss 身體點選範圍。原生操作：TUR 射箭場付費訓練弓兵，點頭部、右鍵移動／射擊；切換文明或讀取不同文明存檔，確認裝備與動畫正確；點英雄頭部後原生 Aegis 按鈕，玩家單位右鍵 Boss 頭部指定攻擊。資料見 docs/evidence/v240-tur-archer、v240-atlas-loading、v240-champion-picking。Node 數包含共用回歸，不相加當獨立覆蓋。

English: Diff adds original TUR atlas/generator/descriptor, active-civ Image decoding/stale crop-reference release and existing hero/Boss body picking. Native steps: pay archery-range training for a TUR archer, click its head, move/fire by right click; change civilization or restore a different-civ save and check correct kit/animation; select hero head/use native Aegis, and right-click Boss heads with a player unit to attack. Evidence: docs/evidence/v240-tur-archer, v240-atlas-loading and v240-champion-picking. Node counts include shared regressions, not unique additive coverage.

繁體中文：獨立 QA 需查慢速圖片載入／失敗、長時間多次換文明、瀏覽器記憶體回收、敵我重疊頭部命中區及自然 Boss 戰鬥。398→154 MiB 是解碼尺寸 RGBA 代理值，不是實測 RAM；完整 integrity 仍下載 payload。存檔測試只驗證文明換圖，不清除嚴格確定性 FAIL。清場 fixture HUD 的 LOST 不代表自然戰役失敗。保留四個原始頭部點選 FAIL、全部歷史自然十波／NG+、低 FPS、渲染性能、Rift 與硬體缺口。不啟動第二 Agent、不公開部署。

English: Independent QA should examine slow/failed image loading, many long-session civ switches, native memory reclamation, overlapping friendly/hostile head regions and natural Boss combat. 398→154 MiB is a decoded-size RGBA proxy, not measured RAM; full integrity still downloads the payload. Snapshot testing covers civilization image activation, not strict determinism. Fixture HUD LOST is not a natural-campaign defeat. Preserve four original head-picking failures and historical natural ten-wave/NG+, low-FPS, rendering, Rift/hardware gaps. No second Agent or public deployment.

BILINGUAL_DOCUMENTATION_REQUIRED = true
