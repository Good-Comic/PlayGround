# 內部候選驗證／Internal candidate verification

繁體中文：候選來源為 770595a9495f13bb77daef203cb69509291b157f。資源恢復完成；正式 build_playtest.py 構建位於 /workspace/riftwatch-rc-internal-build，127個檔案雜湊相符。Node 413項及七文明35項通過。Chromium 16文明66項與受控Boss8項通過；截圖已檢視。自然90秒樣本有採集、訓練、首波戰鬥，未完成波次，不能代表十波、結算、NG+或實體GPU通過。歷史低FPS、嚴格SaveLoad決定性、性能FAIL及自然裂界崩潰NOT_REPRODUCED均保留。內部狀態IN_PROGRESS，尚未達READY。

English: Source is 770595a9495f13bb77daef203cb69509291b157f. Resources recovered; formal build_playtest.py output is /workspace/riftwatch-rc-internal-build with 127 matching hashes. Node: 413 standard plus 35 parameterized hero tests passed. Chromium: 66 all-civilization checks and 8 controlled Boss checks passed; screenshots inspected. The natural 90-second sample exercised gathering, training and first-wave combat without completing a wave. It does not certify ten waves, settlement, NG+, or physical GPU. Historical low-FPS, strict SaveLoad determinism and performance failures, and natural Rift crash NOT_REPRODUCED remain. Internal status is IN_PROGRESS, not READY.

繁體中文：已取得完整提交歷史，原基準至成果ahead74/behind0，72個遠端遊戲分支中57個HEAD為祖先。其餘15分支包含證據、部署、協作與舊功能分支；尚須逐補丁核對等效繼承，不合併覆蓋。branch-audit.json保留完整SHA。恢復時先核對遠端ownership231及本Execution。下一步完成非祖先補丁審核與環境／存檔／結算瀏覽器矩陣。

English: Complete commit history was fetched without bulk blobs. Source is ahead74/behind0 against the original baseline; 57 of 72 remote game branch heads are ancestors. The other15 include evidence, deployment, coordination and older feature branches; patch-level equivalence remains to audit before any merge. branch-audit.json preserves exact SHAs. Revalidate remote ownership231 and this execution before writes. Next: nonancestor patch audit and environment/save/settlement browser matrix.

繁體中文：有效pack約2.24GiB；兩個已中止下載暫存pack約3.26GiB，無有效Git進程使用。僅執行prune dry run，未清理，因輸出同時包含其他未引用物件。最大物件主要為歷史證據tar.gz（最大約58MB）。建議後續新錄影／壓縮證據採外部不可變雜湊歸檔或經批准LFS；不改寫舊歷史。使用blob:none＋按需資源及夾具，避免全分支資產下載。公開部署、main、Pages及不可變Build均未修改。

English: Valid packs total about2.24GiB; two aborted temporary packs total about3.26GiB with no live Git users. Only prune dry run ran; no cleanup because it also listed unrelated unreachable objects. Largest blobs are historical evidence tar.gz files (up to58MB). Recommend immutable external hash-addressed archives or approved LFS for future recordings/archives without rewriting old history. Use blob:none plus required resources/fixtures. No public deployment or changes to main, Pages or immutable builds.
