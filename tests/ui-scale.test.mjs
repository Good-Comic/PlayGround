import test from 'node:test';import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const props={};globalThis.document={body:{classList:{toggle(){}}},documentElement:{style:{setProperty:(k,v)=>props[k]=v},dataset:{}}};
const {saveSettings,loadSettings,resetSettings,applySettings}=await import('../js/settings.js');
test('old saves and invalid UI scale migrate safely without changing game speed',()=>{localStorage.setItem('riftwatch.playtest.v227.settings.v1',JSON.stringify({gameSpeed:1.25,uiScale:99}));const r=loadSettings();assert.equal(r.uiScale,1);assert.equal(r.gameSpeed,1.25);});
test('UI text scale persists independently, applies CSS variable and resets',()=>{saveSettings({uiScale:1.3,gameSpeed:1,autoEconomy:false});const r=loadSettings();applySettings(r);assert.equal(r.uiScale,1.3);assert.equal(r.gameSpeed,1);assert.equal(r.autoEconomy,false);assert.equal(props['--ui-scale'],'1.3');assert.equal(resetSettings().uiScale,1);});
