# MAG 裸馬弧刀圓盾輕騎八方向動作已整合 / MAG unbarded sabre round-shield light cavalry integrated with directional actions

來源／Source: `4dfeb7d57512bcde07b9876d15b9a4a596b346d7`. 狀態／Status: SCOPED_ACCEPTANCE_PASS.

繁體中文：MAG 裸馬弧刀圓盾輕騎八方向動作已整合。原創 SVG／PNG 與可重現生成器，沿用 Canvas 2D 與 PNG 裁格快取；不是換色，也沒有第三方資產依賴。只套用指定文明的既有玩家兵種，保留其他文明／敵軍路由。沒有修改 game.js、data.js、碰撞、導航、成本、傷害或平衡規則；較高騎手以 descriptor 血條高度保持資訊清晰。

English: MAG unbarded sabre round-shield light cavalry integrated with directional actions. Original SVG/PNG and reproducible generator use Canvas 2D/cached PNG frames, beyond recoloring and without third-party assets. Only the designated civilization's existing player unit changes; other civilizations/enemies retain routing. game.js/data.js, collision, navigation, cost, damage and balance rules are unchanged. Descriptor health-bar height keeps taller helmets readable.

繁體中文：4 項定向 Node、13 項真實 Chromium PASS。原生首頁選文明／Start，明示 CONTROLLED_FIXTURE 設時代、延長準備及清場後，原生命令付費訓練；同一個真正訓練出的單位接著右鍵移動與近戰。全部 160 格邊界透明；實際攻擊與死亡皆觀察四格播放，受擊、既有音效、隔離與資產失敗回退通過。圖片／錄影為實際遊戲；已人工檢視代表方向、縮放與死亡，未宣稱逐格美術認證。

English: 4 focused Node/13 actual Chromium checks PASS. Native civilization selection/Start precede explicit controlled age/preparation/cleared-scene fixtures, real paid stable training and right-click movement/melee by that same trained actor. All 160 frame edges remain transparent. Actual attack/death play all four frames; hit, existing sound, isolation and failed-asset fallback pass. Images/video are actual gameplay. Representative directions/zoom/death were reviewed, without every-frame art certification.

繁體中文：100 單位固定場景、三組交錯 renderer-only 比較通過既定 draw JS 預算及 20% p50 退步門檻，原始樣本見 render-samples.json。沒有 Console／Page／HTTP 錯誤。這不是 FPS、實體 GPU、自然十波／NG+ 或完整戰役驗收。全部歷史 FAIL、低 FPS、嚴格 Save/Load、建築性能、Rift 及硬體缺口保留；未公開發布。接續兵器近戰音效差異與真實瀏覽器混音驗收。

English: Three alternating renderer-only pairs in a fixed 100-unit scene pass existing draw-JS budgets and the 20% paired-p50 regression gate; raw samples are render-samples.json. No Console/Page/HTTP errors. This is not FPS/physical GPU/natural ten-wave/NG+/full-campaign acceptance. Historical FAIL, low-FPS, strict Save/Load, building performance, Rift and hardware gaps remain; nothing publicly deployed. Continue melee weapon sound differentiation and actual browser mix acceptance.

BILINGUAL_DOCUMENTATION_REQUIRED = true
