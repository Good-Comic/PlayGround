# 閒置村民輪選 / Idle villager cycling

**繁體中文：** 獨立任務 `V240-IDLE-CYCLE-F3AA9E6A7971` 遠端 Ownership 版本 219；`codex-idle-f3aa9e6a7971` 為本次執行自聲明專案身份，不是平台認證。分支基於 `03d535565f2d0522f3f83f990209029deb2af548`，不接管其他任務。

原本閒置按鈕與 I 鍵每次選取同一個村民。現在單選的閒置村民會作為輪選起點，下一次選取下一位，末位後回到首位；選取其他對象或原村民不再閒置時從目前清單首位開始。沒有新增遊戲狀態、數值、RNG 或存檔欄位。

正式本機構建源自 `50536189a262a2a9cbe74f33085a65fa562bd930`，新版與基底 Chromium 均通過 127 資源雜湊。受控三村民場景中，實際 I、I、按鈕、I 操作在基底選取 7／7／7／7，新版為 7／8／9／7；原始結果與截圖位於 `idle-f3aa-evidence/`。定向 Node 測試在基底失敗、新版通過；經濟尋路及資源選取回歸通過。這是受控操作，非自然十波、實體 GPU 或真人聽感驗收；歷史失敗保留。Progress Feed 由其他 Owner 持有，待合法同步。

**English:** Independent task `V240-IDLE-CYCLE-F3AA9E6A7971` has remote ownership version 219. `codex-idle-f3aa9e6a7971` is this execution's self-declared project identity, not platform authenticated. The branch starts from `03d535565f2d0522f3f83f990209029deb2af548` without taking over other tasks.

The idle button and I key previously selected the same villager every time. A single selected idle villager is now the starting point for cycling to the next, wrapping after the last. If another object is selected or the villager is no longer idle, selection restarts at the first eligible villager. No gameplay state, values, RNG or save fields were added.

The official local build uses `50536189a262a2a9cbe74f33085a65fa562bd930`; both baseline and new Chromium builds verified 127 resource hashes. In a controlled three-villager scene, native I, I, button, I selected 7/7/7/7 on baseline and 7/8/9/7 after the change. Raw results and screenshots are in `idle-f3aa-evidence/`. Focused Node cases failed on baseline and passed after the change; economy navigation and resource-selection regressions passed. This was controlled input, not natural ten-wave, physical GPU or human listening acceptance; historical failures remain. Progress Feed belongs to another owner and awaits authorized synchronization.
