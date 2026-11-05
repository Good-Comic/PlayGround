# 樂趣測試與控制改善交接

依使用者最新測試指令第19行，本輪提問、進度、整理報告與交接採臺灣正體中文，優先於舊雙語整理規則；程式識別符、正式遊戲四語、原始日誌與sealed bytes不改。

## 目前保存點與任務

本整理截點根代理已正常push並完整ls-remote核對的遠端為 `35dedfe6ee203a4d9689290dc466484c39557cf8`，見[實際收據](terminal-input/remote-receipt.json)。P3五檔另已本地提交 `9117a02f9b6fe4989c744b90802df522dd0b7c07`、Node64／64，正式163資源構建／Chromium驗收中，尚未推送；不能把本地候選當成遠端或已交付。收據／本文件是當次觀察，後續先核對最新RECOVERY及實際遠端，不把舊SHA或日期當永遠最新。

任務仍持續。第六切片B完整自然續玩有限支持查看／反擊意圖；第七切片修正自然B揭露的結算後E副作用。限定200 ABBA複測已完成，但長測、實體GPU、整體樂趣與勝率仍未證明。下一合法工作是P3正式驗收，結果由根代理另寫報告。

## 七切片來源與證據矩陣

| 切片 | 固定遊戲來源 | 已有技術證據 | 自然玩家與限制 |
| --- | --- | --- | --- |
| 1 軍令讀回／可見人工標示 | 6075dbaae8281de54ec5c932e349b0ed591f3c7f | Node72／72，160資源，Chromium45／45 | A/B/C完整聚焦After，A/C辨認錯令並改護衛；A/B第4波、C第5波敗北，原集火目的未完成 |
| 2 已選兵人工集火已見旗手 | 2bac6e36172b82e7ca8c00c42473b5447dc5ba3e；版面後續6a9cde0另見續作 | 戰鬥Node84／84，160資源，最終旗手Chrome28／28 | C自主按新入口、23人目標吻合，但actual quota中斷，僅PARTIAL，不能混入完整After |
| 3 總管固定既有操作列 | 3237a7f109c3fdbc343ecb05336efb5660f863cf | Node32／32，Chrome44／44；該碼後續未變 | 自然玩家效益未測 |
| 4 城心最近實際HP失損 | 955fceaadb781d9128a857636c0f20a4830ccc12 | 當前Node96／96，161資源，Chrome25＋旗手28 | A完整自然續玩敗北並finish，能區分2.93／127.8實損；未證明救城 |
| 5 本波已記錄最大單次實損 | 1456591db51ee4fb0cf6714ccb5dc6b645a33625 | Node101／101，161資源，Chrome28＋29 | B看到最大127.8及後續小傷，右鍵意圖實際為move；時間理解部分評估，補救失敗 |
| 6 來源查看／人工反擊 | 1710938cd79da6d347a54764e85e13b11babca34 | Node188唯一項，162資源，Chrome36＋29 | B完整自然續玩正式第4波敗北，查看不派令、16人集火衝車可見吻合；精確歷史個體／取消／後令未評估 |
| 7 終局守門／空紀錄與重複呈現修正 | 35dedfe6ee203a4d9689290dc466484c39557cf8 | Node213／213，162資源，Chrome結算19＋來源38＋旗手29 | 自然B原缺陷固定171：defeat後E仍新增60冷卻、14人60護盾5秒。修正採受控終局驗收，非新玩家勝利 |

七切片不是七次三角色全量重測；各來源／角色／測試方法分列，不能相加當成真人樣本或全場PASS。[來源操作報告](SOURCE-ACTIONS-REPORT.md)、[終局輸入報告](TERMINAL-INPUT-REPORT.md)、[主矩陣](MULTI-AGENT-PLAYTEST-MATRIX.md)與[證據索引](EVIDENCE-INDEX.md)有詳細入口。

## 初始效能、真實失敗與複測

171初次100／200 ABBA：200 before P95兩次83.4，after83.5／99.9，後者警訊保留；after uiFaults265／266／240／237、原生傷害faults0。showPeak(null)空解參照，以及無紀錄重複掃軍隊／不變呈現重複格式化，是真實實作缺陷；原61 PASS／3 FAIL沒有改稱夾具問題。35加入最小null guard與快取，但仍逐次驗視野／pending，啟動重新驗條件，不用快取授權命令。

200限定r2對照145與35：before P95為99.9／99.9，after99.9／83.4，P50皆83.3，FPS約12.66–12.92。兩組初始場景／兩種RNG相符，四案page errors空、原生faults共237筆全0；after uiFaults118筆全0，before沒輸出該欄位，不能補0。暖機後存活183／186／184／183，終點145–148；可見來源低、knownPeak覆蓋0。只支持新短樣本未見一致額外退步，不宣稱因果加速、持續200、無洩漏、長測或硬體通過，不能抹除初次警訊。

修正前終局Node2 PASS／6 FAIL與自然B護盾／冷卻缺陷保留。根代理首兩次Chrome腳本誤期待cycle0（正式首周目1）、或liveCD仍精確60（原生已倒數），只修腳本未改規則；與上述真實缺陷分開。

## 持續邊界與恢復

第一閉環12報告原SHA與三場After原結果不改；C第二切片partial、B/A既有usage-limit與整理角色actual usage-limit續作紀錄仍保留。45秒控制器失聯暫停／原生存檔、65秒收尾影片保存只證明控制器安全收尾，非玩家完整回合、排程待機或自動喚醒。AUTO_RESUME_AVAILABLE=false，quota_percent=UNKNOWN。

Strict SaveLoad RNG `-1129663591 → 3165303705`仍FAIL；新UI純讀與終局守門不修復該表示。自然十波／NG+、真人樂趣／聽感／留存、勝率與平衡因果、長時間記憶體／實體GPU仍需證據。來源查看／反擊不改傷害、費用、RNG、AI、Fog／沙暴或時窗，免費基本控制、手動後令與左三選一＋右完整32卡永久同屏保留。

Ownership273，原收據097b5d3d80e18f6be9fca543af82024689eb38fe；專案自聲明Execution codex-fun-lab-281169b5-20261105，非平台認證身份。本整理只寫委派文件／必要證據manifest，未操作Git、Ownership、Feed或公開部署；未接管他人Owner，未改main／RC／Pages／舊Issues／OpenCode／Immutable Build。

STOP_REASON=ASSIGNED_SIXTH_SEVENTH_EVIDENCE_CURATION_COMPLETED_HANDOFF_TO_ROOT；EXECUTION_DURATION=UNKNOWN（未量本角色完整起點，不虛構根任務主動時數）；NEXT_AUTHORIZED_TASK=根代理完成P3正式163資源構建／Chromium與獨立玩家理解驗收，再依真實缺口接續；CHECKPOINT_SHA=35dedfe6ee203a4d9689290dc466484c39557cf8（本整理已知遠端收據）；AUTO_RESUME_AVAILABLE=false；rootTaskComplete=false。一般push／交接是保存點，非整項遊戲開發完成。
