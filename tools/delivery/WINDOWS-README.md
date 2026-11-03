# Windows內部试玩／Windows internal playtest

繁體中文：登入具有此GitHub儲存庫讀取權限的帳號，從Actions Artifact下載外層ZIP並完整解壓縮。資料夾內的riftwatch-internal-playtest-final.zip是原始遊戲包，不要以外層Artifact ZIP的雜湊比對遊戲包。安裝Python3（python.org，需py或python命令），再雙擊START-WINDOWS.cmd。啟動器會驗證遊戲ZIP與128個資源、在新子資料夾解壓縮、只於127.0.0.1:8765啟動HTTP並開啟預設瀏覽器。關閉時Ctrl+C；勿以file://直接開index.html，ES modules／資源驗證需要HTTP。若埠已被使用，關閉其他试玩服務，或用py -3 serve_windows.py --port 8766。既有資料夾若被改動會拒絕覆蓋，請將整份交付包解壓縮到新的空資料夾。

English: Sign into an account with repository read access, download the Actions artifact outerZIP and extract it completely. The enclosedriftwatch-internal-playtest-final.zip is the original game archive; do not compare the outer artifact hash with the game archive hash. InstallPython3 frompython.org withpy orpython available, then double-clickSTART-WINDOWS.cmd. The launcher verifies the ZIP and128resources, extracts into a fresh child folder, serves only127.0.0.1:8765 and opens the default browser. Stop withCtrl+C. Do not openindex.html viafile://; modules/resource verification requireHTTP. If the port is busy, close the other test server or runpy -3 serve_windows.py --port 8766. Changed existing files are never overwritten; extract delivery into a new empty folder.

遊戲來源／Game source: 563f107dc77bc88d2a267cc180b0aac50ed72c8a

遊戲ZIP SHA-256／Game ZIP SHA-256:
ba0e9000b4aae8c67d80f434d38ee53d3d9261057f18ec548925c8f134fcf26a

繁體中文：限定內部试玩，非完整十波／實體GPU／正式發布驗收。Artifact需登入，儲存庫讀取權限與GitHub保留政策適用。此腳本沒有修改防火牆、管理員安裝或公開部署。啟動器已在Linux驗證Python服務與雜湊路徑；Windows實機執行仍待使用者驗證。

English: Limited internal playtest, not full ten-wave/physical-GPU/public-release certification. Artifact download needs sign-in and repository read access, subject to GitHub retention. No firewall changes, admin installation or public hosting. The Python serving/hash path is tested onLinux; actualWindows execution remains to verify.
