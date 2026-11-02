# 選取面板即時資料 / Live selection panel

**繁體中文：** 獨立任務 `V240-PANEL-LIVE-71830A3C1C71` 的遠端 Ownership 版本為 220；同一執行的 `codex-idle-f3aa9e6a7971` 為專案級自聲明身份，並非平台認證。分支基於 `b71432003d2f2b6c65f872cc6584c1ac4c318223`，範圍為選取面板資料，沒有接管其他 Owner。

修正混選生命值在下一次 UI 更新時被第一名單位覆蓋；單位工作狀態、攜帶數量、實際護甲及攻擊／射程變化會刷新詳情，護甲顯示使用實際單位值。混選生命條顏色不再繼承之前選取資源或敵人的顏色。只更新顯示，沒有改傷害、採集、技能、RNG 或存檔；變更詳情不重建指令按鈕。

正式建置的應用提交 `8adc255778093cb3d45142327d250864344e0617` 與基底均在 Chromium 通過 127 資源雜湊。受控介面場景中舊版混選從 50／105 錯變為 20／45，新版保持 50／105；設定村民工作、攜帶和護甲後，新版顯示採集木材、4 木及 7 護甲，舊版仍顯示等待命令及 1 護甲。此測試以程式設置場景與狀態，非自然採集；截圖和結果在 `panel-718-evidence/`。Node 面板、英雄肖像及四語資源檢查通過。自然戰役、實體 GPU、真人聽感與歷史 FAIL／INCONCLUSIVE 狀態保留；Progress Feed 屬其他 Owner，待合法同步。

**English:** Independent task `V240-PANEL-LIVE-71830A3C1C71` has verified remote ownership version 220. This execution uses `codex-idle-f3aa9e6a7971` as a self-declared project identity, not platform authentication. The branch is based on `b71432003d2f2b6c65f872cc6584c1ac4c318223`; its scope is selection-panel data, without taking over other owners.

Mixed-selection health no longer changes to the first unit's health on the next UI update. Unit work status, carried quantity, actual armor and attack/range changes refresh their details, and the armor field uses the unit's actual value. Group health colors no longer inherit the previous resource or enemy color. These are display changes only: damage, gathering, skills, RNG and saves are unchanged, and detail updates do not rebuild command buttons.

Official application build `8adc255778093cb3d45142327d250864344e0617` and the baseline both verified 127 resources in Chromium. In a controlled UI scene, baseline group health changed incorrectly from 50/105 to 20/45; the new build retained 50/105. After programmatically setting worker state, cargo and armor, the new panel showed gathering wood, 4 wood and 7 armor while baseline remained at awaiting orders and 1 armor. This is a fixture, not natural gathering; screenshots and results are in `panel-718-evidence/`. Node panel, hero portrait and four-language resource checks passed. Natural campaign, physical GPU, human listening and historical FAIL/INCONCLUSIVE statuses remain; Progress Feed belongs to another owner and awaits authorized synchronization.
