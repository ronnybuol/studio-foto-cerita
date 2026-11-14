/**
 * Local-only HTTP load smoke test. Never point this at production.
 * Run against Wrangler --local and a disposable local D1 database.
 */
import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
import {COMPOSITION_START} from "../public/composition.js";
import {EDFAT_START} from "../public/edfat.js";
import {STORY_START} from "../public/story.js";
import {CAPTION_START} from "../public/caption.js";
import {ETHICS_START} from "../public/ethics.js";

const base = process.env.LOAD_TEST_BASE || "http://127.0.0.1:8787";
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(base)) {
  throw new Error("Safety stop: load test accepts localhost/127.0.0.1 only.");
}
const root=base.replace(/\/$/,"")+"/lensa-muda/api";
const students=70;
const iterations=[];
const ab=performance.now();
const statuses=new Map();
const letters=n=>{
 let x=n+1,out="";
 do{out=String.fromCharCode(97+(x-1)%26)+out;x=Math.floor((x-1)/26)}while(x>0);
 return out;
};
async function api(path,{method="GET",payload,token}={}){
 const headers={"Accept":"application/json"};
 if(payload!==undefined)headers["Content-Type"]="application/json";
 if(token)headers.Authorization="Bearer "+token;
 const start=performance.now();
 try{
  const res=await fetch(root+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
  const data=await res.json();
  const ms=performance.now()-start;
  return {status:res.status,data,ms};
 }catch(error){return {status:0,data:{error:String(error)},ms:performance.now()-start}}
}
async function requireStatus(result,expected,label){
 assert.equal(result.status,expected,label+": "+JSON.stringify(result.data));
}
const before=await api("/state");
await requireStatus(before,200,"initial stage");
assert.equal(before.data.stage,0,"disposable D1 should start in orientation stage 00");
assert.equal(before.data.count,0,"disposable D1 should be empty");
console.log("TEST TARGET:",base,"| REGISTRATIONS:",students,"| STARTING COUNT:",before.data.count);

const registration=await Promise.all(Array.from({length:students},async(_,index)=>{
 const ident=letters(index);
 const payload={name:"Peserta Simulasi "+(index+1),school:"Sekolah Uji Beban",className:"XI Simulasi",username:"simulasi"+ident};
 const result=await api("/participants",{method:"POST",payload});
 iterations.push(result.ms);
 statuses.set(result.status,(statuses.get(result.status)||0)+1);
 return {index,payload,result};
}));
const bad=registration.filter(x=>x.result.status!==201);
if(bad.length)console.log("REGISTRATION FAILURES (first 10):",JSON.stringify(bad.slice(0,10).map(x=>({user:x.payload.username,status:x.result.status,body:x.result.data}))));
assert.equal(bad.length,0,"all 70 concurrent simulated participants must register successfully");
const ids=registration.map(x=>x.result.data?.user?.id);
assert.equal(new Set(ids).size,students,"each simulated participant must receive a distinct id");
const tokens=registration.map(x=>x.result.data?.user?.token);
assert.equal(new Set(tokens).size,students,"each simulated participant must receive a distinct login token");
const after=await api("/state");
await requireStatus(after,200,"counter");
assert.equal(after.data.count,students,"live LCD registration counter must show 70");

const duplicates=await Promise.all([0,1,2].map(async i=>api("/participants",{method:"POST",payload:registration[i].payload})));
for(const duplicate of duplicates)assert.equal(duplicate.status,409,"duplicate username must be rejected");
const afterDuplicates=await api("/state");
assert.equal(afterDuplicates.data.count,students,"duplicate usernames must not increase counter");

const logins=await Promise.all(registration.filter((_,i)=>i%7===0).map(x=>api("/participant-login",{method:"POST",payload:{username:x.payload.username}})));
for(const login of logins)assert.equal(login.status,200,"existing user should login again");
const afterLogins=await api("/state");
assert.equal(afterLogins.data.count,students,"login should not duplicate account");

const trainer=await api("/login",{method:"POST",payload:{pin:"local-trainer-12345"}});
await requireStatus(trainer,200,"trainer auth");
const token=trainer.data.token;
const roster=await api("/orientation",{method:"PUT",payload:{screen:"roster",page:0},token});
await requireStatus(roster,200,"roster page one");
const pageOne=await api("/state");
assert.equal(pageOne.data.roster,true,"LCD must be in roster mode");
assert.equal(pageOne.data.rosterNames.length,48,"first roster page should contain 48 names");
const next=await api("/orientation",{method:"PUT",payload:{screen:"roster",page:1},token});
await requireStatus(next,200,"roster page two");
const pageTwo=await api("/state");
assert.equal(pageTwo.data.rosterNames.length,22,"second roster page should contain remaining 22 names");
assert.equal(pageTwo.data.count,70,"roster paging must preserve live count");
assert.ok(pageTwo.data.rosterNames.every(s=>s.startsWith("Peserta Simulasi")),"roster should display only sample participant names");
const registrationSlide=await api("/orientation",{method:"PUT",payload:{screen:"registration"},token});
await requireStatus(registrationSlide,200,"return to registration");
const orientationState=await api("/state");
assert.equal(orientationState.data.orientation,true,"registration slide must reactivate");

// Login checks above rotate tokens; always use the latest token for each account.
const currentTokens=new Map(registration.map(x=>[x.result.data.user.id,x.result.data.user.token]));
for(const login of logins)currentTokens.set(login.data.user.id,login.data.user.token);
await requireStatus(await api("/state",{method:"PUT",payload:{stage:6},token}),200,"open answer modules");
const savedAnswers=await Promise.all(registration.map(x=>api("/answers/kamera",{method:"PUT",token:currentTokens.get(x.result.data.user.id),payload:{a:1,s:3,i:1,_clientRevision:200}})));
for(const answer of savedAnswers)await requireStatus(answer,200,"70 simultaneous answer submissions");
const sampleToken=currentTokens.get(registration[0].result.data.user.id);
await requireStatus(await api("/answers/kamera",{method:"PUT",token:sampleToken,payload:{a:6,s:6,i:6,_clientRevision:100}}),409,"late old answer must be rejected");
const recovered=await api("/me",{token:sampleToken});
await requireStatus(recovered,200,"answer recovery");
assert.equal(recovered.data.answers.kamera.a,1,"late old answer must not overwrite latest result");
assert.equal(recovered.data.answers.kamera._clientRevision,200,"latest revision must survive");
const dashboard=await api("/dashboard",{token});await requireStatus(dashboard,200,"trainer answer dashboard");
assert.equal(dashboard.data.participants.filter(p=>p.answers.kamera?._clientRevision===200).length,70,"trainer sees all 70 submitted results");
const firstSlides=[0,0,COMPOSITION_START,EDFAT_START,STORY_START,CAPTION_START,ETHICS_START],controlBase=Date.now();
for(let stage=1;stage<=6;stage++){
 await requireStatus(await api("/state",{method:"PUT",payload:{stage,controlRevision:controlBase+stage*10},token}),200,"atomic stage change "+stage);
 const projected=await api("/state");await requireStatus(projected,200,"LCD stage snapshot");
 assert.equal(projected.data.stage,stage,"LCD stage agrees with trainer");
 assert.equal(projected.data.presentation.view,"theory","new module starts with theory");
 assert.equal(projected.data.presentation.slide,firstSlides[stage],"new module starts at its correct first slide");
}
await requireStatus(await api("/state",{method:"PUT",payload:{stage:1,controlRevision:controlBase+5},token}),409,"late old stage must be rejected");
await requireStatus(await api("/presentation",{method:"PUT",payload:{stage:1,view:"theory",slide:0,controlRevision:controlBase+100},token}),409,"old-module slide must not overwrite current module");
const afterLateControl=await api("/state");assert.equal(afterLateControl.data.stage,6);assert.equal(afterLateControl.data.presentation.slide,51);
await requireStatus(await api("/state",{method:"PUT",payload:{stage:0},token}),200,"restore test orientation stage");
await requireStatus(await api("/orientation",{method:"PUT",payload:{screen:"guide"},token}),200,"orientation participant guide");
const guideState=await api("/state");
await requireStatus(guideState,200,"guide visible in LCD state");
assert.equal(guideState.data.participantGuide,true,"guide must be visible in LCD");
assert.equal(guideState.data.orientation,false,"registration screen must turn off when guide is shown");
assert.equal(guideState.data.count,70,"guide must not create any participants");
await requireStatus(await api("/orientation",{method:"PUT",payload:{screen:"registration"},token}),200,"restore test registration slide");
const restoredRegistration=await api("/state");assert.equal(restoredRegistration.data.orientation,true);assert.equal(restoredRegistration.data.participantGuide,false);

const timings=iterations.slice().sort((a,b)=>a-b);
const percentile=p=>Number(timings[Math.min(timings.length-1,Math.ceil(p*timings.length)-1)].toFixed(0));
const elapsed=Math.round(performance.now()-ab);
const report={target:"localhost only",parallel:students,registered:students,failed:bad.length,httpStatuses:Object.fromEntries(statuses),elapsedMs:elapsed,responseTimeMs:{p50:percentile(.5),p95:percentile(.95),max:percentile(1)},checks:["70 registrations","70 unique IDs and tokens","counter equals 70","duplicate username returns 409","relogin without extra account","48+22 roster pagination","70 concurrent answer saves","late old write rejected","answer recovery","70 results visible to trainer","atomic trainer-LCD stages 01-06","late stage and old-module slides rejected","guide display without new participants","registration slide restore"]};
console.log("LOAD TEST RESULT",JSON.stringify(report,null,2));
