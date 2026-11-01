# 投石機投射物外觀 / Mangonel projectile appearance

**繁體中文：** 獨立任務 `V240-SIEGE-PROJECTILE-AC42058E943C` 的 Ownership 版本 216 已遠端驗證；同一執行的專案級自聲明身份為 `codex-resource-ac42058e943c`，不是平台認證。分支 `codex/riftwatch-siege-visual-ac42058e943c` 基於資源視覺成果 `7499d3a6e49f0c3cf8174abd829dbf462c2d505c`。範圍只包括攻城單位投射物繪製；未修改其他 Owner 的 HUNT、Atlas、克制或生產功能。

原先所有投射物均畫成箭矢，包括投石機射出物。現在既有攻城來源投射物呈現帶陰影與亮面的石彈，普通箭矢仍採既有圖形。顯示完全追隨既有飛行座標，不改攻擊時間、碰撞、傷害、RNG、儲存或粒子系統。

正式本地建置應用 SHA `218b898172c3df2e53795cf2c7647d055d5131ce`；新版與基底均在 Chromium 通過 127 項資源雜湊。固定種子受控戰場中，玩家原生右鍵指定敵人，投石機實際發射；截取飛行畫面時暫停，之後恢復並命中。新舊兩版目標 HP 均由 1000 降至 963.6。截圖及 JSON 位於 `siege-ac42-evidence/`；單位由測試建立，敵人暫時固定，這不是自然戰役。攻城外觀 Node 測試、戰鬥及視覺 RNG 回歸通過；實體 GPU、自然十波與真人聽感仍未驗證，其他歷史 FAIL／INCONCLUSIVE 保留。Progress Feed 由其他 Owner 持有，待合法同步。

**English:** Independent task `V240-SIEGE-PROJECTILE-AC42058E943C` ownership version 216 was verified remotely. The same execution uses the self-declared project identity `codex-resource-ac42058e943c`, not a platform-authenticated identity. Branch `codex/riftwatch-siege-visual-ac42058e943c` builds on resource-visual result `7499d3a6e49f0c3cf8174abd829dbf462c2d505c`. Scope is limited to rendering siege projectiles; other owners' HUNT, Atlas, counter and production work is unchanged.

All projectiles previously used an arrow graphic, including mangonel shots. Projectiles from existing siege sources now appear as shaded stone; ordinary arrows retain their original geometry. The display follows the existing in-flight coordinates and does not change attack timing, collision, damage, RNG, saves or particles.

The official local application build is `218b898172c3df2e53795cf2c7647d055d5131ce`; new and baseline Chromium builds verified all 127 resource hashes. In a fixed-seed controlled battlefield, native right-click ordered a mangonel to attack an enemy and it actually fired. The game was paused to capture the in-flight image, then resumed for impact. Both baseline and new build reduced target HP from 1000 to 963.6. Screenshots and JSON are in `siege-ac42-evidence/`; test units were spawned and the enemy temporarily immobilized, so this is not a natural campaign. The siege visual Node case and combat and visual RNG regressions passed; physical GPU, natural ten-wave and human listening remain unverified, and historical FAIL/INCONCLUSIVE outcomes remain. Progress Feed belongs to another owner and awaits authorized synchronization.
