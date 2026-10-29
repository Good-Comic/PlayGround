# 蒙古騎射兵文明外觀 / Mongol horse-archer civilization appearance

繁體中文：來源與精確Build為f5ed73b887a85e881de74fc0f46783f5e0e615e0，53檔payload SHA256一致。新原創SVG／PNG包含複合弓、拉弦／放箭動作、箭袋、盔飾馬尾、馬匹四足與馬具；八方向×五狀態×四影格共160影格。原創生成器在tools/art，沒有外部商業素材或新增授權依賴。這是MNG玩家既有horse_archer的文明外觀變體，不是新獨占兵種或只換色；其他文明及敵軍保留原有騎射兵程序繪圖，PER戰象保持原成果。

English: Source and exact Build are f5ed73b887a85e881de74fc0f46783f5e0e615e0, with53payload SHA256 hashes verified. New original SVG/PNG depicts composite bow, draw/release action, quiver, horsehair helm, four-leg gait and tack: eight directions×five states×four frames total160frames. Generator is in tools/art; no external commercial artwork or new license dependency. This is a civilization appearance variant of the existing MNG player horse_archer, not a new exclusive unit or recoloring. Other civilizations and enemies retain their existing procedural mounted-bow rendering; PER elephant work is preserved.

繁體中文：新增唯讀civilization-key選擇，只在玩家MNG／horse_archer套用MNG:horse_archer；不用修改模擬單位或存檔標籤。Atlas失敗時回退既有程序繪製；沿用每素材最多64影格快取。10項Node通過，包含文明／隊伍隔離、PNG邊界、既有英雄快取與變換回歸及文明訓練矩陣。13項真實Chromium本地受控檢查通過：首頁選MNG後，明示fixture提供完成馬廄／時代2但不灌資源；原生按鈕實扣35食物／25木材／40黃金，正式模擬14.015秒完成訓練。真正受訓騎射兵做正式移動／滑鼠右鍵攻擊，實際發射箭矢並造成傷害，四攻擊影格、受擊、死亡、160影格留白及回退均通過。

English: A read-only civilization-key selection applies MNG:horse_archer only to MNG player horse archers, without simulation-unit or save tags. Failed atlases retain procedural fallback and existing64-frame-per-asset bounded caching. Ten Node tests pass: civilization/team isolation, PNG bounds, existing hero cache/transform regressions and civilization training matrix. Thirteen actual local controlled Chromium checks pass. Native homepage selects MNG; an explicit fixture supplies completed stable/age2 without resource injection. The native button charges35food/25wood/40gold, and production simulation completes training in14.015seconds. That genuinely trained mounted archer performs production movement/right-click combat, fires actual arrows and causes damage. Four attack frames, hit/death,160-frame gutters and fallback pass.

繁體中文：另一個真正首頁選TEU的新局確認horse_archer未選用蒙古Atlas，並拍攝原有外觀；未將蒙古造型套到所有文明或敵人。直接檢視MNG一般縮放與TEU畫面，裝備／姿勢差異可辨識。MNG影片及TEU影片均保存在browser。這些是明示受控場景，不代表蒙古自然戰役或全部16文明品質通過。

English: A separate native-homepage TEU run verifies that horse_archer does not select the Mongol atlas and captures its existing appearance. Mongol equipment is not applied to every civilization or enemies. Direct inspection of normal-zoom MNG and TEU images distinguishes equipment/posture. Actual MNG and TEU recordings are under browser. These are explicit controlled scenes, not Mongol natural-campaign or all16-civilization quality acceptance.

繁體中文：同靜態100人場景三組交錯A/B、各暖機20draw／80樣本，Atlas平均1.06–1.54ms、回退2.52–3.57ms；三組均通過既有平均／P95與相對P50門檻。只代表同步Renderer.draw JS成本，不是完整FPS或硬體驗收。保持所有兵種數值、技能、訓練限制、碰撞、RNG與存檔規則不變。自然十波／NG+與全部歷史FAIL保留；排程未切換，無main／Pages／OmGitHub／公開部署修改。

English: Three interleaved groups on one static100-unit scene, each20draw warmup/80samples: atlas mean1.06–1.54ms versus fallback2.52–3.57ms. All meet existing mean/P95/pairedP50 gates. This measures synchronous Renderer.draw JS submission only, not fullFPS or hardware acceptance. Unit stats, skills, training restrictions, collisions, RNG and save rules remain unchanged. Natural ten-wave/NG+ and all historical FAIL remain; scheduler is not rebound, with no main/Pages/OmGitHub/public-deployment changes.

BILINGUAL_DOCUMENTATION_REQUIRED = true
