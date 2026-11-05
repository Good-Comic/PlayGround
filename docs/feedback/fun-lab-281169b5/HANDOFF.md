# 樂趣測試與控制改善交接

最新遊戲來源：`6a9cde03141c6800be6da28ada0e9b0dc1145be4`。新增目前軍令／可見人工目標、已選戰士人工集火已見旗手、總管固定既有操作列。完整範圍、前後圖與原始證據見 [續作報告](FOLLOWUP-CONTROLS-REPORT.md)。本地構建160/160資源雜湊相符；戰鬥Node84/84、總管32/32；最終旗手Chromium28/28、未再變動的總管來源3237 Chromium44/44。沒有改AI、數值、卡池、RNG、Fog或事件時限。

第一閉環三個獨立角色完成同條件自然Before、各自原封存檔聚焦After，12份報告SHA均符，第四Director有限接受讀令與A/C錯令辨認。A/B仍第4波敗北、C仍第5波敗北；整體fun與勝率未證明。第二C回合自主使用新旗手按鈕，23人與預期目標吻合，但actual quota中斷，僅PARTIAL，終局自動保存不當作玩家即時結算。不可混入完整After。

100/200第一切片短測有效；旗手初測200 P95 66.8→83.3警訊保留。版面量測改為事件觸發後，200 ABBA控制P95兩次83.4，After83.3與66.8；N=2、原生死亡與SwiftShader不能證明長測或因果改善。嚴格SaveLoad RNG表示 -1129663591→3165303705的FAIL、自然十波/NG+未驗、真人樂趣/聽感與硬體GPU未驗均保留。

Ownership273，任務FUN-LAB-281169B5／專案自聲明Execution codex-fun-lab-281169b5-20261105，收據097b5d3d80e18f6be9fca543af82024689eb38fe。未接管舊Owner，未改他人Feed。未修改main、RC、Pages、公開預覽、舊Issues、OpenCode或Immutable Build。後續先核對最新遠端及RECOVERY.json，不把本文件前一次觀察SHA當作自動最新。正常Push是保存點，非公開發布。

下一合法切片：城心實際受傷的可讀性與手動補救，僅以Game.applyDamage真實HP損失歸因，不以target參照或attack狀態冒充實際傷害、不洩漏霧中來源；先完成Director範圍裁決。C的Tab疑問先分類按鈕原生焦點導航，沒有activeElement證據不宣稱bug。所有測試瀏覽器已收尾；45秒控制器失聯原生暫停/存檔及租約結束保存已驗證，不等於自動喚醒。AUTO_RESUME_AVAILABLE=false、QUOTA_PERCENT_UNKNOWN。仍在持續工作，未宣告整項遊戲開發完成。

# Fun testing and control-improvement handoff

Latest game source: `6a9cde03141c6800be6da28ada0e9b0dc1145be4`. The three changes provide current-order/visible manual-target feedback, one explicit selected-soldier command to a visible bearer, and a sticky footer for existing steward actions. See the linked follow-up report for screenshots and exact scope. The formal build verifies160/160 payload hashes; combat Node84/84, steward Node32/32, final bearer Chromium28/28 and unchanged steward source3237 Chromium44/44 pass. AI, stats, card rules, RNG, Fog and event timers are unchanged.

Three independent roles completed matched natural Before games and unchanged-personal-save focused After tests. All12 report hashes match. The fourth Director accepts limited order comprehension and A/C mismatch recognition; A/B still lose wave4 and C wave5. Overall fun/win effects are unproven. The second C retest independently used the bearer action and confirmed23 soldiers against the intended target, but an actual usage-limit interruption makes it partial evidence. Its automated terminal screenshot is not an actively observed ending and is excluded from complete After samples.

Initial100/200 readback samples remain valid. The bearer200 p95 warning66.8→83.3ms is retained. After event-driven layout measurement, ABBA controls measured83.4ms twice and final-source runs83.3/66.8ms. N=2, native deaths and SwiftShader establish neither long-term nor causal performance improvement. Strict RNG representation Save/Load FAIL(-1129663591→3165303705), uncompleted natural ten-wave/NG+, human fun/listening and hardware GPU testing remain explicit.

Ownership273, task FUN-LAB-281169B5 and project-declared execution codex-fun-lab-281169b5-20261105 retain receipt097b5d3d80e18f6be9fca543af82024689eb38fe. No old-owner takeover, other-owner Feed write, main/RC/Pages/public-preview/legacy-Issue/OpenCode/immutable-build modification or public deployment occurred. Recheck remote and RECOVERY before resuming. Push is a safety checkpoint. Next is evidence-based core-damage readability and manual recovery using actual applyDamage HP loss, never target references or hidden-source disclosure. Classify the Tab observation against native button-focus navigation before calling it a bug. All test browsers are closed; verified controller pause/save/finalization does not prove automatic wake-up. AUTO_RESUME_AVAILABLE=false and quota percentage unknown. The root continues; the overall game project is not declared complete.
