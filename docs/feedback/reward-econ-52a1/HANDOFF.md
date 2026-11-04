# 採集預覽、自動補員與原生戰役驗證 / Allocation preview, automatic workers and native campaign

本輪完成兩項玩家可見改善：村務總管即時顯示套用後的真實採集目標比例；自動補員改為遵守正式村民費用與玩家預留，移除另一個不可設定的 70 食物門檻。正式村民仍是 50 食物、9 秒，沒有修改單位數值、卡池、波次、傷害或遊戲 RNG 演算法。

Two player-facing changes are complete: the steward previews effective gathering shares before Apply, and automatic worker training respects native cost and configured reserves instead of an additional hidden 70-food threshold. Villagers still cost 50 food and take nine seconds. Unit attributes, boon pools, waves, damage and RNG algorithms are unchanged.

## 來源與權限 / Source and ownership

- Base: `e9329ee48c64b1d1584cba0a7a069022354ddae9`
- Branch: `codex/riftwatch-reward-econ-52a1`
- Task: `ECONOMY-REWARD-52A1`; execution: `codex-reward-econ-52a1-20261104`
- Claim: version 251; receipt `45232ea6fc28c6c027676bc2a576f2af9b50ea7d`
- Latest game/build source: `f078c418be145f8c4d797f9b54224677fb16039b`
- Preview acceptance/natural waves two–three: `fa3159cdb208061908be1560f9fe3dcee43d0729`
- Japanese wording verification: `33a553b4d94cc5debd8eed4c90161803ac45c00e`
- Ownership release is a separate version-checked publication after this report; read live ownership before any further writes.

已核對遠端、乾淨工作區、單一工作樹、現行 Strategy 第17節及前輪 Recovery/Handoff。本任務沒有沿用前輪身份，也沒有接管仍 OWNED 的 RTS、PixelFX、RC 或交付任務。未修改 main、Pages、現有公開版本、舊 Issues、Immutable Playtest Build、其他 Owner Progress Feed、排程或工作流程。本文件及 Recovery 是本任務的進度紀錄，未越權發布共用 Feed。

Remote refs, clean checkout, the sole worktree, Strategy section17 and prior recovery/handoff were checked. This task uses a new identity without taking held RTS, PixelFX, RC or delivery tasks. Protected branches, public builds, old Issues, immutable playtests, other-owner feeds, schedules and workflows are untouched. This handoff/recovery records this task's progress without writing a shared feed owned elsewhere.

## 實際行為 / Actual behavior

`js/steward-ui.js` 復用正式 `gatherWeights`，在開啟面板與輸入／選項變更時更新小型 DOM 預覽，不掛在 Canvas 每幀繪製中。四個 40 顯示各 25%；全零顯示既有 34/32/22/12；食物優先顯示既有 64/16/12/8。文字說明這是目標而非即時人數，手動任務、搬運與可達性仍優先。未套用時不改設定；關閉捨棄，套用後沿用正式 Save/Load。

The steward UI reuses native gatherWeights and updates a small DOM preview on opening/input changes, outside Canvas frame rendering. Four values of40 yield25% each; zeros retain34/32/22/12 and food priority retains64/16/12/8. Help distinguishes targets from immediate headcounts and preserves manual/cargo/reachability priority. Edits remain unapplied until Apply and persist through native saves.

`js/game.js:updateAutoAids` 原先同時要求正式費用與食物≥70。Chromium 實測在零預留、約51食物時自動等待，手動按鈕可正常扣50並排隊。修復只刪除額外門檻，保留11模擬秒檢查、人口、村民目標、現有佇列、正式 canSpend 與研究預留。原有費用與研究規則未變；玩家仍可設定20食物預留得到等價緩衝。

Automatic worker training previously required both native affordability and food≥70. Chromium reproduced auto waiting at approximately51 food with zero reserve while the manual button paid50 successfully. The fix removes only that extra gate, retaining the11-simulation-second interval, population/worker targets, existing queues, canSpend and age reserves. Players can explicitly configure a20-food buffer; costs/research rules are unchanged.

