# 近接退路隔離診斷：候選否決，執行程式已撤回

任務 CROWD-ESCAPE-4D81A6C9，獨立執行 codex-crowd-escape-4d81a6c9-20261119，認領 Ownership342，收據115d022b110eb6d38c27a96a222461654c72a39a。從最新安全ba688b4e6dfd4e446b23161ab71af9ad26bb171c接續；Strategy遠端e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，使用者新GAME FIRST修訂優先。原Fun Lab仍OWNED，未冒用、接管或更動其資料。無公開部署、main／RC／Pages或其他Owner文件修改。

## 先排除錯誤方向

離線讀既有final-baseline-trace，不重跑三角色：24號首次congested為7.533333模擬秒，27號為7.6秒。各自前2秒含121筆step；兩者有效yield租約皆0、總位移皆0、121筆steer皆回傳null。不能把此停住階段歸因於有效交通租約延遲，也不能說只是正在繞行而被6秒計時誤判。

24號阻擋者包括22、20、25、23；27號包括22、26、29，均原資料記錄的實際掃掠碰撞拒絕。blockedIds計數按每次角度檢查原始陣列統計，同一單位可重複出現，不是獨立碰撞事件數。trace-windows保存原始兩段step／contact與完整來源SHA256；原觀察器對照快照相等，不改成原始自然C36精確重播。

## 候選與最小幾何確認

原steer只試前向至左右1.45弧度。候選僅在所有原方向失敗、既有避讓尚有效且未處於yield時，額外試±1.9、±2.35、±2.8及π。沿用相同步長、safe掃掠碰撞、靜態clear；沒有改傷害、射程、速度、RNG、2秒重算或6秒失敗閾值。

最小受控幾何：半徑.24的actor在(0,0)，五名同半徑hold友軍位於半徑.47、角度0／±.7／±1.4，嘗試向右.04步。原版null，候選返回(-.04,約0)，顯示新增方向確實能找到此人工排列的合法退路。但這不是自然戰役，也不能推論能接敵。

## 八組門檻：FAIL／REJECTED

各20模擬秒，既有正式命令／碰撞fixture。

|案例|命中者 原→候選|總命中 原→候選|壅塞 原→候選|
|---|---|---|---|
|6民兵/.55|6→6|69→66|0→0|
|6民兵/.7|6→6|65→66|0→0|
|10民兵/.55|8→7|87→76|2→2|
|10民兵/.7|7→7|82→85|3→0|
|6混兵/.55|5→5|57→56|0→0|
|6混兵/.7|5→4|51→47|1→0|
|10混兵/.55|7→10|81→97|3→1|
|10混兵/.7|8→9|69→86|4→1|

八組完整對照沿用既有budget-only-dense，不冒稱本輪重跑基準；兩項關鍵退步另以目前相同模擬來源的mixed6及militia10封存資料確認，原本確為5／8名命中。候選雖有多組改善，但兩項命中者減少；甚至6混兵壅塞為0仍只有4人命中，證明「不報失敗」不能當作有效戰術成功。

不將假設中的退進振盪當已證實根因：本輪候選只保存每秒快照，沒有完整逐幀方向記錄。下一步需先讀保存快照與既有接觸資料，判斷退進反覆或其他原因，再決定是否需要一個最小高頻記錄案例。

## 撤回與驗證

已完全撤回js/crowd.js；git diff確認所有js／css／index與安全基底相同。撤回後ally-attack-detour、manual-target、path-wait-progress三個Node測試檔PASS。證據gzip逐檔解壓及SHA-256核對PASS；補丁名稱明確rejected，不整合正式遊戲。

候選未過功能門檻，正式重建、Chromium、四語、Save／Load、NG+、100／200性能及自然十波均本輪NOT_TESTED。沒有新增玩家可見改善或宣稱C36修復；交付是縮小原因範圍並排除一個會退步的方向。

環境首次wait回報ready後緊接exec仍顯示No usable execution environment；收到就緒context後僅重試一次成功，未因此偽稱開發完成。QUOTA_PERCENT_UNKNOWN；無正式排程改綁、輪詢或背景執行宣稱。

STOP_REASON：ALL_EXPERIMENTAL_RUNTIME_VARIANTS_FAILED_ACCEPTANCE_GATES。仍有後續診斷，不宣稱平台／額度中斷。EXECUTION_DURATION：未完整量測；八組各20模擬秒。NEXT_AUTHORIZED_TASK：隔離候選接敵退步是否涉及反覆退進，優先使用既有快照，不先更改交通規則。AUTO_RESUME_AVAILABLE：UNVERIFIED。
