# 人工集火實際命中與擊破回饋

## 本輪已完成的兩項遊戲改善

1. 前置護衛切片已保存於 codex/riftwatch-guard-leash-7b39d2e1，遠端完整SHA 0cf3b679b62f2ee11c4bf7ffdd42cd59f77cd1d5；正式遊戲來源 efe80f280de2068421a44d2faeb2a0ad0f4c5926。進取姿態護衛的初次索敵及自動換目標沿用既有八格退出邊界，不再重選剛放棄的外側敵人。44項定向Node與四語原生操作通過；合法擊殺後恢復護衛。不是C-36全面解卡或城心減傷證明。Ownership已釋放v423，收據0c4beb24f2d6b66873181122322a22fb7deb3e2b。
2. 本切片在既有軍令摘要短暫加入「最近命中／最近擊破」，將接令和戰果分開。正式遊戲來源 fcfb0bfba5bd7608a8a84bfd297dd0cf1a38c486，包含前述護衛修正。

## 資料與行為

js/focus-effect.js包裝原生applyDamage，只在目前選中的正式戰士、人工指定同一可見敵軍、近戰或投射物實際扣HP後記錄一筆結果。只保留最近一筆，2.5模擬秒到期；換選取、換世界、讀檔、波次改變會清除。暫停不走模擬時間。超量傷害扣到0為止，不將護盾吸收算作HP傷害。確實死亡才顯示擊破。

不把射出箭矢、金圈、命令接受、其他部隊或未見敵軍傷害當成本次選兵戰果。不統計DPS、全軍累計或城心減傷。訊息描述已觀測歷史事件，不追蹤敵人後續隱藏位置。英雄與村民沿用軍令摘要原有排除範圍。

js/command-readback.js在既有100ms摘要刷新附上文字，不加按鈕、面板、每幀Canvas或定時器。js/locales.js增加四語字串。原生傷害只派送一次，回傳值及例外保持原樣；觀察器自身錯誤不阻斷死亡／結算。不改攻擊、索敵、費用、抽卡、存檔格式或兩套RNG。

原先考慮的時代／人口誤報，正式資料不足以重現，未新增假設狀態或變更生產。護衛優先攔截城心攻擊者仍為SPEC_DECISION_REQUIRED，未擅改政策。未重試已否決的繪圖方案。

## 必要驗證與原始FAIL

| 項目 | 結果及範圍 |
|---|---|
| 最終Node | 71項PASS，含新回饋、原軍令摘要、人工目標及城心傷害觀察器；另先前53項回歸含視覺RNG，兩批有重疊不可相加 |
| 新回饋反例 | 命令／彈道未命中、非選兵、自動攻擊、隱藏、友軍、盾吸收、超量傷害、時間到期、換選取／讀檔、四語、原生回傳／例外、快照及RNG |
| 四語Chromium | 原生選兵、右鍵集火；扣14HP才顯示命中；敵35HP於3.65模擬秒死亡後顯示擊破，2.5模擬秒後移除；初始接令不顯示成功 |
| 前後行為 | 繁中同尺寸戰鬥結尾snapshot SHA 523d8310da13c7c4c1098d306791de38d1a58c35bae0644b12d21b9c772bae9f完全相同；其餘語言只比傷害、死亡與RNG，不跨視窗強求相機hash |
| 既有B第四波存檔 | 六模擬秒前後配對：城心2925.485、RNG1535553874／視覺1067484409，完整序列化snapshot皆9bef01df573e8fd269db880bb2ddb2af94182c537283d1a1301d2757d99375f8 |
| 正式構建 | 前168／後169個資源逐檔SHA-256與頁內完整性通過；新增一個JS模組。build-metadata.json SHA-256為01ac54bb98d747361cabfdc7cc5f9398a14defb87657ff5a18e7c02fde5c016e |
| 畫面 | browser/hit.png、kill.png已檢視；實際受控遊戲與原生HUD，不是獨立HTML原型 |

Node初次FAIL是假設輸入5就扣5，正式護甲實際只扣1；改為驗證原生HP前後差，不改傷害求PASS。node.tap原始FAIL保留。新功能不宣稱原版有此回饋，只比較新增前後的原生戰鬥不變。

全部Chromium零頁面錯誤；Node v24.19.0、Chromium154.0.8037.57、SwiftShader。受控戰鬥以完整Game.update固定60Hz推進，既有B來源是自然場次觀察器快照經原生Continue，不冒稱玩家親自按Save或全新自然場次。B1量測前額外截圖，暖機不同；該報告的FPS不作性能比較。

NOT_TESTED：完整自然十波、真人趣味／再玩率、Windows實體GPU、長期記憶體、完整100／200交戰FPS及NG+。第一切片僅有100／200資料的索敵CPU微基準，不當整體性能PASS。本輪沒有重跑三角色戰役，沒有新增影片。

## Git／Ownership／Recovery

安全父系0cf3b679b62f2ee11c4bf7ffdd42cd59f77cd1d5；最新有效Strategy遠端e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。Task FOCUS-EFFECT-6D31A8B2；agent focus-effect-6d31a8b2；execution focus-effect-20261129-6d31a8b2；branch codex/riftwatch-focus-effect-6d31a8b2。認領v424，收據81741dfcb309d4c1d448d729eb3930cf177e1549；最後釋放與遠端SHA以外部收據核實。原Fun Lab、護衛政策、Progress Feed及其他Owner未接管／覆寫。

未修改main、Pages、RC、公開部署、受保護Issue、OpenCode或排程。本輪最新分支完整繼承兩項改善；文件是提交前快照，不遞迴更新自己的SHA。

STOP_REASON：AGENT_EARLY_STOP；本輪完成兩項實際遊戲改善及必要回歸後交付，仍有合法待辦，不虛構額度／環境阻塞。
EXECUTION_DURATION：UNKNOWN（完整回合未保存起始計時；各受控場景時長如上）。
CHECKPOINT_SHA：正式遊戲來源fcfb0bfba5bd7608a8a84bfd297dd0cf1a38c486；最終交接提交另查遠端。
NEXT_AUTHORIZED_TASK：使用原生存檔中軍民交會的既有逐幀資料，隔離仍未有效接敵者的第一個阻擋因果；不重做已修復租約、不取消碰撞或擅改交通優先權。
AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。
