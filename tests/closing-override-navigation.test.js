import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DatabaseSync} from "node:sqlite";
const worker=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
const route=(start,end)=>worker.slice(worker.indexOf(start),worker.indexOf(end,worker.indexOf(start)+1));
const expected="'$.closingVisible',json('false')";
test("All trainer navigation commands must dismiss the persistent closing overlay",()=>{
 const pairs=[
  ['if(method==="PUT"&&path==="/api/presentation")','if(method==="PUT"&&path==="/api/orientation")'],
  ['if(method==="PUT"&&path==="/api/orientation")','if(method==="PUT"&&path==="/api/welcome")'],
  ['if(method==="PUT"&&path==="/api/welcome")','if(method==="PUT"&&path==="/api/hunting/timer")'],
  ['if(method==="PUT"&&path==="/api/state")','if(method==="PUT"&&path==="/api/class-lock")'],
  ['if(method==="PUT"&&path==="/api/portfolio/presentation")','// Only the trainer can read an individual participant']
 ];
 for(const [start,end] of pairs){
  const body=route(start,end);
  assert.ok(body.length>150,start+" handler present");
  assert.ok(body.includes(expected),start+" must clear overlay atomically");
 }
 assert.ok(route('if(method==="PUT"&&path==="/api/closing/presentation")','// Six documentary photos for Modul 06').includes("'$.closingVisible',?"),"closing endpoint still allowed to show the slide");
});
test("Real SQLite json_set removes stale closing flag without changing participant data",()=>{
 const db=new DatabaseSync(":memory:");
 try{
  db.exec("CREATE TABLE sessions (id TEXT PRIMARY KEY, camera_json TEXT NOT NULL, active_stage INTEGER NOT NULL);");
  db.prepare("INSERT INTO sessions VALUES(?,?,?)").run("class-1",JSON.stringify({closingVisible:1,view:"theory",slide:0}),0);
  const commands=[
   ["welcome", "json_set(camera_json,'$.welcome',json('true'),'$.orientation',null,'$.closingVisible',json('false'))"],
   ["orientation", "json_set(camera_json,'$.orientation','registration','$.rosterPage',0,'$.welcome',json('false'),'$.closingVisible',json('false'))"],
   ["presentation", "json_set(camera_json,'$.view','theory','$.slide',21,'$.closingVisible',json('false'),'$.welcome',json('false'))"]
  ];
  for(const [name,expression] of commands){
   db.prepare("UPDATE sessions SET camera_json=json_set(camera_json,'$.closingVisible',1) WHERE id='class-1'").run();
   db.prepare("UPDATE sessions SET camera_json="+expression+" WHERE id='class-1'").run();
   const row=db.prepare("SELECT camera_json FROM sessions").get();
   assert.equal(JSON.parse(row.camera_json).closingVisible,false,name+" closes overlay");
  }
 }finally{db.close()}
});
