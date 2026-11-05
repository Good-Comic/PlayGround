# 失敗與限制保留

本整理截至根代理已驗遠端35dedfe；第一閉環及後續各來源分開記錄。下列FAIL、INCONCLUSIVE、未評估與歷史紀錄沒有改成PASS；七切片不是三角色七輪完整重測，P3本地候選仍正式驗收中。

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

真人聽感、整體樂趣、勝率／平衡因果、長期留存、自然完整十波／NG+、持續高存活200與長測仍無所需證據。完整影片僅本機，SHA／大小列[manifest](LOCAL-VIDEO-MANIFEST.json)，不是可下載入口。這一段保留第一閉環6075當時的缺口；後續旗手來源與限定驗收另見FOLLOWUP-CONTROLS-REPORT.md，不能用舊測試沿算新來源或把C部分回合變成完整After。

## 續作保留紀錄

旗手初版英文390px按鈕被遮擋是實際UI FAIL，已修正並保留重測28/28；初版Node九失敗為共用立即鏡頭夾具，總管第一次FAIL為submit監聽器microtask取樣順序，均保留原日誌。旗手200初測P95 66.8→83.3是效能警訊，後續ABBA沒有一致額外退步但不抹除原值。第二C及整理角色actual quota中斷、一次遠端審核usage-limit未執行皆保存；C僅部分回合。詳見FOLLOWUP-CONTROLS-REPORT.md與followups/CONTINUATION-INTERRUPTIONS.json。


封存原始報告與失敗日誌保留原始空白，完整git diff --check因此仍列空白警告；未修改封存bytes或SHA來消除。另對新程式與整理文件排除這四份原始資料後檢查。

## 城心受傷回饋切片

第一次Node11 PASS／1 FAIL是暫停夾具把原生鏡頭平滑誤當成應凍結；改以未裝觀察的Game比對，不改遊戲鏡頭或暫停規則。第一次Chromium漏傳UI.update的Game參數，屬根代理診斷腳本問題；保留原FAIL，修正後25/25通過。955來源96/96 Node、161資源、相容旗手28/28；A新聚焦續玩是真正第四波敗北且finish，無quota，但仍不證明救城／勝率改善。單次API微量測為刻意重設HP與清粒子的控制成本量測，不是200單位實戰FPS／長測PASS。


## 第六切片來源入口與初次效能警訊

第六來源1710938的B已完整自然Continue至第4波敗北並finish，無quota中斷；查看不派令、16人集火衝車的可見意圖有證據。精確最初歷史個體、自然取消、手動後令仍NOT_EVALUATED；不能以私有ID、受控測試或終局E補PASS。B只有有趣2、淡場1、挫折2，缺額保留；仍不證明救城、整體樂趣、勝率或真人留存。詳細判讀見[SOURCE-ACTIONS-REPORT.md](SOURCE-ACTIONS-REPORT.md)及Director原文。

初次100／200 ABBA以145對171，200 before P95為83.4／83.4，after83.5／99.9。**第二after99.9對83.4警訊保留，沒有判為無退步。** after uiFaults265／266／240／237，原生傷害faults0；page errors空不代表被catch的HUD例外不存在。雙列knownPeak來源覆蓋0、已知來源覆蓋低、有死亡、每案30秒、N=2與SwiftShader不能建立長測或硬體結論。

快取委派實作前61 PASS／3 FAIL確實抓到：空／未知記錄重複掃軍隊、不變畫面重複讀模板／控制、DOM故障測試另外觸發showPeak(null)空紀錄paint例外。**這三項是真實實作問題，不是夾具問題。** 35以最小null guard與不變呈現快取修正，定向111／111、正式來源Chrome38／38內uiFaults與原生faults0；仍即時驗視野／pending，真啟動不借快取授權命令。這些證據不把原P95逐次歸因或宣稱因果加速。[原始紅燈與交接](source-actions/cache-debug/交接.md)保留不改。

200限定r2已完成：145對35，before P95為99.9／99.9，after99.9／83.4，P50皆83.3，FPS約12.66–12.92。初始場景／遊戲與視覺RNG配對相符，但暖機後存活183／186／184／183，結尾145–148；after已知來源覆蓋各5.08%，knownPeak覆蓋0。兩個after共118筆uiFaults0，before沒輸出此欄，不補為0；四案237筆原生faults0、page errors空。只列「新短樣本未見一致額外退步」，不抹初次99.9對83.4，不宣稱持續200、無洩漏、長測或實體GPU通過。[原始r2](source-actions/performance-r2/result.json)及[trace核查](source-actions/SEAL-VERIFICATION.json)已封存。

## 第七切片：真正的結算後玩法缺陷與腳本期待錯誤

自然B在171來源的wall129.293按E，before／after都defeat、core=null、sim531.3062000001029不變，但aegisCd由0到60、14個己方單位新增shield60／shieldTime5。這是Director分類P1的實際副作用，不只提示、不改寫該敗北，不是挽救成功。原[摘要](terminal-input/natural-B-before-defect.json)與兩份完整快照SHA保留。

原始terminal Node為2 PASS／6 FAIL，顯示終局正式技能、命令或訓練仍改狀態；不能把真實紅燈改叫夾具。35在main玩法鍵鼠及Game.command／兩技能加terminal guard，Node213／213、162資源、正式Chrome結算19＋來源38＋旗手29支持限定修復。勝利／NG+案例是明標受控triggerVictory及原生按鈕，不是自然十波／Boss／NG+戰役通關。

根代理兩次Chrome腳本FAIL另保留：cycle誤期待0而正式首周目是1；已恢復模擬的liveCD誤要求仍精確60。只修腳本，最終在施放當下記cdAtCast60與shieldAtCast60，再允許正常倒數；沒有改周目、神盾數值或冷卻。與自然P1、原Node6FAIL、cache三實作紅燈分別分類。見[兩次腳本結果](terminal-input/initial-fixture-cycle-fail/result.json)、[冷卻期待結果](terminal-input/initial-fixture-cooldown-fail/result.json)與[最終19項](terminal-input/browser/result.json)。

B metrics的aegis=2混入Continue還原冷卻與終局E，不能說兩次有效活局施放；原metrics不改。嚴格SaveLoad RNG -1129663591→3165303705仍FAIL，與本次終局拒絕副作用是不同問題。

## 保存／缺檔與下一工作

第六B兩報告、兩份Director與自然終局兩快照皆重算符合提供的封存值；source-actions及terminal-input的copy manifest保留每檔SHA／大小。舊source-actions初版瀏覽器腳本與目前R同名腳本不同，原bytes保留，不覆寫成新版；連續B片段目前僅在repo歸檔、未取得獨立原片段來源及精確裁切offset，不能補造來源或完整影片下載入口。所有原始日誌／語言／sealed不改。

P3五檔已本地提交9117a02f9b6fe4989c744b90802df522dd0b7c07、Node64／64；歷史委派首測24／24保留。正式163資源構建／Chromium驗收中、尚未推送或列交付；自然理解成效不預填。既有usage-limit與actual整理角色中斷、控制器45秒暫停／存檔和65秒保存紀錄不改；安全收尾不等於玩家完整回合或排程自動喚醒。整項任務持續，AUTO_RESUME_AVAILABLE=false。
