# 畫外視野圓裁剪：像素不變的局部繪圖優化

任務VISION-CLIP-8A52D6F0；分支codex/riftwatch-vision-clip-8a52d6f0；執行codex-vision-clip-8a52d6f0-20261120。認領Ownership350，收據e153aa04483c1af727291c8f4522c5a49eba5c65。安全來源a677dfcea7b88196a500d78fe4d9298d84c8aee0，完整繼承上一項接敵WIP與原性能限制，未冒用原Fun Lab、修改其他Owner工作樹或公開版本。

正式程式及構建來源f15e8ab027cefb712badc2fcfcd1900a686b023f。before參考Renderer來自b33d04fd701dfedec2404a900e1d06894be7d3da正式構建；兩者Game／視野／AI規則相同，只比繪圖方法。Strategy沿用e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，使用者最新GAME FIRST指令優先。

## 先前低FPS歸因仍未確定

讀取既有隔離100 ABBA資料，原B1的render平均約55.05毫秒／呼叫，A1約32.60；fog約25.49對17.16；DOM約7.18對3.41；原生A*約6.30對3.83。多個未修改路徑同時變慢，不能只歸因於新A*，也不能排除它。terrain重建B1為11次，但B2為19次且FPS較高，不能用重建次數單獨解釋。inclusive時間不可相加；現有資料沒有詳細主執行緒／GPU／GC追蹤，不能指定環境或GC為確定原因。

因此未盲目增加尋路空間索引，也未重跑三角色或原戰鬥ABBA。改為處理一項確定的繪圖浪費：完全畫外的圓仍進入覆蓋判定。

## 修改

vision-mask.js新增clipVisionCircles，依實際投影中心／橢圓半徑與目前Canvas邊界，僅裁掉包含2像素抗鋸齒餘裕都在畫外的圓；相切、部分相交、覆蓋畫面的巨大圓仍保留。壞資料、未知視窗維持原處理，不吞掉原錯誤。保留順序與物件引用。

renderer.drawVisibility在原pruneVisionCircles之前使用裁剪。畫外圓不貢獻Canvas像素，減少後續覆蓋證明輸入；沒有改Game.sightRadius、Game.isVisible、沙暴倍率／時間、迷霧偵測、攻擊、RNG、單位AI、Save格式或模擬時間。不快取跨幀結果，因此鏡頭／縮放／視窗／死亡／載入當下仍重新依實際資料計算。

## Node與正式構建

vision-clip與既有vision-mask兩個測試檔PASS；command-readback、occupied-attack-goal與visual-rng-save三個相關檔PASS，維持接敵修正的原碰撞／人工目標回歸。測試runner按檔案計，不冒稱自然場次。

官方build_playtest.py固定來源產生168項資源，before／after檔案SHA-256均核對，主頁SHA256_MATCH_168_FILES。沒有新增遊戲資源。

## Chromium逐像素配對

以實際before Renderer.prototype.drawVisibility與after方法、同一Game／相同投影函數／獨立遮罩Canvas，比對每個RGBA位元組，不用替代演算法。24個有效案例：100／實際200單位、zoom0.6／1／1.6、鏡頭25/25與4/4、現行沙暴開關。每個案例零像素差異、SHA256相同；繪圖前後完整snapshot排除savedAt後一致（含雙RNG）。

初輪欲生200人時，一個正常spawn失敗，實際199；該12個像素案例及4個性能列不作200驗收。原始報告及199截圖完整保留，不改其歷史pass欄位來掩蓋錯標。QA修正增加合法備用出生位置、清除舊Crowd引用、檢查實際數量並記錄actualUnits；只重測200，不重跑已確認100。首輪100由畫面100人與106個來源（100兵+6建築）確認，原報告未記actualUnits欄位，和補測的程式數量斷言分開記錄。

最終採用首輪100的12例與補測實際200的12例。camera4/4、zoom1.6、無沙暴時，100的覆蓋輸入106→26、200為206→52，像素相同。其他鏡頭可能沒有可裁內容，不宣稱所有畫面都有同等改善。這是Renderer驗證，不是自然探索或敵軍實際視野測試。

## 固定畫面性能：局部效果，不是戰鬥驗收

Linux雲端、Chromium154.0.8037.57，ANGLE／SwiftShader軟體GPU，4 CPU配額400000/100000。1440×900，分散靜止單位、鏡頭4/4、zoom1.6，部分兵在畫外。game.update以空函數凍結模擬，Canvas與HUD正常繪圖；各列1秒暖機＋3秒ABBA，串行無Node測試同時執行。這不是自然戰鬥或原100 B1場景。

|單位／列|FPS|幀P50/P95 ms|fog P50/P95 ms|heap起→末 MiB|
|---|---:|---|---|---|
|100 A1 原|57.30|16.7/16.8|5.4/8.7|22.9→21.7|
|100 B1 新|58.98|16.7/16.8|4.6/5.8|20.0→9.6|
|100 B2 新|59.77|16.7/16.7|4.5/5.8|12.6→9.5|
|100 A2 原|59.67|16.7/16.7|5.2/7.5|14.0→11.2|
|200 A1 原|42.07|16.7/33.4|9.1/12.2|22.3→29.3|
|200 B1 新|47.92|16.7/33.4|6.3/8.5|27.4→12.2|
|200 B2 新|42.29|16.7/33.4|7.1/13.0|10.1→10.8|
|200 A2 原|39.64|16.7/49.9|9.5/16.2|10.7→18.1|

這個場景的fog P50下降，200的FPS有改善趨勢但短樣本、動畫與軟體GPU有變異；B2 fog P95也不是每一列都更低。heap受GC及量測陣列影響，不能推論洩漏通過。沒有據此宣稱穩定60FPS、戰鬥性能通過或Windows實體GPU達標。原199結果保留但不混算。

## 目前狀態與下一步

本輪RENDER_CLIP_PASS；繼承的FLANK_ROUTE性能仍INCONCLUSIVE，整體仍是獨立WIP，不整合RC、不公開部署。C36原始自然回放、完整十波、長期、實體GPU、瀏覽器Save／Load／NG+與戰鬥FPS本輪NOT_TESTED。沒有新增錄影、四語UI或16文明操作驗收；這些程式未改，不能把原結果改稱本輪通過。

下一步：對已保存的100人低FPS場景做一次必要且有限的CPU／GPU／GC追蹤，釐清主執行緒與繪圖時間歸因，不再盲目重跑整套ABBA或改尋路參數。

STOP_REASON：AGENT_EARLY_STOP，本輪局部繪圖優化完成後交接，仍有後續性能診斷，沒有平台／額度中斷證據。EXECUTION_DURATION未完整量測，3秒是各性能列樣本，不代表開發耗時。AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。未修改main、Pages、既有RC、不可變Build、OmGitHub、OpenCode、其他Owner文件、Feed或排程；無公開部署。
