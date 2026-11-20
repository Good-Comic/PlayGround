# 有限CPU／瀏覽器追蹤與精確迷霧光柵重用

任務PERF-TRACE-5D38A2F7，分支codex/riftwatch-perf-trace-5d38a2f7，執行codex-perf-trace-5d38a2f7-20261120。認領Ownership352，收據8cf08c83044cfc9f3d134fc58aff6c9c8087ae41。安全來源9dfe19ea413a00c8cc7292911ab4142880d2b062，保留前候選所有有效成果及性能未定案狀態。Strategy仍e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，使用者較新GAME FIRST修訂優先。未接管原Fun Lab／其他Owner。

正式程式及Build來源287ad4e1e8173c20fed53ee51b5ce183819f9a8b。只有Renderer光柵重用，Game、AI、視野、卡牌、傷害、RNG與Save格式未改；沒有公開部署或整合RC。

## 三版單場景追蹤：原異常仍未定案

同一100人正常更新戰鬥fixture，三個來源各3秒暖機＋8秒頁面取樣，沒有跑ABBA／200人／三角色戰役：

|角色|來源Build|帶追蹤FPS|
|---|---|---:|
|legacy|da77971cd9f0ef833ba80aba143b92addaa02b8b|12.51|
|flank|b33d04fd701dfedec2404a900e1d06894be7d3da|12.73|
|clip|f15e8ab027cefb712badc2fcfcd1900a686b023f|11.47|

初始場景、雙RNG與fixture配對相等。CPU Profiler每1000微秒採樣，另開Chrome devtools.timeline／v8／GC／cc／gpu／viz事件，兩者均有未校準成本。Profiler啟停與CDP排程讓實際profile涵蓋約8.9–9.5秒，不把CPU樣本總時間誤寫成恰好8秒。原始capture移植腳本的pairInterpretation仍帶舊SHORT_ABBA字樣；實際只三列legacy/flank/clip，判讀以traceScope及列資料為準，工具後續已修正標籤，不重測製造相同資料。

本輪未重現舊7.84 FPS。Native drawImage約占可歸因樣本30–32%；約1.66–1.76秒的drawImage樣本在drawVisibility父堆疊，另約0.70–0.78秒在單位圖集繪製。這些是採樣堆疊，可能含原生繪圖／同步等待，不是實體GPU成本。

GC採樣約1.2–1.5%；所選Renderer主執行緒MinorGC＋MajorGC事件約104–119毫秒，最大單一MajorGC約9.8–12.3毫秒。不能逆推舊B1沒有GC問題。事件檔含GPU／Compositor執行緒，但實際為SwiftShader軟體GPU；inclusive事件與呼叫堆疊重疊，不能加總成裝置利用率。analysis-final保留選取主執行緒、長任務、GC、GPU事件與採樣算法的明確限制。

結論ROOT_CAUSE_UNCONFIRMED，原戰鬥性能門檻仍INCONCLUSIVE。不用本輪12 FPS替舊異常改判PASS，也不盲改尋路。追蹤轉而找出可直接省掉的相同遮罩重建工作。

## 實際程式改善

原先每幀清除、填滿並重畫相同迷霧光柵。現在先沿用實際投影、畫外裁剪與原覆蓋判定；只有圖層物件、寬高及所有保留橢圓的screenX／screenY／rx／ry、數量及順序完全相同才重用已畫好的遮罩。每幀仍合成到戰場Canvas。

沒有近似座標、量化視野或延後更新。微移動、有效視野／沙暴、死亡、陣營、縮放、尺寸、圖層等改變都會在必要時重畫；若來源雖移動但原遮罩完全被更大視野涵蓋，重用仍安全。先清除快取有效性再重畫，因此繪圖例外不會留下可重用的半張遮罩。快取只存Renderer自己的數字投影與Canvas，不寫Game／存檔／RNG。

## Node與原始失敗

新6項定向測試：舊版4 PASS／2 FAIL（尚未重用），新版6／6 PASS。涵蓋相同投影、任意微移動、鏡頭／縮放／視野、死亡／陣營／新來源、尺寸／圖層替換、繪圖錯誤後恢復，以及被大視野涵蓋的移動。

