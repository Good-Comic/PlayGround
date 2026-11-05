# 依來源分列的驗收矩陣

本次恢復有效證據並新增測試工具驗證，沒有重新跑所有歷史測試。各列依固定來源與方法解讀，相依回歸可能重疊。完整原始來源 SHA 見 [README](README.md) 及各結果檔。

新增整理文件與工具的 `git diff --check` 通過；全量檢查 exit 2 來自原樣保存的歷史報告 EOF 空行及原始測試日誌尾端空白。[暫存驗證收據](STAGING-VALIDATION.json)保留結果；不為樣式更改封存 bytes。四份被既有 `*.log` 規則忽略的歷史失敗／重測日誌另以明確檔案路徑加入證據，不改 ignore 規則。

| 項目 | 實測來源／分類 | 結果與範圍 |
| --- | --- | --- |
| 軍令讀回 | `6075dba…`／定向 Node、受控 Chromium | Node 72／72、Chromium 45／45、160 資源 |
| 旗手與版面 | `2bac6e3…` 至 `6a9cde0…`／受控 | 旗手最終檢查見原矩陣；390 英文遮擋 FAIL 與修正保留 |
| 總管固定操作列 | `3237a7f…`／定向 Node、受控 Chromium | Node 32／32、Chromium 44／44，四語與視口驗證 |
| 城心最近實損 | `955fcea…`／定向 Node、受控 Chromium | Node 96／96、實損 Chromium 25 項、旗手 28 項，161 資源 |
| 本波最大單次實損 | `1456591…`／定向 Node、受控 Chromium | Node 101／101、實損 Chromium 28 項、旗手 29 項，161 資源 |
| 來源查看／目前選兵反擊 | `1710938…`／定向 Node、受控 Chromium | 188 個唯一 Node 項目，Chromium 36＋29，162 資源；後續發現空紀錄 UI 例外，另行修正 |
| 結算守門、來源與旗手回歸 | `35dedfe…`／定向 Node、受控 Chromium | [Node 213／213](recovered-fun-lab-281169b5/terminal-input/)、[結算 19](recovered-fun-lab-281169b5/terminal-input/browser/)、[來源 38](recovered-fun-lab-281169b5/source-actions/browser-r2/)＋[旗手 29](recovered-fun-lab-281169b5/terminal-input/)；零 page errors |
| 生產成本、保留、草稿 | `6852cf8…`／定向 Node、受控 Chromium | [Node 64／64](current-production/node-and-handoff/readable-values-node-r2.txt)、[Chromium 32／32](current-production/browser/result.json)，四語 × 四視口、原生 Save／Continue、小數邊界 |
| 正式構建與本次資源重驗 | `6852cf85acca5c08923e0191a1e0703189f4d3e6` | [163／163 SHA-256](CURRENT-RESOURCE-VERIFICATION.json)，本地、未部署 |
| 新穩定控制映射 | 正式 685 構建＋本分支工具／受控 | [Chromium 14／14](control-mapping/result.json)：舊錯點重現、新 DOM 身分、Reload、純觀察兩種 RNG、原生正確點擊 |
| 衍生控制器整條輸入管線 | 同上／選單專用受控 | [PASS](gateway-smoke/SMOKE-RESULT.json)，原生開玩法說明與 finish，沒有開始遊戲、不是新玩家 A |
| 原工作樹文件保存 | 407 檔、189,090,280 bytes | [逐檔 SHA-256 相符](PRESERVED-WIP-MANIFEST.json)，原 Owner 未提交內容保留 |

**獨立 AI 玩家與自然流程**

| 對局／角色 | 實際結果 | 可支持與未能支持 |
| --- | --- | --- |
| 第一輪 A／B／C Before | 自然從開局遊玩；A／B 第 4 波敗北，C 第 5 波敗北 | 原三份 MD／JSON 封存保留 |
| 第一輪 A／B／C After | `6075dba…`，各自原封快照原生 Continue，均完整結束；仍敗北 4／4／5 | 初始三角色閉環及導演復核完成，12 份封存原 bytes 不變；不是三場全新自然十波 |
| C 旗手續玩 | 23 人人工目標吻合；真實 quota 中斷 | PARTIAL；控制器收尾不冒充完整玩家 After |
| A 最近實損續玩 | `955fcea…`，完整結束；辨認 2.93 弓兵與 127.8 衝車實損，仍敗北 | 原角色報告已封存；沒有證明救城或樂趣提升 |
| B 最大實損續玩 | `1456591…`，完整結束；看見大傷保留，意圖反擊但右鍵實際為 move | 可見補救失敗，原結果及主觀報告保留 |
| B 來源操作續玩 | `1710938…`，完整自然續玩約 90.714 秒牆鐘；16 名選兵集火衝車，正式第 4 波敗北 | 畫面支持查看與集火意圖；精確歷史同一個體、取消與後令未完整評估。結算後 E 副作用另已修正 |
| A 生產介面續玩 | `6852cf8…`，Continue 至敗北觀察 191.529 秒；第 4 波敗北、3 次襲擊、74 擊殺、3,679 採集、累計 8:56；finish ok | [公開復核](A-production-public/RECOVERY-VISIBLE-REVIEW.md)支持摘要／經濟草稿／完整明細／儲存的實際順序。原玩家完整報告 `UNSEALED_ORIGINAL_REPORT`，不補造分數或意願 |
| 真人樂趣、再玩意願與留存 | NOT_TESTED | AI 角色的能力設定與感受不等於真人實測 |
| 本候選自然十波勝利／自然 NG+ | 未通過／NOT_TESTED | 既有 RC 受控勝利及 NG+ 只沿用其原有限結論，不改現有 RC 等級 |

