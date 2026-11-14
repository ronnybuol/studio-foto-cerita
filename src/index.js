import {ensureHuntingSchema,huntingAccess,huntingKey,validWebP,slotFromPath,MAX_HUNTING_BYTES} from "./hunting-photos.js";
import {normalizeHuntingTimer,applyHuntingTimerAction} from "./hunting-timer.js";
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
function usernameConflict(error){
 const detail=[error?.message,error?.cause?.message,String(error)].filter(Boolean).join(" | ");
 // SQLite may report the composite index columns, not just participants.username.
 return /UNIQUE constraint failed:.*participants\.(?:username|session_id)|idx_participants_username/i.test(detail);
}
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
const STAGE_FIRST_SLIDES = [0,0,21,32,39,45,52];
const STAGE_LAST_SLIDES = [0,20,31,38,44,51,57];
function validControlRevision(data){return data.controlRevision===undefined||(Number.isSafeInteger(data.controlRevision)&&data.controlRevision>0)}
const DEFAULT_COMPOSITION = Object.freeze({grid:true,frame:false,position:"center",distance:"wide",angle:"eye",preview:"distance"});
function validComposition(c){
 return !!c&&typeof c==="object"&&!Array.isArray(c)
   &&typeof c.grid==="boolean"&&typeof c.frame==="boolean"
   &&["left","center","right"].includes(c.position)
   &&["wide","medium","close"].includes(c.distance)
   &&["eye","low","high"].includes(c.angle)
   &&["position","distance","angle","frame"].includes(c.preview);
}
function compositionFromCamera(raw){
 let data;try{data=JSON.parse(raw||"null")}catch{return {...DEFAULT_COMPOSITION}}
 return validComposition(data?.composition)?data.composition:{...DEFAULT_COMPOSITION};
}

