# 自然戰役、施工恢復與軍務回饋 / Natural campaign, construction recovery and production feedback

繁體中文：本輪三項遊戲切片已限定驗證並保存於獨立分支，未發布或替換既有RC。最新遊戲／正式構建來源為41c7d0a2aa0d2019426642e3ec08b93c55310464。此狀態不代表自然十波、正式發布或全面性能驗收完成。

English: Three gameplay slices have scoped verification on an independent branch without deployment or replacement of the existingRC. Latest gameplay/official-build source is41c7d0a2aa0d2019426642e3ec08b93c55310464. This does not certify natural ten waves, formal release or comprehensive performance acceptance.

## 來源與所有權 / Lineage and ownership

繁體中文：沿用ACTIVE STRATEGY docs/STRATEGY-V2.4-GAME-FIRST.md及內容優先覆寫。基底596f3a84250d55e4b2550f635cc234f67b3086e0，繼承科技圖鑑、真人回饋、PixelFX、RC等成果，未重做沙暴／Wave10／NG+。本輪開始核對Ownership242，舊相關任務皆RELEASED；獨立任務NATURAL-CAMPAIGN-7E91，Execution codex-natural-7e91-20261104，分支codex/riftwatch-natural-7e91，乾跑後正常CAS認領243，提交373e3a93047a6846d72c31369c8cf65f0b3271e7。沒有冒用舊Owner或使用prior-stopped。其他仍OWNED任務及其Feed未碰觸。交付後正常釋放；243為認領歷史值，下次仍須查遠端最新值。

English: ACTIVE STRATEGY remains docs/STRATEGY-V2.4-GAME-FIRST.md and its content-first override. Base596f3a84250d55e4b2550f635cc234f67b3086e0 inherits codex,human feedback,PixelFX andRC work; sandstorm/Wave10/NG+were not recreated. Starting ownership242 showed prior related tasksRELEASED. Independent taskNATURAL-CAMPAIGN-7E91,execution codex-natural-7e91-20261104,branch codex/riftwatch-natural-7e91 was dry-run and normally CAS-claimed at243,commit373e3a93047a6846d72c31369c8cf65f0b3271e7. No prior-owner impersonation or prior-stopped assertion. Other OWNED tasks and their Feed were untouched. Normally release after delivery;243 is historical,so re-read current remote ownership next time.

| 遊戲來源 / Gameplay source | 內容 / Content |
|---|---|
| a96eadfca505b6824a7e937d5d8889c1389cf458 | 逐建築生產說明 / Per-producer explanations |
| bb5d7fe0b79adb8df0edeb5d537c608392d96b0e | 自動施工權限修復 / Automatic-builder authority fix |
| 41c7d0a2aa0d2019426642e3ec08b93c55310464 | 有界施工格補搜；包含前述全部成果 / Bounded grid recovery,including all above |

## 實際遊戲變更 / Gameplay changes

繁體中文：軍務面板新增逐建築等待原因：停用、手動生產優先、佇列上限、含佇列的兵種目標／人口、資源或預留預算、下一次自動檢查、建築／兵種不可用。js/stewards.js的productionStatus只讀現有規則，js/steward-ui.js只在面板建立時顯示，沒有每幀建立DOM。四語各895鍵。沒有改原trainArmy的優先、費用或冷卻。

English: Military planning now explains each producer's disabled state,manual priority,queue cap,unit/population targets including queues,resources/reserves,next automatic check or unavailable building/units. productionStatus in js/stewards.js reads existing gates; js/steward-ui.js displays it when creating the panel without per-frameDOM creation. All four locales have895keys. Existing trainArmy priority,costs and cooldowns are unchanged.

繁體中文：自然存檔證實，自動施工村民會變成idle/manual=true。根因是js/game.js的updateBuild每次近身施工都重新設manualEconomy=true，覆蓋planBuilding派工時的false。移除這次覆寫；手動放置／命令入口仍設定true。相同AUTO-BUILDER種子743745780、正常資源與速度、原生自動第三屋：兩版同由村民10施工，完工後約22模擬秒觀察時舊版idle/manual=true，新版gather/manual=false且已有採集資源。玩家手動施工及Stop仍保留優先。舊存檔的manual=true無法安全區分來源，沒有自動批次解除；可由玩家明確按既有「交還閒置村民」。

