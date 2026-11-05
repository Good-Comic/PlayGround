# 下一項樂趣改善與驗收

> 最新續作：旗手與總管實作、最終來源及限定驗收已另存 [續作報告](FOLLOWUP-CONTROLS-REPORT.md)。本文件保留第一閉環的來源與當時判定；舊的「實作中／待驗」描述不代表最新狀態。
> Latest follow-up: bearer/steward implementation, final source and scoped validation are in the linked follow-up report. This file preserves the first-loop snapshot; its pending-work descriptions are historical.


**目前正在實作：已見旗手的明確人工集火入口。** 這是 Director 複評選定、使用者核心操控授權內的一次既有人工命令替代入口。新來源SHA、構建與驗收結果尚未提供；本文件是待驗收工作，不宣稱PASS。第一切片來源仍為6075dbaae8281de54ec5c932e349b0ed591f3c7f。

## 玩家可見的最小行為

1. 在既有「查看旗手」旁增加獨立的「以已選戰士集火旗手」，顯示實際可下令人數及已見目標名稱。查看仍只移鏡頭。
2. 僅對目前已選、存活的正式戰士送一次既有原生攻擊；不自動F2、不帶新兵、英雄或工人。可在英雄直控或混合非戰士選取時停用並解釋原因。
3. 本波RALLY pending／active、載體存活且當下可見、可操作畫布內有可靠原生pickAt命中點才可用。目標在畫面外由玩家先查看；點擊時重新核對全部條件。
4. 面板、暫停、結算、建造模式等阻擋時不能發令。無法可靠選中旗手就明示沒有下令；不回退移動、不改打別人、不循環重試。
5. 命令沿用原生issueCommand及現有讀回／金環，文案只確認已指令。新移動、停止或護衛可立即覆蓋，介面更新不重發攻擊。

不改視野、命中可選條件、追擊規則、旗手挑選、RALLY／15秒持續、Boss、AI、尋路、傷害、HP、費用、卡池、RNG與任何時窗。基礎控制免費；左三選一＋右完整32卡永久同屏。若某實作需要改規則，該部分列SPEC_DECISION_REQUIRED，同時接續合法的獨立總管入口工作。

## 必要驗收

| 層次 | 必須得到的證據 | 不得替代的宣稱 |
| --- | --- | --- |
| 原生Node | 真實Game／RALLY上一次啟動只對目前已選正式戰士發一次原生攻擊，target為當下載體且manualAttack=true；未選士兵、英雄、工人保持原令 | 不以直接內部ID強制下令取代原生命中條件 |
| 邊界回歸 | 查看零攻擊、重複UI更新零新令；未見／沙暴、死亡、過期／非本波、讀檔換實體、空選、混合、英雄直控及各阻擋模式不發錯令、不回退move | 控制夾具清楚標CONTROLLED_FIXTURE，不冒充自然成功 |
| 狀態／後令 | 只讀更新前後snapshot、兩種RNG、資源、HP與冷卻不變；真命令變更與原生右鍵一致；新移動／停止／護衛立即覆蓋 | 保留既有嚴格RNG Restore FAIL，不用UI測試蓋掉 |
| 正式Chromium | 新來源與完整資源SHA固定；C原封自然快照正常Continue，以原生滑鼠／鍵盤選兵、查看、按新入口；保存before圖、當下可見性／pickAt、原生事件與immediate after | 新入口命中載體、摘要／金環同實體；不把命令當命中／擊殺 |
| UI／輸入 | 1440×900、1024×768及既有小視口／四語，Tab／Space／Enter焦點與原生鍵盤無雙觸發；零page error；保留完整32卡左右同屏 | 預先結果為PENDING，不用第一切片45項沿算新切片通過 |
| C隔離玩家 | 保留至少10秒意圖間隔、單一注意目標；只說明用途，不給位置／時機／最佳解；同未改快照另建新回合，不覆寫已封存before／after | 記入口發現、事前選兵／目標理解、自主啟動、首次正確原生命令、查看／選兵／攻擊各意圖及未用原因；自然未用為NOT_EVALUATED |

