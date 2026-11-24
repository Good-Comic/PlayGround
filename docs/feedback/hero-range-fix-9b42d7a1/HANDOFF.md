# 英雄直控遵守既有攻擊距離

## 玩家實際差異

已修正先右鍵指定可見敵人、再Tab直控時可對距離4的目標原地近戰命中的缺陷。直控仍保留玩家指定目標，但必須實際進入既有攻擊距離才造成傷害；WASD接近、放開後可正常攻擊。沒有調整射程資料、傷害、移速、冷卻、技能、碰撞或視野數值。

`js/game.js` `updateHeroDirect` 在既有目標選擇與attackUnit之間，加上與一般玩家updateAttack相同的距離檢查：單位目標使用既有unitRange加目標半徑；建築使用既有unitRange−0.1。索敵及人工目標優先規則完全保留，找得到目標不再等於可以攻擊。

## 合法獨立續作：修正前次過度保守的判斷

前次只將英雄實作標為Ownership阻塞，未充分使用正式恢復指引的獨立續作選項。本輪重新核對：`docs/handoff/SHARED-RULES.md` 明定「Another owner must be confirmed stopped **or use an independent branch/task**」；`tools/dev/agent_handoff.py` 第65行的恢復指引亦允許原Owner無法確認停止時使用獨立續作分支／任務。

沒有宣稱原Agent已停止，也沒有解除或冒用原Owner。已唯讀核實原分支 `codex/riftwatch-rts-5e8e3c9e6699` HEAD `b61a726c0d34d9aca3e027a57f7c5c22659f33d3` 是本次安全基線 `81d4def81330b8609a71ccfc96f20eecbb9bc214` 的祖先（merge-base --is-ancestor回傳0）；該原分支沒有本機Worktree，交付前遠端仍是相同HEAD。

因此本輪隔離認領「新重現的距離驗證缺陷」，僅在新分支提交；原英雄Owner及原分支保持原樣。解除的是對獨立修正範圍的過度保守判斷，不是舊Owner狀態。沒有覆寫或合併其工作。

有效Strategy遠端 `e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d`。Ownership核對v389後Dry Run→CAS→正常Push取得v390，收據 `f56a06b347b314805a4a3bc548e553ca62a7eb56`。新任務 `HERO-RANGE-FIX-9B42D7A1`，Agent `hero-range-fix-9b42d7a1`，Execution `hero-range-fix-20261124-9b42d7a1`，分支 `codex/riftwatch-hero-range-fix-9b42d7a1`。

## 前後證據與必要驗證

沿用已封存的修改前證據 `docs/feedback/hero-reach-audit-5a24d8c1/`，不重跑舊矩陣。舊版距離4時原地造成12傷害，既有實際判定距離約1.16；此診斷歷史完整保留。

Node先用新測試重現舊版FAIL，原紀錄保留。修正後5檔通過：新 `hero-direct-range`，既有 `hero-direct-command`、`hero-core-guard`、`targeting`、`visibility`。覆蓋16文明、近／遠、有／無手動目標、建築距離、手動目標不被附近敵人取代、未發現目標、存讀後直控／目標仍正確、暫停不走模擬時間。距離檢查本身不消耗RNG；合法攻擊仍走原attackUnit流程。不宣稱修正非法命中後整個未來戰役RNG軌跡必然不變。

Chromium154.0.8037.57：4語×3場景，共12組；正式構建 `9dac802c859d1aa4d7f926d8eae541c3f5bc1712` 的168資源SHA-256全部相符。

- 原生滑鼠選英雄、右鍵指定距離4目標、Tab切直控；第一tick敵HP仍60，沒有非法命中，目標仍保留。
- 原生持續按D＋S接近，39個unit-update tick後英雄x由12到13.6575；放開按鍵，在距離1.0225、合法判定1.16內造成12傷害。
- 新目標距離1.4不命中；近身1.1正常命中。四語結果一致。

記錄INTENT（直控接近指定目標）→COMMAND_SENT（原生右鍵／Tab／持續按鍵）→COMMAND_ACCEPTED（模式／目標確認）→EXECUTED（英雄實際位移）→EFFECT_OBSERVED（在合法距離造成傷害）。只有隔離場景，不外推整場戰役減傷、勝率或真人趣味。

測試使用受控平坦場景及真實updateUnits；保留正式Crowd碰撞、敵軍移動與視野判斷，未直接改敵HP。這是單位控制驗證，不是完整Game.update自然戰役；敵人也向英雄接近，未把全部距離縮短歸因於玩家。

## 限制及交接

NOT_TESTED：完整自然戰役、NG+、100／200單位性能、實體Windows GPU、操作影片。沒有新增每幀掃描或全節點渲染；未以此宣稱性能PASS。Q/E程式未動，本輪沒有重跑全部技能視覺矩陣。

新增的存讀／暫停測試與證據在受測程式提交之後保存，正式執行資源未再修改。原Fun Lab與Progress Feed Owner保持不動，未向其範圍寫入。未修改main、Pages、公開版本或RC；沒有部署，也不宣稱背景排程已驗收。

下一步：從既有戰術失敗清單選下一項高影響、可獨立隔離的缺陷，不重跑本次已充分的距離觀察或自然全戰役。
