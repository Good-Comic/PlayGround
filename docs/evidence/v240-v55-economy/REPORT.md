# V5.5 食物與生產預算 / V5.5 Food and Production Budget

`BILINGUAL_DOCUMENTATION_REQUIRED = true`

## 來源與先前證據 / Source and Prior Evidence

**繁體中文：** 本輪從已核對的遠端 `4b00c6834705f3ecfc6d0491daf505578b8e2276` 接續。V5.4 第四波自然戰敗時，食物2.17、木材740.76、黃金227.22，且經濟人口為0。這不證明 Normal 無法通關；本輪先修自動玩家的勞動配置與預算，不改遊戲數值。資源選取 UI 修復的精確遊戲來源仍為 `0f85357303bf2bca809e6ff32b490769e1d3f836`，34檔本地 Artifact；沒有公開部署。

**English:** Resumed from verified remote `4b00c6834705f3ecfc6d0491daf505578b8e2276`. V5.4's natural wave4 defeat ended with2.17food,740.76wood,227.22gold and0economic population. This does not prove Normal unwinnable. This iteration first corrects player labor allocation/budgeting without changing game values. Exact game source remains resource-selection UI fix `0f85357303bf2bca809e6ff32b490769e1d3f836`, served as a34-file local artifact with no public deployment.

## 本輪策略變更 / Policy Changes

**繁體中文：** 玩家經濟目標由固定8人改為依波次增加：第一波8人，每波增加2人，最高22人，仍使用原生訓練與正常人口限制。約一半勞動目標為食物；過量採木、採金及採石工可透過原生命令重新分配。先保留第二時代的實際成本；第二時代後，只有第五波以後或至少12軍事人口時才優先保留第三時代成本，避免補兵長期停擺。此處都是玩家決策，不是修改 Normal 的成本或人口。

**English:** The player economy target grows from8workers at wave1 by2per wave, capped at22, through native training and normal population checks. Roughly half the labor target is food; excess wood/gold/stone workers can be reassigned with native commands. Reserve actual age2 costs first. Once in age2, prioritize age3 reserves only from wave5 or with at least12military population so early reinforcements are not indefinitely blocked. These are player decisions, not changes to Normal costs or population.

## 驗證範圍 / Verification Scope

**繁體中文：** 四項定向 Node 測試通過，涵蓋無村民恢復、預算不足、隊列人口、過量木材但食物短缺，以及低兵力第二時代不應扣住第三時代資源。接著從真實 Start 開始新一輪 Normal／TEU／steppe／MILESTONE-NORMAL，使用正式1.5×設定。採集、撤退、Guard、Rally、訓練與科技均由原生 UI 操作；沒有資源／單位／時間／波次注入。試跑需以實際人口、資源、戰鬥與勝敗判定，不以工具退出碼代替。若十波自然勝利，才進行原生 New Game+ 選卡及第二周目側襲驗證。

**English:** Four directed Node tests passed, covering zero-worker recovery, affordability, queued population, wood surplus with food shortage, and avoiding age3 reserves during low-army age2. A fresh natural Normal/TEU/steppe/MILESTONE-NORMAL run then starts through the real Start UI at the supported1.5×setting. Gathering, withdrawal, Guard, Rally, training and technology use native controls without resource/unit/time/wave injection. Judge actual population, resources, combat and win/loss, never the process exit code alone. Only a natural ten-wave win enables native New Game+ card selection and cycle2 flank acceptance.

**繁體中文：** 本文件不是完整十波 PASS。既有低 FPS 時鐘、嚴格 Save/Load 非確定性、性能 FAIL、Rift Prototype 未重現及 HARDWARE_TEST_PENDING 全部保留。來源、工具雜湊、原始操作與錄影必須與本輪結果一起保存。

**English:** This document does not claim ten-wave PASS. Preserve low-FPS clock issues, strict Save/Load nondeterminism, performance FAIL, unreproduced Rift Prototype crash and HARDWARE_TEST_PENDING. Save source identity, harness hash, raw actions and video with this cohort's result.

## V5.5 觀察與 V5.6 接續 / V5.5 Observation and V5.6 Follow-up

**繁體中文：** V5.5 在第三波主動安全保存，結果為 BOUNDED_SAMPLE_INCOMPLETE，不是戰敗或通關；當時村民為0，存活目標仍 FAIL。原生撤退有成功紀錄，但反覆對已回城村民重新下 Stop／回城，以及對無需改派的工人重新選取，耗費了操作時間。原始結果、完整狀態與操作保留，不能把有成功指令等同於村民已獲保護。

**English:** V5.5 was intentionally checkpointed during wave3 as BOUNDED_SAMPLE_INCOMPLETE, neither defeat nor victory. It had0workers, so survival still FAILED. Native withdrawals were recorded, but repeatedly stopping/returning already-sheltered workers and reselecting workers needing no reassignment consumed input time. Preserve the original result, complete state and actions; successful commands do not establish successful worker protection.

**繁體中文：** V5.6 為新的完整正常開局，不把舊失敗存檔誤當新成功。移除上述重複操作，優先建造射箭場，用實際木材／黃金訓練弓兵，並用正式 Shift+A 對靠近市鎮中心的攻城槌下 Attack-Move；其餘部隊仍用 Guard／Rally 集結。所有建造與訓練都由原生 UI 接受並扣款，未修改 Normal。第一波觀察為市鎮中心滿血、村民8人，只有限定觀察；後續波次與 New Game+ 尚待結果。

