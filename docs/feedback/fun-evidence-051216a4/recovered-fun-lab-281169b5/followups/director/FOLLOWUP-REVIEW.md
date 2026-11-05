# 後續複評｜旗手人工命令、總管固定控制列與效能

**判定：第二切片已有 C 自主下達正確人工旗手命令的單例，並保留後續改令；C 因實際平台額度中斷，不能算完成玩家 after，也沒有驗證命中、擊殺或勝率。第三切片的總管固定控制列已有實際功能與定向驗收，尚無自然玩家體驗證據。RALLY 效能仍 PENDING，保留舊 200 單位幀尾警訊，不因程式優化或部分重測先判解除。**

此次僅讀指定封存報告、既有驗證結果及 main／battle／core／rally 的相關鍵盤處理；沒有啟動瀏覽器、Node 或效能程式，沒有操作 Git，沒有修改 sealed 原件或其他檔案。唯一新增為 director-after/FOLLOWUP-REVIEW.md。本文件依指定採繁中，不翻改原證據。

## 封存與來源

先核對新 C 的 SHA256SUMS，再自行重算兩份報告，均相符：

| 檔案 | SHA-256 |
| --- | --- |
| flag-player/players/C/after/REPORT.md | 2eacdde6bfbf5fcc977274639da8feebaeecbabf1275f8480b56ea23575bb38f |
| flag-player/players/C/after/REPORT.json | 7a8077d2bb6cb9b63d5ade9ade731099affac41f872d22eb65e2ca9555de3419 |

來源必須分開：

- **C 知情部分回合：** 畫面版本 2bac6e3、fun-lab-flag-r2；正常 Continue 接自己相同未修改自然快照，非新十波。C 沒有讀內部狀態核驗存檔，這不冒充玩家自行完成情境完整性審查。
- **旗手最終直接 Chromium：** direct-flag-final/result.json，來源 6a9cde03141c6800be6da28ada0e9b0dc1145be4，28／28；正式 160 資源 SHA 通過。使用 C 原自然存檔，resume SHA 為 9cb994e88d356f44ab902bb1e29c3538525dcfcc299b26ab6d89e54f589aa21a；阻擋／版面診斷另標 CONTROLLED_FIXTURE。
- **總管直接 Chromium：** direct-steward-r2/result.json，before 2bac6e36172b82e7ca8c00c42473b5447dc5ba3e、after 3237a7f109c3fdbc343ecb05336efb5660f863cf，44／44。
- **既有 Node 日誌：** node-rally-final-regression.txt 84／84；node-steward-controls.txt 32／32，均 0 fail。本角色讀取既有日誌，不宣稱自己重跑。
- C 玩的是 2bac6e，不是最新 6a9cde；不能把其報告直接寫成最新來源已做新的玩家回合。最終原生功能驗收與玩家單例是互補且不同的證據。

## C：哪個主張成立

| 面向 | 判定與證據 |
| --- | --- |
| 可發現性 | **單例成立。** wall42.697 看見停用原因「先查看」，wall59.892 自主查看，wall60.802 入口可用 |
| 查看與發令區分 | **單例成立。** 查看後仍 26 人護衛＋2 人自主接敵，C 沒有把鏡頭移動當作攻擊 |
| 預期與實際命令對象吻合 | **單例成立。** wall77.410 自主按人工入口；wall78.160 的 Toast、摘要及金環均為 23 人集火旗手·精銳守衛 |
| 選兵涵蓋 | **可讀。** 早先28人，按後23／全軍25；只確認當時可見人數，不用不同時點推算每名士兵死因 |
| 自主後令 | **單例成立。** wall116.560 改按援護，wall117.361 四人護衛城心，沒有被入口持續改回集火 |
| 操作負擔 | C 自述省去在密集兵群猜座標，屬局部正向回報。此回合仍包含查看與攻擊兩個意圖；未做可比的完整操作／認知負擔測量 |
| 抵達、命中、旗手擊倒、事件反制收益 | **NOT_EVALUATED。** 後續只見集結結束；名稱變化或群體轉自主接敵都不能代替擊倒證據 |
| Fog、暫停、未選兵、其他面板邊界 | **玩家未評估。** 相應技術案例另列，不把它們算作 C 親自驗證 |
| 完整 after、勝率／平衡／真人樂趣 | **未成立。** 此為一個知情 AI 部分樣本；無法外推 |

