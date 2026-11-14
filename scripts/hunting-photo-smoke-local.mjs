/**
 * Local-only smoke test for R2 + D1 photo foundation; no production traffic.
 */
import assert from "node:assert/strict";
const base=process.env.LOAD_TEST_BASE||"http://127.0.0.1:8787";
if(!/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(base))
 throw Error("Local test may only access localhost");
const root=base+"/lensa-muda/api";
async function call(path,{method="GET",token,payload,blob,headers={}}={}){
 const h={...headers};
 if(token)h.Authorization="Bearer "+token;
 if(payload!==undefined)h["Content-Type"]="application/json";
 const response=await fetch(root+path,{method,headers:h,body:blob??(payload===undefined?undefined:JSON.stringify(payload))});
 const type=response.headers.get("Content-Type")||"";
 return {status:response.status,data:type.includes("application/json")?await response.json():new Uint8Array(await response.arrayBuffer())};
}
const reg=await call("/participants",{method:"POST",payload:{name:"Foto Uji",school:"Sekolah Uji",className:"XI",username:"fotouji"}});
assert.equal(reg.status,201,JSON.stringify(reg.data));
const participant=reg.data.user;
const other=await call("/participants",{method:"POST",payload:{name:"Siswa Lain",school:"Sekolah Uji",className:"XI",username:"siswalain"}});
assert.equal(other.status,201,JSON.stringify(other.data));
const webp=new TextEncoder().encode("RIFF1234WEBPVP8 example-test-payload-not-a-real-image");
const upload=(token=participant.token,slot=1,data=webp,headers={})=>call("/hunting/photos/"+slot,{method:"PUT",token,blob:data,
 headers:{"Content-Type":"image/webp","X-Photo-Width":"1200","X-Photo-Height":"800",...headers}});
assert.equal((await upload()).status,403,"upload blocked before EDFAT stage");
const login=await call("/login",{method:"POST",payload:{pin:"local-trainer-12345"}});
assert.equal(login.status,200,JSON.stringify(login.data));
const opened=await call("/state",{method:"PUT",token:login.data.token,payload:{stage:3}});
assert.equal(opened.status,200,JSON.stringify(opened.data));
assert.equal((await call("/hunting/photos")).status,401,"anonymous cannot list");
assert.equal((await upload(participant.token,13)).status,400,"slot 13 invalid");
assert.equal((await upload(participant.token,1,new TextEncoder().encode("not a WebP"))).status,415);
assert.equal((await upload(participant.token,1,webp,{"X-Photo-Width":"0"})).status,400);
assert.equal((await upload(participant.token,1,Uint8Array.from({length:2*1024*1024+1},()=>0))).status,413);
const saved=await upload();
assert.equal(saved.status,201,JSON.stringify(saved.data));
const list=await call("/hunting/photos",{token:participant.token});
assert.equal(list.status,200,JSON.stringify(list.data));
assert.equal(list.data.photos.length,1);
assert.equal(list.data.photos[0].slot,1);
assert.equal(list.data.photos[0].bytes,webp.length);
const fetched=await call("/hunting/photos/1",{token:participant.token});
assert.equal(fetched.status,200);
assert.deepEqual([...fetched.data],[...webp]);
assert.equal((await call("/hunting/photos/1",{token:other.data.user.token})).status,404,"photo belongs only to its owner");
assert.equal((await upload()).status,409,"cannot overwrite saved photo");
for(let slot=2;slot<=12;slot++)assert.equal((await upload(participant.token,slot)).status,201,"upload slot "+slot);
const complete=await call("/hunting/photos",{token:participant.token});
assert.equal(complete.data.photos.length,12);
console.log("PASS hunting upload: auth, 12 slots, R2 round-trip, D1 metadata, mime, limits, and stage gating.");
