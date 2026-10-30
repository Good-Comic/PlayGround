# 原生跨 Chromium 程序 Save/Continue / Native cross-Chromium-process Save/Continue

來源／Source `5ef184234f7edf2490978e096ce5e704ed1b08b5`. **SCOPED_NATIVE_PERSISTENCE_PASS**,13 Chromium checks. Strict simulation determinism remains a separate historical gap.

繁體中文：新磁碟設定檔以原生首頁PER／Start開局，真正點城心訓練村民、支付資源、等待生產完成，Tab/WASD移動主將並施放E。原生Pause／Save後關閉整個Chromium持久化context／程序；使用同一磁碟設定檔、同一來源URL重開，確認localStorage存檔字串完全相同、Continue自然顯示且可用，再以原生Continue載入。沒有setItem、storageState、snapshot restore注入、GM或強制啟用按鈕。

English: A fresh disk profile uses native PER/Start, town-center selection/villager training, resource payment and actual production completion, then Tab/WASD hero movement and E. Native Pause/Save precedes closing the entire persistent Chromium context/process. Reopening the same disk profile/source URL confirms identical localStorage bytes and naturally enabled Continue, then native Continue loads the save. No setItem/storageState/snapshot-restore injection, GM or forced button enabling.

繁體中文：Save與Continue的只讀click觀察器在既有callback完成後、首個後續動畫幀前取樣，不替換或呼叫遊戲載入／儲存函式。比較文明、地圖／Seed、難度、時間、波次與準備進度、資源、建築／單位主要狀態、英雄護盾／持續時間及冷卻；不是所有模擬內部欄位的嚴格確定性比對。重開後正常運行及PER圖集ready通過。影片為真正瀏覽器操作，profile／瀏覽器內部檔案不入Git。

English: Read-only Save/Continue click observers sample after existing callbacks and before subsequent animation frames, without replacing/invoking game save/load functions. Compare civilization/map/seed/difficulty/time/wave/preparation progress/resources, main building/unit states, hero shield/duration/cooldowns; not strict determinism of every internal simulation field. Resumed progression/PER atlas readiness pass. Videos record actual browser actions; disk profiles/browser internals are excluded from Git.

繁體中文：原始失敗保留：initial-timestamp-fixture-fail誤把兩次snapshot的Date.now savedAt視為遊戲狀態差異；camera-timing-fixture-fail在原生Save後另一幀取樣，而updateCamera在暫停時仍平滑更新。工具改為同一原生事件結束時只讀取樣，savedAt排除比較；沒有修改遊戲以取得PASS。短流程中間結果保留，最終verified增加正常訓練與資源消耗，13項通過。此範圍為準備階段，不涵蓋波中／卡牌／勝敗／NG+或跨裝置瀏覽器；上述與嚴格Save/Load確定性保持NOT_TESTED／歷史缺口。

English: Original failures remain: initial-timestamp-fixture-fail treated Date.now savedAt from two snapshots as a gameplay difference; camera-timing-fixture-fail sampled a later frame after native Save while updateCamera continues smoothing during pause. The tool now reads at the same native event completion and excludes savedAt comparison; no game changes to obtain PASS. Intermediate short runs remain; final verified adds normal production/resource expenditure and passes13 checks. Scope is preparation phase, excluding mid-wave/cards/end states/NG+/cross-device browsers, which remain NOT_TESTED/historical gaps alongside strict Save/Load determinism.
