# 英雄與 Boss 內容接續 / Hero and Boss content continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：接續遠端e6214c9，四種新原創Atlas來源d5d75c4已通過18 Node／24 Chromium，正常推送至e651b7782cbf09d21660508d0b9368145e701100，Feed已保存。接著英雄施法、Mark／Aegis與雙Boss預警／命中特效來源6fae8aa71f24acc3e0a695218f3fd05009afc771通過18 Node／12技能Chromium，最終另24項整合Champion Chromium通過；英雄原生右鍵離開真實傷害區，區內盾衛實際受傷。另修正Boss範圍的等角投影，未改平衡。保留首輪裁切、性能及暫停期間測試右鍵失敗。此快照描述本身發布前來源；最新遠端與Feed須現查。詳細報告在docs/evidence/v240-champions及v240-champion-skills。

English: Continued from remote e6214c9. Four original atlases at d5d75c4 pass18Node/24Chromium and are normally pushed through e651b7782cbf09d21660508d0b9368145e701100, with Feed saved. Following hero casting, Mark/Aegis and two-Boss warning/impact source6fae8aa71f24acc3e0a695218f3fd05009afc771 passes18Node/12skillChromium plus24final integratedChampionChromium checks: native right-click movement escapes actual damage while the guard inside is hit. Corrected Boss isometric range projection without balance changes. Preserve initial clipping, rendering-performance and paused-test-input failures. This snapshot describes source before its own publication; requery actual latest remote/Feed. Reports: docs/evidence/v240-champions and v240-champion-skills.

繁體中文：新主控移轉已完成，不重跑已驗證切片或等待原環境。唯一目前寫入者codex-migration-20261029，遠端Ownership仍須每切片核對。下一切片優先文明特色既有單位，例如PER戰象獨立美術及真實戰鬥驗收，再擴充正式事件驅動音效。自然Easy／Normal十波與NG+未通過，所有時鐘／存讀／性能／Rift／硬體FAIL保留。310分鐘排程尚未切換；無main、Pages、OmGitHub或公開發布。原9a0f19e與未提交QA獨立待復原，不阻塞主線。以下歷史快照不覆蓋本段。

English: Migration is complete; do not repeat verified slices or wait for the original environment. Current sole writer: codex-migration-20261029; revalidate remote ownership before each slice. Next prioritize an existing civilization-specific unit, such as independent PER war-elephant artwork with real combat acceptance, then production-event audio. Natural Easy/Normal ten waves and NG+ remain unpassed, with all clock/save/performance/Rift/hardware failures retained. The310-minute schedule has not been rebound. No main,Pages,OmGitHuborpublicrelease. Original9a0f19eanduncommittedQAremainisolatedforrecoverywithoutblockingnewwork. Historical snapshots below do not override this paragraph.

---

# 新主線主控接續 / New primary continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：本Agent已安全取得V240-SPECIAL-ATLAS與V240-CONTENT-FEED，執行識別codex-migration-20261029。長矛／盾衛dc88fd9：22Node／14Chromium通過，第一輪裁切FAIL保留；已正常Push至878ec8f8cac6a06b0e80f420ac49e957820a65a2，Feed572d40607310b07b24dce1ec7a22670aaed5da7a已保存。後續水岸來源771a6ddea2d458f1362f9717c42a10e171c85457：5Node／13Chromium通過，四地貌世界資料不變、岸線只於快取重建繪製。截至c733fd990fecd413a14bafe8cc8e9aa06a1dfb6b與Feed1a09e26665506018c8f04f2404550af3293e8959，來源、Recovery、Handoff、證據與遠端核對已完成，MIGRATION_COMPLETE。排程切換與原資料恢復仍各自未完成。

English: This Agent safely holds V240-SPECIAL-ATLAS and V240-CONTENT-FEED as codex-migration-20261029. Spear/guard source dc88fd9 passes 22 Node and 14 Chromium checks; the initial clipping FAIL is retained. It was normally pushed to 878ec8f8cac6a06b0e80f420ac49e957820a65a2, with Feed 572d40607310b07b24dce1ec7a22670aaed5da7a saved. Following shoreline source 771a6ddea2d458f1362f9717c42a10e171c85457 passes 5 Node and 13 Chromium checks, with unchanged world data across four biomes and banks drawn only when rebuilding the cache. Source, Recovery, Handoff, evidence and remote verification are complete at c733fd990fecd413a14bafe8cc8e9aa06a1dfb6b and Feed 1a09e26665506018c8f04f2404550af3293e8959: MIGRATION_COMPLETE. Scheduler rebinding and original-data recovery remain separately incomplete.

繁體中文：原離線環境9a0f19e、QA／證據／Artifact獨立待復原，不阻塞本主線，不冒用舊13項測試。自然Easy／Normal十波未通過、自然NG+未測，保留全部時鐘／存讀／性能／Rift／硬體限制。無排程管理工具；若310分鐘排程仍指原對話，使用者需在排程介面改指本對話。下一個GAME FIRST切片為特殊兵種／英雄辨識度，先核對已保存功能，不重跑全美術流程、不因自然十波卡住其他開發。未公開發布。以下歷史摘要不覆蓋本段。

English: Original offline commit 9a0f19e and its QA, evidence and artifact remain isolated for recovery without blocking new development or reusing the old 13 tests. Natural Easy/Normal ten waves remain unpassed and natural NG+ untested; retain all clock, save, performance, Rift and hardware limits. No scheduler management tool exists: if the 310-minute schedule still targets the old conversation, the user must retarget it in the UI. Next GAME FIRST slice: special-unit/hero identity; reconcile existing work first, with no full art pipeline rerun or natural ten-wave prerequisite. No public release. Historical notes below do not override this paragraph.

---

# 新主控移轉快照 / New primary migration snapshot

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：使用者已正式移轉全部後續開發至本Agent。基準463c9d8，新工作區/workspace/riftwatch-v240-takeover，Ownership revision203已安全取得。長矛／盾衛新成果來源dc88fd96a810936f99919b57d27804a682185d2d：22 Node及14本地Chromium通過，保留首輪影格邊界FAIL。此快照MIGRATION_IN_PROGRESS，尚待本次Push／Feed保存。原9a0f19e及未提交QA為UNPUSHED_WORK_RECOVERY_PENDING，不阻塞新主線，不冒用原13項測試。下一切片為水岸視覺。自然戰役不是美術前置；保留全部歷史FAIL及未發布限制。排程無管理工具，未宣稱切換。詳見docs/evidence/v240-migration/REPORT.md。以下為歷史快照，不覆蓋本段。

