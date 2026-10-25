import test from 'node:test';import assert from 'node:assert/strict';
import {run} from '../tools/qa/perf_protocol.js';
test('late warmup cannot shorten the full measurement window',async()=>{
 let now=0;globalThis.performance={now:()=>now,mark(){}};
 const g={time:0,seed:1,units:[],phase:'prep',navigationStats:{}};
 globalThis.ageOfAsh={game:g,renderer:{}};globalThis.audit={origins:new Map(),firstMoves:new Map(),moved:new Set(),started:0,composition:{},attacks:0,kills:0};
 globalThis.auditStats={enabled:false,frames:[],nav:[],searches:[],expanded:[],pending:[],alive:[],heap:[],observer:[]};
 globalThis.requestAnimationFrame=fn=>queueMicrotask(()=>{now=now===0?2500:now+500;g.time=now/1000;fn(now);});
 const r=await run(1,2,'combat',1);assert.equal(r.actual_warmup_seconds,2.5);assert.equal(r.measured_wall_seconds,2);assert.equal(r.measured_sim_seconds,2);assert.equal(r.elapsed_wall_seconds,4.5);assert.equal(r.raw.frames.length,4);
});
