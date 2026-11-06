# C 組命令到戰果鏈只讀診斷

範圍：僅指定 C/after 的 action-observer、command-events、damage-events、samples、result，以及指定 worktree/js。沒有操作瀏覽器、讀獨立 A、改遊戲或舊資料。本報告不提出設計或數值修改。

## C-36：同步接受成立，後續六人發生壅塞失敗

command-events.jsonl／C-36／sim 464.2801：10 人皆由原目標切到 #126、manualAttack=true、order=null；action-observer.jsonl／C-36／sim 464.3967 亦確認 orderFailure=null。按鈕成功不只依 ok 或 undefined 回傳判斷。

以同步命令起算 15 sim 秒（464.2801–479.2801），damage-events.jsonl 對 #126 的已選來源為 #17、#24、#105、#108，各 8 擊，各實扣 8 HP，共 32 HP。城心 #1 另有 8 擊實扣 8 HP，不包含於 32。amount 是輸入傷害，必須用 beforeHp−afterHp 計實扣。

|單位|起始距離|15秒命中／實扣|後續分類|
|---|---:|---:|---|
|#16|2.481|0／0|ORDER_FAILURE / PATH_CONGESTION|
|#17|1.534|8／8|EXPECTED DESIGN|
|#24|3.187|8／8|EXPECTED DESIGN|
|#70|3.786|0／0|ORDER_FAILURE / PATH_CONGESTION|
|#72|3.456|0／0|ORDER_FAILURE / PATH_CONGESTION|
|#85|3.276|0／0|ORDER_FAILURE / PATH_CONGESTION|
|#105|1.721|8／8|EXPECTED DESIGN|
|#108|5.308|8／8|EXPECTED DESIGN|
|#109|7.248|0／0|ORDER_FAILURE / PATH_CONGESTION|
|#113|7.504|0／0|ORDER_FAILURE / PATH_CONGESTION|

samples.jsonl／sim 468.9132：全體仍活著、目標 #126、manualAttack=true、orderFailure=null。sim 474.6296：#16、#70、#72、#85 已目標 #127；#109、#113 已目標 #132；這六人 manualAttack=false、orderFailure=congested。#17、#24、#105、#108 持續 #126 並命中。六人的首次失敗時刻只可界定在 (468.9132,474.6296]；不把取樣間的瞬間狀態寫成已觀測事實。

sim 468.9132→474.6296 六人的位置幾乎停住，距 #126 分別約 1.88、2.72、2.24、2.42、6.19、5.71。死亡不是該期間失敗的解釋；六人至 sim 484.7792 仍活著。迷霧無逐幀紀錄，不能完全排除任何中間瞬間變化，但不能據此主張迷霧造成失敗。明確 congested 與原生失敗分支提供較直接證據。

## 原生規則與精確界線

game.js:1487–1500：對單位射程門檻為 unitRange + 目標半徑；超出門檻則 stepToward。返回 congested/unreachable 會記 orderFailure、把該目標封鎖 8 秒、清 target 與 manualAttack，再 acquireTarget 替換。這能解釋同步成功後改打 #127/#132，分類 ORDER_FAILURE / PATH_CONGESTION；不是命令未接受。無逐幀碰撞資料，究竟是哪個友軍、敵軍或建築形成瓶頸是 UNKNOWN，不能斷言導航程式有 bug。

game.js:1812–1822：目標距離兩秒未改善會重規劃；位置六秒內未移動超過 0.4 會回 congested。這是明確原生退出規則。game.js:1431 也有失去可見目標時清 manualAttack 的分支，但本次紀錄沒有可見性逐幀旗標，不能把它當已發生原因。

data.js:137–153、179–195：民兵／近衛基本 range=1，槍兵=1.5，弓兵=5，衝車 radius=0.4；因此無其他修正時對衝車門檻為 1.4、1.9、5.4。unitRange 尚受效果及煙霧修正（game.js:794–801）；距離表是中心距離，並非已記錄的逐幀最終射程。

data.js:191–195 衝車基本 armor=50；game.js:2087 為 max(1,輸入傷害−armor×0.6)。本窗口近衛輸入16.8、槍兵7.2、弓兵2.1，實扣全部只有1，與此護甲規則相符（EXPECTED DESIGN），不能把 amount 加總誤作實際扣血。這不構成對平衡優劣的判決。

manual-target.js:11–37 在執行前檢查目前敵軍存活且可見、所選正式戰士交集及落點；執行後再以全體 manualAttack 與 target 同步確認。game.js:3309 清阻擋目標和失敗記錄；同步接受不保證能走進射程或擊殺。

## 最後城傷與 C-15

damage-events.jsonl／sim 485.5625：#126→城心#1，輸入 132.6，HP 88.19500→-39.60500，afterAlive=false。result.json 的最後狀態 #126 仍活著（144 HP）。這是戰果失敗，不能單獨推出 UI 或命令接受失敗。

C-15：command-events.jsonl／sim160.6257／#19 的 issueTacticalCommand result=true，末態 guard(protectedId=1)、move、targetPos 已成立；action-observer sim160.7591 位置已開始改變。samples sim172.2580、177.2912、182.3577：#19 在(21.4826,25.5727) idle、guard仍在、無失敗，符合進入城心護衛容許圈；到達是護衛範圍，不保證站到 destination 精確座標（game.js:3411–3443）。

samples sim195.4071：#19 已攻擊#55、order=null、orderFailure=congested；sim200.4236 攻擊#57且仍 congested。只能確認先到護衛圈、後來發生失敗並解除護衛令；中間 13 sim 秒缺口無法判別是護衛移動還是交戰追擊首次引發。game.js:3432 會在既有 orderFailure 時清 tacticalOrder，game.js:3442 也會在移動失敗清令；精確分支為 UNKNOWN，不能預設需要修正。

## 資料精度

REPORT.json 保留逐單位同步接受、距離、完整窗口傷害事件與後續樣本。傷害事件提供逐擊 HP 差；samples 常約5秒，但存在更長缺口，不能聲稱逐幀追蹤。15秒是本分析窗口（TEST_LIMIT），不是遊戲承諾的完成期限。未讀取／修改 GDD，沒有更改或判定任何設計需求。