English: The user formally migrated all further development to thisAgent. Baseline463c9d8,newworktree/workspace/riftwatch-v240-takeover; ownershiprevision203safely acquired. New spear/guard source dc88fd96a810936f99919b57d27804a682185d2d passes22Node/14localChromium checks; initial boundaryFAIL retained. This snapshot is MIGRATION_IN_PROGRESS pending this push/feed preservation. Original9a0f19eanduncommittedQA remain UNPUSHED_WORK_RECOVERY_PENDING, do not block new development, and old13tests are not reused. Nextslice:shorelinevisuals. Naturalcampaigns are not an artprerequisite; all historicalFAIL/publicationrestrictions remain. No scheduler-management tool; no switching claimed. See docs/evidence/v240-migration/REPORT.md. Earlier snapshots below are historical and do not override this paragraph.

---

# 內容優先與諸葛弩接續 / Content-first and crossbow continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**繁體中文：** 2026-10-29使用者正式將內容／美術／戰術／音效開發優先於反覆自動玩家通關；自然十波不再是其他工作的前置條件。受測遊戲Build `b9893ac1319f033a8ef0db0b98ed9fc183dde3f1`新增獨立諸葛弩四影格八方向Atlas及修正正規化攻擊／受擊播放時序；PNG替代SVG繪製成本退步，保留Canvas回退、未改平衡。12項Node與9項真實本地Chromium檢查PASS；原始失敗、錄影、前後截圖及三組render-JS樣本見`docs/evidence/v240-special-atlas/REPORT.md`。

**English:** The user formally prioritized content/art/tactics/audio over repeated autoplayer win attempts on2026-10-29; natural ten waves no longer gates other work. Tested game Build`b9893ac1319f033a8ef0db0b98ed9fc183dde3f1`adds an independent four-frame/eight-direction repeating-crossbow atlas and fixes normalized attack/hit playback. PNG removes the SVG draw-cost regression; Canvas fallback remains and balance is unchanged.12Node and9actual local Chromium checks PASS; original failures, recording, before/after images and3render-JSgroups:`docs/evidence/v240-special-atlas/REPORT.md`.

**繁體中文：** 下一個最小切片：依同一風格製作具有長兵器與盾牌獨立輪廓的兵種，或改善地形素材；不要重做本輪Atlas或重跑相同自然戰敗策略。重大高地／通行成本／Fog規則仍先確認。Easy／Normal自然十波未通過、自然NG+NOT_TESTED；受控十波／NG+限定PASS。保留所有歷史FAIL、硬體待測及RELEASE_BLOCKED；無公開發布。實際Git/API與遠端ownership.json優先於快照；工作切片存檔後若可繼續即繼續。

**English:** Next minimal slice: an independent long-weapon/shield silhouette in the same style, or terrain artwork. Do not repeat this atlas or identical natural-defeat policies. Confirm material high-ground/traversal/Fog rule changes first. Natural Easy/Normal ten waves remain unpassed; naturalNG+NOT_TESTED; controlled ten-wave/NG+PASSis scoped. Retain all historical FAIL, hardware pending andRELEASE_BLOCKED; no public deployment. ActualGit/APIand remoteownership.jsonprevail over snapshots; continue after slice checkpoints when executable.

---

# Easy基準與Normal配對接續 / Easy baseline and Normal-pair continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**中文：** 使用者最新優先級為Easy自然十波，遊戲來源仍`798bcffdfe8e97bdd4e8abe6c67f18223b540877`，本輪不改平衡。TEU／steppe／MILESTONE-NORMAL、1×、相同策略：Easy自然第五波戰敗；Normal有效補測自然第四波戰敗。首組Normal第五波停滯，舊工具未記paused，意外Pause符合但非完全證實；確認修復逾時點擊副作用未恢復的工具缺陷，補測有直接paused遙測且自然結束。不要從戰敗存檔恢復健康戰役，也不要重跑相同策略求綠。

**English:** Latest user priority is natural Easy ten waves. Game source remains`798bcffdfe8e97bdd4e8abe6c67f18223b540877`, with no balance changes. FixedTEU/steppe/MILESTONE-NORMAL,1×and shared policy: Easy naturally lost wave5; valid Normal rerun naturally lost wave4. Initial Normal stalled at wave5withoutpausedtelemetry; accidental Pause fits but is not fully proven. Fixed the confirmed timed-out-click side-effect recovery defect; rerun recordspausedand ends naturally. Do not restore defeated saves as healthy campaigns or rerun the same policy for green results.

**中文：** 受控低密度組正式完成十波與Boss擊殺，實際Chromium原生勝利／三卡／NG+／經濟科技重置／第二周目側翼／存讀通過。玩家HP覆寫與注入守軍明示，只是CONTROLLED_FIXTURE，三個前置失敗保留；自然Easy／Normal NG+仍NOT_TESTED。最新完整證據與比較：`docs/evidence/v240-easy-baseline/REPORT.md`及`comparison.json`。

**English:** The low-density controlled fixture completed production ten-wave/Boss kills; actual Chromium passed native victory/3cards/NG+/economy-technology reset/cycle2flank/save-load. Explicit player-HP overrides/injected defenders make thisCONTROLLED_FIXTUREonly; retain3preceding failures. Natural Easy/Normal NG+remainNOT_TESTED. Evidence/comparison:`docs/evidence/v240-easy-baseline/REPORT.md` and`comparison.json`.

**中文：** 下一步先核對科技／軍費全資源預算、採集防守與操作延遲、攻城反制的共同瓶頸，獨立重現確認的Bug後才修，不無限制新增版本。RELEASE_BLOCKED、所有歷史FAIL及硬體待測保留。所有測試停止；本輪因執行窗口保存，所有權於Push後釋放，以遠端ownership.json為準。無公開發布，跨對話寫入不可用。

**English:** Next inspect shared bottlenecks in all-resource technology/military budgeting, resource defense/operation latency and siege counters. Reproduce confirmed bugs before repairing rather than endlessly versioning players. Retain RELEASE_BLOCKED, all historical FAIL and hardware pending. Tests stopped; checkpointed at execution-window boundary, ownership released after push, with remoteownership.json authoritative. No publication; cross-thread writing unavailable.

