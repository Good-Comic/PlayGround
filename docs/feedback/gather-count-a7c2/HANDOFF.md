# 採集人數與閒置釋放 / Worker allocation and idle release

本輪修復已重現的面板重複計數：村民攜帶食物、下一採集目標為木材時，原介面把同一人計入兩種資源。現在每名存活友軍村民只歸屬一種資源或「其他」，攜帶中的資源優先。新增村民總數、手動鎖定、未鎖定、攜帶與閒置人數；狀態可以重疊，但資源分類互斥。沒有改採集、搬運、手動優先、費用、傷害、AI、波次或 RNG 規則。

This fixes a reproduced display defect: a worker carrying food toward a later wood assignment counted in both resources. Each living player worker now belongs to exactly one resource or Other, with existing cargo first. Total/manual/unlocked/carrying/idle counts clarify overlapping status while resource buckets remain exclusive. Gathering, hauling, manual priority, costs, combat, AI, waves and RNG rules are unchanged.

接續改善釋放操作：按鈕顯示實際可釋放的「閒置且手動鎖定」人數，零人時停用。釋放後立即更新人數，並保留尚未套用的比例輸入。採集中、搬運中的手動村民仍保留鎖定；未鎖定不等於全域自動經濟已啟用。這是既有釋放規則的顯示與回饋改善，不新增控制權限限制。

The adjacent release improvement shows the actual number of idle manually locked workers and disables an empty action. Counts refresh after release without discarding unapplied ratios. Gathering/hauling workers retain manual locks. Unlocked does not imply globally enabled auto economy. This explains existing release semantics without adding research gates or changing control permissions.

## 來源及所有權 / Source and ownership

- Base/report checkpoint: `c0732bcc1513826b927a4d7cbe07b7e025be1154`
- Branch: `codex/riftwatch-gather-count-a7c2`
- Task: `GATHER-COUNT-A7C2`; execution: `codex-gather-count-a7c2-20261104`
- Claim version253, receipt `0924ad9ef4a2ec7e43c01ccbde68e5dc397e0832`
- Final game/build: `f344b61d841a64e6a24b927d19047b46fae0abdc`
- Initial allocation/natural-input evidence: `cc46632dfaec8064067efd508a163317311b9a5b`
- Baseline game: `f078c418be145f8c4d797f9b54224677fb16039b`
- Release is a separate CAS publication after the report push; always re-read live ownership before writing.

已核對乾淨單一工作樹、遠端 Ownership、Strategy 第17節、前輪 Recovery/Handoff/NEXT-TASKS、GDD 手動優先規則及最新 Feed。Feed `3bab370367258289db9075307f95163013e759fc` 是舊英雄進度，沒有取代較新的遊戲提交與本任務交接。本輪未接管其他 Owner、未假設其他瀏覽器程序已停，也未修改共用 Feed、main、Pages、RC、公開版本、舊 Issues、不可變構建或排程。

The clean sole worktree, remote ownership, Strategy section17, prior recovery/handoff/queue, GDD manual priority and latest feed were checked. Feed3bab370 describes older hero progress and does not supersede newer game commits. No held task was taken over, no unrelated browser was declared stopped, and shared feeds/protected branches/RC/public builds/old Issues/immutable artifacts/schedules are untouched.

修改為 `js/stewards.js` 新增純讀取 workerAllocation、`js/steward-ui.js` 使用互斥分類並更新釋放回饋、`js/locales.js` 四語說明與 `tests/worker-allocation.test.mjs`。統計只在開啟／重建面板與釋放動作時計算，不加入每幀 Canvas 工作；保留全部既有模擬程式。第二提交只增加可釋放閒置鎖定人數與按鈕狀態，因此可重用第一提交的實際採集／交貨證據；最終介面另行實測。

Changes add a read-only workerAllocation helper, consume it in steward UI, refresh release feedback, provide four-language explanations and focused regression tests. Counts run on panel rendering/release, outside Canvas frames, preserving simulation behavior. The second commit adds only eligible-idle count/button state, so the first commit's real gathering/delivery evidence remains valid; final UI is separately tested.

## 驗證矩陣 / Verification

| 項目 / Scope | 結果 / Result | 限制 / Limits |
|---|---|---|
| 原缺陷重現 / Original defect | REPRODUCED | Native orderGather while carrying food yields return state and wood next target; old panel displays food1/wood1 |
| 最終 Node / Final targeted suite | 38 PASS, 0 FAIL | Allocation, save/load, targets, reservations, proposals and previous economy cases; not all historical tests |
| 正式構建 / Formal build | 150/150 SHA-256 PASS | Final source f344b61; complete-hashes.json |
| 最終 Chromium / Final browser | 20 checks PASS | Before/after, four locales×three sizes, release eligibility/empty action, unsaved edits, native SaveLoad |
| 四語尺寸 / Locales and sizes | CONTROLLED PASS | zh-Hant/zh-Hans/en/ja;1366×900,900×600,390×844; dialog clipping bounds checked |
| 實際採集與滑鼠改派 / Real harvesting and mouse reassignment | NATURAL INPUT PASS | Fresh CHN seed GATHER-COUNT-NATURAL; no injected cargo/resources/units/times/waves |
| 原生存讀檔 / Native save/load | SCOPED PASS | Cargo assignment/manual status and display categories retained; not strict full-state equivalence |
| 自然十波／NG+ / Natural ten waves/NG+ | NOT_PASSED / NOT_TESTED | No new campaign completion claim |

