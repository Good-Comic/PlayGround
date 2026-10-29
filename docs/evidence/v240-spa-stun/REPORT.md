# SPA 村民暈擊與同頁 Continue / SPA villager stun and same-page Continue

繁體中文：遊戲來源／Build `19b614e81337778931cce3a36bd11dcf841e1cf2`，61 個 payload SHA256 相符。JPN 修復保存後直接接續 SPA，未等新指令。修復前 source `3a070947` 的正式生成村民無 civ，暈擊不會觸發；右鍵攻擊又跳過全部村民，讓已批准的 SPA 特性無法使用。修復後從 Game.civ 判斷，SPA 村民明確右鍵攻擊會中止採集／施工並進入真正戰鬥；其他文明村民的舊右鍵行為不變，採集期間仍不自動攻擊。不改 HP、傷害、成本或任何 data.js 數值。

English: Game source/Build `19b614e81337778931cce3a36bd11dcf841e1cf2` verifies 61 payload hashes. Work directly followed saved JPN acceptance without another prompt. Before source `3a070947`, production villagers lack civ, preventing stun; right-click attacks also skip all villagers, making the approved SPA trait unusable. The fix reads Game.civ and lets explicit SPA villager right-click attacks interrupt gathering/construction and enter real combat. Other-civilization villager right-click behavior remains unchanged and gathering does not auto-attack. No HP/damage/cost or data.js values changed.

繁體中文：依既有 GDD「每村民每 8 秒首擊暈非 Boss 0.5 秒」，將冷卻放在攻擊村民，而非被擊目標；換目標不能重置同村民冷卻，不同村民各有第一次暈擊。保存／恢復 _stunCd，舊存檔缺欄位視為準備就緒。完整 slowAmount=1 的暈眩期間跳過 AI／新攻擊，時間、冷卻與動畫仍正常推進；部分緩速不禁攻擊，已發射投射物繼續。不新增隨機判定或平衡參數。

English: The existing GDD specifies each villager's first hit every eight seconds stunning non-Boss foes for half a second. Cooldown now belongs to the attacking villager instead of the victim; target switching cannot reset one villager, while each villager has independent readiness. _stunCd is saved/restored and legacy omissions default to ready. Full slowAmount=1 stun skips AI/new attacks while time/cooldowns/animations advance; partial slow does not prohibit attacks and existing projectiles continue. No random proc or balance parameter was added.

繁體中文：原生 Save→Quit→Continue 揭露同頁首次儲存後 Continue 仍 disabled 的既有缺陷：完整性驗證只在載入時設定一次按鈕。現在選單重新計算是否已有存檔，且透過 playtestReady=false 保留完整性尚未就緒／失敗時的禁用。此路徑以真正 UI 點擊驗證，沒有強制啟用按鈕或重整頁面繞過。額外真實 Chromium 故意攔截 utils.js 的驗證 fetch 使雜湊不符，確認有存檔仍不能啟用 Start／Continue。

English: Native Save→Quit→Continue exposed an inherited disabled-Continue bug after a first same-page save: integrity initialization set button state only once. Menu return now recalculates save availability while playtestReady=false retains the integrity-not-ready/failed gate. Real UI clicks verify the path without forcing buttons enabled or reloading as a workaround. An additional actual Chromium test intentionally intercepts the utils.js verification fetch to cause a hash mismatch and confirms saved games cannot re-enable Start/Continue.

繁體中文：33 項定向 Node PASS。9 項真實遊戲 Chromium PASS：原生 SPA Start、右鍵真正攻擊／傷害／暈擊文字、半秒移動與新攻擊禁止、原生儲存返回與 Continue 保留狀態、冷卻期間不續暈、真正跑滿八秒後再暈、每村民／換目標隔離、Boss／其他文明排除。另 1 項完整性負向 Chromium PASS。兩份瀏覽器報告分別列 9 與 1，不能將它們說成 10 項自然戰役。實際浮字／重啟後交戰畫面已人工檢視，無正向測試 Console／Page／HTTP 錯誤。均為明示 CONTROLLED_FIXTURE，不代表自然十波、完整混音、硬體或嚴格全遊戲存檔驗收。

English: 33 focused Node checks PASS. Nine real-game Chromium checks PASS: native SPA Start, actual right-click attack/damage/stun text, half-second movement/new-attack suppression, native save/menu/Continue state retention, no cooldown extension, actual eight-second rearming, per-villager/target-switch isolation and Boss/other-civ exclusion. One additional integrity-negative Chromium check PASS. Separate reports contain nine and one, not ten natural-campaign tests. Actual floating text/restored combat images were reviewed with no positive-test Console/Page/HTTP errors. Explicit controlled fixtures do not certify natural ten waves, full audio mix, hardware or strict whole-game save determinism.

繁體中文：失敗完整保留。initial-paused-input 的三次失敗是 QA 在暫停時送滑鼠命令；已修正順序，不能冒稱那些 timeout 證明遊戲缺陷。修正工具後 before-browser 在舊來源仍無攻擊且 manual=false，配合 Node 證明原命令排除。first-continue-fail 保留實際 Continue disabled 的失敗。Node 工具的初始 RNG／布林／DOM 假設錯誤另存，不當作遊戲根因。傷害粒子本來會消耗模擬 RNG，本切片只確認暈擊沒有額外消耗；下一切片分離粒子 RNG，不能提前宣稱已修好。全部歷史自然戰役／低 FPS／性能／硬體缺口與發布限制維持。

English: Failures remain. Three initial-paused-input failures sent mouse commands while paused; the tool order was corrected and those timeouts do not establish game defects. Corrected before-browser on old source still has no attack/manual=false, supporting the command exclusion reproduced in Node. first-continue-fail retains the actual disabled-Continue failure. Initial RNG/boolean/DOM harness assumptions are separately preserved rather than called game root causes. Damage particles already consume simulation RNG; this slice only confirms stun adds no extra consumption. Particle RNG separation follows next and is not claimed fixed yet. All historical natural campaign/low-FPS/performance/hardware gaps and publication restrictions remain.

BILINGUAL_DOCUMENTATION_REQUIRED = true
