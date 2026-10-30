# 日本雙手刀／大袖札甲／背旗英雄 / Japanese two-handed sword/lamellar pauldrons/back-banner hero

來源／Source: `9d8a9f9710a1b1701b36c17e6d32bb15d05cdc3a`. SCOPED_ACCEPTANCE_PASS; not formal independent QA/release acceptance.

繁體中文：首頁原生選 JPN／Start 的既有英雄現在使用獨立原創 SVG／PNG 與生成器；不是普通盾衛換色，其他文明英雄／敵軍／一般兵種隔離。Canvas 2D 架構與原有英雄、成本、碰撞、導航、HP、攻擊、技能範圍／數值及冷卻未改。八方向、待機／移動／攻擊／受擊／死亡／施法，各四格共 192 格。施法徽記讓金色 Mark 與藍色 Aegis 易於辨識，沿用既有效果。

English: Native JPN selection/Start now gives the existing hero an independent original SVG/PNG and reproducible generator, beyond recoloring ordinary guards. Other heroes/enemies/troops remain isolated. Canvas 2D and existing hero identity/cost/collision/navigation/HP/attack/skill range/values/cooldowns are unchanged. Eight directions and idle/walk/attack/hit/death/cast each have four frames, totaling 192. Skill emblems distinguish gold Mark from blue Aegis while retaining existing effects.

繁體中文：5 Node／17 真實 Chromium PASS。使用原生 Start 的同一英雄，實際左鍵頭部選取、右鍵移動與攻擊；兩個技能由原生命令按鈕施放。觀察實際攻擊、死亡及每個技能各四格播放；施放瞬間 Mark CD30／標記6秒、Aegis CD60／60護盾／5秒保留，之後按遊戲經過時間核對 CD。受控清場、500 HP 敵軍與準備240秒皆為 QA fixture，不是自然戰役。全部192格邊界透明，資產失敗回退與其他文明隔離通過，無頁面／Console／資源錯誤。代表方向、縮放、戰鬥／技能與死亡圖片已人工檢視；完整影片與原始樣本保留。

English: 5 Node/17 actual Chromium checks PASS. The same native-Start hero accepts real head selection, right-click movement/combat, and native buttons for both skills. Actual attack/death and each skill play four frames. Cast-time values remain Mark CD30/mark6s and Aegis CD60/shield60/duration5s; subsequent cooldown checks account for elapsed game time. Cleared scene/500-HP target/240s preparation are explicit QA fixtures, not natural-campaign acceptance. All 192 borders are transparent, failed-asset fallback and civilization isolation pass, with no page/console/resource errors. Representative direction/zoom/combat/skill/death images were reviewed; full video and raw samples remain.

繁體中文：離線透明邊界資訊保留一像素邊緣；renderer 只縮小繪製矩形並補回原落腳點。192格在單位繪製倍率下，裁格與未裁格的 RGBA 像素完全相同；不是重做圖檔。100英雄三組交錯 renderer-only 比較通過既有平均33.3ms／p95 50ms及配對p50退步不超過20%的門檻。資料不代表 FPS、GPU 或實體 RAM，來源 PNG 解碼尺寸未縮小；各姿勢裁格像素合計也不等於實際快取記憶體（裁格快取仍上限64）。

English: Offline alpha bounds retain a one-pixel gutter. Renderer only shrinks draw rectangles and restores original ground anchors. All 192 frames render identical RGBA pixels at unit draw scale with/without cropping; images are not remade. Three alternating 100-hero renderer-only pairs pass existing mean33.3ms/p95 50ms and <=20% paired-p50 regression gates. These are not FPS/GPU/native-RAM measurements; source PNG decode dimensions are unchanged. Summed pose crop pixels are not actual cache memory (cache remains capped at64).

繁體中文：歷史自然十波／NG+、模擬時鐘、嚴格 Save/Load、渲染性能、Rift 與硬體缺口保留。未公開部署。接續 AZT 美洲虎面具與黑曜石雙手武器英雄。

English: Historical natural ten-wave/NG+, simulation-clock, strict Save/Load, render-performance, Rift and hardware gaps remain. Nothing publicly deployed. Continue AZT jaguar-mask and two-handed obsidian-weapon hero.

BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：首次 82018f8 的受擊動畫 FAIL 保留於 before-browser：既有 JPN 普通近戰格擋正確擋掉測試傷害。修復只改 QA，先驗證普通近戰仍格擋，再用敵方弓兵來源的實際 projectile 路徑確認扣血／受擊幀，不修改或重做格擋。另有受影響 TEU 英雄隔離 1 項 Node PASS，日誌獨立保存，未冒充新獨立覆蓋。

English: Initial 82018f8 hit-animation FAIL remains in before-browser: existing Japanese ordinary-melee block correctly absorbed fixture damage. QA alone now verifies that block, then uses an actual projectile from a hostile archer to verify HP loss/hit frames, without changing or remaking block. One affected TEU hero-isolation Node check also passes in a separate log, without claiming new unique coverage.
