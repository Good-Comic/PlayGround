# MNG 條件功能驗收 / Conditional functional acceptance

來源／Source `d3ad78c2f719dff27b70f8f033dfdfff72f69c4c`. **SCOPED_ACCEPTED_PERF_INCONCLUSIVE**.

繁體中文：蒙古毛皮錐帽／彎刀／背弓袋層甲，192格八方向六狀態已接入原生Start、選取、移動、近戰、受擊、死亡、Mark/Aegis、專屬肖像及兵器音效。12 Node與7實際WebAudio通過；遊戲17項檢查完整執行，所有功能、192格透明邊界、八向解碼差異、裁格像素對照及資產／文明隔離通過。原始相對20%性能FAIL保留，當次數值及批次診斷詳見verified/browser.json／render-samples.json；不能跨執行宣稱性能無條件PASS。先前FAIL若存在另存pre-bounded-perf-fail。絕對平均33.3ms／p9550ms門檻維持，批次診斷不能取代原門檻。未證明穩定且玩家可感知退步，性能結論INCONCLUSIVE，不為求綠燈更改門檻或畫質。

English: Mongol fur cone hat/sabre/bowcase lamellar;192 cells/eight directions/six states integrated into nativeStart/selection/movement/melee/hit/death/Mark/Aegis, matching portraits and weapon cues.12 Node/seven actual Web Audio checks pass. All17 gameplay checks complete; functional behavior,192 transparent borders, eight distinct decoded facings, crop pixel parity and asset/civilization isolation pass. Original20percent relative-performance FAIL remains, with current raw values/bounded batches in verified/browser.json/render-samples.json; not an unconditional performance PASS across runs. Earlier failures, when present, remain in pre-bounded-perf-fail. Absolute mean33.3ms/p9550ms budgets remain, and batched diagnostics do not replace the original gate. Stable player-visible regression remains unproven, so performance is INCONCLUSIVE without changing gates/art quality to chase green.

繁體中文：已人工檢視正常縮放、頭部與技能圖片；真實影片／WAV保留。受控敵軍與100英雄非自然戰役；不宣稱主觀流暢度、人工聽感、GPU或實體硬體通過。技能、生命、傷害、冷卻、成本、碰撞與導航不變，原創奇幻文化造型非歷史復原；保持RNG隔離、靜音及共用節流。SAR與其他歷史FAIL／NOT_TESTED保持原狀，不公開發布。

English: Normal-zoom/head/skill images manually inspected; real videos/WAV retained. Controlled enemies/100 heroes are not natural campaigns; no subjective smoothness/human-listening/GPU/physical-hardware PASS claim. Skills/HP/damage/cooldowns/cost/collision/navigation unchanged, with original culturally inspired fantasy rather than historical reconstruction; RNG isolation/mute/shared throttle retained. SAR/other historicalFAIL/NOT_TESTED remain; no public release.
