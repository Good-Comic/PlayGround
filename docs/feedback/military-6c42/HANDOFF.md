# 軍務生產輪替 / Military production rotation

繁體中文：從遠端0f58687476028e1db487e3191d57d01fe8935dfb接續，沒有重做上輪三項施工／生產說明。ACTIVE STRATEGY沿用docs/STRATEGY-V2.4-GAME-FIRST.md及內容優先覆寫，玩家軍務設定授權仍有效。核查Ownership244後，獨立任務MILITARY-ROTATION-6C42、Execution codex-military-6c42-20261104、分支codex/riftwatch-military-6c42，乾跑後正常CAS認領245，收據bdf23e794f796ae6a5a3b88d58c11af5b4dc0745。沒有沿用舊Owner；既有PRODUCTION-VIS任務的指示器／阻塞出生視覺範圍未改，只處理新總管邏輯。進行中又收到重複喚醒，記RESUME_SKIPPED_ACTIVE_TASK，不建立第二任務；原工作持續。

English: Continues remote0f58687476028e1db487e3191d57d01fe8935dfb without recreating the prior three construction/production-explanation slices. ACTIVE STRATEGY remains docs/STRATEGY-V2.4-GAME-FIRST.md with its content-first override and the player's military-planning authorization. After checking ownership244,independent taskMILITARY-ROTATION-6C42,execution codex-military-6c42-20261104,branch codex/riftwatch-military-6c42 was dry-run and normallyCAS-claimed at245,receiptbdf23e794f796ae6a5a3b88d58c11af5b4dc0745. No prior-owner identity was used. ExistingPRODUCTION-VIS indicators/blocked-spawn presentation were untouched;only new steward logic changed. A duplicate wake during execution is recordedRESUME_SKIPPED_ACTIVE_TASK without another task;original work continued.

## 實際修復 / Actual fix

繁體中文：真實13秒自動生產週期下，8秒刀盾兵在下一輪前已完工，固定從第一座軍營掃描會讓可負擔、已啟用的射箭場一直輪不到。Node先重現3FAIL／1PASS；Chromium舊版四輪全是軍營。js/stewards.js現在於成功加入一筆自動訂單後保存lastMilitaryProducerId，下輪從其後接續；不可用、停用、手動優先、佇列滿、目標已達成、預算或人口不足者沿用原規則跳過。保留每輪最多一筆訂單與原13秒週期，未改建築內兵種評分、費用、訓練時間、傷害或RNG。不是提高總產量上限；讓多座有條件生產的建築能輪到。

English: With native13-second automatic cycles,8-second militia finish before the next check. Always scanning the first barracks starves an enabled,affordable range. Node first reproduces3FAIL/1PASS;oldChromium issues all four orders at the barracks. js/stewards.js now saves lastMilitaryProducerId after successfully queueing one automatic order and resumes after it next cycle. Existing unavailable,disabled,manual-priority,full-queue,met-target,budget and population gates still skip producers. One order per cycle and the original13seconds remain;within-building unit scoring,costs,training times,damage andRNG are unchanged. This does not raise the total order cap;it lets multiple eligible producers receive turns.

繁體中文：游標是既有stewards存檔內的可空建築ID，舊存檔預設null；ID不存在時回到既有建築順序。未成功生產不移動游標，不新增抽亂數。一般單一軍營的流程不變。資源競爭並未被全面解決：不夠錢或被玩家保留預算擋住的高價兵種仍需等候，不承諾每個生產方案都能無條件執行。

English: The cursor is a nullable buildingID inside existing steward saves;legacy saves default tonull and missingIDs fall back to existing building order. Failed production does not advance it or add RNG calls. The usual single-producer flow is unchanged. This is not a complete resource-competition solution:unaffordable units or player-reserved budgets still wait;not every plan is guaranteed unconditional execution.

## 驗證 / Verification

正式構建來源 / Official build source: `20c751d9019ec8a99fecba4ae1f1d1e72bc7394b`.

| 項目 / Item | 結果與範圍 / Result and scope |
|---|---|
| Node | 46/46相關回歸PASS，含4項新輪替測試；原3FAIL保留於before.tap。/46/46related regressionsPASS including4rotation tests;original3FAIL retained in before.tap. |
| Chromium對照 / Chromium comparison | 同種子、同兵種／建築／資源夾具：舊版2→2→2→2，新版2→20→2→20；兩版均54模擬秒內4筆自動訂單、每筆間隔至少12.99秒，沒有加速／加訂單。/Matched seed,units,buildings and resource fixture:old2→2→2→2,new2→20→2→20;both4automatic orders by54simulation seconds and≥12.99seconds apart,no acceleration or extra orders. |
| 實際兵種 / Actual units | 新版已完成2刀盾兵＋1弓兵，第4筆弓兵仍在佇列；不把訂單數冒稱全部已訓練完成。/Fixed build has completed2militia+1archer;fourth archer remains queued,not falsely counted complete. |
| 原生SaveLoad / Native SaveLoad | 游標與RNG位元恢復正確；不解除歷史嚴格完整SaveLoad FAIL。/Cursor andRNG bits restore;historical strict full SaveLoadFAIL remains. |
| 手動優先 / Manual priority | 實際滑鼠下達刀盾兵後軍營手動保護仍有效，射箭場可在下一自動週期生產；未搶玩家佇列。/Actual mouse militia order retains barracks manual protection while range trains next automatic cycle;manual queue is not taken over. |
| 正式資源 / Official resources | build_playtest.py完成，150/150 SHA-256一致。/build_playtest.py completes,150/150SHA-256matches. |
| 環境／夾具 / Environment/fixture | 首次Playwright timeout誤放第二參數，54秒測試被預設30秒截斷；修正為第三參數後以原條件重測，保留原日誌，不算遊戲FAIL。/InitialPlaywright timeout was passed as argument2 instead of options3,so a54-second test hit the30-second default;corrected and rerun unchanged,retaining original log,not a gameplayFAIL. |

