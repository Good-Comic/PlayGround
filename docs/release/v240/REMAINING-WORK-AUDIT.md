# v2.4.0 剩餘工作與發布判定 / Remaining work and release readiness

**中文：** 盤點基準為實際遠端 `4aff2c38b3cfaa21efc33e9b0e773975404efdd8`，遊戲來源 `0f85357303bf2bca809e6ff32b490769e1d3f836`。本清單對照 ACTIVE STRATEGY §3–13、`docs/gdd/SOURCES.json` 所記Issue8／11等快照及現有證據，不重跑歷史測試。完整GDD套件仍不完整，不能由資料存在推論16文明規則完全符合。下列 VERIFIED 均以「限定範圍」為準，不代表全產品或公開網站驗收。

**English:** Audit baseline is actual remote `4aff2c38b3cfaa21efc33e9b0e773975404efdd8`, with game source `0f85357303bf2bca809e6ff32b490769e1d3f836`. This list compares ACTIVE STRATEGY sections3–13, Issue8/11 and other snapshots in `docs/gdd/SOURCES.json`, and existing evidence without historical retests. The full GDD package remains incomplete; data presence does not establish complete16-civilization conformity. VERIFIED below is strictly scoped, not whole-product or public-site acceptance.

|ID|項目 / Item|狀態 / Status|證據 / Evidence under docs/evidence|缺口與範圍 / Gap and scope|
|---|---|---|---|---|
|RTS-01|經濟、建造、生產、科技、Rally與操作 / Economy, construction, production, technology, Rally and controls|`IMPLEMENTED_QA_PENDING`|v240-resource-selection/REPORT.md; v240-setup-rules/REPORT.md; v240-v55-economy/REPORT.md|限定原生操作已驗證；完整戰役補兵、食物與生存未通過 / Scoped native inputs verified; full-campaign reinforcement, food and survival not passed|
|AI-01|導航、重新索敵、姿態與戰術指令 / Navigation, retargeting, stances and tactical orders|`IMPLEMENTED_QA_PENDING`|v228-candidate/REPORT.md; v227-candidate/REPORT.md|窄道修復、群組與指令有定向證據；不可推論所有地圖／十波可靠 / Directed narrow-path, group and order evidence does not certify all maps or ten waves|
|CIV-01|16文明、特色兵種與英雄 /16 civilizations, special units and heroes|`IMPLEMENTED_QA_PENDING`|v240-civ-visuals/REPORT.md; v231-hero-skill-preview/REPORT.md|資料與五視覺家族存在；未完成16文明逐一自然戰役、英雄與訓練差異驗收 / Data and five visual families exist; per-civilization natural campaigns, hero and training coverage incomplete|
|BOSS-01|Boss增援與波次 / Boss reinforcements and waves|`IMPLEMENTED_QA_PENDING`|v240-campaign-natural/REPORT.md; v240-new-game-plus/REPORT.md|既有邏輯與限定測試不是自然第五／十波Boss通過 / Existing logic and scoped tests do not certify natural wave5/10 Boss completion|
|VIS-01|外部Atlas、八方向及五家族建築 / External atlases, eight directions and five building families|`VERIFIED`|v240-archer-cavalry-atlases/REPORT.md; v240-landmarks/REPORT.md|僅限定本地視覺與狀態驗證；不包含性能與16文明完整品質 / Scoped local visual/state verification only; excludes performance and full16-civilization quality|
|AUDIO-01|音效及動態BGM / Sound effects and adaptive music|`IMPLEMENTED_QA_PENDING`|v233-dynamic-score/REPORT.md|WebAudio與限定瀏覽器通過；長戰役混音、疲勞與全事件聽感未完整驗收 / WebAudio and scoped browser checks passed; long-campaign mix, fatigue and all-event listening incomplete|
|MAP-01|Seed、隨機地圖與可達性 / Seeds, randomized maps and reachability|`VERIFIED`|v240-map-generation/REPORT.md; v240-seed-setup/REPORT.md|限定40地圖480路徑與原生渡河通過；非任意Seed保證 / Scoped40-map480-path and native crossing checks passed; not an arbitrary-seed guarantee|
|MAP-02|戰術高度、坡道及通行成本 / Tactical elevation, ramps and terrain movement costs|`NOT_IMPLEMENTED`|v240-map-generation/REPORT.md|既有斜視地貌不等同可玩高度規則；不得默認已完成 / Existing isometric terrain is not playable elevation rules; do not presume completion|
|RULE-01|開局與遊戲中規則設定 / Pre-game and in-game rules|`IMPLEMENTED_QA_PENDING`|v240-setup-rules/REPORT.md; v240-difficulty/REPORT.md|Seed、文明、地貌、難度與查詢已驗證；Strategy全部Custom組合尚未完整實作／驗收 / Seed, civilization, biome, difficulty and query verified; full Strategy Custom combinations not fully implemented/accepted|
|DIFF-01|Easy／Normal／Hard / Easy, Normal and Hard|`IMPLEMENTED_QA_PENDING`|v240-difficulty/REPORT.md|Normal計畫不變、數量與準備時間及存檔有證據；三難度全戰役平衡未通過 / Unchanged Normal plans, counts, prep time and persistence verified; full campaigns/balance across difficulties pending|
|ROGUE-01|卡牌、敵軍及波次流程 / Cards, enemies and wave flow|`IMPLEMENTED_QA_PENDING`|v240-campaign-natural/REPORT.md; v240-new-game-plus/REPORT.md|原生卡牌與早期波次存在；十波完整流程與協同平衡未通過 / Native cards and early waves exist; full ten-wave flow and synergy balance not passed|
|CAMP-01|即時Normal自然十波 / Real-time Normal natural ten waves|`KNOWN_FAIL`|v240-v55-economy/REPORT.md; v240-v5-playability/REPORT.md|多次策略自然戰敗；不代表遊戲不可能通關。V5.10存活接續進行 / Multiple policies naturally lost; not proof of impossibility. Living V5.10 continuation underway|
|NGP-01|New Game+與多周目 / New Game+ and multiple cycles|`IMPLEMENTED_QA_PENDING`|v240-new-game-plus/REPORT.md|受控勝利入口、最多3卡、重置與側翼有證據；自然勝利到第二周目戰鬥未測 / Controlled victory entry, up-to3cards, reset and flank verified; natural victory into cycle2 combat untested|
|SAVE-01|嚴格Save/Load確定性 / Strict Save/Load determinism|`KNOWN_FAIL`|v228-clock/REPORT.md; v240-new-game-plus/REPORT.md|可操作存讀不等同暫態完整確定性；需獨立修復 / Operational saving/loading is not full transient-state determinism; separate repair required|
|CLOCK-01|低FPS模擬時間 / Low-FPS simulation time|`KNOWN_FAIL`|v228-clock/REPORT.md|0.05秒截斷丟失時間；原型未正式替換，不能由rAF通過推論正確 /0.05s clipping loses time; prototype not promoted, rAF success does not certify correctness|
|PERF-01|混合建築渲染 / Mixed-building rendering|`KNOWN_FAIL`|v240-landmarks/REPORT.md; v240-standard-render/REPORT.md|繪製JS中位數+21.4%保留FAIL；短正常開局未見阻斷，不等同硬體性能PASS / Median draw JS+21.4% remains FAIL; short normal opening showed no blocking regression, not hardware PASS|
|RIFT-01|自然裂界原型當機 / Natural Rift Prototype crash|`BLOCKED`|v232-rift-prototype/REPORT.md|NOT_REPRODUCED；缺少玩家特定存檔／觸發證據，受控正常不是修復 / NOT_REPRODUCED; missing player-specific save/trigger evidence, controlled success is not a fix|
|HW-01|中階PC驗收 / Mid-end PC acceptance|`BLOCKED`|v240-standard-render/REPORT.md|HARDWARE_TEST_PENDING；雲端SwiftShader不是目標Windows GPU / HARDWARE_TEST_PENDING; cloud SwiftShader is not target Windows GPU|
|LQA-01|四語與雙語文件 / Four locales and bilingual documentation|`IMPLEMENTED_QA_PENDING`|v240-setup-rules/REPORT.md; v240-difficulty/REPORT.md|四語限定驗證有證據；全部畫面與舊文件雙語遷移仍未完成 / Scoped four-locale checks exist; all-screen LQA and legacy bilingual migration incomplete|
|BUILD-01|正式建置與版本追溯 / Reproducible builds and identity|`IMPLEMENTED_QA_PENDING`|v240-build-identity/REPORT.md; v240-resource-selection/REPORT.md|精確來源Artifact存在；新v2.4候選整體閘門未通過，不發布 / Exact-source artifacts exist; new v2.4 overall candidate gate not passed, no publication|
|EXT-01|500／1000單位與真3D /500/1000 units and full3D|`DEFERRED`|v240-standard-render/REPORT.md|前者保留歷史FAIL作長期研究，後者v3.0前不遷移；不阻斷正常玩法 / Retain scale FAIL as long-term research; no3D migration beforev3.0; neither blocks normal gameplay|
|FOG-01|Off／Tactical／Classic迷霧及完整編隊編輯 / Off/Tactical/Classic fog and full formation editor|`NOT_IMPLEMENTED`|../../GAMEPLAY-REQUIREMENTS.md|舊矩陣仍列待辦；程式已有群組／相對編隊不能等同完整編輯器與迷霧 / Existing groups/relative formations do not implement a full editor or fog modes|

