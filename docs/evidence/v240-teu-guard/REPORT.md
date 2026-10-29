# TEU 厚板甲長盾盾衛八方向動作已整合 / TEU plate-armored tower-shield guard directional actions integrated

來源／Source: `6079cd8b4c53b0afbb811aa29f47a9f482f28621`. 狀態／Status: SCOPED_ACCEPTANCE_PASS.

繁體中文：TEU 厚板甲長盾盾衛八方向動作已整合。原創 SVG／PNG 與可重現生成器，沿用 Canvas 2D 與 PNG 裁格快取；不是換色，也沒有第三方資產依賴。只套用指定文明的既有玩家兵種，保留其他文明／敵軍路由。沒有修改 game.js、data.js、碰撞、導航、成本、傷害或平衡規則；較高頭盔以 descriptor 血條高度保持資訊清晰。

English: TEU plate-armored tower-shield guard directional actions integrated. Original SVG/PNG and reproducible generator use Canvas 2D/cached PNG frames, beyond recoloring and without third-party assets. Only the designated civilization's existing player unit changes; other civilizations/enemies retain routing. game.js/data.js, collision, navigation, cost, damage and balance rules are unchanged. Descriptor health-bar height keeps taller helmets readable.

繁體中文：9 項定向 Node、13 項真實 Chromium PASS。原生首頁選文明／Start，明示 CONTROLLED_FIXTURE 設時代、延長準備及清場後，原生命令付費訓練；同一個真正訓練出的單位接著右鍵移動與近戰。全部 160 格邊界透明；實際攻擊與死亡皆觀察四格播放，受擊、既有音效、隔離與資產失敗回退通過。圖片／錄影為實際遊戲；已人工檢視代表方向、縮放與死亡，未宣稱逐格美術認證。

English: 9 focused Node/13 actual Chromium checks PASS. Native civilization selection/Start precede explicit controlled age/preparation/cleared-scene fixtures, real paid training and right-click movement/melee by that same trained actor. All 160 frame edges remain transparent. Actual attack/death play all four frames; hit, existing sound, isolation and failed-asset fallback pass. Images/video are actual gameplay. Representative directions/zoom/death were reviewed, without every-frame art certification.

繁體中文：100 單位固定場景、三組交錯 renderer-only 比較通過既定 draw JS 預算及 20% p50 退步門檻，原始樣本見 render-samples.json。沒有 Console／Page／HTTP 錯誤。這不是 FPS、實體 GPU、自然十波／NG+ 或完整戰役驗收。全部歷史 FAIL、低 FPS、嚴格 Save/Load、建築性能、Rift 及硬體缺口保留；未公開發布。直接接續 AZT 既有民兵的黑曜石武器與棉甲羽冠輪廓。

English: Three alternating renderer-only pairs in a fixed 100-unit scene pass existing draw-JS budgets and the 20% paired-p50 regression gate; raw samples are render-samples.json. No Console/Page/HTTP errors. This is not FPS/physical GPU/natural ten-wave/NG+/full-campaign acceptance. Historical FAIL, low-FPS, strict Save/Load, building performance, Rift and hardware gaps remain; nothing publicly deployed. Directly continue AZT existing militia with obsidian weapon, quilted armor and feather silhouette.

BILINGUAL_DOCUMENTATION_REQUIRED = true
