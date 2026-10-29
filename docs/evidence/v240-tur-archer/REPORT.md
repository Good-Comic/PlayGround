# TUR 反曲弓箭袋弓兵八方向射擊動作已整合 / TUR recurve bow quiver archer integrated with directional firing actions

來源／Source: `ce26f7f405e1cdb1d5a46cc51b4c25bbcad79dda`. 狀態／Status: SCOPED_ACCEPTANCE_PASS.

繁體中文：TUR 反曲弓箭袋弓兵八方向射擊動作已整合。原創 SVG／PNG 與可重現生成器，沿用 Canvas 2D 與 PNG 裁格快取；不是換色，也沒有第三方資產依賴。只套用指定文明的既有玩家兵種，保留其他文明／敵軍路由。沒有修改 game.js、data.js、碰撞、導航、成本、傷害或平衡規則；較高頭盔以 descriptor 血條高度保持資訊清晰。

English: TUR recurve bow quiver archer integrated with directional firing actions. Original SVG/PNG and reproducible generator use Canvas 2D/cached PNG frames, beyond recoloring and without third-party assets. Only the designated civilization's existing player unit changes; other civilizations/enemies retain routing. game.js/data.js, collision, navigation, cost, damage and balance rules are unchanged. Descriptor health-bar height keeps taller helmets readable.

繁體中文：3 項定向 Node、14 項真實 Chromium PASS。原生首頁選文明／Start，明示 CONTROLLED_FIXTURE 設時代、延長準備及清場後，原生射箭場命令付費訓練；同一個真正訓練出的單位接著右鍵移動與真正箭矢命中。全部 160 格邊界透明；實際攻擊與死亡皆觀察四格播放，受擊、既有音效、隔離與資產失敗回退通過。圖片／錄影為實際遊戲；已人工檢視代表方向、縮放與死亡，未宣稱逐格美術認證。

English: 3 focused Node/14 actual Chromium checks PASS. Native civilization selection/Start precede explicit controlled age/preparation/cleared-scene fixtures, real paid archery-range training and right-click movement/projectile hits by that same trained actor. All 160 frame edges remain transparent. Actual attack/death play all four frames; hit, existing sound, isolation and failed-asset fallback pass. Images/video are actual gameplay. Representative directions/zoom/death were reviewed, without every-frame art certification.

繁體中文：100 單位固定場景、三組交錯 renderer-only 比較通過既定 draw JS 預算及 20% p50 退步門檻，原始樣本見 render-samples.json。沒有 Console／Page／HTTP 錯誤。這不是 FPS、實體 GPU、自然十波／NG+ 或完整戰役驗收。全部歷史 FAIL、低 FPS、嚴格 Save/Load、建築性能、Rift 及硬體缺口保留；未公開發布。檢查文明 Atlas 同時解碼的記憶體負擔並縮減不必要載入。

English: Three alternating renderer-only pairs in a fixed 100-unit scene pass existing draw-JS budgets and the 20% paired-p50 regression gate; raw samples are render-samples.json. No Console/Page/HTTP errors. This is not FPS/physical GPU/natural ten-wave/NG+/full-campaign acceptance. Historical FAIL, low-FPS, strict Save/Load, building performance, Rift and hardware gaps remain; nothing publicly deployed. Inspect simultaneous civilization-atlas decode footprint and reduce unnecessary loading.

BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：14 Chromium 包含同一真正訓練單位的頭部原生左鍵選取、shots 計數與敵軍扣血，使用既有箭矢及弓聲。未新增火器或變更遠程規則；反曲弓射後回彈／再裝箭姿勢為美術表現，不宣稱射擊幀與模擬完全同步。

English: Fourteen Chromium checks include native head clicks on the same actually trained actor, shot counts and enemy damage through existing arrows/bow sound. No firearms or ranged-rule changes. Bow release/reload poses are visual treatment, without a frame-perfect simulation synchronization claim.
