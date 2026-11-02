# 伐木外觀 / Worked tree appearance

**繁體中文：** 獨立任務 `V240-WOOD-SCARS-BEED1C3A3954` 的 Ownership 版本 221 已遠端核對；`codex-idle-f3aa9e6a7971` 是本執行的自聲明專案身份，並非平台認證。分支基於 `cc2ebb4d4d7a686a30f9736bf7ceabbd8c815343`，只修改已開採樹木外觀，未接管其他 Owner。

橡樹及松樹剩餘木材降低時顯示斧口與木屑，接近耗盡時顯示更亮切口，幫助區分已開採樹木。這僅使用既有剩餘量，不變更採集速率、碰撞、地圖、RNG 或樹樁規則。

正式本機應用建置 `509cf5ea18e7a570686b1eda56bf034f1a885907` 與基底在 Chromium 均通過 127 資源雜湊。固定種子受控場景把既有樹木設為 20% 並將村民移至附近；原生右鍵成功指派伐木且木材量實際下降。前後截圖與結果在 `wood-beed-evidence/`。樹木外觀、視覺 RNG 及地圖生成／SaveLoad Node 測試通過；自然採集、其他縮放、自然十波、實體 GPU 和真人聽感仍未驗證，歷史失敗保留。Progress Feed 屬其他 Owner，待合法同步。

**English:** Independent task `V240-WOOD-SCARS-BEED1C3A3954` has verified remote ownership version 221. `codex-idle-f3aa9e6a7971` is this execution's self-declared project identity, not platform authenticated. The branch starts from `cc2ebb4d4d7a686a30f9736bf7ceabbd8c815343` and changes worked-tree appearance only without taking over another owner.

As oak and pine stocks decline, visible axe cuts and chips distinguish worked trees; a brighter cut appears near exhaustion. The visual reads existing stock only and does not change gathering rate, collision, map, RNG or stump rules.

The official local application build `509cf5ea18e7a570686b1eda56bf034f1a885907` and baseline both verified 127 resource hashes in Chromium. In a fixed-seed controlled scene an existing tree was set to 20% and a villager placed nearby; native right-click assigned logging and wood stock actually decreased. Screenshots and results are in `wood-beed-evidence/`. Tree visuals, visual RNG and map-generation/SaveLoad Node tests passed. Natural gathering, other zooms, natural ten-wave, physical GPU and human listening remain unverified; historical failures remain. Progress Feed belongs to another owner and awaits authorized synchronization.
