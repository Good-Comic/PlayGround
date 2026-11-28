# 進取姿態護衛索敵邊界修正

## 玩家差異及根因

既有 updateTacticalOrder 在敵人距離被護衛者超過8格時放棄追擊，但共用 scoredTarget 只有防禦姿態套用此邊界。進取姿態的護衛會在下次掃描重選剛放棄的外側敵人，交戰自動換目標也有同一缺口。

最終只改 js/targeting.js：有 guard 命令的自動索敵也遵守既有 guardOrigin 八格邊界。人工指定目標仍在原優先分支，玩家可明確取消護衛後追擊；不改射程、傷害、碰撞、索敵分數、交通優先權或尋路。不新增面板，也不加入「優先攻擊傷害城心者」的新政策。

第一版7fa57a0113f49d743fb50966afcd6dda54ca93d5僅修初次掃描；新增共用掃描反例後確認不足。最終遊戲來源 efe80f280de2068421a44d2faeb2a0ad0f4c5926 將篩選統一於 scoredTarget，game.js 回到原樣。

## 驗證

- Node：初版測試使用預設防禦姿態，前三項原本就通過；另誤寫不存在的 rightClick 方法，保留 before.tap／before-detail.tap，不算遊戲缺陷。改為進取姿態後，原版有兩項有效邊界失敗。第一版對共用掃描仍 FAIL，scan-before.tap 保留；最終5檔44項通過，含護衛、巡邏、攻擊移動、失敗後恢復、英雄護衛、人工目標及Save/Load。
- Chromium154：正式前後構建各168資源SHA-256及頁內完整性通過。原版960f5bd執行資源與本輪安全父系b9735b5相同；最終browser-final使用efe80f2。四語、1440×900／1280×720／1366×768，原生滑鼠選兵、G與點選盟友下達護衛，完整Game.update固定60Hz四秒。
- 邊界外：原版有5個更新觀察到外側目標，新版0；皆保留guard，最終位置相同。這證明無效鎖定消除，不宣稱回防更快或城心減傷。
- 邊界內：原生命令接受後實際攻擊並擊殺敵軍。extended-final延至六秒，扣除過量傷害後實際HP損失35、敵軍死亡，守軍x由10.28返回6.08且保留guard。此合法戰鬥兩版原本都通過，不能當新增擊殺收益。
- 驗證鏈：INTENT護衛盟友→COMMAND_SENT原生G／點擊→COMMAND_ACCEPTED guard→EXECUTED邊界內實際接近→DAMAGE_OBSERVED實扣35HP→THREAT_REMOVED敵人死亡→恢復原護衛。邊界外敵人刻意保留，不假稱解除該威脅。
- 100／200實際單位資料的索敵微基準：ABBA各24輪。200單位／160名守軍每輪P50原版0.396／0.381ms、新版0.483／0.427ms；100單位受JIT影響更明顯。這不是完整戰鬥FPS，不稱性能提升。初稿Node子程序git被sandbox拒絕（EPERM），改為先保存精確舊來源再讀檔，不繞過安全限制。
- 截圖原批次有選單轉場殘影，保留原圖；clean-capture等待800ms後補拍，不冒稱額外自然場次。無頁面錯誤。

## 限制及安全

場景為開闊平地與高冷卻敵弓兵，隔離既有護衛邊界；不是C-36精確重播、自然戰役或真人趣味評估。完整100／200交戰FPS、Windows實體GPU、NG+、完整十波未驗證。此修正不解決密集隊形所有接敵或護衛優先權。

安全父系 b9735b514aac991648b5583410d0541e2a8b4936；遠端Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。獨立任務 GUARD-LEASH-7B39D2E1／agent guard-leash-7b39d2e1／execution guard-leash-20261129-7b39d2e1；分支 codex/riftwatch-guard-leash-7b39d2e1。認領v422，收據13abb16d30c6793eaf0afb12284aaafac8869a70。舊護衛／Fun Lab Owner未冒用、釋放或覆寫，公開版本未部署。

本交接為成果提交前快照；最終遠端SHA與釋放由外部收據核實，避免遞迴刷新。下一項：依同批玩家證據改善生產建築主要等待原因，先建立正式狀態與可見文案的最小對照；不改訓練或資源規則。QUOTA_PERCENT_UNKNOWN；AUTO_RESUME_AVAILABLE=UNVERIFIED。
