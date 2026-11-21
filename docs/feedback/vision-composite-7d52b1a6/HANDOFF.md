# 迷霧合成裁剪實驗：性能未達門檻，已撤回

任務VISION-COMPOSITE-7D52B1A6，認領Ownership370；執行身分codex-vision-composite-7d52b1a6-20261122。繼承4305c6f562e870c5b4b8e172efca184c366b470c；原Fun Lab及其他Owner未接管。

## 決策與最終遊戲狀態

實驗利用視野橢圓聯集可證明完全透明的矩形，對迷霧主畫布合成加反向裁剪，保留原光柵、視野與RNG。第一版只接受整高橢圓證明，24場景皆未啟用；不能把FPS波動當收益。第二版用16個保守水平條帶的覆蓋交集，有14／24場景啟用，但100單位出現性能退步、200單位無穩定收益，未通過保留門檻。

已正常提交撤回全部runtime與新增測試檔，沒有Force Push。最終js相對原安全版沒有差異；回退提交d51c522090f48ee4c19d3d4285c88e85b9bd36c2的正式構建168項資源逐檔SHA256通過，且全部168雜湊與實驗前正式構建完全一致。沒有把實驗整合RC或公開部署。

## 像素與性能

PASS（有限像素）：每版24組，100／200靜止友軍、三縮放、中央／邊緣鏡頭及沙暴開關，實際Renderer.drawVisibility在主Canvas合成後逐位元組比對零差異；不是只比遮罩canvas。第二版14組確實產生透明裁剪矩形。DPR僅1；實驗已因性能否決，未繼續DPR或動態戰鬥驗證。

FAIL（性能保留門檻）：第二版同一固定場景ABBA，每段暖機1秒＋取樣3秒。

|初始／實際單位數|版本|FPS範圍|幀時間P50|幀時間P95|迷霧呼叫P95|
|---|---|---:|---:|---:|---:|
|100／100|原版A1／A2|31.36–32.78|33.3ms|49.9–50.0ms|1.7ms|
|100／100|實驗B1／B2|27.29–30.81|33.3ms|50.0–66.7ms|2.2–2.5ms|
|200／200|原版A1／A2|18.40–19.83|50.0ms|66.7ms|4.3–11.7ms|
|200／200|實驗B1／B2|19.26–19.47|50.0ms|66.7ms|4.5–6.7ms|

200單位原版A1迷霧P95是離群較慢樣本，A2已降回4.3ms，不能只挑A1宣稱改善。100單位整體FPS與迷霧P95變差，不強行保留。畫面仍包含完整Canvas繪圖，但遊戲暫停／單位靜止，不是代表性戰鬥性能。JS heap每段有GC波動（例如100單位−6.82MB至+5.47MB，200單位−8.62MB至+10.74MB），樣本不足以判定記憶體改善或洩漏。原始幀陣列、heap起訖、瀏覽器與GPU資訊完整保留。

環境：Chromium154.0.8037.57，Linux雲端、CPU配額4核，ANGLE／SwiftShader軟體GPU；主機資訊另存environment.json。不代表Windows實體GPU或長時間表現。未在負面靜態結果後追加昂貴自然戰役或100／200動態戰鬥。

## 回歸與歷史失敗

PASS：初版四個Node檔；條帶版新增helper、既有vision-mask／clip／cache四檔重測通過。初始條帶版使兩個舊cache mock案例因缺少Canvas save／clip介面失敗，保留strips-node.tap；補上不支援Path2D裁剪時的原合成fallback後通過。最終撤回後原有三個vision測試檔通過。helper與測試來源以gzip保留，正式runtime不保留實驗檔。

實驗提交d887f2c2c7697c5d484e3893eefea3c5a35a6193（初版）、f1f220516fe9c05fe5ae4dfcb00b227ff893ce9a（條帶版）皆在本分支歷史，可用正式build_playtest.py重建169資源實驗；最終安全版回到168。tools/qa/vision-composite-7d52b1a6/browser.cjs以COMPOSITE_BUILD指定實驗build，原本的before固定在安全構建。未宣稱最終遊戲獲得FPS提升。

## 接續方向

本方法已否決，不反覆加跑同場景。下一項高價值診斷應以既有CPU／Canvas剖析拆開單位Sprite與實際合成成本，避免把同步JavaScript drawImage時間當作完整GPU工作。若沒有新的可驗證假設，不為Commit數再加功能。

未修改main、Pages、公開版本、RC、舊Issue、其他Owner或原始失敗，未改排程或宣稱背景續作。Feed仍由其他Owner持有。
