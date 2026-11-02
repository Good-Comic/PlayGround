# 戰地救護適用對象 / Battlefield Care eligibility

**繁體中文：** 獨立任務 `V240-LIFESTEAL-D1582B4D15B5` 的 Ownership 版本 226 已遠端核對；`codex-lifesteal-d1582b4d15b5` 是本次執行自聲明的專案級身份，並非平台認證。分支基於 `ea4850497a3be6573c97d9925a5a51c14f4f1fc5`，不接管 KITE、其他恩賜或既有 Owner。

戰地救護標示士兵以造成傷害的 8% 回復生命，但原本所有玩家傷害來源皆獲回復，包括塔樓、城鎮中心和村民。現在僅玩家非村民單位享有既有效果，與現有軍事人口分類一致；沒有變更回復比例、傷害、卡牌抽取、RNG 或存檔結構。這消除非士兵的意外自我修復，會改變依賴該錯誤的舊有玩法。

正式本機應用建置 `2a53ea87b6db1499a3e823a0c40d67d1d2dcff4b` 與基底在 Chromium 均通過 127 項資源雜湊。固定種子受控戰鬥中，玩家透過實際介面選擇戰地救護，以原生右鍵命令弓兵攻擊，塔樓也依正常 AI 自動攻擊；舊版塔樓由 100 回復到 100.96，新版保持 100，兩版弓兵均由 10 回復到 10.56。截圖與結果在 `lifesteal-d158-evidence/`。Node 測試在基底重現塔樓錯誤，新版確認士兵、塔樓、城鎮中心及村民；戰鬥、破片彈、共鳴弦、恩賜存檔與視覺 RNG 回歸通過。這是受控戰鬥，不是自然十波或實體 GPU 驗收；歷史 FAIL／INCONCLUSIVE／NOT_TESTED 保留。Progress Feed 屬其他 Owner，待合法同步。

**English:** Independent task `V240-LIFESTEAL-D1582B4D15B5` has verified remote ownership version 226. `codex-lifesteal-d1582b4d15b5` is this execution's self-declared project identity, not platform authenticated. The branch starts from `ea4850497a3be6573c97d9925a5a51c14f4f1fc5` without taking over KITE, other boon tasks or other owners.

Battlefield Care states that soldiers heal for 8% of damage dealt, but the previous implementation healed every player damage source, including towers, town centers and villagers. The existing effect now applies only to player non-villager units, consistent with the existing military-population classification. Healing percentage, damage, card draws, RNG and save structure are unchanged. This removes accidental non-soldier self-repair and changes play that relied on that bug.

Official local application build `2a53ea87b6db1499a3e823a0c40d67d1d2dcff4b` and baseline both verified all 127 resource hashes in Chromium. In a fixed-seed controlled fight, the player selected Battlefield Care in the actual UI and used native right-click to command an archer while a tower fired under normal AI. Baseline tower HP increased from 100 to 100.96; the new tower stayed at 100. The archer increased from 10 to 10.56 in both. Screenshots and results are in `lifesteal-d158-evidence/`. Node cases reproduced the baseline tower error and verify soldiers, towers, town centers and villagers after the change; combat, Fragment Shells, Resonant Strings, boon-save and visual RNG regressions passed. This is controlled combat, not natural ten-wave or physical GPU acceptance; historical FAIL/INCONCLUSIVE/NOT_TESTED remain. Progress Feed belongs to another owner and awaits authorized synchronization.