最終直接 Chromium 的原始 dispatch 額外支持程式語義：載體 id169、當下 picked id169，28 名選兵各 manual=true／target=169，選取保持；發令當下 RNG、HP、冷卻、資源、英雄與鏡頭不變。這是獨立原生案例，不能把它的28人數據混成 C 自述的23人事件。另有 Space 只送一次且不切全域暫停、後續移動覆蓋、四語視口及霧中／過期拒絕，均限已測案例。

因此第二切片可接受的閉環是：「看到入口 → 自主選擇對既有選兵下令 → 指向想打的旗手 → 可再改令」。原來的「看得懂錯令」已進一步出現一次「意圖正確送出」；仍沒有證明戰術反制完成或整體遊戲更容易獲勝。A／B 沒有這個第五波新回合，不列為玩家 PASS。

## 實際額度中斷的界線

C 最後即時觀察是 wall187.181，Continue 後158.747秒：第五波、完成4／10、城心20%，英雄直控已成功。封存主狀態為 INTERRUPTED_FOCUSED_RETEST_PARTIAL_EVIDENCE，STOP_REASON 是實際平台額度中斷。九個有效意圖含 Continue 與沒有預期確認的 Tab，最短間隔12.642秒；這些只描述可驗證的即時窗口，不是人類 APM。

中斷後控制器保存的 final 圖有 DEFEAT、4波、116擊殺、8073採集、12:08，但 C 沒有即時看到結算，沒有事後補操作或 finish。該圖只能另列為控制器保存終局；不能記成玩家主動玩到敗北，也不能把失聯期當 C 自己的等待或決策。累積12:08與收益包含存檔前歷程，不用它們推新入口改善存活、產出或勝率。這項中斷依實際平台事件判定，和未知週額度百分比無關。

C 的 AI 模擬重玩意願仍為3／5。具名命令與可自主改令是局部正向回饋；事件結果不明、守城止跌不清楚、Tab補救成本與中斷都限制整體體驗結論。不能用單例滿意或保存的敗北替代完整樂趣驗收。

## Tab 未切英雄：初步分類

**OBSERVED_EXPECTATION_MISMATCH_WITH_FOCUS_DEPENDENT_EXPLANATION；不是已證實的英雄切換 Bug。**

封存紀錄為 wall173.783 按 Tab，wall174.448 仍是兩名戰士、無直控確認；wall186.425 改點英雄按鈕，wall187.181 才有直控與英雄429／520。沒有當時 document.activeElement、事件 target／傳播或 defaultPrevented 的證據，不能斷言鍵盤沒有送達、toggleHeroControl 壞掉或工具故障。

已讀程式有兩條刻意不同的路徑：

1. main.js:198 起的 window keydown，在未被面板／暫停等條件擋住、且事件能傳到 window 時，Tab 會 preventDefault、toggleHeroControl，再更新選取 UI。
2. battle-actions.js:42、core-defense.js:40、rally-objective.js:144 起的 DOM 按鈕 keydown，對 Space／Enter／Tab 都 stopPropagation；Tab 不 preventDefault，保留瀏覽器正常焦點導覽。這是原生按鈕可及性的既有設計，不代表英雄命令被錯誤吞掉。

C 前一個滑鼠動作是援護城心；後續 E、Q 不必然移走按鈕焦點。因此「焦點仍在 DOM 控制，Tab 只移到下一項」是符合程式的合理解釋，**不能據此補寫成當時已確定的根因**。滑鼠英雄入口成功也只證明另一條入口在稍後可用，不排除兩時點狀態差異。

