# Boss 原生驗證與命中音效 / Boss native validation and impact audio

**繁體中文：** 本執行者無法證明與前一 Owner 為同一實例，故以隨機識別碼建立本工作階段的自聲明專案身分 `codex-boss-native-e0501de87ceb`，認領任務 `V240-BOSS-NATIVE-E0501DE87CEB`、獨立分支 `codex/riftwatch-boss-native-e0501de87ceb`。遠端所有權版本 206 已驗證；此識別符並非平台認證。分支直接依賴 `codex/riftwatch-boss-feedback-48e291abfa21` 的 `08e266481b9247fd59c756512417b9a6995396b7`，未接管舊任務。

直接提供原始碼時缺少 `build-metadata.json`，遊戲完整性檢查因此停用開始按鈕。原淺層部分檢出缺少 2490 個 Git 物件，普通 fetch 因提交已存在而未補齊；`git fetch --refetch --depth=1 --no-tags origin refs/heads/codex/riftwatch-boss-feedback-48e291abfa21` 取得完整物件，缺失數驗證為零。正式 `tools/qa/build_playtest.py` 從上述提交產生新的本地產物，127 個檔案通過瀏覽器哈希驗證，未更動既有構建或部署。

真實 Chromium 執行專案原有 Boss 場景，僅移除因本機缺少 ffmpeg 而無法使用的錄影功能；八項檢查通過，包括兩種 Boss 實際預警、緊急倒數、原生右鍵閃避與見證單位受傷。Boss 為受控生成，觀察時有暫停，並非自然完整戰役。額外在驗證構建中檢查上下邊緣部分可見與完全離屏，四種位置符合預期；該補充檢查直接呼叫正式繪製函式，並非完整玩家實戰。結果和截圖位於 `boss-native-e0501-evidence/`。

新切片讓 Boss 區域攻擊實際落地時播放獨立的兩音命中提示，保留傷害、計時與一般攻擊音效；遵守靜音、節流及模擬 RNG 隔離。五個定向 Node 測試檔通過；真實 Chromium 在受控區域確認落地前零振盪器、落地兩個、無重複、靜音不新增及 RNG 不變。真人聽感與實體 GPU 未驗證；自然十波與既有歷史 FAIL 保留。Progress Feed 由其他 Owner 持有，待合法同步。

**English:** This executor cannot prove it is the prior owner, so a random identifier was used for session-scoped self-declared project identity `codex-boss-native-e0501de87ceb` and independent task `V240-BOSS-NATIVE-E0501DE87CEB` on `codex/riftwatch-boss-native-e0501de87ceb`. Remote ownership version 206 was verified; this identity is not platform authenticated. The branch directly depends on `codex/riftwatch-boss-feedback-48e291abfa21` at `08e266481b9247fd59c756512417b9a6995396b7`; no previous task was taken over.

Raw source lacked `build-metadata.json`, so the game's integrity check disabled Start. The partial shallow checkout lacked 2490 Git objects; ordinary fetch did not fill them because the commit already existed. `git fetch --refetch --depth=1 --no-tags origin refs/heads/codex/riftwatch-boss-feedback-48e291abfa21` obtained the complete objects, with zero missing afterward. The official `tools/qa/build_playtest.py` generated a new local artifact from that commit; 127 files passed browser hash verification. No existing build was changed or deployed.

Real Chromium ran the existing Boss scenario with only video recording removed because local ffmpeg was missing; all eight checks passed, including both Boss warnings, urgent countdowns, native right-click dodge and damage to a witness. Boss spawns were controlled and observations paused, so this is not a natural full campaign. Four additional top/bottom partial and fully offscreen positions passed on the verified build; that supplementary check directly called the production renderer and is not full player combat. Results and screenshots are in `boss-native-e0501-evidence/`.

The new slice adds a distinct two-tone cue when a Boss area attack actually lands, preserving damage, timing and ordinary impact sounds, while respecting mute, throttle and simulation RNG isolation. Five focused Node test files passed; real Chromium in a controlled zone observed zero oscillators before impact, two on impact, no repetition or muted additions, and unchanged RNG. Human listening and physical GPU remain untested; natural ten waves and historical failures remain outstanding. The Progress Feed belongs to another owner and awaits authorized synchronization.
