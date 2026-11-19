# 單案例逐幀配對：退路候選的局部往返已確認

任務 ESCAPE-TRACE-6E42B8D1，分支codex/riftwatch-escape-trace-6e42b8d1，獨立執行codex-escape-trace-6e42b8d1-20261119。認領Ownership344，收據64fbaa4bcad537025f46fa5cf4b1a0514dfbc8e4；基底8f4591f98dc5bb845f2ed3617a5ddf856dafafa7。Strategy遠端e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，使用者最新GAME FIRST修訂優先。原Fun Lab仍OWNED，未接管或修改其工作。沒有公開部署或受保護分支修改。

## 診斷結果

選定已封存6混兵／間距0.7、FRK、steppe、seed42、20模擬秒的25號，以原fixture與正式Game API執行，不重跑自然三角色。為查明上一輪已否決退路補丁為何退步，僅在獨立工作樹暫時重套原補丁，未改任何補丁參數，測完完整撤回。

|項目|原版|已否決退路候選|
|---|---|---|
|25號實際命中|4|0|
|實際移動路程|14.63格|33.81格|
|連續近反向步伐配對|12|546|
|配對時路點相同|12|545|
|相對當前命令方向的反向移動|0|246|
|反向移動時無有效yield租約|0|246|

近反向定義為相鄰非零移動向量餘弦小於-0.9；配對可重疊，546不是546個獨立循環。246是相對本次steer輸入desired方向，和兩幀實際方向比較屬不同統計，不可相加。

首個「路點相同且配對包含反向移動」在3.7模擬秒，路點(7.5,5)，方向餘弦約-0.9355，兩步淨位移約0.01257格。兩步記錄的navStalled都是0，因為實際走動會清除該計數。不是有效交通租約，也不是這兩步中A*換終點造成的反向。整體545組同路點配對支持局部steer往返，而非單憑先前每秒位置猜測。

這個同來源配對顯示，單步增加後方安全方向會讓行走距離上升、反向往返大增卻失去攻擊效果。不能把減少congested或產生合法位移當作接敵成功。保持先前否決結論，不把候選採入遊戲。

限制：這是候選退步原因，不是原版C-36原始地圖的精確回放；原版仍有12組近反向步伐且其他單位可能不命中，不能由本案例斷言所有原版問題同一根因。沒有更改6秒失敗、2秒重算、傷害、射程、碰撞、Boss或RNG。

## 觀察器與來源驗證

每個受測版本都以未包裝控制場次對照包裝場次。每幀digest包含全部6名單位位置、HP、狀態、目標、手動命令、完整nav、進度、yield與heading。最後正式snapshot另深比較，唯一排除savedAt牆鐘時間，其餘含遊戲／視覺RNG與命中均相等。

原版每幀digest為9a63effc1b64d77c889e44f91476af5358fb4d0d9c8f6452912b3ae043be52c5；候選為38fa29bbf65e21ff32f70196a0a4699b5174f7ba4dd58e82a8c3c532332dab45。這兩個版本本來行為不同，不要求彼此digest相等，只要求各自觀察器／控制相等。source.json保存兩版crowd.js與補丁SHA-256。

初次snapshot深比較因savedAt不同而FAIL，原始stderr保留；這是測試器把牆鐘當模擬狀態，不是遊戲決定性FAIL。修正只排除savedAt，不放寬其餘欄位。中途補來源SHA與waypoint欄位後重測同案例，均保留本機階段輸出；正式交付只採最後waypoint與baseline配對，不把反覆改進工具累加為獨立玩家場次。

工具probe.mjs要求明確傳入受測crowd.js SHA-256，錯誤來源直接拒絕且不產生檔案，避免再出現案例／來源誤標。analyze.mjs可由保存原始輸出重算以上指標。兩個工具node --check PASS；撤回後ally-attack-detour、manual-target兩個Node測試檔PASS。壓縮證據逐檔解壓與SHA-256 PASS。

## 重現與範圍

在合法獨立工作樹，原版可執行：

`node tools/qa/escape-trace-6e42b8d1/probe.mjs <全新輸出.json> 5bfa8fd953a961a3e000cec02c0d32a37c67b88fc1c4cff0554101c8ff245afd`

若實際crowd來源改變，此命令應拒絕；不要改寫輸出來繞過驗證。要重驗否決候選，須先合法隔離並套用上輪明確rejected補丁，預期SHA為4742a2cbc44f48dbc6ebad45ae8d70f97e1a2cb2437879eb92c07148b846ae4a。不要把此補丁直接整合至正式遊戲。

`node tools/qa/escape-trace-6e42b8d1/analyze.mjs <原始輸出.json> <全新摘要.json>`

候選未採用；最終所有js／css／index與安全基底完全相同。正式Build、Chromium、100／200性能、四語、Save／Load操作、NG+及自然十波本輪NOT_TESTED；Node snapshot等效不等於真實瀏覽器Save／Load驗收。沒有新增截圖或玩家可見修正。未更動排程、Feed、公開OmGitHub或其他Owner文件。QUOTA_PERCENT_UNKNOWN。

## 下一步

停止嘗試沒有持續路徑意圖的後方角度擴張。回到原版未命中的22號，先隔離其碰撞拒絕與路點切換事件；必要時擴充同一單案例觀察器，勿再重跑八組矩陣或三角色戰役來累積重複證據。C-36仍未修復。

STOP_REASON：AGENT_EARLY_STOP，本輪完成明確單案例診斷後交接，仍有合法後續診斷，未宣稱平台／額度中斷。EXECUTION_DURATION：未完整量測；20模擬秒是每場樣本，不代表開發耗時。AUTO_RESUME_AVAILABLE：UNVERIFIED。