主驗收是選定意圖與實際命令吻合、後令可改、沒有新增必做步驟或假回饋；不要求打倒旗手或獲勝。A／B尚未自然遇到旗手窗口，不能列本項玩家PASS。新一輪仍是知情續測、N=1，不宣稱普遍效果。僅跑受影響定向測試與必要既有72項範圍；除非新增持續掃描／繪製或出現具體回歸，這個互動入口不需要再跑100／200短效能。

## 後續獨立候選

| 候選 | 可處理的需求 | 驗證重點與界線 |
| --- | --- | --- |
| 實際城心傷害的可見來源／方向 | A／B健康軍隊仍失守時的因果理解 | 真正傷害事件才歸因；Fog外不洩漏；不從target參照推傷害；不代選最佳目標 |
| 總管固定儲存／關閉與既有確認入口 | 三baseline及A-after長表單導覽成本 | 完整設定、原生暫停及原成本保留；量實際意圖、捲動、誤提交與小視口遮擋 |
| 精確生產等待／已公開支出說明 | A通用理由、B升時代取捨、C食物支出不明 | 重用正式productionStatus／reserveCost，不另造規則；正庫存差不是完整收入；不改政策或預留 |
| 選兵／目標文字的溫和視覺層級 | 已可讀摘要的發現性 | 先測未告知用途的新玩家，檢查閃動與戰場遮擋；不加自動追蹤或隱藏卡樹 |

自然十波／NG+、真人聽感／樂趣／留存、持續100／200存活、長測記憶體與實體GPU仍需各自證據。現有效能只支持有死亡的四個30秒SwiftShader短樣本；200 after heap較高，長測未證明。Strict Save/Load RNG -1129663591→3165303705仍FAIL。這些缺口不能以新UI切片一併改成PASS。

## 保存與接續

根代理持續實作、定向驗證、玩家回饋，再按未解需求接續；一次commit／push／交接不是整項任務結束。根代理提供的既有遠端保存點是15fcb0f230cb04f7ddc2ff454334de19b5e29098；本整理沒有操作Git、Ownership或進度Feed，不以該SHA冒充未完成切片來源。

本整理角色：STOP_REASON=ASSIGNED_EVIDENCE_CURATION_COMPLETED_HANDOFF_TO_ROOT；EXECUTION_DURATION=UNKNOWN（未量測本角色完整起始時刻）；NEXT_AUTHORIZED_TASK=根代理完成旗手人工集火入口、定向驗收與隔離C續測；CHECKPOINT_SHA=6075dbaae8281de54ec5c932e349b0ed591f3c7f（第一切片受評來源）；AUTO_RESUME_AVAILABLE=false；rootTaskComplete=false。

---

# Next fun improvements and acceptance

**Being implemented: an explicit manual-focus entry for an already visible carrier.** The Director selected this alternate input for one existing manual command under the user's core-control authorization. No new source SHA, build or acceptance results are available here; this is pending work without PASS. The first slice remains source6075dbaae8281de54ec5c932e349b0ed591f3c7f.

## Minimal player behavior

1. Add a separate “focus carrier with selected soldiers” entry beside existing View, displaying the eligible count and visible target name. View remains camera-only.
2. Send one existing native attack only to currently selected living formal soldiers. Do not auto-F2, include recruits, heroes or workers. Hero-direct/mixed non-soldier selection may be disabled with an explanation.
3. Require current-wave RALLY pending/active, a living currently visible carrier and a reliable native pickAt point inside the operable canvas. Offscreen targets require the player's View first; revalidate at activation.
4. Panels, pause, terminal and construction modes block dispatch. No reliable carrier hit means truthful no-order feedback, without movement fallback, retargeting or retries.
5. Reuse native issueCommand and existing readback/ring, confirming only dispatch. New move/stop/guard overrides immediately, and UI updates never resend.

Do not change vision, pickability, pursuit, carrier selection, RALLY/15s duration, Boss, AI, pathfinding, damage, HP, costs, cards, RNG or any timing window. Basic controls stay free, with left three-choice plus complete right32-card tree permanently visible. Any rule expansion is SPEC_DECISION_REQUIRED; continue the separately authorized steward entry while that part is unresolved.

## Required acceptance