---

# 村民逐擊與護衛接續 / Worker damage and escort continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**中文：** 本輪只改QA觀測／自動玩家，遊戲來源仍`798bcffdfe8e97bdd4e8abe6c67f18223b540877`。實際逐擊接續捕獲62筆記錄、9次村民死亡；可見靠近友軍但友軍正打另一目標，不能推論引擎重新索敵壞掉。單護衛新模式原被全體攻城集火抵銷，已修正原生逐單位選取與保留護衛。15項定向測試及真實Chromium命令分離通過；不等同生存或十波通過。詳見`docs/evidence/v240-worker-hits/REPORT.md`。

**English:** Only QA observation/automated-player code changed; game source remains`798bcffdfe8e97bdd4e8abe6c67f18223b540877`. Actual hit observation captured62records and9worker deaths, including nearby allies attacking another target; this does not establish an engine retargeting defect. Whole-army siege focus previously overrode the new single-escort mode; corrected native per-unit selection/reserved escort.15directed tests and actual Chromium command separation pass, not survival or ten-wave acceptance. See`docs/evidence/v240-worker-hits/REPORT.md`.

**中文：** 下一步由`docs/evidence/v240-worker-hits/escort-verified/save-snapshot.json`接續，校驗`a29fa343e57df3b0b0e5914183fbf6615735447cfb0193cc3ed88a13572149e6`。第三波424.3471秒、3村民／6軍事、城心滿血；45秒限定樣本未通關。補只讀導航／返程記錄，驗證單護衛較長戰鬥生存，不修改Normal或宣稱AI修復。地形Custom決策仍待回答。

**English:** Next continue`docs/evidence/v240-worker-hits/escort-verified/save-snapshot.json`, digest`a29fa343e57df3b0b0e5914183fbf6615735447cfb0193cc3ed88a13572149e6`: wave3sim424.3471,3workers/6military/full core; a45-second bounded sample, not victory. Add read-only navigation/return tracing and assess sustained escort survival; do not alter Normal or claim AI repair. Custom terrain decisions remain pending.

**中文：** 本次因執行預算安全保存，無活躍測試；所有權於Push後釋放，以遠端ownership.json為準。保持RELEASE_BLOCKED及全部歷史FAIL，無公開發布。跨對話工具不可用，不宣稱送達。

**English:** Safely checkpointed at the execution-budget boundary; no active tests. Ownership is released after push; remoteownership.json prevails. Retain RELEASE_BLOCKED and all historical FAIL; no public deployment. Cross-thread tools unavailable; delivery not claimed.

---

# 選卡存檔接續 / Card-choice save continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**中文：** 本輪新增選卡介面原生存檔，保存候選順序、付費重抽次數及原有RNG；Continue重開選卡。缺候選的舊boon快照在修改遊戲前拒絕，普通舊存檔仍可讀，不重抽猜測。受測遊戲來源 `798bcffdfe8e97bdd4e8abe6c67f18223b540877`，21項定向測試、四語×100%／130%共8組真實本地Chromium通過；詳細證據`docs/evidence/v240-boon-save/REPORT.md`。未宣稱完整確定性或自然戰役通過。

**English:** Added native reward-screen saving, persisting offered order, paid reroll count and existing RNG; Continue reopens rewards. Oldboonsaves missing choices are rejected before mutation, while ordinary legacy saves remain loadable; no guessed redraw. Tested game source `798bcffdfe8e97bdd4e8abe6c67f18223b540877`;21directed tests and8actual local Chromium workflows (four locales×100%/130%) pass. Evidence:`docs/evidence/v240-boon-save/REPORT.md`. Full determinism and natural campaign acceptance are not claimed.

**中文：** V6稀疏死亡資料分析指向採集／返程與護衛覆蓋：18次消失觀察中16次在採集／返程，11次三格內無友軍，並非逐擊因果證明。下一步於最新存活快照加入只讀傷害／路徑／護衛記錄再重現。存活起點仍為`docs/evidence/v240-v6-investment/stock-continuation/save-snapshot.json`，SHA256 `0fa1b7242b4211c8bc917c4d036a13dd5263863c320b350ff643d19158dcc82d`；其舊來源cfc42ee與新遊戲來源要分組記錄。不要使用原V6終點缺候選的boon診斷快照。

**English:** SparseV6loss analysis points toward gathering/returning and guard coverage:16of18disappearances last gathered/returned;11had no friendly military within3tiles, not per-hit causal proof. Next reproduce with read-only damage/path/guard observations from the latest living save: `docs/evidence/v240-v6-investment/stock-continuation/save-snapshot.json`, SHA256 `0fa1b7242b4211c8bc917c4d036a13dd5263863c320b350ff643d19158dcc82d`. Record its oldcfc42eesource separately from the new game. Do not use the originalV6finalboondiagnostic save missing choices.

**中文：** 因執行窗口保存；所有測試停止，所有權於Push後釋放，遠端ownership.json為準。保持RELEASE_BLOCKED、全部歷史FAIL與地形選項待確認；無公開發布。跨對話寫入不可用，不宣稱送達。

**English:** Checkpointed at the execution-window limit; tests stopped, ownership released after push, and remoteownership.json prevails. Retain RELEASE_BLOCKED, all historical FAIL and pending terrain decisions. No public deployment. Cross-thread writing unavailable; delivery not claimed.

---

# 最新品質修復與接續 / Latest quality fixes and continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**中文：** 本輪完成三項確定性修復：Save/Load保留飛行投射物及Boss／煙霧區域、保存緩速／暈眩強度、Pause／選卡不消耗絕對戰鬥時間。最新受測遊戲來源 `cfc42ee511b35cbefe1359af476fbd9396054a70`，42項受影響測試與5項原生本地Chromium檢查通過。嚴格確定性仍false、低FPS截斷未改。證據：`docs/evidence/v240-save-transients/REPORT.md`。

**English:** Three deterministic repairs: Save/Load preserves in-flight projectiles and Boss/smoke zones, retains slow/stun strength, and Pause/card choice no longer consumes absolute combat time. Latest tested game source `cfc42ee511b35cbefe1359af476fbd9396054a70`;42affected tests and5native local Chromium checks pass. Strict determinism remains false; low-FPS clipping unchanged. Evidence:`docs/evidence/v240-save-transients/REPORT.md`.

