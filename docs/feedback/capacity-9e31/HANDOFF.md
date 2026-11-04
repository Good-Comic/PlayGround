# 人口條件建設計畫 / Population-conditioned construction plans

繁體中文：最新正式構建來源6e9c5ffcd35c2af7f2d5e85a49d44470b43fd440。本輪新增玩家可選的人口觸發條件，已接上真實總管／建築流程；不是獨立HTML或示意科技。未公開部署或替換既有RC。

English: Latest official-build source6e9c5ffcd35c2af7f2d5e85a49d44470b43fd440. Adds an optional player-controlled population trigger connected to native stewards/construction,not standaloneHTML or prototype research. No deployment or existingRC replacement.

## 來源與範圍 / Lineage and scope

繁體中文：核對遠端bab8b017fa71508a1dc45293e36f06d7affe78ed、Ownership246、現行docs/STRATEGY-V2.4-GAME-FIRST.md及內容優先覆寫、最近Recovery/Handoff。舊RTS／戰術任務仍OWNED，本輪保留其範圍，接續使用者真人回饋中已批准的村務建築條件。任務ECONOMY-CAPACITY-9E31、Execution codex-capacity-9e31-20261104、分支codex/riftwatch-capacity-9e31，乾跑後正常CAS認領247，收據50e14415d7f35394a5158ce676c2ca456248bfe5。247為歷史認領值，接續須重新查遠端，不沿用舊Owner或prior-stopped。

English: Verified remotebab8b017fa71508a1dc45293e36f06d7affe78ed,ownership246,current docs/STRATEGY-V2.4-GAME-FIRST.md/content-first override and recentRecovery/Handoff. ExistingRTS/tactical tasks remainOWNED;their scope is preserved while extending the user's approved village-construction requirements. TaskECONOMY-CAPACITY-9E31,execution codex-capacity-9e31-20261104,branch codex/riftwatch-capacity-9e31 was dry-run and normallyCAS-claimed at247,receipt50e14415d7f35394a5158ce676c2ca456248bfe5.247is historical;re-read remote ownership next time without adopting an old owner or prior-stopped assertion.

## 實際行為 / Actual behavior

繁體中文：村務建築計畫新增「軍事餘額≤」欄位。空白表示不限制，零是有效條件，支援正式半格人口精度；各建築均可選，原啟停／詢問／自動、最大數量、優先級、村民數、時代與資源預留仍生效。不是新的研究或收費門檻，沒有改建造費、速度、實際人口上限、傷害、兵種、卡池或抽卡權重。

English: Construction plans gain a “Military room ≤” field. Blank means unrestricted;zero is valid and native half-slot precision is supported. Every building may opt in while retaining existing off/ask/auto,max-count,priority,worker-count,age and resource-reserve rules. This is not research or a new paid gate;construction costs/speed,actual caps,damage,units,boon pools and draw weights are unchanged.

繁體中文：planningMilitaryRoom以實際軍事人口、正式佇列人口、友軍施工中建築的人口供給預估餘額，依既有文明上限封頂；不把經濟人口混入。施工供給已能解除觸發條件時，下一輪等候，避免同一需求重複開工。詢問模式在確認前重驗，人工建屋使條件不再成立時不誤建。文明硬上限仍然存在；若房屋不能提高該文明上限，預估也不假增人口，玩家指定的建築用途與最大數量仍由玩家控制。

English: planningMilitaryRoom forecasts room from native military population,queued unit population and pending friendly capacity,clamped by existing civilization caps;economy population is separate. When pending capacity already relieves the condition,the next check waits instead of starting duplicate capacity for the same need. Ask mode revalidates at confirmation,so manual housing can remove demand. Civilization hard caps remain;housing that cannot raise them does not falsely increase forecast room,and the player still controls building purpose/max-count.

繁體中文：新設定存於既有建築計畫militaryRoom，null／缺欄位沿用舊行為，不新增存檔版本。預覽只有讀取，沒有額外模擬RNG或每幀DOM更新。新增／更新js/stewards.js、js/steward-ui.js、js/locales.js及tests/capacity-plans.test.mjs。四語各900鍵；Game、Renderer、戰術AI、PixelFX與正式數值資料未改。

English: The setting is militaryRoom inside existing building plans;null/missing fields retain legacy behavior without a new save version. Preview is read-only with no extra simulationRNG or per-frameDOM updates. Changes are js/stewards.js,js/steward-ui.js,js/locales.js and tests/capacity-plans.test.mjs. All four locales have900keys;Game,Renderer,tacticalAI,PixelFX and formal numeric data are unchanged.