後續若調查，先用正常原生事件做有限的焦點矩陣，記下按前 activeElement、event.target、傳播與結果：戰場焦點按 Tab；按鈕焦點按 Tab；按鈕焦點按 E／Q 後再 Tab；鼠點英雄。判定時保留 Tab 原生導航與 Space／Enter 啟動，不直接移除 stopPropagation，也不加全域強制攔截求「每個地方 Tab 都切英雄」。目前可列「快捷鍵作用情境的說明／發現性待驗」低風險候選，不以此單例改核心規則。

## 第三切片：總管固定控制列

**實際功能成立、定向技術驗收通過；自然玩家價值尚未評估。** 這是原 Directive 已授權的低風險流程改善，沒有新增經濟能力、付費研究或自動生產規則，無須因功能位置調整再問一次許可。

44 項 Chromium 結果直接顯示：before 在表單頂端時三個控制位於約 y1888、超過 dialog 底846；after 三個控制在約 y798–833，頂端零捲動可操作。原生設定食物優先、套用、重開、關閉不套用、Escape、保留原先暫停與正式 Save／Continue 均有對應檢查；面板中模擬時間、兩個 RNG 維持暫停，四語／四視口頂底可用。Node32補充既有規劃語義回歸。

這足以證明「既有按鈕可從表單頂端直接使用」的變更。沒有新的自然玩家回合去測完成設定的意圖數、誤改、理解、認知負擔或樂趣；不把受控零捲動等同真人節省幾秒，也不聲稱經濟表格的診斷／資源因果已全面解決。這些定向 Save／Continue PASS 同樣不能覆蓋嚴格 RNG Restore 的歷史 FAIL。

## RALLY 效能：警訊保留，重測未完

performance-rally/result.json 是原封 C 存檔 Continue 後再增原生兵量的 CONTROLLED_100_200_NATIVE_RALLY_COMBAT_SHORT_SAMPLE。每案30秒，保留 AI、碰撞、傷害與死亡，before為6075dba，after為舊2bac6e；同初始 scene SHA及RNG，並非完整自然戰役或持續高存活。

| 初始配置 | before → 舊after FPS | p95 | 量測起終存活數 |
| --- | --- | --- | --- |
| 100 | 24.380 → 28.413 | 66.6 → 50.0ms | before92→86；after92→86 |
| 200 | 18.017 → 16.986 | **66.8 → 83.3ms** | before159→149；after159→149 |

200案 p95 增16.5ms、約24.7%，是需要保留的幀尾警訊；100案的較好結果不能把它平均掉。也不能由單次前後與不同執行時序，斷言新命中掃描就是根因。

舊200 after 的 eligibleTraceFraction為1、pickAt257次，計時總32.9ms、單次p95約0.2ms；這些數據可描述已量到的呼叫，不能證明或排除同步layout、排程、GC或其他因素。100 after 的 eligibleTraceFraction約0.783且後段旗手broken；不能當作全程有效的昂貴分支。pending／active條件、DOM可用點與真正掃描次數仍要分開記，不能只因面板存在就算最重負載。

最新6a9cde已將固定每100ms讀layout改為 ResizeObserver／resize／dirty及明確force時才讀；這是針對性的成本調整。程式存在不等於效能警訊已解除。最終來源仍保留原生命中檢查，不能拿原先prep場景替代。

本次讀取 performance-rally-r2/result.json 時已有 4 列，但預定 ABBA 尚未四列完成，狀態仍 **PENDING**。可讀部分如下，僅記進度，不作最終推論：

| 次序 | 來源／模式 | FPS | p95 | 存活起終 |
| --- | --- | ---: | ---: | --- |
| 1 | 6075dba／before | 15.697 | 83.4ms | 156→148 |
| 2 | 6a9cde0／after | 17.719 | 83.3ms | 159→151 |
| 3 | 6a9cde0／after | 17.879 | 66.8ms | 159→148 |
| 4 | 6075dba／before | 15.510 | 83.4ms | 156→145 |