English: Native saves exposed automatic builders becoming idle/manual=true. updateBuild in js/game.js reset manualEconomy=true every nearby construction tick,overriding planBuilding's false authority. Removed that overwrite; manual placement/order entry points still set true. With identical AUTO-BUILDER seed743745780,ordinary resources/speed and native third-house planning,both builds use villager10. Around22simulation seconds after completion,old is idle/manual=true;fixed is gather/manual=false with gathered cargo. Manual construction andStop retain priority. Existing manual=true saves cannot safely distinguish origin,so no bulk automatic unlock was added;players can explicitly use the existing idle-worker release control.

繁體中文：第四波原生存檔有可負擔、安全且可達的射箭場整數格，但規劃器只查64個稀疏環狀點而永久漏搜。診斷套用原本地形、營地、道路、敵軍與可達性條件；不是只看空地。保留原環狀點優先，再補同一當地半徑內的整數格；每次至多64個規劃位置檢查及原本12次尋路，以既有placementCursor續查並可存讀檔。原生placeCurrent仍做最後檢查、付費與施工。相同第四波存檔、同一張卡、正常推進40模擬秒：舊版無射箭場，新版在(19,23)建成，施工村民回到採集，之後原生生產了投矛兵。

English: The native wave4save contains affordable,safe,reachable integer-grid sites for an archery range,but64sparse ring probes missed them indefinitely. Diagnosis applies existing terrain,camp,lane,enemy and reachability rules,not merely empty-ground checks. Existing ring sites retain priority,followed by integer-grid gaps within the same local radius. Each call caps planning-site checks at64 and preserves the existing12path-search cap,using persistent placementCursor for SaveLoad continuation. Native placeCurrent still performs final validation,payment and construction. From the same wave4save and reward choice,after40ordinary simulation seconds the old build has no range;fixed builds at(19,23),returns its builder to gathering,and later natively trains a skirmisher.

繁體中文：沒有更改傷害、命中、攻擊距離、移速、兵種克制、卡池、抽卡權重、卡牌效果、研究費用、文明規則或PixelFX。恢復自動採集與原本漏掉的建築會正常改變後續經濟／戰鬥結果，不宣稱修復前後整場RNG序列完全相同；不放置的搜尋與純顯示不消耗模擬RNG。

English: No damage,hit,attack range,movement speed,counters,boon pool/weights/effects,research costs,civilization rules orPixelFX changes. Restored gathering and previously missed buildings legitimately alter later economy/combat outcomes;the complete old/new campaign RNG streams are not claimed identical. Non-placing searches and pure display consume no simulation RNG.

## 測試矩陣 / Test matrix

| 測試 / Test | 結果及範圍 / Result and scope |
|---|---|
| Node相關回歸 / Related regressions | 56/56 PASS：總管、工人權限、人口、導航、原生暫停／存檔、圖鑑與本地化。/56/56PASS across stewards,worker authority,population,navigation,native pause/save,codex and locales. |
| 施工前FAIL / Builder failures before fix | 自動完工、讀檔後施工2FAIL，手動對照PASS；原TAP保留。初始讀檔夾具未離開主選單，補時間推進斷言後再重現真正FAIL，初始輸出亦保留。/Automatic completion and restored construction2FAIL,manual controlPASS;rawTAP retained. Initial restored fixture stayed in menu;corrected with an advancing-time assertion before reproducing genuineFAIL,with original output retained. |
| 補搜前FAIL / Grid failures before fix | 真實存檔2/2FAIL，修復後2/2PASS；無刪除測試或放寬安全檢查。/Native-save2/2FAIL before,2/2PASS after;no tests deleted or safety conditions relaxed. |
| 軍務Chromium / Production Chromium | 16/16受控PASS：四語、等待原因、手動支出優先、解除預留後原生自動續產、SaveLoad。此結果限定此介面流程。/16/16controlledPASS:four languages,reasons,manual spending priority,native auto-training after releasing reserves and SaveLoad;scoped to this interface flow. |
| 工人Chromium / Builder Chromium | 相同種子、正常資源，修復前閒置鎖定，修復後恢復採集，無pageerror；短完整錄影保留。/Same seed,ordinary resources:locked-idle before,gathering after,no pageerror;short full recordings retained. |
| 射箭場Chromium / Range Chromium | 同原生存檔前後40模擬秒，無→建成，無pageerror；有連續實錄片段。/Same native save over40simulation seconds,absent→complete,no pageerror;continuous footage retained. |
| 正式構建 / Official build | 最新來源41c7d0a2aa0d2019426642e3ec08b93c55310464；150/150資源SHA-256一致，未部署。/Latest source41c7d0a2aa0d2019426642e3ec08b93c55310464;150/150resource SHA-256matches,no deployment. |

## 自然戰役與真實中斷 / Natural campaign and actual interruption

