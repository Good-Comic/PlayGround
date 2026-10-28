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