繁體中文：Chromium為Linux headless；受控對照明確使用5000資源、瞬間建立第二射箭場及延長準備期以隔離生產問題，不能稱自然戰役。截圖的visible版本從相同原生受控存檔按Continue拍攝，沒有圖像合成或修改精靈。影片為實錄連續片段縮放／重編碼，沒有音軌；完整影片LOCAL_ONLY及SHA記於video-provenance.json，不把/workspace路徑當使用者下載連結。

English: Linux headlessChromium. Controlled comparison explicitly uses5000resources,an instant second range and extended preparation to isolate production;it is not a natural campaign. The visible screenshots are nativeContinue replays of the matching controlled saves,without compositing or sprite edits. Videos are scaled/reencoded continuous real footage without audio;full recordings areLOCAL_ONLY withSHA in video-provenance.json,/workspace paths are not user-download links.

## 第五波接續 / Wave5 continuation

繁體中文：載入上輪真實、未改寫的第五波存檔571.96秒。使用實際滑鼠框選混合部隊及G護衛城鎮核心，兩次護衛均被正式規則接受，選中的村民未取得護衛任務或被加上手動鎖；透過原生Q／E使用Mark／Aegis。沒有加兵、資源、補血、跳波或改速度。實戰記錄生產游標2→146→2→146，顯示軍營與射箭場都得到週期。619.14模擬秒第五波戰敗，Warlord仍2124HP，無pageerror。這是保存鏈的程式化滑鼠／鍵盤自然續行，非真人、非全新開局，未宣稱五波、十波或自然NG+通過；亦不由一場敗局推論整體平衡不可能通關。

English: Loaded the prior real,unmodified wave5save at571.96seconds. Actual mouse mixed selection andGGuard on the town core are accepted twice;selected villagers acquire neither Guard orders nor new manual locks. NativeQ/EMark/Aegis are used. No added units,resources,healing,wave skips or speed changes. Combat records producer cursor2→146→2→146,both barracks/range receiving cycles. Wave5defeat at619.14simulation seconds,Warlord2124HP,no pageerror. This is automated mouse/keyboard native-save continuation,not human play or a fresh campaign;not a five/ten-wave or naturalNG+PASS,and one defeat does not prove overall balance unwinnable.

## 成本與限制 / Cost and limits

繁體中文：AMD EPYC9V74、4CPU配額、Node原生選擇微樣本各100次（另10次暖機），100／200實際單位P50/P95約0.176/0.450ms、0.318/0.512ms；max約0.780/1.141ms。計時外清空夾具佇列、恢復充足資源以保持有生產資格，非真實戰役／瀏覽器幀時間。Node heap約31.8→37.4MB、31.6→28.7MB，GC相關，不是無洩漏證明。未改Renderer／Canvas／素材；不重跑無關歷史繪製測試。長期性能仍INCONCLUSIVE，實體GPU與WindowsChrome／Edge未測。

English: AMD EPYC9V74,four-CPUquota,100Node selection samples each after10warmups. At100/200actual units,P50/P95~0.176/0.450ms and0.318/0.512ms,max~0.780/1.141ms. Fixture queues are cleared and ample resources restored outside timing to retain eligibility;not natural combat or browser frame time. Node heap~31.8→37.4MB/~31.6→28.7MB isGC-dependent,not leak proof. Renderer/Canvas/assets are unchanged;unrelated historical drawing tests were not rerun. Long-term performance remainsINCONCLUSIVE;physicalGPU andWindowsChrome/Edge remain untested.

繁體中文：沒有改main、Pages、既有RC、公開版本、Issues、不可變構建、其他Owner Feed或排程，沒有ForcePush或公開Release。245是認領歷史值，交付後正常釋放，下輪重新核查。仍有授權的更長戰鬥／資源競爭驗證；本輪主動在已驗證修復及有界實戰後交接，STOP_REASON記AGENT_EARLY_STOP，不虛構額度或平台迫停。下輪從保留的第五波護衛原生存檔開始，不必從第一波重跑，也不為PASS擅改數值。

English: No main,Pages,existingRC,public version,Issues,immutable build,another-ownerFeed or scheduler changes,ForcePush or publicRelease.245 is the historical claim;release normally after delivery and revalidate next round. Longer authorized combat/resource-competition work remains;this voluntary handoff after the verified fix/bounded combat recordsAGENT_EARLY_STOP without invented quota/platform limits. Next use the retained native wave5Guard save instead of repeating wave1 or changing balance to getPASS.
