# 樂趣評估報告

> 最新續作：旗手與總管實作、最終來源及限定驗收已另存 [續作報告](FOLLOWUP-CONTROLS-REPORT.md)。本文件保留第一閉環的來源與當時判定；舊的「實作中／待驗」描述不代表最新狀態。
> Latest follow-up: bearer/steward implementation, final source and scoped validation are in the linked follow-up report. This file preserves the first-loop snapshot; its pending-work descriptions are historical.


**第一切片已形成有限的實際玩法回饋閉環：三角色讀得懂命令，A、C 自然辨認錯令並自主改令。整體「更好玩」、更有效守城、勝率與留存仍無可歸因證據。** 三個 After 仍各在相同的第 4／4／5 波自然敗北。下一項旗手人工集火入口正在實作，這份報告不預填它的結果。

評估來源固定為 Before f6ae896bb3554ae7b6d131c734d9ac51d9f07131 與 After 6075dbaae8281de54ec5c932e349b0ed591f3c7f。三個 Before 是獨立冷開局；After 是各自原封自然快照的正式 Continue 聚焦續玩，並非新的自然十波。每角色 N=1，知情續測、學習、操作、RNG 與恢復時序差異排除嚴格因果 A/B。所有樂趣與再玩意願都只是 AI 角色模擬，沒有真人情緒、APM 或留存資料。詳見 [矩陣](MULTI-AGENT-PLAYTEST-MATRIX.md) 與 [12 份封存驗證](REPORT-SEAL-VERIFICATION.json)。

## 值得保留的原有樂趣

下表時間為各 Before 工作階段原始 wallSeconds，含工具與原生暫停，不是局內時鐘。每項完整情境、分類、三個改善建議及原始證據保留在各自報告，不以新摘要重記舊玩法為新交付。

| 角色 | 三個具體正向時刻 | 三個低參與時刻 | 三個挫折來源 |
| --- | --- | --- | --- |
| A | 232.797：救回兩工人的探索／守城取捨；735.522：按食物瓶頸選卡；827.147：英雄站位使神盾可護人數改變 | 63.408–175.635：總管讀表／捲動；298.478：波尾等待；309.347 起：候選旁完整卡池的資訊掃讀負擔 | 827.147 起：城心失血來源難讀；372.981：生產等待理由過於通用；270.968 及後續：鏡頭與移動單位重選成本 |
| B | 296.421：守住後選馬鎧；553.575：英雄救援兩工人；700.255：第三波補救後選建築生命 | 94.402–191.736：總管長表；700.255：反覆選卡資訊密度；796.443：第四波早段短暫零敵淡場 | 656.575：屋頂／兩側聚團與選兵涵蓋；333.509 起：升時代確認在底部；882.954：衝車方向辨識與補救太晚 |
| C | 269.944：第一波成功與直接黃金獎勵；821.537：救援有清楚成果；979.104：專名軍閥與新威脅 | 180.622：訓練後找下一步；479.954–554.810：只改食物優先卻需長表導覽；873.038：未理解卡名的重複資訊 | 480.485／921.942：食物支出不明；979.104：查看旗手後無法確認對象；1013.548 起：慢速撤離與危機後缺少能完成的補救 |

救援、波後依當前情境選卡、英雄站位與新敵人的戲劇張力仍提供清楚目標、取捨與回報。沒有依三場敗北認定 Normal 失衡；玩家自己的晚反應、過期畫面、漏重選、經濟注意力與工具延遲都是實際反證。

完整卡樹資訊密度確有回報，但使用者要求左三選一＋右完整 32 卡永久同屏，優先於角色的折疊提案。可評估視覺層級，不能把折疊、隱藏或另開卡樹當採納成果。

## 實際改動及其有限效益

第一切片新增目前已選正式戰士／全軍數與即時命令摘要，並在前景標出仍存活、目前可見的人工集火目標。英雄、工人及無攻擊單位不列為收到軍令的戰士；英雄直控時明示已選戰士 0。原生命令、AI、尋路、傷害、HP、成本、卡池、RNG 與時窗沒有因此改動。

| 角色 | 自然證據鏈 | 可接受結論 | 仍不足的結論 |
| --- | --- | --- | --- |
| A | wall 86.556 右鍵原想集火弓兵，immediate after 為 16 人 move；90.588 從摘要讀出；98.252 主動改援護，18 人 guard | 語意落差可辨認；發現後 7.664 秒、1 意圖完成新的守城命令 | 原弓兵集火、自然人工標示用途、有效攔截或整體樂趣改善未證明 |
| B | screen-0007／0009 顯示 17／18、17／19，能讀出 13 人護衛＋4 人自主接敵；末次右鍵 before 已 defeat | 選兵涵蓋與命令理解有局部用途 | 自然移動／攻擊誤令恢復及人工標示未評估，不能由 A／C 代替通過 |
| C | wall 93.473 右鍵想打旗手，10 人實際 manualAttack 目標為 id183 長槍兵；94.103 金環與名字揭露；118.126 改援護 | 單一自然例證支持目標辨認；發現後 24.023 秒、1 意圖改為護衛 | 旗手原意圖、提早攔截、擊破或整體樂趣改善未證明 |