前兩列約83.4→83.3ms的接近值，既不能當完整ABBA通過，也不能證明回到舊66.8ms基線；before自身亦已變慢，突顯執行時序／負載差異的重要性。初始scene一致，暖機後存活數與sim起點仍不同，須連同完整四列、覆蓋率及變異一起判讀。本角色沒有等待後兩列，也沒有代跑。

**效能結論維持 PENDING／INCONCLUSIVE。** 完整重測應保留順序、全部原始列、status／可見／選兵條件覆蓋、實際pickAt與layout成本、存活數、幀尾及機器資訊。若最終仍有一致退步，先界定成本再修；不減兵、關 AI／碰撞、改HP／時窗或藏起失敗來求 PASS。SwiftShader是CPU軟體繪圖，這些短樣本不認證實體GPU、長測、記憶體洩漏或持續200存活。

## 後續授權工作與尚未證明事項

第二切片的正確人工作戰單例可保存；不要補成完整玩家場次。第三切片已有實際功能，可以依原授權接續驗證與其他低風險流程改善。優先讀完根代理正在產生的 ABBA 結果再決定是否還要針對效能修正；有可執行獨立工作時不必等量測空轉。

C仍有事件結束結果不明、危機補救效果難讀、停用長說明重複與焦點情境不明等具體問題。若接續，依已知視野及既有事件狀態改善結果說明／當下禁用理由，或以焦點矩陣先釐清輸入情境，均比擅自加自動選敵、閃圈或延長事件更符合原授權；是否改善體驗仍須有實際證據。

免費基礎控制、左三選一＋右32卡永久同屏、Fog／沙暴／人工後令優先、既有傷害／費用／卡池／RNG／時窗全部保留。未核准九科技、中國副箭與探索180估值不新增。嚴格 RNG Restore -1129663591→3165303705 仍 FAIL；自然完整十波／NG+、長期效能及硬體缺口不改狀態。無公開部署、main／RC／Pages或Git操作。


## 讀取證據雜湊與交接

觀察時間：2026-11-05T18:07:30.058091+00:00。下列固定檔案為讀取時SHA-256；進行中的r2另明標快照，不宣稱封存。

| 檔案 | SHA-256 |
| --- | --- |
| direct-flag-final/result.json | 167260bd310edc058c982c160e81d10208a6a3cb6a1471681266e116cfcb7bdb |
| direct-steward-r2/result.json | 6f67ef980e3e45ef1e71a064c4123a94bc8c3af802f7929d25a9f958c392ebbb |
| node-rally-final-regression.txt | 89172627a66e7797db234271245a646f5c5ab852a3f4032fa2ac18ff2cf73932 |
| node-steward-controls.txt | abb1c038d7552b0b968ac30767fcfd268176a2e5afcaf8c5837e00e4d6594a09 |
| performance-rally/result.json | 3d3195b5b7a1dae2f65c7ba1ffd0b0dd8b64a2d90a3771e3bc7338f8b2ce8794 |
| performance-rally-r2/result.json（本次部分進度快照） | 194f94bdad0ea27f5e7d01fe8b0ec06cdf11f4f6c4bda0d6393dd564bdfa9b1e |

STOP_REASON=ASSIGNED_READ_ONLY_FOLLOWUP_REVIEW_COMPLETED_HANDOFF_TO_ROOT；EXECUTION_DURATION=UNKNOWN（未量完整時長）；NEXT_AUTHORIZED_TASK=根代理完成既有ABBA量測判讀，保留C部分證據並接續合法體驗改善；CHECKPOINT_SHA=6a9cde03141c6800be6da28ada0e9b0dc1145be4（受評遊戲來源，非本角色提交）；AUTO_RESUME_AVAILABLE=false。
