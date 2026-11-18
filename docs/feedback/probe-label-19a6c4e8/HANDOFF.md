# 接敵診斷案例標示修正

任務 PROBE-LABEL-19A6C4E8；執行 codex-probe-label-19a6c4e8-20261119；認領 Ownership 338，收據 df1ac32a515fd18ccf542344391e0459fc7fc761。來源 8c5564081999af0ea57a8ac8555e0ebdeee6122a；獨立分支 codex/riftwatch-probe-label-19a6c4e8。未接管原 Fun Lab，未修改遊戲、公開部署、正式 Strategy 或其他 Owner 文件。

## 修正與實際價值

接敵工具 probe.mjs 原先即使使用 mixed6，仍標示「10民兵/.55」。現在固定記錄案例 ID、種子42、FRK、steppe、兵種組成、數量、間距、目標 core 與20模擬秒。未指定案例保留原10民兵預設；明確 militia10 也可使用；未知名稱立即拒絕，避免拼字錯誤悄悄跑預設案例。保留禁止覆寫既有證據。

這是測試工具缺陷修正，避免誤讀混兵證據；不是玩家可見的接敵改善，也不代表 C-36 修復。

## 必要驗證

以目前相同遊戲來源分別執行修改前後工具，共四個20模擬秒受控場次。兩組 hits、failures、readySearches、occupiedGoals、全部 rows 深比較完全相等。

- mixed6：6混兵、間距0.7，5名命中、1筆失敗、33次避讓搜尋、27次落點與站定友軍重疊。
- militia10：10民兵、間距0.55，8名命中、2筆失敗、73次避讓搜尋、69次落點重疊。
- 未知案例拒絕且未產生檔案：PASS。
- 現有輸出禁止覆寫：PASS。
- 壓縮證據解壓及原始 SHA-256：PASS，詳 evidence.json。

最初與舊 before-goals／mixed6-before-sticky 比較出現差異；舊來源與目前來源不相同，不能用作無影響驗證。該初步比較保留於 historical-comparison-inconclusive.json，正式結論只採同來源配對資料；沒有修改舊封存結果。混兵既有48筆歷史資料與目前33筆不可混算。

本輪沒有修改 js、css、index 或遊戲資源；正式構建、Chromium、自然戰役、四語及100／200單位效能均 NOT_TESTED，沿用既有結果不冒稱重驗。未啟動三角色模擬。QUOTA_PERCENT_UNKNOWN；排程設定及自動執行仍未驗證。

## 下一項工作

C-36 與活體友軍阻擋仍未解決。下一步在合法獨立範圍內，依目前33筆混兵與73筆民兵的接敵記錄精準隔離終點重選原因；不要重新套用已否決的全域端點過濾、黏住終點或交通優先權方案。

工具修正已核實遠端來源：1cd09af14a46cbf85367eb6b12152317293c005c。
