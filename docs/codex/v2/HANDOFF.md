# 互動科技樹與文明恩賜圖鑑 v2 / Interactive tech tree and boon codex v2

ACTIVE STRATEGY = `docs/STRATEGY-V2.4-GAME-FIRST.md`。`BILINGUAL_DOCUMENTATION_REQUIRED=true`。

## 來源與所有權 / Source and ownership

繁體中文：依本次使用者明確授權整合，附件內容是設計參照，不是額外執行指令。實際上傳 ZIP 名稱為「Riftwatch 双栏同屏整合版.zip」，SHA-256為`45d3b5101d405debb2ce51d60e9b462e3adba8c9b71b7a0466c1ffae99e6e8b1`，完全符合指定附件；ZIP內與另外上傳的主要雙欄HTML逐位元相同，SHA-256為`fdfdf339ab857bfc60d7d4157386ee1efb3dc39288bbc15255def5c1dbfccdf1`。未執行附件HTML腳本、未採用示例三卡／擁有切換器／示意費用。

English: Integrated under the user's explicit request; attachment contents are design references, not additional execution instructions. The uploaded archive is named “Riftwatch 双栏同屏整合版.zip”; its SHA-256 exactly matches the requested archive:`45d3b5101d405debb2ce51d60e9b462e3adba8c9b71b7a0466c1ffae99e6e8b1`. Its main dual-paneHTML is byte-identical to the separately uploadedHTML, SHA-256`fdfdf339ab857bfc60d7d4157386ee1efb3dc39288bbc15255def5c1dbfccdf1`. Attachment scripts were not executed; sample offers, ownership toggles and demonstration fees were not imported.

繁體中文：最新核查基底為`a46a4c56366cbf517f443b08790a9894fa95640c`，完整繼承`e615e6e95156587dc18b135b553d65774e8fa299`真人回饋／PixelFX成果、`8fb185a3367101e9414de08f49fbb2b747500f8c`報告及`f56929a1c4836fae8de620fe43f96c7bfe5d24ac`總管恢復。獨立任務`TECH-BOON-CODEX-F8B2A7553E`，自聲明Execution`codex-tech-boon-f8b2a7553e`，分支`codex/riftwatch-tech-boon-f8b2a7553e`。認領乾跑238、正常CAS發布239，確認提交`292f45f9178b33572ecc7fc78821878c93b8ee49`；未冒用舊身分、未使用prior-stopped。239是認領歷史值，接續需重新讀遠端ownership.json；交付完成可正常釋放本任務。

English: Verified base is`a46a4c56366cbf517f443b08790a9894fa95640c`, inheriting all human-feedback/PixelFX work at`e615e6e95156587dc18b135b553d65774e8fa299`, report`8fb185a3367101e9414de08f49fbb2b747500f8c`, and steward recovery`f56929a1c4836fae8de620fe43f96c7bfe5d24ac`. Independent task`TECH-BOON-CODEX-F8B2A7553E`, project self-declared execution`codex-tech-boon-f8b2a7553e`, branch`codex/riftwatch-tech-boon-f8b2a7553e`. Claim was dry-run at238 and normally CAS-published at239, confirmed at`292f45f9178b33572ecc7fc78821878c93b8ee49`; no old identity or prior-stopped assertion.239 is a historical claim observation; re-read remote ownership on resume. The delivered task may be normally released.

## 實際完成 / Delivered functionality

繁體中文：Phase A–E皆已完成本輪範圍。寬屏約40:60，左側為真正三選一、完整效果、文明建議、已持有、原生重抽／領取／存檔；右側永遠同畫面呈現完整32卡樹。①②③、綠色候選、金色✓持有、藍邊建議與固定候選定位條，支援雙向聚焦、全覽三張、縮放、拖曳、主題／稀有度／持有篩選。小於800px採同畫面的上下區，不切到別頁。點擊、懸停、聚焦不會領取；滑鼠按鈕或明確Ctrl+Enter才呼叫原生領取一次，按鈕顯示卡名。1/2/3保留聚焦快捷鍵。