**中文：** V6正式Start、1× Normal、手動軍費／經濟、集中守城與延後科技，自然完成第三波；來源a58abaf。領取rift_prototype後未當機，僅該情境NOT_REPRODUCED。第三波選卡攔截週期Pause而工具逾時，非戰敗。已修工具遇選卡延後、不強制點擊。最新cfc42ee限定接續仍第三波、6軍事／2村民，未通過十波。存活快照與校驗：`docs/evidence/v240-v6-investment/stock-continuation/save-snapshot.json`及`resume-integrity.json`。不要用原始V6終點boon診斷快照恢復，boonChoices尚未保存。

**English:** V6used native Start,1× Normal, manual spending/economy, concentrated core defense and delayed research, naturally completing wave3at sourcea58abaf. Rift Prototype was claimed without a crash in this case only. Card choice blocked a periodic Pause save and caused a harness timeout, not defeat. The harness now defers on card overlays without forced clicks. Latestcfc42eescoped continuation remains wave3with6military/2workers; ten waves not passed. Living save/digest:`docs/evidence/v240-v6-investment/stock-continuation/save-snapshot.json` and`resume-integrity.json`. Do not restore the originalV6finalboondiagnostic snapshot; boonChoices are not saved.

**中文：** 下一步分析第三波村民死亡位置、護衛範圍、返程與可達性；不要重跑全歷史或以指令成功當存活通過。地形Custom選項待使用者回答。全部戰役已停止，本輪因執行窗口結束保存；所有權於Push後釋放，遠端ownership.json為準。RELEASE_BLOCKED，v234不發布；無Pages／OmGitHub／main變更。跨對話寫入不可用，不宣稱送達。

**English:** Next analyze wave3worker deaths, guard range, return routes and reachability; do not repeat all history or equate command acceptance with survival. Custom terrain options await the user. All campaigns stopped; checkpointed at the execution-window limit. Ownership is released after push; remoteownership.json prevails. RELEASE_BLOCKED,v234unpublished; no Pages/OmGitHub/main changes. Cross-thread writing is unavailable; delivery not claimed.

---

# 目前接續 / Current continuation

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

**中文：** 最新工作為剩餘項目盤點與V5.10–V5.13真實本地Chromium比較。V5.12與已覆核設定的V5.13均第三波自然戰敗，十波／自然New Game+未通過。已修復Continue後設定未套用的測試工具缺陷，不能將修正誤報為遊戲平衡改善。最新詳細索引：`docs/evidence/v240-remaining-audit/REPORT.md`；發布判定：`docs/release/v240/REMAINING-WORK-AUDIT.md`，RELEASE_BLOCKED。遊戲來源0f85357303bf2bca809e6ff32b490769e1d3f836不變。所有戰役已結束。

**English:** Latest work is the remaining-work audit and actual local ChromiumV5.10–V5.13comparisons. V5.12 and settings-verifiedV5.13 naturally lost at wave3; ten waves/natural New Game+ have not passed. Fixed the harness defect where settings were not applied after Continue; this is not a game-balance improvement. Detailed index: `docs/evidence/v240-remaining-audit/REPORT.md`; verdict: `docs/release/v240/REMAINING-WORK-AUDIT.md`, RELEASE_BLOCKED. Game source0f85357303bf2bca809e6ff32b490769e1d3f836 is unchanged. All campaigns ended.

**中文：** 下一步設計V6開局投資／集中防禦，勿再次重跑同一失敗策略。延後科技必須正式Start，因舊存活快照已第二時代，禁止退款／灌資源。若要接續存活樣本，使用 `docs/evidence/v240-remaining-audit/v510-continuation/save-snapshot.json`，SHA256 `e07a7b23206c206556ade0ec44a4f1cb85dbdd00e4eee5e80217ee78315bd8ba`；後續V5.13快照已戰敗。停止原因是執行窗口，不是額度百分比。所有權於推送後釋放，以遠端ownership.json為準。

**English:** Next designV6opening investment/concentrated defense; do not rerun the same failed policy. Delayed technology requires native Start because old living saves are already age2; no refunds/resource injection. For a living continuation use `docs/evidence/v240-remaining-audit/v510-continuation/save-snapshot.json`, SHA256 `e07a7b23206c206556ade0ec44a4f1cb85dbdd00e4eee5e80217ee78315bd8ba`; laterV5.13saves are defeated. Stop reason is execution window, not quota percentage. Ownership is released after push; remoteownership.json is authoritative.

---

## 歷史接續摘要 / Historical continuation summaries

## 最新安全接續點 / Latest safe resume point

**中文：** V5.7、V5.8及V5.9於第三波自然戰敗，不能推論 Normal 無法通關。V5.10僅完成30.53秒開局檢查：8村民、第二時代、7軍事人口、兩間初始房屋、射箭場施工中，木材212.01。八項策略測試通過。完整十波及 New Game+ 尚未通過。遊戲來源仍為 `0f85357303bf2bca809e6ff32b490769e1d3f836`，本輪只修改自動玩家與證據。

**English:** V5.7, V5.8 and V5.9 naturally lost at wave three; this does not establish that Normal is unwinnable. V5.10 completed only a30.53-second opening check:8workers, age2,7military, two initial houses, a range under construction and212.01wood. Eight policy tests passed. Full ten-wave and New Game+ acceptance remain incomplete. The tested game source remains `0f85357303bf2bca809e6ff32b490769e1d3f836`; this round changed only the automated player and evidence.

**中文：** 下一步由 `docs/evidence/v240-v55-economy/v510/save-snapshot.json` 繼續1× Normal，原生戰爭管家開啟。快照 SHA256：`fac53498b0379a8f6ef35b390f2b30ba4c09275b1f9854b02256622e689d576f`。本次因執行窗口結束保存；沒有正在執行的戰役。保留低FPS、Save/Load非確定性、性能FAIL與硬體待測。跨對話傳送不可用，不宣稱送達。