第一輪與後續角色報告見[原測試矩陣快照](recovered-fun-lab-281169b5/MULTI-AGENT-PLAYTEST-MATRIX.md)。該快照保留較早時間的 pending 文字，最新 685 生產介面結果依本資料夾獨立報告判定。原 @數字 控制器可能在捲動／重建後錯點，涉及意圖的既有結論須核對實際畫面；不能只依輸入回 ok 判定成功。

**效能、負載與記憶體**

環境為 Chromium 154.0.8037.57、4 CPU quota、32 GiB 容器記憶體上限、ANGLE／SwiftShader CPU 軟體繪圖。初次使用同一 B 原封快照以原生增兵產生 100／200 受控負載，各案暖機 5 秒、取樣 30 秒牆鐘、ABBA 各兩次；AI、碰撞、死亡與增援保留，數量不是全程固定存活。

初次比較 `1456591…` 與 `1710938…`：100 規模 P50／P95 約 50／50.1 ms；200 before P95 83.4／83.4 ms，after 83.5／99.9 ms，警訊保留。171 的內部 `uiFaults` 為 265／266／240／237，原生傷害觀察 faults 為零；這是 UI 真實例外，即使 page errors 為零也不能宣稱正常。來源為 [initial result](recovered-fun-lab-281169b5/source-actions/performance-initial/result.json)。

後續修正空紀錄解參照、無資料掃描及不變呈現後，以 `35dedfe…` 對 `1456591…` 做限定 200 ABBA。以下為原始 30 秒短樣本，JS heap 是兩端取樣，不是總程序記憶體、穩態或漏洩判斷：

| 來源／次序 | P50 ms | P95 ms | FPS | JS heap 起點→終點 MiB |
| --- | ---: | ---: | ---: | ---: |
| before 145／1 | 83.3 | 99.9 | 12.83 | 17.86 → 21.82 |
| after 35／1 | 83.3 | 99.9 | 12.66 | 14.30 → 23.76 |
| after 35／2 | 83.3 | 83.4 | 12.92 | 11.05 → 13.29 |
| before 145／2 | 83.3 | 99.9 | 12.82 | 17.21 → 16.10 |

四案初始場景 SHA 與兩種 RNG 相同，暖機後存活 183–186、終點 145–148。30 秒牆鐘只推進約 19 秒模擬，不能稱為 1× 即時負載通過。after 的 118 筆 `uiFaults` 全為零；before 未記錄此欄位，不能補成零。四案原生傷害 faults 共 237 筆為零。可見來源比例僅約 5–17%，沒有持續密集操作來源按鈕。

結果只支持本短樣本未見一致額外退步；不宣稱因果加速、固定 200 長測或實體 GPU 通過。35→685 的七個戰鬥／支出模組雜湊相同，但 685 生產面板尚未做新的全量逐幀長測。原始 [r2 result](recovered-fun-lab-281169b5/source-actions/performance-r2/result.json)及[初次警訊](recovered-fun-lab-281169b5/source-actions/performance-initial/result.json)均保留。

**真實失敗與剩餘限制**

| 項目 | 狀態 |
| --- | --- |
| defeat 後 E 仍增加冷卻／14 人護盾 | REAL_GAMEPLAY_DEFECT；已修正於 35。原 Node 2 PASS／6 FAIL 與自然畫面保留 |
| 空紀錄 `showPeak(null)` 與重複呈現 | REAL_UI_DEFECT；已修正於 35；保留 171 初次例外與效能警訊 |
| 生產表 800px 撐開面板 | REAL_UI_DEFECT；初次 17 PASS／1 FAIL 保留，833／685 修正後重測 32 PASS |
| 原數字別名誤點 | TEST_HARNESS_DEFECT；本獨立工具修正，14 項＋選單驗證，尚非新三角色全程驗證 |
| 終局測試腳本誤期待 cycle 0、精確冷卻 60 | TEST_EXPECTATION_ERROR；修正腳本，沒有改正式首周目 1 或倒數規則 |
| 初次選單煙霧腳本誤期待 selector | TEST_EXPECTATION_ERROR；失敗紀錄保留，改用公開 key 後 PASS |
| Strict SaveLoad RNG `-1129663591 → 3165303705` | 歷史 FAIL，位元相同但 strict 表示不同；本切片未修復 |
| 原 A 完整主觀報告 | UNSEALED_ORIGINAL_REPORT；新的公開復核不能代寫 |
| 自然十波、自然 NG+、長測、真人聽感、實體 GPU | 未通過／NOT_TESTED／HARDWARE_TEST_PENDING，維持原狀態 |

本輪不調整費用、難度、獎勵、傷害或 RNG 來換取勝利。新的證據恢復狀態及 Ownership 邊界見 [RECOVERY](RECOVERY.json)；原始 FAIL、INCONCLUSIVE、NOT_TESTED 不改成 PASS。
