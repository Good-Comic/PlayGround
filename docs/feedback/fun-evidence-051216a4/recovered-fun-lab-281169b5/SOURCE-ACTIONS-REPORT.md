# 從受傷紀錄直接查看與人工反擊

第六個實際切片來源為 `1710938cd79da6d347a54764e85e13b11babca34`。B 已在此來源完成正常 Continue、正式敗北後 finish 並封存報告；證據支持「查看與派令分開理解、已選 16 人集火衝車的可見意圖吻合」，不代表精確歷史個體、取消、後令或勝率全面通過。

後續來源 `35dedfe6ee203a4d9689290dc466484c39557cf8` 修正本輪揭露的終局 P1 與 `showPeak(null)` 例外，並加入不變畫面快取；來源入口重驗 38／38、旗手並存 29／29。根代理已正常推送並以完整 `ls-remote` 核對；[收據](terminal-input/remote-receipt.json)記錄的是當次觀察，後續仍應核對最新來源。第二次 200 單位限定 ABBA 已完成，短樣本未見一致額外退步；原 P95 警訊、長測與硬體限制仍保留。僅獨立開發版本，沒有替換公開遊戲或內部 RC。

## 玩家問題與實際行為

前一輪 B 能讀懂最大 127.8 HP 衝車紀錄，想處理畫面中的衝車，但右鍵後讀回主要是移動，補救未成功。這證實意圖與實際命令落差，尚未證明是 hitbox 程式缺陷，也未證明畫面那輛就是該筆來源。本次新增明確的替代人工輸入，不把這個假說冒充已修復的右鍵根因。

最近與最大實損行各提供兩個分開的操作：

- **查看**：只把原生鏡頭移到該筆仍可確認來源的目前位置，不選兵、不下令、不持續追蹤。歷史箭頭仍只代表受傷當時方位。
- **反擊 N 人**：只對目前選取的 N 名正式戰士下一次既有攻擊。仍須能在實際未遮擋 Canvas 位置由原生 `pickAt` 指到同一敵人；不能直接按內部 ID 繞過命中條件。沒有可靠點就不下令，可由玩家先查看。

不自動選全軍，不加入英雄／村民，不替玩家挑「最佳」來源，不因最大值就自動反擊。之後的原生移動、停止或護衛可以覆蓋。傷害、冷卻、追擊、Fog、沙暴、卡池、資源、模擬時間與 RNG 沒有修改。

## 防止操作過期

每一次真正扣血有獨立、不寫進存檔的事件身分；同 tick、同來源、同數值的新傷也不是同一事件。玩家按下滑鼠或非重複的 Enter／Space 時，綁定正在看的那一行，再於正式 click 時重驗事件、世界、波次、同一來源實體、選兵及操作模式。

紀錄更新、換波／讀檔、選兵改變、來源死亡／失視野、暫停／其他面板、失焦或取消手勢，都不能偷偷換成另一筆後發令。失效時以一般訊息說明未執行；不重新印出已失去的來源身分。舊紀錄失去視野後不會因敵人再出現而恢復追蹤。隱藏的最大行沒有可用控制。

四語保留，事件時刻加上「局內／Game／経過」基準說明。固定按鈕節點保留 Tab 焦點，Space／Enter 長按不重複派令，也不漏成全域暫停。平時不搜尋原生命中點；Canvas／DOM 查詢只在玩家明確啟用時執行。

改動為 `js/manual-target.js`、`js/core-damage-readback.js`、原安裝呼叫、四語與局部樣式，另增兩份測試；`js/game.js` 雜湊保持 `98c108da3f4bd3d1d435784b01763e63cd88376dd7133c9963c0f59503d1567e`。

## 已完成的技術驗證

| 層次 | 結果 | 證據與限制 |
| --- | --- | --- |
| Node 整合 | 162／162，加相容回歸 26／26，合計 188 項唯一測試通過 | [整合日誌](source-actions/node-integration-r1.txt)、[相容日誌](source-actions/node-compatibility-r1.txt)；包含 57 項事件／介面與 30 項原生目標適配測試 |
| 正式構建 | 162／162 資源 SHA-256 相符 | [重算結果](source-actions/resource-check.json)、[完整 manifest](source-actions/build-metadata.json) |
| Chromium 來源操作 | 36／36 通過，零程式錯誤 | [結果](source-actions/browser/result.json)：原封 B 存檔正常 Continue 先記自然首擊；其後明標受控傷害與凍結模擬的手勢／介面邊界 |
| Chromium 旗手並存 | 29／29 通過，零程式錯誤 | [結果](source-actions/flag-compatibility/result.json)：原生旗手查看／單次命令與四語四視口；雙行版面另用明標受控刺激 |
| 遠端保存 | 完整 SHA 相符 | [推送收據](source-actions/remote-receipt.json)，Ownership 273／原收據 097b5d3d80e18f6be9fca543af82024689eb38fe |