**English:** Next, continue `docs/evidence/v240-v55-economy/v510/save-snapshot.json` at1× Normal with the native army steward enabled. Snapshot SHA256: `fac53498b0379a8f6ef35b390f2b30ba4c09275b1f9854b02256622e689d576f`. This checkpoint ends the execution window; no campaign remains active. Low-FPS, Save/Load nondeterminism, performance FAIL and hardware-pending issues remain. Cross-thread delivery is unavailable and is not claimed.

BILINGUAL_DOCUMENTATION_REQUIRED = true

---

# 目前接續狀態 / Current Handoff

`ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md`
`BILINGUAL_DOCUMENTATION_REQUIRED = true`

**目前接續繁體中文：** 本輪以真正最新遠端 e00ce53 接續，並建立 V1–V4 根因對照。自然操作發現資源選取 TypeError，已修於 `0f85357303bf2bca809e6ff32b490769e1d3f836`，四資源／四語原生選取與 SaveContinue 通過。V5.4修復後仍第四波戰敗、無瀏覽器錯誤；缺食物但木材／黃金富餘，先修自動玩家資源／軍費／科技預算，不改 Normal。原生撤退限定驗證通過，尚未自然全戰役驗證。所有測試程序已停止；本輪因執行窗口安全保存。完整十波與自然 New Game+ 仍未通過；不要把任何受控 Fixture當自然通關。最新索引 `docs/evidence/v240-v5-playability/REPORT.md`。V5.4最終快照已戰敗，不可誤當存活接續。

**Current English:** Resumed from actual latest remote e00ce53 and compared V1–V4 causes. Natural input exposed a resource-selection TypeError, fixed in `0f85357303bf2bca809e6ff32b490769e1d3f836`; native selection/SaveContinue passed across4resources/locales. Post-fix V5.4 still lost at wave4 without browser errors; food shortage despite wood/gold surplus points first to policy allocation/reinforcement/technology budgeting, not Normal-stat changes. Native withdrawal passed scoped input verification, not full-campaign testing. All test processes are stopped; safely checkpointed for this execution window. Ten-wave and natural New Game+ acceptance remain incomplete; never substitute controlled fixtures. Latest index: `docs/evidence/v240-v5-playability/REPORT.md`. V5.4's final save is defeated, not a living continuation.

## 先前快照觀察（歷史，非最新狀態） / Earlier snapshot observations (historical, not current)

**最新繁體中文：** 本輪永久雙語規範已整合。V5 180秒試跑自然完成第一波並到第二波，第二時代與8間房屋已完成，但最終村民為0，存活目標 FAIL。市鎮中心仍存活，最新完整快照在 `docs/evidence/v240-bilingual-v5/pilot/save-snapshot.json`；SHA-256 見相鄰 `verification.json`。原生 Continue 接續與錯誤雜湊拒絕均已測試；嚴格確定性未通過。下一輪以此 V5 存活戰役為準，先處理村民損失，不從 V4 戰敗狀態恢復。完整十波／自然 New Game+ 仍 NOT_PASSED。

**Latest English:** The permanent bilingual policy is integrated. V5's180-second pilot naturally completed wave1 and entered wave2, reaching age2 and8houses, but ended with0workers: worker-survival goal FAIL. The Town Center remains alive; the latest complete snapshot is `docs/evidence/v240-bilingual-v5/pilot/save-snapshot.json`, with SHA-256 in the adjacent `verification.json`. Native Continue and incorrect-digest rejection were tested; strict determinism has not passed. Continue this living V5 campaign next, prioritize worker losses, and do not restore V4's defeated state. Full ten-wave/natural New Game+ acceptance remains NOT_PASSED.

**繁體中文：** 有效開發分支為 `codex/riftwatch-v240-game-first`，本輪開始前已核對遠端 `f2438d965a7bd86faf2baebd46de69a06ed7d7c2`。遊戲來源為 `a5a538d287b9c29951a83ebede5431db9fce7dc7`。舊歷史段落中的 Strategy 分支限定敘述不代表目前未整合；本分支已採用 v2.4.0 與最新雙語規範。每次恢復仍須重新查詢最新遠端及 Task Ownership。

**English:** The active development branch is `codex/riftwatch-v240-game-first`; its remote was verified as `f2438d965a7bd86faf2baebd46de69a06ed7d7c2` at the start of this turn. Game source is `a5a538d287b9c29951a83ebede5431db9fce7dc7`. Historical Strategy-branch-only statements below do not describe current adoption: this branch has adopted v2.4.0 and the latest bilingual requirement. Re-query current remote refs and Task Ownership on every resume.

**繁體中文：** Seed 地圖、難度與 New Game+ 已有限定本地驗證；自然十波仍未通過。V1 第五波戰敗；V2 第四波工具中斷；V3、V4 第四波戰敗，V4 有實際第二時代研究。V4 最終快照為戰敗診斷資料，不能當成存活戰役接續。保留低 FPS 時鐘、嚴格 Save/Load 非確定性、建築材質效能 FAIL、自然 Rift Prototype 未重現與 `HARDWARE_TEST_PENDING`。

**English:** Seed maps, difficulty, and New Game+ have scoped local verification; natural ten-wave acceptance has not passed. V1 lost at wave5; V2 had a harness interruption at wave4; V3 and V4 lost at wave4, with actual age2 research in V4. V4's final snapshot is defeated-state diagnostic evidence, not a living campaign continuation. Preserve low-FPS clock issues, strict Save/Load nondeterminism, the building-material performance FAIL, the unreproduced natural Rift Prototype crash, and `HARDWARE_TEST_PENDING`.

**繁體中文：** 下一步為以 V4 原始資料改善 V5 合法玩家策略，再繼續自然十波與 New Game+；不能改 Normal 數值、灌資源、跳波或將受控勝利 Fixture 當自然通關。雙語遷移先處理目前接續摘要及新報告；以下歷史英語／簡體內容尚待逐步補譯，原始數據及結論保留。不得為翻譯重跑無關測試或擅自發布。

**English:** Next, use V4 raw evidence to improve the legal V5 player policy, then continue natural ten-wave and New Game+ acceptance. Do not change Normal statistics, inject resources, skip waves, or count controlled victory fixtures as natural wins. Bilingual migration starts with this current handoff and new reports; historical English/Simplified Chinese content below remains pending incremental translation, with original data and conclusions preserved. Do not rerun unrelated tests for translation or publish without authorization.

---

## 歷史交接封存（待逐步補譯） / Historical handoff archive (translation pending)

