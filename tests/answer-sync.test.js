import test from "node:test";
import assert from "node:assert/strict";
import {createAnswerSync} from "../public/answer-sync.js";

function setup(){
  const data=new Map(),calls=[];
  const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  let user={id:"alice",token:"alice-token"},sender=async(key,payload,owner)=>{calls.push({key,payload,owner});return {ok:true}};
  const options={storage,getUser:()=>user,send:(...args)=>sender(...args)};
  return {data,calls,storage,options,store:createAnswerSync(options),setUser:value=>user=value,setSender:fn=>sender=fn};
}
const connected={online:true,stage:6};
test("failed submission survives reload and takes precedence over old server answer",async()=>{
  const s=setup();s.setSender(async()=>{throw Error("HTTP 500")});
  const work={caption:{captionText:"new B",completedAt:"now"}};
  assert.equal(s.store.queue("caption",work.caption,work),true);
  assert.equal((await s.store.flush(connected)).synced,false);
  const reloaded=createAnswerSync(s.options),local=reloaded.activate();
  assert.equal(reloaded.merge({caption:{captionText:"old A"}},local).caption.captionText,"new B");
  s.setSender(async()=>({ok:true}));
  assert.equal((await reloaded.flush(connected)).synced,true);
  assert.deepEqual(createAnswerSync(s.options).pendingKeys(),[]);
});
test("all six modules preserve pending answers, including camera",()=>{
  const s=setup();
  for(const key of ["kamera","komposisi","edfat","story","caption","etika"]){
    const work=s.store.activate();work[key]={value:"local",completedAt:"now"};s.store.queue(key,work[key],work);
  }
  const reload=createAnswerSync(s.options),merged=reload.merge({},reload.activate());
  assert.equal(Object.keys(merged).length,6);
  assert.equal(merged.kamera.value,"local");
});
test("drafts are restored but never sent without pressing Save",async()=>{
  const s=setup();s.store.saveWork({caption:{captionText:"draft C",_draft:true}});
  const reload=createAnswerSync(s.options);
  assert.equal(reload.merge({caption:{captionText:"A"}},reload.activate()).caption.captionText,"draft C");
  await reload.flush(connected);assert.equal(s.calls.length,0);
});
test("submissions serialize: newer Save wins and an in-flight response cannot clear it",async()=>{
  const s=setup();let release;
  s.setSender(async(key,payload,owner)=>{s.calls.push({key,payload,owner});if(payload.captionText==="B")await new Promise(resolve=>release=resolve);return {ok:true}});
  s.store.queue("caption",{captionText:"B"},{caption:{captionText:"B"}});
  const first=s.store.flush(connected);
  assert.equal(s.store.flush(connected),first);
  s.store.queue("caption",{captionText:"C"},{caption:{captionText:"C"}});
  release();await first;
  assert.deepEqual(s.calls.map(x=>x.payload.captionText),["B","C"]);
  assert.deepEqual(s.store.pendingKeys(),[]);
  assert.equal(s.store.activate().caption.captionText,"C");
});
test("editing a draft during send does not lose it or send it automatically",async()=>{
  const s=setup();let release;s.setSender(()=>new Promise(resolve=>release=resolve));
  s.store.queue("caption",{captionText:"B"},{caption:{captionText:"B"}});
  const send=s.store.flush(connected);
  s.store.saveWork({caption:{captionText:"C",_draft:true}});
  release({ok:true});await send;
  const reload=createAnswerSync(s.options);
  assert.equal(reload.merge({caption:{captionText:"B"}},reload.activate()).caption.captionText,"C");
});
test("switching accounts isolates drafts and never sends another account's pending work",async()=>{
  const s=setup();let release;s.setSender(()=>new Promise(resolve=>release=resolve));
  s.store.queue("caption",{captionText:"Alice"},{caption:{captionText:"Alice"}});
  s.store.queue("etika",{plan:"Alice"},{caption:{captionText:"Alice"},etika:{plan:"Alice"}});
  const pending=s.store.flush(connected);
  s.setUser({id:"bob",token:"bob-token"});assert.deepEqual(s.store.activate(),{});
  release({ok:true});await pending;
  assert.deepEqual(s.store.pendingKeys(),[]);
  s.setUser({id:"alice",token:"new-alice-token"});
  assert.equal(s.store.activate().caption.captionText,"Alice");
  assert.deepEqual(s.store.pendingKeys(),["etika"]);
});
test("locked class and unopened modules keep work pending without sending",async()=>{
  const s=setup();s.store.queue("caption",{captionText:"B"},{caption:{captionText:"B"}});
  await s.store.flush({...connected,locked:true});await s.store.flush({...connected,stage:4});
  assert.equal(s.calls.length,0);assert.deepEqual(s.store.pendingKeys(),["caption"]);
});
test("HTTP/auth failure or missing server acknowledgement never claims success",async()=>{
  const s=setup();s.store.queue("kamera",{a:1},{kamera:{a:1}});
  for(const sender of [async()=>{throw Object.assign(Error("expired"),{status:401})},async()=>({})]){
    s.setSender(sender);assert.equal((await s.store.flush(connected)).synced,false);
    assert.deepEqual(s.store.pendingKeys(),["kamera"]);
  }
});
test("storage failure is reported and cannot be described as durable local saving",()=>{
  const s=setup();let errors=0;
  const store=createAnswerSync({...s.options,storage:{getItem:()=>null,setItem(){throw Error("QuotaExceeded")}},onStorageError:()=>errors++});
  assert.equal(store.queue("kamera",{a:1},{kamera:{a:1}}),false);
  assert.equal(errors,1);assert.deepEqual(store.pendingKeys(),["kamera"]);
});
test("legacy work migrates only to its original account and remains available after logout",()=>{
  const s=setup();s.store.activate({caption:{captionText:"legacy"}});
  s.setUser(null);assert.deepEqual(s.store.activate(),{});
  s.setUser({id:"bob",token:"b"});assert.deepEqual(s.store.activate(),{});
  s.setUser({id:"alice",token:"a"});assert.equal(createAnswerSync(s.options).activate().caption.captionText,"legacy");
});
test("uncertain legacy results stay as drafts for review and are not uploaded automatically",async()=>{
  const s=setup();s.store.activate({caption:{captionText:"legacy B",completedAt:"old"}});
  const reload=createAnswerSync(s.options),local=reload.activate();
  assert.equal(reload.merge({caption:{captionText:"server A"}},local).caption.captionText,"legacy B");
  assert.equal(local.caption._draft,true);await reload.flush(connected);
  assert.equal(s.calls.length,0);
});
