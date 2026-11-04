import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {gatherWeights,defaultStewards}=await import('../js/stewards.js');
test('非百分之百總和沿用正式正規化，不改設定 / non-100 totals use native normalization without mutating preferences',()=>{
 const s={...defaultStewards(),gather:'custom',ratios:[40,40,40,40]},before=JSON.stringify(s);
 assert.deepEqual(gatherWeights(s),[.25,.25,.25,.25]);assert.equal(JSON.stringify(s),before);
 s.ratios=[40,30,20,10];assert.deepEqual(gatherWeights(s),[.4,.3,.2,.1]);
});
test('全零回退及預設模式忽略自訂值 / zero fallback and preset mode use existing allocation rules',()=>{
 const s={...defaultStewards(),gather:'custom',ratios:[0,0,0,0]};assert.deepEqual(gatherWeights(s),[.34,.32,.22,.12]);
 s.gather='food';s.ratios=[0,0,0,100];assert.deepEqual(gatherWeights(s),[.64,.16,.12,.08]);
});
