# FRK 披掛輕騎 / FRK caparison cavalry

繁體中文：來源／Build `8774db51cafa8bdcdbc1fead7f82188070f3d050`，63 個 payload SHA256 相符。JPN／SPA／Continue／粒子 RNG 接連保存後直接依文明矩陣推進。新增 FRK 玩家既有 light_cavalry 的披掛、長盾、騎槍及桶形盔輪廓，八方向、五狀態各四格佈局；行走、騎槍出擊、受擊及死亡使用實際變化姿勢，idle 未宣稱四格皆不同。衍生自本專案原創的馬匹／步態管線，新增裝備幾何，不是只替 MNG 弓兵換色；沒有第三方素材或授權依賴。其他文明／敵軍不套用變體。

English: Source/Build `8774db51cafa8bdcdbc1fead7f82188070f3d050` verifies 63 payload hashes. Work directly follows consecutive JPN/SPA/Continue/particle-RNG safety checkpoints. New FRK player existing light_cavalry uses caparison, long shield, lance and barrel-helmet silhouettes in eight directions/five states/four-frame layouts. Walk/lance attack/hit/death use changing poses; four distinct idle poses are not claimed. It derives from project-original horse/gait tooling with new equipment geometry rather than recoloring the MNG archer. No third-party assets or licensing dependencies; other civilizations/enemies do not use this variant.

繁體中文：只新增 Sprite descriptor／SVG／PNG／生成器與驗收工具，沒有修改 game.js 或 data.js。保留原輕騎成本、碰撞半徑、攻擊規則與 FRK 60% HP 加成，並沿用正式近戰音效。11 項定向 Node PASS，含完整影格邊界、文明／敵軍隔離、HP／成本／存檔與粒子 RNG 回歸。13 項真實 Chromium PASS：原生 FRK Start 後明示 CONTROLLED_FIXTURE 時代及完成馬廄，以真正訓練按鈕扣款並等待佇列生成，再以正式移動與右鍵近戰造成傷害。四影格攻擊、音效事件、受擊、死亡與失敗回退皆通過；無瀏覽器／網路錯誤。

English: Only sprite descriptors/SVG/PNG/generator/acceptance tooling changed; game.js/data.js remain unchanged. Existing light-cavalry costs/radius/attack rules and FRK 60% HP bonus remain, using production melee sound. Eleven focused Node checks PASS, including frame bounds, civilization/enemy isolation, HP/cost/save identity and visual-RNG regressions. Thirteen actual Chromium checks PASS: native FRK Start precedes explicit controlled age/completed-stable fixtures; the real training button pays costs and a real queue spawns cavalry, followed by production movement/right-click melee damage. Four attack frames, sound dispatch, hit/death and fallback pass without browser/network errors.

繁體中文：人工檢視正面、背向、近戰、死亡及 0.8 倍縮放，代表姿勢未見明顯裁切／錯誤鏡像，未逐影格認證。100 騎兵固定場景三組交錯 renderer-only 比較，原通用 SVG p50 為 8.4／7.9／8.4ms，新 PNG 裁格快取為 1.0／1.0／0.9ms，均符合原預算與 20% 退步門檻。這是限定靜態 draw JS 成本，不是 FPS、自然戰役、全場景性能或實體 GPU 認證。所有歷史 FAIL 與自然十波／NG+、嚴格 Save/Load、低 FPS、建築性能、Rift、硬體缺口保留，未公開發布。

English: Front/rear, melee/death and 0.8 zoom images were manually reviewed without evident representative clipping/mirroring; not every-frame certification. Three alternating renderer-only pairs in a fixed 100-cavalry scene measure original generic SVG p50 at 8.4/7.9/8.4ms versus cached PNG at 1.0/1.0/0.9ms, passing existing budgets/20% regression gates. This is scoped static draw JS cost, not FPS/natural-campaign/all-scene performance/physical GPU certification. Historical failures and natural ten-wave/NG+, strict Save/Load, low-FPS, building performance, Rift and hardware gaps remain; nothing publicly deployed.

BILINGUAL_DOCUMENTATION_REQUIRED = true