# CURRENT AUTHORITATIVE STRATEGY — v2.4.0 GAME FIRST

**ACTIVE STRATEGY:** [docs/STRATEGY-V2.4-GAME-FIRST.md](../STRATEGY-V2.4-GAME-FIRST.md)  
**Strategy publication commit (this independent branch):** `9a806169677ea28c07b80bb317f51f34feae5224`
**Effective:** User approved consolidated v2.4.0 and its developer-decision, tool/Skills and browser-visualization amendments.  
**Branch:** `codex/riftwatch-v240-authoritative-strategy`. This handoff is authoritative **within this branch**; downstream gameplay branches and the progress-feed have not yet been rebased/updated. A receiving Agent must reconcile ownership and explicitly adopt it rather than assume the changes were merged.

On next eligible resume: read the single Strategy file once, deduplicate and prioritize work, surface only material architecture/rules/tool authorization decisions to the user, then continue authorized GAME FIRST slices. **Try a genuinely user-viewable live browser session where supported; otherwise record real Chromium gameplay video plus timestamped game-state updates without blocking development.** Preserve v234 unpublished; v2.4.0 is next public Candidate and still requires explicit launch approval. Preserve old failures and protected git/OmGitHub/Pages boundaries.

---

# Strategy v2.3.0 handoff

`V231_HERO_SKILL_PREVIEW_PUSHED`. Branch `codex/riftwatch-v231-hero-skill-preview` has a verified remote checkpoint at `2d7699e712c614da1a36124bad4b7b408b8a3393`; application source is `5df177bee911b8f9251248115e6128aa92b7b563`, based on required preflight SHA `45435a323c729a28da1de454a3e53740fc9159f2`.

The hero vertical slice now shares production Mark radius `9` and Aegis radius `5` between gameplay and rendering, previews the selected range on command hover or keyboard focus, and adds a persistent gold ground ring/ticks/sigil so the commander is identifiable in a crowd. Focused and full Node tests are 109/109, all four locales retain 678 keys, and 8/8 real local Chromium artifact checks pass without Console, Page, or request errors. Evidence is in `docs/evidence/v231-hero-skill-preview/`; immutable recovery snapshot is `docs/recovery/v231/WORKTREE-RECOVERY.md`.

The reported Rift Prototype crash remains open and is still the P0 reproduction gap: the controlled real-UI boon path passes. Resume with a natural wave-end offer while recording seed, state, browser errors, and the precise input sequence. A separate specification decision is required before changing production hero stats or the GDD's Aegis radius `4`; this slice did not alter balance. Preserve public v228, main, Issue #17, OpenCode Checkpoints, historical FAIL, strict Save/Load failure, low-FPS clock loss, and `HARDWARE_TEST_PENDING`.

Actual quota percentage is unavailable and no authorized dispatcher is connected: `QUOTA_PERCENT_UNKNOWN`, `RESUME_READY_MANUAL_DISPATCH`.

## v232 Rift Prototype / Issue #18 checkpoint

Issue #18's code run succeeded but its publication lifecycle did not. The official App Tunnel targeted port 3000, while OpenCode QA used 8018/8019/8020; all twenty recorded deployment-registration callbacks returned HTTP 409 `This deployment was superseded`, no public-readiness log or Preview URL exists, and no deploy-only control is available to this actor. Do not equate the Actions success or local Chromium PASS with online Preview verification. A new official Resume/Continue execution requires separate approval.

Gameplay branch `codex/riftwatch-v232-rift-prototype` preserves application source `86704e1fe6d8ef356a6706c0218854ca6aa593b7` and complete evidence checkpoint `f57946fc0cbdb4c8b15f2b81d3f4473ef34dd6d1`. A real natural Chromium first wave reached boon without errors, but Rift Prototype was not among the three cards, so the reported natural crash stays `NOT_REPRODUCED`. The new dedicated awakening cue is locally verified: 110/110 Node and exact 28-file artifact Chromium spawn/cue/move PASS. Continue with an original player save/seed if available, additional natural campaigns, or a separate GAME FIRST visual/audio slice. Public v228, Issue #17, main, Checkpoints, low-FPS/SaveLoad FAIL, and HARDWARE_TEST_PENDING remain unchanged.

## v233 Issue #18 generation diagnosis / adaptive score

Issue #18 latest internal identity is run `40377196806`, attempt 1, generation 234, stage identity `40377196806:1`; OmGitHub exposes no separate Deployment ID. The twenty HTTP409 callbacks (generations5–221) are older generations within the same run/attempt. No second Worker, Actions run or GitHub Deployment was found. The official port3000 Tunnel registered and was publicly captured, but its Riftwatch page showed `PLAYTEST · BUILD BLOCKED` and the v228 label: the source root, not OpenCode's later valid immutable artifact on8019/8020, was bound to the official App Tunnel. No deploy-only repair interface is exposed. Resume is a new execution and remains unauthorized. See `docs/evidence/v233-omgithub18-preview/`.

GAME FIRST branch `codex/riftwatch-v233-dynamic-score` preserves application `f9d458ac5e578d4e1b6ce0f764aac844774f7fcf` and evidence checkpoint `a6a54ef7674e033432f4233694f87ff1303ad6b6`. It adds an adaptive procedural score for menu/prep/wave/Boss/boon/pause without external assets or gameplay/RNG changes. 111/111 Node and7/7 exact-artifact Chromium pass; real 48kHz stereo Opus prep/battle recordings are saved. Continue with natural campaign/Rift save reproduction or a representative visual/battle-alert slice. Preserve #17, Pages, main, Checkpoints, clock/SaveLoad FAIL and HARDWARE_TEST_PENDING.


## v233 source-switch preflight / battlefield silhouettes

Branch `codex/riftwatch-v233-visual-silhouettes` preserves application source `d989bb7236cb7e6bc4bee6892ff0fae9196bc2da` and evidence checkpoint `eb9d0acc4486fd8ede3136ac134b90d828e56dfa`. The #18 client Resume API sends only prompt/request_id and cannot enforce a branch or full SHA; its Issue marker still names the old upgrade-candidate branch. No Resume/Continue/new Issue was triggered. The minimum observed source-selecting path is one new isolated Issue against a frozen branch, with exact-SHA preflight and the generated 28-file artifact served on official port3000; separate authorization is required.

