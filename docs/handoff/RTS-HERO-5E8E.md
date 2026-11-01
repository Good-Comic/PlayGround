# RTS 命令可靠性 / RTS command reliability

**繁體中文：** 本執行者無法證明與前一 Owner 為同一執行實例，使用本階段自聲明專案身分 `codex-rts-5e8e3c9e6699`，以獨立任務 `V240-RTS-HERO-5E8E3C9E6699` 取得版本 208 的遠端所有權；此標識不是平台認證。分支 `codex/riftwatch-rts-5e8e3c9e6699` 基於 `b2768ac7d532a74e94ea780b86473b1b4c5d9968`，保留舊任務及分支。

英雄處於直接控制時，右鍵地面或敵人雖有命令與標記，下個單位更新卻把英雄改為待命，無法執行。現在僅當英雄實際接收移動或攻擊時退出直接控制；混選採集時未接收命令的英雄保持原模式。另一缺陷是無攻擊能力的誘餌車右鍵敵人時仍顯示成功且覆蓋巡邏；現只為可攻擊單位分配攻擊，單獨誘餌車保留原命令並收到錯誤提示。西班牙村民規則不變。

應用提交 `2caa839888a5bfafc67db9ef1254d601ab6821ee` 使用正式工具建立新本地構建，Chromium 驗證 127 檔案哈希。兩個英雄直接控制案例與兩個誘餌車案例先失敗、修正後通過；混選、戰術、西班牙村民及技能預覽相關 Node 檔案通過。真實 Chromium 以 Tab 和右鍵驗證英雄行走約 3.13 世界單位、對敵造成 14.4 傷害；另以原生右鍵驗證誘餌車單選拒絕、混選衛兵攻擊且巡邏保留。皆為受控場景，不是自然完整戰役。

混選英雄、村民、近戰與遠程的瀏覽器測試首次因鏡頭移動點到地面而失敗；調整鏡頭後分配瞬間三名攻擊者均得到目標、村民維持採集，但英雄隨後回報 `unreachable` 而放棄目標，該場景尚未驗收。首次及後續結果保留於 `rts-5e8e-evidence/`，下一步應隔離受控場景路徑與真實導航問題。另 `champion-picking.test.mjs` 的身體範圍斷言在原基底及修正後皆失敗（兩項通過、一項失敗），不得視為本修正通過。實體 GPU、自然十波及聽感仍待測；Progress Feed 由其他 Owner 持有，待合法同步。

**English:** This executor cannot prove it is the prior owner. Session-scoped self-declared project identity `codex-rts-5e8e3c9e6699` claimed independent task `V240-RTS-HERO-5E8E3C9E6699` at remote ownership version 208; this identity is not platform authenticated. Branch `codex/riftwatch-rts-5e8e3c9e6699` is based on `b2768ac7d532a74e94ea780b86473b1b4c5d9968`; previous tasks and branches remain separate.

In direct control, right-clicking ground or an enemy showed an order but the next update put the hero on hold instead of executing it. The hero now leaves direct control only when actually receiving a move or attack; an unassigned hero retains the mode during mixed gathering. Separately, a non-attacking decoy previously received false attack confirmation and lost its patrol. Attack orders now go only to capable units; a lone decoy retains its order and receives rejection feedback. Spanish villager rules remain unchanged.

The official tool built a new local artifact from application commit `2caa839888a5bfafc67db9ef1254d601ab6821ee`, and Chromium verified 127 file hashes. Two direct-control and two decoy regression cases failed before their respective fixes and passed afterward; related mixed-order, tactical, Spanish villager and skill-preview Node files passed. Real Chromium Tab and right-click moved the hero about 3.13 world units and dealt 14.4 damage; native right-click also verified lone decoy rejection and mixed guard attack with patrol retained. These are controlled scenarios, not a natural complete campaign.

The browser mixed hero/villager/melee/ranged test first clicked ground due to camera movement. After adjusting the camera, all three attackers received the target at assignment and the villager retained gathering, but the hero subsequently reported `unreachable` and abandoned its target. This scenario remains unaccepted. Initial and subsequent results are retained in `rts-5e8e-evidence/`; next isolate fixture pathing from a real navigation defect. The body-bound assertion in `champion-picking.test.mjs` also failed on both the original base and the changed code (two passed, one failed), so it is not claimed as a pass. Physical GPU, natural ten waves and listening remain pending; the Progress Feed belongs to another owner and awaits authorized synchronization.
