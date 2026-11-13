import test from "node:test";
import assert from "node:assert/strict";
import handler from "../src/index.js";

function mockEnv(){
 const data={stage:0,camera:{a:1,s:3,i:1},migrated:true,participants:[],answers:[],loginAttempts:new Map(),usernameSchema:false,lockSchema:false,locked:false};
 const DB={prepare(sql){
   return {async all(){if(sql.includes("PRAGMA table_info(participants)"))return {results:data.usernameSchema?[{name:"id"},{name:"username"}]:[{name:"id"}]};if(sql.includes("PRAGMA table_info(sessions)"))return {results:data.lockSchema?[{name:"id"},{name:"is_locked"}]:[{name:"id"}]};return {results:[]}},async run(){if(sql.includes("ALTER TABLE participants ADD COLUMN username"))data.usernameSchema=true;if(sql.includes("ALTER TABLE sessions ADD COLUMN is_locked"))data.lockSchema=true;if(sql.includes("UPDATE participants SET username="))data.participants.forEach(p=>{if(!p.username)p.username="LM-"+p.id.replace(/-/g,"").slice(0,12).toUpperCase()});return {success:true}},bind(...args){
     return {
       async first(){
         if(sql.includes("SELECT active_stage"))return {active_stage:data.stage};
          if(sql.includes("SELECT is_locked FROM sessions"))return {is_locked:data.locked?1:0};
         if(sql.includes("SELECT camera_json")){
           if(!data.migrated)throw new Error("D1_ERROR: no such column: camera_json");
           return {camera_json:JSON.stringify(data.camera)};
         }
         if(sql.includes("COUNT(*) AS total"))return {total:data.participants.length};
         if(sql.includes("WHERE token_hash=?"))return data.participants.find(p=>p.token_hash===args[0])||null;
         if(sql.includes("WHERE session_id=? AND username=?")){const p=data.participants.find(p=>p.session_id===args[0]&&p.username===args[1]);return p?{id:p.id,username:p.username,name:p.name,school:p.school,className:p.class_name}:null}
         if(sql.includes("SELECT id FROM participants WHERE id=?"))return data.participants.find(p=>p.id===args[0])||null;
         if(sql.includes("SELECT failures"))return data.loginAttempts.get(args[0])||null;
         return null;
       },
       async all(){
         if(sql.includes("PRAGMA table_info(participants)"))return {results:data.usernameSchema?[{name:"id"},{name:"username"}]:[{name:"id"}]};
         if(sql.includes("SELECT stage,payload FROM answers WHERE participant_id=?"))return {results:data.answers.filter(a=>a.participant_id===args[0]).map(a=>({stage:a.stage,payload:a.payload}))};
         if(sql.includes("FROM participants WHERE session_id=?"))return {results:data.participants.map(p=>({id:p.id,username:p.username,name:p.name,school:p.school,className:p.class_name}))};
         if(sql.includes("FROM answers a JOIN participants"))return {results:data.answers};
         return {results:[]};
       },
       async run(){
         if(sql.includes("INSERT INTO participants")){
           const [id,session_id,name,school,class_name,token_hash,username,created_at]=args;
           data.participants.push({id,session_id,name,school,class_name,token_hash,username,created_at});
         }
         if(sql.includes("ALTER TABLE participants ADD COLUMN username"))data.usernameSchema=true;
         if(sql.includes("UPDATE participants SET username="))data.participants.forEach(p=>{if(!p.username)p.username="LM-"+p.id.replace(/-/g,"").slice(0,12).toUpperCase()});
         if(sql.includes("UPDATE participants SET username=?")){const p=data.participants.find(x=>x.id===args[1]);if(p)p.username=args[0]}
          if(sql.includes("UPDATE participants SET token_hash=")){const p=data.participants.find(x=>x.id===args[1]);if(p)p.token_hash=args[0]}
         if(sql.includes("UPDATE participants SET name=")){const p=data.participants.find(x=>x.id===args[4]);if(p){p.name=args[0];p.school=args[1];p.class_name=args[2];p.username=args[3]}}
         if(sql.includes("DELETE FROM answers WHERE participant_id"))data.answers=data.answers.filter(a=>a.participant_id!==args[0]);
         if(sql.includes("DELETE FROM participants WHERE id="))data.participants=data.participants.filter(p=>p.id!==args[0]);
         if(sql.includes("UPDATE sessions SET is_locked="))data.locked=!!args[0];
          if(sql.includes("UPDATE sessions SET active_stage"))data.stage=args[0];
         if(sql.includes("UPDATE sessions SET camera_json")){
           if(!data.migrated)throw new Error("D1_ERROR: no such column: camera_json");
           if(sql.includes("'$.view'"))data.camera={...data.camera,view:args[0],slide:args[1]};
           else if(sql.includes("'$.a'"))data.camera={...data.camera,a:args[0],s:args[1],i:args[2]};
           else data.camera=JSON.parse(args[0]);
         }
         if(sql.includes("INSERT INTO answers")){
           const [participant_id,stage,payload]=args;
           const found=data.answers.find(x=>x.participant_id===participant_id&&x.stage===stage);
           if(found)found.payload=payload;else data.answers.push({participant_id,stage,payload});
         }
         if(sql.includes("INSERT INTO login_attempts")){
           const [id,now]=args;
           data.loginAttempts.set(id,{failures:(data.loginAttempts.get(id)?.failures||0)+1,window_start:now});
         }
         if(sql.includes("DELETE FROM login_attempts"))data.loginAttempts.delete(args[0]);
         return {success:true};
       }
     }
   }}
 }};
 return {DB,TRAINER_PIN:"trainer-12345",MENTOR_PIN:"mentor-67890",SESSION_SECRET:"a-long-and-random-test-only-secret-1234567890",ASSETS:{fetch:async()=>new Response("static")},_data:data};
}
async function call(env,path,method="GET",payload,token){
 const headers={};
 if(payload!==undefined)headers["Content-Type"]="application/json";
 if(token)headers.Authorization=`Bearer ${token}`;
 const res=await handler.fetch(new Request("https://studio.test"+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload)}),env);
 return {status:res.status,data:res.headers.get("Content-Type")?.includes("json")?await res.json():await res.text()};
}
test("sesi dibuka pada orientasi dan pendaftaran menyimpan sekolah serta kelas",async()=>{
 const env=mockEnv();
 const initial=await call(env,"/lensa-muda/api/state");
 assert.equal(initial.status,200);assert.equal(initial.data.stage,0);
 const reg=await call(env,"/lensa-muda/api/participants","POST",{name:"Sari",school:"SMA Negeri 1",className:"XI B",username:"sari"});
 assert.equal(reg.status,201);assert.equal(reg.data.user.school,"SMA Negeri 1");assert.equal(reg.data.user.className,"XI B");
 const status=await call(env,"/lensa-muda/api/state");assert.equal(status.data.count,1);
});
test("trainer mengatur tahap; peserta mengirim story sembilan frame unik; mentor hanya membaca",async()=>{
 const env=mockEnv();
 const reg=await call(env,"/api/participants","POST",{name:"Rani",school:"SMK Contoh",className:"XII",username:"rani"});
 const p=reg.data.user.token;
 const denied=await call(env,"/api/login","POST",{pin:"salah"});
 assert.equal(denied.status,401);
 const trainer=await call(env,"/api/login","POST",{pin:"trainer-12345"});
 assert.equal(trainer.status,200);
 const mentor=await call(env,"/api/login","POST",{pin:"mentor-67890"});
 assert.equal(mentor.data.role,"mentor");
 const invalidMentor=await call(env,"/api/state","PUT",{stage:4},mentor.data.token);
 assert.equal(invalidMentor.status,403);
 const locked=await call(env,"/api/answers/story","PUT",{selected:[1,2,3,4,5,6,7,8,9]},p);
 assert.equal(locked.status,403);
 const change=await call(env,"/lensa-muda/api/state","PUT",{stage:4},trainer.data.token);
 assert.equal(change.status,200);
 const badStory=await call(env,"/api/answers/story","PUT",{selected:[1,1,2,3,4,5,6,7,8]},p);
 assert.equal(badStory.status,400);
 const saved=await call(env,"/lensa-muda/api/answers/story","PUT",{selected:[1,2,3,4,5,6,7,8,9]},p);
 assert.equal(saved.status,200);
 const dashboard=await call(env,"/api/dashboard","GET",undefined,trainer.data.token);
 assert.equal(dashboard.data.count,1);
 assert.equal(dashboard.data.participants[0].done,1);
 assert.deepEqual(dashboard.data.participants[0].answers.story.selected,[1,2,3,4,5,6,7,8,9]);
});
test("peragaan kamera disimpan untuk LCD; mentor dan peserta tidak boleh mengubah",async()=>{
 const env=mockEnv();
 const initial=await call(env,"/lensa-muda/api/state");
 assert.deepEqual(initial.data.camera,{a:1,s:3,i:1});
 const trainer=(await call(env,"/lensa-muda/api/login","POST",{pin:"trainer-12345"})).data;
 const mentor=(await call(env,"/lensa-muda/api/login","POST",{pin:"mentor-67890"})).data;
 const unauthorized=await call(env,"/lensa-muda/api/demo-camera","PUT",{a:0,s:5,i:2});
 assert.equal(unauthorized.status,401);
 const forbidden=await call(env,"/lensa-muda/api/demo-camera","PUT",{a:0,s:5,i:2},mentor.token);
 assert.equal(forbidden.status,403);
 const invalid=await call(env,"/lensa-muda/api/demo-camera","PUT",{a:1,s:7,i:1},trainer.token);
 assert.equal(invalid.status,400);
 const saved=await call(env,"/lensa-muda/api/demo-camera","PUT",{a:0,s:5,i:2},trainer.token);
 assert.equal(saved.status,200);
 const live=await call(env,"/lensa-muda/api/state");
 assert.deepEqual(live.data.camera,{a:0,s:5,i:2});
 const dashboard=await call(env,"/lensa-muda/api/dashboard","GET",undefined,mentor.token);
 assert.deepEqual(dashboard.data.camera,{a:0,s:5,i:2});
});
test("sebelum migrasi D1, kelas tetap dapat diakses dan API menampilkan petunjuk",async()=>{
 const env=mockEnv();
 env._data.migrated=false;
 const state=await call(env,"/lensa-muda/api/state");
 assert.equal(state.status,200);
 assert.deepEqual(state.data.camera,{a:1,s:3,i:1});
 const trainer=(await call(env,"/lensa-muda/api/login","POST",{pin:"trainer-12345"})).data;
 const result=await call(env,"/lensa-muda/api/demo-camera","PUT",{a:2,s:3,i:1},trainer.token);
 assert.equal(result.status,503);
 assert.match(result.data.error,/migrasi database/);
});

