# 真人回饋系統切片 / Human feedback systems slice

## 範圍與版本 / Scope and version

繁體中文：回應玩家兩場中國文明試玩。玩家提供公開網址 `https://gst-september-likes-jeffrey.trycloudflare.com/`；此環境代理拒絕連線，因此不宣稱線上問題已完整重現或部署已修正。基底為公開預覽來源 `904c70e7e5b7230f0f40f3f303668e90be3c89e1`，完整保留 PixelFX Phase 2。正式本機構建來源 `e615e6e95156587dc18b135b553d65774e8fa299`；147 項 SHA-256 全部一致。此分支未修改或替換公開預覽、內部 RC、main、Pages、舊 Issues、Checkpoint 或不可變構建。

English: Addresses two human playtests using China. The player supplied the URL above; the environment proxy denied access, so complete online reproduction or a deployed fix is not claimed. Base is public-preview source `904c70e7e5b7230f0f40f3f303668e90be3c89e1`, retaining all PixelFX Phase 2 work. Official local build source is `e615e6e95156587dc18b135b553d65774e8fa299`; all 147 SHA-256 payloads match. This branch does not replace or modify the public preview, internal RC, main, Pages, old Issues, Checkpoints or immutable builds.

## 七項結果 / Seven outcomes

| 項目 / Item | 實作與證據 / Implementation and evidence | 狀態 / Status |
|---|---|---|
| 存活姿態 / Living poses | 舊 SVG 把完整身體按方向旋轉並裁切；重新產生直立身體，只保留死亡翻倒。已烘焙圖集不再重複套用方向／死亡變換。/ Old SVGs rotated and clipped the whole body. Regenerated upright bodies retain death falls; baked atlases avoid duplicate directional/death transforms. | 受控前後 Renderer PASS；中國七類兵種、八方向，16 文明代表性覆蓋。/ Controlled renderer PASS; seven Chinese unit types, eight directions, representative coverage of 16 civilizations. |
| 滑鼠啟動 / Mouse startup | 校驗期間滑鼠停用但 Enter 原可繞過；兩條入口現在共用完整性閘門，四語進度，四路有限並行且先驗證整份路徑。/ Enter previously bypassed the mouse-disabled integrity gate. Both paths now wait; localized progress, four bounded workers, full path validation before any fetch. | 本機四語 PASS；公開網站原始滑鼠故障仍未完全歸因。/ Local four-locale PASS; full original online mouse-failure cause remains unconfirmed. |
| 村務／建築／升級 / Economy, buildings, ages | 手動／詢問／自動升級，費用預留；建築模式、數量上限、優先級、村民及時代門檻，包含施工中數量；安全選址及正常施工。/ Manual/ask/auto ages with reserves; building modes, limits, priorities, worker/age thresholds, construction counts, safe placement and ordinary construction. | Node＋受控 Chromium PASS；自然樣本另列。/ Node and controlled Chromium PASS; natural sample separately recorded. |
| 軍務生產 / Military production | 全軍均衡／反制已見敵軍／防守／自訂，逐建築開關、合法兵種、上限、相對權重、佇列上限及資源預留。手動佇列及手動生產後 13 模擬秒優先；自動總節奏仍每 13 秒最多一筆。/ Global balanced/visible-counter/defense/custom plans, per-building legal choices, targets, relative weights, queue caps and reserves. Manual queues and 13 simulation seconds after manual production take priority; automatic cadence remains at most one order per 13 seconds. | 受控槍兵完成訓練 PASS；大規模長期經濟未認證。/ Controlled spear production PASS; sustained large-army economy not certified. |
| 採集配置 / Gathering | 五種預設＋四資源自訂比例，逐人重算缺額；先交貨，不覆蓋手動工作；最多一次調整一人，12 模擬秒滯後，僅改派空手且未鎖定工人。顯示分配與預留。/ Five presets plus custom ratios, per-worker deficit updates, cargo first, manual locks; rebalance at most one empty-handed unlocked worker with 12 simulation-second hysteresis. Allocation and reserves are visible. | 40/30/20/10 精確分配 Node PASS；可達資源與施工／搬運回歸 PASS。/ Exact 40/30/20/10 allocation Node PASS; reachable-resource, construction and cargo regressions PASS. |
| 克制索敵 / Tactical targeting | 共用確定性評分：既有傷害克制、距離、威脅、殘血、冷卻、黏著；另加騎兵追弓兵偏好，不改傷害。保留手動目標、視野、距離、防禦範圍、既有不可達標記與 HUNT/RAID 優先規則。/ Shared deterministic scoring uses existing damage counters, distance, threat, health, cooldown and stickiness; cavalry preference for archers changes no damage. Manual targets, sight, range, defensive leash, recorded path failures and HUNT/RAID priorities remain. | 雙方騎兵追弓兵／槍反騎及遠距反例 PASS；四個Chromium場景實際接近並攻擊優先目標；既有戰術回歸 PASS。/ Both-team cavalry/archer and spear/cavalry cases, range counterexamples and existing tactical regressions PASS; four Chromium scenes move toward and attack preferred targets. |
| 敵我辨識 / Faction readability | 友軍青色圓環、敵軍橙色菱形、中立象牙色方形；深色外框，單位及建築共用，大型披風、坐騎、Boss另在血條旁增加徽記，不染改文明服飾或模型。/ Cyan circle for allies, orange diamond for enemies, ivory square for neutrals, dark outlines, shared by units/buildings, plus badges beside health-bar anchors for large cloaks, mounts and bosses, without recoloring civilization outfits or models. | Renderer 前後及密集戰鬥截圖；真人色弱辨識 NOT_TESTED。/ Before/after and dense combat captures; human color-vision accessibility NOT_TESTED. |

