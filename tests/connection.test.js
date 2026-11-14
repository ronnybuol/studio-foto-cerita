import test from "node:test";
import assert from "node:assert/strict";
import {requestJSON,singleFlight,localDemo,validClassSnapshot} from "../public/connection.js";

function clock(){let fire,cleared=0;return {setTimer:callback=>{fire=callback;return 1},clearTimer:()=>cleared++,expire:()=>fire(),get cleared(){return cleared}}}
test("hanging fetch times out and aborts without waiting forever",async()=>{
 const time=clock();let signal;
 const request=requestJSON("/test",{}, {...time,fetchImpl:async(_url,options)=>{signal=options.signal;return new Promise(()=>{})}});
 time.expire();await assert.rejects(request,{code:"REQUEST_TIMEOUT"});
 assert.equal(signal.aborted,true);assert.equal(time.cleared,1);
});
test("a response body that never finishes also times out",async()=>{
 const time=clock();let entered;
 const bodyStarted=new Promise(resolve=>entered=resolve);
 const request=requestJSON("/test",{}, {...time,fetchImpl:async()=>({ok:true,json:()=>{entered();return new Promise(()=>{})}})});
 await bodyStarted;time.expire();await assert.rejects(request,{code:"REQUEST_TIMEOUT"});
});
test("HTTP errors preserve status and mutation requests are not automatically retried",async()=>{
 let calls=0;const time=clock();
 await assert.rejects(requestJSON("/test",{method:"POST"},{...time,fetchImpl:async()=>{calls++;return {ok:false,status:423,json:async()=>({error:"Kelas dikunci"})}}}),{status:423,message:"Kelas dikunci"});
 assert.equal(calls,1);assert.equal(time.cleared,1);
});
test("malformed successful response is rejected and a later healthy request succeeds",async()=>{
 const time=clock();
 await assert.rejects(requestJSON("/test",{}, {...time,fetchImpl:async()=>({ok:true,json:async()=>{throw Error("HTML instead of JSON")}})}),{code:"INVALID_RESPONSE"});
 assert.deepEqual(await requestJSON("/test",{}, {...time,fetchImpl:async()=>({ok:true,json:async()=>({stage:2})})}),{stage:2});
});
test("single flight coalesces interval, visibility, and reconnect polls and releases after failure",async()=>{
 let calls=0,release;const poll=singleFlight(()=>{calls++;return new Promise((resolve,reject)=>release={resolve,reject})});
 const one=poll();assert.equal(poll(),one);assert.equal(poll(),one);
 await Promise.resolve();assert.equal(calls,1);release.reject(Error("timeout"));await assert.rejects(one);
 const two=poll();await Promise.resolve();assert.equal(calls,2);release.resolve({stage:3});assert.deepEqual(await two,{stage:3});
});
test("demo requires explicit local opt-in; production cannot be put in demo by query string",()=>{
 assert.equal(localDemo({hostname:"kelasbelajar.org",search:"?demo=1"}),false);
 assert.equal(localDemo({hostname:"localhost",search:""}),false);
 assert.equal(localDemo({hostname:"localhost",search:"?demo=1"}),true);
});
test("cache cannot grant stages using incomplete or malformed state",()=>{
 for(const bad of [null,{stage:6},{stage:99,locked:false},{stage:-1,locked:false},{stage:2,locked:"false"}])assert.equal(validClassSnapshot(bad),false);
 assert.equal(validClassSnapshot({stage:2,locked:true}),true);
});
