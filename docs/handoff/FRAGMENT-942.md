# 破片彈恩賜效果 / Fragment Shells boon effect

**繁體中文：** 獨立任務 `V240-FRAGMENT-942FFEED1635` 的 Ownership 版本 224 已遠端核對；`codex-kite-dd660613e049` 為本次連續執行的自聲明專案身份，不是平台認證。分支基於 `c2e51f0b5aaea25d694a23f0d6e087cc69148351`，只修正破片彈既有效果，未接管其他 Owner。

破片彈卡牌及既有數值設定均標示攻城濺射 60%，但結算固定使用基礎 50%，因此選卡無法增加濺射。現在玩家攻城投射物結算採用現有恩賜效果，未選卡與敵軍仍保留 50%，直接傷害不變。沒有新增平衡數值、改變範圍、目標上限、卡牌權重或 RNG；卡牌既有 15% 攻城生命效果保留。

應用提交 `1cd633ef4b3a66972af8c37948dc4a655c7a1899` 與基底均使用正式本機構建，Chromium 各通過 127 資源雜湊。固定種子受控場景中，玩家透過實際介面選擇破片彈，再用原生右鍵指揮投石機攻擊；新舊版直接傷害均為 40，舊版附近敵人受 20 點、新版受 24 點。選卡與命中截圖、JSON 在 `fragment-942-evidence/`。Node 測試重現基底 50% 失敗，修正後確認 60%、敵軍不受玩家恩賜影響及選卡存檔恢復；恩賜存檔、戰鬥、KITE 和視覺 RNG 回歸通過。此為受控場景，非自然波次、十波戰役或實體 GPU 驗收；歷史 FAIL／INCONCLUSIVE 保留。Progress Feed 由其他 Owner 持有，待合法同步。

**English:** Independent task `V240-FRAGMENT-942FFEED1635` has verified remote ownership version 224. `codex-kite-dd660613e049` is the self-declared project identity for this continuous execution, not platform authenticated. The branch is based on `c2e51f0b5aaea25d694a23f0d6e087cc69148351`; its scope is the existing Fragment Shells effect without taking over other owners.

The Fragment Shells card and its existing effect specify 60% siege splash, but projectile resolution always used the 50% base, so choosing it did not increase splash damage. Player siege projectiles now use the existing boon effect; the 50% baseline and hostile siege remain unchanged, as does direct damage. No new balance value, radius, target cap, card weight or RNG was added; the card's existing 15% siege health effect remains.

Application commit `1cd633ef4b3a66972af8c37948dc4a655c7a1899` and baseline used official local builds, each verifying 127 resource hashes in Chromium. In a fixed-seed controlled scene the player chose Fragment Shells in the actual interface, then used native right-click to command a mangonel. Direct damage was 40 in both; nearby enemies took 20 on baseline and 24 after the fix. Choice and impact screenshots and JSON are in `fragment-942-evidence/`. A Node case reproduced baseline's incorrect 50%; after the fix it verifies 60%, no boost to hostile siege, and save/load of the chosen card. Boon-save, combat, KITE and visual RNG regressions passed. This is controlled gameplay, not natural-wave, ten-wave or physical GPU acceptance; historical FAIL/INCONCLUSIVE remain. Progress Feed belongs to another owner and awaits authorized synchronization.
