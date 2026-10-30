# 原生圖集生命週期與實際記憶體 / Native atlas lifecycle and actual memory

來源／Source `0bd29b4c59c2a6acbca47fd029bbbeea22932666`. **LIFECYCLE_SCOPED_PASS**22 Chromium checks; **LONG_DURATION_LEAK_INCONCLUSIVE**; GPU memory **NOT_TESTED**.

繁體中文：使用真正原生Save產生的磁碟設定檔，以Continue讀取PER，正常Start／Pause／Abandon切換PER、CHN、JPN共九次。每次主選單的文明Image、ready及frameImages引用均清空，遊戲中僅當前文明圖集載入，三文明重訪畫面已檢視，無舊圖殘留或空白英雄。這不等於證明瀏覽器已立即歸還全部記憶體。

English: A disk profile created by actual native Save loads PER through Continue, followed by nine native Start/Pause/Abandon transitions across PER/CHN/JPN. Civilization Image/ready/frameImages references clear in menus, only the current civilization loads in game, and revisited images were reviewed without stale/blank heroes. This does not prove immediate return of all browser memory.

繁體中文：實測CDP Heap及Linux各程序RSS／PSS，不用398→154MiB解碼代理值當RAM。初測還原多個舊分頁，保留multi-tab-confounded，不用作單頁占用結論。單分頁復驗仍看到程序記憶體成長；最終診斷關閉所有其他分頁，保留單一測量頁。RSS各程序加總會重複計算共享頁；PSS為可讀程序的比例分攤，均不等於GPU顯存或完整系統獨占RAM。每次保留forced GC前後Heap，GC後採樣與遊戲幀非原子操作，不保證每個數字都降低。

English: Measure actual CDP heap and per-process Linux RSS/PSS rather than treating398→154MiB decoded proxies as RAM. Initial startup restored multiple old tabs; retain multi-tab-confounded without using it as single-tab memory. Single-tab review still showed process growth. Final diagnostics close all other pages and retain one measured page. Summed RSS double-counts shared pages; PSS proportionally attributes readable processes, neither GPU VRAM nor complete exclusive system RAM. Heap before/after explicit forced GC is retained; sampling/game frames are not atomic, so every post-GC value need not decrease.

繁體中文：最終程序RSS合計約750.16→1078.58MiB，PSS約475.85→788.63MiB；明示的Chromium Memory.simulatePressureNotification(critical)診斷後約753.84／462.81MiB。主要增量可回收，與可丟棄瀏覽器資源累積相容，但無法由此證明沒有洩漏或確定唯一快取來源。這是測試瀏覽器的顯式診斷，不是正常玩家行為、主機記憶體壓力或生產修復；未改任何遊戲美術或畫質。長時段／實體硬體仍待驗收，無GPU記憶體指標。

English: Final summed process RSS grows about750.16→1078.58MiB and PSS475.85→788.63MiB. Explicit Chromium Memory.simulatePressureNotification(critical) diagnostics reduce them to about753.84/462.81MiB. Most growth is reclaimable, consistent with discardable browser resources, without proving no leak or one specific cache cause. This is an explicit test-browser diagnostic, not normal player behavior, host memory pressure or a production fix; game art/quality are unchanged. Long-duration/physical hardware acceptance remains pending and GPU-memory metrics unavailable.

| Stage | Heap before GC MiB | Heap after GC MiB | Summed RSS MiB | Summed PSS MiB |
| --- | --- | --- | --- | --- |
| native-continued-PER | 7.64 | 5.04 | 750.16 | 475.85 |
| menu-0-PER | 5.01 | 4.74 | 759.74 | 484.60 |
| play-0-PER | 6.23 | 5.10 | 789.48 | 510.16 |
| menu-0-CHN | 6.87 | 4.88 | 814.17 | 523.69 |
| play-0-CHN | 5.68 | 5.16 | 836.14 | 548.89 |
| menu-0-JPN | 6.45 | 4.98 | 841.54 | 554.29 |
| play-0-JPN | 6.23 | 5.29 | 865.82 | 581.46 |
| menu-1-PER | 6.96 | 5.02 | 894.41 | 610.83 |
| play-1-PER | 5.82 | 5.33 | 902.52 | 617.31 |
| menu-1-CHN | 6.85 | 5.12 | 930.20 | 645.40 |
| play-1-CHN | 6.03 | 5.37 | 935.19 | 649.96 |
| menu-1-JPN | 5.46 | 5.13 | 939.59 | 656.06 |
| play-1-JPN | 6.38 | 5.41 | 965.74 | 681.16 |
| menu-2-PER | 5.83 | 5.16 | 970.38 | 685.80 |
| play-2-PER | 6.10 | 5.41 | 1001.11 | 716.06 |
| menu-2-CHN | 7.05 | 5.17 | 1010.01 | 725.58 |
| play-2-CHN | 5.97 | 5.43 | 1036.23 | 751.10 |
| menu-2-JPN | 7.06 | 5.25 | 1066.35 | 782.54 |
| play-2-JPN | 6.23 | 6.36 | 1078.58 | 788.63 |
| after-explicit-browser-cache-pressure | 6.94 | 6.27 | 753.84 | 462.81 |
