# 河川渡口視覺 / River crossing visual

**繁體中文：** 獨立任務 `V240-FORD-VIS-87226313606D` 的遠端 Ownership 版本為 218。`codex-ford-87226313606d` 是本次執行自聲明的專案身份，不是平台認證；分支自 `1a4b27bd2cc76cf7a07b8929fdd4f44d553387bc` 建立，不接管既有 Owner。

河川地圖上緊鄰水域的可通行石板邊緣現在有石條、亮邊及接縫，幫助區分渡口和不可通行水域。裝飾在既有地形快取內繪製，不改地形、尋路、碰撞、地圖生成或 RNG；普通陸上石板不加此裝飾。這是視覺改善，不是新的橋樑或地形玩法。

應用提交 `191f67f05e286bb1897a2a623566cbeb6d64449c` 的正式本地建置與基底均在 Chromium 通過 127 項資源雜湊。固定種子河川地圖的受控場景將村民放到現有渡口，原生右鍵命令其沿石板移動；新版及基底均成功移動，碰撞沒有停用。前後截圖與結果在 `ford-872-evidence/`。Node 渡口、岸線、地圖生成／SaveLoad 和視覺 RNG 測試通過；更大隊伍、其他縮放和自然戰役尚未驗收。自然十波、實體 GPU、真人聽感及歷史 FAIL／INCONCLUSIVE 狀態保留。Progress Feed 屬其他 Owner，待合法同步。

**English:** Independent task `V240-FORD-VIS-87226313606D` has verified remote ownership version 218. `codex-ford-87226313606d` is this execution's self-declared project identity, not platform authenticated. The branch starts from `1a4b27bd2cc76cf7a07b8929fdd4f44d553387bc` without taking over another owner.

Walkable cobble edges adjacent to water on river maps now show stone coping, a highlight and joints, helping distinguish crossings from impassable water. Decoration is baked into the existing terrain cache and does not change terrain, pathfinding, collisions, map generation or RNG; ordinary inland cobbles receive no edging. This is a visual improvement, not new bridge or terrain gameplay.

The official local build from application commit `191f67f05e286bb1897a2a623566cbeb6d64449c` and the baseline both verified 127 resource hashes in Chromium. In a fixed-seed controlled river scene a villager was placed on an existing crossing and given a native right-click movement order along the cobbles; both versions moved successfully with collision enabled. Before/after screenshots and results are in `ford-872-evidence/`. Node ford, shoreline, map generation/SaveLoad and visual RNG cases passed. Larger groups, other zoom levels and natural campaigns remain unverified. Natural ten-wave, physical GPU, human listening and historical FAIL/INCONCLUSIVE statuses remain. Progress Feed belongs to another owner and awaits authorized synchronization.
