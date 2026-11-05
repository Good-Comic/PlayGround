# 樂趣測試與控制改善交接

本任務依使用者最新測試指令第19行，提問、進度、測試報告與交接一律採臺灣正體中文，優先於舊雙語整理規則；程式識別符、原始日誌、SHA及正式遊戲四語不改。

最新遊戲來源：`955fceaadb781d9128a857636c0f20a4830ccc12`。第四切片加入城心實際HP失損／可見來源回饋；[驗證與玩家報告](CORE-DAMAGE-REPORT.md)。正式161項資源相符、當前Node96/96、Chromium25/25及旗手相容28/28，A正式敗北後finish封存，無quota；不宣稱救城或勝率改善。以下保留前三切片來源範圍：新增目前軍令／可見人工目標、已選戰士人工集火已見旗手、總管固定既有操作列。完整範圍、前後圖與原始證據見 [續作報告](FOLLOWUP-CONTROLS-REPORT.md)。本地構建160/160資源雜湊相符；戰鬥Node84/84、總管32/32；最終旗手Chromium28/28、未再變動的總管來源3237 Chromium44/44。沒有改AI、數值、卡池、RNG、Fog或事件時限。

第一閉環三個獨立角色完成同條件自然Before、各自原封存檔聚焦After，12份報告SHA均符，第四Director有限接受讀令與A/C錯令辨認。A/B仍第4波敗北、C仍第5波敗北；整體fun與勝率未證明。第二C回合自主使用新旗手按鈕，23人與預期目標吻合，但actual quota中斷，僅PARTIAL，終局自動保存不當作玩家即時結算。不可混入完整After。

100/200第一切片短測有效；旗手初測200 P95 66.8→83.3警訊保留。版面量測改為事件觸發後，200 ABBA控制P95兩次83.4，After83.3與66.8；N=2、原生死亡與SwiftShader不能證明長測或因果改善。嚴格SaveLoad RNG表示 -1129663591→3165303705的FAIL、自然十波/NG+未驗、真人樂趣/聽感與硬體GPU未驗均保留。

Ownership273，任務FUN-LAB-281169B5／專案自聲明Execution codex-fun-lab-281169b5-20261105，收據097b5d3d80e18f6be9fca543af82024689eb38fe。未接管舊Owner，未改他人Feed。未修改main、RC、Pages、公開預覽、舊Issues、OpenCode或Immutable Build。後續先核對最新遠端及RECOVERY.json，不把本文件前一次觀察SHA當作自動最新。正常Push是保存點，非公開發布。

下一合法切片：城心實際受傷的可讀性與手動補救，僅以Game.applyDamage真實HP損失歸因，不以target參照或attack狀態冒充實際傷害、不洩漏霧中來源；先完成Director範圍裁決。C的Tab疑問先分類按鈕原生焦點導航，沒有activeElement證據不宣稱bug。所有測試瀏覽器已收尾；45秒控制器失聯原生暫停/存檔及租約結束保存已驗證，不等於自動喚醒。AUTO_RESUME_AVAILABLE=false、QUOTA_PERCENT_UNKNOWN。仍在持續工作，未宣告整項遊戲開發完成。

下一切片已獲Director裁決可做「本波已記錄最大單次實損」，只對本次載入／本波已觀察的實際HP差取max，並非來源排行榜或DPS；last/max各自遵守視野，未知來源大傷仍計自己的HP損失，不能重辨識敵人。A本次只看到小傷到大傷，尚未自然證明大傷被小傷取代，所以新改善仍是假說待驗。
