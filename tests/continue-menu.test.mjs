import test from 'node:test';import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {UI}=await import('../js/ui.js');
test('same-page first save enables Continue on menu return only after integrity readiness',()=>{
 const button={disabled:true,hidden:true},ui={playtestReady:true,callbacks:{hasSave:()=>false},el:{continueBtn:button,menu:{classList:{remove(){}}},hud:{classList:{add(){}},setAttribute(){}}},closeSettings(){},closeGM(){}};
 UI.prototype.showMenu.call(ui);assert.equal(button.hidden,true);assert.equal(button.disabled,true);
 ui.callbacks.hasSave=()=>true;UI.prototype.showMenu.call(ui);assert.equal(button.hidden,false);assert.equal(button.disabled,false);
 ui.playtestReady=false;UI.prototype.showMenu.call(ui);assert.equal(button.disabled,true);
 ui.playtestReady=true;ui.callbacks.hasSave=()=>false;UI.prototype.showMenu.call(ui);assert.equal(button.disabled,true);assert.equal(button.hidden,true);
});