繁體中文：所有自然樣本均為CHN、STEWARD-RECOVER、數字種子3052366094，正常資源、速度、波次，沒有補血、加兵、清敵、跳波或GM操作。直接從未改寫的原生存檔按Continue，不能等同全新開局的獨立完整戰役。時間／RNG位元／候選的限定恢復有證據，不解除歷史嚴格完整SaveLoad FAIL。

English: Natural samples use CHN,STEWARD-RECOVER,numeric seed3052366094,ordinary resources/speed/waves without healing,added units,enemy clearing,wave skipping orGM. Native saves are transferred unmodified and loaded throughContinue;continuations are not independent fresh full campaigns. Scoped time/RNG-bit/offer restoration is evidenced without clearing historical strict full SaveLoadFAIL.

| 樣本 / Sample | 實際結果 / Actual result |
|---|---|
| 原始開局 / Original fresh run,272d00d | 完成前三波，第四波502.48模擬秒戰敗；約518.88現實秒含UI與啟動時間。/Clears3waves,loses wave4at502.48simulation seconds;~518.88wall seconds includingUI/startup. |
| 調整計畫 / Planning continuation,a96eadf | 第三波原生存檔後改食物優先、解除食物預留、村民目標14、防禦方案、房屋4／農田2／射箭場1；第四波504.98秒戰敗。/Native wave3save,food priority,released food floor,14villager target,defense plan,house4/farm2/range1;wave4defeat at504.98seconds. |
| 工人修復 / Builder fix,bb5d7fe | 同原生第三波存檔與計畫，自然完成第四波531.66秒，進入第五波準備。環境重啟使瀏覽器中止，最後觀察557.21秒；此段第五波INCONCLUSIVE。/Same native wave3save/plans,clears wave4at531.66seconds,reaches wave5prep. Environment restart kills browser;last observation557.21seconds,this segment's wave5INCONCLUSIVE. |
| 環境恢復 / Environment recovery,bb5d7fe | 從第四波待領卡原生存檔恢復，實際第五波Boss生成；626.76秒戰敗，Warlord仍2034.6HP。/Native wave4pending-reward recovery;actual wave5Boss spawns;defeat626.76seconds,Warlord remains2034.6HP. |
| 最新施工修復 / Latest grid fix,41c7d0a | 先以同存檔完成射箭場，再從原生第五波進度續行；投矛兵150已訓練，615.53秒戰敗，Warlord仍2094HP。/Range built from the matched save,then native wave5continuation;skirmisher150trained;defeat615.53seconds,Warlord remains2094HP. |

繁體中文：自然四波完成是這條保存／恢復鏈的結果，不宣稱最新構建從零連續四波或五波通關，也不由單一配置的敗局推論Normal不可能通關。第五波未清除、自然十波與自然NG+未通過，Boss舊受控PASS沒有冒充本輪自然PASS。所有自然瀏覽器樣本無pageerror。

English: Four cleared waves belong to this save/recovery lineage,not a claim of a fresh uninterrupted four/five-wave latest-build win. A single configuration's defeats do not proveNormal impossible. Wave5is uncleared;natural ten waves/NG+remain unpassed;old controlledBossPASS is not substituted for naturalPASS. No pageerrors in these natural samples.

繁體中文：真實環境中斷曾回報No usable execution environment，wait_for_environment恢復ready後檔案保留、舊瀏覽器／伺服器不在。核對本輪原認領收據與遠端243未變後才恢復，沒有新增第二任務或假稱舊程序仍跑。初次錄影另有既有ffmpeg路徑漏設的環境／夾具錯誤，設定PLAYWRIGHT_BROWSERS_PATH後才開始有效樣本。中斷證據與失敗均保留。

English: Actual interruption returnedNo usable execution environment. After wait_for_environment became ready,files survived while old browser/server processes were absent. Resume followed verification of this execution's original claim receipt and unchanged remote243;no duplicate task or claim of surviving processes. A separate initial video launch omitted the existing ffmpeg runtime path;valid recording began after settingPLAYWRIGHT_BROWSERS_PATH. Interruption and fixture-failure evidence are retained.

## 性能限制 / Performance limits

繁體中文：Linux Headless Chromium154.0.8037.57、1366×900、AMD EPYC9V74、5可見CPU／4CPU配額，ANGLE Vulkan SwiftShader軟體繪製，非實體GPU。自然樣本已停後才串行量測。100／200靜止單位、6個生產建築，每組10次原生面板開啟，90個RAF區間（另10個暖機）；不是實戰FPS或長期樣本。測的是生產說明切片a96eadf，後續主動施工搜尋成本另列，不冒充最終大量單位經濟實戰性能。

