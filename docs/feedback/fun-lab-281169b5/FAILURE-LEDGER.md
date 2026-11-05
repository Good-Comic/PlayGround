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

---

# Preserved failures and limits

First-loop evidence is complete with limited command-feedback acceptance. The FAIL, INCONCLUSIVE, not-evaluated and historical records below were not promoted to PASS. The next carrier entry is being implemented without a new source or acceptance here.

## Interruptions, tools and environment

- Initial B-before: the player agent explicitly reported a usage limit; the process no longer existed at recovery and its exit cause was unavailable. Original before-interrupted-quota data and an unfinalized recording fragment remain local, outside completed results. Unattended/boon dwell time is not player activity. B later completed a fresh session from the same initial conditions; completed A data was reused. See [INTERRUPTION.json](INTERRUPTION.json).
- Initial A-after: an explicit usage-limit message preceded controller-lease expiry. Three native inputs were recorded and simulation reached defeat without an independent completed report. It is INCONCLUSIVE and excluded. A new instance completed a separate After from the same unchanged save without overwriting it. The message omitted a timezone, so recovery time is not inferred. See [AFTER-A-INTERRUPTION.json](AFTER-A-INTERRUPTION.json).
- B-after startup expiry: controller waiting expired before the first request and before Continue, with no game-progress loss. This is neither a quota incident nor a game defect. The expired session remains and the isolated session was restarted. See [B-AFTER-CONTROLLER-STARTUP.json](B-AFTER-CONTROLLER-STARTUP.json).
- Stale @ locators, invisible controls and Playwright timeouts are tool/screen-timing limits, not automatically game bugs. Input ok is not semantic acceptance. A/B-after's final right-click before-state was already defeat, so these were not effective focus orders. Post-terminal B-before/C-before inputs are separately recorded.
- Original local-socket/Chromium sandbox EPERM evidence remains. Approved execution outside that environment successfully reproduced the gap with unmodified formal payloads served offline. The environment failure is not a game bug. See [sandbox evidence](evidence/director/DIRECT-CHROMIUM-SANDBOX-ERROR.json).
- Quota percentage remains UNKNOWN, without invented account status. The [lease/recording recovery check](CONTROLLER-RECOVERY-TEST.json) proves tool recovery only, not game fun or agent auto-resume.

## Node fixtures and historical Save/Load failure

The first new Node run returned12 PASS/2 FAIL because of fixture expectations: guard retains the same hero element but creates a new selection array, so reference equality is invalid; native restore returns to the menu and requires Continue/start before battlefield readback. Game implementation was not changed for either. Correcting fixtures and adding density/Canvas-exception/formal-sandstorm cases yielded17 new plus55 related tests,72 PASS. Default isolation reported file-level results; explicit no-isolation produced item-level logs. Initial failures remain historical, rather than unresolved failures of the same implementation.

**Strict RNG Restore of the authentic pending-boon save remains FAIL: -1129663591→3165303705, strictStateEqual=false.** RNG and whole-save strict determinism were not repaired. Readback consuming no extra RNG is a separate passing check and cannot hide this failure. Interrupted B's save only supports the32-card dual-pane regression, outside completed player samples. See [extra result](evidence/direct-after-extra/result.json).

## Natural-player and measurement limits

- Three Before sessions naturally lost after isolated cold starts: A/B wave4, C wave5. Three After sessions used normal Continue from unchanged own snapshots and again lost wave4/4/5, not fresh campaigns. Ten natural waves were not reached; NG+ is untested. Three defeats do not prove Normal imbalance.
- N=1 per role. After players knew the readback/marker purpose, so testing was not blind. A-after is a new instance; B/C read their own Before. Learning, actions, paths, RNG and restore timing differ, preventing strict causal A/B or capability ranking.
- A/C naturally detected mismatches and changed to guard, but original archer/carrier goals remained unfinished. B's natural mismatch recovery is not evaluated; A/B marker use lacks evidence. Other roles cannot fill PASS. An existing order does not establish arrival, hits, damage, kills or interception.
- Images, UI text and action states are adjacent discrete samples, not one frame. Five-second positive inventory deltas are income lower bounds; native gathered is total deliveries. Alive transitions include expiry and may miss units born/lost between samples, not complete casualties. Target/attack references do not attribute damage; congested may be historical.
- After cumulative kills/gathered/time include pre-save history. Restore carries existing cards/cooldowns, so observer changes are not all new claims/casts. Full Before versus short After input totals do not measure efficiency; total cognitive burden was not measured.
- A-after has only one supported boring item; B has2 fun,1 boring and2 frustrating items; C has2 boring items. Missing thirds remain without borrowed Before events. All fun/replay judgments are AI simulation preferences, not human satisfaction or retention.

## Performance, memory and hardware

Four initial100/200 same-machine samples use matching initial scene SHA/RNG,5 simulation seconds of warmup and30 wall seconds each, without measurement errors. Native AI/collision/damage/deaths remain and production is disabled. After warmup the100 setup starts with73 alive and ends34/32; the200 starts140 and ends58/56. This is not sustained fixed100/200 survivor load. Manual-target drawing occupies only about6–7% of frames; unchanged short-sample p95 does not prove long-run or causal performance improvement.

The200-unit After heap starts17682038 and ends17617357 bytes, higher than Before11533917→14538587. Endpoints establish neither a leak nor absence of one; long-run memory remains unproven. Whole-session FPS includes menus/cards/native pauses, not continuous combat. SwiftShader is CPU software rendering, not physical GPU hardware. Status remains MEASURED_SHORT_RUN_LONG_RUN_AND_HARDWARE_INCONCLUSIVE, with HARDWARE_TEST_PENDING retained.

Human listening, overall fun, win-rate/balance causality, long-term retention, natural ten waves/NG+, sustained high-survivor200 and long runs lack required evidence. Full videos remain local, with hashes/sizes in the [manifest](LOCAL-VIDEO-MANIFEST.json), not download links. The next carrier entry's source/build/Node/Chromium/player results are all PENDING; first-loop utility and old tests cannot establish a new-slice PASS.

## 續作保留紀錄 / Follow-up retained failures

旗手初版英文390px按鈕被遮擋是實際UI FAIL，已修正並保留重測28/28；初版Node九失敗為共用立即鏡頭夾具，總管第一次FAIL為submit監聽器microtask取樣順序，均保留原日誌。旗手200初測P95 66.8→83.3是效能警訊，後續ABBA沒有一致額外退步但不抹除原值。第二C及整理角色actual quota中斷、一次遠端審核usage-limit未執行皆保存；C僅部分回合。詳見FOLLOWUP-CONTROLS-REPORT.md與followups/CONTINUATION-INTERRUPTIONS.json。

The initial English390px bearer overlay was a real UI failure, fixed with28/28 retests retained. Nine initial Node failures shared an immediate-camera fixture mistake; the first steward failure used a submit-observer microtask at the wrong listener boundary. Logs remain. The200-unit p95 change66.8→83.3ms remains a warning despite ABBA showing no consistent extra regression. Actual second-C/curator quota interruptions and an unexecuted approval-review quota failure remain recorded; C is partial evidence only. See the linked report and interruption JSON.

封存原始報告與失敗日誌保留原始空白，完整git diff --check因此仍列空白警告；未修改封存bytes或SHA來消除。另對新程式與整理文件排除這四份原始資料後檢查。
Sealed reports and raw failure logs retain original whitespace. Full git diff --check therefore reports whitespace warnings; bytes and seals were not changed to erase them. New code and curated prose are checked separately with those four raw files excluded.
