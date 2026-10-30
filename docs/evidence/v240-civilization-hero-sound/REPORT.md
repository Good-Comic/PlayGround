# 文明英雄兵器音效 / Civilization hero weapon sound

來源／Source: `3c8a493d32b8fee6ed9e1bb18cc8b756677b4f58`. SCOPED_ACCEPTANCE_PASS.

繁體中文：TEU 戰鎚低頻撞擊、JPN 刀刃高頻揮斬、AZT 黑曜石鈍擊已接入既有英雄普通近戰。沿用 Game.attackUnit 的既有玩家文明來源，敵軍不繼承玩家文明聲音；其他英雄與兵種保留原聲。共用 attack 55ms 節流、每次最多三個聲部及靜音提前返回。沒有改技能、BGM、戰鬥、冷卻或模擬 RNG。

English: TEU low hammer impact, JPN high blade sweep and AZT blunt obsidian hit now play through existing hero ordinary melee. Existing Game.attackUnit player-civilization routing is reused; enemies do not inherit it, and other heroes/troops retain their cues. Shared55ms attack throttle, at most three voices and mute-before-synthesis remain. Skills/BGM/combat/cooldowns/simulation RNG are unchanged.

繁體中文：7 Node／19 Chromium PASS。原生首頁／Start 與 AudioContext 啟動後，受控生成既有 commander 和2000 HP 敵軍，真正右鍵近戰扣血與聲音來源通過；原生聲音按鈕靜音／恢復、100次請求節流、實際音訊非零且未削波，WAV／WebM 匯出通過。三組靜音各有16384／18432／18432個實測樣本、峰值零，不以零樣本冒充靜音。代表戰鬥畫面已檢視；這不是自然戰役、人工聽感、實體喇叭或完整 BGM 混音驗收。

English: Seven Node/19 Chromium checks PASS. Native menu/Start and AudioContext activation precede explicitly controlled existing commanders/2,000-HP enemies; real right-click melee damage and cue routing pass. Native mute/unmute,100-request throttle, nonzero/unclipped actual audio and WAV/WebM export pass. Muted sample counts are16,384/18,432/18,432, all zero peak; zero samples do not count as silence. Representative combat images were reviewed; this is not natural-campaign/human-listening/physical-speaker/full-BGM-mix acceptance.

繁體中文：錄音為 master 前的 SFX 分流，含操作提示，不含 BGM／環境聲，不是純武器單音。歷史 FAIL、時鐘、嚴格存讀與性能／硬體缺口保留。未公開部署。已接續選取面板肖像：重用當前文明已載入的 Atlas，不新製素材或改英雄規則。

English: Recordings tap SFX before master gain and include command cues, excluding BGM/ambience; not isolated weapon notes. Historical FAIL, clock, strict saves and performance/hardware gaps remain. No public deployment. Continuing selected-unit portraits using existing loaded civilization atlases, without new art or hero-rule changes.

BILINGUAL_DOCUMENTATION_REQUIRED = true