test("trainer mengendalikan 8 slide teori dan beralih ke simulator tanpa menghapus pengaturan kamera",async()=>{
 const env=mockEnv();
 const original=await call(env,"/lensa-muda/api/state");
 assert.deepEqual(original.data.presentation,{view:"theory",slide:0});
 const trainer=(await call(env,"/lensa-muda/api/login","POST",{pin:"trainer-12345"})).data;
 const mentor=(await call(env,"/lensa-muda/api/login","POST",{pin:"mentor-67890"})).data;
 const forbidden=await call(env,"/lensa-muda/api/presentation","PUT",{view:"theory",slide:2},mentor.token);
 assert.equal(forbidden.status,403);
 const invalid=await call(env,"/lensa-muda/api/presentation","PUT",{view:"theory",slide:32},trainer.token);
 assert.equal(invalid.status,400);
 const detailSlide=await call(env,"/lensa-muda/api/presentation","PUT",{view:"theory",slide:20},trainer.token);
 assert.equal(detailSlide.status,200);
 const compSlide=await call(env,"/lensa-muda/api/presentation","PUT",{view:"theory",slide:31},trainer.token);
 assert.equal(compSlide.status,200);
 assert.deepEqual((await call(env,"/api/state")).data.presentation,{view:"theory",slide:31});
 const presentation=await call(env,"/lensa-muda/api/presentation","PUT",{view:"theory",slide:4},trainer.token);
 assert.equal(presentation.status,200);
 assert.deepEqual((await call(env,"/lensa-muda/api/state")).data.presentation,{view:"theory",slide:4});
 const camera=await call(env,"/lensa-muda/api/demo-camera","PUT",{a:2,s:0,i:4},trainer.token);
 assert.equal(camera.status,200);
 assert.deepEqual((await call(env,"/lensa-muda/api/state")).data.presentation,{view:"theory",slide:4});
 assert.deepEqual((await call(env,"/lensa-muda/api/state")).data.camera,{a:2,s:0,i:4});
 const switched=await call(env,"/lensa-muda/api/presentation","PUT",{view:"simulator",slide:4},trainer.token);
 assert.equal(switched.status,200);
 assert.deepEqual((await call(env,"/lensa-muda/api/state")).data.presentation,{view:"simulator",slide:4});
 const dash=await call(env,"/lensa-muda/api/dashboard","GET",undefined,trainer.token);
 assert.deepEqual(dash.data.presentation,{view:"simulator",slide:4});
 assert.deepEqual(dash.data.camera,{a:2,s:0,i:4});
});

