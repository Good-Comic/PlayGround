# 本波最大實損｜唯讀程式複評

**結論：1456591的實作符合先前裁決，未發現阻擋性的合法性、狀態或情報洩漏缺陷。可進入B的知情自然續玩驗證。Node101／101、正式161資源、城心最大值直接Chromium28／28，以及本次已完成的旗手雙行回歸29／29，支持已測技術案例；尚未證明玩家理解、閱讀負擔或控制效果改善。**

本次只讀core-damage-readback.js、相關四語文字／樣式、測試與指定既有結果，並讀取審查期間完成的direct-flag-max結果；未啟動瀏覽器／遊戲／Node／效能程式，未操作Git，未改root、遊戲或sealed原件。唯一新增為本文件，依最新明確要求全文採臺灣正體中文。

## 來源與證據

受評來源：1456591db51ee4fb0cf6714ccb5dc6b645a33625。

| 證據 | 實際範圍與結果 |
| --- | --- |
| node-core-max-first.txt | 101／101、0 fail；含既有原生傷害／致命隔離及新增最大值案例。本角色只讀日誌，沒有重跑 |
| direct-core-max/result.json | 28／28，before955、after145，兩者正式161資源SHA；原封A存檔自然命中後，另施明標受控大→小傷害 |
| direct-flag-max/result.json | 本次讀取時已完成29／29，來源145、正式161資源；強制雙行HUD與RALLY四語×四視口並存、原生旗手入口及阻擋回歸 |
| B | READY尚非玩家結果；本次沒有B新報告，不能列玩家PASS |
| 舊A自然回合 | 955回合提出最大單次需求；不能拿它當145新增行已被玩家測過 |

兩份直接Chromium結果errors皆空、來源一致；分別對A／C原封自然存檔使用正式Continue，但大→小傷害與強制雙行為CONTROLLED_FIXTURE，不是新AI玩家、自然擊殺或勝敗證據。

## 逐項程式判斷

### 合法性與傷害語義

APPROVED_SCOPE_WAVE_OBSERVED_MAX_SINGLE_CORE_HP_LOSS維持成立。新增的是peak這一筆UI暫態記錄，和last共最多兩筆；沒有按source累計、DPS、威脅評分、排行榜、自動選敵、選兵、鏡頭或額外命令。

原生applyDamage仍以相同this／參數只呼叫一次，原生運算完整完成才觀察clamp HP差。loss必須為有限正值；max比較的是未格式化raw HP實損，沒有把原amount或同tick合計改稱最大一擊。護盾、護甲、反射、原生return／exception、致命傷與敗北順序維持。觀察自己的錯誤仍隔離，沒有吞掉原生異常。沒有新增戰鬥數值、門檻或固定時間窗。

最大值不以可見敵人作篩選：來源未見／已死／不屬本世界的大傷仍可成為peak，因為自己的HP下降是已發生資訊；來源維持未確認，不從稍後可見小傷補猜身分。這是必要的正確行為，否則「最大」會被錯誤限定成可辨認來源中的最大。

### 波次、讀檔與資料隔離

- 每筆記錄受傷時world與waveIndex；新傷若換wave／world就重建peak，同波僅loss嚴格較大時更換。
- raw相同時保留較早peak，last仍更新至最新事件。沒有按敵人類型或距離打破平手。
- view在換world／wave、目前城心死亡／替換或離開prep／wave時清除；newRun／restore也清空兩筆，不從讀檔前HP推算歷史。
- 四語明確寫「本波已記錄」，說明只含本次載入後觀察、並非整波歷史。中段Continue不冒稱完整本波最大。
- view回傳是資料副本，修改回傳peak.loss不會改內部最高值；新增測試直接覆蓋這個隔離。
- 沒有新增存檔欄位或把觀察事件寫回遊戲狀態；早先嚴格RNG Restore的歷史FAIL不因這些UI清除測試變PASS。

沒有發現正常流程會把上一波最高、別筆來源或讀檔前歷史混進目前顯示。

### 兩筆來源與Fog

expose分別處理last／peak；若兩者是同一事件可共用當次已淨化資料，否則各自驗證。來源須於受傷當下及顯示當下存活、enemy、在目前units／buildings並通過正式g.isVisible，才讀名稱。失視野、死亡或離開world永久去掉該筆source與direction；後來再可見也不重建。後來命中者不會替另一筆補身分。

latest與peak的sourceId都參與同次UI更新的invalidated判定；身份失效先於100ms文字節流處理。因此peak失視野而last仍可見時，也會立即去掉peak身份，不等下一個文字更新週期。direct-core-max的獨立來源案例符合此路徑，重見仍未知。

方向仍僅是受傷當時可見近戰攻擊者的畫面相對箭頭，投射／zone沒有來向。最大一筆保留歷史數字與時間，不表示來源目前位置、現在仍攻城或目前最值得集火。沒有保存／更新霧中座標追蹤。

### 數字與省略第二行

實作先以raw loss選peak，再以兩位小數（微量顯示小於0.01）格式化。只有peak的raw值大於last，且格式後不同，才顯示第二行。這不改變內部max、來源或時間；last行仍明標「上次實損」，沒有把較早peak的來源套到last。

**可接受的取捨：** 顯示值相同時省略第二行，避免同一數字重複造成閱讀負擔。這不等於raw完全相等、兩筆同源或歷史時間相同。例如20.004與20.003都顯示20，raw peak仍保留20.004；它不是DPS、總和或來源排名。