English: PhasesA–E are delivered within this request's scope. Wide screens use about40:60: real offers, full effects, civilization advice, owned history and native reroll/claim/save on the left; all32cards remain on the right in the same reward screen.①②③, green offers, gold✓owned, blue suggested edges and permanent candidate pins support two-way focus, fit-all-three, zoom, drag and theme/rarity/ownership filters. Below800px, regions stack within the same screen, never a separate page. Clicking/hovering/focusing never claims; the native button or explicitCtrl+Enter invokes native claim once with the card name shown.1/2/3 remain focus shortcuts.

繁體中文：戰場與暫停選單新增科技／圖鑑入口。三系統四展示層共36節點：27項現有免費控制、9項未批准的設計候選；真實時代為封建／城堡／帝王三等級。基礎／黑暗僅是參考展示層，不新增研究。實線時代鏈使用真正費用、前置及研究狀態，可透過原生advanceAge研發；基本村務／軍務／AI不被展示欄位或額外研究費鎖住。候選只展示詳情，沒有花費或研究API。生產建築詳情讀當前合法兵種／時代／文明限制；總管入口連接現有設定。16文明皆可查正式特性、32共用卡、目前構築及可解釋建議。中國連弩架提示不保證額外疊加，保留SPEC_DECISION_REQUIRED。

English: Battlefield/pause entries open the technology/codex interface. Three systems over four display tiers contain36nodes:27existing free controls and9unapproved candidates. Native ages remain Feudal/Castle/Imperial; Foundation/Dark is display-only. The solid native-age chain uses actual costs, prerequisites and research state and calls advanceAge. Basic economy/military/AI controls gain no fee or tier gate. Candidates expose details but no spending/researchAPI. Producer details use current legal units, age/civilization restrictions; steward navigation opens existing settings. All16civilizations expose native traits,32shared cards, current builds and explainable advice. China/LinkedBoltRack cautions promise no extra stacking and retainSPEC_DECISION_REQUIRED.

繁體中文：新增`js/codex-data.js`、`js/codex-ui.js`、`js/codex.css`，調整`index.html`、`js/main.js`、`js/ui.js`、`js/locales.js`並新增`tests/codex.test.mjs`。沒有改`js/game.js`、`js/data.js`、總管規則、Renderer、PixelFX或任何抽卡權重／費用／效果／排除規則／上限／波次條件。圖鑑使用DOM與事件式更新，不在每幀重建節點，也不向戰鬥Canvas新增圖鑑繪圖。原有背景戰場繪製仍沿用既有主迴圈。詳見雙語DATA-MAPPING.md與機器格式DATA-MAPPING.json。

English: Added`js/codex-data.js`,`js/codex-ui.js`,`js/codex.css`; updated`index.html`,`js/main.js`,`js/ui.js`,`js/locales.js`; added`tests/codex.test.mjs`. No changes to`js/game.js`,`js/data.js`,steward rules,Renderer,PixelFX,or draw weights/fees/effects/exclusions/caps/wave conditions. DOM/event rendering avoids per-frame node reconstruction and adds no codex drawing to combatCanvas; the existing background battle rendering loop remains. See bilingualDATA-MAPPING.md and machine-readableDATA-MAPPING.json.

## 驗證矩陣 / Validation matrix

