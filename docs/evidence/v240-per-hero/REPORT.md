# 波斯翼飾脊盔／瓣錘／日輪橢圓盾英雄 / Persian winged-ridge-helm/flanged-mace/sun-oval-shield hero

來源／Source: `5ef184234f7edf2490978e096ce5e704ed1b08b5`. SCOPED_ACCEPTANCE_PASS; not formal independent QA/release acceptance.

繁體中文：首頁原生選 PER／Start 的既有英雄現在使用獨立原創 SVG／PNG 與生成器；不是普通盾衛換色，其他文明英雄／敵軍／一般兵種隔離。Canvas 2D 架構與原有英雄、成本、碰撞、導航、HP、攻擊、技能範圍／數值及冷卻未改。八方向、待機／移動／攻擊／受擊／死亡／施法，各四格共 192 格。施法徽記讓金色 Mark 與藍色 Aegis 易於辨識，沿用既有效果。

English: Native PER selection/Start now gives the existing hero an independent original SVG/PNG and reproducible generator, beyond recoloring ordinary guards. Other heroes/enemies/troops remain isolated. Canvas 2D and existing hero identity/cost/collision/navigation/HP/attack/skill range/values/cooldowns are unchanged. Eight directions and idle/walk/attack/hit/death/cast each have four frames, totaling 192. Skill emblems distinguish gold Mark from blue Aegis while retaining existing effects.

繁體中文：18 Node／17 真實 Chromium PASS。使用原生 Start 的同一英雄，實際左鍵頭部選取、右鍵移動與攻擊；兩個技能由原生命令按鈕施放。觀察實際攻擊、死亡及每個技能各四格播放；施放瞬間 Mark CD30／標記6秒、Aegis CD60／60護盾／5秒保留，之後按遊戲經過時間核對 CD。受控清場、500 HP 敵軍與準備240秒皆為 QA fixture，不是自然戰役。全部192格邊界透明，資產失敗回退與其他文明隔離通過，無頁面／Console／資源錯誤。代表方向、縮放、戰鬥／技能與死亡圖片已人工檢視；完整影片與原始樣本保留。

English: 18 Node/17 actual Chromium checks PASS. The same native-Start hero accepts real head selection, right-click movement/combat, and native buttons for both skills. Actual attack/death and each skill play four frames. Cast-time values remain Mark CD30/mark6s and Aegis CD60/shield60/duration5s; subsequent cooldown checks account for elapsed game time. Cleared scene/500-HP target/240s preparation are explicit QA fixtures, not natural-campaign acceptance. All 192 borders are transparent, failed-asset fallback and civilization isolation pass, with no page/console/resource errors. Representative direction/zoom/combat/skill/death images were reviewed; full video and raw samples remain.

繁體中文：離線透明邊界資訊保留一像素邊緣；renderer 只縮小繪製矩形並補回原落腳點。192格在單位繪製倍率下，裁格與未裁格的 RGBA 像素完全相同；不是重做圖檔。100英雄三組交錯 renderer-only 比較通過既有平均33.3ms／p95 50ms及配對p50退步不超過20%的門檻。資料不代表 FPS、GPU 或實體 RAM，來源 PNG 解碼尺寸未縮小；各姿勢裁格像素合計也不等於實際快取記憶體（裁格快取仍上限64）。

English: Offline alpha bounds retain a one-pixel gutter. Renderer only shrinks draw rectangles and restores original ground anchors. All 192 frames render identical RGBA pixels at unit draw scale with/without cropping; images are not remade. Three alternating 100-hero renderer-only pairs pass existing mean33.3ms/p95 50ms and <=20% paired-p50 regression gates. These are not FPS/GPU/native-RAM measurements; source PNG decode dimensions are unchanged. Summed pose crop pixels are not actual cache memory (cache remains capped at64).

繁體中文：歷史自然十波／NG+、模擬時鐘、嚴格 Save/Load、渲染性能、Rift 與硬體缺口保留。未公開部署。接續原生跨瀏覽器程序 Save/Continue 及文明圖集生命週期驗收。

English: Historical natural ten-wave/NG+, simulation-clock, strict Save/Load, render-performance, Rift and hardware gaps remain. Nothing publicly deployed. Continue native cross-browser-process Save/Continue and civilization atlas lifecycle validation.

BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：18項Node為本切片12項及既有六文明路由回歸6項，日誌分別保存。另7項真實Web Audio驗收通過，含瓣錘事件來源、非零／未削波SFX、原生靜音／恢復及100次請求節流，保留WAV／WebM；不是人工聽感或實體喇叭驗收。原生Start產生真正可操作主將，使用既有選取、移動、近戰及Mark/Aegis，未新增召喚／復活規則。角色為波斯文化啟發的原創奇幻設計，不宣稱歷史精確復原。最初瀏覽器錄影啟動因未指定既有Playwright快取而找不到ffmpeg，指定正確快取後完整重跑；未安裝新服務。一般縮放與方向畫面已檢視，不能以靜態圖宣稱主觀動畫流暢度通過。

English: The18 Node checks comprise12 slice checks and six existing-hero routing regressions, in separate logs. Seven additional actual Web Audio checks pass: mace event routing, nonzero/unclipped SFX, native mute/unmute and100-request throttling, with WAV/WebM retained; no human-listening/physical-speaker acceptance. Native Start creates the actual playable commander using existing selection/movement/melee/Mark/Aegis; no summoning/revival rule changes. Original Persian-inspired fantasy design, not a claim of historical reconstruction. Initial browser recording launch lacked the configured existing Playwright cache and could not find ffmpeg; the complete run passed with the correct cache, without installing services. Normal-zoom/direction images were reviewed; static images do not establish subjective animation smoothness.