test("PIN benar tetap diterima setelah percobaan gagal mencapai ambang pembatasan",async()=>{
 const env=mockEnv();
 for(let i=0;i<9;i++){
   const bad=await call(env,"/lensa-muda/api/login","POST",{pin:"0000"});
   assert.equal(bad.status,i<8?401:429);
 }
 const valid=await call(env,"/lensa-muda/api/login","POST",{pin:"trainer-12345"});
 assert.equal(valid.status,200);
 assert.equal(valid.data.role,"trainer");
 const dashboard=await call(env,"/lensa-muda/api/dashboard","GET",undefined,valid.data.token);
 assert.equal(dashboard.status,200);
});

test("username pilihan peserta memungkinkan login ulang dan memulihkan progres",async()=>{
 const env=mockEnv();
 const reg=await call(env,"/api/participants","POST",{name:"Lia",school:"SMA 1",className:"XI",username:"lia"});
 assert.equal(reg.status,201);
 assert.equal(reg.data.user.username,"lia");
 const trainer=(await call(env,"/api/login","POST",{pin:"trainer-12345"})).data;
 await call(env,"/api/state","PUT",{stage:1},trainer.token);
 const saved=await call(env,"/api/answers/kamera","PUT",{a:0,s:3,i:2},reg.data.user.token);
 assert.equal(saved.status,200);
 const bad=await call(env,"/api/participant-login","POST",{username:"LM-AAAAAAAAAAAA"});
 assert.equal(bad.status,401);
 const login=await call(env,"/api/participant-login","POST",{username:reg.data.user.username});
 assert.equal(login.status,200);
 assert.equal(login.data.user.id,reg.data.user.id);
 const me=await call(env,"/api/me","GET",undefined,login.data.user.token);
 assert.deepEqual(me.data.answers.kamera,{a:0,s:3,i:2});
 const stale=await call(env,"/api/me","GET",undefined,reg.data.user.token);
 assert.equal(stale.status,401);
});
test("hanya trainer dapat mengedit atau menghapus peserta dan jawabannya",async()=>{
 const env=mockEnv();
 const reg=(await call(env,"/api/participants","POST",{name:"Nina",school:"SMK 1",className:"X",username:"nina"})).data.user;
 const trainer=(await call(env,"/api/login","POST",{pin:"trainer-12345"})).data;
 const mentor=(await call(env,"/api/login","POST",{pin:"mentor-67890"})).data;
 const path="/api/participants/"+reg.id;
 assert.equal((await call(env,path,"DELETE")).status,401);
 assert.equal((await call(env,path,"DELETE",undefined,mentor.token)).status,403);
 const edit=await call(env,path,"PATCH",{name:"Nina Baru",school:"SMK 2",className:"XI",username:"nina"},trainer.token);
 assert.equal(edit.status,200);
 const dash=await call(env,"/api/dashboard","GET",undefined,trainer.token);
 assert.equal(dash.data.participants[0].name,"Nina Baru");
 assert.equal(dash.data.participants[0].username,reg.username);
 const del=await call(env,path,"DELETE",undefined,trainer.token);
 assert.equal(del.status,200);
 assert.equal((await call(env,"/api/state")).data.count,0);
 assert.equal((await call(env,"/api/me","GET",undefined,reg.token)).status,401);
});


