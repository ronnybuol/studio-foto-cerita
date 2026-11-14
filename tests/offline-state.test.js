import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {singleFlight,validClassSnapshot} from "../public/connection.js";
const source=readFileSync(new URL("../public/app.js",import.meta.url),"utf8");
const syncCode=source.slice(source.indexOf('const PUBLIC_BASE ='),source.indexOf('function pageMode('));
const unlockedCode=source.slice(source.indexOf('function isUnlocked('),source.indexOf('function lessonLayout('));
function setup(){
 const banner={},storage=new Map();
 const state={online:true,hasClassState:true,demoMode:false,serverStage:2,count:4,locked:false,user:{id:"alice",token:"token"},
  work:{caption:{captionText:"keep my draft",_draft:true}},presentation:{view:"theory",slide:30}};
 const c={state,singleFlight,validClassSnapshot,STORAGE_CLASS:"class",ETHICS_END:56,
  localStorage:{setItem:(key,value)=>storage.set(key,value)},$:()=>banner,pageMode:()=>"peserta",participantReady:false,
  retryPendingAnswers(){},requestJSON:async()=>{throw Error("network down")},STAGES:[{key:"mulai"},{key:"kamera"},{key:"komposisi"},{key:"edfat"},{key:"story"},{key:"caption"},{key:"etika"}]};
 vm.createContext(c);vm.runInContext(syncCode+unlockedCode,c);return {c,banner,storage};
}
test("production offline retains identity, draft, last stage and locked modules",async()=>{
 const {c,banner}=setup();const before=JSON.stringify(c.state);
 assert.equal(await c.syncState(),false);
 assert.equal(c.state.online,false);assert.equal(c.state.serverStage,2);assert.equal(c.state.count,4);
 assert.equal(c.state.user.id,"alice");assert.equal(c.state.work.caption.captionText,"keep my draft");
 assert.equal(c.isUnlocked("kamera"),true);assert.equal(c.isUnlocked("caption"),false);
 assert.doesNotMatch(banner.textContent,/Mode demo/);assert.match(banner.textContent,/tahap terakhir/);
 c.state.online=true;assert.equal(JSON.stringify(c.state),before);
});
test("state requests coalesce and a late failing request cannot replace a newer success",async()=>{
 const {c,storage}=setup();let resolve,calls=0;
 c.requestJSON=()=>{calls++;return new Promise(r=>resolve=r)};
 const first=c.syncState();assert.equal(c.syncState(),first);await Promise.resolve();assert.equal(calls,1);
 resolve({stage:3,locked:false,count:70,presentation:{view:"theory",slide:35}});await first;
 assert.equal(c.state.serverStage,3);assert.equal(JSON.parse(storage.get("class")).stage,3);
 c.requestJSON=async()=>{throw Error("timeout")};await c.syncState();
 assert.equal(c.state.serverStage,3);assert.equal(c.state.count,70);
});
test("unknown production state cannot unlock modules and cached class lock stays closed offline",async()=>{
 const {c}=setup();c.state.hasClassState=false;c.state.serverStage=0;await c.syncState();
 assert.equal(c.isUnlocked("etika"),false);assert.equal(c.isUnlocked("kamera"),false);
 c.state.hasClassState=true;c.state.serverStage=6;c.state.locked=true;await c.syncState();
 assert.equal(c.isUnlocked("kamera"),false);
});
test("production cannot create a demo participant while the server is unavailable",async()=>{
 const {c}=setup();c.state.user=null;c.state.online=false;
 const button={disabled:false,textContent:""};let generated=0,message="";
 c.FormData=class{entries(){return Object.entries({name:"Peserta Uji",school:"Sekolah",className:"XI",username:"pesertauji"})}};
 c.crypto={randomUUID:()=>{generated++;return "demo"}};c.toast=value=>message=value;
 const start=source.indexOf("async function signup("),end=source.indexOf("function logout(",start);
 vm.runInContext(source.slice(start,end),c);
 await c.signup({preventDefault(){},currentTarget:{querySelector:()=>button}});
 assert.equal(c.state.user,null);assert.equal(generated,0);assert.equal(button.disabled,false);assert.match(message,/memerlukan koneksi kelas/);
});
test("trainer connection failure retains the last real dashboard instead of making sample data",async()=>{
 const {c}=setup();c.state.online=false;c.state.dashboard={stage:2,count:70,participants:[]};const real=c.state.dashboard;
 const start=source.indexOf("async function fetchDashboard("),end=source.indexOf("function trainerCameraPanel(",start);
 vm.runInContext(source.slice(start,end),c);await c.fetchDashboard();assert.equal(c.state.dashboard,real);
 c.state.dashboard=null;await assert.rejects(c.fetchDashboard(),/Koneksi kelas terputus/);assert.equal(c.state.dashboard,null);
});
test("automatic retry updates both the global notice and current exercise save status",()=>{
 const global={},detail={textContent:"Hasil belum diterima server"};
 const context={state:{active:"caption"},$:selector=>selector==="#answer-sync-status"?global:selector==="#caption-save-status"?detail:null};
 const start=source.indexOf("function paintAnswerStatus("),end=source.indexOf("function answerSaveMessage(",start);
 vm.runInNewContext(source.slice(start,end)+";paintAnswerStatus('Hasil sudah diterima server kelas.');",context);
 assert.equal(global.textContent,detail.textContent);assert.equal(global.hidden,false);
});