## 真實操作 / Actual operation

繁體中文：CHN正常新開局、CAPACITY-NATIVE，滑鼠開始，透過原生選單關閉自動軍事以隔離手動排隊。軍事餘額35，玩家設門檻33、房屋目標4。四模擬秒後仍兩屋；實際選軍營、滑鼠排兩名刀盾兵，占用兩人口後約6.42模擬秒原生第三屋開工。第三屋仍在施工時，供給預估使第四屋等候。房屋費用由原生流程正常支付。沒有加資源、加兵、跳波、改速度或直接修改人口。

English: A normalCHN opening,CAPACITY-NATIVE,starts by mouse and disables automatic military through the native menu to isolate manual queues. Room35,the player sets threshold33 and house target4. Two houses remain after4simulation seconds;actual barracks selection and two mouse-queued militia reserve two slots,triggering the native third house around6.42simulation seconds. While it is under construction,forecast capacity keeps the fourth waiting. Native construction charges the normal cost. No resources/units,wave skips,speed or population injections.

繁體中文：另以正常GOT開局CAPACITY-HALF，半人口刀盾兵使餘額36降至35.5，玩家設定35.5後先等待、原生單筆排隊後建屋；35.5經原生Save／Reload／Continue保留。兩場都是正常開局經濟操作驗證，未跑完整戰役。CHN畫面最後另有明確標示的受控NG+檢查，只驗證規劃偏好仍保留，不代表自然勝利或結算PASS。

English: A separate normalGOT opening,CAPACITY-HALF,uses a half-population militia:room36→35.5. A35.5threshold waits initially and starts housing after one native order;nativeSave/Reload/Continue preserves35.5. Both are ordinary opening-economy checks,not full campaigns. TheCHNrecording ends with an explicitly controlledNG+test of planning-preference retention,not natural victory or settlementPASS.

## 測試矩陣 / Test matrix

| 項目 / Item | 結果與限制 / Result and limits |
|---|---|
| Node | 最終48/48相關回歸PASS，含7項新條件測試：佇列觸發、施工供給、確認重驗、舊資料、CHN／FRK實際上限、零值／暫停／SaveLoad、GOT半人口。/Final48/48related regressionsPASS including7new tests:queues,pending capacity,confirmation,legacy data,CHN/FRKcaps,zero/pause/SaveLoad,GOTfractions. |
| 舊版缺口 / Baseline feature gap | 以新增條件驗收舊程式，3項尚未實作FAIL、舊行為對照1PASS；不是把新功能要求誤報成舊程式崩潰。/Prospective feature acceptance on old code yields3unimplementedFAIL/1legacy controlPASS,not a claim of an old crash. |
| 夾具錯誤 / Fixture mistakes | 曾把militaryPopCap=0誤認成零上限、又誤用FRA代替實際FRK導致文明回退；原FAIL各保留。按正式資料修正並加文明ID斷言後通過，未改遊戲數值。/Mistook cap0for a zero limit,then usedFRAinstead ofFRKcausing fallback;both original failures retained. Fixed fixtures against native data and added anIDassertion,without numeric gameplay changes. |
| Chromium | 最終36/36PASS：正常佇列觸發／防重複，四語×1366×900／900×600／390×844，零／空白保留、按鈕可滾動至可見、預覽不變資源／時間／RNG、原生SaveLoad、受控NG+偏好、GOT半格操作。無pageerror。/Final36/36PASS across native triggers/no duplicates,4languages×3sizes,zero/blank values,scroll-reachable Apply,preview resource/time/RNG invariance,nativeSaveLoad,controlledNG+preferences andGOThalf-slots;no pageerror. |
| 正式構建 / Official build | 來源6e9c5ffcd35c2af7f2d5e85a49d44470b43fd440，build_playtest.py，150/150 SHA-256一致；環境重啟後再核對仍一致。/Source6e9c5ffcd35c2af7f2d5e85a49d44470b43fd440,build_playtest.py,150/150SHA-256matches,reverified after environment restart. |

## 性能與環境 / Performance and environment

繁體中文：測試結束後串行量測100／200靜止混合陣營單位、6個生產建築，1366×900，Linux Chromium154.0.8037.57、CDP確認SwiftShader軟體繪製。每組10次實際面板開啟，90個RAF間隔另10個暖機。這是有界的面板／背景繪製短測，不是大軍實戰FPS、長期穩定性或實體GPU驗收。共享EPYC9V74／4CPU配額；雲端波動與GC限制保留。