## 操作與相容規則 / Controls and compatibility rules

繁體中文：戰場按鈕或暫停選單 →「總管規劃」；儲存後再繼續。關閉不儲存會捨棄設定輸入。「將閒置村民交還總管」是立即明確命令，只解除閒置村民的手動鎖定。建築預設關閉、升級預設手動，保留既有採集比例 34/32/22/12；使用者的 40/30/20/10 只作驗證範例。資源預留是自動支出後的最低庫存，不限制玩家手動花費。時代詢問／自動模式另預留正式升級費用，不改費用、研究時間或兵種門檻。建築 GDD／手動 API 沒有額外時代鎖定，採一致預設時代 1，加上玩家可提高的規劃門檻；不另發明科技樹。施工位置沿用正常地形／碰撞驗證，避開已知進軍路、營地與可見近敵，使用同一尋路器檢查施工接近距離。手動放置中不自動建築，失敗等待後重試，不排無限佇列。

English: Battlefield button or pause menu → Steward plans; save, then resume. Close without saving discards configuration edits. Release idle workers is an explicit immediate command affecting only idle manual locks. Buildings default off, ages default manual, original 34/32/22/12 gathering proportions remain; 40/30/20/10 is only a verification example. Reserves are minimum stocks after automatic spending and do not restrict manual purchases. Ask/auto ages also reserve the actual age cost; fees, research times and unit restrictions are unchanged. Building GDD/manual APIs have no additional age lock, so the consistent default is age 1 with a player-configurable higher planning threshold, without inventing a tech tree. Placement uses normal terrain/collision validation, avoids known attack lanes, camps and nearby visible enemies, and uses the same pathfinder to check builder approach distance. Manual placement blocks automatic construction; failures wait and retry without infinite queues.

繁體中文：設定、村民手動鎖定、調派時間、手動生產優先與佇列均可存檔。NG+ 保留玩家規劃偏好，但清除舊建築 ID、待確認提案及計畫時鐘。面板暫停模擬，關閉恢復先前暫停狀態。自訂全軍方案透過逐建築權重／目標設定，不把比率當作傷害參數。既有戰爭迷霧／沙暴維持；敵軍已知城心行軍目標沿用既有設計，不新增未見單位情報。

