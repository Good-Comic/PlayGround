# BRI 長弓兵 / BRI longbow infantry

繁體中文：遊戲來源及 Build 為 `c69bb252519fc1082166e0e37081685e98bcd568`，57 個 payload 雜湊一致；修正後 QA 工具為 `2ca780d07f534c688a8bd65618c51359f8ffe33b`，兩提交遊戲 payload 相同。原創罩帽、箭袋與接近身高的長弓提供非換色輪廓，八方向 × 五狀態 × 四影格，僅套用 BRI 玩家 archer；其他文明與敵軍保留原 Atlas。沒有新增兵種規則、改動射程／首箭延遲／碰撞／成本或戰鬥 RNG，正式射擊沿用現有箭矢音效。SVG／PNG 及生成器均為本專案原創，無第三方素材或授權依賴。

English: Game source/Build is `c69bb252519fc1082166e0e37081685e98bcd568`, with 57 payload hashes matching; corrected QA tool is `2ca780d07f534c688a8bd65618c51359f8ffe33b`, with identical game payload between commits. Original hood, quiver and near-body-height longbow provide a silhouette beyond recoloring, across eight directions, five states and four frames. Only BRI player archers use the variant; other civilizations/enemies retain existing atlases. No unit rules, range/first-shot delay/collision/cost or combat RNG changed. Production firing uses existing arrow sound. SVG/PNG and generator are original project work without third-party assets or licensing dependencies.

繁體中文：11 項定向 Node PASS；修正後 11 項真實 Chromium PASS。從原生首頁選 BRI 並 Start，之後明示 CONTROLLED_FIXTURE 建立場景，正式移動指令與滑鼠右鍵造成真正投射物傷害；攻擊四影格、受擊、死亡、音效事件、文明／敵軍隔離與資產失敗回退通過。人工檢視正面、背向、戰鬥、死亡及 0.8／1.4／2 倍畫面，代表姿勢未見裁切或錯誤鏡像；不是逐影格美術認證。原始失敗保留 initial：QA 回退呼叫未給文明 Atlas key，誤查通用弓兵；修正僅影響測試，非遊戲補丁。

English: 11 focused Node checks and 11 corrected real Chromium checks PASS. Native homepage BRI selection and Start precede an explicitly controlled fixture. Production movement and real right-click input cause actual projectile damage; four attack frames, hit/death, sound dispatch, civilization/enemy isolation and failed-asset fallback pass. Front/rear, combat/death and 0.8/1.4/2 zoom images were manually reviewed with no representative clipping or incorrect mirroring; this is not every-frame art certification. Initial failure is retained: QA omitted the civilization atlas key in its fallback call and checked the generic archer instead. Correction changes only the test.

繁體中文：固定 100 弓兵、三組交錯順序 renderer-only 比較，原通用 SVG Atlas 的 p50 為 9.0／9.4／9.1ms，新 PNG 裁格快取為 1.0／1.1／0.9ms，三組均通過既定預算及退步門檻。此為特定靜態場景的 draw JS 成本，不是 FPS、完整戰鬥或實體 GPU 證明。沒有瀏覽器／網路錯誤。保留自然十波、NG+、嚴格 Save/Load、低 FPS、混合建築性能及硬體缺口；未發布。

English: A fixed 100-archer, three-pair alternating renderer-only comparison measures original generic SVG p50 at 9.0/9.4/9.1ms and cached PNG frames at 1.0/1.1/0.9ms, passing existing budget/regression gates in all pairs. These are draw JS costs in this specific static scene, not FPS, full-combat or physical GPU certification. No browser/network errors occurred. Natural ten-wave/NG+, strict Save/Load, low-FPS, mixed-building performance and hardware gaps remain; nothing was publicly deployed.

BILINGUAL_DOCUMENTATION_REQUIRED = true
