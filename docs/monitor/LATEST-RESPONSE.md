新版 Playtest Candidate 已完成組裝與本地實玩，**尚未公開部署**。

- 遊戲 Build SHA：`d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c`。
- Candidate 保存 Commit：`3779c5d50876cb2e28590b9d250fb355fc0f8e38`；較新的 Commit 僅含驗收與發布準備。
- [下載測試包](https://github.com/Good-Comic/PlayGround/blob/3779c5d50876cb2e28590b9d250fb355fc0f8e38/docs/playtest/artifacts/Riftwatch-Playtest-d6ee34a.zip?raw=true) · [本地開啟說明](https://github.com/Good-Comic/PlayGround/blob/3779c5d50876cb2e28590b9d250fb355fc0f8e38/docs/playtest/LOCAL-PLAY.md) · [遊戲截圖與驗收](https://github.com/Good-Comic/PlayGround/tree/3779c5d50876cb2e28590b9d250fb355fc0f8e38/docs/evidence/playtest-candidate)。

已通過75項組合測試、四語667keys、最低12項瀏覽器操作與Pages子路徑複驗；Rally、文明訓練、Boss、Save/Load、24人擁擠與8人窄道均有本地證據。正常遊戲P0記錄4次重新索敵、四種資源卸貨38／17／19／9次。28個資源雜湊與實際下載Bug JSON已核對，舊存檔測試標記保持不變。

版本仍為 `PLAYTEST-EXPERIMENTAL`。歷史效能FAIL、低FPS模擬時間問題與 `HARDWARE_TEST_PENDING` 保留；沒有宣稱正式QA或線上驗收通過。Legacy #17、Integration、main與Checkpoints未改動。

[GitHub進度入口](https://github.com/Good-Comic/PlayGround/tree/codex/riftwatch-progress-feed/docs/monitor) 已可供外部讀取，狀態為 `GITHUB_PROGRESS_SYNC_READY`；7項監控測試、固定Commit的4檔案HTTP讀取及重複事件不新增Commit已驗證。它不是Codex即時串流；目前未確認可授權讀取此Cloud任務事件的介面，也沒有使用私有API或登入Cookie。

OmGitHub純部署機制尚未證實。建議使用獨立Pages分支與SHA版本目錄，預計網址為 `https://good-comic.github.io/PlayGround/`（尚未建立）。

依你第七節的授權邊界，**是否授權按[具體發布範圍](https://github.com/Good-Comic/PlayGround/blob/3779c5d50876cb2e28590b9d250fb355fc0f8e38/docs/playtest/APPROVAL-PLAN.json)，只將上述SHA的已驗證套件發布到新的 `codex/riftwatch-playtest-site`，啟用本Repo的Pages並做線上驗收？** 不建立Issue、不啟動OpenCode、不修改#17或main。若Codex網路限制阻擋驗收，需由你在UI允許精確網域 `good-comic.github.io`；我不會自行放寬白名單。
