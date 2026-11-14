/**
 * Local-only HTTP load smoke test. Never point this at production.
 * Run against Wrangler --local and a disposable local D1 database.
 */
import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";

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

const timings=iterations.slice().sort((a,b)=>a-b);
const percentile=p=>Number(timings[Math.min(timings.length-1,Math.ceil(p*timings.length)-1)].toFixed(0));
const elapsed=Math.round(performance.now()-ab);
const report={target:"localhost only",parallel:students,registered:students,failed:bad.length,httpStatuses:Object.fromEntries(statuses),elapsedMs:elapsed,responseTimeMs:{p50:percentile(.5),p95:percentile(.95),max:percentile(1)},checks:["70 registrations","70 unique IDs and tokens","counter equals 70","duplicate username returns 409","relogin without extra account","48+22 roster pagination","registration slide restore"]};
console.log("LOAD TEST RESULT",JSON.stringify(report,null,2));