English: Linux Headless Chromium154.0.8037.57,1366×900,AMD EPYC9V74,5visible/four-quotaCPUs,ANGLE Vulkan SwiftShader software rendering,no physicalGPU. Serial measurements start after the natural run stops. Each case uses100/200static units,six producers,10native panel opens and90RAF intervals after10warmup;not combatFPS or a long sample. It measures production explanations at a96eadf;later active construction-search costs are separate,not a final large-unit economy-combat certification.

| 單位 / Units | 開啟P50/P95舊→新 / Open latency ms old→new | 面板開啟RAF P50/P95舊→新 / Open-panel RAF ms old→new |
|---|---|---|
|100|46.9/59.7→43.8/60.8|33.4/50.0→33.4/50.1|
|200|68.6/77.2→72.7/79.6|66.6/66.8→66.7/66.7|

繁體中文：100單位舊／新heap起訖約8.02→8.93MB／10.44→9.25MB；200單位約9.38→9.49MB／8.89→8.22MB，受GC影響，不是無洩漏證明。四組面板操作皆不改時間、資源及RNG。施工補搜Node原生地圖微樣本30輪共90次規劃，排除restore時間，P50約0.47ms、P95約2.30ms、max約4.72ms，觀察最多64個位置檢查；不是瀏覽器幀時間。長期性能維持INCONCLUSIVE，WindowsChrome／Edge與實體GPU仍NOT_TESTED。

English:100-unit old/new heap samples are~8.02→8.93MB/~10.44→9.25MB;200-unit~9.38→9.49MB/~8.89→8.22MB,GC-dependent and not leak proof. All four panel cases preserve time,resources andRNG. A Node native-map search micro-sample spans30runs/90planning calls,excludingrestore,P50~0.47ms,P95~2.30ms,max~4.72ms,at most64observed site checks;not browser frame time. Long-term performance remainsINCONCLUSIVE;WindowsChrome/Edge and physicalGPU remainNOT_TESTED.

## 證據與後續 / Evidence and follow-up

繁體中文：evidence/builder為正常建屋前後完整短影片與截圖；evidence/grid為同存檔射箭場前後片段／截圖與原生第五波存檔；evidence/natural保留原敗局、環境中斷、最新第五波敗局與最近原生存檔。片段皆來自真正連續錄影的縮放／重編碼，非圖片合成，Playwright影片沒有音軌。大型完整影片明列LOCAL_ONLY及SHA於video-provenance.json，不把/workspace路徑當可直接下載入口。中斷的page@影片未完成封裝，不宣稱完整可播。Git只新增有限證據，未清理／改寫歷史。

English: evidence/builder holds normal construction before/after full short videos/screenshots;evidence/grid holds matched-save range clips/screenshots and native wave5save;evidence/natural retains original defeats,interruption,latest wave5defeat and recent native save. Clips are scaled/reencoded continuous actual footage,not image montages;Playwright videos have no audio. Large full recordings are explicitlyLOCAL_ONLY withSHA in video-provenance.json;/workspace paths are not presented as direct downloads. Interrupted page@video was not finalized and is not claimed complete/playable. Only bounded evidence is added toGit;no history cleanup or rewriting.

繁體中文：本輪主動交接，仍有已授權的第五波戰術診斷與更長性能驗證可做，故STOP_REASON誠實記AGENT_EARLY_STOP，沒有把成功Push、已恢復的環境中斷或未知額度當成迫停。下一步應從所保存的原生第五波狀態檢查戰術命令／防線與軍務資源競爭，避免反覆從第一波或只換抽卡策略求PASS。公開版本替換、未批准的九項科技與中國副箭疊加仍不能擅改。未更新RC等級，未改main／Pages／Issues／舊Owner Feed／排程／不可變構建，沒有ForcePush、公開Release或部署。

English: This is a voluntary handoff while authorized wave5tactical diagnosis and longer performance work remain,so STOP_REASON honestly recordsAGENT_EARLY_STOP. Successful pushes,the recovered interruption and unknown quota are not presented as forced stops. Next use the retained native wave5state to inspect tactical commands/defenses and production resource competition,avoiding repeated wave1starts or changing card policies merely to getPASS. Public replacement,nine unapproved technologies and China's bolt stacking remain outside unilateral changes. NoRC-grade promotion,main/Pages/Issues/old-ownerFeed/scheduler/immutable-build changes,ForcePush,publicRelease or deployment.
