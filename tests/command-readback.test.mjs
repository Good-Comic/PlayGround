import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
globalThis.window={innerWidth:1280,innerHeight:800};
const {Game}=await import('../js/game.js');
const {battleArmy}=await import('../js/battle-actions.js');
const {defendCore}=await import('../js/core-defense.js');
const {commandReadback,readbackGroupText,drawCommandReadback}=await import('../js/command-readback.js');
const {setLocale}=await import('../js/i18n.js');
const {STRINGS}=await import('../js/locales.js');
const fresh=()=>{const g=new Game();g.newRun(42,{civ:'FRK'});g.start();g.setSelection(battleArmy(g));return g;};
const snapshot=g=>{const s=g.snapshot();delete s.savedAt;return s;};
const focus=(g,target)=>{g.pickAt=()=>target;g.issueCommand(640,400);};
const enemy=g=>{const core=g.getTownCenter();const e=g.spawnUnit('spearman',core.x+7,core.y+6,'enemy');assert.ok(e);g.isVisible=()=>true;return e;};
function renderer(){const calls=[];const ctx=new Proxy({measureText:s=>({width:s.length*7})},{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args])});return{ctx,calls,dpr:1,w:1280,h:800,screen:()=>({x:640,y:400})};}

test('空地右鍵與人工集火的讀回不同，後續人工移動立即覆蓋',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);let v=commandReadback(g);
 assert.equal(v.groups[0].kind,'focus');assert.equal(v.targets[0].target,e);assert.equal(v.targets[0].count,battleArmy(g).length);
 g.pickAt=()=>null;g.issueCommand(640,400);v=commandReadback(g);assert.equal(v.groups[0].kind,'move');assert.equal(v.targets.length,0);
});
test('護衛中自動接敵仍讀為護衛，不假稱人工集火',()=>{
 const g=fresh(),e=enemy(g),core=g.getTownCenter();g.pickAt=()=>core;assert.equal(defendCore(g).kind,'guard');
 for(const u of battleArmy(g)){u.state='attack';u.target=e;u.manualAttack=false;}
 const v=commandReadback(g);assert.equal(v.groups[0].kind,'guard');assert.ok(v.groups[0].name);assert.equal(v.targets.length,0);
});
test('推進、巡邏、移動、自主接敵、待命與固守混合不丟人數',()=>{
 const g=fresh(),e=enemy(g),army=battleArmy(g),a=army[0];
 const states=[{state:'move',tacticalOrder:{type:'attackMove'}},{state:'attack',target:e,tacticalOrder:{type:'patrol'}},{state:'attack',target:e},{state:'idle',hold:true},{state:'idle'},{state:'move'}];
 g.units=states.map((s,i)=>({...a,id:1000+i,manualAttack:false,target:null,tacticalOrder:null,hold:false,...s}));g.selection=[...g.units];
 const v=commandReadback(g);assert.deepEqual(new Set(v.groups.map(x=>x.kind)),new Set(['attackMove','patrol','auto','hold','idle','move']));assert.equal(v.groups.reduce((n,x)=>n+x.count,0),6);
});
test('不從歷史路徑失敗欄位宣稱部隊仍卡死',()=>{const g=fresh();g.selection[0].orderFailure='congested';g.selection[0].state='move';assert.equal(commandReadback(g).groups.find(x=>x.kind==='move').count,1);});
test('只計目前正式戰士，不把空選、工人、英雄、敵軍或建築當全軍',()=>{
 const g=fresh(),e=enemy(g),army=battleArmy(g);for(const selection of [[],[g.hero],[g.getTownCenter()],[e],g.units.filter(u=>u.type==='villager')]){g.selection=selection;const v=commandReadback(g);assert.equal(v.selected,0);assert.equal(v.army,army.length);assert.equal(v.groups.length,0);assert.equal(v.targets.length,0);}
 g.selection=[g.hero,...army];assert.equal(commandReadback(g).selected,army.length);army[0].alive=false;assert.equal(commandReadback(g).selected,army.length-1);
});
test('英雄直控援護保留選取、按鍵、鏡頭，摘要正確顯示已選零人',()=>{
 const g=fresh();g.toggleHeroControl();g.keys.add('d');const selected=[...g.selection],cam={...g.camera};assert.ok(defendCore(g).ok);const before=snapshot(g),v=commandReadback(g);assert.equal(v.heroDirect,true);assert.equal(v.selected,0);assert.ok(v.army>0);assert.equal(v.targets.length,0);assert.deepEqual(g.selection,selected);assert.ok(g.keys.has('d'));assert.deepEqual(g.camera,cam);assert.deepEqual(snapshot(g),before);
});
test('未見目標在可見性通過前不讀名稱、類型、HP、位置或旗手資料',()=>{
 const g=fresh();const hidden=new Proxy({alive:true},{get:(o,k)=>{if(['type','x','y','hp','id','w'].includes(k))throw Error('HIDDEN_FIELD_READ:'+String(k));return o[k];}});
 for(const u of battleArmy(g)){u.manualAttack=true;u.target=hidden;u.state='attack';}g.isVisible=()=>false;
 const v=commandReadback(g,{carrier:hidden});assert.equal(v.groups[0].kind,'unseen');assert.equal(v.groups[0].name,'');assert.equal(v.targets.length,0);
});
test('死亡、失去視野與換選取立即移除舊人工目標',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);assert.equal(commandReadback(g).targets.length,1);g.isVisible=()=>false;assert.equal(commandReadback(g).targets.length,0);g.isVisible=()=>true;e.alive=false;assert.equal(commandReadback(g).targets.length,0);e.alive=true;g.selection=[];assert.equal(commandReadback(g).targets.length,0);
});
test('旗手身分只在實際目標吻合且可見時附加',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);const other={...e,id:999};assert.ok(!commandReadback(g,{carrier:other}).groups[0].name.includes('旗手'));setLocale('zh-Hant',{persist:false});assert.ok(commandReadback(g,{carrier:e}).groups[0].name.startsWith('旗手'));g.isVisible=()=>false;assert.equal(commandReadback(g,{carrier:e}).groups[0].name,'');
});
test('多個人工目標各自回報，不挑選最佳目標或改寫原令',()=>{
 const g=fresh(),a=enemy(g),b=g.spawnUnit('militia',a.x+2,a.y,'enemy'),army=battleArmy(g);assert.ok(b);g.selection=[army[0]];focus(g,a);g.selection=[army[1]];focus(g,b);g.selection=army;const before=snapshot(g),v=commandReadback(g);assert.equal(v.targets.length,2);assert.deepEqual(snapshot(g),before);
});
test('反覆摘要與前景繪製保持snapshot、模擬RNG與視效RNG不變並成對還原Canvas狀態',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);const before=snapshot(g),rng=g.rng.state,visual=g.visualRng.state,r=renderer();for(let i=0;i<50;i++)drawCommandReadback(r,g,commandReadback(g));assert.deepEqual(snapshot(g),before);assert.equal(g.rng.state,rng);assert.equal(g.visualRng.state,visual);assert.equal(r.calls.filter(x=>x[0]==='save').length,r.calls.filter(x=>x[0]==='restore').length);assert.ok(r.calls.some(x=>x[0]==='fillText'));
});
test('繪製時再次查可見性、死亡、換選取與讀檔後舊實體，不畫舊座標',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);const v=commandReadback(g),r=renderer();g.isVisible=()=>false;drawCommandReadback(r,g,v);assert.equal(r.calls.length,0);g.isVisible=()=>true;g.selection=[];drawCommandReadback(r,g,v);assert.equal(r.calls.length,0);g.selection=v.actors;const s=g.snapshot();g.restore(s);drawCommandReadback(r,g,v);assert.equal(r.calls.length,0);
});
test('暫停仍可純讀，選卡與結算不殘留目標；讀檔後依原生新物件回讀',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);g.paused=true;assert.equal(commandReadback(g).targets.length,1);const s=g.snapshot(),h=new Game();h.restore(s);assert.equal(commandReadback(h).selected,0);h.start();h.isVisible=()=>true;assert.equal(commandReadback(h).groups[0].kind,'focus');for(const phase of ['boon','victory','defeat']){g.phase=phase;assert.equal(commandReadback(g).targets.length,0);assert.equal(commandReadback(g).selected,0);}g.newRun(77,{civ:'CHN'});assert.equal(commandReadback(g).targets.length,0);
});
test('四語摘要完整且不出raw key或未替換參數',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);for(const locale of ['zh-Hant','zh-Hans','en','ja']){setLocale(locale,{persist:false});const v=commandReadback(g);for(const group of v.groups){const text=readbackGroupText(group);assert.ok(!text.startsWith('readback.'));assert.ok(!text.includes('{'));}for(const key of ['title','coverage','direct','none','move','guard','focus','attackMove','patrol','auto','idle','hold','unseen','more','ally','flag','target','help'])assert.ok(STRINGS[locale]['readback.'+key],locale+key);}
});
test('正式沙暴視野縮減會隱去人工目標名稱與標示，恢復後重新讀取',()=>{
 const g=fresh(),u=battleArmy(g)[0],e=g.spawnUnit('spearman',30,30,'enemy');assert.ok(e);
 // 幾何視野夾具；不執行尋路或冒稱自然戰鬥。
 g.units=[u,e];g.buildings=[];Object.assign(u,{x:20,y:20,manualAttack:true,target:e,state:'attack'});Object.assign(e,{x:25.5,y:20});g.selection=[u];
 assert.ok(g.isVisible(e));assert.equal(commandReadback(g).targets.length,1);g.executeSandstorm();assert.equal(g.isVisible(e),false);assert.equal(commandReadback(g).groups[0].kind,'unseen');assert.equal(commandReadback(g).targets.length,0);g.effects.sandstorm=0;assert.equal(commandReadback(g).targets.length,1);
});
test('密集多目標前景限制四個，畫面外不繪製，摘要仍包含全部選兵',()=>{
 const g=fresh(),base=battleArmy(g)[0],e=enemy(g);const fighters=[],targets=[];
 for(let i=0;i<9;i++){const target={...e,id:900+i};targets.push(target);fighters.push({...base,id:1000+i,state:'attack',manualAttack:true,tacticalOrder:null,target});}
 g.units=[...fighters,...targets];g.selection=fighters;const v=commandReadback(g),r=renderer();assert.equal(v.selected,9);assert.equal(v.targets.length,9);drawCommandReadback(r,g,v);assert.equal(r.calls.filter(c=>c[0]==='fillText').length,4);r.calls.length=0;r.screen=()=>({x:-500,y:-500});drawCommandReadback(r,g,v);assert.equal(r.calls.length,0);
});
test('前景繪製例外仍還原Canvas，不污染後續單位姿態',()=>{
 const g=fresh(),e=enemy(g);focus(g,e);const r=renderer();r.ctx.fillText=()=>{throw Error('CONTROLLED_DRAW_ERROR');};assert.throws(()=>drawCommandReadback(r,g,commandReadback(g)),/CONTROLLED_DRAW_ERROR/);assert.equal(r.calls.filter(c=>c[0]==='save').length,r.calls.filter(c=>c[0]==='restore').length);
});
