請依OMGitHub_START.md及docs/riftwatch/spec內14份完整工作檔，實際修改目前已開啟的RTS遊戲專案，持續實作、測試與修正，不只提供計畫。

遊戲名稱：繁中「世紀帝國二：裂境守望」；簡中「世纪帝国二：裂境守望」；English「Age of Empires II: Riftwatch」；日本語「エイジ オブ エンパイア II：裂境の守り」。保留Start Game及#btn-start。

先檢查正確專案及使用者修改，保留README.md、Agents.md、AGENTS.md、start.sh、capture.sh與window.ageOfAsh。沿用既有HTML/CSS/JS ES modules，不擅自換框架。不要假設歷史工作目錄、port或tmux仍有效。

先執行node tools/riftwatch/check-package.mjs，再用node tools/riftwatch/read-spec.mjs list查看規格；用read PART OFFSET 6000分段讀。每次只讀一段，按NEXT_OFFSET接續到EOF，再讀下一份；不要一次讀全部。工具不可用就用內建檔案工具分段讀。

完成資料契約與相容遷移後，依序對齊兵種／建築／戰鬥／經濟、十波與Boss、24模組及160實例、文明／C01–C32／地貌／宿敵導演、四語／操作／設定、存讀／回放／GM、視覺／千人性能與截圖。規格626key是來源母表，不是強迫專案總key恰好626。

每階段記錄真實驗收證據與下一步後繼續。保留現有四語、導演與十波可玩功能。未完成的原生引擎、母語LQA、完整素材和指定硬體性能如實標記。若只有本套件而沒有原始碼，先要求原專案位置，不能假造已修改。