**非阻擋的精度說明補強：** tooltip的「相同數值保留較早紀錄」可以更精確寫成「實際HP差相同時保留較早紀錄；顯示值相同時省略重複最大行」。目前文字沒有把省略定義成兩筆同源，故不列錯誤數字或情報洩漏Bug。可在例行修改時補一個raw不同但顯示相同的案例（含小於0.01），核對peak仍正確、只顯示last且不混來源；現有新增測試已覆蓋raw完全同值，這個更細的精度分支目前主要由程式直接支持。

這項補強不須阻塞B或另問核心規則許可；若改四語文案／格式，仍以新來源保存並跑受影響驗證。

## 真實驗證能證明的事

direct-core-max先從原封A存檔看到自然投射命中，之後為檢查UI，直接以原生applyDamage的500／20輸入與新增小來源構成受控大→小。after實際HP差為495.2與15.2：

- last：15.2HP、長槍兵、受傷時↘；
- peak：495.2HP、步弓兵、無投射方向；
- 兩筆在同一原生runTime被呼叫，因此時間都可能顯示8:07；這是兩次獨立函式事件，不是同tick總和。

正式兩行分別顯示上述數字；before只有小傷，after保留大傷。這足以證明資料與UI對受控序列的行為改變，**不能**說步弓兵在自然戰役打出495.2、攻擊距離／冷卻合法、玩家成功攔截、最大傷害來源就是最佳敵人，或原生敵軍平衡改變。

另有凍結HUD回讀前後snapshot／兩種RNG不變、last／peak獨立失視野且重見不回補、Save／Continue清記錄、四語與視口、零page error。direct-flag-max又先做真實旗手原生命令，再強制雙行驗小視口共存，29項全部通過；其CONTROLLED_FIXTURE強制資料不是C或B玩家成績。

新增Node五項分別驗證大後小／各自時間、未知大傷、獨立去身分、wave／restore界，以及raw同值非累加。既有致命overkill／護盾／投射／zone／原生例外與RNG案例保留。這是有意義的技術證據，但不把101項、28項、29項相加成全遊戲穩定性或玩家效果分數。

本次沒有最新145的FPS、長測或硬體資料。955的純API微成本也不是145兩筆回讀的新量測，更不是FPS；此前RALLY ABBA只保留其原來源與場景結論。新增處理是最多兩筆回讀，沒有新增layout輪詢／native pickAt；沒有已測回歸就不為此無限制加跑，但也不宣稱幀尾或記憶體全面PASS。

## B尚待驗證的主張

可讓B保持原PROFILE與自己的原封自然快照正常Continue，知情續玩另存新回合，不覆寫sealed，不給最大敵人位置／最佳打法，也不安排故意挨打或改兵力／時間。

應看B是否自然注意到第二行、能否說出「上次」與「本波本次載入後已記錄最大」的差別、是否知道最大是歷史單次且可能來源未確認，以及是否能自主決定下一個命令。記錄閱讀／操作負擔、錯誤歸因與未用原因；如果自然沒有大小變化或第二行未出現，保留NOT_EVALUATED，不以受控大傷補作玩家體驗。

勝敗、城心HP與擊殺照錄為次要結果；大傷被保留也不保證及時救城。A先前的需求只支持下一步假說，沒有新B回合前不能宣稱此行更好玩、提高勝率或減少操作。

## 裁決與持續工作

目前可繼續B自然續玩與其後實際體驗複評，無須另問許可。若新回饋指出精度／標示造成誤判，優先改顯示；不得藉最大一擊加入來源排行榜、最佳選敵／閃圈、改傷害／費用／RNG／時窗。免費控制、左三選一＋右32卡永久同屏、Fog／沙暴／人工優先、未核准九科技／中國副箭／探索180估值及不公開部署等限制維持。

STOP_REASON=ASSIGNED_READ_ONLY_MAX_CODE_REVIEW_COMPLETED_HANDOFF_TO_ROOT；EXECUTION_DURATION=UNKNOWN（未量完整時長）；NEXT_AUTHORIZED_TASK=根代理完成B原封自然聚焦續玩並依實際證據接續合法改善；CHECKPOINT_SHA=1456591db51ee4fb0cf6714ccb5dc6b645a33625（受評來源，非本角色提交）；AUTO_RESUME_AVAILABLE=false。


## 讀取證據雜湊

觀察時間：2026-11-05T19:12:20.877516+00:00。本角色沒有重跑下列驗證。

| 路徑 | SHA-256 |
| --- | --- |
| node-core-max-first.txt | 99e749bea4d07d5192a9ddfdccbeec1123fe2f4efba26e449ddfe29140902d0a |
| direct-core-max/result.json | 7a8c71cf24aead102109e02d3eccb4063c363a87096722187b4ac4cdfdac27e9 |
| direct-flag-max/result.json | bf955b0c926a8ef191e7c310b172ee8e0390b676d1e91835d51ddb8c4116b8c6 |
| /workspace/PlayGround/js/core-damage-readback.js | 67d7606a37c08a975488c32b2603e441a0625a83d0a6ee96a43663d226e19d6d |
| /workspace/PlayGround/js/locales.js | 94806aca6eef7d7140093a27d56625834411a29c279616b3197a59576dc09d99 |
| /workspace/PlayGround/styles.css | 4074e3c47d619851eb2a63d9a0328c77f5e835585b6f9b6dd02f3e7f77b9257d |
| /workspace/PlayGround/tests/core-damage-readback.test.mjs | ae281b769ce2c54d2739bd0662e2265059624a9baf478ddd5325674a6bfe57e0 |
