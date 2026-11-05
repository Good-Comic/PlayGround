# A 生產說明聚焦續玩

只讀本文件、自己的 players/A/PROFILE.md、當時可見畫面／文字／提示。禁止讀遊戲原始碼、gateway、原始快照、private-observer、其他玩家、Director、根端診斷與既有sealed。協議／路徑隔離不是作業系統安全沙箱；沒有 JavaScript evaluate 或隱藏狀態入口。

沿原A能力與至少2.5秒意圖間隔，以正常Continue接續自己的原封自然快照。不是新十波或盲測，可以保有自己的經驗，不讀舊sealed重建最佳打法。Root核對快照SHA後原樣載入，沒有改HP、資源、牌、部隊、時間或RNG。PROFILE裡的原準備狀態是歷史資訊，本輪開始仍依Root READY。

```sh
python3 /workspace/riftwatch-fun-lab-281169b5/production-player/public/client.py A observe
python3 /workspace/riftwatch-fun-lab-281169b5/production-player/public/client.py A click '{"selector":"#btn-continue"}'
```

observe只回當時可見文字、控制項、工具提示及畫面路徑。以view_image看圖，再自主決定滑鼠座標／按鍵。可用click、hover、select、fill、check、key、hold（最多3秒）、drag、scroll、wait（每次最多20秒）、finish；click可用可見selector或x/y，右鍵button:right。@控制編號只代表上一觀察當時的可見DOM，變動後再看，不能當固定敵人識別。禁止無觀察的大量連續策略或連點；工具／閱讀延遲均保留。

本輪新功能在既有總管逐建築設定中提供『已套用』生產資源診斷：正式兵種費用、付款後應留的最低存量及當前缺口。完整資源明細可另展開；表單尚未套用的變更另有提示。底線不是花費上限，資源門檻通過不保證下一個必然排到該兵，仍有正式佇列、人口、手動優先與其他規則。查詢不替你決定政策、不自動套用草稿。你可依公開UI自主使用或不用，不指定建築、兵種、目標值或打法。

本版也保留先前的軍令摘要、來源查看／人工反擊與總管固定操作列；修正勝敗後仍可施放技能的終局輸入。本輪不能把已結算後的提示當成戰鬥技能成功。除公開功能說明，不提供位置／時機／最佳解，也不要求刻意挨打、造成失敗或證明成功。

自然遊玩至勝敗或正式20分鐘牆鐘測試期限。至少每20–40秒觀察；45秒無請求會原生暫停／儲存，180秒無請求才結束，皆為HARNESS_SAFETY_NOT_PLAYER。若已自然打開總管而暫停，依正常UI操作；不私改時間。遇工具／額度真實中斷即回報，不宣稱背景繼續或自然通關。

看到正式結算後先finish，確認ok，再於新players/A/after寫REPORT.md、REPORT.json與SHA256SUMS。全用臺灣正體中文、AI模擬觀點；區分局內累計與本段牆鐘。請記是否自然發現診斷、讀懂實際兵種費用／底線／缺口、是否分清未套用草稿、有沒有幫助自主經濟取捨、有哪些新增閱讀／操作負擔；沒發生就NOT_EVALUATED。不同時刻庫存與手動能成功不證自動化Bug；看到資源說明不等於理解歷史所有支出。保持真實有趣／無聊／挫折證據，可不足三項但說明限制；不偽造真人樂趣／勝率。先封存再跨角色評審，不改舊sealed。