GAME FIRST adds distinct silhouettes for archer/skirmisher/Chu Ko Nu, militia/guard and knight/light cavalry/horse archer. 113/113 Node and 4/4 exact-artifact real local Chromium checks pass; screenshot and hashes are in `docs/evidence/v233-visual-silhouettes/`. This is AFTER_LOCAL, not OmGitHub or public Preview verification. Continue with civilization/building landmarks, battle alerts, and natural campaign/Rift sampling. Preserve #17, public Pages, main, Checkpoints, low-FPS/SaveLoad/history FAIL and HARDWARE_TEST_PENDING.

## v234 Playtest Candidate checkpoint

Branch `codex/riftwatch-playtest-v234` packages Build SHA `34873f76e8ad88d1f238210cfea87ff12f0fa587`; artifact/evidence commit `d4078fb6cf21db8a75bf69ec4f455cb6b279ada8` is remotely verified. ZIP SHA-256 is `6553da1178ede1cb0af4539b0851f617a2753082c978d4f05d26e3bf266b1b90`; canonical 28-file manifest SHA-256 is `3db2378a3c9fc6d986135213ef45a5e20ce3af46e419065c7cc0e95123cde71e`; the archive has31 hosting files. Compared with gameplay predecessor `055fb12c92e3d48945315937058f1423b732241c`, only the two Known Issues payloads changed and the other26 hashes match.

113/113 Node tests remain valid because the following candidate change is documentation-only. Real Chromium on the exact v234 artifact passed12/12 core playtest,7/7 input/Rally/Prototype,9/9 hero, and4/4 silhouette checks with zero Console/Page/request failures. Basic Save/Load and four locales pass; strict determinism, low-FPS clock, historical performance, natural Rift crash reproduction, full ten-wave stability and physical hardware remain open.

Publication is prepared but blocked pending explicit v234 Pages authorization. Plan: `docs/playtest/v234/APPROVAL-PLAN.json`. The proposed immutable URL is <https://good-comic.github.io/PlayGround/builds/34873f76e8ad88d1f238210cfea87ff12f0fa587/>. Current site branch remains `5b30bda085197cfa820a594224e2f6df929bf60d`; no Pages branch/root/configuration or existing full-SHA directory was changed.

## v2.4 GAME FIRST building-state checkpoint

Branch `codex/riftwatch-v240-game-first` adopts the authoritative `docs/STRATEGY-V2.4-GAME-FIRST.md` from `e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d`. Application source `fe7a54be7f362327da054c468f27366ac6f3fb2d` adds durable construction, damage, critical and ruined building presentations without simulation or balance changes; evidence commit `f4c474e8f26f42739e9f28ec73c23684c29c22d8` is remotely verified.

Focused Node tests pass 3/3. A fresh 28-file exact artifact passed 5/5 real Chromium checks after the real Start flow, followed by an explicitly controlled visual fixture. Screenshot, 3.76-second WebM, timeline and raw browser evidence are in `docs/evidence/v240-building-states/`. This is `AFTER_LOCAL`, not a public Candidate or ten-wave acceptance. Existing clock, strict Save/Load, performance, natural Rift crash and hardware gaps remain open. Next resume must revalidate task ownership and choose another independent GAME FIRST slice; no public v2.4 deployment is authorized.

## v2.4 generated and editable Seed checkpoint

Branch `codex/riftwatch-v240-game-first` preserves application source `5cbd58fbf4048c06ce964c44aa973bff2d5e23e0` and evidence checkpoint `229eb6df99b82740641f85e471563d8dbd98d315`. The menu now prefills a shareable Seed, retains manual edits across four locales, offers an explicit reroll control, and records map-generation version 1 in saves and Bug JSON. Prior version-1 saves without the optional generation field remain compatible.

Focused checks pass 9/9, locales pass 679 keys each, and the exact 28-file artifact passes 8/8 real Chromium checks. Seed `PLAYER-240` produced numeric Seed `3188753779` and world signature `d534c2770fb71870eeda6fce202b579354eccf4f4a470f39534a389261d2c79d` at initial Start, Save/Reload/Continue and a repeated Start. Evidence is in `docs/evidence/v240-seed-setup/`. This validates generated-frontier identity, not strict whole-simulation determinism. Continue with an independent 2.5D civilization/animation slice after ownership revalidation.

## v2.4 civilization visual-family checkpoint

Branch `codex/riftwatch-v240-game-first` preserves application `2a6dc068c3ee3fc59912cd7e76fb095a615e01f0` and evidence `0fb83fb0666b63aa678cc412e4f49c548f55be89`. All sixteen civilizations map to five data-driven non-color architecture/kit families. Focused tests pass 5/5 and the exact 29-file artifact passes 4/4 real Chromium checks across MNG/TEU/SAR/CHN/AZT with distinct frames, unchanged collision values and zero browser errors. Evidence is in `docs/evidence/v240-civ-visuals/`. This is a representative visual pipeline, not complete unique art for every civilization. Continue with direction-aware representative animation or landmark material expansion after ownership revalidation.


## v2.4 direction-aware animation checkpoint

Branch `codex/riftwatch-v240-game-first` preserves application `8e8fd67712431cf46cbcd2bae3f7285d33384e1a` and evidence `7b32f49cc469c0e830a140c519734f6144fb0411`. The procedural renderer now tracks eight movement/attack facings and visible walk, attack, hit and death-fall states without changing unit radii, pathfinding, damage, cadence or balance. Focused regressions pass 18/18; the exact 29-file artifact passes 5/5 real Chromium checks with all eight directions, representative militia/archer/cavalry attacks, three distinct non-reviving death frames and zero browser errors. Evidence is in `docs/evidence/v240-directional-animation/`. This is `AFTER_LOCAL`, not an authored atlas, natural ten-wave acceptance or public deployment. Next resume should revalidate ownership and continue an independent authored-frame/atlas descriptor, landmark-material, or Seed-driven terrain slice. Existing clock, strict Save/Load, performance, natural Rift crash and hardware gaps remain open.

## v2.4 Sprite Atlas recovery checkpoint