## 優先級與發布 / Priority and publication

**中文：** P0為自然當機／Softlock與十波到二周目流程；P1為自動玩家資訊增益、低FPS時鐘、Save/Load暫態與性能風險；P2為未完整文明、設定與素材擴展。新行為必須先有最小重現及定向驗證，不能以改Normal、跳波或暫停輔助取代即時驗收。戰爭管家是正式付費生產輔助，須在測試記錄揭露；快照接續不是全新開局連續通關。

**English:** P0 covers natural crashes/softlocks and the ten-wave-to-cycle2 flow; P1 covers informative player-policy improvement, the low-FPS clock, transient Save/Load state and performance risk; P2 covers incomplete civilization, settings and asset expansion. New behavior requires minimal reproduction and targeted validation. Do not replace real-time acceptance with Normal changes, wave skips or tactical-pause assistance. The army steward is a native paid-production aid and must be disclosed; save continuation is not a fresh-start uninterrupted victory.

**中文：** 目前判定 `RELEASE_BLOCKED`（整體v2.4里程碑驗收，不代表遊戲完全不可玩）。十波與自然New Game+尚未通過，無法建議 `PUBLIC_PLAYTEST_READY_WITH_KNOWN_ISSUES`。可繼續內部Artifact與測試，但不宣稱 `INTERNAL_CANDIDATE_READY` 全閘門通過。不修改Pages、OmGitHub、main或公開入口；保留v234不發布與歷史不可變Build。