## 測試矩陣 / Test matrix

| 項目 / Scope | 結果 / Result | 來源及限制 / Provenance and limits |
|---|---|---|
| 採集預覽及相關回歸 / Preview-related Node | 27 PASS | Intermediate source fa3159c |
| 自動補員修復前 / Worker regression before fix | 5 PASS, 1 FAIL | Native50-food affordability case fails |
| 最終定向回歸 / Final targeted Node | 54 PASS, 0 FAIL | Includes preview, workers, stewards, recovery, proposals, rotation, capacity, builder ownership and population; not a whole-history rerun |
| 正式構建及資源 / Formal build and assets | 150/150 SHA-256 PASS | Source f078c41; budget-hashes.json |
| 預覽 Chromium / Preview browser | 20 checks PASS | Source fa3159c; includes four languages×three sizes, no-Apply isolation, native Save/Load and wave two |
| 日文及最終繁中 / Japanese and final Traditional Chinese | PASS | Corrected Japanese balanced wording at33a553b; latest f078c41 desktop capture |
| 50食物自動補員 / Native-cost automatic worker | CONTROLLED PASS | Actual normal-speed automatic tick at11.2163sim sec, native50-food payment, one9-sec queue |
| 明確20食物預留 / Explicit20-food reserve | CONTROLLED PASS | Set using native planning UI; at51.0026food no queue or payment |
| 原生第二／三波 / Native waves two/three | NATURAL SAVED FLOW PASS | No injected units/resources/waves/speed; reward saves and keyboard claim retained |
| 原生第四波 / Native wave four | DEFEAT | Source f078c41,503.1803sim sec, seven workers, three waves cleared; no false victory |
| 自然十波／NG+ / Natural ten waves/NG+ | NOT_PASSED / NOT_TESTED | No new claim; prior controlled NG+ evidence remains scoped |

第二波在239.2739模擬秒清除，第三波在375.4858清除。第一波領取 war_banner，第二波原生鍵盤領取 citizen_arms，第三波原生鍵盤領取 deflecting_shields。這是從既有第一波存檔跨版本、分段接續的自然遊戲，不是一次不中斷的新局長跑。第四波戰敗如實保存，沒有清敵、跳波、注入資源或更改難度。所有完成的瀏覽器流程均無 page errors。

Waves two and three clear at239.2739 and375.4858 simulation seconds. Native claims select war_banner, citizen_arms and deflecting_shields. This is a segmented cross-version continuation of the prior native wave-one save, not one uninterrupted fresh campaign. Wave-four defeat is retained without clearing enemies, skipping waves, resource injection or difficulty changes. Completed browser runs report no page errors.

保留三類測試自身的失敗：新增 Node 測試首次漏設 DOM 夾具、QA 腳本語法錯誤；精確50食物假設漏算原生農田收入；第四波斷言誤以為持牌讀檔會保留取得順序。診斷證明原有 restore 按目錄排序已持牌，但候選順序與鍵盤領取正常；以卡牌集合驗證修正夾具，沒有修改遊戲來讓測試變綠。這不構成完整 Save/Load 嚴格等價 PASS。

Fixture/tool failures remain: missing DOM initialization and QA script syntax, an exact-food assertion that overlooked native farm income, and a claim assertion assuming acquisition-order preservation on load. Diagnosis shows existing restore catalogs owned cards while preserving offers and native keyboard claims. The assertion now checks card membership; the game was not changed to satisfy it. This does not certify strict full-state Save/Load equivalence.

## 效能、畫面及限制 / Performance, visuals and limits

最終前後對照見 complete-perf.json：每版每規模10次真實開啟面板至下一 RAF；100/200是地圖分散、暫停的總單位數，不是全同屏戰鬥。完整樣本秒數與 raw ms、heap 保留於 JSON。相同 seed、視口與軟體瀏覽器序列執行，修改後另編輯比例再關閉，模型時間／RNG／資源／偏好均不變。這不證明長戰鬥 FPS、無洩漏或性能改善；初次 perf.json 也保留，不以重測抹除變異。