實際操作在8.616模擬秒選中村民#14（食物2.02075），以滑鼠右鍵點擊可見木材#54。8.866秒面板顯示該村民攜帶食物、下一目標木材、return、手動鎖定；全體資源人數3/3/1/1、其他0，總數8。18.5989秒原生交貨後進入木材 gather，貨物歸零、鎖定仍保留。過程只有正常 UI 與滑鼠／鍵盤操作，沒有以 Fixture 冒充自然流程；完整影片與真實存檔均保存。

At8.616 simulation seconds, native mouse selection picks worker14 with2.02075 food, then right-clicks visible wood node54. At8.866 the panel observes food cargo, wood next target, return state and manual lock; global resource counts3/3/1/1 plus Other0 equal eight workers. By18.5989 native delivery completes and wood gathering begins with empty cargo and manual lock retained. This uses normal UI/mouse/keyboard only, with full continuous capture and native save retained, distinct from controlled fixtures.

初次新增 Node 測試為36 PASS/1 FAIL，原因是完整 snapshot 比較包含每次變動的 savedAt 牆鐘時間；修正夾具排除此元資料後37 PASS，再加釋放資格案例後38 PASS。原始失敗日誌以無損 gzip 保存並記 SHA，沒有刪測試、修改模擬或把此夾具問題當遊戲缺陷。所有完成的 Chromium 流程均無 page errors。

The first added Node run records36 PASS/1 FAIL because a full-snapshot assertion included changing savedAt wall-clock metadata. Excluding that metadata fixes the fixture:37 PASS, then38 after the release-eligibility case. The original failure is losslessly gzipped with its hash; no test was removed or simulation altered. Completed Chromium flows report no page errors.

## 效能與證據 / Performance and evidence

| 版本 / Version | 單位 / Units | P50 ms | P95 ms | 樣本秒 / Wall seconds | Heap bytes |
|---|---:|---:|---:|---:|---|
| before | 100 | 37.5 | 44.4 | 6.581 | 7131735 → 9463747 |
| before | 200 | 38.6 | 49.5 | 8.171 | 7055934 → 10303769 |
| after | 100 | 37.4 | 45.9 | 8.202 | 9690889 → 10658714 |
| after | 200 | 25.7 | 48.6 | 10.177 | 7153145 → 9423414 |

每版／規模10次真實面板開啟至下一 RAF，前後對照序列執行。100/200是暫停且分散地圖上的總單位數，不是全同屏戰鬥。修改後另編輯比例再關閉，資源／時間／RNG／總管設定保持不變。原始及最後一次 perf 均保留。短樣本不能推論長時間 FPS、洩漏不存在或性能改善。

Each version/scale uses ten native open-to-next-RAF samples, run serially.100/200 are paused units spread over the map, not all-onscreen combat. After-build edits are discarded without changing resources/time/RNG/preferences. Both initial and final performance runs remain. Short samples certify neither sustained FPS, leak absence nor improvement.

環境為 Linux Chromium154.0.8037.57、AMD EPYC9V74、四 CPU 配額與 SwiftShader 軟體繪圖。不是 Windows Chrome/Edge 或實體 GPU 驗證。完整前後及自然操作影片已納入本任務證據，來源、秒數與 SHA 見 video-provenance.json；未公開部署。歷史低FPS時鐘、嚴格 Save/Load、第四／第五波戰敗、自然十波與NG+及硬體／真人聽感缺口保持原狀。

The environment is Linux Chromium154.0.8037.57, AMD EPYC9V74, four CPU quota and software SwiftShader. It is not Windows Chrome/Edge or physical-GPU certification. Full before/after/natural videos are included with source/duration/hash provenance; nothing is publicly deployed. Historical low-FPS clock/strictSaveLoad issues, wave-four/five defeats, natural ten-wave/NG+ and hardware/audio gaps remain.

## 恢復及下一步 / Recovery and next step

下一項合法相鄰工作：在總管面板清楚顯示目前全域自動經濟／軍務開關，區分已儲存計畫與實際啟用狀態；沿用既有開關，不自行啟用、不改研究或數值。開始前需重新核對 Ownership 並認領獨立任務。

Next adjacent authorized work is to show current global auto-economy/military state clearly in the steward panel, distinguishing saved plans from active execution. Reuse existing toggles without silently enabling them, inventing research or changing values. Acquire independent ownership after revalidation.

本輪完成兩項相鄰改善與驗證後主動在安全保存點結束，仍有可執行授權工作，故 STOP_REASON=AGENT_EARLY_STOP，並非環境或額度拒絕。QUOTA_PERCENT_UNKNOWN；AUTO_RESUME_AVAILABLE=false：收到本次送達不等於已驗證排程設定、目標與可控制的後台恢復能力。BILINGUAL_DOCUMENTATION_REQUIRED=true。

This turn voluntarily ends at a saved checkpoint after two adjacent improvements and verification with authorized work remaining: STOP_REASON=AGENT_EARLY_STOP, not an invented environment/quota refusal. QUOTA_PERCENT_UNKNOWN; AUTO_RESUME_AVAILABLE=false because observed delivery does not establish verified scheduler configuration/target or controllable background resumption. BILINGUAL_DOCUMENTATION_REQUIRED=true.
