# 已恢復兵種音效驗收 / Recovered unit-sound acceptance

繁體中文：原未提交的js/audio.js、js/game.js及tests/unit-sound.test.mjs已完整恢復並先備份。恢復後與備份SHA256逐位元組一致，正常提交為77bd027f6f2b927ccd5fb8a16a3efa3cc9c53a6f，沒有重寫原成果；本輪新增的recovered_unit_sound_browser.mjs僅用於完成缺少的驗收。音效沿用原WIP：戰象低頻衝擊、巡防車木質發射與騎射兵弦聲，從正式Game攻擊／箭矢事件傳入兵種類型。其他攻擊保留一般音色，既有55ms近戰／65ms箭矢共用節流與音量／靜音機制保留，不新增模擬計時器或消耗模擬RNG。

English: Original uncommitted js/audio.js, js/game.js and tests/unit-sound.test.mjs were fully recovered and backed up first. Their SHA256 bytes match the backup exactly and were normally committed as77bd027f6f2b927ccd5fb8a16a3efa3cc9c53a6f without rewriting the work. Newly added recovered_unit_sound_browser.mjs only completes missing acceptance. Recovered cues provide elephant low impact, wooden patrol-cart launch and mounted-bow twang via production Game attack/arrow unit-type dispatch. Other attacks keep generic timbres. Existing shared55msmelee/65msarrow throttles, volume/mute behavior remain, without new simulation timers or simulation RNG use.

繁體中文：focused-node.txt的4項PASS為中斷前原記錄；本輪另實跑同組4項測試並保存recovery-node.txt，不重複計成8個不同案例。驗證兵種音色、靜音、共用節流與真正Game有聲／無聲時傷害、投射物、冷卻及模擬RNG相同。recovery-provenance.json記錄原WIP與已提交來源的雜湊對照。

English: The4passes in focused-node.txt are original pre-interruption records. The same4tests were actually rerun this turn in recovery-node.txt, not counted as8distinct cases. They verify unit motifs, mute, shared throttling and identical production Game damage/projectiles/cooldown/simulation RNG with audible versus silent combat. recovery-provenance.json compares original WIP and committed-source hashes.

繁體中文：本輪19項真實Chromium檢查PASS，來源／Build為77bd027，55個payload SHA256一致。PER／KOR／MNG均從原生首頁Start與使用者互動恢復AudioContext；之後明示CONTROLLED_FIXTURE擺放戰鬥單位並以真正滑鼠右鍵攻擊。三種實際傷害／箭矢事件分別觸發78／320／460Hz基音的原WIP音色。原生靜音後仍有正式攻擊請求，但不新增音源且量測峰值0；取消靜音後100個同步要求只建立2或3個音源，符合共用節流。沒有Console、Page或HTTP錯誤。

English: This turn's19actual Chromium checks PASS on source/Build77bd027, with55payloadSHA256hashes matching. PER/KOR/MNG use native homepage Start/user gestures to resume AudioContext. Explicit CONTROLLED_FIXTURE units then fight via actual right-click input. Real damage/arrow events dispatch the original WIP cues with78/320/460Hz fundamental tones. Native mute retains real attack requests but creates no new voices and measures zero peak; after unmute,100synchronous requests create only2or3voices under shared throttling. No Console/Page/HTTP errors.

繁體中文：browser包含真正遊戲WebM、原生WebAudio擷取的Opus及24kHz單聲道WAV。擷取tone／noise SFX分支、位於Master增益之前，不含環境音／BGM，不是完整混音或實體喇叭聽感認證。三份解碼PCM皆非靜音，峰值約0.055–0.069，無削波；原始分析見decoded-pcm-analysis.json。畫面已檢視巡防車及戰象的實際交戰，沒有用靜態概念圖取代遊戲驗收。未宣稱跨裝置、自然戰役或完整長戰役混音通過。

English: browser contains actual gameplay WebM, captured WebAudio Opus and24kHzmonoWAV. The tap records the tone/noise SFX branch before Master gain, excluding ambience/BGM; it is not whole-mix or physical-speaker listening certification. All3decodedPCMfiles are non-silent with peaks approximately0.055–0.069 and no clipping; see decoded-pcm-analysis.json. Actual cart/elephant combat images were inspected, not replaced with concept art. No cross-device, natural-campaign or full long-campaign mix acceptance is claimed.

繁體中文：本輪僅恢復並驗收舊成果，未開始新兵種。原7f8a739與bcd03b0均作為77bd027祖先保存於原分支遠端。自然十波／NG+及所有歷史FAIL、排程未確認切換、舊9a0f19e獨立待復原均保留；沒有main、Pages、OmGitHub或公開部署修改。

English: This turn only recovered and accepted existing work, without starting a new unit. Original7f8a739andbcd03b0are preserved as ancestors of77bd027on the same remote branch. Natural ten-wave/NG+and historicalFAIL, unverified scheduler rebinding and separate older9a0f19erecovery remain. No main,Pages,OmGitHuborpublic-deploymentchanges.

BILINGUAL_DOCUMENTATION_REQUIRED = true