代表畫面：[A 的移動讀回](evidence/A-after/screen-0006.png)、[B 的涵蓋與混合命令](evidence/B-after/screen-0009.png)、[C 的長槍兵人工標示](evidence/C-after/screen-0008.png)。截圖、文字與 immediate before／after 是相鄰取樣，不能強行當同一影格；原生輸入送出、命令存在、接戰與實際傷害是四種不同證據。

新摘要與標示沒有增加必要操作；A、C 各一個修正意圖是玩家的新決策成本，不能倒算成新功能的強制步驟。沒有量測出整段少重選、少重發、更少認知負擔或更快實現原目標；不能以完整 Before 與短 After 的總輸入數比較效率。

## After 的正向回報、缺額與再玩意願

| 角色 | After 實際可支持的正向時刻 | 尚存負擔 | AI 模擬再玩意願 |
| --- | --- | --- | --- |
| A | 錯令讀回、食物／麥田配置、神盾護住 12 人的明確回饋 | 長總管仍需兩次捲動；軍隊健康而城心失血的關係仍難讀 | 有條件願意；Before 為 7／10，After 沒有同量表，不能換算成分數增加 |
| B | 摘要帶來局部掌控感；短暫敵數下降可讀 | 屋頂、兩側衝車與健康軍隊／失守落差仍挫折 | 有條件願意，但立即重開意願偏低；沒有可比量表 |
| C | 護衛結果可讀、軍閥威脅變化、看懂長槍兵後能選下一步 | 查看後只剩約 6 秒；讀懂錯誤時事件已結束，潰敗仍快 | Before 與 After 都為 3／5；不能解讀成普遍無差異或改善 |

短續玩沒有湊滿三個無聊／正向時刻：A 僅一個有根據的無聊項，B 是有趣 2、無聊 1、挫折 2，C 無聊 2；缺額原封保留，沒有挪用 Before 或虛構第三項。A-after 是新執行實例，B／C 讀自己的 Before；所有人知道新介面用途，發現性尚未盲測。

## 效能與可靠性

Node 72／72、正式 Chromium 34＋11 共 45／45、After 160 資源 SHA 校驗是既有有範圍的技術證據。本整理只封存及核對，沒有啟動瀏覽器、遊戲或效能程式。自然玩法、原生直接重現與 CONTROLLED_FIXTURE 不互相冒充；技術通過不等於全部自然場景或樂趣通過。

四個效能案在同機、相同初始場景 SHA／RNG 下各暖機 5 模擬秒並量測 30 牆鐘秒，保留 AI、碰撞、傷害及死亡，關閉自動生產以界定初始數。完整結果見 [performance/result.json](evidence/performance/result.json)。

| 初始配置 | Before → After FPS | p95 幀間隔 | 量測起點到終點存活實體 | Heap 起點 → 終點（bytes） |
| --- | --- | --- | --- | --- |
| 100 | 34.431 → 35.091 | 33.4 → 33.4 ms | Before 73→34；After 73→32 | Before 12849129→13799307；After 11465215→12803680 |
| 200 | 24.991 → 25.964 | 66.6 → 66.6 ms | Before 140→58；After 140→56 | Before 11533917→14538587；After 17682038→17617357 |

零量測錯誤的短樣本沒有顯示明顯額外幀尾成本，但死亡使負載下降、人工集火繪製只占約 6–7% frame，不能證明效能因果改善或持續 100／200 存活。200 After heap 高於 Before，單次起終點不足以證明洩漏或無洩漏；長時間記憶體仍未驗證。SwiftShader 是 CPU 軟體繪圖，不是實體 GPU。整工作階段 FPS 含選單、選卡與暫停，不能與短戰鬥負載混用。

**歷史失敗保留：** strict Save/Load 的 RNG -1129663591 → 3165303705，strictStateEqual=false；本切片沒有修復嚴格重播。UI 純讀不額外消耗 RNG 與 Save/Load 嚴格相等是不同驗收。自然十波／NG+、真人聽感／樂趣／留存、持續高存活 200、長測與實體 GPU 仍未通過或未測。

三個中斷場次排除於完成樣本；B 初次 usage limit 後原程序遺失、A 續測 usage limit 後租約到期、B 首個請求前啟動逾期分列。額度百分比 UNKNOWN，不推測平台恢復時間，也不把工具定位與逾時直接判為遊戲 Bug。[失敗保留](FAILURE-LEDGER.md) 與 [證據索引](EVIDENCE-INDEX.md) 提供細節。

