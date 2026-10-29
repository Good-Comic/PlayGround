# VIK 圓盾盾衛 / VIK round-shield guard

繁體中文：遊戲來源／Build 為 `8425aedfa6bb020ebaff9e909cc5e89f7337ba78`，59 個 payload SHA256 一致。QA `0d990b0` 僅新增原生付費訓練檢查與修正音效檢查名稱，遊戲 payload 相同。原創圓盾木板／盾臍、鏈甲、無角頭盔與劍提供 VIK 玩家 guard 專屬輪廓，八方向 × 五狀態 × 四影格。PNG 裁格快取與資產失敗回退沿用現有架構。未改其他文明／敵軍外觀、成本、碰撞、護甲、傷害、攻速、回血或 RNG。生成器及 SVG／PNG 均為本專案原創，沒有外部素材依賴；正式近戰沿用既有音效。

English: Game source/Build is `8425aedfa6bb020ebaff9e909cc5e89f7337ba78`, with 59 payload SHA256 hashes matching. QA `0d990b0` only adds native paid-training coverage and corrects the sound-check label; game payload is identical. Original wooden round shield/boss, mail, hornless helmet and sword provide a VIK player-guard silhouette in eight directions, five states and four frames. Frame caching and failed-asset fallback use the existing architecture. Other civilizations/enemies, costs, collision, armor, damage, attack speed, regeneration and RNG are unchanged. Generator and SVG/PNG are original project work without external assets; production melee uses existing sound.

繁體中文：8 項定向 Node PASS，包括 BRI 隔離回歸、完整影格界限、VIK 五秒脫戰回血門檻與既有回血量、成本／存檔身分。13 項真實 Chromium PASS，從原生首頁 VIK Start，明示 CONTROLLED_FIXTURE 設時代／準備時間後，以原生命令按鈕支付實際成本，等待真正軍營佇列產出。其後受控場景驗證正式移動、右鍵近戰傷害、四影格攻擊、近戰音效事件、受擊、死亡、文明／敵軍隔離與失敗回退。沒有 Console、Page、HTTP 或網路失敗。錄影為真正瀏覽器，非概念圖；不宣稱自然戰役通過或完整混音聽感認證。

English: 8 focused Node checks PASS, including BRI isolation regression, frame bounds, existing Viking five-second out-of-combat regeneration threshold/amount, cost and saved identity. 13 actual Chromium checks PASS. Native homepage VIK Start is followed by explicit CONTROLLED_FIXTURE age/preparation setup, native command-button payment and a real barracks queue spawn. Subsequent controlled scenes verify production movement, right-click melee damage, all four attack frames, melee sound dispatch, hit/death, civilization/enemy isolation and fallback. No Console/Page/HTTP/network errors occurred. Video records actual browser gameplay, not concept art; natural-campaign completion and full-mix listening acceptance are not claimed.

繁體中文：人工檢視正面、背向、0.8 倍縮放、近戰與死亡，代表姿勢無明顯裁切／鏡像問題；不是全部影格品質認證。固定 100 盾衛、三組交錯 renderer-only 比較，原 guard Atlas 與新 VIK Atlas 的 p50 均約 0.9／0.9／1.0ms，新 Atlas p95 為 2.2／2.0／3.0ms，符合預算與退步門檻。僅代表該靜態場景的 JS draw 成本，不是 FPS 或實體 GPU 驗收。自然十波／NG+、嚴格 Save/Load、低 FPS、混合建築性能及硬體歷史缺口保留；未公開部署。

English: Front/rear, 0.8 zoom, melee and death screenshots were manually reviewed without evident representative clipping/mirroring problems; this is not every-frame quality certification. Three alternating renderer-only pairs with 100 fixed guards yield approximately 0.9/0.9/1.0ms p50 for both original guard and VIK atlases; new atlas p95 is 2.2/2.0/3.0ms, within budget/regression gates. This measures JS draw cost for that static scene, not FPS or physical GPU acceptance. Natural ten-wave/NG+, strict Save/Load, low-FPS, mixed-building performance and hardware gaps remain; nothing publicly deployed.

BILINGUAL_DOCUMENTATION_REQUIRED = true
