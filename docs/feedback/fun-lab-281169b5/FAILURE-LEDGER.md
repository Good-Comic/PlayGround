# 失敗與限制保留

第一閉環證據完成，只接受有限指令回饋用途；下列FAIL、INCONCLUSIVE、未評估與歷史紀錄沒有改成PASS。下一旗手人工入口仍實作中，尚無新來源或驗收。

## 中斷／工具／環境

- B第一次Before：玩家子代理明確回報usage limit；恢復時原程序已不存在，未取得程序退出原因。before-interrupted-quota原檔與未finalize錄影片段僅本機保留，不是完整玩家結果，不把無人操作及選卡停留算成遊玩。後來B在相同初始條件重新完成未完成場次；A完成資料沒有重做。見[INTERRUPTION.json](INTERRUPTION.json)。
- A第一次After：明確usage limit訊息後控制器租約到期，原生輸入記錄3筆，模擬曾繼續至敗北，但沒有完成獨立回饋。此場INCONCLUSIVE、排除完成樣本；新的實例從同原封快照另做完成After，不覆寫原檔。訊息沒附時區，不推測恢復時間。見[AFTER-A-INTERRUPTION.json](AFTER-A-INTERRUPTION.json)。
- B-after啟動逾期：首個玩家請求前控制器等待到期，尚未Continue，無遊戲進度損失，不是額度故障或遊戲缺陷。保留after-startup-expired後重啟隔離場次。見[B-AFTER-CONTROLLER-STARTUP.json](B-AFTER-CONTROLLER-STARTUP.json)。
- 轉接器過期@定位、不可見按鈕與Playwright逾時是工具／畫面時序限制，不直接判遊戲Bug。輸入ok不是語意接受；A/B-after最後右鍵的before已defeat，不能算有效集火。B-before及C-before亦有結算後輸入另列。
- Director限制內本機socket／Chromium sandbox EPERM原紀錄保留。經核准的環境外Chromium以未修改正式資源離線回應後重現成功；環境失敗不列遊戲缺陷。見[evidence/director/DIRECT-CHROMIUM-SANDBOX-ERROR.json](evidence/director/DIRECT-CHROMIUM-SANDBOX-ERROR.json)。
- 額度百分比UNKNOWN，不臆測額度／帳號狀態。租約停止與錄影保存的[控制器恢復驗證](CONTROLLER-RECOVERY-TEST.json)是工具恢復證據，不是遊戲樂趣或自動續跑認證。

## Node夾具與歷史Save/Load失敗

初版新增Node直接結果為12 PASS／2 FAIL，兩項是夾具預期：援護保留相同英雄元素但會建立新selection陣列，不能要求陣列參照相等；原生restore先回選單，必須按Continue/start離開選單才呈現戰場摘要。沒有為這兩項改遊戲實作。修正夾具、補密度／Canvas例外／正式沙暴視野後，新17項加相關55項共72 PASS。預設程序隔離只給檔案層級輸出，改明確無隔離模式取得逐項紀錄；初次FAIL歷史仍保留，並非未修正的同一實作失敗。

**真正待選恩賜存檔的嚴格RNG Restore仍FAIL：-1129663591→3165303705，strictStateEqual=false。** 本輪沒改RNG，也沒有修好整個存檔嚴格決定性；UI回讀不額外消耗RNG是另一項通過的檢查，不能蓋掉此FAIL。中斷B的存檔只作32卡左右同屏UI回歸，不混入完成玩家cohort。見[evidence/direct-after-extra/result.json](evidence/direct-after-extra/result.json)。

## 自然玩家與量測限制

