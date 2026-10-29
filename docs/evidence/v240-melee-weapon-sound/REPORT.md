# 近戰兵器聲音差異 / Melee weapon sound differentiation

遊戲來源／Game source: `6a4886480cb968447753f95bd5e1cf2a2dcec24a`. 最終驗收來源／Final acceptance source: `8c348256a2865195c28575684970e98f4e037ae8` (subsequent changes are QA instrumentation only).

繁體中文：MAG 弧刀高頻揮斬、FRK 騎槍低頻木質衝擊、盾衛金屬泛音、槍兵短突刺及 AZT 黑曜石武器鈍擊，實際接入既有近戰攻擊；玩家傳遞文明，敵軍不借用玩家文明聲音。沿用單一 attack 55 ms 節流，每次最多三個合成聲部，靜音於合成前返回。未改成本、攻擊、冷卻、碰撞、導航或平衡；音效不消耗遊戲 RNG。

English: MAG's high-frequency sabre sweep, FRK's lower wooden lance impact, guard metallic overtones, short spear thrust and AZT blunt obsidian-weapon hit now run through actual existing melee attacks. Player attacks pass civilization; enemies do not inherit player-civilization cues. The shared 55 ms attack throttle remains, with at most three synthesized voices and mute returning before synthesis. Cost/attack/cooldown/collision/navigation/balance are unchanged; cues do not consume game RNG.

繁體中文：7 定向 Node PASS，涵蓋五種差異、節流、靜音、真實攻擊來源及戰鬥／RNG 一致性，另含既有音效相關回歸；Node 日誌對應 6a48864，後續只有 QA 工具修改。最終 31 Chromium PASS：五文明原生 Start／AudioContext 啟動，受控 2000 HP 敵軍、真實右鍵近戰、指定合成頻率、非零訊號、無削波、原生靜音／恢復、100 次聲音請求節流，以及實際 SFX PCM 匯出。敵軍 HP 只存在測試 fixture，不是遊戲平衡變更。無頁面／Console／資源錯誤。

English: Seven focused Node checks PASS for five signatures, throttle/mute, real attack routing and combat/RNG equivalence, including related existing audio regression. Node logs correspond to 6a48864; subsequent changes affect only QA tools. Final 31 Chromium checks PASS: native Start/AudioContext activation for five civilizations, controlled 2,000-HP targets, real right-click melee, expected synthesis frequencies, nonzero unclipped signal, native mute/unmute, 100-request throttle and actual SFX PCM export. Target HP changes exist only in the fixture, not game balance. No page/console/resource errors.

繁體中文：initial-fail 保留 TEU RMS FAIL（平均包含接敵靜默）；window-fail 保留主執行緒短音取樣漏失。preliminary-meter 雖曾總結 PASS，MAG 靜音樣本數為零，不能當作有效靜音驗收。最終工具改為音訊執行緒 AudioWorklet 逐樣本累積，RMS 使用絕對值大於 1e-8 的實際音訊樣本，保留總樣本數；靜音階段重設 epoch 並強制至少 8192 個樣本。最終五組靜音各 16384／18432／20480／18432／18432 樣本且峰值為零；有聲峰值約 0.055–0.081，未調高遊戲音量來讓測試通過。原始失敗和不足均保留。

English: initial-fail preserves TEU RMS failure diluted by pre-contact silence; window-fail preserves missed short cues with main-thread sampling. preliminary-meter reported PASS but MAG's zero muted samples invalidate that silence check. Final tooling accumulates samples in an AudioWorklet; RMS uses actual audio samples with absolute value above 1e-8 and retains total counts. Mute resets the epoch and requires at least 8,192 samples. Final muted counts are 16,384/18,432/20,480/18,432/18,432, all zero peak; audible peaks are approximately 0.055–0.081. No game volume was raised to satisfy checks. Original failures and insufficient evidence remain.

繁體中文：verified 的 WAV／WebM 為實際瀏覽器 SFX 錄音，分流位於 master 前，未混入 BGM／環境聲；包含操作提示聲，非純武器單音。已檢視代表戰鬥圖片。此為軟體 Chromium 訊號／操作驗收，不宣稱人工聽感、實體喇叭、整體 BGM 混音、FPS 或硬體驗收。全部歷史 FAIL 保留；未公開部署。下一項 GOT 鎖子甲長盾民兵正在原生訓練／戰鬥驗收。

English: Verified WAV/WebM files contain actual browser SFX recordings tapped before master gain, excluding BGM/ambience; command cues are included, so these are not isolated single-weapon notes. Representative combat images were reviewed. This is software-Chromium signal/input acceptance, not human listening, physical speakers, full BGM mix, FPS or hardware acceptance. Historical FAIL remains; nothing publicly deployed. GOT mail/oval-shield infantry is undergoing native training/combat acceptance next.

BILINGUAL_DOCUMENTATION_REQUIRED = true