function presentationFromCamera(value){
  return {view:value?.view==="simulator"?"simulator":"theory",slide:Number.isInteger(value?.slide)&&value.slide>=0&&value.slide<=57?value.slide:0};
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
async function liveComposition(env){
 try{
  const row=await env.DB.prepare("SELECT camera_json FROM sessions WHERE id=?").bind(SESSION_ID).first();
  return compositionFromCamera(row?.camera_json);
 }catch(error){
  if(/no such column:\s*camera_json/i.test(String(error?.message)))return {...DEFAULT_COMPOSITION};
  throw error;
 }
}
// LCD spotlight is a temporary override of what is projected; it never alters the saved presentation.
async function liveSpotlight(env,snapshotCamera){
  const camera=snapshotCamera||await liveCamera(env);
  const selected=camera?.spotlight;
  if(!selected||typeof selected!=="object"||!ANSWER_KEYS.has(selected.module)
     ||typeof selected.participantId!=="string"||!/^[0-9a-f-]{36}$/i.test(selected.participantId))return null;
  const result=await env.DB.prepare(
    "SELECT p.name AS name,a.payload AS payload FROM answers a JOIN participants p ON a.participant_id=p.id WHERE p.id=? AND p.session_id=? AND a.stage=?"
  ).bind(selected.participantId,SESSION_ID,selected.module).first();
  if(!result)return null;
  let answer;try{answer=JSON.parse(result.payload)}catch{return null}
  if(!answer||typeof answer!=="object"||Array.isArray(answer))return null;
  return {participantId:selected.participantId,module:selected.module,name:result.name,answer,challengeIndex:Number.isInteger(selected.challengeIndex)?selected.challengeIndex:0};
}
async function sessionSnapshot(env,lockReady=true){
 let row;
 try{row=await env.DB.prepare(`SELECT active_stage,camera_json${lockReady?",is_locked":""} FROM sessions WHERE id=?`).bind(SESSION_ID).first()}
 catch(error){
  if(!/no such column:\s*camera_json/i.test(String(error?.message)))throw error;
  row=await env.DB.prepare(`SELECT active_stage${lockReady?",is_locked":""} FROM sessions WHERE id=?`).bind(SESSION_ID).first();
 }
 if(!row)throw Error("Database belum disiapkan: jalankan schema.sql");
 let camera;try{camera=JSON.parse(row.camera_json||"null")}catch{}
 if(!validCamera(camera))camera={...DEFAULT_CAMERA};
 return {stage:row.active_stage,locked:lockReady?Number(row.is_locked)===1:true,camera,
  composition:compositionFromCamera(JSON.stringify(camera)),presentation:presentationFromCamera(camera),
  controlRevision:Number.isSafeInteger(camera.controlRevision)?camera.controlRevision:0,timer:normalizeHuntingTimer(camera.huntingTimer)};
}
async function writeProjection(env,data,expression,bindings=[],condition="",conditionBindings=[]){
 const revision=data.controlRevision??null;
 const result=await env.DB.prepare(`UPDATE sessions SET camera_json=json_set(${expression},'$.controlRevision',COALESCE(?,json_extract(camera_json,'$.controlRevision'),0)),updated_at=? WHERE id=? AND (? IS NULL OR ?>=COALESCE(json_extract(camera_json,'$.controlRevision'),0))${condition}`)
  .bind(...bindings,revision,new Date().toISOString(),SESSION_ID,revision,revision,...conditionBindings).run();
 return result.meta?.changes!==0;
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
    (method==="PUT"&&path.startsWith("/api/answers/"))||
    (method==="PUT"&&path.startsWith("/api/hunting/photos/"));
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

  // Optional full-screen closing slide. The classroom is not locked and answers
  // remain intact; closingVisible is a reversible presentation override.
  const closingPhotoKey="lecture/lensa-muda/closing-silhouette.jpg";
  if(method==="GET"&&path==="/api/closing/status"){
    const exists=env.PHOTO_BUCKET?!!(await env.PHOTO_BUCKET.head(closingPhotoKey)):false;
    return output({ready:exists});
  }
  if(path==="/api/closing/photo"){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan foto belum terhubung",503);
    if(method==="PUT"){
      const admin=await access(req,env);
      if(!admin)return failure("Autentikasi trainer diperlukan",401);
      if(admin.role!=="trainer")return failure("Hanya trainer dapat mengunggah foto penutup",403);
      if(req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase()!=="image/jpeg")
        return failure("Foto penutup harus JPG",415);
      if(Number(req.headers.get("Content-Length")||0)>4*1024*1024)return failure("Foto maksimal 4 MB",413);
      const bytes=new Uint8Array(await req.arrayBuffer());
      if(bytes.length<20||bytes.length>4*1024*1024||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)
        return failure("JPG tidak valid",415);
      await env.PHOTO_BUCKET.put(closingPhotoKey,bytes,{httpMetadata:{contentType:"image/jpeg"},
        customMetadata:{credit:"Ronny Adolof Buol",purpose:"Lensa Muda closing slide"}});
      return output({ok:true,bytes:bytes.length});
    }
    if(method==="GET"){
      const object=await env.PHOTO_BUCKET.get(closingPhotoKey);
      if(!object)return failure("Foto penutup belum diunggah",404);
      return new Response(object.body,{headers:{"Content-Type":"image/jpeg",
        "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
        "X-Robots-Tag":"noindex, nofollow"}});
    }
    return failure("Metode tidak didukung",405);
  }
  if(method==="PUT"&&path==="/api/closing/presentation"){
    const admin=await access(req,env);
    if(!admin)return failure("Autentikasi trainer diperlukan",401);
    if(admin.role!=="trainer")return failure("Hanya trainer dapat mengendalikan slide penutup",403);
    const data=await bodyJson(req);
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    if(typeof data.visible!=="boolean")return failure("Pilihan slide penutup tidak valid",400);
    if(data.visible&&(!env.PHOTO_BUCKET||!(await env.PHOTO_BUCKET.head(closingPhotoKey))))
      return failure("Unggah dulu foto siluet pilihan sebelum menampilkan penutup",409);
    if(!await writeProjection(env,data,"json_set(camera_json,'$.closingVisible',?)",[data.visible?1:0]))
      return failure("Kendali kelas berubah, muat ulang dashboard",409);
    return output({ok:true,closingVisible:data.visible,controlRevision:data.controlRevision});
  }
  // Six documentary photos for Modul 06, kept independent of participant R2 data.
  // Trainer may upload the six user-supplied WebP photos; lecture slide URLs are read-only.
  const ethicsImageMatch=/^\/api\/ethics\/slide-photo\/([1-6])$/.exec(path);
  if(method==="GET"&&path==="/api/ethics/photos/status"){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan foto belum terhubung",503);
    const existing=await Promise.all([1,2,3,4,5,6].map(async n=>
      !!(await env.PHOTO_BUCKET.head("lecture/modul06/slide-"+n+".webp"))));
    return output({photos:existing});
  }
  if(ethicsImageMatch){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan foto belum terhubung",503);
    const n=Number(ethicsImageMatch[1]),key="lecture/modul06/slide-"+n+".webp";
    if(method==="PUT"){
      const admin=await access(req,env);
      if(!admin)return failure("Autentikasi trainer diperlukan",401);
      if(admin.role!=="trainer")return failure("Hanya trainer boleh mengganti foto materi",403);
      const type=req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
      if(type!=="image/webp")return failure("Berkas harus WebP",415);
      if(Number(req.headers.get("Content-Length")||0)>3*1024*1024)
        return failure("Foto maksimal 3 MB",413);
      const buffer=new Uint8Array(await req.arrayBuffer());
      const ascii=(offset,length)=>String.fromCharCode(...buffer.slice(offset,offset+length));
      if(buffer.length<16||buffer.length>3*1024*1024
          ||ascii(0,4)!=="RIFF"||ascii(8,4)!=="WEBP")
        return failure("Format WebP tidak valid atau ukuran melampaui 3 MB",415);
      await env.PHOTO_BUCKET.put(key,buffer,{httpMetadata:{contentType:"image/webp"},
        customMetadata:{credit:"Ronny Adolof Buol",module:"06",slide:String(n)}});
      return output({ok:true,slide:n,bytes:buffer.length});
    }
    if(method==="GET"){
      const object=await env.PHOTO_BUCKET.get(key);
      if(!object)return failure("Foto slide belum diunggah trainer",404);
      return new Response(object.body,{headers:{"Content-Type":"image/webp",
        "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
        "X-Robots-Tag":"noindex, nofollow"}});
    }
    return failure("Metode tidak didukung",405);
  }

  // Five original National Geographic magazine spreads. Upload only by trainer to
  // the existing R2 bucket; public display is restricted to these five static keys.
  const spreadMatch=/^\/api\/portfolio\/spread\/([1-5])$/.exec(path);
  if(method==="GET"&&path==="/api/portfolio/status"){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan portofolio belum terhubung",503);
    const existing=await Promise.all([1,2,3,4,5].map(async n=>!!(await env.PHOTO_BUCKET.head("portfolio/lensa-muda-2026/spread-"+n+".jpg"))));
    return output({spreads:existing});
  }
  if(spreadMatch){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan portofolio belum terhubung",503);
    const n=Number(spreadMatch[1]),key="portfolio/lensa-muda-2026/spread-"+n+".jpg";
    if(method==="PUT"){
      const admin=await access(req,env);
      if(!admin)return failure("Autentikasi trainer diperlukan",401);
      if(admin.role!=="trainer")return failure("Hanya trainer boleh mengunggah portofolio",403);
      if(req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase()!=="image/jpeg")
        return failure("Pilih berkas JPG dari portofolio asli",415);
      if(Number(req.headers.get("Content-Length")||0)>4*1024*1024)return failure("Foto terlalu besar, maksimal 4 MB",413);
      const bytes=new Uint8Array(await req.arrayBuffer());
      if(bytes.length<16||bytes.length>4*1024*1024||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)
        return failure("Berkas harus JPEG valid maksimal 4 MB",415);
      await env.PHOTO_BUCKET.put(key,bytes,{httpMetadata:{contentType:"image/jpeg"},
        customMetadata:{portfolio:"Hudog Pekayang",spread:String(n),source:"Ronny Adolof Buol · National Geographic"}});
      return output({ok:true,spread:n,bytes:bytes.length});
    }
    if(method==="GET"){
      const object=await env.PHOTO_BUCKET.get(key);
      if(!object)return failure("Spread portofolio "+n+" belum diunggah trainer",404);
      return new Response(object.body,{headers:{"Content-Type":"image/jpeg","Cache-Control":"public, max-age=300","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"}});
    }
    return failure("Metode tidak didukung",405);
  }
  if(method==="PUT"&&path==="/api/portfolio/presentation"){
    const admin=await access(req,env);
    if(!admin)return failure("Autentikasi trainer diperlukan",401);
    if(admin.role!=="trainer")return failure("Hanya trainer boleh mengendalikan portofolio",403);
    const data=await bodyJson(req);
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    if(!Number.isInteger(data.page)||data.page<0||data.page>5)return failure("Halaman portofolio harus 0–5",400);
    if(!await writeProjection(env,data,"json_set(json_remove(camera_json,'$.spotlight'),'$.portfolioPage',?)",[data.page]))
      return failure("Kendali kelas berubah. Segarkan dashboard",409);
    return output({ok:true,portfolioPage:data.page,controlRevision:data.controlRevision});
  }
  // Only the trainer can read an individual participant's hunting photo.
  const trainerPhoto=/^\/api\/trainer\/hunting\/photo\/([0-9a-f-]{36})\/([1-9]|1[0-2])$/i.exec(path);
  if(method==="GET"&&trainerPhoto){
    const admin=await access(req,env);
    if(!admin)return failure("Autentikasi trainer diperlukan",401);
    if(admin.role!=="trainer")return failure("Hanya trainer boleh meninjau foto",403);
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan foto belum terhubung",503);
    await ensureHuntingSchema(env.DB);
    const [,participantId,rawSlot]=trainerPhoto,slot=Number(rawSlot);
    const row=await env.DB.prepare(
      "SELECT h.object_key FROM hunting_photos h JOIN participants p ON p.id=h.participant_id WHERE h.participant_id=? AND h.slot=? AND p.session_id=?"
    ).bind(participantId,slot,SESSION_ID).first();
    const key=huntingKey(SESSION_ID,participantId,slot);
    if(!row||row.object_key!==key)return failure("Foto tidak ditemukan",404);
    const object=await env.PHOTO_BUCKET.get(key);
    if(!object)return failure("Berkas foto belum tersedia",404);
    return new Response(object.body,{headers:{"Content-Type":"image/webp","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  }
  // The public LCD can see ONLY the one photo currently spotlighted by the trainer.
  if(method==="GET"&&path==="/api/spotlight/photo"){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan foto belum terhubung",503);
    const selected=(await sessionSnapshot(env,lockReady)).camera.spotlight;
    const requested=url.searchParams.get("participant"),slot=Number(url.searchParams.get("slot"));
    if(!selected||selected.module!=="edfat"||selected.participantId!==requested||
       !Number.isInteger(slot)||slot<1||slot>12)return failure("Foto tidak sedang ditampilkan",404);
    const record=await env.DB.prepare(
      "SELECT a.payload FROM answers a JOIN participants p ON p.id=a.participant_id WHERE a.participant_id=? AND a.stage='edfat' AND p.session_id=?"
    ).bind(requested,SESSION_ID).first();
    let answer;try{answer=JSON.parse(record?.payload||"null")}catch{}
    if(answer?.mode!=="hunting"||answer.photoSlot!==slot)return failure("Foto pilihan tidak ditemukan",404);
    await ensureHuntingSchema(env.DB);
    const key=huntingKey(SESSION_ID,requested,slot);
    const row=await env.DB.prepare("SELECT object_key FROM hunting_photos WHERE participant_id=? AND slot=?").bind(requested,slot).first();
    if(!row||row.object_key!==key)return failure("Foto belum tersedia",404);
    const object=await env.PHOTO_BUCKET.get(key);
    if(!object)return failure("Berkas foto belum tersedia",404);
    return new Response(object.body,{headers:{"Content-Type":"image/webp","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"}});
  }
  // LCD projects only confirmed hunting photos belonging to the current story/caption spotlight.
  const storyPhoto=/^\/api\/spotlight\/story-photo\/([1-9]|1[0-2])$/.exec(path);
  if(method==="GET"&&storyPhoto){
    if(!env.PHOTO_BUCKET)return failure("Penyimpanan foto belum terhubung",503);
    const snapshot=await sessionSnapshot(env,lockReady);
    const selected=snapshot.camera.spotlight;
    if(!selected||!["story","caption"].includes(selected.module))return failure("Foto tidak sedang disorot",404);
    const slot=Number(storyPhoto[1]),pid=selected.participantId;
    const record=await env.DB.prepare("SELECT a.payload FROM answers a JOIN participants p ON p.id=a.participant_id WHERE p.id=? AND p.session_id=? AND a.stage=?")
      .bind(pid,SESSION_ID,selected.module).first();
    let answer;try{answer=JSON.parse(record?.payload||"null")}catch{}
    const allowed=selected.module==="story"?answer?.mode==="hunting"&&answer?.selected:
      answer?.storyMode==="hunting"&&answer?.storySelected;
    if(!Array.isArray(allowed)||!allowed.includes(slot))return failure("Foto bukan bagian dari cerita pilihan",404);
    const key=huntingKey(SESSION_ID,pid,slot);
    await ensureHuntingSchema(env.DB);
    const row=await env.DB.prepare("SELECT object_key FROM hunting_photos WHERE participant_id=? AND slot=?")
      .bind(pid,slot).first();
    if(!row||row.object_key!==key)return failure("Foto belum tersedia",404);
    const object=await env.PHOTO_BUCKET.get(key);
    if(!object)return failure("Berkas foto belum tersedia",404);
    return new Response(object.body,{headers:{"Content-Type":"image/webp","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"}});
  }
  // Personal hunting gallery. Uploads are owned by the authenticated participant.
  // Neither the public URL nor another participant can read the raw photo.
  if(path==="/api/hunting/photos" || path.startsWith("/api/hunting/photos/")){
    const p=await participant(req,env);
    const stage=await stageState(env);
    const denial=huntingAccess({stage,locked,participant:p,storage:env.PHOTO_BUCKET});
    if(denial)return failure(denial.error,denial.status);
    if(!lockReady)return failure("Kunci kelas belum siap",503);
    await ensureHuntingSchema(env.DB);
    if(path==="/api/hunting/photos"&&method==="GET"){
      const rows=await env.DB.prepare(
        "SELECT slot,bytes,width,height,uploaded_at AS uploadedAt FROM hunting_photos WHERE participant_id=? ORDER BY slot"
      ).bind(p.id).all();
      return output({photos:rows.results||[],limit:12});
    }
    const slot=slotFromPath(path);
    if(slot===null)return failure("Nomor foto harus 1 sampai 12",400);
    const key=huntingKey(SESSION_ID,p.id,slot);
    if(method==="GET"){
      const row=await env.DB.prepare("SELECT object_key FROM hunting_photos WHERE participant_id=? AND slot=?").bind(p.id,slot).first();
      if(!row||row.object_key!==key)return failure("Foto belum diunggah",404);
      const object=await env.PHOTO_BUCKET.get(key);
      if(!object)return failure("Berkas foto belum tersedia",404);
      return new Response(object.body,{headers:{"Content-Type":"image/webp","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
    }
    if(method==="PUT"){
      if(req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase()!=="image/webp")
        return failure("Hanya foto WebP yang telah dioptimalkan yang diterima",415);
      const length=Number(req.headers.get("Content-Length")||0);
      if(length>MAX_HUNTING_BYTES)return failure("Foto terlalu besar. Maksimal 2 MB",413);
      const width=Number(req.headers.get("X-Photo-Width"));
      const height=Number(req.headers.get("X-Photo-Height"));
      if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>4096||height>4096)
        return failure("Dimensi foto tidak valid",400);
      const previous=await env.DB.prepare("SELECT slot FROM hunting_photos WHERE participant_id=? AND slot=?").bind(p.id,slot).first();
      if(previous)return failure("Slot sudah berisi foto. Pilih slot kosong.",409);
      const bytes=new Uint8Array(await req.arrayBuffer());
      if(bytes.length===0||bytes.length>MAX_HUNTING_BYTES)return failure("Foto harus berukuran 1 byte sampai 2 MB",413);
      if(!validWebP(bytes))return failure("Isi berkas bukan WebP yang valid",415);
      const uploadedAt=new Date().toISOString();
      await env.PHOTO_BUCKET.put(key,bytes,{httpMetadata:{contentType:"image/webp"},customMetadata:{session:SESSION_ID,participantId:p.id,slot:String(slot)}});
      const result=await env.DB.prepare(
        "INSERT INTO hunting_photos(participant_id,slot,object_key,bytes,width,height,uploaded_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(participant_id,slot) DO NOTHING"
      ).bind(p.id,slot,key,bytes.length,width,height,uploadedAt).run();
      if(result.meta?.changes===0)return failure("Slot foto sudah digunakan. Segarkan galeri.",409);
      return output({ok:true,photo:{slot,bytes:bytes.length,width,height,uploadedAt}},201);
    }
    return failure("Metode tidak didukung",405);
  }
  if(method==="GET"&&path==="/api/state"){
    const [snapshot,participants]=await Promise.all([sessionSnapshot(env,lockReady),env.DB.prepare("SELECT COUNT(*) AS total FROM participants WHERE session_id=?").bind(SESSION_ID).first()]);
    const {stage,camera,composition,presentation,controlRevision,timer}=snapshot;
    const spotlight=await liveSpotlight(env,camera);
    return output({stage,locked:snapshot.locked,composition,spotlight,closingVisible:camera.closingVisible===true||camera.closingVisible===1,portfolioPage:Number.isInteger(camera.portfolioPage)?camera.portfolioPage:0,controlRevision,timer,serverNow:Date.now(),camera:{a:camera.a,s:camera.s,i:camera.i},welcome:camera.welcome===true,orientation:camera.orientation==="registration",participantGuide:camera.orientation==="guide",roster:camera.orientation==="roster",rosterPage:Number.isInteger(camera.rosterPage)?camera.rosterPage:0,portfolioPage:Number.isInteger(camera.portfolioPage)?camera.portfolioPage:0,rosterNames:camera.orientation==="roster"&&stage===0?(await env.DB.prepare("SELECT name FROM participants WHERE session_id=? ORDER BY created_at ASC, id ASC LIMIT 48 OFFSET ?").bind(SESSION_ID,Math.max(0,Math.min(99,Number.isInteger(camera.rosterPage)?camera.rosterPage:0))*48).all()).results.map(row=>row.name):[],presentation,count:participants?.total||0,date:"2026-11-16",title:"Studio Foto Cerita — Lensa Muda"});
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
    const [snapshot,rows,answers]=await Promise.all([
      sessionSnapshot(env,lockReady),
      env.DB.prepare("SELECT id,username,name,school,class_name AS className FROM participants WHERE session_id=? ORDER BY created_at ASC").bind(SESSION_ID).all(),
      env.DB.prepare("SELECT a.participant_id,a.stage,a.payload FROM answers a JOIN participants p ON p.id=a.participant_id WHERE p.session_id=?").bind(SESSION_ID).all()
    ]);
    const map=new Map((rows.results||[]).map(row=>[row.id,{...row,username:user.role==="trainer"?row.username:null,done:0,answers:{}}]));
    for(const record of answers.results||[]){
      const target=map.get(record.participant_id);
      if(target){target.done++;try{target.answers[record.stage]=JSON.parse(record.payload)}catch{}}
    }
    const {stage,camera,composition,presentation,controlRevision,timer}=snapshot;
    const spotlight=await liveSpotlight(env,camera);
    return output({stage,locked:snapshot.locked,composition,spotlight,closingVisible:camera.closingVisible===true||camera.closingVisible===1,controlRevision,timer,serverNow:Date.now(),camera:{a:camera.a,s:camera.s,i:camera.i},presentation,count:map.size,participants:[...map.values()],role:user.role});
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
   if(method==="PUT"&&path==="/api/spotlight"){
     const user=await access(req,env);
     if(!user)return failure("Autentikasi trainer diperlukan",401);
     if(user.role!=="trainer")return failure("Hanya trainer boleh menyorot karya peserta",403);
     const data=await bodyJson(req);
     if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
     if(data.participantId===null){
       if(!await writeProjection(env,data,"json_remove(camera_json,'$.spotlight')"))return failure("Kendali kelas sudah berubah. Segarkan status.",409);
       return output({ok:true,spotlight:null,controlRevision:data.controlRevision});
     }
     if(typeof data.participantId!=="string"||!/^[0-9a-f-]{36}$/i.test(data.participantId)
        ||typeof data.module!=="string"||!ANSWER_KEYS.has(data.module))return failure("Peserta atau modul tidak valid",400);
     const record=await env.DB.prepare(
       "SELECT a.payload FROM answers a JOIN participants p ON p.id=a.participant_id WHERE p.id=? AND p.session_id=? AND a.stage=?"
     ).bind(data.participantId,SESSION_ID,data.module).first();
     if(!record)return failure("Peserta belum menyimpan hasil modul tersebut",404);
     if(data.module==="edfat"){
       let answer;try{answer=JSON.parse(record.payload)}catch{}
       if(answer?.mode==="hunting"){
         if(!Number.isInteger(answer.photoSlot)||answer.photoSlot<1||answer.photoSlot>12)return failure("Foto pilihan belum valid",409);
         await ensureHuntingSchema(env.DB);
         const photo=await env.DB.prepare("SELECT slot FROM hunting_photos WHERE participant_id=? AND slot=?")
           .bind(data.participantId,answer.photoSlot).first();
         if(!photo)return failure("Foto pilihan peserta belum tersedia",404);
       }
     }
     if(data.module==="story"||data.module==="caption"){
       let answer;try{answer=JSON.parse(record.payload)}catch{}
       const ids=data.module==="story"&&answer?.mode==="hunting"?answer.selected:
         data.module==="caption"&&answer?.storyMode==="hunting"?answer.storySelected:null;
       if(ids){
         await ensureHuntingSchema(env.DB);
         const rows=await env.DB.prepare("SELECT slot FROM hunting_photos WHERE participant_id=?").bind(data.participantId).all();
         const owned=new Set((rows.results||[]).map(row=>row.slot));
         if(!Array.isArray(ids)||ids.length!==9||ids.some(slot=>!owned.has(slot)))return failure("Foto cerita peserta tidak lengkap",409);
       }
     }
     if(data.module==="komposisi"&&(!Number.isInteger(data.challengeIndex)||data.challengeIndex<0||data.challengeIndex>3))return failure("Tantangan komposisi tidak valid",400);
     if(data.module==="komposisi"){
       let answer;try{answer=JSON.parse(record.payload)}catch{}
       const ids=["sepertiga","framing","jarak","subjek"];
       if(!answer?.challenges?.[ids[data.challengeIndex]]?.choice)return failure("Peserta belum menjawab tantangan ini",404);
     }
     if(!await writeProjection(env,data,"json_set(camera_json,'$.spotlight',json(?))",[JSON.stringify({participantId:data.participantId,module:data.module,...(data.module==="komposisi"?{challengeIndex:data.challengeIndex}:{})})]))return failure("Kendali kelas sudah berubah. Segarkan status.",409);
     return output({ok:true,spotlight:await liveSpotlight(env),controlRevision:data.controlRevision});
   }
  if(method==="PUT"&&path==="/api/presentation"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer boleh mengendalikan materi",403);
    const data=await bodyJson(req);
    if(!["theory","simulator"].includes(data.view)||!Number.isInteger(data.slide)||data.slide<0||data.slide>57)
      return failure("Mode presentasi atau nomor slide tidak valid",400);
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    if(data.stage!==undefined&&(!Number.isInteger(data.stage)||data.stage<0||data.stage>6))return failure("Tahap tidak valid",400);
    if(data.stage>0&&data.view==="theory"&&(data.slide<STAGE_FIRST_SLIDES[data.stage]||data.slide>STAGE_LAST_SLIDES[data.stage]))return failure("Slide ini bukan bagian tahap aktif. Segarkan dashboard trainer.",409);
    try{
      const written=await env.DB.prepare("UPDATE sessions SET camera_json=json_set(camera_json,'$.view',?,'$.slide',?,'$.welcome',json('false'),'$.orientation',null,'$.portfolioPage',0,'$.controlRevision',COALESCE(?,json_extract(camera_json,'$.controlRevision'),0)),updated_at=? WHERE id=? AND (? IS NULL OR ?>=COALESCE(json_extract(camera_json,'$.controlRevision'),0)) AND (? IS NULL OR active_stage=?)")
        .bind(data.view,data.slide,data.controlRevision??null,new Date().toISOString(),SESSION_ID,data.controlRevision??null,data.controlRevision??null,data.stage??null,data.stage??null).run();
      if(written.meta?.changes===0)return failure("Tahap atau kendali kelas sudah berubah. Segarkan status sebelum memilih slide lagi.",409);
    }catch(error){
      if(/no such column:\s*camera_json/i.test(String(error?.message)))
        return failure("Database belum memiliki kolom kamera. Terapkan migrasi 0001.",503);
      throw error;
    }
    return output({ok:true,presentation:{view:data.view,slide:data.slide},controlRevision:data.controlRevision});
  }
  if(method==="PUT"&&path==="/api/demo-composition"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer dapat mengendalikan demonstrasi komposisi",403);
    const data=await bodyJson(req);
    if(!validComposition(data))return failure("Pengaturan komposisi tidak valid",400);
    try{
      await env.DB.prepare("UPDATE sessions SET camera_json=json_set(camera_json,'$.composition',json(?)),updated_at=? WHERE id=?")
       .bind(JSON.stringify(data),new Date().toISOString(),SESSION_ID).run();
    }catch(error){
      if(/no such column:\s*camera_json/i.test(String(error?.message)))return failure("Kolom camera_json belum aktif",503);
      throw error;
    }
    return output({ok:true,composition:data});
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
  if(method==="PUT"&&path==="/api/orientation"){
    const admin=await access(req,env);
    if(!admin||admin.role!=="trainer")return failure("Hanya trainer yang dapat menampilkan orientasi",403);
    const data=await bodyJson(req);
    if(!["registration","roster","guide"].includes(data.screen))return failure("Slide orientasi tidak valid",400);
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    if(data.screen==="roster"&&(!Number.isInteger(data.page)||data.page<0||data.page>99))return failure("Halaman daftar peserta tidak valid",400);
    if(await stageState(env)!==0)return failure("Slide ini hanya tersedia pada tahap 00 · Orientasi",409);
    if(!await writeProjection(env,data,"json_set(camera_json,'$.orientation',?,'$.rosterPage',?,'$.welcome',json('false'))",[data.screen,data.screen==="roster"?data.page:0]," AND active_stage=0"))return failure("Tahap atau kendali kelas sudah berubah. Segarkan status.",409);
    return output({ok:true,orientation:data.screen,page:data.screen==="roster"?data.page:0,controlRevision:data.controlRevision});
  }
  if(method==="PUT"&&path==="/api/welcome"){
    const admin=await access(req,env);
    if(!admin||admin.role!=="trainer")return failure("Hanya trainer yang dapat mengatur layar sambutan",403);
    const data=await bodyJson(req);
    if(typeof data.active!=="boolean")return failure("Status sambutan tidak valid",400);
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    if(!await writeProjection(env,data,"json_set(camera_json,'$.welcome',json(?),'$.orientation',null)",[data.active?"true":"false"]))return failure("Kendali kelas sudah berubah. Segarkan status.",409);
    return output({ok:true,welcome:data.active,controlRevision:data.controlRevision});
  }
  if(method==="PUT"&&path==="/api/hunting/timer"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer boleh mengendalikan timer",403);
    if(await stageState(env)!==3)return failure("Timer hunting hanya tersedia pada Modul 03",409);
    const data=await bodyJson(req);
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    const snapshot=await sessionSnapshot(env,lockReady);
    if(data.controlRevision!==undefined&&data.controlRevision<snapshot.controlRevision)return failure("Kendali kelas telah berubah. Segarkan dan ulangi.",409);
    let next;
    try{next=applyHuntingTimerAction(snapshot.timer,data,Date.now())}
    catch(error){return failure(error.message,400)}
    const written=await writeProjection(env,data,"json_set(camera_json,'$.huntingTimer',json(?))",[JSON.stringify(next)]," AND active_stage=3");
    if(!written)return failure("Timer atau tahap telah berubah. Coba lagi.",409);
    return output({ok:true,timer:next,serverNow:Date.now(),controlRevision:data.controlRevision??snapshot.controlRevision});
  }
  if(method==="PUT"&&path==="/api/state"){
    const user=await access(req,env);
    if(!user)return failure("Autentikasi trainer diperlukan",401);
    if(user.role!=="trainer")return failure("Hanya trainer yang boleh mengubah tahap",403);
    const data=await bodyJson(req);
    if(!Number.isInteger(data.stage)||data.stage<0||data.stage>6)return failure("Tahap tidak valid");
    if(!validControlRevision(data))return failure("Revisi kendali tidak valid",400);
    const written=await env.DB.prepare(`UPDATE sessions SET camera_json=json_set(
      CASE WHEN active_stage<>? THEN json_remove(CASE WHEN ?>0 THEN json_set(camera_json,'$.view','theory','$.slide',?) ELSE camera_json END,'$.spotlight') ELSE camera_json END,
      '$.welcome',json('false'),'$.orientation',null,'$.controlRevision',COALESCE(?,json_extract(camera_json,'$.controlRevision'),0)),
      active_stage=?,updated_at=? WHERE id=? AND (? IS NULL OR ?>=COALESCE(json_extract(camera_json,'$.controlRevision'),0))`)
      .bind(data.stage,data.stage,STAGE_FIRST_SLIDES[data.stage],data.controlRevision??null,data.stage,new Date().toISOString(),SESSION_ID,data.controlRevision??null,data.controlRevision??null).run();
    if(written.meta?.changes===0)return failure("Kendali kelas sudah diperbarui. Segarkan status sebelum mengubah tahap lagi.",409);
    const snapshot=await sessionSnapshot(env,lockReady);
    return output({stage:snapshot.stage,presentation:snapshot.presentation,controlRevision:snapshot.controlRevision,ok:true});
  }
  if(method==="PUT"&&path.startsWith("/api/answers/")){
    const key=decodeURIComponent(path.slice("/api/answers/".length));
    const index=ANSWER_KEYS.get(key);
    if(!index)return failure("Modul tidak dikenal",404);
    const p=await participant(req,env);if(!p)return failure("Sesi peserta tidak valid. Daftar ulang jika perlu.",401);
    const stage=await stageState(env);
    if(index>stage)return failure("Tahap ini belum dibuka trainer",403);
    const data=await bodyJson(req);
    if(Object.hasOwn(data,"_clientRevision")&&(!Number.isSafeInteger(data._clientRevision)||data._clientRevision<=0))return failure("Versi jawaban tidak valid",400);
    if(key==="edfat"&&data.mode==="hunting"){
      if(!Number.isInteger(data.photoSlot)||data.photoSlot<1||data.photoSlot>12
       ||!["Entire","Detail","Frame","Angle","Time"].includes(data.dominant)
       ||typeof data.reason!=="string"||data.reason.trim().length<12||data.reason.length>1400)
        return failure("Pilih satu foto, pendekatan EDFAT, dan alasan minimal 12 karakter",400);
      await ensureHuntingSchema(env.DB);
      const photo=await env.DB.prepare(
        "SELECT slot FROM hunting_photos WHERE participant_id=? AND slot=?"
      ).bind(p.id,data.photoSlot).first();
      if(!photo)return failure("Foto pilihan belum tersimpan di server. Unggah foto terlebih dahulu.",409);
    }
    if(key==="story"){
      if(!Array.isArray(data.selected)||data.selected.length!==9||new Set(data.selected).size!==9||data.selected.some(n=>!Number.isInteger(n)||n<1||n>12))return failure("Pilih 9 foto latihan yang berbeda");
      if(data.mode==="hunting"){
        await ensureHuntingSchema(env.DB);
        const records=await env.DB.prepare("SELECT slot FROM hunting_photos WHERE participant_id=? ORDER BY slot")
          .bind(p.id).all();
        const owned=new Set((records.results||[]).map(x=>x.slot));
        if(data.selected.some(id=>!owned.has(id)))return failure("Sembilan foto harus berasal dari galeri hunting milikmu dan tersimpan di server",409);
      }else if(data.mode!==undefined) return failure("Mode Meja Editor tidak valid",400);
    }
    if(key==="caption"){
      // New submissions must build on the nine-photo hunting story saved in Module 04.
      if(data.storyMode!=="hunting")return failure("Selesaikan Meja Editor Modul 04 terlebih dahulu",409);
      if(typeof data.captionText!=="string"||!data.captionText.trim()||data.captionText.length>11000)
        return failure("Tuliskan setidaknya satu kata. Tidak ada batas minimum jumlah kata untuk latihan.",400);
      if(["reviewVisual","reviewFacts","reviewSequence"].some(k=>data[k]!=="yes"))
        return failure("Periksa tiga butir editorial sebelum menyimpan",400);
      if(["who","what","when","where","why","how","verification"].some(k=>data[k]!==undefined&&
         (typeof data[k]!=="string"||data[k].length>1800)))
        return failure("Catatan fakta tidak valid",400);
    }
    if(key==="caption"&&data.storyMode==="hunting"){
      if(!Array.isArray(data.storySelected)||data.storySelected.length!==9||new Set(data.storySelected).size!==9)
        return failure("Caption harus mengikuti sembilan foto pilihan di Modul 04",400);
      const record=await env.DB.prepare("SELECT payload FROM answers WHERE participant_id=? AND stage='story'")
        .bind(p.id).first();
      let story;try{story=JSON.parse(record?.payload||"null")}catch{}
      if(story?.mode!=="hunting"||JSON.stringify(story.selected)!==JSON.stringify(data.storySelected))
        return failure("Simpan susunan sembilan foto Modul 04 sebelum mengirim Caption Lab",409);
    }
    if(key==="caption"&&typeof data.captionText!=="string")return failure("Caption harus berupa teks");
    if(key==="komposisi"&&Object.hasOwn(data,"challenges")){
      if(!data.challenges||typeof data.challenges!=="object"||Array.isArray(data.challenges))return failure("Jawaban komposisi tidak valid");
      const ids=["sepertiga","framing","jarak","subjek"];
      if(Object.keys(data.challenges).some(id=>!ids.includes(id)))return failure("Tantangan komposisi tidak dikenal");
      for(const answer of Object.values(data.challenges)){
        if(!answer||typeof answer!=="object"||(answer.choice!==undefined&&!["A","B"].includes(answer.choice))
          ||(answer.reason!==undefined&&(typeof answer.reason!=="string"||answer.reason.length>1400)))
          return failure("Setiap jawaban komposisi harus memiliki pilihan A/B dan alasan minimal 15 karakter");
      }
    }
    const payload=JSON.stringify(data);
    if(payload.length>16000)return failure("Jawaban terlalu panjang");
    const saved=await env.DB.prepare(`INSERT INTO answers(participant_id,stage,payload,updated_at)
      VALUES(?,?,?,?) ON CONFLICT(participant_id,stage)
      DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at
      WHERE json_extract(excluded.payload,'$._clientRevision') IS NULL
        OR json_extract(answers.payload,'$._clientRevision') IS NULL
        OR json_extract(excluded.payload,'$._clientRevision')>=json_extract(answers.payload,'$._clientRevision')`)
      .bind(p.id,key,payload,new Date().toISOString()).run();
    if(saved.meta?.changes===0)return failure("Versi jawaban yang lebih baru sudah ada di server. Muat ulang lalu periksa dan simpan kembali hasilmu.",409);
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