- 三Before為隔離冷開自然敗北：A/B第4波、C第5波；三After為各自原封自然快照的正常Continue，仍第4/4/5波敗北，非新十波。自然十波未抵達、NG+未測，不以三敗判Normal失衡。
- 每角色N=1；After已告知摘要／標示用途，非盲測。A-after為新實例，B/C讀自己的Before，學習／行動／路徑／RNG消耗／恢復時序不同，不作嚴格因果A/B或角色能力排名。
- 第一切片：A/C可自然辨認錯令並改護衛，但原弓兵／旗手意圖未完成；B自然誤令恢復未評估，A/B人工標示用途證據不足。不能用別人案例補PASS，不能把命令存在寫成抵達、命中、傷害、擊殺或有效攔截。
- 圖片、UI文字與action前後為相鄰離散取樣，不是同一影格。每5秒正庫存差僅收入下界，原生gathered是全部交付；存活轉變含到期並可能漏樣本間出生死亡，非完整戰鬥傷亡。target／attack參照不歸因實際傷害，congested可為歷史殘留。
- After累積kills/gathered/time帶入存檔前歷程；Restore也帶入已有卡牌／冷卻。observer的boon／技能變化不都代表本段新領卡／每次施放。完整Before與短After總輸入不能比較操作效率；整段認知負擔沒有量測。
- A-after只有一個可支持的無聊時刻；B只有有趣2、無聊1、挫折2；C無聊2，缺第三項照留，沒有拿Before補數。所有再玩／樂趣是AI模擬偏好，非真人滿意度或留存。

## 效能、記憶體與硬體

四個初始100/200同機樣本有相同初始場景SHA/RNG，暖機5模擬秒、量測各30牆鐘秒，零量測錯誤。保留原生AI／碰撞／傷害／死亡、關閉自動生產；暖機後100實際73起，結尾34/32，200實際140起，結尾58/56。這不是持續固定100/200存活。人工目標繪製只占約6–7% frame，短樣本p95不變不等於長時間或因果效能改善。

200 after heap起點17682038、終點17617357 bytes，高於before起點11533917、終點14538587；單次起終點不能證明有洩漏或無洩漏，長期記憶體未證明。整工作階段FPS含選單／選卡／原生暫停，不能當持續戰鬥負載。SwiftShader是CPU軟體繪圖，不是實體GPU。狀態保持MEASURED_SHORT_RUN_LONG_RUN_AND_HARDWARE_INCONCLUSIVE；HARDWARE_TEST_PENDING保留。

真人聽感、整體樂趣、勝率／平衡因果、長期留存、自然完整十波／NG+、持續高存活200與長測仍無所需證據。完整影片僅本機，SHA／大小列[manifest](LOCAL-VIDEO-MANIFEST.json)，不是可下載入口。下一旗手入口的新來源／構建／Node／Chromium／玩家結果皆PENDING，不能把第一閉環有限成果或舊測試沿算成新切片PASS。

## 續作保留紀錄

旗手初版英文390px按鈕被遮擋是實際UI FAIL，已修正並保留重測28/28；初版Node九失敗為共用立即鏡頭夾具，總管第一次FAIL為submit監聽器microtask取樣順序，均保留原日誌。旗手200初測P95 66.8→83.3是效能警訊，後續ABBA沒有一致額外退步但不抹除原值。第二C及整理角色actual quota中斷、一次遠端審核usage-limit未執行皆保存；C僅部分回合。詳見FOLLOWUP-CONTROLS-REPORT.md與followups/CONTINUATION-INTERRUPTIONS.json。


封存原始報告與失敗日誌保留原始空白，完整git diff --check因此仍列空白警告；未修改封存bytes或SHA來消除。另對新程式與整理文件排除這四份原始資料後檢查。

## 城心受傷回饋切片

第一次Node11 PASS／1 FAIL是暫停夾具把原生鏡頭平滑誤當成應凍結；改以未裝觀察的Game比對，不改遊戲鏡頭或暫停規則。第一次Chromium漏傳UI.update的Game參數，屬根代理診斷腳本問題；保留原FAIL，修正後25/25通過。955來源96/96 Node、161資源、相容旗手28/28；A新聚焦續玩是真正第四波敗北且finish，無quota，但仍不證明救城／勝率改善。單次API微量測為刻意重設HP與清粒子的控制成本量測，不是200單位實戰FPS／長測PASS。