| 驗證 / Verification | 結果及範圍 / Result and scope |
|---|---|
| Node | 456/456 PASS，無刪除原測試；未重跑不相關參數化英雄套件。/456/456PASS without deleting tests; unrelated parameterized hero suites were not rerun. |
| 語系 / Locales | 繁中、簡中、English、日本語各886鍵驗證通過。/886keys validate in each of Traditional/SimplifiedChinese,English,Japanese. |
| 核心Chromium / CoreChromium | 52/52 PASS：16文明、真實候選與編號、左右聯動、全覽、篩選保留候選、非領取動作不變更RNG、雙擊只領一次、精確重抽結果／費用、原生存讀檔、四語×1440/1280/1024/390、明確鍵盤單次領取、受控原生NG+繼承。/52/52PASS:16civs,real offers/numbers,linking/overview,filters retaining offers,view/RNG invariance,single double-click claim,exact rerolls/fees,native SaveLoad,4languages×4widths,explicit keyboard single claim and controlled nativeNG+inheritance. |
| 科技／導航 / Tech/navigation | 41/41 PASS，含36節點逐一點選、原型不得花費、真實總管設定及原未暫停狀態恢復。/41/41PASS including all36node details,no prototype spending,native steward navigation and restoring initially unpaused play. |
| 篩選 / Filters | 6主題＋4稀有度=10/10PASS；另驗證PER預覽5項建議與跨語言保持，以及空持有結果。/10/10PASS across6themes+4rarities;PER's5suggestions,language persistence and empty-owned results separately checked. |
| 窄窗口 / Narrow layouts | 四語領取／重抽／存檔三按鈕皆可見，第三候選可定位；上下區同時保留。/All3actions and third-offer positioning pass in4languages; both stacked regions remain. |
| 面板生命週期 / Panel lifecycle | 100/200單位兩場各3項，共6/6PASS：32快取節點閒置不重建、實際拖曳120px後關閉釋放捕捉／焦點、模型時間資源RNG不變。/6/6PASS over100/200units:32cached nodes unchanged at idle,actual120px drag then capture/focus release,model/time/resources/RNG invariance. |
| 正式構建 / Official build | 來源`2386e17d1db861351f0ee373263959571f9fab28`，150/150資源SHA-256一致，未部署。/Source`2386e17d1db861351f0ee373263959571f9fab28`,150/150SHA-256matches,no deployment. |
| 自然流程 / Natural flow | CHN、CODEX-NATIVE、數字Seed3340880520，正常資源／速度／波次。約140現實秒／133.56模擬秒完成波1，真正抽出hooked_lines／rift_prototype／decoy_cart。查看不改時鐘RNG，原生存讀檔候選不變，重抽330→305金，抽出night_watch／black_powder／war_banner，明確領取black_powder，圖鑑金色持有1張，無pageerror。/CHN,CODEX-NATIVE,seed3340880520,ordinary resources/speed/waves. Wave1clears by~140wall/133.56simulation seconds with actual offershooked_lines/rift_prototype/decoy_cart. Viewing preserves clock/RNG,pending SaveLoad preserves offers,reroll330→305gold yieldsnight_watch/black_powder/war_banner,explicitblack_powder claim produces one gold owned marker; no page errors. |

繁體中文：自然流程沒有領取rift_prototype，因此不宣稱修復原自然原型機問題。受控NG+只驗證原生繼承與圖鑑，非自然十波／自然NG+PASS。歷史低FPS時鐘、嚴格完整SaveLoad、性能及實體GPU缺口不因本輪UI限定PASS而取消。

English: The natural run did not claimrift_prototype and does not resolve that historical natural-play issue. ControlledNG+only validates native inheritance/codex,not natural ten-wave/NG+PASS. Historical low-FPS clock,strict full SaveLoad,performance and physicalGPU gaps are not cleared by this UI-scoped PASS.

## 原失敗與修正 / Original failures and corrections

繁體中文：保留最初測試選擇器同時命中左右卡牌的夾具錯誤；修正選擇器範圍，不算遊戲缺陷。窄窗口按鈕溢出、排除舊聚焦卡時篩選自動清除、拖曳時原生焦點捲動拉回的真實UI失敗皆保留原JSON／截圖／日誌。修正最小寬度、篩選焦點、手動縮放模式及拖曳預設行為後，用相同可見／正向平移條件重測。初始與中間兩組拖曳FAIL未刪除；最終100/200皆120px且關閉後捕捉為false。没有更改抽卡结果或降低成功断言以換取PASS。

