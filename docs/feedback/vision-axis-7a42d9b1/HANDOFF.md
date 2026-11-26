# 視野覆蓋證明：先排除單軸已超出半徑的角點

本輪實際修改 `js/vision-mask.js` 的boxCovered。角點的farX或farY若已大於donor.radius，斜邊不可能落在半徑內，所以略過Math.hypot；其餘仍走原有斜邊比較。沒有改遞迴深度、AA／浮點餘裕、候選順序、保留圓、視野、迷霧、AI、傷害、模擬時間或RNG。

此方法針對持續變動投影仍須執行的覆蓋證明，不依賴上一輪命中率0%的整張原始投影快取。不是恢復已否決的SVG或合成近似方案。

## Node與像素

200個重疊圓的定向重現，Math.hypot呼叫183664→33621（約減81.7%），保留清單仍為同樣60個原物件與順序。這是運算次數，不是整體FPS或執行時間改善百分比。

tests/vision-axis.test.mjs新增3案例：較少斜邊呼叫且輸出等價；固定種子2000組在1e-300至1e300尺度的清單／順序／輸入不變；相切／NaN／空值／大值溢位沿用原處理。修改前減少呼叫案例FAIL保留，另外2案例PASS；修改後3 PASS。連同vision-raw-cache、vision-mask-cache、vision-mask、vision-clip共5檔回歸PASS。舊版參考函式凍結於tools/qa本任務reference.mjs，SHA256為2d20686c676feb6a759e54270481fda86904be3c74d5e52425bc654754af4fbc，來源為基線未修改的vision-mask.js。既有幾何聯集取樣回歸未修改。

Chromium靜態／狀態變化：100／200單位×zoom0.6／1／1.6×DPR1／2×base／warm／微小移動／鏡頭／沙暴／死亡，共72組遮罩零RGBA通道差異。原生F2及右鍵命令：75／150友軍實際移動，tick0／1／30／60／120共10組亦零差異。每次繪圖前後Game.snapshot（排除savedAt）與兩個RNG不變。頁面零錯誤。像素取樣與性能段串行分開。

正式本地構建來源2e338cb04d7895e5b4804247f9e8ba4d9c03f991，前版c486809cf8c4b4180c46afcd767a22b02abc081d，各168資源SHA-256與頁內完整性通過。安全基線d299068的runtime與前版構建相同；沒有修改正式完整性檢查。

## 動態100／200單位ABBA

沿用既有正式地圖、種子及受控追加兵力，原生F2→HUD堅守，保留完整Game.update、採集、生產、敵軍移動、傷害與死亡。每組3秒暖機、10秒量測，串行A1/B1/B2/A2。初始snapshot SHA、單位清單、兩個RNG一致，所有命令接受，沒有資料截斷或pageerror。

|初始單位|版本|幀P50中位數ms|幀P95中位數ms|FPS中位數|迷霧方法ms/幀|起點存活|終點存活|
|---|---|---:|---:|---:|---:|---|---|
|100|前|50.0|83.30|18.51|10.34|91／90|81／81|
|100|後|50.0|66.75|20.00|8.76|90／90|81／80|
|200|前|66.7|116.75|13.22|10.19|184／184|141／142|
|200|後|66.7|133.30|13.01|8.79|184／186|142／142|

表為各組統計值的兩次中位數；迷霧方法先算每組總時間／幀數再取中位數。不是合併所有幀，也不把初始數當全程同屏或存活數。方法時間含子呼叫不可相加；計時與資料陣列成本未校準。渲染、原生A*、移動／尋路、靜態／動態碰撞、索敵、DOM、記憶體每秒趨勢、存活／模擬時間與CPU統計均保留於performance.json及原始壓縮檔。

**INCONCLUSIVE：整體動態效能改善／未退步。** 局部迷霧時間下降，但200單位新版FPS略低、P95較差，不能標整體PASS。兩次各10秒、有雲端波動與牆鐘排程造成的後續工作量差異；不反覆重跑取得更好數字，不刪較差結果。這是純數學等價的候選優化，尚非公開版本效能認證。

Chromium154.0.8037.57、SwiftShader軟體GPU，非Windows實體GPU。NOT_TESTED：長時間記憶體、實體GPU、自然十波、原C-36精確重播、四語／Save/Load／NG+重跑、真人趣味及影片。本輪沒有文字、存檔或玩法規則變更；像素移動場景也不是自然戰役。

## Ownership與接續

Task VISION-AXIS-7A42D9B1，Agent vision-axis-7a42d9b1，Execution vision-axis-20261126-7a42d9b1，branch codex/riftwatch-vision-axis-7a42d9b1。基線d299068598b690457ea0d52b221f60732129313f，Strategy遠端e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。Ownership407核對後Dry Run→CAS取得408，收據0b8f526f57905b0468ed7659ff4f3f80fbbc2c39。最終遠端SHA與正式釋放收據見本輪回報及工作樹外收據，不遞迴寫入自身SHA。

未接管其他Owner、改Progress Feed、main、Pages、RC、公開版本、排程或部署。Boss秒數仍待正式決策，C-36整體根因仍未定。

STOP_REASON=AGENT_EARLY_STOP：完成最小程式優化及必要驗證後結束，沒有聲稱額度或環境阻塞，尚有可做的渲染改善。EXECUTION_DURATION=UNKNOWN，完整執行期間未量測，各性能段有記錄。CHECKPOINT_SHA=2e338cb04d7895e5b4804247f9e8ba4d9c03f991。NEXT_AUTHORIZED_TASK：使用既有剖析定位單位Sprite繪製熱點，先最小重現再選優化，不重跑三角色戰役。AUTO_RESUME_AVAILABLE=UNVERIFIED；QUOTA_PERCENT_UNKNOWN。另見RECOVERY.json。
