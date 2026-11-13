const SESSION_ID = "lensa-muda-2026";
const PUBLIC_BASE = "/lensa-muda";
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
function newUsername(){return "LM-"+Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>b.toString(16).padStart(2,"0")).join("").toUpperCase()}
function cleanUsername(v){return typeof v==="string"?v.trim():""}
function validUsername(v){return /^[a-z]{3,20}$/.test(v)}
function isLegacyUsername(v){return /^LM-[A-F0-9]{12}$/.test(v)}
function usernameConflict(error){return /UNIQUE constraint failed: participants.username|idx_participants_username/i.test(String(error))}
function validParticipantData(v){
 const name=norm(v.name,90),school=norm(v.school,140),className=norm(v.className,30),username=cleanUsername(v.username);
 return {name,school,className,username,valid:name.length>=2&&!!school&&!!className&&validUsername(username)};
}
function missingUsernameColumn(error){return /no such column:\s*username|has no column named username/i.test(String(error?.message))}

function bearer(req){const h=req.headers.get("Authorization")||"";return h.startsWith("Bearer ")?h.slice(7).trim():""}
async function access(req,env){
  return verifyToken(env.SESSION_SECRET,bearer(req));
}
async function participant(req,env){
  const token=bearer(req);
  if(!token||token.length>150)return null;
  const hash=await sha256(token);
  return env.DB.prepare("SELECT id, username, name, school, class_name AS className FROM participants WHERE token_hash=? AND session_id=?").bind(hash,SESSION_ID).first();
}
async function stageState(env){
  const row=await env.DB.prepare("SELECT active_stage FROM sessions WHERE id=?").bind(SESSION_ID).first();
  if(!row)throw Error("Database belum disiapkan: jalankan schema.sql");
  return row.active_stage;
}
const DEFAULT_CAMERA = Object.freeze({a:1,s:3,i:1});
const DEFAULT_PRESENTATION = Object.freeze({view:"theory",slide:0});
function presentationFromCamera(value){
  return {view:value?.view==="simulator"?"simulator":"theory",slide:Number.isInteger(value?.slide)&&value.slide>=0&&value.slide<=20?value.slide:0};
}
function validCamera(value){
  return value&&typeof value==="object"&&!Array.isArray(value)
    &&["a","s","i"].every(k=>Number.isInteger(value[k])&&value[k]>=0&&value[k]<=6);
}
async function liveCamera(env){
  try{
    const row=await env.DB.prepare("SELECT camera_json FROM sessions WHERE id=?").bind(SESSION_ID).first();
    const data=JSON.parse(row?.camera_json||"null");
    return validCamera(data)?data:{...DEFAULT_CAMERA};
  }catch(error){
    // Jalur lama tetap dapat dipakai sampai migrasi D1 dilaksanakan.
    if(/no such column:\s*camera_json/i.test(String(error?.message)))return {...DEFAULT_CAMERA};
    throw error;
  }
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
const verifiedUsernameDatabases=new WeakSet();
async function ensureUsernameSchema(env){
  if(verifiedUsernameDatabases.has(env.DB))return;
  // Migrasi aditif: aman bila Worker baru aktif sebelum migrasi manual D1.
  const schema=await env.DB.prepare("PRAGMA table_info(participants)").all();
  const columns=schema.results||[];
  if(!columns.some(c=>c.name==="username")){
    try{await env.DB.prepare("ALTER TABLE participants ADD COLUMN username TEXT").run()}
    catch(error){if(!/duplicate column name:\s*username/i.test(String(error)))throw error}
  }
  await env.DB.prepare("UPDATE participants SET username='LM-' || UPPER(HEX(RANDOMBLOB(6))) WHERE username IS NULL").run();
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_username ON participants(session_id,username)").run();
  verifiedUsernameDatabases.add(env.DB);
}
const verifiedLockDatabases=new WeakSet();
async function ensureLockSchema(env){
 if(verifiedLockDatabases.has(env.DB))return;
 const schema=await env.DB.prepare("PRAGMA table_info(sessions)").all();
 if(!(schema.results||[]).some(x=>x.name==="is_locked")){
  try{await env.DB.prepare("ALTER TABLE sessions ADD COLUMN is_locked INTEGER NOT NULL DEFAULT 0").run()}
  catch(error){if(!/duplicate column name:\s*is_locked/i.test(String(error)))throw error}
 }
 verifiedLockDatabases.add(env.DB);
}
async function classLocked(env){
 const row=await env.DB.prepare("SELECT is_locked FROM sessions WHERE id=?").bind(SESSION_ID).first();
 return Number(row?.is_locked)===1;
}
async function insertParticipant(env,data){
 const {name,school,className,username,valid}=validParticipantData(data);
 if(!valid)return failure("Isi nama, sekolah, kelas, dan username 3–20 huruf kecil tanpa spasi",400);
 const id=crypto.randomUUID(),token=b64url(crypto.getRandomValues(new Uint8Array(32))),hash=await sha256(token);
 try{
  await env.DB.prepare("INSERT INTO participants(id,session_id,name,school,class_name,token_hash,username,created_at) VALUES(?,?,?,?,?,?,?,?)")
   .bind(id,SESSION_ID,name,school,className,hash,username,new Date().toISOString()).run();
 }catch(error){
  if(usernameConflict(error))return failure("Username sudah digunakan. Pilih satu kata lain.",409);
  throw error;
 }
 return output({user:{id,name,school,className,username,token}},201);
}
async function handleApi(req,env){
  if(!env.DB)return failure("Database D1 belum terpasang",503);
  const url=new URL(req.url),path=url.pathname.startsWith(PUBLIC_BASE+"/")?url.pathname.slice(PUBLIC_BASE.length):url.pathname,method=req.method;
  if((method==="POST"&&["/api/participants","/api/participant-login","/api/trainer/participants"].includes(path)) ||
     (method==="PATCH"&&path==="/api/me/username") ||
     (method==="GET"&&["/api/me","/api/dashboard"].includes(path)) ||
     (["PATCH","DELETE"].includes(method)&&path.startsWith("/api/participants/"))){
    try{await ensureUsernameSchema(env)}
    catch(error){console.error("Username migration:",error?.message);return failure("Persiapan username D1 gagal. Periksa migrasi 0002 sebelum melanjutkan.",503)}
  }
  let lockReady=true;
  try{await ensureLockSchema(env)}
  catch(error){console.error("Class lock migration:",error?.message);lockReady=false}
  // Bila migrasi gagal, trainer masih bisa masuk untuk memperbaiki konfigurasi.
  // Permintaan peserta harus gagal aman, bukan diam-diam membuka kelas.
  const participantAction=(method==="POST"&&["/api/participants","/api/participant-login"].includes(path))||
    (method==="GET"&&path==="/api/me")||
    (method==="PATCH"&&path==="/api/me/username")||
    (method==="PUT"&&path.startsWith("/api/answers/"));
  if(!lockReady&&(participantAction||path==="/api/class-lock"))return failure("Status kunci kelas belum siap di D1. Hubungi trainer.",503);
  if(method==="PUT"&&path==="/api/class-lock"){
   const admin=await access(req,env);
   if(!admin)return failure("Autentikasi trainer diperlukan",401);
   if(admin.role!=="trainer")return failure("Hanya trainer dapat mengunci kelas",403);
   const data=await bodyJson(req);
   if(typeof data.locked!=="boolean")return failure("Status kunci tidak valid",400);
   await env.DB.prepare("UPDATE sessions SET is_locked=?, updated_at=? WHERE id=?")
    .bind(data.locked?1:0,new Date().toISOString(),SESSION_ID).run();
   return output({ok:true,locked:data.locked});
  }
  const locked=lockReady?await classLocked(env):false;
  if(locked&&participantAction)return failure("Kelas telah dikunci trainer. Akses latihan peserta ditutup.",423);
  if(method==="GET"&&path==="/api/state"){
    const [stage,participants]=await Promise.all([stageState(env),env.DB.prepare("SELECT COUNT(*) AS total FROM participants WHERE session_id=?").bind(SESSION_ID).first()]);
    const camera=await liveCamera(env);
    return output({stage,locked,camera:{a:camera.a,s:camera.s,i:camera.i},presentation:presentationFromCamera(camera),count:participants?.total||0,date:"2026-11-16",title:"Studio Foto Cerita — Lensa Muda"});
  }
  if(method==="POST"&&path==="/api/participants"){
   const data=await bodyJson(req);
   return insertParticipant(env,data);
  }
  if(method==="POST"&&path==="/api/trainer/participants"){
   const admin=await access(req,env);
   if(!admin)return failure("Autentikasi trainer diperlukan",401);
   if(admin.role!=="trainer")return failure("Hanya trainer dapat menambah peserta",403);
   return insertParticipant(env,await bodyJson(req));
  }
  if(method==="POST"&&path==="/api/participant-login"){
    const data=await bodyJson(req),username=cleanUsername(data.username);
    if(!validUsername(username)&&!isLegacyUsername(username))return failure("Username tidak valid. Gunakan satu kata huruf kecil.",400);
    const ip=req.headers.get("CF-Connecting-IP")||"local";
    const attemptId="participant:"+await sha256((env.SESSION_SECRET||"") + ip);
    if(await loginsTooMany(env,attemptId))return failure("Terlalu banyak percobaan login. Coba lagi setelah 15 menit.",429);
    let row;
    try{
      row=await env.DB.prepare("SELECT id,username,name,school,class_name AS className FROM participants WHERE session_id=? AND username=?")
        .bind(SESSION_ID,username).first();
    }catch(error){
      if(missingUsernameColumn(error))return failure("Fitur username belum aktif. Hubungi trainer untuk migrasi D1 0002.",503);
      throw error;
    }
    if(!row){await recordBadLogin(env,attemptId);return failure("Username tidak ditemukan. Periksa kembali huruf dan angkanya.",401)}
    await clearBadLogin(env,attemptId);
    const token=b64url(crypto.getRandomValues(new Uint8Array(32))),hash=await sha256(token);
    await env.DB.prepare("UPDATE participants SET token_hash=? WHERE id=? AND session_id=?").bind(hash,row.id,SESSION_ID).run();
    return output({user:{...row,token}});
  }
  if(method==="GET"&&path==="/api/me"){
    const p=await participant(req,env);if(!p)return failure("Sesi peserta tidak valid",401);
    const rows=await env.DB.prepare("SELECT stage,payload FROM answers WHERE participant_id=?").bind(p.id).all();
    const answers={};
    for(const row of rows.results||[]){try{answers[row.stage]=JSON.parse(row.payload)}catch{}}
    return output({user:p,stage:await stageState(env),answers});
  }
  if(method==="POST"&&path==="/api/login"){
    if(!env.TRAINER_PIN||!env.SESSION_SECRET)return failure("Konfigurasi autentikasi belum lengkap",503);
    const data=await bodyJson(req),pin=typeof data.pin==="string"?data.pin:"";
    const ip=req.headers.get("CF-Connecting-IP")||"local";
    const attemptId=await sha256(env.SESSION_SECRET+ip);
    // Periksa kredensial valid lebih dahulu: trainer yang akhirnya memasukkan PIN
    // benar tidak terkunci karena percobaan sebelumnya. Percobaan salah tetap dibatasi.
    let role=null;
    if(pin&&constantEqual(pin,env.TRAINER_PIN))role="trainer";
    else if(pin&&env.MENTOR_PIN&&constantEqual(pin,env.MENTOR_PIN))role="mentor";
    if(!role){
      if(await loginsTooMany(env,attemptId))
        return failure("Terlalu banyak percobaan gagal. Tunggu hingga 15 menit atau gunakan PIN yang benar.",429);
      await recordBadLogin(env,attemptId);
      return failure("PIN tidak sesuai dengan Secret Cloudflare. Periksa TRAINER_PIN dan coba lagi.",401);
    }
    await clearBadLogin(env,attemptId);
    return output({role,token:await makeToken(env.SESSION_SECRET,role)});
  }
  if(method==="GET"&&path==="/api/dashboard"){
    const user=await access(req,env);if(!user)return failure("Autentikasi trainer diperlukan",401);
    const [stage,rows,answers]=await Promise.all([
      stageState(env),
      env.DB.prepare("SELECT id,username,name,school,class_name AS className FROM participants WHERE session_id=? ORDER BY created_at ASC").bind(SESSION_ID).all(),
      env.DB.prepare("SELECT a.participant_id,a.stage,a.payload FROM answers a JOIN participants p ON p.id=a.participant_id WHERE p.session_id=?").bind(SESSION_ID).all()
    ]);
    const map=new Map((rows.results||[]).map(row=>[row.id,{...row,username:user.role==="trainer"?row.username:null,done:0,answers:{}}]));
    for(const record of answers.results||[]){
      const target=map.get(record.participant_id);
      if(target){target.done++;try{target.answers[record.stage]=JSON.parse(record.payload)}catch{}}
    }
    const camera=await liveCamera(env);
    return output({stage,locked,camera:{a:camera.a,s:camera.s,i:camera.i},presentation:presentationFromCamera(camera),count:map.size,participants:[...map.values()],role:user.role});
  }
  if((method==="PATCH"||method==="DELETE")&&/^\/api\/participants\/[0-9a-f-]{36}$/i.test(path)){
    const admin=await access(req,env);
    if(!admin)return failure("Autentikasi trainer diperlukan",401);
    if(admin.role!=="trainer")return failure("Hanya trainer yang dapat mengelola peserta",403);
    const id=path.split("/").pop();
    const existing=await env.DB.prepare("SELECT id FROM participants WHERE id=? AND session_id=?").bind(id,SESSION_ID).first();
    if(!existing)return failure("Peserta tidak ditemukan",404);
    if(method==="DELETE"){
      // Hapus jawaban lebih dulu agar aman walau FK SQLite belum diaktifkan pada koneksi.
      await env.DB.prepare("DELETE FROM answers WHERE participant_id=?").bind(id).run();
      await env.DB.prepare("DELETE FROM participants WHERE id=? AND session_id=?").bind(id,SESSION_ID).run();
      return output({ok:true,deleted:id});
    }
    const data=await bodyJson(req),name=norm(data.name,90),school=norm(data.school,140),className=norm(data.className,30);
    const username=cleanUsername(data.username);
    if(name.length<2||!school||!className||!validUsername(username))return failure("Lengkapi identitas dan username 3–20 huruf kecil",400);
    try{
     await env.DB.prepare("UPDATE participants SET name=?,school=?,class_name=?,username=? WHERE id=? AND session_id=?")
      .bind(name,school,className,username,id,SESSION_ID).run();
    }catch(error){if(usernameConflict(error))return failure("Username sudah digunakan oleh peserta lain",409);throw error}
    return output({ok:true,user:{id,name,school,className,username}});
  }
  if(method==="PATCH"&&path==="/api/me/username"){
   const p=await participant(req,env);
   if(!p)return failure("Sesi peserta tidak valid",401);
   const username=cleanUsername((await bodyJson(req)).username);
   if(!validUsername(username))return failure("Username harus satu kata 3–20 huruf kecil tanpa spasi",400);
   try{
    await env.DB.prepare("UPDATE participants SET username=? WHERE id=? AND session_id=?")
      .bind(username,p.id,SESSION_ID).run();
   }catch(error){if(usernameConflict(error))return failure("Username sudah digunakan, pilih yang lain",409);throw error}
   return output({ok:true,username});
  }
  if(method==="PUT"&&path==="/api/presentation"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer boleh mengendalikan materi",403);
    const data=await bodyJson(req);
    if(!["theory","simulator"].includes(data.view)||!Number.isInteger(data.slide)||data.slide<0||data.slide>20)
      return failure("Mode presentasi atau nomor slide tidak valid",400);
    try{
      await env.DB.prepare("UPDATE sessions SET camera_json=json_set(camera_json,'$.view',?,'$.slide',?),updated_at=? WHERE id=?")
        .bind(data.view,data.slide,new Date().toISOString(),SESSION_ID).run();
    }catch(error){
      if(/no such column:\\s*camera_json/i.test(String(error?.message)))
        return failure("Database belum memiliki kolom kamera. Terapkan migrasi 0001.",503);
      throw error;
    }
    return output({ok:true,presentation:{view:data.view,slide:data.slide}});
  }
  if(method==="PUT"&&path==="/api/demo-camera"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer yang boleh mengendalikan demo kamera",403);
    const data=await bodyJson(req);
    if(!validCamera(data))return failure("Pengaturan kamera tidak valid",400);
    try{
      await env.DB.prepare("UPDATE sessions SET camera_json=json_set(camera_json,'$.a',?,'$.s',?,'$.i',?),updated_at=? WHERE id=?")
        .bind(data.a,data.s,data.i,new Date().toISOString(),SESSION_ID).run();
    }catch(error){
      if(/no such column:\s*camera_json/i.test(String(error?.message)))
        return failure("Jalankan migrasi database camera_json di Cloudflare D1 Console terlebih dahulu.",503);
      throw error;
    }
    return output({ok:true,camera:{a:data.a,s:data.s,i:data.i}});
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
    const apiPath=url.pathname.startsWith(PUBLIC_BASE+"/")?url.pathname.slice(PUBLIC_BASE.length):url.pathname;
    if(!apiPath.startsWith("/api/"))return env.ASSETS.fetch(request);
    try{return await handleApi(request,env)}
    catch(err){console.error("API error:",err?.message||"unknown");return failure(err?.message==="Format JSON tidak valid"||err?.message==="Ukuran data terlalu besar"?err.message:"Layanan sedang mengalami gangguan",500)}
  }
};