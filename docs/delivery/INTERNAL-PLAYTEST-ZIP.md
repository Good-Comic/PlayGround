# 內部试玩下載恢復／Internal playtest download recovery

[下載入口／Download artifact](https://github.com/Good-Comic/PlayGround/actions/runs/41577245084/artifacts/13204960060)

[工作流證據／Workflow evidence](https://github.com/Good-Comic/PlayGround/actions/runs/41577245084)

繁體中文：原始ZIP仍存在，正式官方build_playtest.py固定來源重建並按原ZIP封裝資訊重現後，與原檔逐位元相同；沒有重新編寫遊戲或把PixelFX原型混入內部RC。下載的GitHub外層ZIP內含原遊戲ZIP與Windows啟動器。原遊戲ZIP為22797219bytes，外層Artifact為22802923bytes；兩者不是同一檔案，不要混用雜湊。

English: The original ZIP exists. The official pinnedbuild_playtest.py reconstruction, repackaged with original ZIP metadata, reproduces identical bytes. No game rewrite or PixelFX import into internalRC. The downloaded outerGitHubZIP contains the original gameZIP and Windows launcher. Inner gameZIP is22797219bytes; outerArtifact is22802923bytes. They are different files/hashes.

- 遊戲來源／Game source: `563f107dc77bc88d2a267cc180b0aac50ed72c8a`
- 驗收報告／Acceptance report: `c55a054291a088a66ac809e5a243e3773527daa9`
- 遊戲ZIP／Game ZIP: `riftwatch-internal-playtest-final.zip`
- ZIP SHA-256: `ba0e9000b4aae8c67d80f434d38ee53d3d9261057f18ec548925c8f134fcf26a`
- 資源／Resources: 128/128 SHA-256 MATCH, ZIP CRC PASS.
- 保留／Retention: 30days; expires2026-12-03 12:19:18 Asia/Taipei (2026-12-03T04:19:18Z).

繁體中文：需登入GitHub且具有儲存庫讀取權限。此儲存庫為公開，Artifact並非私人白名單交付；它是有保留期限的Actions產物，不是公開Release或網站部署。到期／刪除後此下載入口將失效。既有工作流只有OpenCode與Pages，均未觸發或修改；新增的獨立交付工作流僅在交付分支指定路徑變更時啟動，contents:read，官方Actions固定SHA，沒有Pages／Release／部署步驟。

English: Sign intoGitHub with repository read access. Repository is public, so this is not a private-whitelist transfer; it is a retention-limitedActions artifact, not a release/site deployment. The link expires if retained content expires/is deleted. ExistingOpenCode/Pages workflows were neither triggered nor changed. New isolated delivery workflow triggers only on specified delivery-branch path changes, hascontents:read, pins officialActionsSHAs and has noPages/Release/deployment step.

繁體中文：已完成實際下載可用性驗證：GitHub Runner執行官方download-artifact後再次驗證原ZIP SHA256、大小、CRC、固定來源與128資源，兩個步驟成功。此Cloud會話直接從Artifact儲存服務下載時遭網路政策403拒絕，因此沒有把它記為本會話下載成功，也未代登入使用者的Windows瀏覽器。真實下載／回讀成功證據保存在internal-zip-receipt.json與工作流中。

English: Actual download was verified: GitHubRunner used officialdownload-artifact, then checked originalZIP SHA256/size/CRC/source/all128 resources; both steps succeeded. ThisCloud executor’s direct artifact-storage request was denied by network policy403, so executor download success is not claimed. User’sWindows browser login was not impersonated/tested. Evidence is ininternal-zip-receipt.json and the run.

繁體中文：Windows操作：下載外層ZIP並完整解壓縮，安裝Python3後雙擊START-WINDOWS.cmd。啟動器會驗證原ZIP／128資源，在新子資料夾解壓縮，只於127.0.0.1:8765提供HTTP並開啟瀏覽器，Ctrl+C停止。不要直接file://開index.html。端口占用可用py -3 serve_windows.py --port 8766。已驗證Linux上的Python啟動／雜湊／解壓縮／HTTP回應，Windows實機CMD仍NOT_TESTED。具體說明附在Artifact的WINDOWS-README.md。

English: Windows: download/extract the outerZIP completely, installPython3 and double-clickSTART-WINDOWS.cmd. Launcher verifies originalZIP/128resources, extracts a fresh child folder, serves only127.0.0.1:8765 and opens a browser;Ctrl+C stops it. Do not usefile:// forindex.html. For a busy port usepy -3 serve_windows.py --port 8766. Python startup/hash/extraction/HTTP response was tested onLinux; actualWindowsCMD remainsNOT_TESTED. SeeWINDOWS-README.md inside artifact.

繁體中文：獨立交付任務INTERNAL-ZIP-DELIVERY-518BE895、Execution codex-zip-delivery-518be895-a、ownership234，先dry run再版本條件正常推送。分支codex/riftwatch-zip-delivery-518be895，只新增交付工具／工作流／紀錄，對RC遊戲js/assets/index/styles差異為空。沒有修改main、RC分支、Pages、OmGitHub或不可變Build，沒有建立公開Release。原ZIP未加入Git歷史，避免增加22MB二進位負擔。STOP_REASON=AUTHORIZED_DOWNLOAD_DELIVERY_RECOVERY_COMPLETE；下一步使用者實際下載與Windows试玩。

English: Independent taskINTERNAL-ZIP-DELIVERY-518BE895, executioncodex-zip-delivery-518be895-a, ownership234, acquired through dry run/version-conditional normal push. Branchcodex/riftwatch-zip-delivery-518be895 adds only delivery tooling/workflow/records, with emptyRC gamejs/assets/index/styles diff. No main/RC branch/Pages/OmGitHub/immutable build changes or publicRelease. OriginalZIP was not added toGit history, avoiding22MB binary growth. STOP_REASON=AUTHORIZED_DOWNLOAD_DELIVERY_RECOVERY_COMPLETE; next is user download/Windows playtest.