## 後續判斷

依重複可追溯的 C 旗手意圖落差與 Director 裁決，下一切片採已選戰士、當下可見旗手的一次明確人工集火入口；保留原「查看」只移鏡頭及所有原生戰鬥規則。主驗收是玩家選定意圖與實際命令一致、後令可覆蓋、沒有假成功回饋，不以勝利或擊殺湊 PASS。實作尚未有新來源／測試，不得記作完成。詳細取捨見 [Director 決策](GAME-DIRECTOR-DECISIONS.md) 與 [下一步](NEXT-FUN-IMPROVEMENTS.md)。

---

# Fun evaluation report

**The first slice completed a limited gameplay-feedback loop: all three roles understood orders, and A/C naturally detected a mismatch and chose a new order. Attributable improvements in overall fun, defense, win rate and retention remain unproven.** After players still naturally lost at waves 4/4/5. The carrier manual-focus entry is being implemented; its results are not prefilled here.

Sources are Before f6ae896bb3554ae7b6d131c734d9ac51d9f07131 and After 6075dbaae8281de54ec5c932e349b0ed591f3c7f. Before consists of three independent cold starts. After consists of normal Continue from each unchanged natural snapshot, not fresh ten-wave campaigns. N=1 per role, informed retesting, learning, actions, RNG and restore timing prevent a strict causal A/B interpretation. Fun and replay preference are AI persona simulations, without human emotions, APM or retention data. See the [matrix](MULTI-AGENT-PLAYTEST-MATRIX.md) and [12 sealed-report checks](REPORT-SEAL-VERIFICATION.json).

## Existing fun to preserve

Times below are each Before session's original wallSeconds, including tools and native pauses. Complete context, categories, three improvement suggestions and original evidence remain in each report. Existing mechanics are not counted again as new readback delivery.

| Role | Three positive moments | Three low-engagement moments | Three frustrations |
| --- | --- | --- | --- |
| A | 232.797: two-worker rescue and defense tradeoff; 735.522: card choice responding to food shortage; 827.147: hero positioning changes shield coverage | 63.408–175.635: steward reading/scrolling; 298.478: wave-tail wait; from 309.347: scanning the complete card pool beside candidates | From 827.147: unclear core-loss sources; 372.981: generic production-wait reason; 270.968 and later: camera and moving-unit reselection costs |
| B | 296.421: surviving then choosing horse armor; 553.575: rescue of two workers; 700.255: recovery in wave 3 followed by building-HP choice | 94.402–191.736: long steward form; 700.255: repeated card-information density; 796.443: short zero-enemy lull early in wave 4 | 656.575: roof/two-sided crowding and selection coverage; from 333.509: age confirmation at the bottom; 882.954: late ram-direction recognition and recovery |
| C | 269.944: first-wave success and direct gold reward; 821.537: clear rescue outcome; 979.104: named warlord and changed threat | 180.622: training wait and unclear next step; 479.954–554.810: long-form navigation for one food preference; 873.038: repeated unfamiliar card names | 480.485/921.942: unclear food spending; 979.104: carrier identity unconfirmed after View; from 1013.548: slow evacuation and no attainable recovery goal |

Rescue, situational post-wave cards, hero positioning and a new enemy's dramatic presence still provide clear goals, tradeoffs and rewards. Three defeats do not establish Normal imbalance. Late reactions, stale frames, missed reselection, economic attention and tool delay are material counterevidence.

Card-tree density received feedback, but the user's permanent left three-choice plus complete right 32-card tree requirement overrides suggestions to collapse it. Visual hierarchy can be assessed; collapsing, hiding or relocating the tree is not an adopted improvement.

## Actual change and limited benefit

The first slice added the selected-formal-soldiers/whole-army count and current-order summary, plus foreground markers for living, currently visible manual targets. Heroes, workers and units without attacks do not count as soldiers receiving army orders. Hero direct control explicitly shows 0 selected soldiers. Native commands, AI, pathfinding, damage, HP, costs, cards, RNG and timing windows were not changed by this slice.

| Role | Natural evidence chain | Supported conclusion | Unsupported conclusion |
| --- | --- | --- | --- |
| A | At wall 86.556 an intended archer focus produced 16 move orders; detected in readback at 90.588; autonomously guarded at 98.252, producing 18 guard orders | Mismatch was legible; a new defense order followed after 7.664 s and 1 intent | Original archer focus, natural marker utility, effective interception or overall fun improvement |
| B | Screens 0007/0009 show 17/18, 17/19 and 13 guard + 4 autonomous engagement; final right-click before-state was defeat | Local selection-coverage and order-understanding utility | Natural move/attack mismatch recovery and manual-marker use are not evaluated; A/C cannot substitute |
| C | At 93.473 an intended carrier click made 10 soldiers manually target spearman id183; ring/name exposed it at 94.103; guard followed at 118.126 | One natural target-recognition example; new guard intent after 24.023 s and 1 intent | Original carrier goal, earlier interception, carrier defeat or overall fun improvement |

