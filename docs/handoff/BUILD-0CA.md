# 施工百分比更新 / Construction progress refresh

**繁體中文：** 獨立任務 `V240-BUILD-PROGRESS-0CA7E152BA21` 的遠端 Ownership 版本 222；`codex-idle-f3aa9e6a7971` 是本次執行的自聲明專案身份，不是平台認證。分支基於 `8d7ebfa94dd75e5e67edbba4d57770d8534ee428`，只處理施工中建築的選取面板，不接管已完成建築的生產佇列任務。

選中施工中建築時，面板原本約每 20% 才更新一次，施工正常進行時仍可能長時間顯示舊百分比。現在只要顯示的整數百分比變化就更新詳情，不因此重建命令按鈕；建造進度、費用、RNG 與存檔均未更改。

正式本地建置應用提交 `d6d4c120479edaf5be06eabd8c21c9add6b662c4` 與基底在 Chromium 均通過 127 資源雜湊。固定種子受控場景建立施工中房屋並指派附近村民，讓既有施工模擬推進：從 2% 增長至約 10% 時，舊版面板仍顯示 2%，新版顯示 10%。這是受控施工，不是自然建築流程；前後結果及截圖在 `build-0ca-evidence/`。Node 施工面板、選取面板及英雄肖像測試通過。自然十波、實體 GPU、真人聽感與歷史 FAIL／INCONCLUSIVE 保留；Progress Feed 屬其他 Owner，待合法同步。

**English:** Independent task `V240-BUILD-PROGRESS-0CA7E152BA21` has verified remote ownership version 222. `codex-idle-f3aa9e6a7971` is the self-declared project identity for this execution, not platform authenticated. The branch starts from `8d7ebfa94dd75e5e67edbba4d57770d8534ee428` and covers the selected under-construction building panel only; it does not take over the completed-building production queue task.

The selected building panel previously refreshed at roughly 20% intervals, leaving a stale percentage while construction continued. Details now refresh when the displayed whole percent changes, without rebuilding command buttons for that reason. Construction progress, cost, RNG and saves are unchanged.

The official local application build `d6d4c120479edaf5be06eabd8c21c9add6b662c4` and baseline both verified 127 resource hashes in Chromium. In a fixed-seed controlled fixture, a house and nearby builder were assigned and existing construction simulation progressed: when construction increased from 2% to about 10%, baseline still displayed 2%, while the new build displayed 10%. This was controlled construction, not natural placement. Results and screenshots are in `build-0ca-evidence/`. Node construction-panel, selection-panel and hero portrait checks passed. Natural ten-wave, physical GPU, human listening and historical FAIL/INCONCLUSIVE statuses remain. Progress Feed belongs to another owner and awaits authorized synchronization.
