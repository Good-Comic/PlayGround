# Canvas 延遲成本定位與交接

本輪完成單一重大診斷，未修改遊戲、規則或公開部署。承接 9f12bc502aed3dde4ada28aca2c3a5729621e2d4 的玩家 B 第四波原始快照與兩個正式本地構建；本輪只用快取構建 960f5bd6c83134d6dafc746a83d9a981f8170f86。Strategy 遠端仍為 e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。

## 診斷結果

上一輪未歸因的約 16 ms/幀，已定位到迷霧合成後第一個 Canvas save 呼叫附近。不能把取樣堆疊中的 drawWorkshop 當作工坊本身計算昂貴：移動無視覺效果的 save/restore 診斷點，成本會隨之移動。

| 單次 360 步取樣 | save 主要歸屬／取樣時間 | 額外診斷點實測 | renderer ms/幀 |
|---|---|---|---:|
| 原始 CPU 取樣 | drawWorkshop，5835.4 ms | 無 | 29.193 |
| 迷霧合成後插入 save/restore | 診斷包裝器，5980.0 ms | 5951.0 ms／360 次，16.53 ms/幀 | 29.537 |
| 同診斷點移到迷霧合成前 | drawWorkshop，5832.6 ms | 2.3 ms／360 次，0.0064 ms/幀 | 29.339 |

這是延後結算／同步成本的定位證據，不是 Chromium 內部機制已證實的根因。沒有降低總耗時，不能稱為性能修復。更不能因此刪除 save/restore、移動迷霧遮罩順序或刪除工坊圖示來求 PASS。迷霧相關繪圖是後續有價值的優化範圍；需保留完全相同視野、遮蔽和疊圖。

## 驗證與限制

三次皆透過原生 Continue 載入同一快照，每次 render 固定推進原生 update(1/60)，共 6 模擬秒；不是即時自然場次。全數 168 資源 SHA-256 與遊戲內完整性驗證通過、無 pageerror。三次結尾快照皆為 9bef01df573e8fd269db880bb2ddb2af94182c537283d1a1301d2757d99375f8，與上一輪一致。CPU 取樣與計時本身有成本，各一次短測不具性能統計推論效力。

Node 腳本語法：PASS。Chromium 154.0.8037.57、Node v24.19.0、SwiftShader；Windows GPU／長期性能／真人趣味：NOT_TESTED。REPORT 的 initialMatched/finalMatched 是單場自比，不能作前後 PASS；跨場結尾 hash 在 SUMMARY.json 另比。三組原始 CPU.cpuprofile.gz 可解壓後匯入 DevTools；保留原始樣本及快照，不重新完整戰役。畫面參照前輪 browser/after-end.png，本輪未新增畫面或假稱玩家操作改善。

## 所有權與接續

獨立任務 RENDER-SAMPLE-72C9E1B4；agent render-sample-72c9e1b4；execution render-sample-20261128-72c9e1b4；branch codex/riftwatch-render-sample-72c9e1b4。認領 v418，收據 f02757f52a4f37b5b2589ca7cd5702f711349f9e。舊 Fun Lab OWNED 未動，未冒用原身分。釋放結果以最後遠端收據為準。

STOP_REASON：AGENT_EARLY_STOP。本輪封存已完整的定位證據，仍有合法優化待辦，不聲稱額度或環境阻塞。
EXECUTION_DURATION：UNKNOWN（未保存完整回合起始時間）。
CHECKPOINT_SHA：前置已核實來源 9f12bc502aed3dde4ada28aca2c3a5729621e2d4；本輪最後提交由遠端收據核實，避免遞迴刷新。
NEXT_AUTHORIZED_TASK：評估保持像素及遮蔽完全一致的迷霧合成方案，先做小型隔離原型與逐像素對照，再決定是否整合。
AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。沒有修改排程、Feed Owner 或公開版本。
