import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {createTrainerControl} from "../public/trainer-sync.js";
import worker from "../src/index.js";
import {COMPOSITION_START} from "../public/composition.js";
import {EDFAT_START} from "../public/edfat.js";
import {STORY_START} from "../public/story.js";
import {CAPTION_START} from "../public/caption.js";
import {ETHICS_START} from "../public/ethics.js";
const FIRST=[0,0,COMPOSITION_START,EDFAT_START,STORY_START,CAPTION_START,ETHICS_START];

function environment(){
 const sqlite=new DatabaseSync(":memory:");sqlite.exec(readFileSync(new URL("../schema.sql",import.meta.url),"utf8"));
 const reads=[];let afterSnapshot;
 const DB={prepare(sql){const statement=sqlite.prepare(sql);const methods=args=>({
  first:async()=>{reads.push(sql);const result=statement.get(...args)||null;if(sql.includes("SELECT active_stage,camera_json")&&afterSnapshot){const hook=afterSnapshot;afterSnapshot=null;hook()}return result},
  all:async()=>({results:statement.all(...args)}),run:async()=>({meta:{changes:Number(statement.run(...args).changes)}})
 });return {...methods([]),bind:(...args)=>methods(args)}}};
 return {DB,sqlite,reads,afterSnapshot:fn=>afterSnapshot=fn,TRAINER_PIN:"local-trainer-12345",MENTOR_PIN:"local-mentor-12345",SESSION_SECRET:"local-only-trainer-sync-test-secret-123456789"};
}
async function api(env,path,body,token){
 const response=await worker.fetch(new Request("http://localhost/lensa-muda/api"+path,{method:body?"PUT":"GET",headers:{...(token?{Authorization:"Bearer "+token}:{}),...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);
 return {status:response.status,data:await response.json()};
}
async function login(env,pin="local-trainer-12345"){
 const response=await worker.fetch(new Request("http://localhost/lensa-muda/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin})}),env);
 assert.equal(response.status,200);return (await response.json()).token;
}
test("each module opens its correct first slide atomically; revisiting the same stage preserves its slide",async()=>{
 const env=environment();try{
  const token=await login(env);
  const expected=FIRST;
  for(let stage=1;stage<=6;stage++){
   const changed=await api(env,"/state",{stage,controlRevision:stage*100},token);assert.equal(changed.status,200);
   assert.equal(changed.data.presentation.view,"theory");assert.equal(changed.data.presentation.slide,expected[stage]);
   const state=(await api(env,"/state")).data;assert.equal(state.stage,stage);assert.equal(state.presentation.slide,expected[stage]);
   const next=await api(env,"/presentation",{stage,view:"theory",slide:expected[stage]+1,controlRevision:stage*100+1},token);assert.equal(next.status,200);
   const same=await api(env,"/state",{stage,controlRevision:stage*100+2},token);assert.equal(same.data.presentation.slide,expected[stage]+1);
  }
 }finally{env.sqlite.close()}
});
test("delayed stage/slide/overlay commands cannot overwrite newer control; previous-module slides are rejected",async()=>{
 const env=environment();try{
  const token=await login(env);
  assert.equal((await api(env,"/state",{stage:2,controlRevision:100},token)).status,200);
  assert.equal((await api(env,"/state",{stage:3,controlRevision:200},token)).status,200);
  assert.equal((await api(env,"/state",{stage:1,controlRevision:150},token)).status,409);
  assert.equal((await api(env,"/presentation",{stage:2,view:"theory",slide:31,controlRevision:300},token)).status,409);
  assert.equal((await api(env,"/presentation",{stage:3,view:"theory",slide:31,controlRevision:300},token)).status,409);
  assert.equal((await api(env,"/welcome",{active:true,controlRevision:150},token)).status,409);
  assert.equal((await api(env,"/spotlight",{participantId:null,controlRevision:150},token)).status,409);
  const state=(await api(env,"/state")).data;assert.equal(state.stage,3);assert.equal(state.presentation.slide,EDFAT_START);assert.equal(state.controlRevision,200);
  assert.equal((await api(env,"/presentation",{stage:3,view:"simulator",slide:EDFAT_START,controlRevision:201},token)).status,200);
 }finally{env.sqlite.close()}
});
test("state reads one coherent session snapshot, even when a trainer changes it immediately afterwards",async()=>{
 const env=environment();try{
  const token=await login(env);await api(env,"/state",{stage:1,controlRevision:100},token);env.reads.length=0;
  env.afterSnapshot(()=>env.sqlite.prepare("UPDATE sessions SET active_stage=2,camera_json=json_set(camera_json,'$.slide',?,'$.controlRevision',200)").run(COMPOSITION_START));
  const first=(await api(env,"/state")).data;
  assert.equal(first.stage,1);assert.equal(first.presentation.slide,0);assert.equal(first.controlRevision,100);
  assert.equal(env.reads.filter(sql=>sql.includes("camera_json")).length,1);
  const second=(await api(env,"/state")).data;assert.equal(second.stage,2);assert.equal(second.presentation.slide,COMPOSITION_START);
 }finally{env.sqlite.close()}
});
test("changing module ends the previous spotlight without resetting demo settings, participant accounts or answers",async()=>{
 const env=environment();try{
  const token=await login(env);await api(env,"/state",{stage:1,controlRevision:100},token);
  const id=crypto.randomUUID();
  env.sqlite.prepare("INSERT INTO participants(id,session_id,name,school,class_name,token_hash,username) VALUES(?,?,?,?,?,?,?)").run(id,"lensa-muda-2026","Peserta Uji","Sekolah Lokal","XI","test-hash","uji");
  const original=JSON.stringify({a:2,s:3,i:1});
  env.sqlite.prepare("INSERT INTO answers(participant_id,stage,payload) VALUES(?,?,?)").run(id,"kamera",original);
  assert.equal((await api(env,"/spotlight",{participantId:id,module:"kamera",controlRevision:101},token)).status,200);
  await api(env,"/demo-camera",{a:5,s:3,i:1},token);
  assert.ok((await api(env,"/state")).data.spotlight);
  await api(env,"/state",{stage:2,controlRevision:200},token);
  const row=JSON.parse(env.sqlite.prepare("SELECT camera_json FROM sessions").get().camera_json);
  assert.equal(row.a,5);assert.equal(row.spotlight,undefined);
  assert.equal(env.sqlite.prepare("SELECT COUNT(*) AS total FROM participants").get().total,1);
  assert.equal(env.sqlite.prepare("SELECT payload FROM answers WHERE participant_id=?").get(id).payload,original);
  const mentor=await login(env,"local-mentor-12345");
  assert.equal((await api(env,"/state",{stage:6,controlRevision:300},mentor)).status,403);
  assert.equal((await api(env,"/presentation",{stage:2,view:"theory",slide:31,controlRevision:300},mentor)).status,403);
 }finally{env.sqlite.close()}
});
test("presentation clicks are bounded to one in-flight request, release on failure, and never auto-replay",async()=>{
 let release,calls=0;const changes=[];
 const control=createTrainerControl({getRevision:()=>500,onBusy:busy=>changes.push(busy),now:()=>100});
 const first=control.run(async revision=>{calls++;assert.equal(revision,501);await new Promise((resolve,reject)=>release={resolve,reject})});
 assert.equal(control.busy,true);assert.equal(await control.run(async()=>calls++),false);assert.equal(calls,1);
 release.reject(Error("timeout"));await assert.rejects(first);assert.equal(control.busy,false);
 await control.run(async revision=>{calls++;assert.equal(revision,502)});
 assert.equal(calls,2);assert.deepEqual(changes,[true,false,true,false]);
});
