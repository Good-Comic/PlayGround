# 提前視野快取的動態效果：未命中，不能外推靜止收益

本輪沒有新增runtime功能，補完上一輪明確未驗證的動態範圍。結論：持續採集、移動及交戰時，原始友軍投影不斷變化，提前快取沒有命中；上一輪靜止場景的6.82→0.085ms不能稱為動態戰鬥加速。

## 動態ABBA

沿用既有100／200初始單位、相同正式地圖、種子與原生F2→HUD堅守條件。保留正式Game.update、敵軍移動、傷害、死亡、村民採集及生產。各規模串行A1/B1/B2/A2，每組3秒暖機、10秒量測。兩版初始snapshot SHA、軍隊清單、遊戲／視覺RNG一致，原生命令全部接受；後續死亡及實際模擬秒數隨牆鐘排程不同，不是逐tick相同工作量。

|初始單位|版本|幀P50中位數ms|幀P95中位數ms|FPS中位數|起點存活|終點存活|
|---|---|---:|---:|---:|---|---|
|100|前|50.0|74.95|19.38|90／91|80／81|
|100|後|50.0|66.70|19.64|90／90|79／80|
|200|前|66.7|116.70|13.68|184／184|140／140|
|200|後|66.7|116.70|13.32|184／184|142／141|

表格取兩組各自統計值的中位數，不是合併全部幀。初始100／200不代表暖機後或全程同屏存活數。

新版提前快取：100單位0/397次，200單位0/271次，共0/668次。計數以drawVisibility前後rawShapes物件是否保留判斷，只代表新提前路徑，不等於舊版第二層遮罩快取是否重繪，也不是GPU合成命中率。

新版100／200每幀方法時間：渲染20.86／28.41ms、迷霧11.14／9.23ms、索敵0.31／0.77ms、DOM2.21／4.43ms。移動／尋路、原生A*、靜態／動態碰撞及各方法P50／P95另見原始資料。方法含巢狀子呼叫，不能相加。

INCONCLUSIVE：動態效能是否顯著改進或退步。每組僅10秒、樣本少、有雲端CPU／繪圖波動與後續戰況差異，不因單項P95變好而宣稱整體PASS。記憶體逐秒趨勢與起訖、實際模擬時間、CPU節流、幀陣列與存活數完整保留，未據短測判定洩漏。

## 原生移動與像素

另一組獨立受控場景用F2與右鍵下達移動，100／200總單位中的75／150名友軍全部接受命令。使用真實updateUnits固定步進，在tick0／1／30／60／120比較同一當前狀態的正式前後視野方法：10組全部RGBA零通道差異。到tick30，各75／150名友軍均已離開初始座標。每次繪圖前後Game.snapshot（排除savedAt）與兩個RNG不變。

這是受控兩模擬秒的移動／視野取樣，不是自然戰役、完整Game.update效能或玩家戰術成功證明；沒有城心，沒有把部隊移動當作擊殺。像素讀取與效能量測串行分開，避免讀回干擾性能資料。

## 品質與限制

PASS：8組完整動態短測、初始配對／命令接受／記錄未截斷、頁面零錯誤；10組移動像素與繪圖不改狀態；Node四檔vision-raw-cache／vision-mask-cache／vision-mask／vision-clip通過。

正式構建沿用前版c7bb2b7b20a570281de37ed1f5209b8dc3b23fed及新版c486809cf8c4b4180c46afcd767a22b02abc081d，各168資源逐檔SHA-256與頁內完整性相符。最新基線df18730的runtime與新版構建相同；本輪不為證據再造遊戲版本。

Chromium154.0.8037.57／SwiftShader軟體GPU，非Windows實體GPU。測試器同步計時、陣列與每秒取樣成本未校準。NOT_TESTED：自然十波、C-36精確重播、長測／洩漏、Windows硬體、四語／存讀／NG+重跑、真人趣味、影片。原歷史FAIL與上一輪靜止證據保持原樣。

## 所有權及交接

Task VISION-DYNAMIC-9E31B6C4；Agent vision-dynamic-9e31b6c4；Execution vision-dynamic-20261126-9e31b6c4；branch codex/riftwatch-vision-dynamic-9e31b6c4。基線df18730b12aa0fca70dd0e90f6ff00ebf3afdaef，Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。Ownership405核對後Dry Run→CAS取得406，收據913bd080d3f6f79c6a69394d08eb322d85314b6d。最終遠端SHA與釋放見回報及工作樹外收據。

未接管其他Owner、改Progress Feed、main、Pages、RC、公開版本、排程或部署。Boss秒數決策與C-36根因仍未解。

STOP_REASON=AGENT_EARLY_STOP：完成上一輪缺口的定向驗證後結束，沒有宣稱額度／環境阻塞，仍有後續開發可做。
EXECUTION_DURATION=UNKNOWN（完整執行期間未量測；每個性能段時間已保存）。
CHECKPOINT_SHA=df18730b12aa0fca70dd0e90f6ff00ebf3afdaef（本輪只有工具與證據，runtime未變）。
NEXT_AUTHORIZED_TASK=直接剖析動態pruneVisionCircles覆蓋證明，尋找能保守略過無效候選的最小優化；不再擴充整張靜止快取。
AUTO_RESUME_AVAILABLE=UNVERIFIED；QUOTA_PERCENT_UNKNOWN。
