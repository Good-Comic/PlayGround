# 區分城心受擊未知來源與已無法定位

## 玩家差異

原提示把兩件事都稱為「來源未確認」：受擊時從未確認來源；或受擊時曾有可見來源，之後因原視野／存活／世界成員驗證失效而清除追蹤。後者不代表原傷害沒有來源。

新版只區分通用狀態，後者顯示「來源目前無法定位」，並以四語說明不代表知道目前位置或存活狀態。沒有保留舊名字、ID、方向或座標；失效來源仍無法定位或集火。**沒有判斷／揭露敵人究竟死亡或移到哪裡。**

`js/core-damage-readback.js` 在原本已確認來源的受擊事件上保存一個私有布林值knownAtImpact，view只輸出visible／unknown／unavailable。人工動作仍依原row.source與憑證檢查，不能用新狀態追蹤失效目標。last與peak各自維護，不拿後來來源補猜舊事件。

`js/locales.js` 增加四語短標籤與help。沒有新增按鈕、面板、追蹤或戰鬥數值；沒有更改原本「失視野／死亡後永久清除身分，重見亦不補回」規則。存檔schema未改，restore／newRun仍清除暫態記錄。

## 必要驗證

PASS：3個Node測試檔：新core-source-state、既有core-damage-readback及source-event-actions。新測試先在舊版FAIL並保留輸出。覆蓋未知、當前可見、死亡／失視野／離開世界後無法定位、再看見不恢復身分、四語及舊view形狀相容、last／peak不混淆、讀檔清除。

既有測試持續確認原生HP差、完整snapshot及兩個RNG一致、護盾／致命傷、例外隔離、失效憑證及原生命令安全，沒有刪改舊安全測試求PASS。

PASS：Chromium154.0.8037.57，修改前繁中1組與修改後4語共5組受控狀態。真實applyDamage建立事件，再移動來源到視野外；新版顯示無法定位且name／sourceId／direction全null、沒有可見來源動作按鈕。新的無來源傷害仍顯示未知，不誤標曾確認。此矩陣是受控狀態驗證，不冒稱自然敵軍移動。

PASS：另僅以原玩家B快照續玩1組20模擬秒（原生讀取、Tab；真實Game.update，未改存檔或地形）。最後一擊418.7310的QA記錄確認來源#127在受擊時可見；結束時view為unavailable，無身分／方向，顯示「城心上次實損 −4.04 HP · 來源目前無法定位 · 局內6:58」。這證明不是未曾確認來源而漏記；本輪不推斷失效究竟是死亡或失視野。

與上一輪同快照自動直控組比較，記錄的時間、phase、英雄／城心HP、存活數、遊戲RNG、城心受傷及英雄攻擊序列完全相同。不是完整所有實體欄位的比對，也不宣稱整個未來戰役皆相同。新提示沒有改變這段戰況。

正式本地構建來源 `bf2780686d3b75ced3360e73b3c45832f2abe1b2`，168資源SHA-256全部通過。後續只補測試與證據，執行程式未再改。

## 基線、所有權與限制

安全基線 `a9e75c8035c9577b1a7ab8e4cbccb150e3175f1f`，有效Strategy遠端 `e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d`。核對Ownership v395後Dry Run→CAS→正常Push取得v396，收據 `a41563bf83989a40d885eff637f6fdaae384e594`。

任務 `CORE-SOURCE-STATE-7B26D9A1`，Agent `core-source-state-7b26d9a1`，Execution `core-source-state-20261124-7b26d9a1`，分支 `codex/riftwatch-core-source-state-7b26d9a1`。原Fun Lab、英雄及Progress Feed Owner未改動，沒有向其分支寫入。未修改main、Pages、公開版本或RC；未部署，未宣稱背景排程可用。

NOT_TESTED：完整戰役、NG+、100／200單位性能、Windows實體GPU、影片。原快照為觀察器封存的自然場次完整Game.snapshot，非冒稱玩家當時按儲存建立；原文SHA-256與前輪相同並保留gzip副本。沒有重跑三角色或整場戰役。

下一步：核對既有Boss預警快照在密集戰場的繪製與可讀性，只在確認顯示缺陷後修正，不調整傷害或預警時間。