test("migrasi username memberi akun peserta lama tanpa menghapus jawaban",async()=>{
 const env=mockEnv();
 const id="12345678-1234-4234-8234-123456789abc";
 env._data.participants.push({id,session_id:"lensa-muda-2026",name:"Peserta Lama",school:"SMA Lama",class_name:"X",token_hash:"old-token",created_at:"2026-11-12T10:00:00Z"});
 env._data.answers.push({participant_id:id,stage:"kamera",payload:JSON.stringify({a:3,s:2,i:4})});
 const trainer=(await call(env,"/api/login","POST",{pin:"trainer-12345"})).data;
 const dash=await call(env,"/api/dashboard","GET",undefined,trainer.token);
 assert.equal(dash.status,200);
 assert.equal(dash.data.count,1);
 assert.match(dash.data.participants[0].username,/^LM-[A-F0-9]{12}$/);
 assert.equal(dash.data.participants[0].done,1);
 const login=await call(env,"/api/participant-login","POST",{username:dash.data.participants[0].username});
 assert.equal(login.status,200);
 const me=await call(env,"/api/me","GET",undefined,login.data.user.token);
 assert.deepEqual(me.data.answers.kamera,{a:3,s:2,i:4});
 assert.equal(env._data.participants.length,1);
 assert.equal(env._data.answers.length,1);
});

