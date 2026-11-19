# 原版接觸診斷與友軍近接受阻回讀

任務BASELINE-CONTACT-2F91C7A8；分支codex/riftwatch-baseline-contact-2f91c7a8；獨立執行codex-baseline-contact-2f91c7a8-20261120。認領Ownership346，收據da355ca5a18d7ffcfc90e74018c9b05da42a68dd。從141d6aa707e1b0b5c67d63c089eda92aa8b102ec繼承。Strategy仍e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，使用者最新GAME FIRST指令優先；原Fun Lab未接管。未改main、Pages、RC、公開版本或其他Owner文件。

正式程式／構建來源da77971cd9f0ef833ba80aba143b92addaa02b8b。該提交包含最新有效遊戲成果，只改命令摘要與四語文案，沒有重新套用否決退路補丁。

## 原版22號診斷

單一6混兵/.7、FRK、steppe、seed42、20模擬秒。沿用原觀察器並新增可指定actor ID、阻擋者幾何／射程與未進入steer的步驟，與未包裝控制逐幀digest／snapshot（只排除savedAt）完全一致，digest仍9a63effc1b64d77c889e44f91476af5358fb4d0d9c8f6452912b3ae043be52c5，和上輪原版相同。不是自然C36原始地圖精確回放。

22號0命中、719次steer、總路程11.655格。stepToward回傳718次moving、1次pending、1次congested；不能把moving回傳值當成實際移動。3.5167秒的steer為null，距目標1.3411，正式攻擊射程0.9，規劃射程0.8。23號已在射程內站定攻擊，25號還在射程外追擊；兩者身體形成近接阻擋。這支持需要區分等待預算與友軍阻擋，不表示已證明所有繞行路線皆不可行。11.1秒回傳congested，命令的實際取消由updateAttack之後處理，步驟記錄中的manual仍true不能誤解為取消失效。

## 玩家可見改善

既有命令摘要新增「友軍近接受阻N」，四語完整。只計目前選兵中對可見人工目標仍在射程外、state為attack、nav.stalled大於0.1，且最近掃掠阻擋清單確實含目前存活同隊實體者。使用現有nav資料，不加每幀觀察器或更動模擬。0.1秒僅為顯示門檻，不改遊戲任何停滯／壅塞判定。

不讀歷史orderFailure來猜卡死；敵軍、陣亡或舊物件不計；進入射程或恢復移動即移除提示。沒有新增按鈕，沿用「選取射程外」後手動改走側翼，前排命令不變。提示不聲稱路線不可達、已命中或必然能解圍。這是可操作資訊改善，不宣稱C36尋路修復。

## 驗證

Node：readback-contact與command-readback兩個測試檔PASS。新增定向情境覆蓋真實欄位、歷史／短接觸／敵軍／死亡／舊實體不誤報、恢復移動／射程／迷霧清除、四語及snapshot／雙RNG不變。額外診斷觀察器／控制相等PASS，沒有重跑八組矩陣或三角色自然戰役。

官方build_playtest.py固定來源構建168項資源；Chromium各列逐檔SHA-256與頁面SHA256_MATCH_168_FILES均PASS。未增加資源檔。

Chromium154正式構建：原版繁中1440×900，修改後繁中1440×900、簡中1280×720、英文1280×720、日文1366×768，共5列PASS，零pageerror。每列原生滑鼠點全軍→右鍵敵城心；固定步進至3.55秒，射程內4／外2且實際友軍受阻1。原版無原因提示，新版四語顯示正確。實際滑鼠點射程外選取，不新增命令且不選前排；右鍵改走側翼後只有所選後排取消集火，前排保留人工目標，受阻提示移除。

這是正常地圖上的受控遊戲場景。為與Node條件相符，game.update暫以固定updateUnits／updateProjectiles驅動替代，保留實際Canvas、HUD與原生輸入；不是自然遊戲、完整更新迴圈、暫停或性能驗收。沒有直接寫nav.stalled來製造Chrome提示。Browser before來源03876742a6f76bd857e6f31fec1355371b3c8a43，已確認它與141d6aa的js/css/assets/index完全相同，差異只有QA／文件，因此可作執行payload前版對照；不得混稱before構建是141d6aa。

首次Chromium啟動在沙箱受限失敗，完整原報告保留；以正式授權的本地執行重新啟動後通過。修改前後繁中、英文畫面已檢視，換行可見且按鈕可操作。沒有錄影。100／200實際戰鬥FPS、P50／P95、記憶體趨勢、實體WindowsGPU、長時間、自然十波、Save／Load操作與NG+本輪NOT_TESTED；不把本次Node snapshot不變擴張成完整存檔認證。

## 接續

C36實際繞行／阻擋仍未修復。下一項最高價值工作是用原版22號3.5秒附近的阻擋幾何，隔離是否有合法繞行路線及為何未被選用；不要重試無路徑意圖的後退扇形，也不要延長失敗時間或加傷害求勝。

STOP_REASON：AGENT_EARLY_STOP，本輪完成診斷與可見回讀改善後交接，仍有後續合法診斷，未宣稱平台或額度中斷。EXECUTION_DURATION：未完整量測；模擬樣本各20秒不是開發耗時。AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。未改排程、Feed、公開部署或其他Owner文件。