The prior environment lost its unpushed objects after application source `18d9947a14ab5aa4eaf6a023545df29bee4a7bcf` was safely pushed. A new worktree recovered from that remote commit, rebuilt the confirmed scale correction as `39767c4b58a37353b4f51bea13bd451a614fb2fc`, and verified it through an exact 31-file artifact: focused Node 20/20 and real Chromium 6/6 PASS with eight directions, five states, Canvas fallback and zero browser/request errors. Evidence is in `docs/evidence/v240-sprite-atlas/`. Original local-only SHA values are historical and must not be claimed remote.

`USER-APPROVED OVERRIDE` 2026-10-27 revokes the 10%/3% and all other percentage stop thresholds. Percentage is informational only; `QUOTA_PERCENT_UNKNOWN` never blocks work. Stop only on an actual platform refusal, context/execution exhaustion, environment/tool/auth failure, permission or ownership conflict. Continue with archer/cavalry atlas only after this recovery evidence and Progress Feed are remotely saved.

## v2.4 archer and cavalry atlas checkpoint

Application `b9a3d527787cd2384902f259dcec9bc695aa2d42` and evidence `833ec9517f603000355d9ed1cbbf0c17fa876a94` add independent longbow/quiver archer and horse/rider/lance light-cavalry atlases. Focused tests pass 15/15 and the exact 33-file artifact passes 7/7 real Chromium checks with eight directions per unit, live three-unit combat, hit/death states, Canvas fallback and zero errors. Evidence: `docs/evidence/v240-archer-cavalry-atlases/`. This is AFTER_LOCAL. Continue with representative civilization buildings or Seed-driven terrain after ownership revalidation; existing simulation, Save/Load, performance, Rift, ten-wave and hardware gaps remain.

## V240-LANDMARK-MATERIALS in-progress checkpoint

Source commit 61755f0 adds renderer-only five-family structural material layers: canvas ribs, masonry, arches, timber pillars/eaves, and stepped stone. Focused visual regression 6/6 PASS; Chromium screenshots/video, building-state overlay inspection and mixed-scene performance are NOT_TESTED. Status IMPLEMENTED / QA_PENDING, not LOCAL_VERIFIED. Resume with an exact artifact gallery containing house and barracks for MNG/TEU/SAR/CHN/AZT, inspect foundation/scaffold/damage/critical/ruin, and compare before/after rendering on the same mixed scene. Do not promote until those gates pass. After this slice prioritize terrain, rules/settings, difficulty, natural ten-wave campaign and New Game+ over further art expansion.


## V240-LANDMARK-MATERIALS QA checkpoint

Original artifact ffc201e visually failed because materials floated on roofs. Repair d07e4f1634d730a163f607800d1ed9a305ebedef projects them onto both wall planes. Final application 9fc6db69227432b162651017819e23cbd4b9153f is payload-identical after a rejected cache experiment. Evidence d9aaab69293590007c60d7db69ebb9f4a24ecd6d: 7/7 Node, 10/10 Chromium state checks, direct five-family visual review, footage, three before/after raw performance repeats. Visual/state LOCAL_VERIFIED; absolute cloud frame gates FAIL and renderer JS median increases21.4%, so full QA is NOT_ACCEPTED. See docs/evidence/v240-landmarks/REPORT.md. All failed samples and rejected optimization retained. No further pure-art expansion: next read-only pre-game rules summary, then Seed/terrain accessibility and natural campaign/difficulty/New Game+. Existing clock, deterministic Save/Load, Rift, hardware and ten-wave gaps persist.


## V240-SETUP-RULES verified checkpoint

Source 5ded54f43212116bdf966b537796849325c295bf, evidence 30c7fc4bc9356f7c1eb12f0dde1d459760b0a7a0: real pre-game rules dialog, 46/46 affected tests, four locales692 keys each, 17/17 real Chromium natural-UI checks at1280x720/130percent text. Queried selected FRK/TEU limits, correct Seed/terrain/ten-wave/Boss5+10/settings; Escape and Enter isolation; actual Start/selection/right-click movement/SaveReloadContinue/BugJSON. No state fixtures. See docs/evidence/v240-setup-rules/REPORT.md and video. LOCAL_VERIFIED only. Next is Seed/terrain route accessibility and natural campaigns; not more art. Landmark visual repair passes but performance QA remains FAIL, and all historical simulation/SaveLoad/Rift/hardware gaps remain.


## Continuous Gameplay Milestone checkpoint

ACTIVE STRATEGY: `docs/STRATEGY-V2.4-GAME-FIRST.md`. Latest saved evidence c40e42f57bc1c23258cba59c8f463530b44dfd74; application `5f63a939f64f3d3d40c66abfd4af655732dae7b0`. Map generator2 and native river crossing pass, historical v1 maps preserved. Approved difficulty and optional three-card NG+ implemented;95 affected tests pass. NG+ browser proof uses a clearly labelled controlled completed-victory fixture, not a natural win. Natural policyV1 lost wave5; policyV2 is actively running with native army Attack-Move/Rally. Do not launch a duplicate campaign while it runs. Source/recordings in `docs/evidence/v240-map-generation`, `v240-difficulty`, `v240-new-game-plus`, `v240-campaign-natural`. Standard-opening material risk sample did not reproduce blocking overhead but original mixed-scene performance FAIL remains. Whole milestone incomplete; keep continuous work, save at boundaries, no public deploy, no arbitrary quota percentage stop. Cross-thread delivery unavailable.


## Final continuous-milestone recovery point

Application a5a538d287b9c29951a83ebede5431db9fce7dc7; newer source-pinned evidence through 3b6a5b87fdaf2fe6468003e73dfeb32b6c4e9d8a plus this final snapshot. All natural processes have stopped: V1 defeat5; V2 harness timeout4; V3 defeat4; V4 age2 then defeat4. No natural ten-wave or NG+ PASS. V4 final save is a DEFEATED snapshot for diagnosis, not an alive continuation. STOP_REQUESTED arrived after defeat. Read docs/evidence/v240-campaign-natural/REPORT.md before choosing a new bounded real strategy. Do not repeat unrelated history or falsely infer Normal impossible from these policies. Latest UI/Save features have scoped native evidence; victory recovery uses a controlled fixture. Execution-window stop, not a weekly percentage threshold or claimed quota refusal. Cross-thread send interface unavailable; structured handoff persists in Git. Branch owner is released after final push; next agent must query the dedicated ownership ref (snapshot ownership observation precedes release). All known clock/SaveLoad/performance/Rift/hardware gaps preserved. Continue actual gameplay milestone, no publication.
