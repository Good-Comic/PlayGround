# 實際側移方向候選：WIP，禁止直接整合

Task CROWD-HEADING-6C1F4A92；Agent codex-crowd-heading-6c1f4a92；Execution codex-crowd-heading-6c1f4a92-20261108。獨立分支codex/riftwatch-crowd-heading-6c1f4a92，Ownership306認領收據4d9e06c7e57641b88a25031cc3acee34742a79c3。未接管Fun Lab V2。

已驗證父系checkpoint：689b28c4921a71056f5cda6fa6698e8ba9048a81；其遊戲來源89360c81b8f821c4b03908a2043adf4302c0d847。本輪候選來源10a247325768ca4a7f5d70c0dba07eba0cf98d13明確標示WIP，不能取代已驗證父系、RC或公開版。

## 五項實質任務

1. 追蹤側移避碰與交通方向：原生steer可能拒絕直行、接受側移，但stepToward仍保留原本直走heading。這不是上輪已修正的過期方向或互相遠離誤讓行。
2. 建立最小與反例：正常生成、無重疊的兩名民兵，實際stepToward產生側移；第三名友軍隨後迎面而來。修復前側移方向及第三人讓行案例FAIL，直線反例PASS。初版夾具因間距不足被原生spawn挪位，已保留失敗後更正為實際可生成且不重疊的間距，沒有修改兵種半徑。
3. 候選實作：成功移動後，以實際位移正規化更新heading；不改傷害、射程、冷卻、碰撞、搜尋預算或計時。曾試驗另外存motionHeading只供迎面判斷，仍有相同密集反例，該替代未採用，patch與JSON保留。
4. 定向與密集回歸：104／104 Node PASS；8組20模擬秒矩陣中7組命中名單／次數不變，10人混編spacing0.7由8人命中變7人，失敗紀錄相同。不能只憑Node全綠宣稱候選通過。
5. 正式構建與Chromium：使用build_playtest.py從完整WIP來源產生168資源，啟動前逐項SHA-256核對PASS。Chromium154／SwiftShader，1440×900，原生滑鼠選兵及右鍵移動，實際RAF側移後前版heading仍接近(1,0)，實際位移方向誤差約0.686；候選方向誤差0。已保存並檢視實際遊戲截圖。觀察約1秒，不是自然戰役、性能或長期驗收，沒有錄影。

## 額外交叉診斷：命令到傷害

為避免把所有傷害混為玩家集火效果，另記錄每一筆傷害的source、時間、manualAttack、source.target及實際HP差。8組手動集火傷害事件逐項完全一致；最後一組的差異是命令已因congested取消後，自動接敵由2次命中減為1次。comparison.json明列兩種結果，不能隱藏自動戰鬥差異。此資訊縮小因果，但候選仍未通過整體負向門檻，保持WIP，不准直接整合。

manual-before.json的交通配對計數因測試器包裝了另一個模組實例而無效，其傷害記錄仍有效；已修正為從實際Game模組所在路徑載入Crowd，重跑基底保存manual-before-corrected.json。不要用舊檔的ties=0判斷遊戲沒有交通衝突。

Chromium首輪在暫停時嘗試選兵，被正式規則拒絕；保留browser失敗，修正為先恢復再原生點選。browser-corrected才是有效前後驗證。沒有繞過完整性檢查或用evaluate冒充正式命令。

## 限制與保存

密集部隊互卡及原C-36完整因果仍未解決。沒有調整平衡來取得通過。四語、Save／Load、NG+、100／200單位性能、自然十波及實體GPU本輪未重跑；不擴大上游證據結論。104項PASS不是完整遊戲認證。

大型場景JSON以確定性gzip無損保存，manifest記錄原始／保存SHA，解壓比對通過；本機原始檔未刪除。實驗版本與原始FAIL保留。只推送合法獨立WIP分支，不修改main、Pages、既有RC、OmGitHub、Progress Feed、其他Owner或公開部署。

下一項工作：追查spacing0.7案例中#24在手動命令取消後少一次自動命中的具體讓行路徑；在負向門檻通過之前，不採用候選。若回到已驗證遊戲開發，基於父系689b28c，而不是把本WIP當成最新已驗收版本。

STOP_REASON：完成至少五項實質任務，保存未通過門檻的候選，沒有宣稱修復完成。EXECUTION_DURATION：未量測。NEXT_AUTHORIZED_TASK：上述#24差異定位。CHECKPOINT_SHA：以遠端收據為準。AUTO_RESUME_AVAILABLE：未驗證、無正式傳訊工具。QUOTA_PERCENT_UNKNOWN。排程轉送來源尚未更新／未驗證，不宣稱v2.1已改綁。
