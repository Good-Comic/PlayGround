# 候選審核與限制／Candidate audit and limitations

繁體中文：狀態BLOCKED。Chromium受控重現沙暴暫停錯誤：模擬時間0.1499不變，現實21秒後sandstorm由20歸零。這不是自然事件流程PASS。靜態呼叫鏈僅見executeSandstorm設定及setTimeout清除，未找到效果讀取點；視野整合仍為INSUFFICIENT_EVIDENCE。未修改平衡或遊戲程式。完整瀏覽器環境、選卡存檔、結算、NG+與長時間壓力矩陣仍未完成，不宣稱全面驗收。

English: Status BLOCKED. Controlled Chromium reproduction confirms the pause defect: simulation time remains0.1499 while sandstorm clears from20 to0 after21 wall seconds. This is not natural-event acceptance. Static call-chain search found executeSandstorm writes and setTimeout clearing but no effect readers; vision integration remains INSUFFICIENT_EVIDENCE. No balance or gameplay source changed. Environment, boon/save, settlement, NG+ and sustained-load browser matrix remains incomplete; comprehensive acceptance is not claimed.

繁體中文：15分支已記錄完整HEAD、共同祖先（hosting分支無共同祖先）、實際變更檔案及唯一提交。14分支無遊戲程式／資產差異，保留INSUFFICIENT_EVIDENCE：不將獨立協作、歷史FAIL或研究工具冒稱已被取代，也不推定缺少遊戲功能。hosting分支為EXPERIMENTAL_NOT_APPROVED（僅表示本輪未授權整合／發布，不否定歷史授權）。未找到可據此直接合併的UNMERGED_VALID_WORK；歷史工具與測試的逐檔等效審核仍待完成。

English: All15 entries record exact HEAD, merge base (none for hosting), changed paths and unique commits. Fourteen have no gameplay-source/asset delta and retain INSUFFICIENT_EVIDENCE: independent coordination, historical failures and research tools are not declared superseded or missing gameplay. Hosting is EXPERIMENTAL_NOT_APPROVED for this integration/publication scope, without denying historical authorization. No directly mergeable UNMERGED_VALID_WORK was established; historical tool/test file equivalence remains pending.

繁體中文：沿用同遊戲來源的Node413+35 PASS、Chromium原生16文明66 PASS及受控Boss8 PASS，保留自然90秒INCOMPLETE與全部歷史FAIL。候選構建來源仍為770595a9495f13bb77daef203cb69509291b157f，127資源雜湊相符；本輪只新增證據，未重新標示新遊戲Build。容量有效包約2.24GiB，暫存約3.26GiB，均未清理。進程只見殭屍Git，未見有效fetch/index-pack；清理仍需保留恢復依賴確認。內部測試可使用既有本地build，注意沙暴、決定性、低FPS與自然十波風險；禁止公開部署。

English: Reuse same-game-source Node413+35 PASS, native all16 Chromium66 PASS and controlled Boss8 PASS, preserving natural90-second INCOMPLETE and all historical failures. Build source remains770595a9495f13bb77daef203cb69509291b157f with127 matching resource hashes; evidence-only changes do not relabel the game build. Valid packs remain about2.24GiB and temporary packs3.26GiB; neither was cleaned. Only zombie Git processes were observed, no active fetch/index-pack; cleanup still requires recovery-dependency confirmation. Existing local build is available for limited testing with sandstorm, determinism, low-FPS and natural-ten-wave risks. Public deployment remains prohibited.
