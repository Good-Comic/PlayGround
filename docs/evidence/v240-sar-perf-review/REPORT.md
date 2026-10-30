# SAR 100 盾衛定向性能復驗 / SAR100-guard focused performance review

來源／Source `255f32dee9b0eb07815e2fd7c1d29837eb3407a4`. Result **INCONCLUSIVE**; S3/Low retained.

繁體中文：獨立 QA 對9561ffc版本的 CONDITIONAL PASS，以及兩次相對 p50 FAIL（約0.5→0.6、0.5→0.7ms）依使用者回饋保留；目前未取得該 Agent 原始日誌，不能將使用者摘要冒充本次原始測量。最新版已有0333583裁格快取矩形熱路徑改善，SAR盾衛仍使用完整192格快取，無離線裁格資料。未改遊戲、美術或原始20%門檻。

English: Retain independent QA's CONDITIONAL PASS at9561ffc and two relative-p50 failures (about0.5→0.6/0.7ms) from user feedback. That agent's raw logs were not retrieved, so its summary is not represented as this run's raw measurement. Latest code includes cached crop-rectangle optimization0333583; SAR guards still use full192px cached cells without offline crops. No game/art/original20% gate changes.

繁體中文：原生Start後受控生成100盾衛，靜態相機1440×900、zoom1.4，配對比較既有普通盾衛圖集。單次計時六組與10次繪製批次六組，各80樣本、20次暖機，順序交錯；批次資料不能取代原門檻結果。所有絕對平均33.3ms／p95 50ms門檻通過，原始樣本另存。最小正計時差約0.1ms。單次一組+66.7%（+0.6ms）FAIL，非機器epsilon或僅一計時量子；前段暖機／執行順序／系統負載可能影響，沒有足夠證據歸因。其餘單次及所有批次通過，批次差約−0.03～+0.05ms，未證明穩定且玩家可感知的退步。保留 FAIL，總結 INCONCLUSIVE，不再無目的重試求綠燈。

English: Native Start precedes a controlled100-guard static scene at1440×900/zoom1.4, paired against the existing generic guard atlas. Six single-draw and six ten-draw-batch pairs use80 samples and20 warmups per mode with alternating order. Batched results do not replace original gates. All absolute mean33.3ms/p95 50ms budgets pass; raw samples remain. Minimum positive timer delta is about0.1ms. One single-draw pair fails at+66.7% (+0.6ms), not machine epsilon or merely one timer quantum. Warmup/order/system-load effects are possible but unproven. Other single pairs and all batched pairs pass, with batched deltas about−0.03 to+0.05ms, insufficient to establish stable player-visible regression. Retain FAIL and classify INCONCLUSIVE without repeated retries chasing green.

| Draws/sample | Pair | First | Baseline p50 ms | SAR p50 ms | Delta ms | Relative | Original gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | baseline | 1.4000 | 1.5000 | +0.1000 | +7.14% | PASS |
| 1 | 1 | atlas | 0.9000 | 1.5000 | +0.6000 | +66.67% | FAIL |
| 1 | 2 | baseline | 0.7000 | 0.7000 | +0.0000 | +0.00% | PASS |
| 1 | 3 | atlas | 0.8000 | 0.8000 | +0.0000 | +0.00% | PASS |
| 1 | 4 | baseline | 0.8000 | 0.8000 | +0.0000 | +0.00% | PASS |
| 1 | 5 | atlas | 0.8000 | 0.8000 | +0.0000 | +0.00% | PASS |
| 10 | 0 | baseline | 0.7500 | 0.7900 | +0.0400 | +5.33% | PASS |
| 10 | 1 | atlas | 0.7700 | 0.7800 | +0.0100 | +1.30% | PASS |
| 10 | 2 | baseline | 0.7500 | 0.7900 | +0.0400 | +5.33% | PASS |
| 10 | 3 | atlas | 0.8100 | 0.7800 | -0.0300 | -3.70% | PASS |
| 10 | 4 | baseline | 0.7900 | 0.8200 | +0.0300 | +3.80% | PASS |
| 10 | 5 | atlas | 0.7400 | 0.7900 | +0.0500 | +6.76% | PASS |

繁體中文：這是軟體Chromium的renderer-only JS計時，不是完整FPS、GPU、硬體或自然混戰驗收。未公開發布；後續在不同執行階段或Candidate整合節點再追蹤，不阻塞PER英雄。

English: Software Chromium renderer-only JS timing is not whole-game FPS/GPU/hardware/natural-battle acceptance. No public release; revisit at a different execution stage/Candidate integration point without blocking PER hero work.
