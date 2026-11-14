import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {createAnswerSync} from "../public/answer-sync.js";
const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
const restore=app.slice(app.indexOf("async function restoreParticipantSession("),app.lastIndexOf("await syncState();"));
const save=app.slice(app.indexOf("async function saveAnswer("),app.indexOf("function bindLessons("));
function setup(){
 const values=new Map(),localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const context={state:{online:true,serverStage:6,locked:false,user:{id:"alice",token:"old-token",username:"alice"},work:{},camera:{},composition:{}},localStorage,
  STORAGE_USER:"user",STORAGE_WORK:"legacy",loadLearnerViews(){},paintAnswerStatus(){},toast(){},answerSaveMessage:result=>result.synced?"received":"pending"};
 context.answerSync=createAnswerSync({storage:localStorage,getUser:()=>context.state.user,send:async()=>{throw Error("PUT 500")}});
 context.saveWork=()=>context.answerSync.saveWork(context.state.work);
 vm.createContext(context);vm.runInContext(restore+save,context);
 return context;
}
test("real app Save + restore preserve the failed final result instead of old server data",async()=>{
 const c=setup();
 assert.equal((await c.saveAnswer("caption",{captionText:"new B",completedAt:"now"})).synced,false);
 c.request=async()=>({user:{id:"alice"},answers:{caption:{captionText:"old A"}}});
 await c.restoreParticipantSession();
 assert.equal(c.state.work.caption.captionText,"new B");
 assert.deepEqual(c.answerSync.pendingKeys(),["caption"]);
});
test("saving a migrated camera/composition draft removes its draft marker from the submitted snapshot",async()=>{
 const c=setup();
 const camera={a:2,s:3,i:1,_draft:true};
 await c.saveAnswer("kamera",camera);
 assert.equal(c.state.work.kamera._draft,undefined);
 assert.equal(camera._draft,true);
 assert.deepEqual(c.answerSync.pendingKeys(),["kamera"]);
});
test("401 retains account-scoped work for login again instead of deleting pending answers",async()=>{
 const c=setup();await c.saveAnswer("caption",{captionText:"new B",completedAt:"now"});
 c.request=async()=>{throw Object.assign(Error("expired"),{status:401})};
 await c.restoreParticipantSession();assert.equal(c.state.user,null);
 c.state.user={id:"bob",token:"bob-token"};assert.deepEqual(c.answerSync.activate(),{});
 c.state.user={id:"alice",token:"new-token"};
 c.state.work=c.answerSync.activate();
 c.request=async()=>({user:{id:"alice"},answers:{}});await c.restoreParticipantSession();
 assert.equal(c.state.work.caption.captionText,"new B");
 assert.deepEqual(c.answerSync.pendingKeys(),["caption"]);
});
test("slow profile response cannot overwrite a newer draft or another logged-in account",async()=>{
 const c=setup();let release;c.request=()=>new Promise(resolve=>release=resolve);
 const restoring=c.restoreParticipantSession();
 c.state.work.caption={captionText:"typed during request",_draft:true};c.saveWork();
 release({user:{id:"alice"},answers:{caption:{captionText:"old A"}}});await restoring;
 assert.equal(c.state.work.caption.captionText,"typed during request");
 const oldRequest=c.restoreParticipantSession();
 c.state.user={id:"bob",token:"bob-token"};c.state.work={};
 release({user:{id:"alice"},answers:{caption:{captionText:"Alice private answer"}}});await oldRequest;
 assert.equal(c.state.user.id,"bob");assert.deepEqual(c.state.work,{});
});
