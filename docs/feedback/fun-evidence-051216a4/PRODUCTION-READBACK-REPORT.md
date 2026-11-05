# 生產成本與保留缺口實測

固定遊戲來源為 `6852cf85acca5c08923e0191a1e0703189f4d3e6`。正式 `build_playtest.py` 構建是 `PLAYTEST-EXPERIMENTAL`，原始構建時間 `2026-11-05T21:01:08.724193+00:00`；[構建元資料](current-production/build-metadata.json) 與[本次重新雜湊](CURRENT-RESOURCE-VERIFICATION.json)均為 163／163。這是內部本地構建，沒有部署。

**玩家可見的改動**

總管內每座生產建築可展開目前已套用計畫的合法兵種，讀取原生 `unitCost`、`reserveCost`、`canSpend` 與生產狀態。四資源表顯示目前庫存、本筆費用、全域有效保留、建築保留、付款後最低庫存、假設付款後庫存及缺口。

最低庫存沿用正式規則 `max(全域有效保留, 建築保留)`；本筆未支出的資源不額外檢查。已付款佇列不重複計費。資源門檻符合仍不代表下一次必定排到該兵；人口、解鎖、佇列、合法性與既有優先順序仍生效。負的假設付款後庫存是試算，不是實際扣成負數。

修改表單但尚未儲存時，畫面標出未套用草稿，診斷仍讀 `game.stewards` 的已生效設定。明細按需產生並由玩家明確更新，不在戰鬥每幀重建。人類可讀數值縮為約兩位小數；小於 0.01 的正缺口仍明示大於零，原始數值保留於資料屬性。

修改檔案為 `js/production-readback.js`、`js/steward-ui.js`、`js/locales.js`、`styles.css` 與 `tests/production-readback.test.mjs`。窄窗修正使用可收縮欄位與表格內部捲動，沒有改費用、訓練、總管決策、傷害、AI 或 RNG。

**畫面與技術驗收**

| 證據 | 結果 |
| --- | --- |
| [原版概括狀態](current-production/browser/before-producer-generic-status.png) | `35dedfe6ee203a4d9689290dc466484c39557cf8`，未有逐兵種成本表 |
| [新版正式費用與缺口](current-production/browser/after-producer-native-costs.png) | `6852cf85acca5c08923e0191a1e0703189f4d3e6` |
| [草稿與生效設定分開](current-production/browser/unapplied-draft-stays-separate.png) | 未套用提示及生效設定來源同時可見 |
| [定向 Node 回歸](current-production/node-and-handoff/readable-values-node-r2.txt) | 64 PASS／0 FAIL，沿用有效來源證據 |
| [Chromium 原始結果](current-production/browser/result.json) | 32 PASS／0 FAIL、零 page errors，Chromium 154.0.8037.57 |
| [繁中 1440](current-production/browser/layout-zh-Hant-1440.png)／[日文 390](current-production/browser/layout-ja-390.png) | 四語 × 1440／1024／800／390 視口均有受控檢查 |
| [操作前影片](current-production/browser/before.webm)／[操作後影片](current-production/browser/after.webm) | 正式構建、原生總管操作及 Save／Continue；非自然戰役勝利 |

32 項檢查包含實際表格與原生費用一致、查看與更新不改完整模擬快照及兩種 RNG、草稿不套入 live Game、正式套用、原生 Save／Continue、窄窗操作列與小數邊界。純讀快照比較排除原生暫停仍存在的攝影機緩動；單一小數邊界另明標受控資源夾具，沒有冒充玩家流程。

初次 800px 版面確實失敗，當時為 17 PASS／1 FAIL；[原始結果與截圖](recovered-fun-lab-281169b5/production-readback/initial-800px-fail/)完整保留。後續修正窄窗及浮點數可讀性，分別有 32 項重測；沒有刪除失敗條件或改遊戲費用。

**A 最新自然續玩：公開紀錄可確認的範圍**

[新復核者報告](A-production-public/RECOVERY-VISIBLE-REVIEW.md)逐張檢視 19 張 PNG、38 組公開 request／response，核對 18 筆原生操作。原玩家報告仍為 `UNSEALED_ORIGINAL_REPORT`。復核者沒有重玩、讀取引擎或其他角色情報，也沒有替原玩家填寫主觀評分。

從原生 Continue 的 42.123 秒，到敗北觀察 233.652 秒，為 191.529 秒牆鐘。總管開啟至儲存的 108.420 秒包含閱讀、定位失敗、編輯及工具延遲；畫面顯示面板暫停，但這不是獨立逐幀停表測量，也不能全算為新功能閱讀成本。

可見順序為：92.669 秒讀到輕騎兵費用摘要 → 133.691 秒食物優先 → 137.246 秒村民目標改 14 → 148.271 秒交還閒置村民 → 152.340 秒草稿提示 → 161.661 秒完整成本表展開 → 172.757 秒儲存。完整表格在經濟決定之後才展開，不能倒寫因果。

當時輕騎兵費用為 65 食物／20 黃金；已套用食物庫存約 26.69、最低保留 0、假設付款後約 −38.31、尚缺約 38.31。畫面確實提供缺口與草稿資訊，但沒有儲存後再開總管驗證持久值，也沒有觀察資源足夠後的新佇列，不能宣稱自動生產已改善。

原 @33 點擊開啟時代選單，是另行重現的[測試控制映射缺陷](CONTROL-MAPPING-REPORT.md)，不歸咎玩家。最後 Q 輸入與敗北交界重疊，技能是否成功仍未確認。正式結算是第 4 波敗北、度過 3 次襲擊、74 擊殺、採集 3,679、累計 8:56；finish 回 ok，但其精確時間未知。這些資料不證明勝率或樂趣提升。

**效能適用範圍**

[七個戰鬥與正式支出模組來源比較](recovered-fun-lab-281169b5/production-readback/UNCHANGED-COMBAT-SOURCES.json)確認 `35dedfe6…` 至 `6852cf85…` 位元相同。既有 100／200 負載資料仍限定其實測來源，詳見[測試矩陣](TEST-MATRIX.md)；本次沒有把它冒稱為成本面板全新逐幀長測。四語版面及開關操作已驗證，長時間記憶體與實體 GPU 尚無證據。