Representative frames: [A's move readback](evidence/A-after/screen-0006.png), [B's coverage and mixed orders](evidence/B-after/screen-0009.png), [C's spearman marker](evidence/C-after/screen-0008.png). Screenshots, text and immediate action states are adjacent samples, not one frame. Input dispatch, an order's existence, engagement and actual damage are separate evidence levels.

Readback and markers add no mandatory input. A/C's correction intent is a new player decision, not a compulsory step added by the feature. Fewer reselections, repeated orders, lower cognitive load and faster completion of original goals were not measured. Whole Before input counts cannot be compared with short After counts as efficiency gains.

## After feedback, missing counts and replay preference

| Role | Supported After positives | Remaining burden | AI replay preference |
| --- | --- | --- | --- |
| A | Mismatch readback, food/farm planning, visible shield feedback covering 12 soldiers | Two steward scrolls; healthy army versus falling core HP remains hard to interpret | Conditionally willing. Before was 7/10; After has no matching scale, so no score increase can be calculated |
| B | Local control confidence from readback; short-term enemy-count reduction | Roofs, two-sided rams and healthy army/core-loss gap remain frustrating | Conditionally willing, low desire to restart immediately; no comparable numeric scale |
| C | Legible guard result, warlord threat variation and a next decision after identifying the spearman | About 6 s left after View; event ended before correction, and collapse remained fast | Before and After both 3/5; this does not establish a general null effect or improvement |

Short retests did not invent three moments: A has one supported boring item; B has 2 fun, 1 boring and 2 frustrating items; C has 2 boring items. Missing slots remain, without borrowing Before events. A-after used a new execution instance; B/C read their own Before. Everyone knew the interface purpose, so unprompted discovery remains untested.

## Performance and reliability

Existing bounded technical evidence is Node 72/72, formal Chromium 34+11=45/45 and 160 After payload SHA checks. This curator archived and verified files without launching browsers, gameplay or performance programs. Natural gameplay, direct native reproduction and CONTROLLED_FIXTURE remain separate. Technical passes do not establish all natural cases or fun.

Four performance cases used one machine, equal initial scene SHA/RNG, 5 simulation seconds of warmup and 30 wall seconds each, with native AI, collision, damage and deaths. Automatic production was disabled to define initial counts. See [performance/result.json](evidence/performance/result.json).

| Initial configuration | Before → After FPS | p95 frame interval | Alive from measurement start to end | Heap start → end, bytes |
| --- | --- | --- | --- | --- |
| 100 | 34.431 → 35.091 | 33.4 → 33.4 ms | Before 73→34; After 73→32 | Before 12849129→13799307; After 11465215→12803680 |
| 200 | 24.991 → 25.964 | 66.6 → 66.6 ms | Before 140→58; After 140→56 | Before 11533917→14538587; After 17682038→17617357 |

With zero measurement errors, these short samples show no obvious additional frame-tail cost. Deaths reduce load, and manual-focus drawing occurs in only about 6–7% of frames; no causal performance improvement or sustained 100/200 survivors is established. The 200-unit After heap is higher; endpoints establish neither a leak nor absence of one. Long-term memory remains unverified. SwiftShader is CPU software rendering, not physical GPU hardware. Whole-session FPS includes menus, cards and pauses and cannot be pooled with short combat loads.

**Historical failure retained:** strict Save/Load changes RNG -1129663591 → 3165303705 with strictStateEqual=false; strict replay was not fixed. Read-only UI consuming no extra RNG is a separate gate. Natural ten waves/NG+, human listening/fun/retention, sustained high-survivor 200-unit load, long runs and physical GPU remain unpassed or untested.

Three interrupted sessions are excluded: B's initial usage limit followed by a lost process, A's retest usage limit and controller-lease expiry, and B's startup expiry before its first request. Quota percentage remains UNKNOWN; no platform recovery time is inferred. Tool locators/timeouts are not automatically game bugs. Details are in the [failure ledger](FAILURE-LEDGER.md) and [evidence index](EVIDENCE-INDEX.md).

## Next decision

Repeated traceable carrier-intent mismatches for C and the Director decision select one explicit manual-focus entry using currently selected soldiers and a currently visible carrier. Existing View remains camera-only and native combat rules remain. Acceptance concerns intent/order agreement, later-order override and truthful feedback, without requiring a kill or victory to fill PASS. Implementation has no new source or tests here and cannot be marked complete. See [Director decisions](GAME-DIRECTOR-DECISIONS.md) and [next improvements](NEXT-FUN-IMPROVEMENTS.md).