English: Plans, manual worker locks, reassignment timestamps, production priority and queues persist in saves. NG+ retains planning preferences but clears old building IDs, pending proposals and the planning clock. The panel pauses simulation and restores the prior pause state when closed. Custom armies use per-building weights/targets, not damage parameters. Existing fog/sandstorm rules remain; the existing known town-center marching objective is retained without adding information about hidden units.

## 測試與效能 / Tests and performance

繁體中文：441/441 Node＋七組參數化英雄圖集共35/35 PASS，四語754鍵完整。147/147資源雜湊 PASS。正式 Chromium 受控操作：房屋2→3且完工、按正常研究升到時代2、槍兵0→1、Save/Load 設定／RNG位元、暫停 PASS，無 pageerror。最初 Node 9 FAIL 已保存：七項來自本輪索敵／既有規則衝突，一項來自並行校驗提前發請求，一項來自既有遠程投矛限制；修正程式後原測試全部通過，未刪測試。初次瀏覽器場景沒有呼叫正常讀檔後 start、圖集場景未走延後載入，分別保留為夾具錯誤，不計為遊戲缺陷。歷史 signed/unsigned RNG 原始數值差異不因此改寫為全域確定性認證。

English: 441/441 Node tests plus 35/35 across seven parameterized hero suites PASS; all 754 keys across four locales validate. 147/147 resource hashes PASS. Controlled official Chromium: houses 2→3 and completed, ordinary research to age 2, spears 0→1, Save/Load configuration/RNG bits and pause PASS, no page errors. The initial nine Node failures are preserved: seven target/core-rule conflicts, one concurrent-integrity prevalidation failure, and one existing skirmisher reach restriction; code was corrected and original tests pass without deletion. Initial browser fixtures omitted the normal post-load start or lazy atlas load; these are retained as fixture errors, not gameplay defects. Historical signed/unsigned raw RNG differences are not relabeled as a global determinism certificate.

| 雲端 Chromium 154，1440×900 / Cloud Chromium154, 1440×900 | 原版 / Before | 本輪 / After |
|---|---:|---:|
| 固定100單位繪製 P50/P95，120次 / Frozen100 draw P50/P95,120 samples | 17.8/21.3 ms | 17.0/23.8 ms |
| 固定200單位繪製 P50/P95，120次 / Frozen200 draw P50/P95,120 samples | 33.3/37.0 ms | 31.5/36.3 ms |
| 實戰100單位起始 RAF P50/P95，300幀 / Combat100 initial RAF P50/P95,300 frames | 33.4/66.7 ms | 33.4/66.7 ms |
| 實戰200單位起始 RAF P50/P95，300幀 / Combat200 initial RAF P50/P95,300 frames | 66.7/100.0 ms | 66.6/100.0 ms |
| 實戰100 / Combat100 FPS | 22.91 | 22.31 |
| 實戰200 / Combat200 FPS | 14.90 | 14.89 |

繁體中文：硬體為共享 AMD EPYC 9V74、可見5 CPU；Headless Chromium，無實體 GPU 認證。最終繪製100單位P95增加約2.5ms、P50降低；200單位兩者降低，不能標為全面性能PASS。實戰前後陣亡不同（100場73/67存活、200場129/117存活），順序樣本且約13–20秒，不能把 FPS 差直接歸因或宣稱長期效能通過。固定200場 JS heap 原版9.72→7.50MB、新版8.94→9.95MB，受 GC 影響；長時間記憶體穩定性 INCONCLUSIVE。200單位雲端流暢度仍有限。最終效能證據已在e615e6e重新測量；早期57142b4的樣本另保留，不覆寫。

English: Shared AMD EPYC 9V74 with five visible CPUs, headless Chromium, no physical GPU certification. Final frozen100 draw P95 rises about2.5ms while P50 falls; both decrease at200. This is not an overall performance PASS. Combat casualties differ (73/67 survivors at100;129/117 at200); sequential samples last roughly13–20 seconds, so FPS differences cannot establish causality or sustained performance. Frozen200 JS heap goes9.72→7.50MB before and8.94→9.95MB after, subject to GC; long-term memory stability is INCONCLUSIVE. Cloud200-unit smoothness remains limited. Final performance was remeasured at e615e6e; earlier57142b4 samples remain preserved.

