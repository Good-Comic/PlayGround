# 鍵盤切換防重複與暫停選單原生操作

本輪修復兩項實際操作缺陷：

1. 按住Space、Tab、Escape時，自動重複的keydown會反覆暫停／恢復或開關英雄直控。現在戰場切換只接受第一次按下，放開再按仍正常切換。
2. 暫停選單的原生控制元件聚焦時，Space原先被全域暫停鍵搶走，按儲存反而恢復、核取方塊無法正常切換。現在Space交回原生按鈕／輸入，暫停時Tab（含自動重複）也保留焦點巡覽。

WASD／方向鍵持續輸入、keyup清除與blur清除不變。沒有增加熱鍵或計時器，沒有改傷害、移動速度、RNG、AI、Save格式或遊戲數值。

## 安全來源與所有權

任務KEY-REPEAT-0E9F7A31，分支codex/riftwatch-key-repeat-0e9f7a31，執行身分codex-key-repeat-0e9f7a31-20261118。認領Ownership336，收據288aa920e48ba2350585718c1c2654065bbede8b。從最新已保存4578310e3926ec742d63f3b5d9533212d7e41a25繼承，保留陣亡讓行、視覺RNG存檔、射程外選取等有效成果。

最終正式構建來源03876742a6f76bd857e6f31fec1355371b3c8a43；早期4b22fb5僅防重複，3f22083再修原生Space控制，最終補保留暫停Tab巡覽。各階段報告有各自source，不能混稱全部都在最終版本執行。

Strategy遠端仍為e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，使用者較新GAME FIRST／Token效率修訂優先。原Fun Lab等OWNED任務未接管；沒有修改Feed、RC、main、Pages或公開版本。

## 實際行為範圍

防重複位於既有選單／對話框／結算判斷之後，不攔截設定輸入與結算畫面的原生控制。Tab只在未暫停戰場抑制重複；暫停選單仍能按住Tab逐一巡覽控制。暫停時Space聚焦原生button/input/select/textarea/contenteditable時不下全域恢復命令，讓原生控制處理。

第一個Space仍切換暫停，第一個Tab仍切換英雄控制，第一個Escape仍依既有規則取消下令／關閉介面／切換暫停。不是禁止所有repeat事件，WASD仍持續有效。

## Node

Node直接擷取正式main.js中實際註冊的keydown／keyup／blur與movementKeys，僅以小型DOM／Game介面記錄器驅動，沒有另寫一套切換演算法。修正前8項3 PASS／5 FAIL；修正後擴充暫停原生Space與Tab情境，最終10／10 PASS。

相關真實Game API回歸15／15：hero-direct-command 4、battle-actions 9、control-group-ui 2。沒有無差別重跑自然戰役、全量Node或大軍性能。

初始before.tap／after.tap各8 FAIL是測試記錄器漏傳document，均為ReferenceError；補上querySelector介面後才得到有效before-final／after-final。原始錯誤保留，不冒稱8個遊戲缺陷。後續after-controls為9項、after-final-controls為最終10項，依原始檔案區分。

## 真實Chromium

Chromium154、1440×900、繁中、FRK，最終對照固定輸入種子KEYREPEAT-0E9F7A（數值3726995426）。用Playwright原生keyboard.down/down/up取得真正isTrusted=true、repeat=true的事件，沒有用合成dispatchEvent假冒實際輸入。

|操作|原版結果|最終新版結果|
|---|---|---|
|Space首次／重複|暫停true→false，意外恢復|true→true，保持暫停|
|Escape恢復／重複|false→true，再次暫停|false→false，保持恢復|
|Tab首次／重複|英雄true→false，切回|true→true，保持直控|
|W按下／重複|持續移動|持續移動|
|W放開|位置停止|位置停止|
|暫停聚焦Save後Space|恢復且未儲存|保持暫停且正式localStorage存檔成功|
|暫停核取村務總管後Space|恢復、核取不變|保持暫停，核取與game.autoEconomy同步改變|
|暫停按住Tab|原生焦點巡覽|同樣巡覽，auto-mil→btn-stewards|

兩版首按均正常；新版各修正與持續移動／放鍵條件皆通過，零頁面錯誤。before列的correctToggleOutcome只是「成功重現原錯誤」，不能解讀成原版防重複功能PASS。

英雄移動測試用現有地圖上檢查過的空地放置英雄，以隔離建築／單位碰撞；實際移動仍由原生W與正式updateHeroDirect執行，不改速度。這是受控操作測試，不是自然戰役或戰術成功。Save及核取均走正式HTML控制與實際回呼。檢查暫停聚焦控制的Space時，不以程式直接呼叫儲存或修改經濟開關。

首輪browser未固定種子，後續browser-final補種子，browser-controls補Space原生控制，最終browser-complete覆蓋完整來源。只以最終兩列作整合結論，不累加階段測試數。前後Space與暫停控制截圖已人工查看。

## 正式構建與限制

官方build_playtest.py構建168個資源，SHA-256全數符合；相對前正式構建只有js/main.js執行資源改變。未增加資源、UI文案或每幀渲染工作。

四語完整操作、實體Windows鍵盤的OS重複速率、100／200交戰FPS、完整自然十波、NG+新場次與長期穩定性：本輪NOT_TESTED。Chromium可信任事件驗證的是瀏覽器repeat語義，不等於實體硬體認證。不宣稱改善FPS或證明真人趣味提升。

C-36活體友軍阻擋與終點反覆切換仍未解決；本輪獨立修正影響即時控制的真實鍵盤缺陷，沒有再套用已否決的交通方案。下一項接續仍以既有混兵接觸資料作最小因果診斷，不重跑三角色完整戰役。

沒有公開部署、Release、OmGitHub／Issue、Workflow或受保護分支修改。排程改綁與本對話自動續跑仍未驗證，沒有替代輪詢。QUOTA_PERCENT_UNKNOWN。
