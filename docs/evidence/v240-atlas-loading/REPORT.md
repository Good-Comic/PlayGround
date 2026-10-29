# 當前文明圖集解碼與舊快取釋放 / Active-civilization atlas decode and old-cache release

來源／Source: `4c5ae01fb886067443aa5bc51204f4e2e6b78ec9`. 比較基準／Baseline: `ce26f7f405e1cdb1d5a46cc51b4c25bbcad79dda`.

繁體中文：舊版 renderer 立即建立所有十四個文明 override 的 Image。新版保留泛用／英雄／Boss 圖集，文明圖集只在進入對應文明時要求圖片；首頁不要求文明圖片。切換文明、受控存檔恢復與返回首頁會釋放不適用圖片與裁格引用；再次進入可重新載入。延遲回呼以圖片身分比對，避免舊請求覆寫新狀態。失敗保持程序式 fallback，不在每幀重試。未改遊戲模擬、平衡或圖片素材。

English: The old renderer eagerly created Images for all fourteen civilization overrides. The renderer now retains shared/hero/Boss atlases and requests civilization images only on entering that civilization; the menu requests none. Civ switches, controlled snapshot restoration and returning to menu release irrelevant image/crop references, with safe reload on revisiting. Image-identity guards reject stale callbacks. Failure preserves procedural fallback without per-frame retries. Simulation/balance/image assets are unchanged.

繁體中文：15 Node PASS：新延後／切換／釋放／晚到回呼／錯誤與選單測試，及受影響 atlas API、MNG、英雄／Boss 裁格相關測試。真實 Chromium：基準 5 檢查 PASS（確認原先 eager 行為），修復來源 15 檢查 PASS。原生 TUR 首頁／射箭場付費訓練／頭部點選／箭矢命中，後續同一 renderer 的受控 TEU／PER／TUR／TEU 存檔文明切換、實際 TEU 移動、影像／裁格釋放及失敗 fallback 通過；沒有資源／Console／頁面錯誤。代表實際畫面已人工檢視。

English: Fifteen Node checks PASS for deferred loading, switch/release/stale callbacks/errors/menu and affected atlas API, MNG and hero/Boss crop behavior. Actual Chromium: five baseline checks PASS (confirming original eager behavior), and 15 optimized-source checks PASS. Native TUR menu/paid archery training/head selection/projectile hits precede controlled same-renderer TEU/PER/TUR/TEU snapshot-civilization switches, real TEU movement, reference release and failure fallback. No resource/console/page errors. Representative actual images were manually inspected.

繁體中文：由成功解碼圖片 naturalWidth × naturalHeight × 4 得到的 RGBA 基礎代理值：基準 417333248 bytes（約 398 MiB）；新版 TUR／TEU 161251328 bytes（約 154 MiB），首頁／PER 137658368 bytes（約 131 MiB）。文明圖片從十四張縮至一張，切換後舊裁格數歸零。這不是實測程序 RAM／GPU 記憶體，未宣稱瀏覽器立即回收實體記憶體；共用圖集仍 eager。Build SHA256 驗證仍 fetch 全 payload，沒有宣稱減少 integrity 網路流量。

English: RGBA base proxies computed from successfully decoded naturalWidth × naturalHeight × 4 are 417,333,248 bytes (~398 MiB) before, 161,251,328 (~154 MiB) for optimized TUR/TEU, and 137,658,368 (~131 MiB) for menu/PER. Civilization images decrease from fourteen to one, and old crop counts become zero after switching. These are not measured process RAM/GPU memory; immediate native-memory reclamation is not established. Shared atlases remain eager. Build SHA256 verification still fetches the entire payload; integrity network savings are not claimed.

繁體中文：100 單位 renderer-only 三輪原始樣本均保留。新版 draw JS 平均 0.8675／1.06625／0.715 ms，p95 1.9／2.2／1.3 ms，通過既有絕對 33.3／50 ms 預算；不宣稱跨頁固定比例加速、FPS 或硬體通過。這只驗證存檔文明換圖，不是嚴格 Save/Load 確定性通過。歷史自然十波／NG+、低 FPS、渲染 FAIL、Rift 與硬體缺口保留。下一項為既有英雄／Boss 的可見頭部原生點選檢查，安全保存後繼續。

English: Raw samples from three 100-unit renderer-only runs are retained. Optimized draw-JS means are 0.8675/1.06625/0.715 ms, p95 1.9/2.2/1.3 ms, within existing absolute 33.3/50 ms budgets. No fixed cross-page speedup, FPS or hardware PASS is claimed. Snapshot checks cover civilization image activation, not strict Save/Load determinism. Historical natural ten-wave/NG+, low-FPS, rendering FAIL, Rift and hardware gaps remain. Next inspect native visible-head picking for existing heroes/Bosses; continue after saving.

BILINGUAL_DOCUMENTATION_REQUIRED = true