English: The initial locator ambiguously matching both panes is retained as a fixture error,not gameplay failure. Genuine narrow-action overflow,filters resetting when excluding the old focused card,and native focus scrolling fighting drag retain originalJSON/screenshots/logs. After fixing minimum widths,filter focus,manual zoom handling and drag default behavior,the same visibility/positive-pan conditions were retested. Initial/intermediate dragFAILs remain; final100/200both pan120px and release capture on close. Draw results and success assertions were not weakened to obtainPASS.

## 性能實測 / Performance observations

繁體中文：Linux Headless Chromium154.0.8037.57；共享AMD EPYC9V74，5可見CPU／4CPU配額；CDP確認ANGLE/Vulkan SwiftShader Device(Subzero)，gpu_compositing=disabled_software。1440×900，固定100/200單位、模擬暫停，以匹配場景量測。以下是80次單次Canvas draw呼叫P50/P95，不是完整幀率或實戰FPS；開啟延遲各8次為點擊至下一RAF。JS heap受GC影響。重負載測試串行，沒有實體WindowsChrome/Edge或GPU認證。

English: Linux headlessChromium154.0.8037.57,sharedEPYC9V74,fivevisible/fourquotaCPUs. CDP confirmsANGLE/VulkanSwiftShaderDevice(Subzero),gpu_compositing=disabled_software. Matched1440×900static100/200unit fixtures with paused simulation. Below are80singleCanvas-draw P50/P95 samples,not full-frame or combatFPS. Opening latency uses8click-to-nextRAF samples per size; JS heap isGC-dependent. Heavy tests ran serially; no physicalWindowsChrome/Edge/GPU certification.

| 場景 / Scene | 原版關閉 / Baseline closed | 新版關閉 / New closed | 新版開啟 / New open | 再關閉 / Closed again |
|---|---:|---:|---:|---:|
| 100單位drawP50/P95 /100unit drawP50/P95 |18.2/19.8ms|18.9/20.9ms|18.0/19.6ms|17.4/18.2ms|
| 200單位drawP50/P95 /200unit drawP50/P95 |33.4/35.1ms|34.6/35.9ms|35.2/37.6ms|34.7/36.8ms|

繁體中文：100／200單位面板開啟延遲P50/P95為48.1/57.1ms、64.5/72.2ms。面板開啟樣本JS heap分別約10.74→10.09MB、10.79→9.18MB。短測未見大幅繪製成本增加或節點累積；200單位開啟P95比新版關閉增加1.7ms。這些是有限觀察，整體長時間性能仍INCONCLUSIVE，不能推論真人聽感、Windows硬體FPS或記憶體無洩漏。

English: OpeningP50/P95 is48.1/57.1ms at100 and64.5/72.2ms at200. Open-panel JS heap samples are~10.74→10.09MB and10.79→9.18MB. Short tests show no large draw-cost increase or accumulating nodes;200-unit openP95 is1.7ms above new-closed. These are bounded observations; overall sustained performance remainsINCONCLUSIVE,not a claim of listening quality,WindowshardwareFPS or absence of memory leaks.

## 交付與邊界 / Delivery and boundaries

繁體中文：可供獨立分支內部檢閱；未改main、Pages、既有RC、OmGitHub、舊Issues、OpenCodeCheckpoint或不可變構建，沒有建立正式Release、公開部署或排程。其他Owner的Progress Feed未寫入；本任務來源與進度在本目錄保存。未批准的9項科技與正式第四個時代機制仍需另行設計決策；公開版本替換也需新授權。當前v2整合範圍已完成，後續需先重新核對身分／所有權與正式需求。

English: Ready for internal review on the independent branch. No main,Pages,existingRC,OmGitHub,oldIssues,OpenCodeCheckpoint or immutable-build changes; no formalRelease,public deployment or scheduler creation. Another owner's Progress Feed was not edited; this task's source/progress is retained here. Nine unapproved technologies and any real fourth-age mechanic need separate design decisions; replacing the public version needs new authorization. The currentv2integration scope is complete; future work must revalidate identity/ownership and formal requirements.