The final matched complete-perf.json uses ten actual open-to-next-RAF samples per version/scale, with wall sample lengths, raw timings and heap values. Units are paused and spread over the map, not all-onscreen combat. Same seed/viewport/browser runs are serial; after-preview edits are discarded without changing time/RNG/resources/preferences. These short samples prove neither sustained combat FPS, absence of leaks nor a performance improvement; the first perf.json is also retained.


| 版本 / Version | 單位 / Units | P50 / ms | P95 / ms | 樣本秒 / Wall seconds | Heap bytes |
|---|---:|---:|---:|---:|---|
| before | 100 | 36.4 | 45.5 | 6.644 | 9614621 → 9348153 |
| before | 200 | 37.5 | 56.0 | 8.059 | 7174116 → 11736339 |
| after | 100 | 35.7 | 44.3 | 7.174 | 9285832 → 8114953 |
| after | 200 | 30.3 | 46.0 | 9.842 | 7377444 → 11522843 |

環境為 Linux Chromium154.0.8037.57、AMD EPYC9V74、四 CPU 配額、ANGLE Vulkan SwiftShader 軟體繪圖。不是 Windows Chrome/Edge 或實體 GPU 驗證。截圖與連續影片片段在 evidence；完整本地影片只記 SHA 與來源，未當作可下載交付物。片段為連續擷取，壓縮與時間範圍見 video-provenance.json。

Environment is Linux Chromium154.0.8037.57, AMD EPYC9V74, four CPU quota and ANGLE Vulkan SwiftShader software rendering. This is not Windows Chrome/Edge or physical-GPU certification. Evidence contains screenshots and continuous video excerpts; local-only full captures are recorded by hash/provenance rather than presented as downloadable artifacts. Excerpt ranges and compression are documented.

歷史低FPS時鐘、嚴格完整 Save/Load、自然第五波失敗、自然十波及自然NG+未通過、實體GPU與真人聽感缺口保持原狀；沒有宣稱 RC 或公開版因此完成全面驗收。

Historical low-FPS clock/strict full-state SaveLoad issues, prior natural wave-five failures, unpassed natural ten-wave/NG+ and hardware/audio gaps remain. This does not claim complete RC or public-version acceptance.

## 下一接續點 / Next continuation

下一項已授權工作：先以原生搬運中改派資源操作，核查採集人數顯示是否把攜帶資源與下一目標重複計數，再改善手動／自動／搬運狀態的可讀性。先復現、不改採集數值；重新核對 Ownership 並使用獨立任務。戰役可從 native-wave4-latest.json 的真實失敗前存檔接續，但不能將重試冒充本次自然勝利，也不反覆調策略只為製造十波PASS。

Next authorized work is to reproduce resource reassignment while carrying cargo, check whether displayed gathering counts double-count cargo and next target, and clarify manual/automatic/hauling status. Reproduce first without changing gathering values and acquire independent ownership. The real pre-defeat native-wave4-latest save supports continuation, with retries labelled honestly rather than recast as this run's victory or repeated policies chasing ten-wave PASS.

本輪完成兩項實作、相關驗證與戰役接續後主動在已保存檢查點結束，仍有可執行授權工作，故 STOP_REASON=AGENT_EARLY_STOP；並非額度或環境拒絕。QUOTA_PERCENT_UNKNOWN。AUTO_RESUME_AVAILABLE=false：本次送達已觀察，但未驗證排程設定、送達目標與可控制的後台恢復能力。

This turn voluntarily ends at a saved checkpoint after two implemented changes, related validation and campaign continuation while authorized work remains: STOP_REASON=AGENT_EARLY_STOP, not an invented quota/environment refusal. QUOTA_PERCENT_UNKNOWN. AUTO_RESUME_AVAILABLE=false: delivery was observed, but scheduler configuration/target and controllable background resumption remain unverified.

BILINGUAL_DOCUMENTATION_REQUIRED=true.
