# 測試控制映射修正

本次獨立任務 `FUN-EVIDENCE-051216A4` 修復測試工具的控制身分問題，沒有修改遊戲來源或原 Owner 的控制器。新工具放在 `tools/qa/fun-evidence-051216a4/`；[衍生來源及 SHA-256](control-mapping/GATEWAY-PROVENANCE.json)記錄原始控制器與新版本。

**根因與實際重現**

原 `tools/qa/player_lab_gateway.mjs` 每次 observe 只為目前可見的 DOM 控制項重新編號。捲離可見區的舊元素仍保留相同數字屬性，導致 `@33` 等別名對應到兩個不同元素。act 取第一個匹配項；Playwright 的 `isVisible()` 接受離開可視區但仍有版面的控制，再自動捲動點擊，實際操作可能偏離上一次公開觀察的意圖。

A 原公開紀錄顯示 @33 是輕騎兵費用摘要，點擊後卻打開時代選單。本次從固定 `6852cf85acca5c08923e0191a1e0703189f4d3e6` 擷取原回呼、保持其 bytes 不變，在正式 163 資源構建正常 Continue 後原生暫停，重現同類缺陷：本次數字為 @44，同時匹配費用 SUMMARY 與先前捲離視窗的 `select[name="age"]`，原生點擊確實聚焦到後者。數字會隨當時可見元素改變；本次重現的是同一根因，不假裝逐幀重播了原 A 場景。

**實際修正**

`visible-controls.mjs` 以每份文件的 `crypto.randomUUID()` nonce、遞增序號及 WeakMap 綁定 DOM 身分。捲動與重複 observe 不會把同一別名交給另一元素；重新呈現的新元素與 Reload 後的新文件會取得新身分。舊數字別名及格式不合法的引用明確拒絕，不猜測其他控制項。

測試 nonce 使用瀏覽器 CSPRNG，沒有讀取或消耗遊戲的模擬／視效 RNG。原有公開文字、控制欄位、可視區裁切與明確 id／name selector 介面保留。這項修正保證 opaque 別名的 DOM 身分，不宣稱做了完整遮擋偵測，也不把語意 selector 當成跨重建的元素身分保證。

`stable-player-gateway.mjs` 是固定原始控制器的獨立衍生版，只改 helper import、observe 的 DOM 捕捉，以及 act 的別名解析。原生 Playwright 輸入、角色操作間隔、禁止玩家 evaluate、資源校驗、存檔與 45／180 秒安全保護保持原樣。原檔 SHA-256 為 `c59b1d6ea9100a4746b7c9794ddee8af4996fb40165e5d3a07e1d504e7ef1565`，衍生版為 `63e41bab80367bd39c061d5230d5fbae0e4e9affa6e77416521a5d4b435555f1`。

**驗收與證據**

| 檢查 | 實際結果 |
| --- | --- |
| [受控 Chromium 14 項](control-mapping/result.json) | 14 PASS／0 FAIL，零 page errors |
| 原始數字別名衝突 | 匹配 2 個 DOM，舊解析器實際點到時代選單 |
| 新別名 | 唯一匹配原費用 SUMMARY，原生點擊成功展開明細 |
| 身分生命週期 | 重複 observe 保持身分；新 DOM 與新文件不重用舊身分 |
| 純觀察確定性 | 暫停中完整模擬快照、庫存、時間及兩種遊戲 RNG 相同；排除既有攝影機緩動 |
| [完整衍生控制器選單驗證](gateway-smoke/SMOKE-RESULT.json) | observe → 舊 @33 明確拒絕 → 新 opaque 別名原生打開「玩法說明」→ finish ok |
| [選單範圍收據](gateway-smoke/SCOPE-AND-FINAL.json) | `inMenu=true`、`gameWallSeconds=0`、零 page errors；不是新 A、自然對局或完整戰役 |

[錯點畫面](control-mapping/before-wrong-native-control.png)、[正確明細畫面](control-mapping/after-correct-native-details.png)與[連續操作影片](control-mapping/continuous-validation.webm)可直接核對。初次選單煙霧腳本錯誤假設控制器優先輸出 @selector，實際優先 id／name；[這次腳本 FAIL](gateway-smoke/SMOKE-INITIAL-ASSUMPTION-FAIL.json)保留。更正腳本對公開 key 的使用後完成驗證，沒有修改遊戲或略過資源檢查。

**重現方式與限制**

在本環境安裝的 Playwright／Chromium 可用且固定正式構建與原始 A 快照存在時，執行：

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/riftwatch-playwright-runtime node tools/qa/fun-evidence-051216a4/control-map-browser.mjs /workspace/riftwatch-fun-lab-281169b5/build-production-readback-r3 /tmp/riftwatch-control-map-new /workspace/riftwatch-fun-lab-281169b5/checkpoints/A-before-critical.json
```

輸出目錄必須尚不存在。原始快照 SHA-256 必須是 `1d35c76c1b35c5b4e901019dec95c02426114b582b32a3b91b5d29202f5462e4`；路徑依實際保存位置核對，不以同名檔案代替雜湊。腳本對遊戲內部的快照查核只屬 root 技術驗證，不會提供給玩家角色。

舊的 `act: ok` 只能證明輸入送出；涉及捲動與動態重建的數字別名，需搭配輸入後實際畫面判斷是否達成意圖。原角色封存報告與既有結算證據不改，本次新增工具可靠性限制。新衍生版尚未跑完三角色自然戰役，不能把 14 項或選單驗證當成完整玩家效果證明。