受控 Chromium 確認滑鼠一次派令同一來源、查看不選兵或攻擊、Space／Enter 長按一次、操作期間換事件／同名新來源／選兵／死亡／暫停／換波／原生 restore 均零錯令、固定 DOM、純讀完整快照與兩種 RNG 不變，以及正常 Save／Continue 不重播舊受傷情報。

[受控反擊畫面](source-actions/browser/controlled-source-retaliate.png)中 175.2／15.2 HP 來自明標原生 180／20 傷害刺激，**不是自然攻擊、平衡數值、玩家成功或勝敗證據**。[日文窄窗](source-actions/browser/controlled-ja-390.png)可操作，但戰場可視面積仍小，主要平台仍為 Windows 桌面。連續技術操作錄影為 [來源操作](source-actions/browser/continuous-browser-test.webm)與[旗手相容](source-actions/flag-compatibility/validation.webm)，不是剪接的自然完整戰役。

## B 完整自然續玩的有限閉環

本輪 B 沿用每意圖至少 5 秒的一般休閒設定，以正常 Continue 接續自己的原封自然快照，無 quota 中斷，`stopReason=PLAYER_FINISHED`。不是全新十波，也不是盲測；B 保有先前學習，每角色 N=1，不能估計因果效果或真人體驗。[原始報告](source-actions/B-natural-retest/REPORT.md)、[JSON](source-actions/B-natural-retest/REPORT.json)、[原封存值](source-actions/B-SEALS.json)及 [Director 獨立複評](source-actions/director/SOURCE-ACTIONS-PLAYER-REVIEW.md)分開保存，原文不改。

| 面向 | 自然證據與可接受結論 | 保留缺口 |
| --- | --- | --- |
| 查看 | wall 77.342 點查看；原選取 16 人與護衛命令保留，畫面明示「尚未下令」 | 無法證明是二十多秒前最早讀到的同一歷史個體；戰鬥中 18→16 不能歸因查看 |
| 反擊 | wall 105.978 操作後，16 名已選戰士皆為 `manualAttack=true`、同指向當前衝車，畫面有 16／19、集火摘要及環標；未自動納入另外 3 人 | 可見類型與命令意圖吻合；不證明命中、擊殺、救城或最佳威脅選擇 |
| 記錄理解 | 能區分最近／本波已記錄最大單次實損、局內事件時刻、受傷當時方向與查看的目前位置 | 沒有常駐總時鐘供精算距今；同名同型個體連續身分未評估；最大不是 DPS／總傷害／排名 |
| 取消／後令 | 本輪沒有自然取消，也沒有反擊後另給軍隊命令 | **NOT_EVALUATED**；不能由受控案例、提示文字或終局 E 補成玩家 PASS |
| 操作／樂趣 | 查看與反擊各 1 意圖；查看到反擊 28.636 秒，含閱讀、模型與工具。B 對「看與下令有分界」及命令有把握有正向回報 | 查看是可選入口，不是反擊必經步驟；無平均成本下降證據。有條件再玩，立即重開意願仍低，非真人留存或整體樂趣提升 |

Continue 至結果觀察牆鐘 90.714 秒，本段模擬約 80.062 秒；正式第四波敗北，累計 3／10 波、74 擊殺、4,314 採集、8:51，沒有新增已度過波數。累計值含存檔前歷程，不能全算本段收益。有趣 2、淡場 1、挫折 2 項各保留缺額，不虛構第三項。

[查看後畫面](source-actions/B-natural-retest/screen-0006.png)、[16 人集火衝車](source-actions/B-natural-retest/screen-0007.png)、[正式結算](source-actions/B-natural-retest/screen-0009.png)與[連續原生操作片段](source-actions/B-natural-retest/continuous-view-retaliate-defeat.webm)可合讀。文字、PNG 與 action 前後是相鄰取樣；最近／最大行與列數會自然更新，不能拼成同一事件。pointerdown 到 click 的事件綁定不會凍結玩家更早讀到的歷史行位。

B 的最後 E 發生在敗北後，真的新增護盾與冷卻，另列為 [P1 終局輸入缺陷](TERMINAL-INPUT-REPORT.md)。`observed_skill_activations.aegis=2` 混入 Continue 還原冷卻與終局 E，不能當兩次有效戰鬥施放；原始 metrics 不改。

## 初次效能與真實 UI 警訊

[初次結果](source-actions/performance-initial/result.json)對照第五切片 `1456591db51ee4fb0cf6714ccb5dc6b645a33625` 與第六切片 `1710938cd79da6d347a54764e85e13b11babca34`。同機、同一 B 原封快照原生增兵至初始 100／200，起始場景與遊戲／視覺 RNG 配對相符；每案暖機 5 秒、量測 30 牆鐘秒，ABBA 各兩次，保留 AI、碰撞、傷害與死亡。

