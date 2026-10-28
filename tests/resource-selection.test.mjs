import test from'node:test';import assert from'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const{UI}=await import('../js/ui.js');const{Game}=await import('../js/game.js');
const element=()=>({style:{},classList:{remove(){},toggle(){}},textContent:'',innerHTML:'',hidden:false});
test('resource selection renders remaining amount instead of reading undefined unit combat data',()=>{
 const g=new Game(),node=g.world.resources.find(n=>n.resource==='food');g.selection=[node];
 const el=Object.fromEntries(['panelHint','selectionName','selectionSub','selectionHp','selectionHpText','selectionStats','selectionCount','selectionPanel'].map(k=>[k,element()]));
 const ui={el,unitStatus:UI.prototype.unitStatus,drawPortrait(){}};
 assert.doesNotThrow(()=>UI.prototype.renderSelection.call(ui,g));assert.equal(el.selectionHpText.textContent,`${Math.round(node.amount)} / ${Math.round(node.maxAmount)}`);assert.ok(!el.selectionStats.innerHTML.includes('NaN'));assert.deepEqual(UI.prototype.getCommands.call(ui,g),[]);
 const s=g.snapshot(),r=new Game();r.restore(s);assert.equal(r.selection[0].resource,node.resource);assert.doesNotThrow(()=>UI.prototype.renderSelection.call(ui,r));
});
