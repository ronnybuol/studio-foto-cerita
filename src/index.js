const SESSION_ID = "lensa-muda-2026";
const ANSWER_KEYS = new Map([["kamera",1],["komposisi",2],["edfat",3],["story",4],["caption",5],["etika",6]]);
const encoder = new TextEncoder();
function output(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
function failure(message,status=400){return output({error:message},status)}
function b64url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function decodeB64Url(s){const str=s.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(str+"=".repeat((4-str.length%4)%4)),c=>c.charCodeAt(0))}
async function sha256(value){const h=await crypto.subtle.digest("SHA-256",encoder.encode(value));return b64url(new Uint8Array(h))}
async function hmac(secret,message){
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const raw=await crypto.subtle.sign("HMAC",key,encoder.encode(message));return b64url(new Uint8Array(raw));
}
function constantEqual(a,b){const x=encoder.encode(a),y=encoder.encode(b);let diff=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)diff|=(x[i]||0)^(y[i]||0);return diff===0}
async function makeToken(secret,role){
  const payload=b64url(encoder.encode(JSON.stringify({role,exp:Date.now()+12*60*60*1000,nonce:crypto.randomUUID()})));
  return payload+"."+await hmac(secret,payload);
}
async function verifyToken(secret,token){
  if(!token||!secret)return null;
  const [payload,signature,extra]=token.split(".");
  if(!payload||!signature||extra)return null;
  const expected=await hmac(secret,payload);
  if(!constantEqual(signature,expected))return null;
  try{const data=JSON.parse(new TextDecoder().decode(decodeB64Url(payload)));
    if(!["trainer","mentor"].includes(data.role)||typeof data.exp!=="number"||data.exp<Date.now())return null;
    return data;
  }catch{return null}
}
async function bodyJson(req){
  const raw=await req.text();
  if(raw.length>18000)throw new Error("Ukuran data terlalu besar");
  try{const obj=JSON.parse(raw);if(!obj||typeof obj!=="object"||Array.isArray(obj))throw Error();return obj}
  catch{throw new Error("Format JSON tidak valid")}
}
function norm(v,n){return typeof v==="string"?v.trim().replace(/\s+/g," ").slice(0,n):""}
function bearer(req){const h=req.headers.get("Authorization")||"";return h.startsWith("Bearer ")?h.slice(7).trim():""}
async function access(req,env){
  return verifyToken(env.SESSION_SECRET,bearer(req));
}
async function participant(req,env){
  const token=bearer(req);
  if(!token||token.length>150)return null;
  const hash=await sha256(token);
  return env.DB.prepare("SELECT id, name, school, class_name AS className FROM participants WHERE token_hash=? AND session_id=?").bind(hash,SESSION_ID).first();
}
async function stageState(env){
  const row=await env.DB.prepare("SELECT active_stage FROM sessions WHERE id=?").bind(SESSION_ID).first();
  if(!row)throw Error("Database belum disiapkan: jalankan schema.sql");
  return row.active_stage;
}
async function loginsTooMany(env,id){
  const row=await env.DB.prepare("SELECT failures, window_start FROM login_attempts WHERE id=?").bind(id).first();
  const now=Date.now();
  return !!row&&now-row.window_start<15*60*1000&&row.failures>=8;
}
async function recordBadLogin(env,id){
  const now=Date.now();
  await env.DB.prepare(`INSERT INTO login_attempts(id,failures,window_start) VALUES (?,1,?)
    ON CONFLICT(id) DO UPDATE SET failures=
      CASE WHEN ?-window_start>? THEN 1 ELSE failures+1 END,
      window_start=CASE WHEN ?-window_start>? THEN ? ELSE window_start END`)
      .bind(id,now,now,15*60*1000,now,15*60*1000,now).run();
}
async function clearBadLogin(env,id){await env.DB.prepare("DELETE FROM login_attempts WHERE id=?").bind(id).run()}
async function handleApi(req,env){
  if(!env.DB)return failure("Database D1 belum terpasang",503);
  const url=new URL(req.url),path=url.pathname,method=req.method;
  if(method==="GET"&&path==="/api/state"){
    const [stage,participants]=await Promise.all([stageState(env),env.DB.prepare("SELECT COUNT(*) AS total FROM participants WHERE session_id=?").bind(SESSION_ID).first()]);
    return output({stage,count:participants?.total||0,date:"2026-11-16",title:"Studio Foto Cerita — Lensa Muda"});
  }
  if(method==="POST"&&path==="/api/participants"){
    const data=await bodyJson(req),name=norm(data.name,90),school=norm(data.school,140),className=norm(data.className,30);
    if(name.length<2||!school||!className)return failure("Nama, asal sekolah, dan kelas wajib diisi");
    const id=crypto.randomUUID(),token=b64url(crypto.getRandomValues(new Uint8Array(32))),hash=await sha256(token);
    await env.DB.prepare("INSERT INTO participants(id,session_id,name,school,class_name,token_hash,created_at) VALUES(?,?,?,?,?,?,?)")
      .bind(id,SESSION_ID,name,school,className,hash,new Date().toISOString()).run();
    return output({user:{id,name,school,className,token}},201);
  }
  if(method==="GET"&&path==="/api/me"){
    const p=await participant(req,env);if(!p)return failure("Sesi peserta tidak valid",401);
    return output({user:p,stage:await stageState(env)});
  }
  if(method==="POST"&&path==="/api/login"){
    if(!env.TRAINER_PIN||!env.SESSION_SECRET)return failure("Konfigurasi autentikasi belum lengkap",503);
    const ip=req.headers.get("CF-Connecting-IP")||"local";
    const attemptId=await sha256(env.SESSION_SECRET+ip);
    if(await loginsTooMany(env,attemptId))return failure("Terlalu banyak percobaan login. Coba setelah 15 menit.",429);
    const data=await bodyJson(req),pin=typeof data.pin==="string"?data.pin:"";
    let role=null;
    if(pin&&constantEqual(pin,env.TRAINER_PIN))role="trainer";
    else if(pin&&env.MENTOR_PIN&&constantEqual(pin,env.MENTOR_PIN))role="mentor";
    if(!role){await recordBadLogin(env,attemptId);return failure("PIN tidak sesuai",401)}
    await clearBadLogin(env,attemptId);
    return output({role,token:await makeToken(env.SESSION_SECRET,role)});
  }
  if(method==="GET"&&path==="/api/dashboard"){
    const user=await access(req,env);if(!user)return failure("Autentikasi trainer diperlukan",401);
    const [stage,rows,answers]=await Promise.all([
      stageState(env),
      env.DB.prepare("SELECT id,name,school,class_name AS className FROM participants WHERE session_id=? ORDER BY created_at ASC").bind(SESSION_ID).all(),
      env.DB.prepare("SELECT a.participant_id,a.stage,a.payload FROM answers a JOIN participants p ON p.id=a.participant_id WHERE p.session_id=?").bind(SESSION_ID).all()
    ]);
    const map=new Map((rows.results||[]).map(row=>[row.id,{...row,done:0,answers:{}}]));
    for(const record of answers.results||[]){
      const target=map.get(record.participant_id);
      if(target){target.done++;try{target.answers[record.stage]=JSON.parse(record.payload)}catch{}}
    }
    return output({stage,count:map.size,participants:[...map.values()],role:user.role});
  }
  if(method==="PUT"&&path==="/api/state"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer yang boleh mengubah tahap",403);
    const data=await bodyJson(req);
    if(!Number.isInteger(data.stage)||data.stage<0||data.stage>6)return failure("Tahap tidak valid");
    await env.DB.prepare("UPDATE sessions SET active_stage=?,updated_at=? WHERE id=?")
      .bind(data.stage,new Date().toISOString(),SESSION_ID).run();
    return output({stage:data.stage,ok:true});
  }
  if(method==="PUT"&&path.startsWith("/api/answers/")){
    const key=decodeURIComponent(path.slice("/api/answers/".length));
    const index=ANSWER_KEYS.get(key);
    if(!index)return failure("Modul tidak dikenal",404);
    const p=await participant(req,env);if(!p)return failure("Sesi peserta tidak valid. Daftar ulang jika perlu.",401);
    const stage=await stageState(env);
    if(index>stage)return failure("Tahap ini belum dibuka trainer",403);
    const data=await bodyJson(req);
    if(key==="story"){
      if(!Array.isArray(data.selected)||data.selected.length!==9||new Set(data.selected).size!==9||data.selected.some(n=>!Number.isInteger(n)||n<1||n>12))return failure("Pilih 9 foto latihan yang berbeda");
    }
    if(key==="caption"&&typeof data.captionText!=="string")return failure("Caption harus berupa teks");
    const payload=JSON.stringify(data);
    if(payload.length>16000)return failure("Jawaban terlalu panjang");
    await env.DB.prepare(`INSERT INTO answers(participant_id,stage,payload,updated_at)
      VALUES(?,?,?,?) ON CONFLICT(participant_id,stage)
      DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at`)
      .bind(p.id,key,payload,new Date().toISOString()).run();
    return output({ok:true,stage:key});
  }
  return failure("Endpoint tidak ditemukan",404);
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(!url.pathname.startsWith("/api/"))return env.ASSETS.fetch(request);
    try{return await handleApi(request,env)}
    catch(err){console.error("API error:",err?.message||"unknown");return failure(err?.message==="Format JSON tidak valid"||err?.message==="Ukuran data terlalu besar"?err.message:"Layanan sedang mengalami gangguan",500)}
  }
};