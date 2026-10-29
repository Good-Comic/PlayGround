# JPN 格擋來源修復 / JPN block identity fix

繁體中文：來源／Build `3a07094748122d9046f4e46b54b3cecd0fad2e3f`，61 個 payload SHA256 相符。修復前來源 `3723fb2` 的真實 Chromium 第一擊由 130 扣至 129，無格擋文字、無冷卻；正式單位不帶 civ。原始 Node、Browser FAIL 保留，第一份測試工具另有 floating／RNG API 誤用，已修正後重新記錄 baseline，不拿工具錯誤代替遊戲根因。

English: Source/Build `3a07094748122d9046f4e46b54b3cecd0fad2e3f` verifies 61 payload SHA256 hashes. Before-fix source `3723fb2` takes real Chromium first-hit damage from 130 to 129 with no block text/cooldown; production units have no civ field. Original Node/browser failures are retained. The initial test harness also misused floating/RNG APIs; those were corrected before recording the baseline rather than conflating harness errors with the game defect.

繁體中文：格擋改讀正式 Game.civ，限定玩家單位與敵方非 Boss 普通近戰來源；不新增 per-unit 文明物件。明示 melee／projectile／splash／zone 傷害路徑，避免一旦身分判定修好便誤擋投射物或區域傷害。保留原先 10 秒冷卻、護盾先吸收、護甲、成本、傷害與 Boss 排除，不改 data.js 平衡數值。加入 _blockCd 存檔與有限數字恢復，舊版缺欄位則視為準備就緒。普通 Boss 攻擊的原有排除也保留，此切片不擴大可格擋來源。

English: Block reads production Game.civ and applies to player units against ordinary hostile non-Boss melee sources, without adding per-unit civilization objects. Explicit melee/projectile/splash/zone damage paths prevent the identity fix from inadvertently blocking ranged/area damage. Existing ten-second cooldown, shield-first absorption, armor, cost, damage and Boss exclusion remain; data.js balance values are unchanged. _blockCd is saved/restored as a finite number; legacy saves without it default to ready. Existing ordinary-Boss-strike exclusion is also retained rather than expanding eligible sources.

繁體中文：20 項定向 Node PASS，包含 JPN 格擋八案例、札甲整合、戰象踐踏、英雄護盾及兵種音效回歸。9 項真實 Chromium PASS，原生 JPN Start 後明示 CONTROLLED_FIXTURE，用真正敵軍 AI／正式攻擊追蹤第一擊、下一擊與超過十秒後的再次格擋；沒有直接跳冷卻時鐘。JSON SaveLoad 後冷卻有效、實際投射物與 Boss／普通來源區域傷害有效、其他文明不誤得格擋。原有本地化格擋浮字已人工檢視；原始遊戲錄影與前後截圖保存，沒有瀏覽器／網路錯誤。受控測試不是自然戰役或嚴格全遊戲決定性驗收。

English: 20 focused Node checks PASS, including eight block cases, lamellar integration, elephant trample, hero shields and unit-sound regressions. Nine actual Chromium checks PASS after native JPN Start with explicit controlled fixtures, tracing real enemy AI/production attacks for first hit, subsequent hit and rearming after over ten simulation seconds without skipping the cooldown clock. JSON SaveLoad preserves cooldown; actual projectiles and Boss/ordinary-source zones still damage, and other civilizations do not gain block. Existing localized block text was visually inspected. Actual gameplay video and before/after screenshots are saved with no browser/network errors. Controlled tests are not natural-campaign or strict whole-game determinism acceptance.

繁體中文：歷史 JPN 格擋 FAIL 與首輪美術性能 FAIL 不刪除；本修復只解決身分／傷害來源／格擋冷卻缺口。自然十波／NG+、低 FPS、嚴格 Save/Load、混合建築性能、Rift 與硬體缺口保留。保存後直接接續 SPA 村民暈擊相同身分缺陷，非等待額外繼續指令。未改 main、Pages、OmGitHub 或公開部署。

English: Historical JPN block and initial art-performance failures remain. This fix addresses only identity/damage provenance/block cooldown. Natural ten-wave/NG+, low-FPS, strict Save/Load, mixed-building performance, Rift and hardware gaps remain. After saving, directly continue the same identity defect in SPA villager stun without another continue prompt. No main/Pages/OmGitHub or public deployment changes.

BILINGUAL_DOCUMENTATION_REQUIRED = true
