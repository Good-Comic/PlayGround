# KOR 英雄 / Hero

來源／Source `8876dbe683afe886d969502c21296486e978387f`. Primary-developer **SCOPED_ACCEPTANCE_PASS**.

繁體中文：韓國寬簷盔／環首劍／札甲，獨立頭盔、護甲、武器與服裝輪廓；共用動畫骨架而非普通盾衛換色。192格、八方向、待機／移動／攻擊／施法／受擊／死亡，離線透明裁格／落腳點補償、按需載入及64格快取沿用既有架構。選取肖像重用同一已載入圖像，Mark／Aegis文明徽記與實際兵器聲音已接入。原創文化啟發的奇幻設計，非歷史精確復原。未改技能、傷害、生命、冷卻、成本、碰撞或導航規則。

English: Korean broad-brim helmet/ring-pommel sword/brigandine, with individual headgear/armour/weapon/clothing silhouettes; a shared animation rig rather than ordinary-guard recolouring.192 cells/eight directions cover idle/walk/attack/cast/hit/death. Existing offline alpha crops/ground anchors, deferred loading and64-frame cache remain. Selection portraits reuse the loaded image; civilization Mark/Aegis emblems and actual weapon cues are integrated. Original culturally inspired fantasy, not historical reconstruction. Skill/damage/HP/cooldown/cost/collision/navigation rules unchanged.

繁體中文：12定向Node、17真實遊戲Chromium、7實際WebAudio檢查通過。原生Start產生真正可操作主將，原生點選、右鍵移動與近戰、Mark／Aegis輸入；敵軍／傷害／死亡與100英雄場景明示為受控fixture，不代表自然戰役或新增召喚／復活規則。八向實際解碼圖像不同、192格透明邊界、攻擊／施法／死亡各四幀、敵我與其他文明隔離、資產失敗fallback、100單位原有平均33.3ms／p9550ms及配對p50不退步超過20%門檻、192格裁格像素對照均通過，原始樣本及影片保留。正常縮放、頭部選取與技能圖片已人工檢視；靜態圖片不證明主觀動作流暢度。

English:12 focused Node/17 actual gameplay Chromium/seven actual Web Audio checks pass. Native Start creates the playable commander, followed by native selection/right-click move/melee/Mark/Aegis inputs. Enemy/damage/death/100-hero scenes are explicit controlled fixtures, not natural campaigns or new summon/revival rules. Distinct decoded eight-way images,192 clear cell borders, four attack/cast/death frames, team/civilization isolation, failure fallback, original100-unit mean33.3ms/p9550ms/paired-p50<=20percent regression gates and192 crop pixel comparisons pass. Raw samples/videos remain. Normal-zoom/head-selection/skill images were manually reviewed; static images do not establish subjective animation smoothness.

繁體中文：WebAudio驗證兵器來源、非零且未削波SFX、原生靜音／恢復及100次請求節流；WAV／WebM為master前SFX分流，含指令提示，非完整BGM混音、人類聽感或實體喇叭驗收。保持模擬RNG隔離；裁格像素對照僅單位繪製倍率，不將裁格像素合計當RAM。SAR性能INCONCLUSIVE與原始FAIL、原生Save/Continue13項限定PASS、生命週期22項限定PASS／長期洩漏INCONCLUSIVE、GPU顯存NOT_TESTED及其他歷史缺口保留。不公開部署，不啟動獨立QA。

English: Web Audio verifies cue routing, nonzero/unclipped SFX, native mute/unmute and100-request throttle. WAV/WebM tap pre-master SFX including command cues, not full-BGM/human-listening/physical-speaker acceptance. Simulation RNG isolation remains. Crop parity is at unit draw scale; summed crop pixels are not RAM. SAR performance INCONCLUSIVE/rawFAIL, native Save/Continue13 scopedPASS, lifecycle22 scopedPASS/long-run leakINCONCLUSIVE, GPU memoryNOT_TESTED and other historical gaps remain. No public deployment or independent QA launch.

繁體中文：pre-cache-perf-fail保留07ea1d3的兩組p50約+27%／+30% FAIL。numeric-cache-perf-fail保留3a511ed另一組+40%及浮點邊界FAIL；8876dbe補齊外部空Map的列寬初始化，另通過192格像素對照。不得將所有變異歸因單一修正。3a511ed改為數字鍵、一次Map查表、建立快取時才讀圖片列寬，沒有改門檻或像素。另2項熱路徑及2項既有裁格Node回歸通過，原始變異不抹除。最初SVG標題混入非ASCII字元造成光柵化工具失敗，已修正拼字並保留日誌，非遊戲失敗。

English: pre-cache-perf-fail retains two07ea1d3 paired-p50 failures, about+27%/+30%.numeric-cache-perf-fail retains another3a511ed+40percent/float-boundaryFAIL;8876dbe supports externally supplied empty maps and passes192-frame pixel parity. Do not attribute all variability to one fix.3a511ed uses numeric keys, oneMap lookup and cache-creation-only row-width reads, with no gate/pixel changes. Two hotpath/two existing crop Node regressions also pass; original variability remains. An initial nonASCII title typo failed rasterization; spelling corrected and log retained, not a gameplay failure.