**English:** Current verdict is `RELEASE_BLOCKED` for overallv2.4 milestone acceptance, not a claim that the game is entirely unplayable. Ten waves and natural New Game+ have not passed, so `PUBLIC_PLAYTEST_READY_WITH_KNOWN_ISSUES` is not recommended yet. Internal artifacts and testing may continue without claiming all `INTERNAL_CANDIDATE_READY` gates. Do not change Pages, OmGitHub, main or public entry points; keepv234 unpublished and historical builds immutable.

## 尚待核對的明確GDD差異 / Explicit GDD discrepancies requiring reconciliation

**中文：** Issue8快照§核心規則要求第五／十波軍事人口階段上限150／240，現行 `militaryPopCap` 主要由建築容量與文明特例衍生；既有需求矩陣已將封頂調和列為待決，不應標為完整符合。英雄Aegis目前半徑5，GDD快照為4；現有技能預覽沿用正式行為而未改數值。這些屬 `IMPLEMENTED_QA_PENDING / SPEC_DECISION_REQUIRED`，需對照使用者後續批准與規則版本後再改，不能在測試中暗改平衡。

**English:** The Issue8 core-rule snapshot specifies military ceilings150/240 at waves5/10, whereas current `militaryPopCap` primarily derives from buildings and civilization exceptions; the existing requirements matrix already tracks ceiling reconciliation as unresolved. Aegis currently has radius5 versus4in the GDD snapshot; the preview preserved production behavior rather than changing values. These are `IMPLEMENTED_QA_PENDING / SPEC_DECISION_REQUIRED`: reconcile later approvals and rule versions before changing them, never silently alter balance during testing.