**English:** V5.6 is a fresh full normal start, not a relabelled failed save. It removes those redundant inputs, prioritizes an Archery Range, trains archers with actual wood/gold, and uses official Shift+A Attack-Move against rams near the Town Center; other troops regroup through Guard/Rally. All construction/training uses native UI acceptance and payment without changing Normal. Wave1 observations showed full Town Center health and8workers, a scoped observation only; subsequent waves and New Game+ still require results.

## 後續根因與版本 / Further Causes and Revisions

**繁體中文：** V5.6 是 Stop 按鈕逾時的工具中斷，非戰敗；V5.7 從該存檔接續後第三波戰敗。V5.8 改用正式1×即時設定並區分 Attack-Move 集結與右鍵攻城槌的直接集火，仍第三波戰敗。成功下達 Attack-Move 不等於部隊實際鎖定指定攻城槌；新紀錄核對 manualAttack 與目標 ID。這些結果都保留，不能宣稱即時 Normal 可玩性已通過。

**English:** V5.6 was a harness interruption from a Stop-button timeout, not defeat; V5.7 continued that save and lost at wave3. V5.8 used the standard1×real-time setting and distinguished Attack-Move regrouping from direct right-click siege focus, but also lost at wave3. Accepted Attack-Move does not prove a specific ram was targeted; new logs check manualAttack and target IDs. Preserve all outcomes without claiming real-time Normal playability acceptance.

**繁體中文：** 另建立可重現的策略錯誤測試：食物僅2但木材500、黃金227時，舊配置仍先採木，測試先 FAIL 後修復為採食物。同時修正6名村民卻要求3食物＋2木材＋2黃金的不可行配額；新配額為3／1／2，對0–22人均驗證總配額不超過可用人數。七項定向測試通過。建造中的村民不被一般採集改派打斷，已付款但未完成的建築可用原生右鍵續建。

**English:** A reproducible policy test showed that with only2food but500wood/227gold, the old allocation still chose wood; it failed before the fix and now chooses food. Another fix removes infeasible quotas of3food+2wood+2gold for only6workers; the new allocation is3/1/2, with total quotas checked against available workforce for0–22workers. Seven directed tests passed. Routine gathering reassignment excludes builders, and unfinished paid structures can resume through native right-click input.

**繁體中文：** V5.9 正以新正常開局測試：1×即時、手動經濟加遊戲原有的軍事管家。軍事管家由原生 Pause 選項啟用，仍照遊戲規則付費與受人口限制；不是注入單位。此為新的策略配置，與舊的關閉管家樣本分組，不回溯更改失敗。尚未採用戰術暫停輔助模式；完整十波與自然 New Game+ 仍等實際結果。

**English:** V5.9 is a fresh normal-start test at1×real time with manual economy and the game's existing war steward. The steward is enabled through native Pause options, pays normal costs and obeys population limits; it is not unit injection. Record this as a distinct policy configuration rather than relabelling previous steward-off failures. Tactical pause assistance has not been adopted; full ten-wave and natural New Game+ acceptance still require observed results.


## 最新安全接續點 / Latest safe resume point

**中文：** V5.7、V5.8及V5.9於第三波自然戰敗，不能推論 Normal 無法通關。V5.10僅完成30.53秒開局檢查：8村民、第二時代、7軍事人口、兩間初始房屋、射箭場施工中，木材212.01。八項策略測試通過。完整十波及 New Game+ 尚未通過。遊戲來源仍為 `0f85357303bf2bca809e6ff32b490769e1d3f836`，本輪只修改自動玩家與證據。

**English:** V5.7, V5.8 and V5.9 naturally lost at wave three; this does not establish that Normal is unwinnable. V5.10 completed only a30.53-second opening check:8workers, age2,7military, two initial houses, a range under construction and212.01wood. Eight policy tests passed. Full ten-wave and New Game+ acceptance remain incomplete. The tested game source remains `0f85357303bf2bca809e6ff32b490769e1d3f836`; this round changed only the automated player and evidence.

**中文：** 下一步由 `docs/evidence/v240-v55-economy/v510/save-snapshot.json` 繼續1× Normal，原生戰爭管家開啟。快照 SHA256：`fac53498b0379a8f6ef35b390f2b30ba4c09275b1f9854b02256622e689d576f`。本次因執行窗口結束保存；沒有正在執行的戰役。保留低FPS、Save/Load非確定性、性能FAIL與硬體待測。跨對話傳送不可用，不宣稱送達。

**English:** Next, continue `docs/evidence/v240-v55-economy/v510/save-snapshot.json` at1× Normal with the native army steward enabled. Snapshot SHA256: `fac53498b0379a8f6ef35b390f2b30ba4c09275b1f9854b02256622e689d576f`. This checkpoint ends the execution window; no campaign remains active. Low-FPS, Save/Load nondeterminism, performance FAIL and hardware-pending issues remain. Cross-thread delivery is unavailable and is not claimed.

BILINGUAL_DOCUMENTATION_REQUIRED = true


[錄影 / Recording](v510/campaign.mp4) · [實際錄影擷取 / Recorded frame](v510/recorded-final-frame.png) · [開局判定 / Opening receipt](v510/verification.json)