test("kelas terkunci tidak menerima login pendaftaran dan jawaban, trainer bisa membuka",async()=>{
 const env=mockEnv();
 const reg=await call(env,"/api/participants","POST",{name:"Budi",school:"SMA 1",className:"X",username:"budi"});
 assert.equal(reg.status,201);
 const trainer=(await call(env,"/api/login","POST",{pin:"trainer-12345"})).data;
 const mentor=(await call(env,"/api/login","POST",{pin:"mentor-67890"})).data;
 assert.equal((await call(env,"/api/class-lock","PUT",{locked:true},mentor.token)).status,403);
 const lock=await call(env,"/api/class-lock","PUT",{locked:true},trainer.token);
 assert.equal(lock.status,200);
 assert.equal((await call(env,"/api/state")).data.locked,true);
 assert.equal((await call(env,"/api/participants","POST",{name:"Ayu",school:"SMA",className:"XI",username:"ayu"})).status,423);
 assert.equal((await call(env,"/api/participant-login","POST",{username:"budi"})).status,423);
 assert.equal((await call(env,"/api/answers/kamera","PUT",{a:1,s:3,i:1},reg.data.user.token)).status,423);
 assert.equal((await call(env,"/api/dashboard","GET",undefined,trainer.token)).status,200);
 assert.equal((await call(env,"/api/class-lock","PUT",{locked:false},trainer.token)).status,200);
 assert.equal((await call(env,"/api/state")).data.locked,false);
 assert.equal((await call(env,"/api/participant-login","POST",{username:"budi"})).status,200);
});
test("trainer dapat menambahkan peserta dan peserta lama dapat memilih username sendiri",async()=>{
 const env=mockEnv();
 const trainer=(await call(env,"/api/login","POST",{pin:"trainer-12345"})).data;
 const mentor=(await call(env,"/api/login","POST",{pin:"mentor-67890"})).data;
 const payload={name:"Nusa",school:"SMK",className:"XI",username:"nusa"};
 assert.equal((await call(env,"/api/trainer/participants","POST",payload,mentor.token)).status,403);
 const added=await call(env,"/api/trainer/participants","POST",payload,trainer.token);
 assert.equal(added.status,201);
 const change=await call(env,"/api/me/username","PATCH",{username:"nusaku"},added.data.user.token);
 assert.equal(change.status,200);
 assert.equal(change.data.username,"nusaku");
 assert.equal((await call(env,"/api/participant-login","POST",{username:"nusaku"})).status,200);
 assert.equal((await call(env,"/api/participants","POST",payload)).status,201);
});