| Layer | Required evidence | Boundary |
| --- | --- | --- |
| Native Node | One activation on real Game/RALLY issues one native attack to currently selected formal soldiers, current carrier target and manualAttack=true; unselected soldiers/heroes/workers retain orders | Internal-ID force commands cannot replace native hit conditions |
| Boundary regression | View issues zero attacks; repeated UI updates issue none. Fog/sandstorm, death, expiry/wrong wave, replaced restore entities, empty/mixed/hero-direct selection and blocking modes produce no wrong order or move fallback | Mark controlled cases CONTROLLED_FIXTURE, without claiming natural success |
| State/later order | Read-only updates preserve snapshot, both RNGs, resources, HP and cooldowns; actual command fields match native right-click; new move/stop/guard overrides immediately | Preserve historical strict RNG Restore FAIL |
| Formal Chromium | Pin new source and full payload hashes. Continue C's unchanged save and use native mouse/keyboard for selection, View and new entry. Preserve before frame, current visibility/pickAt, native event and immediate after | Carrier, summary and ring must agree; an order does not establish hit/kill |
| UI/input | 1440×900,1024×768 and existing small viewport/four languages; Tab/Space/Enter focus without duplicate hotkeys; zero page errors; complete32-card dual pane retained | PENDING; first-slice45 checks cannot be carried over as new-slice passes |
| Isolated C | Retain minimum10s intent spacing and one attention goal; explain purpose only, without location/timing/optimal strategy. Start a new round from the same unchanged save without overwriting sealed rounds | Record discovery, prior selection/target understanding, autonomous activation, first correct native order, each View/select/attack intent and nonuse reasons. Natural nonuse is NOT_EVALUATED |

Primary acceptance is intent/order agreement, later override and no additional mandatory steps or false feedback; a carrier kill or victory is unnecessary. A/B have not naturally encountered this carrier window and cannot be marked player PASS. This remains informed N=1 retesting, without a general effect claim. Run affected focused checks and necessary existing72-test coverage. Do not repeat100/200 short performance runs unless implementation adds persistent scanning/drawing or a concrete regression appears.

## Later independent candidates

| Candidate | Need | Verification and limits |
| --- | --- | --- |
| Visible sources/directions of actual core damage | A/B's healthy-army/core-loss causality | Attribute actual damage events, preserve Fog, do not infer damage from target references or choose the best target |
| Sticky steward save/close and existing confirmations | Navigation costs in all baselines and A-after | Keep every setting, native pause and costs; measure intents, scrolling, erroneous submission and small-screen overlap |
| Precise production-wait/public-spending explanation | A's generic reason, B's age tradeoff, C's food spending | Reuse productionStatus/reserveCost; no parallel rules. Positive inventory deltas are not complete income; do not change policy/reserves |
| Mild selection/target visual hierarchy | Discovery of an already legible summary | Test uninformed new players and distraction/overlap; no auto-tracking or hidden card tree |

Natural ten waves/NG+, human listening/fun/retention, sustained100/200 survivors, long-run memory and physical GPU each need evidence. Existing performance covers only four30s SwiftShader samples with deaths; the200-unit After heap is higher and long runs remain unproven. Strict Save/Load RNG -1129663591→3165303705 remains FAIL. A new UI slice cannot promote these gaps to PASS.

## Checkpoint and continuation

Root continues implementation, focused verification, player feedback and remaining needs. A commit/push/handoff is not the overall stopping condition. Root supplied existing remote checkpoint15fcb0f230cb04f7ddc2ff454334de19b5e29098. This curator did not operate Git, Ownership or the progress feed, and that SHA is not presented as the unfinished slice's source.

Curator record: STOP_REASON=ASSIGNED_EVIDENCE_CURATION_COMPLETED_HANDOFF_TO_ROOT; EXECUTION_DURATION=UNKNOWN (full start time not measured); NEXT_AUTHORIZED_TASK=root completes carrier entry, focused acceptance and isolated C retest; CHECKPOINT_SHA=6075dbaae8281de54ec5c932e349b0ed591f3c7f (reviewed first-slice source); AUTO_RESUME_AVAILABLE=false; rootTaskComplete=false.
