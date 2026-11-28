# 迷霧 ImageBitmap 候選驗證與交接

結論：REJECTED_NOT_INTEGRATED。候選的畫面及短測模擬一致，但效能沒有改善，因此未改 js/renderer.js、遊戲資源、規則或任何公開版本。候選僅存於 tools/qa/fog-bitmap-64d7a2e9/candidate.txt，透過瀏覽器執行時替換方法測試，不是正式構建。

## 來源與授權

承接 e8879d61ae201ca7d61c04270ba7592f12c53e14 的已核實交接；最新遠端 Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d 未變。基礎正式本地構建為 960f5bd6c83134d6dafc746a83d9a981f8170f86。原生玩家 B 第四波快照沿用前輪 source-save.json.gz，SHA-256 afc0f23e61ef34ff1b8bab09cb18bc67280df0e5c96a8b7e2ad623b3f67c7262。

候選使用 OffscreenCanvas 繪製相同迷霧形狀，再 transferToImageBitmap；形狀未變時重用 bitmap，更新時關閉前張。沒有改視野、圓形裁剪、遮罩順序、RNG 或遊戲數值。這是隔離原型，不包含正式相容性／例外回退／所有 resize 生命週期，禁止直接視為可發布程式。

## 驗證矩陣

| 項目 | 結果 | 限制 |
|---|---|---|
| 48 組迷霧合成逐像素 | PASS | 100/200 視野來源、三縮放、相機移動及重複快取、DPR1/2 的隔離 Canvas；非整個遊戲畫布認證 |
| Bitmap 釋放 | PASS | 建立 36、關閉 36；只限該隔離測試 |
| 原生 Continue 短續玩 | PASS | 六場各 360 個原生 update(1/60)，不是即時自然戰役 |
| 結尾序列化 snapshot／RNG | PASS | 六場皆 9bef01df573e8fd269db880bb2ddb2af94182c537283d1a1301d2757d99375f8；不涵蓋全部瞬時導航狀態 |
| 效能改善門檻 | FAIL | 單獨重測仍未觀察到收益，因此不整合 |
| Node | PASS | 新腳本語法檢查；無遊戲程式修改，不冒稱完整 Node 遊戲回歸 |
| Windows GPU、長期記憶體、完整自然戰役 | NOT_TESTED | 本輪僅雲端 SwiftShader |

正式基礎資源每場 168 檔 SHA-256 與遊戲內完整性驗證通過；它只驗證基礎資源，候選執行時替換由 candidate.txt 的獨立 hash 追溯。各場無 pageerror。瀏覽器 REPORT.pass 是一致性窄門檻，不是效能 PASS。

## 性能結果與原始失敗

| 組別 | 場次 | FPS | 幀 P50/P95 ms | renderer ms/幀 |
|---|---|---:|---:|---:|
| 首次 ABBA | 原版 A1 | 29.26 | 32.8 / 44.6 | 26.810 |
| 首次 ABBA | 候選 B1 | 27.87 | 34.5 / 45.2 | 28.897 |
| 首次 ABBA | 候選 B2 | 25.27 | 35.9 / 64.2 | 31.471 |
| 首次 ABBA | 原版 A2 | 30.95 | 31.3 / 43.1 | 25.546 |
| 單獨序列重測 | 原版 A1 | 29.32 | 32.3 / 48.4 | 26.458 |
| 單獨序列重測 | 候選 B1 | 27.85 | 34.6 / 47.2 | 28.770 |

首次 ABBA 與像素腳本短暫重疊，不能作乾淨的性能比較；保存原始結果後，才執行無其他本輪測試同跑的序列重測。各場 Continue 後等待 450ms，B1 測前額外截圖，暖機時間未校準；這些短測不足量化普遍退步幅度，但均無改善證據，足以拒絕整合，不能宣稱正式硬體效能認證。

Node v24.19.0；Chromium 154.0.8037.57；SwiftShader。prototype/after-end.png 已人工檢視為實際戰場；截圖是執行時候選，不是已發布版本。原始快照、REPORT、候選程式和重測全數保留。

## Ownership 與下一步

任務 FOG-BITMAP-64D7A2E9；agent fog-bitmap-64d7a2e9；execution fog-bitmap-20261128-64d7a2e9；branch codex/riftwatch-fog-bitmap-64d7a2e9。認領 v420，遠端收據 52b55f25591d8907662c253dbe1e9f7ec798ed70。其他 Owner 與 Fun Lab 均未動；最後釋放狀態由遠端收據核實。

STOP_REASON：AGENT_EARLY_STOP。本輪封存已否決方案，仍有合法遊戲開發待辦，未宣稱環境或額度阻塞。
EXECUTION_DURATION：UNKNOWN（缺少完整回合起始計時）。
CHECKPOINT_SHA：前置安全來源 e8879d61ae201ca7d61c04270ba7592f12c53e14；本輪最後提交由遠端核實，不遞迴刷新本檔。
NEXT_AUTHORIZED_TASK：回到既有玩家證據中命令已接受但未有效接敵的問題，選擇可重現且不變更傷害／尋路規則的最小操作修正；不再重測本已否決的 ImageBitmap 方案。
AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。未修改排程、Feed 或公開版本。
