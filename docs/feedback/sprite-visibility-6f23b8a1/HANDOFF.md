# 離屏敵軍視野查詢順序實驗：未採用，已正常撤回

本輪測試把Renderer.draw的敵軍isVisible查詢移至drawUnit內、unitSpriteOnscreen之後，以省去離屏敵軍的全隊視野查詢。查詢數確實減少，但整體繪製收益不一致，200單位離屏短測較差；本輪不把它留作已驗收優化。

候選來源c82c98ad800a46ece114e0dde86492d264da0ecc。正常後續提交19f91ea8da075c39e3fe7681a92896cd515d48cf將renderer.js完整還原安全基線792f87d6450bd1c9a0bdb567bda9da45c9b9256f，沒有amend、reset歷史或force push。最終runtime無修改，保留候選、測試器修正、失敗與較差結果。這是有直接後續價值的否決診斷，不宣稱新增玩法或效能提升。

## 功能與像素

候選Node新增4案例：離屏不查詢；螢幕內隱藏敵軍仍擋住；合法可見敵軍／友軍繪製；沒有死亡動畫的死者不查詢。前版2 FAIL／2 PASS，候選4 PASS，另5檔回歸PASS。撤回後正式4檔sprite-edge／visibility／boss-warning-layer／sprite-atlas PASS。候選專屬測試移至tools/qa本任務experimental-test.mjs.txt，作歷史實驗原始碼而非要求正式程式保有已否決行為；輸出未刪改。

Chromium完整Renderer.draw前後比較：DPR1／2×zoom0.6／1.6×militia／archer／warlord2×可見／螢幕內未發現／下緣／遠離螢幕，共48組完整Canvas零RGBA通道差異；Game.snapshot（排除savedAt）與兩個RNG不變。沒有僅以遮罩或視覺相似當整幅畫面PASS。沒有繞過實際Game.isVisible。

## 測試器失敗與有效數量

初次100／200請求的16段資料在first-report.json。100組實際存活100，8段可採用；標示200的組實際只有186，8段不可當200證據。原始harness曾印pass=true，因缺少實際數量斷言，此錯誤保留並由summary.json明確標INVALID_FIXTURE_NOT_200_UNIT_EVIDENCE，不把原標籤當驗收。

只擴大生成間距仍因地圖邊界位置不適合而失敗，spacing-fail.json保留。確認正式spawnUnit會驗證地形／距離並在有限半徑尋位後，將受控敵軍座標由40區移到地圖內26區，不改遊戲生成、碰撞或地圖規則。修正後corrected-200.json的8段全程實際存活200，且harness強制檢查actual===requested。原100有效資料未重跑；兩規模是不同的受控分布，各自做同場景配對，不能跨規模當相同密度對照。

## 有效短ABBA結果

每種規模各離屏／螢幕內隱藏敵軍兩場景，分別A1/B1/B2/A2；每組1秒暖機3秒量測。Game.update不前進、Renderer及HUD持續執行，單位全程存活。不是自然戰役、移動戰鬥或長測。表為各自兩次統計值的中位數。

|單位|場景|版本|繪製平均ms|FPS|幀P50ms|幀P95ms|每幀敵軍視野查詢|
|---|---|---|---:|---:|---:|---:|---:|
|100|離屏|前|7.805|45.57|16.7|41.7|50|
|100|離屏|候選|7.326|51.93|16.7|33.3|0|
|100|未發現|前|0.477|59.57|16.7|16.75|50|
|100|未發現|候選|0.503|60.13|16.7|16.75|50|
|200|離屏|前|11.099|35.32|33.3|41.7|100|
|200|離屏|候選|12.494|31.45|33.3|66.7|0|
|200|未發現|前|6.901|56.46|16.7|25.1|100|
|200|未發現|候選|6.820|59.78|16.7|16.75|100|

48組功能／像素PASS，不等於性能PASS。查詢次數下降已確認；整體效能為INCONCLUSIVE且200離屏較差，候選NOT_ADOPTED。移動判定位置會讓隱藏敵軍先進排序，再被視野擋住，存在成本轉移；沒有獨立證據能把全部較差數值歸因於排序。保留雲端波動與短樣本限制，不重跑取得更好數字。

原始幀陣列、render P50/P95／平均、查詢次數及heap起訖保留；3秒heap不能判斷洩漏。Chromium154.0.8037.57、SwiftShader軟體GPU，不是Windows實體GPU。NOT_TESTED：完整動態戰鬥、自然十波、C-36原場次、長期記憶體、實體硬體、四語／存讀／NG+、真人趣味、影片。

## 正式構建、Ownership及下一步

候選與前版正式構建各168資源SHA-256及頁內完整性通過。撤回後正式本地構建19f91ea8da075c39e3fe7681a92896cd515d48cf，168資源逐檔雜湊相符，全部payload與安全基線構建2e338cb04d7895e5b4804247f9e8ba4d9c03f991相同，見reverted-build-check.json。撤回後未重跑瀏覽器，使用byte-for-byte同執行資源證據，不宣稱新一輪瀏覽器驗收。PNG為被否決候選的受控200單位離屏場景，不是公開版本。

Task SPRITE-VISIBILITY-6F23B8A1；Agent sprite-visibility-6f23b8a1；Execution sprite-visibility-20261126-6f23b8a1；branch codex/riftwatch-sprite-visibility-6f23b8a1。基線792f87d6450bd1c9a0bdb567bda9da45c9b9256f，Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。Ownership409核對後Dry Run→CAS410，收據f864ea4b663174cdb0ca3695c9ffe7b8fe373e37。最終遠端SHA與釋放收據見回報／外部收據。

未接管其他Owner、改Progress Feed、main、Pages、公開部署、RC或排程。Boss預警秒數仍待決策，C-36根因仍未定。

STOP_REASON=AGENT_EARLY_STOP：完成否決診斷並還原後結束，沒有宣稱額度或環境阻塞，仍有後續合法工作。EXECUTION_DURATION=UNKNOWN，完整期間未量測；各性能段時間範圍如上。CHECKPOINT_SHA=19f91ea8da075c39e3fe7681a92896cd515d48cf。NEXT_AUTHORIZED_TASK：以既有畫面小樣本分開量測drawUnitShadow與drawSpriteAtlasUnit，定位真正繪製成本，不再重試本次順序調整。AUTO_RESUME_AVAILABLE=UNVERIFIED；QUOTA_PERCENT_UNKNOWN。
