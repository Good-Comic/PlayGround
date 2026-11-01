# 誘餌車受擊反應 / Decoy response to combat

**繁體中文：** 本執行者無法證明與前 Owner 為同一實例，因此以本階段自聲明專案身分 `codex-decoy-0661756ac038` 認領獨立任務 `V240-DECOY-RESPONSE-0661756AC038`，遠端所有權版本 210 已驗證；此標識並非平台認證。分支 `codex/riftwatch-decoy-0661756ac038` 基於 `9e573acfaf05890d1cf19932d71e129fe99f8293`，未接管前任工作。

**REAL_GAMEPLAY_DEFECT：** 雖然誘餌車標記為 `noAttack`，原自動選敵與受擊反擊仍可將其設為攻擊敵人，隨後攻擊更新又因無攻擊能力而回到待命，造成錯誤狀態反饋。現有巡邏掃描已排除此類單位；此次僅在自動選敵與受擊反擊加入同一能力檢查，保留敵人選擇、傷害、碰撞及數值。修正前兩個 Node 案例失敗、普通衛兵反擊通過；修正後三項案例及五個相關戰鬥／命令測試檔通過。原失敗記錄見 `decoy-066-evidence/prior-failure.json`。

應用提交 `1ed14f7a34f0722d92aaa751de1ac81cf1bb4677` 由正式工具生成新的本地構建，127 個檔案在真實 Chromium 通過資源哈希驗證。受控實戰中敵人自行選中並攻擊誘餌，血量由 180 降至 165.2，誘餌保持待命且未指定敵人；玩家原生右鍵地面後移動約 2.19 世界單位。結果與截圖位於 `decoy-066-evidence/`；敵人生成與測試場景受控，不構成自然完整戰役驗收。實體 GPU、自然十波、真人聽感及其他歷史 FAIL 保留原狀。Progress Feed 由其他 Owner 持有，待合法同步。

**English:** This executor cannot prove it is the prior owner. Session-scoped self-declared project identity `codex-decoy-0661756ac038` claimed independent task `V240-DECOY-RESPONSE-0661756AC038` at verified remote ownership version 210; it is not platform authenticated. Branch `codex/riftwatch-decoy-0661756ac038` is based on `9e573acfaf05890d1cf19932d71e129fe99f8293` and does not take over previous work.

**REAL_GAMEPLAY_DEFECT:** Although the decoy is marked `noAttack`, automatic acquisition and retaliation could set it to attack an enemy, after which attack update returned it to idle because it cannot attack, producing misleading state feedback. Patrol scanning already excludes such units. This change applies the same capability check only to automatic acquisition and retaliation, preserving enemy targeting, damage, collision and values. Before the fix two Node cases failed while ordinary guard retaliation passed; afterward all three cases and five related combat/command test files passed. The original failures are in `decoy-066-evidence/prior-failure.json`.

The official tool created a new local artifact from application commit `1ed14f7a34f0722d92aaa751de1ac81cf1bb4677`; real Chromium verified hashes for 127 files. In controlled combat, an enemy autonomously targeted and struck the decoy, reducing HP from 180 to 165.2 while the decoy remained idle without targeting it. Native player right-click then moved it about 2.19 world units. Results and screenshot are in `decoy-066-evidence/`; the spawned enemy and fixture are controlled, not natural full-campaign acceptance. Physical GPU, natural ten waves, human listening and other historical failures remain outstanding. Progress Feed belongs to another owner and awaits authorized synchronization.