初版測試嘗試structuredClone帶函式的測試Game而DataCloneError，並非遊戲缺陷。原始失敗及直接輸出保留；修正為比對資料序列化與函式引用不變，沒有放寬繪圖條件。最終cache、clip、vision-mask、occupied-attack-goal、visual-rng-save共5個測試檔PASS。正式build_playtest.py產生168項資源，before與after皆核對SHA-256，頁面SHA256_MATCH_168_FILES。

## 真實Chromium逐像素與失效驗證

before光柵方法來自f15e8ab正式構建，after為287ad4e。24組實際Renderer遮罩：實際100／200兵、三縮放、兩鏡頭、現行沙暴開關。每例連續畫兩次，before重建2次，after重建1次；所有RGBA位元組與SHA-256相等，Game snapshot排除savedAt後一致（含雙RNG）。所有場景都檢查實際出生數，不沿用前輪199錯標。

另有同一圖層連續狀態驗證12例：初始、完全不變、微移動、沙暴、結束沙暴、死亡、復活、敵軍、友軍、縮放、尺寸、替換圖層。每例before重建2次；只有完全不變時after為0，其餘after為1，全部零像素差異，沒有PageError。這比每例換新圖層更能驗證實際失效流程。這是受控繪圖測試，不是自然戰役或完整暫停／Save／Load／NG+操作驗收。

## 局部固定畫面短測

Linux雲端、Chromium154.0.8037.57，4 CPU配額400000/100000、ANGLE／SwiftShader軟體GPU。1440×900、鏡頭4/4、zoom1.6、分散靜止部隊且部分在畫外；game.update凍結，Canvas及HUD照常繪圖。各列1秒暖機＋3秒ABBA，串行無其他CPU測試。不是上述帶Profiler戰鬥，也不是舊B1重現。

|規模／列|FPS|幀P50/P95 ms|fog P50/P95 ms|heap起→末 MiB|
|---|---:|---|---|---|
|100 A1 原|33.02|33.3/50.1|9.3/14.9|10.5→12.0|
|100 B1 新|58.16|16.7/16.8|0.2/0.6|15.1→13.6|
|100 B2 新|59.83|16.7/16.8|0.2/0.5|10.1→14.2|
|100 A2 原|59.23|16.7/16.8|4.7/6.4|11.2→14.4|
|200 A1 原|45.86|16.7/33.4|6.9/10.1|12.3→13.2|
|200 B1 新|57.50|16.7/16.8|0.6/1.3|13.7→16.4|
|200 B2 新|57.03|16.7/16.8|0.6/1.0|14.8→10.3|
|200 A2 原|46.34|16.7/33.4|6.8/11.1|16.1→13.2|

這個不變遮罩場景有明確重建成本下降；100 A1與A2仍有明顯變異，不宣稱所有100人場景提升近一倍。持續移動／視野改變會重建，不能推論戰鬥FPS同幅改善。heap含GC與量測陣列，短樣本不認證洩漏或長時間穩定，不能代替Windows實體GPU。

原始Trace／cpuprofile／每幀與初始場景完整確定性gzip保存，含原始SHA-256。每個壓縮檔小於8 MiB，本輪證據約9 MiB，不包含影片；檔案可從提交取得，沒有把/workspace冒充下載網址。

## 保留限制與接續

光柵快取局部驗證PASS；原接敵候選戰鬥性能、自然C36、真人趣味、全新十波、長期及實體GPU仍未通過或NOT_TESTED。沒有改既有RC等級，整體維持獨立WIP，不發布、不合併main／Pages／公開版本。

下一項GAME FIRST工作：以既有原生存檔做一次必要的短程接敵複測，記錄玩家指令到實際傷害，並觀察實戰遮罩快取命中率；不再為未重現的單一低FPS反覆跑完整ABBA。若同等低FPS再次出現，再保留該刻狀態與必要追蹤。

STOP_REASON：AGENT_EARLY_STOP，本輪追蹤與可驗證繪圖改善完成後交接，仍有合法後續工作；無平台／額度中斷證據。EXECUTION_DURATION未完整量測，8秒為各戰鬥取樣、3秒為各固定畫面短測，不是開發耗時。AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。未修改main、Pages、RC、Immutable Build、OmGitHub、OpenCode、其他Owner文件、Feed或排程，無公開部署。
