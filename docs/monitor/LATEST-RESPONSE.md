已完成 D6 的 **AFTER_DEPLOY_LIVE 限定場景驗證**，維持 `PLAYTEST-EXPERIMENTAL`。

[直接遊玩](https://good-comic.github.io/PlayGround/builds/d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c/) · [完整報告與證據](https://github.com/Good-Comic/PlayGround/blob/1a5a67c5373bdd5ede925484776339f95ded78a0/docs/evidence/live-d6/REPORT.md)

- 線上 Build：`d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c`。28項資源雜湊及583筆 HAR／Git 比對全部符合。
- 五分鐘正常遊玩：8次死亡後重新索敵；木／金／食／石卸貨85／73／51／32次；移動完成，未觀察到超過20秒的零載貨採集停滯。
- Start、建築、訓練佇列、Rally、諸葛弩、Pause／Save／Reload／Continue、四語操作與 Bug JSON 下載通過。Boss增援4→8→12及選卡後進第二波，也有**線上受控場景**證據。
- 七組場景共614次請求，Console／Page／失敗請求／HTTP錯誤皆0。

保留兩項觀察：正常場景五分鐘後仍有一台攻城槌存活，需診斷殘敵追擊與波次條件；三個非英文介面的 Start Game 仍為英文。**自然十波、全部文明、正式效能與硬體驗收未完成**，歷史性能 FAIL、低FPS時間問題及 `HARDWARE_TEST_PENDING` 不變。

驗收分支 `codex/riftwatch-v226-live-acceptance` 已推送：`1a5a67c5373bdd5ede925484776339f95ded78a0`。Progress Feed、Recovery、Handoff 已更新；main、#17、Checkpoints及線上遊戲資源未修改。下一個修正切片優先核對殘敵／carryover規格並重現，避免直接刪敵或跳波。

![真實線上繁中遊戲截圖](https://raw.githubusercontent.com/Good-Comic/PlayGround/1a5a67c5373bdd5ede925484776339f95ded78a0/docs/evidence/live-d6/locales-zh-Hant-game.png)
