# 三名玩家相同操作說明

這是同一最新完整遊戲的全新自然場次，不載入既有存檔。使用公開HUD、控制清單、截圖及原生滑鼠鍵盤，依你的角色自然決策；沒有勝利要求，不需把每個功能點一遍。可暫停、存檔、自然提前開波；不可程式改狀態、跳波或看private/GDD/遊戲程式/其他玩家。

工具：python3 /workspace/riftwatch-fun-lab-v2-8e41d6b2/worktree/tools/qa/player_lab_client.py /workspace/riftwatch-fun-lab-v2-8e41d6b2/lab ROLE OP 'JSON'。ROLE換自己的A/B/C。observe回公開文字、controls與截圖路徑；用view_image看截圖。click可用{"selector":"@公開控制id"}或{"x":720,"y":450,"button":"right","count":1}；hover同理。select {selector,value}、fill {selector,value}、check {selector,value:boolean}；key {key:"Tab"}或"Space"、"Escape"、"Control+1"、"Alt+1"；hold {key:"w",ms:1500}會持續按住，最大3000ms，不是單次key。drag {x1,y1,x2,y2}左鍵框選；scroll {dx,dy,x,y}；wait {ms}最大20000；finish結束。控制id會隨畫面更新，過期重新observe，不能猜private selector。

選兵：左鍵點單位，左鍵拖框選多個；右鍵下令移動／攻擊可見敵人。HUD選取數與可見目標可用來確認；送出輸入不等命令被接受，不等抵達、造成傷害或擊殺。戰術HUD按鈕及Shift+A攻擊移動／G護衛／P巡邏需選兵後再點落點或己方保護對象；Escape取消落點模式。Ctrl+1～9設定編隊，Alt+1～9呼叫。混合軍民選取可能只有適用單位接受軍令，讀公開提示。

Tab切換英雄直控；WASD／方向鍵需hold持續移動，短key可能無明顯位移；非直控時方向鍵／WASD捲鏡頭。Q標記、E護盾，冷卻需看HUD。Space暫停／繼續，Escape可取消或暫停，點HUD原生按鈕可建造、訓練、調採集比例、自動經濟軍務、科技與時代。成本、預留與成功訊息均以實際可見HUD為準，不假設點擊就完成。鏡頭與選取不相同，先看HUD確認。可用原生存檔保留問題現場。

最低輸入間隔A2.5／B5／C10秒由控制器限制，代表代理假設非真人統計。自然場次最長1200實際秒，180秒無請求會結束，45秒無請求安全暫停存檔；都是測試框架介入，不能算玩家決策。定期observe避免閒置安全介入；不得為追求好看結果覆蓋失敗。沒有共享即時觀看工具，保存原始瀏覽器錄影並非直播。

結束先finish，等控制器影片寫入後才報告。寫REPORT.md及REPORT.json：時間／波次／勝敗／有效決策／看到但不理解／理解但無效／困惑／樂趣與最想再玩理由／前3問題。逐項描述食物不足、採集比例、生產等待、成本預留缺口、自動建造升時代、軍事生產防禦；未遇到明記未觀測。針對遇襲嘗試記「傷害發現→來源辨識→正確選敵→發令→抵達或射程→傷害或擊殺或解除威脅→城心減傷→失敗理解」，每環節分INTENT/COMMAND_SENT/COMMAND_ACCEPTED/EXECUTED/EFFECT_OBSERVED；公開畫面不能證實就記UNKNOWN，不將命令發送算成功，不把工具說明缺漏當玩家能力錯誤。只對自己的公開證據下結論。

I選閒置村民；數字1～6對應目前選取的命令格；M切靜音。滑鼠滾輪縮放，可用中鍵／右鍵拖曳的遊戲鏡頭行為請以公開HUD提示為準。
