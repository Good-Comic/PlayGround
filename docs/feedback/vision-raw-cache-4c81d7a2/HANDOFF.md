# 原始視野投影不變時，提前重用遮罩

## 玩家差異與修改

上一輪完整整合版短測顯示，渲染／迷霧成本明顯高於索敵。本輪發現 `Renderer.drawVisibility` 已有遮罩快取，但每幀仍先執行clipVisionCircles／pruneVisionCircles的完整覆蓋證明，才判斷快取是否相同。

`js/renderer.js` 現在先比對全部原始投影的數量、順序、screenX、screenY、rx、ry，以及圖層身分與尺寸。必須完全相等才直接合成原遮罩，不近似座標、視野或時間。投影有任何變化仍執行原裁剪／覆蓋證明；若裁剪結果相同，保留既有第二層快取，並保存新的原始投影供下一幀使用。原有繪圖失敗清除、換圖層及resize失效規則保留。

玩家在部隊與鏡頭靜止時少付重複視野運算成本。沒有改遊戲可見性、戰爭迷霧範圍、沙暴效果、碰撞、AI、傷害、模擬時間或RNG，也不是重做先前像素不一致的合成／SVG快取方案。

## 驗證

Node新增3案例：相同原始投影不再讀取裁剪結果判斷；被大視野包含的來源移動後，下一個靜止幀也能走提前重用；零來源全遮罩及新來源立即更新。前版2 FAIL／1 PASS原始輸出保留；新版3 PASS。連同既有vision-mask-cache、vision-mask、vision-clip共4檔PASS，涵蓋任意微小移動、鏡頭、縮放、視野、死亡／陣營、尺寸／圖層替換及繪圖例外。沒有刪除歷史失敗或降低像素標準。

Chromium：100／200單位×zoom0.6／1／1.6×DPR1／2×base／warm／微小移動／鏡頭變化／沙暴／死亡，共72組。直接切換正式前後Renderer方法，各自維護快取；同一Canvas讀取原始遮罩RGBA比較，全部零通道差異。每組Game.snapshot（排除savedAt）及兩個RNG不變。頁面零錯誤，沒有以截圖視覺相似代替像素驗證。

正式本地構建來源c486809cf8c4b4180c46afcd767a22b02abc081d；前版c7bb2b7b20a570281de37ed1f5209b8dc3b23fed。兩版各168資源SHA-256逐檔相符，頁內完整性通過。安全基線eab8e66的runtime與前版構建相同。

## 靜止短測

受控100／200存活單位，Game.update固定不前進，Renderer與HUD照常逐幀執行；只切換正式drawVisibility方法，串行A1/B1/B2/A2，每組1秒暖機、3秒量測。不是自然戰役、真實移動或完整戰鬥效能。

|存活單位|版本|幀P50中位數ms|幀P95中位數ms|FPS中位數|視野方法平均ms|
|---|---|---:|---:|---:|---:|
|100|前|33.3|50.0|29.37|2.024|
|100|後|33.3|41.7|29.77|0.043|
|200|前|66.6|75.0|16.67|6.820|
|200|後|50.0|66.7|18.77|0.085|

表格為兩次各組數值的中位數；視野方法平均欄先算各組總時間／呼叫數，再取兩組中位數。單次計時解析度約0.1ms，新版部分P50=0只是低於解析度，不是零成本。原始幀陣列、方法P50／P95、呼叫數及heap起訖均保留。各組100或200單位全程存活；無傷害、AI或死亡量測。

Chromium154系與SwiftShader／SwANGLE軟體GPU詳細資料在chromium.json，非Windows實體GPU。測試器計時與陣列成本未校準。短測支持「靜止投影的視野方法成本下降」，不等於全戰役效能認證或統計顯著的全面FPS改善。heap有GC波動，不由3秒起訖判定洩漏。

NOT_TESTED：持續移動部隊、動態戰鬥新版ABBA、長時間記憶體、Windows硬體、自然十波、原C-36精確重播、真人趣味、影片。四語／Save/Load／NG+本輪未重跑，沒有文字或存檔結構變更。兩張PNG是受控靜止軍隊，沒有城心，不是自然存檔或戰役畫面。

## 所有權與接續

獨立任務VISION-RAW-CACHE-4C81D7A2，Agent vision-raw-cache-4c81d7a2，Execution vision-raw-cache-20261126-4c81d7a2，branch codex/riftwatch-vision-raw-cache-4c81d7a2。安全基線eab8e66ad8e150bc25c420a4b448dfbca911f306，Strategy遠端e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。核對Ownership403後Dry Run→CAS正常發布取得404，收據2c5ddcb5609aa4bee3f169341f380353bf5ad68f；正式釋放收據與最終遠端SHA見本輪回報及工作樹外收據。

未接管舊Owner、寫Progress Feed、改main／Pages／公開版本／RC或部署。沒有重跑三角色戰役。Boss預警秒數仍待正式決策，C-36整體根因仍未定。

STOP_REASON：AGENT_EARLY_STOP。本輪完成最小優化與定向驗證後結束，沒有宣稱額度或環境阻塞，仍有後續工作可做。
EXECUTION_DURATION：UNKNOWN，未完整量測本輪執行期間；性能段時間範圍如上。
CHECKPOINT_SHA：c486809cf8c4b4180c46afcd767a22b02abc081d（正式構建來源；後續僅新增測試／證據／交接）。
NEXT_AUTHORIZED_TASK：沿用上一輪100／200動態場景，少量定向驗證此提前快取在移動戰鬥中的命中率與成本，不外推靜止結果。
AUTO_RESUME_AVAILABLE：UNVERIFIED。
QUOTA_PERCENT_UNKNOWN。
