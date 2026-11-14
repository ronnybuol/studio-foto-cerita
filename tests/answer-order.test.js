import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import worker from "../src/index.js";

function environment(){
 const sqlite=new DatabaseSync(":memory:");sqlite.exec(readFileSync(new URL("../schema.sql",import.meta.url),"utf8"));
 sqlite.exec("UPDATE sessions SET active_stage=6");
 const DB={prepare(sql){const statement=sqlite.prepare(sql);const methods=args=>({
  first:async()=>statement.get(...args)||null,all:async()=>({results:statement.all(...args)}),
  run:async()=>({meta:{changes:Number(statement.run(...args).changes)}})
 });return {...methods([]),bind:(...args)=>methods(args)}}};
 return {DB,sqlite};
}
async function api(env,path,{method="GET",body,token}={}){
 return worker.fetch(new Request("http://localhost/lensa-muda/api"+path,{method,
 headers:{...(body?{"Content-Type":"application/json"}:{}),...(token?{Authorization:"Bearer "+token}:{})},
 ...(body?{body:JSON.stringify(body)}:{})}),env);
}
test("real SQLite rejects a timed-out old write arriving after a newer submission; retry is idempotent",async()=>{
 const env=environment();
 try{
  const registration=await api(env,"/participants",{method:"POST",body:{name:"Peserta Lokal",school:"Sekolah Uji",className:"XI",username:"revisiuji"}});
  assert.equal(registration.status,201);const {user}=await registration.json();
  const save=body=>api(env,"/answers/caption",{method:"PUT",token:user.token,body});
  assert.equal((await save({captionText:"new C",_clientRevision:200})).status,200);
  assert.equal((await save({captionText:"late B",_clientRevision:100})).status,409);
  assert.equal((await save({captionText:"new C",_clientRevision:200})).status,200);
  const profile=await (await api(env,"/me",{token:user.token})).json();
  assert.equal(profile.answers.caption.captionText,"new C");
  assert.equal(env.sqlite.prepare("SELECT COUNT(*) AS total FROM answers").get().total,1);
  assert.equal((await save({captionText:"bad revision",_clientRevision:"300"})).status,400);
  // Existing clients remain compatible during rollout.
  assert.equal((await save({captionText:"legacy compatible"})).status,200);
 }finally{env.sqlite.close()}
});