| 初始兵量 | before FPS 兩次 | after FPS 兩次 | before P50／P95 ms | after P50／P95 ms |
| --- | --- | --- | --- | --- |
| 100 | 21.84／21.19 | 21.73／22.04 | 50／50.1；50／50.1 | 50／50.1；50／50.1 |
| 200 | 12.75／12.76 | 13.02／12.84 | 83.3／83.4；83.3／83.4 | 83.3／83.5；83.3／99.9 |

**200 after 第二次 P95=99.9 對 before 83.4 的警訊保留，未判無退步。** 200 案量測起點約 183 存活、結尾 145–148；已知來源覆蓋僅約 6.8–8.5%，雙列最大來源覆蓋為零，不代表持續 200 或一直有兩個可點來源的最重負載。N=2、30 秒、SwiftShader 軟體繪圖及 heap 波動不能建立長測、實體 GPU或效能因果結論。B 整工作階段 42.78 FPS 含選單／結算，也不能沖銷這項警訊。

四個 after 的 `uiFaults=265／266／240／237`，原生傷害觀察 `faults=0`。空 page errors 不等於零被 catch 的 UI 例外。`showPeak(null)` 在比較右側解參照空 view 是真實實作缺陷；原三個紅燈為空／未知紀錄重複掃軍隊、不變呈現重複讀模板與控制、DOM 故障案例額外觸發空紀錄 paint 例外，**不是夾具問題**。[原始 61 PASS／3 FAIL 與修正後 111／111](source-actions/cache-debug/交接.md)均保留。

來源 35dedfe 的 null guard 與呈現快取只省去確定存在的重複工作；仍逐次驗視野及 pending 操作，真正啟動重新驗證，不用快取授權命令。正式來源手勢重驗 [38／38](source-actions/browser-r2/result.json)含 `uiFaults=0`、原生傷害 `faults=0`，旗手並存 [29／29](source-actions/flag-compatibility-r2/result.json)。這些功能驗收本身不能證明原 P95 警訊的 CPU 因果或已修復。

## 200 單位限定複測

重效能程序已由根代理確認正常結束並關閉瀏覽器，之後才執行本次複製與雜湊。[原始 r2 結果](source-actions/performance-r2/result.json)固定對照 1456591 與 35dedfe；兩組配對初始 scene SHA、遊戲／視覺 RNG 相符，仍是各兩次 30 秒牆鐘 ABBA，有原生死亡。

| 模式／重複 | FPS | P50／P95 ms | 量測起點→終點存活 | 已知來源覆蓋 | Heap 起點→終點 bytes |
| --- | ---: | --- | --- | --- | --- |
| before 1 | 12.834 | 83.3／99.9 | 183→148 | 8.33% | 18725333→22880897 |
| after 1 | 12.659 | 83.3／99.9 | 186→148 | 5.08% | 14994624→24916078 |
| after 2 | 12.917 | 83.3／83.4 | 184→145 | 5.08% | 11588325→13935524 |
| before 2 | 12.822 | 83.3／99.9 | 183→145 | 16.95% | 18048983→16884178 |

四案 page errors 為空；四案共 237 筆 trace 的原生傷害 `faults` 全為 0。兩個 after 共 118 筆 `uiFaults` 全為 0；before 沒有輸出這個欄位，不能補成 0。四案已知最大來源覆蓋均為零，暖機後兵力與目前可見來源不同。trace核對見[封存與量測核查](source-actions/SEAL-VERIFICATION.json)。

本次只支持「新短樣本未見一致額外退步」；before本次P95也為99.9，顯示取樣環境與負載有變異，不能倒抹初次171 after 99.9對before83.4的警訊，不能宣稱因果加速、持續200存活、長期無洩漏或實體GPU通過。

歷史嚴格 RNG Restore 表示 `-1129663591 → 3165303705` 的 FAIL 仍保留，沒有以純 UI RNG 測試覆蓋。自然十波／NG+、真人樂趣與聽感、長時間記憶體及實體 GPU 仍未通過；目前沒有整體更好玩、救城或勝率提升的結論。

下一合法工作是完成 P3 已套用逐建築成本／保留缺口診斷的正式驗收。P3 五檔已在本地提交 `9117a02f9b6fe4989c744b90802df522dd0b7c07`、Node 64／64；正式163資源構建／Chromium仍在驗收，尚未推送，不能列已交付。來源回饋可後續分開評估「成功訊息加該次已消耗事件的類型／局內時刻」與「穩定行位」，不先增加查看描邊或自動追蹤。一般 Push 是保存點；整項任務仍持續，`AUTO_RESUME_AVAILABLE=false`，不宣稱排程待機自動喚醒。

本次兩份玩家報告與兩份Director原文SHA重算相符，見[封存核對](source-actions/SEAL-VERIFICATION.json)。既有副本及新r2必要副本的大小／SHA列於[copy manifest](source-actions/COPY-MANIFEST.json)；舊腳本、原失敗及來源缺失資訊照實保留，不改raw bytes。完整長錄影沒有新增可下載宣稱。