English: After functional tests,serial measurements use100/200static mixed-team units,six producers,1366×900,LinuxChromium154.0.8037.57 withCDP-confirmedSwiftShader software rendering. Each case has10actual panel opens and90RAFintervals after10warmups. This bounded panel/background-drawing test is not large-army combatFPS,long-term stability or physicalGPUacceptance. SharedEPYC9V74/four-CPUquota;cloud variability andGClimits remain.

| 單位 / Units | 開啟P50/P95舊→新 ms / Open old→new | 開啟時RAF P50/P95舊→新 ms / Open-panel RAF old→new |
|---|---|---|
|100|38.4/64.1→41.6/61.9|33.4/50.1→33.4/50.1|
|200|62.1/80.3→60.7/82.0|66.6/66.7→66.7/66.8|

繁體中文：四組皆維持資源／時間／RNG不變，新版各有15個新條件輸入。100單位heap舊10.15→8.75MB／新10.54→8.11MB，200單位舊8.95→8.24MB／新10.60→9.45MB；不能當無記憶體洩漏證明。短測未見一致的大幅退步，不能據此宣稱長期PASS。長期性能INCONCLUSIVE、WindowsChrome／Edge與實體GPU仍NOT_TESTED。

English: All four cases preserve resources/time/RNG;new panels contain15condition inputs.100-unitheap old10.15→8.75MB/new10.54→8.11MB;200old8.95→8.24MB/new10.60→9.45MB,not leak proof. Short samples show no consistent large regression,but cannot certify sustained performance. Long-term performance remainsINCONCLUSIVE;WindowsChrome/Edge and physicalGPUremainNOT_TESTED.

繁體中文：全部測試完成後收到執行環境starting通知；wait_for_environment返回ready，既有loopback伺服器已不在，程式、已封裝影片與結果均保留。核對本輪原認領收據與遠端247仍一致後，恢復進行證據整理及推送，沒有重啟第二個相同任務或宣稱測試在背景持續。此輪沒有因重啟而遺失尚未完成測試。

English: After all tests finished,the executor announcedstarting.wait_for_environment returnedready;prior loopback servers were absent while code,finalized videos and results survived. This execution's original claim receipt and unchanged remote247were checked before packaging/push. No duplicate task or claim of background execution. No in-flight test was lost in this restart.

## 交接與限制 / Handoff and limits

繁體中文：evidence內有正常CHN／GOT操作影片、三張全尺寸UI截圖、兩份原生開局存檔、TAP與性能原始資料。影片由真正連續錄影完整縮放／重編碼，沒有畫面合成或音軌；原影片LOCAL_ONLY與SHA記於video-provenance.json，不把/workspace當使用者下載入口。既有第五波敗局、自然十波／NG+未通過、低FPS時鐘及嚴格完整SaveLoad歷史FAIL保持，不因新偏好保存成功而解除。

English: evidence contains normalCHN/GOTvideos,three full-sizeUIscreenshots,two native opening saves,TAP and raw performance data. Videos are full continuous recordings scaled/reencoded without compositing/audio;originals areLOCAL_ONLY withSHA in video-provenance.json,/workspace is not a user-download endpoint. Existing wave5defeats,unpassed natural ten waves/NG+,low-FPS timing and strict full SaveLoadFAIL remain;new-preference persistence does not clear them.

繁體中文：未改main、Pages、既有RC、公開部署、舊Issues、其他Owner Feed、不可變構建或排程。沒有ForcePush、公開Release、卡牌／研究／平衡數值修改。完成交付後正常釋放本任務。仍有授權的較長自然經濟／軍務預算與穩定性樣本可做；主動在本輪完整切片後交接，STOP_REASON誠實記AGENT_EARLY_STOP，環境已恢復及未知額度都不被當成迫停。下一輪重新確認Ownership，從保存的正常開局條件或既有第五波存檔選不衝突的工作，避免重做已完成切片。

English: No main,Pages,existingRC,publicdeployment,oldIssues,another-ownerFeed,immutable-build or scheduler changes. NoForcePush,publicRelease,boon/research/balance-number changes. Release this task normally after delivery. Longer authorized natural economy/military-budget/stability samples remain;this voluntary handoff after the complete slice honestly recordsAGENT_EARLY_STOP,without presenting recovered environment or unknown quota as forced limits. Next revalidate ownership and choose non-conflicting work from retained opening plans or existing wave5saves,without recreating finished slices.
