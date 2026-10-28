# 村民逐擊診斷與護衛命令 / Worker hit diagnosis and escort commands

**中文：** 從遠端d33810af恢復，核對所有權後執行。遊戲來源維持`798bcffdfe8e97bdd4e8abe6c67f18223b540877`，34檔精確本地Artifact。本輪只新增QA逐擊觀測與修正自動玩家命令，沒有改遊戲引擎、Normal數值或公開部署。原本稀疏資料不足以判定死亡因果，不能據此推測並修改AI。

**English:** Resumed from remoted33810af after verifying ownership. Game source remains`798bcffdfe8e97bdd4e8abe6c67f18223b540877`, an exact34-file local artifact. This round adds QA per-hit observation and corrects automated-player commands only; no engine, Normal statistics or public deployment changes. Sparse prior data did not establish death causality and cannot justify speculative AI changes.

## 重現與門檻 / Reproduction and gates

**中文：** 觀測器只轉送原applyDamage一次，保留回傳值；觀測端錯誤不可中斷戰鬥。兩項定向測試覆蓋實際生命值／死亡、護衛距離、轉送次數與失效sink。使用正式Continue、1× Normal、手動經濟／軍費，由校驗過的存活快照接續，僅觀察，不注入單位、資源或時間。測試門檻為真實命中／命令證據，完整十波門檻另列且未通過。

**English:** The observer forwards originalapplyDamage once, preserving its return value; observation failures cannot interrupt combat. Two directed tests cover actual HP/death, guard distance, forwarding count and a failing sink. Uses native Continue,1× Normal, manual economy/spending and a verified living save, with observation only and no unit/resource/time injection. Gates here concern actual hit/command evidence; full ten-wave acceptance is separate and has not passed.

|樣本 / Sample|結果 / Result|限制 / Limitation|
|---|---|---|
|啟動失敗 / Startup failure|本地HTTP尚未啟動，ERR_CONNECTION_REFUSED；確認HTTP200後另建樣本 / Local HTTP not ready; ERR_CONNECTION_REFUSED, then a separate cohort after HTTP200|工具起始順序錯誤，非遊戲失敗 / Harness startup ordering, not game failure|
|逐擊接續180秒 /180-second observed continuation|62筆觀測、9次存活到死亡轉換；第四波596.0868秒、軍隊／村民0、城心2338.21/3600 /62observed events,9live-to-dead transitions; wave4sim596.0868,0army/workers, core2338.21/3600|BOUNDED_SAMPLE_INCOMPLETE；生存目標FAIL，非自然戰敗結算 / Bounded incomplete; survival FAIL, not defeat settlement|
|第一次單護衛 / Initial single escort|攻城槌集火涵蓋所有步兵，沒有護衛命令收據 / Siege focus selected all infantry; no escort receipt|TACTIC_NOT_EXERCISED，不得當護衛策略驗收 / Not an escort acceptance sample|
|修正後45秒 / Corrected45seconds|步兵21實際Guard村民11／86／104；集火名單排除21；終點第三波424.3471秒、3村民／6軍事、城心滿血 / Infantry21guards workers11/86/104, focus excludes21; ends wave3sim424.3471with3workers/6military/full core|命令分離限定PASS，生存／十波未通過 / Scoped command-separation PASS, not survival/ten-wave acceptance|

## 實際發現 / Actual findings

**中文：** 村民117在城心附近採集，被敵方槍兵107／108擊殺；附近原型50雖在約2格，卻正以Guard城心命令攻擊攻城槌98。這證明「有友軍靠近」不等於有護衛覆蓋，但不足以宣稱重新索敵錯誤。9次死亡來源為槍兵2、騎射2、民兵2、弓兵1、攻城槌2；4次三格內無友軍。原始命中記錄保留位置、前後HP、來源及近鄰目標；尚無完整導航／逐幀路線記錄，不能排除其他問題。

**English:** Worker117was gathering near the core and killed by enemy spearmen107/108. Prototype50was about2tiles away but guarding the core while attacking ram98. Nearby allies therefore do not guarantee escort coverage, but this does not establish a retargeting defect. Nine deaths came from2spearmen,2horse archers,2militia,1archer and2rams;4had no friendly military within3tiles. Raw hit records retain positions, before/after HP, source and nearby targets. Complete navigation/per-frame route traces are absent, so other issues remain unexcluded.

**中文：** 實際修正為自動玩家的集火／護衛衝突：原生逐單位選取排除保留步兵，並允許其取消舊集火轉為Guard；不改遊戲命令規則。失敗測試與15項最終定向測試保留。真實Chromium確認命令收據，Console／Page／失敗請求0，錄影為實際本地操作，不是公開網站或共享直播。兩組起點不同，不作勝率或性能比較。

**English:** The actual correction is the automated player's focus/escort conflict: native per-unit selection excludes reserved infantry, which may replace an old focus with Guard. Game command rules are unchanged. Preserve the failing test and15final directed tests. Actual Chromium confirms command receipts with0Console/Page/failed-request errors. Recordings show actual local operation, not public-site testing or shared live viewing. Different starting points preclude win-rate/performance comparisons.

## 接續與未解事項 / Continuation and unresolved work

**中文：** 下一步由escort-verified/save-snapshot.json及resume-integrity.json接續，觀察單護衛在較長自然戰鬥中的實際生存與採集返程；先補導航追蹤再判斷引擎缺陷。不可使用已零村民的observed樣本當健康開局。保持RELEASE_BLOCKED、低FPS、嚴格Save/Load、性能FAIL、Rift Prototype未重現與硬體待測。地形Custom選項尚待回答。

**English:** Continue fromescort-verified/save-snapshot.json andresume-integrity.json, observing sustained survival and gather/return under single-escort play; add navigation tracing before concluding an engine defect. Do not treat the zero-workerobservedcohort as a healthy opening. Retain RELEASE_BLOCKED, low-FPS, strict Save/Load, performance FAIL, unreproduced Rift Prototype and hardware-pending status. Custom terrain options remain unanswered.

**中文：** 本輪SCHEDULED_RESUME_EXECUTED，因執行預算邊界安全保存；全部測試已停止，推送後釋放所有權。跨對話寫入工具不可用，不宣稱送達。未公開發布。

**English:** SCHEDULED_RESUME_EXECUTED; safely checkpointed at the execution-budget boundary. Tests stopped; ownership released after push. Cross-thread writing is unavailable and delivery is not claimed. No public deployment.
