# 導航目標取樣誤判修正：十項以上任務交接

Task NAV-GOAL-D7B3A6E1；Agent codex-nav-goal-d7b3a6e1；Execution codex-nav-goal-d7b3a6e1-20261108。分支codex/riftwatch-nav-goal-d7b3a6e1，Ownership308認領收據03eeb063f60255338641388cecc69a03b6560f63。

有效父系689b28c4921a71056f5cda6fa6698e8ba9048a81，父系遊戲來源89360c81b8f821c4b03908a2043adf4302c0d847。新遊戲來源bbff168c7cc9ae9f4cbdd07b7dada06b9395aaee。本分支未繼承heading WIP 10a247325768ca4a7f5d70c0dba07eba0cf98d13；Git祖先查詢已確認，不把未通過候選當成安全基底。

## 十項以上實質工作與結果

1. **WIP因果診斷與採用決定**：重新交叉讀取八組已封存傷害與位置，手動傷害全相同；最後混編案例的第一筆位置差異採樣在20秒，#24有不同讓行／行走結果，自動命中少一次。採樣不是逐幀因果，不過足以維持DO_NOT_INTEGRATE_WIP；沒有重跑完整戰役。詳wip-decision.json及可重算工具。
2. **誤判不可達重現**：findPath的160個輔助圓形端點皆無效時，原程式直接unreachable；網格上卻可能有滿足正式range／goalTest的合法終點。修復前純導航案例3 FAIL／2 PASS，沒有用改數值製造成功。
3. **最小導航修復**：端點全落空時，檢查是否存在合法網格終點；存在才沿原A*搜尋。保持原碰撞、節點連接、搜尋預算及失敗分類。有限取樣不再否決正式到達條件。
4. **碰撞與預算反例**：沒有合法目標仍expanded=0不可達；有目標但被牆隔開仍不可達；maxNodes=0仍budget_exhausted，不能直接傳送到終點。任意goalTest未提供外框時，仍可處理圓形範圍外的正式判定，不擅改API語意。
5. **預檢成本優化**：圓形目標用已知包圍盒；建築由Game傳入能包含所有合法終點的外框。縮小預檢而不改目標。Node v24.19.0探索微基準中，封閉目標的每次predicate預檢從10000次降為25次；這是該外框工作負載，不是所有目標的通用上限。
6. **正式幾何接敵整合**：使用正式牆體尺寸、兵種半徑、傷害與原生命令，建立無建築重疊的窄道。前版端點0、判不可達、零命中；後版可走到合法網格，10模擬秒內6次正常1HP傷害。每步位置都通過Game.isWalkable。
7. **敵我共用導航**：敵軍單位也用同一stepToward抵達合法位置，碰撞與雙RNG不變；這是共用導航驗證，不是完整敵軍策略AI或自然敵軍戰役PASS。
8. **Save／Load**：原生snapshot／restore恢復浮點建築幾何、手動目標、位置及實際傷害結果，與未讀檔對照相同。不擴大為歷史嚴格全局存檔決定性問題已解決。
9. **暫停與RNG／命令狀態**：暫停不推進位置、冷卻及模擬時間；重複查路不消耗戰鬥／視覺RNG，不更換手動目標或候選命令。
10. **完整定向與密集回歸**：114／114 Node PASS；八組原密集隊形的實際命中名單、次數及失敗記錄逐項與安全父系相同。密集互卡歷史FAIL仍保留，這項修復不是全面解卡。
11. **正式構建與資源**：build_playtest.py以完整來源SHA產生168項資源，Chromium啟動前逐檔SHA-256核對PASS。沒有修改資源池或繞過完整性校驗。
12. **真實Chromium原生操作**：Chromium154／SwiftShader、1440×900。相同初始場景雜湊，F2原生選兵、滑鼠右鍵攻擊，命令確實接受。前版停在入口，unreachable、0命中；後版約5.5秒觀察內3次手動正常1HP命中，無失敗、無穿牆、無頁面錯誤。前後截圖已保存並檢視，不以命令送出代替有效傷害。

## 實際範圍與失敗保留

窄道是**浮點座標受控幾何**，雖使用正式建築尺寸且無重疊，不代表玩家正常格線施工會自然產生該場景，也不是原C-36精確重播或自然十波。未調整武器、護甲、移速、視野、碰撞半徑或其他平衡。這輪沒有新增玩法、美術或音效。

- geometry-before／after：最初場景未形成端點全落空，沒有重現；不能算修復前FAIL。
- geometry-enclosed：曾包含牆體重疊，排除為有效驗收；原始結果保留。
- geometry-valid：去除重疊後仍有一個合法取樣端點，未重現；witnesses記錄該端點。
- geometry-final：合法無重疊且160端點皆失效，才是有效前後場景；已提交fixture.mjs可重算。早期探索夾具的逐版原碼未完整封存，不能冒稱每份舊結果都可獨立重播。
- browser首輪漏存actor.id，命令報告誤判false；原生操作已有執行，但整份驗收不通過。補存ID後browser-corrected才是有效PASS，未刪除原FAIL。
- benchmark-before／after為未定版回退的探索成本；bounded-before／after才對應最終外框策略。微基準是100／200次查詢，**不是100／200單位戰鬥**，不提供FPS、GPU、記憶體或長期性能認證。原始時間含JIT與量測成本，不宣稱整體遊戲性能提升。

四語UI、NG+、自然戰役、實體Windows GPU與長時間穩定性本輪未重跑；正式UI未變。歷史FAIL／INCONCLUSIVE／NOT_TESTED不被本輪局部PASS覆蓋。沒有影片，不假稱已錄影。

## 保存與接續

原始JSON／TAP與截圖依manifest保存；較大JSON以確定性gzip無損壓縮，解壓校驗原始SHA通過，未刪除本機原始檔。所有管理動作不計入上述任務數。

下一項最高價值工作仍是密集隊形第一拒絕節點與實際讓行相依的最小案例；本輪只解決已證實的目標取樣誤判，不能宣稱C-36六名單位都能有效接敵。heading WIP繼續禁止整合。

未修改main、Pages、既有RC、Immutable Build、公開OmGitHub、Progress Feed、OpenCode Checkpoints或其他Owner資料。沒有公開部署或Release。轉送來源尚未更新／未驗證，不宣稱v2.1已改綁。

STOP_REASON：完成使用者要求的至少十項實質任務批次，保留未解決密集互卡。EXECUTION_DURATION：未量測。NEXT_AUTHORIZED_TASK：上述密集互卡最小案例。CHECKPOINT_SHA：以最終遠端收據為準。AUTO_RESUME_AVAILABLE：UNVERIFIED_NO_FORMAL_TRANSPORT_TOOL。QUOTA_PERCENT_UNKNOWN。