## 自然樣本與後續修復 / Natural sample and follow-up fix

繁體中文：原始122秒樣本在正常資源、正常波次下完成第一波進入選卡，但等待升級確認阻擋自動房屋，記錄為實際整合 FAIL。`2c13aa14a6cf421ac7732846af65c5b7f84d4e7e` 修正後，以 UI 設定種子 `CHN-FEEDBACK-V1`、中國文明、40/30/20/10及第三間房屋／詢問升級，不改資源、生命、傷害或波次；124秒樣本在20秒時已完成三間房屋，約121模擬秒完成第一波進入選卡，無pageerror。實際按儲存、重新載入、繼續，保留種子及全部規劃（20.099→20.199秒為正常繼續後推進）。這是瀏覽器鼠標設定後的自然自動總管樣本，非真人完整戰役或十波PASS；沒有宣稱已選卡。原樣本未保存完整種子，不能作逐幀A/B對照。後續`7c4b7840da3135afec4efb72446a6a8dda6e69f7`新增戰場入口與一次提示，`63a42dfa3d5caac3b74f2420afc94d38f96dddf3`同步四語說明；最終正式 Chromium 四語、HUD入口、研究、產兵、暫停及狀態恢復再次PASS，147資源再校驗一致。

English: The initial122-second sample used normal resources/waves and cleared wave1 into reward selection, but pending age confirmation blocked automatic housing: an actual integration FAIL. After fix `2c13aa14a6cf421ac7732846af65c5b7f84d4e7e`, UI-selected seed `CHN-FEEDBACK-V1`, China,40/30/20/10 gathering, third-house plan and ask-mode ages were tested without changing resources, health, damage or waves. The124-second sample had all three houses complete at20 seconds and cleared wave1 into reward selection at roughly121 simulation seconds, with no page errors. Actual Save/Reload/Continue preserved seed and all plans (20.099→20.199 seconds is ordinary resumed progress). This is a mouse-configured natural automated-steward sample, not a human full campaign or ten-wave PASS; reward selection is not claimed. The initial sample lacks a full recorded seed and cannot be a frame-identical A/B. Follow-up `7c4b7840da3135afec4efb72446a6a8dda6e69f7` adds battlefield access and one-time notifications; `63a42dfa3d5caac3b74f2420afc94d38f96dddf3` aligns four-language descriptions. Final official Chromium again passes four locales, HUD access, research, production, pause and state restoration;147 resources reverify.

繁體中文：最後e615e6e為避免英雄披風及重騎兵遮住腳環，補上血條旁徽記；重跑441/441＋35/35、正式構建147雜湊、16文明視覺、雙方實際索敵與100／200效能。English: Final e615e6e adds badges beside health-bar anchors where cloaks/mounts hide ground rings;441/441+35/35,147 official hashes,16-civilization visuals, both-team actual targeting and100/200 timings were reverified.

## 限制 / Limits

繁體中文：此為獨立開發候選切片，未擅自提升／取代既有 RC 等級。自然十波、實體 GPU、Firefox/Safari、真人色弱可讀性、長時間大軍經濟及全部自訂組合仍 NOT_TESTED／INCONCLUSIVE。沒有公開發布。截圖、JSON、失敗及成功日誌見 evidence；自然樣本另以獨立紀錄保存。下一步依真人回饋與性能證據選擇長時間總管／手動插隊／阻塞恢復場景，不重做已完成沙暴或 NG+ 功能。

English: This is an independent development candidate slice, not a replacement or unilateral promotion of the existing RC. Natural ten waves, physical GPU, Firefox/Safari, human color-vision readability, sustained large-army economy and all custom combinations remain NOT_TESTED/INCONCLUSIVE. No public release occurred. Screenshots, JSON and failure/pass logs are in evidence; the natural sample is recorded separately. Next work should use human feedback and performance evidence to extend steward/manual-priority/blockage-recovery soak scenarios, without reimplementing completed sandstorm or NG+ functionality.
