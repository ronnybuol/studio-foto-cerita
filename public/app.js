import {THEORY_SLIDES,theoryVisual,cameraPhotoUrl,PHOTO_DETAILS,PRESENTATION_ORDER,MAX_PRESENTATION_SLIDE,photoDetail,presentationLabel} from "./slides.js";
import {COMPOSITION_START,COMPOSITION_END,COMPOSITION_SLIDES,compositionSlide,compositionLabel,compositionVisual} from "./composition.js";
import {EDFAT_START,EDFAT_END,EDFAT_SLIDES,EDFAT_CASES,EDFAT_OPTIONS,edfatSlide,edfatLabel,edfatVisual,edfatPhoto} from "./edfat.js";
import {STORY_START,STORY_END,STORY_SLIDES,STORY_BANK,storySlide,storyLabel,storySlideVisual,storyImage} from "./story.js";
import {CAPTION_START,CAPTION_END,CAPTION_SLIDES,captionSlide,captionLabel,captionVisual,captionWordCount} from "./caption.js";
import {ETHICS_START,ETHICS_END,ETHICS_SLIDES,ethicsSlide,ethicsLabel,ethicsVisual} from "./ethics.js";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const escapeHtml = (s="") => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const APP_RELEASE = "m06-finale-20261114";
const STORAGE_USER = "lm26-user";
const STORAGE_WORK = "lm26-work";
const STORAGE_VIEW = "lm26-view";
const STAGES = [
  {key:"mulai",name:"Orientasi",icon:"⌂",title:"Selamat datang di Studio Foto Cerita",blurb:"Tidak membawa kamera? Tidak masalah. Kita akan belajar melihat dan menyusun cerita."},
  {key:"kamera",name:"Laboratorium Kamera",icon:"◉",title:"Bermain dengan cahaya",blurb:"Geser bukaan, shutter, dan ISO. Lihat bagaimana pilihan teknis mengubah gambar."},
  {key:"komposisi",name:"Komposisi Visual",icon:"▦",title:"Apa yang masuk bingkai?",blurb:"Belajar membuat subjek lebih jelas melalui posisi, ruang, dan sudut pandang."},
  {key:"edfat",name:"Detektif EDFAT",icon:"◈",title:"Lima cara mengamati peristiwa",blurb:"Entire, Detail, Frame, Angle, Time: bukan hafalan, melainkan cara mencari cerita."},
  {key:"story",name:"Sembilan Bingkai",icon:"▤",title:"Sembilan foto, satu cerita",blurb:"Pilih sembilan dari dua belas kandidat foto dokumentasi Sangihe, lalu susun alur ceritanya."},
  {key:"caption",name:"Caption Lab",icon:"✎",title:"Foto yang jujur butuh konteks",blurb:"Kumpulkan fakta 5W+1H lalu tulis satu caption untuk sembilan foto."},
  {key:"etika",name:"Etika & Tantangan",icon:"✓",title:"Merekam budaya dengan hormat",blurb:"Jaga keaslian momen, hormati orang yang dipotret, dan siapkan rencana hunting."}
];
const APERTURE = [1.8,2.8,4,5.6,8,11,16];
const SHUTTERS = [{t:1/15,l:"1/15"},{t:1/30,l:"1/30"},{t:1/60,l:"1/60"},{t:1/125,l:"1/125"},{t:1/250,l:"1/250"},{t:1/500,l:"1/500"},{t:1/1000,l:"1/1000"}];
const ISOS = [100,200,400,800,1600,3200,6400];
const CAPTION_FIELDS = [
  ["who","Siapa? (Who)","Nama dan peran tokoh, kelompok atau komunitas"],
  ["what","Apa? (What)","Kegiatan atau peristiwa yang sungguh terjadi"],
  ["when","Kapan? (When)","Tanggal atau waktu kejadian yang telah dipastikan"],
  ["where","Di mana? (Where)","Tempat spesifik, desa/kecamatan/kota"],
  ["why","Mengapa? (Why)","Makna, tujuan, atau latar yang sudah terverifikasi"],
  ["how","Bagaimana? (How)","Proses atau cara terjadinya peristiwa"]
];
const ETHICS = [
  {q:"Seorang pengrajin sedang bekerja. Bolehkah kita meminta ia mengulang gerakan seolah-olah spontan untuk foto dokumenter candid?",a:["Boleh, asal lebih bagus","Tidak. Cari momen asli, jangan merekayasa peristiwa","Boleh tanpa memberi tahu pembaca"],correct:1,why:"Juknis melarang staged photography untuk adegan candid. Jangan mengubah kenyataan demi foto."},
  {q:"Di belakang penari ada seseorang yang mengganggu komposisi. Apa pilihan yang sesuai aturan lomba?",a:["Hapus orang itu dengan aplikasi","Minta semua orang meninggalkan lokasi","Ubah posisi kamera atau tunggu momen, bukan menghapus objek"],correct:2,why:"Penyuntingan yang menambah, menghapus, atau memindahkan objek dilarang."},
  {q:"Kamu belum tahu nama upacara yang dipotret. Apa yang harus dilakukan sebelum menulis caption?",a:["Bertanya kepada orang yang memahami dan memeriksa informasinya","Tebak dari kostum","Salin deskripsi dari unggahan viral"],correct:0,why:"Foto jurnalistik membutuhkan fakta terverifikasi, tidak hanya deskripsi visual."},
  {q:"Kamu akan memotret ritual dengan pembatasan tertentu. Langkah terbaik?",a:["Tetap memotret diam-diam karena untuk tugas sekolah","Hormati aturan setempat, minta izin dan penjelasan","Pindahkan benda ritual agar fotonya lebih kuat"],correct:1,why:"Hormati komunitas, adat, akses, keselamatan, dan hak orang yang dipotret."}
];
const SHOTS = [
  ["Gerbang sanggar","Entire","Menetapkan tempat",0],
  ["Warga berdatangan","Frame","Menunjukkan suasana",1],
  ["Pengrajin membuka ruang","Entire","Memperkenalkan kegiatan",2],
  ["Wajah pengrajin","Portrait","Menghadirkan tokoh",3],
  ["Alat kerja di meja","Detail","Memberi petunjuk",4],
  ["Tangan mengukir kayu","Detail","Mengikuti proses",5],
  ["Anak mengamati","Frame","Melihat hubungan generasi",6],
  ["Pekerjaan bersama","Angle","Menunjukkan interaksi",7],
  ["Momen paling sibuk","Time","Menangkap puncak",8],
  ["Wajah penuh konsentrasi","Time","Momen manusiawi",9],
  ["Karya selesai","Detail","Menunjukkan hasil",10],
  ["Sanggar menjelang sore","Closing","Menutup kisah",11]
].map(([title,type,desc,i])=>({id:i+1,title,type,desc,i}));
let state = {
  online:false,serverStage:0,count:0,demoStage:6,role:"participant",locked:false,
  demoCamera:{a:1,s:3,i:1},
  demoComposition:{grid:true,frame:false,position:"center",distance:"wide",angle:"eye",preview:"distance"},
  presentation:{view:"theory",slide:0},
  spotlight:null,
  user:readJSON(STORAGE_USER,null),work:readJSON(STORAGE_WORK,{}),
  trainerToken:sessionStorage.getItem("lm26-trainer")||"",
  trainerRole:sessionStorage.getItem("lm26-role")||"trainer",
  active:localStorage.getItem(STORAGE_VIEW)||"mulai",
  learnerViews:{},
  camera:{a:1,s:3,i:1},composition:{grid:true,frame:false,position:"center",distance:"wide",angle:"eye",reason:""},
  dashboard:null,justRegistered:false,welcome:false
};
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveWork(){localStorage.setItem(STORAGE_WORK,JSON.stringify(state.work))}
function toast(message){const box=$("#toast");box.textContent=message;box.classList.add("visible");clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.classList.remove("visible"),2800)}
const PUBLIC_BASE = "/lensa-muda";
async function request(path,{method="GET",payload,auth=false}={}){
  const headers={};
  if(payload!==undefined) headers["Content-Type"]="application/json";
  const token=auth?state.trainerToken:state.user?.token;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(PUBLIC_BASE+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){
    const error=new Error(body.error||`HTTP ${response.status}`);
    error.status=response.status;
    throw error;
  }
  return body;
}
async function syncState(){
  try {
    const data=await request("/api/state");
    if(!data||typeof data.stage!=="number") throw Error("API belum terpasang");
    const previousStage=state.serverStage;
    state.online=true;state.serverStage=data.stage;state.count=data.count||0;state.locked=!!data.locked;
    state.spotlight=data.spotlight||null;state.welcome=!!data.welcome;
    // Tahap baru tidak memindahkan peserta yang sedang praktik.
    if(data.composition&&["grid","frame","position","distance","angle","preview"].every(k=>Object.hasOwn(data.composition,k)))state.demoComposition=data.composition;
    if(data.camera&&["a","s","i"].every(k=>Number.isInteger(data.camera[k])&&data.camera[k]>=0&&data.camera[k]<=6))state.demoCamera=data.camera;
    if(data.presentation&&["theory","simulator"].includes(data.presentation.view)&&Number.isInteger(data.presentation.slide)&&data.presentation.slide>=0&&data.presentation.slide<=ETHICS_END)
      state.presentation=data.presentation;
    $("#connectivity").className="connection online";
    $("#connectivity").textContent=`● Terhubung ke kelas langsung · ${data.count||0} peserta terdaftar`;
  }catch{
    state.online=false;
    $("#connectivity").className="connection demo";
    $("#connectivity").textContent="◌ Mode demo lokal — latihan tersimpan pada perangkat ini, belum tersinkron ke kelas";
  }
}
function pageMode(){const hash=location.hash.replace(/^#\//,"").split("/")[0];if(["trainer","lcd","peserta"].includes(hash))return hash;const path=location.pathname.replace(/\/+$/,"").split("/").pop();return ["trainer","lcd","peserta"].includes(path)?path:"welcome"}
const LEARNER_RANGES={kamera:[0,MAX_PRESENTATION_SLIDE],komposisi:[COMPOSITION_START,COMPOSITION_END],edfat:[EDFAT_START,EDFAT_END],story:[STORY_START,STORY_END],caption:[CAPTION_START,CAPTION_END],etika:[ETHICS_START,ETHICS_END]};
function learnerKey(){return "lm26-learner-view-"+(state.user?.id||"demo")}
function loadLearnerViews(){state.learnerViews=readJSON(learnerKey(),{})}
function saveLearnerViews(){localStorage.setItem(learnerKey(),JSON.stringify(state.learnerViews))}
function learnerRange(key){return LEARNER_RANGES[key]}
function liveLearnerSlide(key){const r=learnerRange(key);return r&&state.presentation.slide>=r[0]&&state.presentation.slide<=r[1]?state.presentation.slide:r?.[0]||0}
function learnerMode(key){const r=learnerRange(key);if(!r)return "practice";const v=state.learnerViews[key]?.mode;if(["practice","reference","follow"].includes(v))return v;
 const draft=state.work[key];if(draft&&((draft._draft===true)||(key==="story"&&!draft.completedAt&&(draft.selected?.length||draft.title||draft.reason))))return "practice";
 return state.presentation.view==="theory"&&state.presentation.slide>=r[0]&&state.presentation.slide<=r[1]?"follow":"practice"}
function learnerSlide(key){const r=learnerRange(key);if(!r)return 0;const v=state.learnerViews[key],i=v?.mode==="reference"?v.slide:liveLearnerSlide(key);return Number.isInteger(i)&&i>=r[0]&&i<=r[1]?i:r[0]}
function setLearnerMode(key,mode,slide){const r=learnerRange(key);if(!r)return;state.learnerViews[key]={mode,slide:Number.isInteger(slide)?Math.max(r[0],Math.min(r[1],slide)):learnerSlide(key)};saveLearnerViews();renderParticipant()}
function learnerModeBar(key){const r=learnerRange(key);if(!r)return "";const mode=learnerMode(key),slide=learnerSlide(key),practice=mode==="practice";
return `<nav class="learner-study-toolbar" aria-label="Mode belajar"><div class="learner-study-copy"><b>${practice?"Latihan mandiri":mode==="reference"?"Materi untuk dibaca sendiri":"Mengikuti presentasi kelas"}</b><span>${practice?"Latihan tidak berpindah ketika trainer membuka slide.":"Kamu bisa kembali ke latihan tanpa menghilangkan jawaban."}</span></div>
<div class="learner-study-actions"><button class="btn small ${practice?"primary":"subtle"}" data-learner-mode="practice">Latihan saya</button><button class="btn small ${mode==="reference"?"primary":"subtle"}" data-learner-mode="reference">Baca materi</button><button class="btn small ${mode==="follow"?"primary":"subtle"}" data-learner-mode="follow">Ikuti trainer</button></div>
${mode==="reference"?`<div class="learner-reference-nav"><button class="btn small subtle" data-reference-step="-1" ${slide===r[0]?"disabled":""}>← Sebelumnya</button><span>${slide-r[0]+1} / ${r[1]-r[0]+1}</span><button class="btn small subtle" data-reference-step="1" ${slide===r[1]?"disabled":""}>Berikutnya →</button></div>`:""}</nav>`}
function bindLearnerMode(){const key=state.active;if(!learnerRange(key))return;$$("[data-learner-mode]").forEach(b=>b.onclick=()=>setLearnerMode(key,b.dataset.learnerMode,b.dataset.learnerMode==="reference"?learnerSlide(key):undefined));$$("[data-reference-step]").forEach(b=>b.onclick=()=>setLearnerMode(key,"reference",learnerSlide(key)+Number(b.dataset.referenceStep)))}
function goModule(key){state.active=key;localStorage.setItem(STORAGE_VIEW,key);render();window.scrollTo({top:0,behavior:"smooth"})}
function titleBlock(key){const s=STAGES.find(x=>x.key===key);return `<div class="module-top"><div><span class="eyebrow">MODUL ${STAGES.indexOf(s)} / 6</span><h1>${s.title}</h1><p>${s.blurb}</p></div><span class="pill">Latihan interaktif</span></div>`}
function isUnlocked(key){return !state.locked&&(!state.online || STAGES.findIndex(x=>x.key===key)<=state.serverStage)}
function lessonLayout(){
 const nav=STAGES.map((stage,i)=>`<option value="${stage.key}" ${state.active===stage.key?"selected":""} ${isUnlocked(stage.key)?"":"disabled"}>${String(i).padStart(2,"0")} · ${escapeHtml(stage.name)}</option>`).join("");
 return `<div class="page learner-page"><div class="learner-focus-bar">
 <div class="learner-module-nav"><label for="participant-module-select">Materi pembelajaran</label><select id="participant-module-select">${nav}</select></div>
 <details class="learner-account"><summary><span>${escapeHtml(state.user?.name||"Peserta")}</span><span>Akun ▾</span></summary>
 <div class="learner-account-panel"><p>${escapeHtml(state.user?.school||"")} · ${escapeHtml(state.user?.className||"")}</p><p>Username: <strong>${escapeHtml(state.user?.username||"—")}</strong></p>
 <form id="participant-rename-form"><label for="new-username">Ganti username</label><div class="learner-rename-row"><input id="new-username" name="username" pattern="[a-z]{3,20}" maxlength="20" required value="${/^[a-z]{3,20}$/.test(state.user?.username||"")?escapeHtml(state.user.username):""}" placeholder="contoh: jufri"><button class="btn small" type="submit">Simpan</button></div><small>3–20 huruf kecil, satu kata tanpa spasi.</small></form>
 <button class="btn small subtle" id="participant-switch-account">Keluar / ganti akun</button></div></details></div>
 <section class="lesson">${learnerModeBar(state.active)}${renderModule()}</section></div>`;
}
function renderModule(){const key=state.active,mode=learnerMode(key),theory=mode==="reference"||(mode==="follow"&&state.presentation.view==="theory"),slide=learnerSlide(key);switch(key){
 case "kamera":return theory?theoryParticipantPage(slide):cameraPage();
 case "komposisi":return theory?compositionParticipantPage(slide):compositionPage();
 case "edfat":return theory?edfatParticipantSlide(slide):edfatPage();
 case "story":return theory?storyParticipantSlide(slide):storyPage();
 case "caption":return theory?captionParticipantSlide(slide):captionPage();
 case "etika":return theory?ethicsParticipantSlide(slide):ethicsPage();
 default:return startPage();
}}
function welcomePage(){
return `<div class="welcome-page"><section class="welcome-hero"><div class="welcome-portrait" role="img" aria-label="Hong Bit, perempuan Dayak berkuping panjang, foto Ronny Adolof Buol, Kalimantan 2016"></div><div class="welcome-shade"></div><div class="welcome-copy">
<span class="welcome-eyebrow">LENSA MUDA 2026 · KELAS BELAJAR FOTOGRAFI</span>
<h1>Selamat Datang di<br>Platform Kelas Belajar <em>Fotografi</em></h1><div class="welcome-rule"></div>
<p class="welcome-intro">Dikembangkan oleh <strong>Zonautara.com</strong> untuk Program <strong>Lensa Muda</strong></p>
<p class="welcome-description">Pelajari fotografi, foto cerita, komposisi, penulisan caption, dan etika memotret melalui pengalaman belajar yang interaktif.</p>
<div class="welcome-actions"><a class="btn primary" href="/lensa-muda/peserta">Masuk sebagai Peserta →</a><a class="btn welcome-trainer-button" href="/lensa-muda/trainer">Masuk sebagai Trainer →</a></div>
<p class="welcome-credit">Hong Bit, perempuan Dayak berkuping panjang. Foto: Ronny Adolof Buol, ekspedisi Kalimantan, 2016. <a href="https://vik.kompas.com/perempuan-dayak/" target="_blank" rel="noopener noreferrer">Baca kisah di Kompas.com</a></p></div></section></div>`;
}
function landing(){
  return `<div class="page"><div class="hero"><div><div class="kicker">Kelas Lensa Muda • 16 November 2026</div><h1>Dari jepretan menjadi <span>cerita.</span></h1><p>Pelajari kamera, komposisi, dan foto jurnalistik melalui eksperimen visual. Tanpa kamera pun kamu tetap bisa belajar. Siapkan cerita tentang budaya Sulawesi Utara.</p><div class="actions"><button class="btn primary" id="start-signup">Daftar peserta baru →</button><button class="btn ghost-dark" id="start-login">Sudah punya username? Masuk</button></div></div><div class="hero-icon"><svg viewBox="0 0 240 200" fill="none"><rect x="18" y="55" width="205" height="125" rx="24" stroke="currentColor" stroke-width="12"/><path d="M75 54 91 22h66l17 32" stroke="currentColor" stroke-width="12"/><circle cx="119" cy="115" r="44" stroke="currentColor" stroke-width="12"/><circle cx="119" cy="115" r="19" fill="currentColor"/><circle cx="191" cy="81" r="8" fill="currentColor"/></svg></div></div><div style="margin-top:26px" class="grid"><div class="card feature"><span class="num">01 / TEKNIK</span><span class="mini-icon">◉</span><strong>Atur kamera</strong><p>Geser slider dan lihat hubungan bukaan, rana, ISO, gerak, serta kedalaman ruang.</p></div><div class="card feature"><span class="num">02 / CERITA</span><span class="mini-icon">▧</span><strong>Susun 9 bingkai</strong><p>Seleksi dan urutkan ilustrasi landscape menjadi rangkaian photo story.</p></div><div class="card feature"><span class="num">03 / JURNALISTIK</span><span class="mini-icon">✎</span><strong>Perkuat caption</strong><p>Latih 5W+1H dan etika sebelum hunting budaya sesungguhnya.</p></div></div><div class="info" style="margin-top:18px"><b>Belum punya kamera?</b> Semua simulator dan latihan bisa dikerjakan melalui browser HP atau komputer. Fotografi lapangan dilakukan belakangan bersama pendamping.</div></div>`;
}
function signupPage(){
  return `<div class="page"><div class="card login-card"><button type="button" class="btn small subtle" data-back-auth>← Kembali</button><span class="eyebrow">Pendaftaran peserta • tanpa batas kuota aplikasi</span><h1>Masuk ke kelas</h1><p class="muted">Gunakan nama yang kamu setujui untuk ditampilkan selama kegiatan. Data sekolah dan kelas membantu guru serta fotografer pendamping mengenali peserta.</p><form id="signup-form"><div class="field"><label for="name">Nama peserta</label><input id="name" name="name" required minlength="2" maxlength="90" autocomplete="name" placeholder="Nama lengkap"></div><div class="field"><label for="school">Asal sekolah</label><input id="school" name="school" required maxlength="140" placeholder="SMA/SMK/MA ..."></div><div class="field"><label for="className">Kelas</label><input id="className" name="className" required maxlength="30" placeholder="Contoh: XI IPA 2"></div><div class="field"><label for="new-signup-username">Buat username sendiri</label><input id="new-signup-username" name="username" required minlength="3" maxlength="20" pattern="[a-z]{3,20}" autocapitalize="none" autocomplete="off" spellcheck="false" placeholder="contoh: jufri"><small>Satu kata, huruf kecil semua (a–z), 3–20 huruf, tanpa spasi. Harus unik.</small></div><button class="btn primary block" type="submit">Daftar dan Masuk →</button></form><button type="button" class="btn subtle block" data-choose-login>Sudah punya username? Masuk</button><p class="small-note">Setelah mendaftar, kamu mendapatkan username untuk masuk kembali tanpa mengisi ulang data sekolah.</p></div></div>`;
}
function participantLoginPage(){
 return `<div class="page"><div class="card login-card"><button class="btn small subtle" data-back-auth>← Kembali</button>
 <span class="eyebrow">Sudah terdaftar?</span><h1>Masuk dengan username</h1>
 <p class="muted">Masukkan username dari pendaftaran sebelumnya. Kamu tidak perlu mengisi ulang data sekolah.</p>
 <form id="participant-login-form"><div class="field"><label for="participant-username">Username</label>
 <input id="participant-username" name="username" required maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="contoh: jufri" value=""></div>
 <button class="btn primary block" type="submit">Masuk ke kelas →</button></form><button type="button" class="btn subtle block" data-choose-signup>Belum terdaftar? Daftar</button>
 <p class="small-note">Username ini adalah kunci masuk tanpa password. Simpan secara pribadi. Jika lupa, hubungi trainer.</p></div></div>`;
}
function participantWelcomePage(){
 return `<div class="page"><div class="card login-card"><span class="eyebrow">Pendaftaran berhasil</span><h1>Simpan username kamu</h1>
 <p>Gunakan username ini untuk masuk lagi dari HP atau laptop lain.</p>
 <div class="username-ticket"><strong>${escapeHtml(state.user.username||"Mode demo")}</strong><button class="btn small" id="copy-participant-username">Salin</button></div>
 <p class="small-note">Jangan bagikan username di grup publik karena tidak ada password tambahan.</p>
 <button class="btn primary block" id="participant-continue">Mulai belajar →</button></div></div>`;
}
function showParticipantAuth(which){
 $("#root").innerHTML=which==="login"?participantLoginPage():signupPage();
 const form=which==="login"?$("#participant-login-form"):$("#signup-form");
 form.onsubmit=which==="login"?participantLogin:signup;
 const login=$("#root [data-choose-login]");if(login)login.onclick=()=>showParticipantAuth("login");
 const register=$("#root [data-choose-signup]");if(register)register.onclick=()=>showParticipantAuth("signup");
 $$("[data-back-auth]").forEach(b=>b.onclick=renderParticipant);
 window.scrollTo(0,0);
}
async function participantLogin(e){
 e.preventDefault();
 const form=e.currentTarget,button=form.querySelector("button[type=submit]");
 const username=String(new FormData(form).get("username")||"").trim();
 button.disabled=true;button.textContent="Memeriksa username…";
 try{
  if(!state.online)throw Error("Login username memerlukan koneksi kelas.");
  const data=await request("/api/participant-login",{method:"POST",payload:{username}});
  state.user=data.user;state.justRegistered=false;
  loadLearnerViews();
  localStorage.setItem(STORAGE_USER,JSON.stringify(state.user));
  localStorage.setItem("lm26-last-username",state.user.username);
  const me=await request("/api/me");
  state.work=me.answers||{};state.composition={...state.composition,...(state.work.komposisi||{})};saveWork();
  state.active=STAGES[state.serverStage]?.key||"mulai";localStorage.setItem(STORAGE_VIEW,state.active);
  render();toast("Selamat datang kembali, "+state.user.name);
 }catch(error){toast(error.message);button.disabled=false;button.textContent="Masuk ke kelas →"}
}
function startPage(){
  return `${titleBlock("mulai")}<div class="hero" style="padding:30px"><div><span class="kicker">Tantangan Lensa Muda</span><h1 style="font-size:clamp(27px,4vw,47px)">Satu foto bisa indah.<br><span>Sembilan foto bisa bercerita.</span></h1><p>Dalam tiga jam, kamu belajar membuat keputusan di balik kamera dan di meja editor. Karya akhir lomba menggunakan 9 foto asli dan satu caption bersama sekitar 150 kata.</p><div class="actions"><button class="btn primary" data-nav="kamera">Masuk laboratorium kamera →</button></div></div><div class="hero-icon"><svg viewBox="0 0 240 180" fill="none"><rect x="23" y="26" width="196" height="129" rx="12" stroke="currentColor" stroke-width="8"/><circle cx="119" cy="89" r="46" stroke="currentColor" stroke-width="8"/><path d="M33 145 92 98l41 27 35-51 44 54" stroke="currentColor" stroke-width="7"/></svg></div></div><div class="grid" style="margin-top:16px"><div class="card"><div class="eyebrow">Tidak perlu kamera</div><h3>Pakai simulator</h3><p class="small-note">Seluruh pelajaran inti dapat dikerjakan tanpa memotret sungguhan.</p></div><div class="card"><div class="eyebrow">Tema karya</div><h3>Wajah Budaya Sulut</h3><p class="small-note">Cari manusia, aktivitas, detail, hubungan, serta makna kebudayaan.</p></div><div class="card"><div class="eyebrow">Aturan pokok</div><h3>Jujur pada momen</h3><p class="small-note">Jangan mengarang fakta, merekayasa candid, atau menghapus objek.</p></div></div>`;
}
const backSVG=`<svg class="back" viewBox="0 0 900 600" aria-hidden="true"><defs><linearGradient id="wall" x1="0" y1="0" y2="1"><stop stop-color="#557f7e"/><stop offset="1" stop-color="#314d4f"/></linearGradient><linearGradient id="window" x1="0" y1="0" y2="1"><stop stop-color="#fbd5a1"/><stop offset="1" stop-color="#c1b58c"/></linearGradient></defs><rect width="900" height="600" fill="url(#wall)"/><path d="M0 0h900v77H0z" fill="#293f43"/><path d="M0 430h900v170H0z" fill="#8f6d52"/><path d="M0 455h900" stroke="#af8a65" stroke-width="11"/><rect x="65" y="110" width="290" height="263" rx="7" fill="#29494b" stroke="#b6a989" stroke-width="17"/><rect x="86" y="131" width="248" height="221" fill="url(#window)"/><path d="M209 131v222M86 240h248" stroke="#6b6b55" stroke-width="10"/><path d="M86 330 140 248l44 37 58-82 92 98v50H86" fill="#789688"/><circle cx="281" cy="167" r="27" fill="#fff2c6" opacity=".65"/><path d="M0 80h900" stroke="#8d714d" stroke-width="19"/><path d="M610 84v95m90-95v122m92-122v94" stroke="#c1ad78" stroke-width="8"/><path d="M590 170q25-40 48 0l-9 45h-28z" fill="#b97941"/><path d="M677 199q29-46 56 0l-8 57h-39z" fill="#c9aa6b"/><path d="M765 175q25-39 48 0l-7 42h-34z" fill="#b8794b"/><rect x="565" y="318" width="270" height="78" rx="4" fill="#4b4941"/><rect x="596" y="250" width="14" height="70" fill="#c8ba8c"/><path d="M594 248h78l-12 22h-66" fill="#9b9e86"/><rect x="685" y="280" width="80" height="35" fill="#af855a"/><path d="M45 510h800" stroke="#664d3e" stroke-width="19" opacity=".42"/></svg>`;
const subjectSVG=`<svg class="subject" viewBox="0 0 900 600" aria-hidden="true"><ellipse cx="478" cy="539" rx="315" ry="41" fill="#262a28" opacity=".29"/><path d="M240 415h495l-24 130H267z" fill="#614536"/><path d="M220 399h540v36H220z" fill="#d2a26d"/><path d="M210 436h30l14 110h-28zm520 0h30l-18 110h-30z" fill="#433a36"/><path d="M369 408q-54-81-26-146 18-49 68-57 67-5 97 74l26 132z" fill="#db693d"/><path d="M384 266q-34 74-28 133l60 13 27-122z" fill="#ba542c"/><path d="M463 280q54 39 63 128l-63 8-49-126z" fill="#e58a4a"/><path d="M398 197q-29-33-21-73 9-53 61-59 60-1 65 51 4 51-36 79l-5 37h-62z" fill="#be8565"/><path d="M379 130q-14-75 54-90 78-14 78 71-24-18-48-27-20 39-84 46z" fill="#25282b"/><path d="M384 149q-6-17-18-6-11 19 12 31" fill="#be8565"/><path d="M458 149q-11 15-22 16" stroke="#844b3e" stroke-width="5" stroke-linecap="round"/><circle cx="467" cy="128" r="4" fill="#30282a"/><path d="M384 210 424 242 467 204l-1 34-45 42-41-43z" fill="#ebc29e"/><path d="M284 425q111-39 220-37l-12 40z" fill="#e8b783"/><path d="M530 375 570 326l28 3-48 76-37 19" fill="#b87a53"/><path d="M534 369 557 341 601 340" stroke="#f0bc86" stroke-width="14" stroke-linecap="round"/><path d="M418 402q29-6 55-8 22 5 35 18l-17 18-60-9" fill="#c18768"/><path d="M321 411q-4-17 14-31l50 3 25 23-12 20-65 3" fill="#bd825d"/><path d="M465 393l113-31 35 37-119 29z" fill="#ab754d" stroke="#5d4836" stroke-width="5"/><path d="M525 383l61-15" stroke="#e0b07d" stroke-width="3"/><rect x="624" y="407" width="75" height="13" rx="3" fill="#987554"/><path d="M645 410v-45l31-26 18 18-34 30v23" fill="#414548"/><path d="M659 366l22-18" stroke="#c4c2b4" stroke-width="7"/></svg>`;
const motionSVG=`<svg class="motion" viewBox="0 0 900 600" aria-hidden="true"><path d="M463 363Q500 379 525 393" stroke="#bc7954" stroke-width="27" stroke-linecap="round"/><path d="M524 390 562 377" stroke="#d9a078" stroke-width="15" stroke-linecap="round"/><path d="M555 375 606 357" stroke="#c7bbb0" stroke-width="7" stroke-linecap="round"/></svg>`;
function sceneHTML(id="cameraScene",extra=""){
return `<div id="${id}" class="scene ${extra}"><div class="view-label">SIMULASI • SANGGAR KERAJINAN</div>${backSVG}${subjectSVG}${motionSVG}<div class="exposure"></div><canvas class="noise" width="450" height="300"></canvas><svg class="gridlines" viewBox="0 0 900 600"><path d="M300 0v600M600 0v600M0 200h900M0 400h900" stroke="#ffffffad" stroke-width="3"/></svg><div class="framing"></div></div>`;
}
function photoSceneHTML(id="cameraScene"){
 return `<div id="${id}" class="scene photo-camera-scene">
   <img class="photo-main" src="${cameraPhotoUrl("base")}" alt="Ilustrasi generatif pengrajin memahat kayu sebagai bahan latihan exposure" decoding="async">
   <img class="photo-motion" src="${cameraPhotoUrl("shutter-cepat")}" alt="" aria-hidden="true" decoding="async">
   <div class="exposure"></div><canvas class="noise" width="450" height="300"></canvas>
   <div class="view-label">SIMULASI FOTO GENERATIF · BUKAN FOTO PERISTIWA NYATA</div>
 </div>`;
}
function photoDetailContent(index,variant="lcd"){
 const detail=photoDetail(index);
 if(!detail)return "";
 return `<div class="photo-detail-layout photo-detail-${variant}">
  <div class="photo-detail-heading"><span class="theory-kicker">FOTO ${presentationLabel(index)} · ILUSTRASI GENERATIF</span><h2>${escapeHtml(detail.title)}</h2></div>
  <figure class="photo-detail-figure"><img src="${cameraPhotoUrl(detail.image)}" alt="${escapeHtml(detail.caption)}" loading="eager" decoding="async"><figcaption>${escapeHtml(detail.caption)}</figcaption></figure>
  <div class="photo-detail-question"><b>AMATI & DISKUSIKAN</b><span>${escapeHtml(detail.question)}</span></div>
 </div>`;
}
function theorySlideContent(index,variant="lcd"){
 if(photoDetail(index))return photoDetailContent(index,variant);
 const slide=THEORY_SLIDES[index]||THEORY_SLIDES[0];
 return `<div class="theory-layout theory-layout-${variant}">
   <section class="theory-explain">
     <div class="theory-kicker">${escapeHtml(slide.eyebrow)} <span>· ${index+1} / ${THEORY_SLIDES.length}</span></div>
     <h2>${escapeHtml(slide.title)}</h2>
     <p class="theory-lead">${escapeHtml(slide.lead)}</p>
     <ul class="theory-points">${slide.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
     <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(slide.prompt)}</strong></div>
   </section>
   <div class="theory-visual">${theoryVisual(index,{sceneHTML,shotSrc})}</div>
 </div>`;
}
function theoryParticipantPage(i=state.presentation.slide){
 const slide=THEORY_SLIDES[photoDetail(i)?.parent??i]||THEORY_SLIDES[0];
 return `${titleBlock("kamera")}
  <div class="info" style="margin-bottom:14px"><b>Materi teori sedang berlangsung.</b> Ikuti pembahasan bersama trainer. Setelah slide terakhir, trainer akan membuka laboratorium kamera untuk latihan pribadi.</div>
  <div class="card theory-participant-card">${theorySlideContent(i,"participant")}</div>
  <p class="small-note">Materi ${presentationLabel(i)} · 8 pokok bahasan dan contoh foto. Pertanyaan diskusi dijawab secara lisan bersama kelas; tidak perlu membawa kamera.</p>`;
}
function theoryTrainerPanel(data,isMentor){
 const p=state.presentation;
 const i=p.slide,detail=photoDetail(i),slide=THEORY_SLIDES[detail?.parent??i]||THEORY_SLIDES[0];
 const stageLive=data.stage===1,enabled=!isMentor;
 return `<section class="card trainer-theory-card">
    <div class="trainer-demo-heading"><div><span class="eyebrow">PRESENTASI INTERAKTIF · BAB 1</span>
      <h2>Materi Dasar Fotografi</h2>
      <p class="small-note">Delapan pokok bahasan beserta sub-slide foto utuh. Ketika tahap 01 terbuka, tombol ini mengubah isi LCD.</p></div>
      <span class="pill ${stageLive?"green":"gray"}">${stageLive?"● TAHAP 01 AKTIF":"BUKA TAHAP 01 TERLEBIH DAHULU"}</span>
    </div>
    ${p.view==="theory"?`
      <div class="trainer-theory-preview ${detail?"trainer-photo-preview":""}">
        <div class="trainer-theory-title"><span>${escapeHtml(slide.eyebrow)} · ${presentationLabel(i)}</span><h3>${escapeHtml(detail?.title||slide.title)}</h3>
          <p>${escapeHtml(slide.lead)}</p><div class="trainer-theory-note"><b>CATATAN UNTUK TRAINER</b><p>${escapeHtml(slide.note)}</p></div></div>
        <div class="trainer-theory-mini">${detail?photoDetailContent(i,"trainer"):theoryVisual(i,{sceneHTML,shotSrc})}</div>
      </div>
      <div class="trainer-slide-nav">
        <button class="btn subtle" data-slide-step="-1" ${PRESENTATION_ORDER.indexOf(i)===0||!enabled?"disabled":""}>← Slide sebelumnya</button>
        <strong>Slide ${presentationLabel(i)} · ${PRESENTATION_ORDER.indexOf(i)+1}/${PRESENTATION_ORDER.length}</strong>
        <button class="btn primary" data-slide-step="1" ${PRESENTATION_ORDER.indexOf(i)===PRESENTATION_ORDER.length-1||!enabled?"disabled":""}>Slide berikutnya →</button>
      </div>
      <div class="theory-step-picker" role="group" aria-label="Pilih slide">
        ${PRESENTATION_ORDER.map(n=>`<button class="theory-dot" data-slide="${n}" aria-pressed="${n===i}" title="${escapeHtml(photoDetail(n)?.title||THEORY_SLIDES[n]?.title||"Foto")}" ${!enabled?"disabled":""}>${presentationLabel(n)}</button>`).join("")}
      </div>
      <div class="actions">
        <button class="btn primary" data-present-mode="simulator" ${!enabled?"disabled":""}>◉ Mulai simulator kamera →</button>
        <span class="small-note">Membuka simulator tanpa mengubah hasil latihan peserta.</span>
      </div>
    `:`
      <div class="trainer-theory-compact">
        <div><strong>Mode simulator kamera sedang aktif</strong>
          <p class="small-note">Panel pengaturan kamera berada tepat di bawah ini. Anda dapat kembali ke slide teori kapan saja.</p></div>
        <button class="btn subtle" data-present-mode="theory" ${!enabled?"disabled":""}>← Kembali ke slide teori</button>
      </div>
    `}
    <p id="presentation-save-status" role="status" class="small-note">${!stageLive?"Slide tersimpan, tetapi belum ditayangkan sampai tahap 01 dibuka.":p.view==="theory"?"Tampilan LCD: slide teori.":"Tampilan LCD: simulator."}</p>
  </section>`;
}
function cameraPage(){
const cam=state.camera;
return `<div class="participant-camera-page">${titleBlock("kamera")}<div class="card participant-camera-card"><div class="info participant-camera-intro"><b>Eksperimen:</b> geser bukaan, rana, dan ISO satu per satu. Perhatikan perubahan ketajaman, gerak, dan kecerahan. Adegan ini <b>ilustrasi simulasi</b>, bukan foto sesungguhnya.</div><div class="participant-camera-image">${photoSceneHTML("cameraScene")}</div><div class="statline"><div><span>Perubahan exposure dibanding f/2.8 · 1/125 · ISO 200</span><div class="small-note" style="color:#ccd2d5">Pengaruh terang-gelap dihitung bersama, seperti exposure triangle.</div></div><strong id="ev">0 EV</strong></div><div class="control-grid participant-camera-controls"><div class="control"><label for="aperture">Bukaan / aperture <output id="apertureValue">f/${APERTURE[cam.a]}</output></label><input id="aperture" type="range" min="0" max="6" value="${cam.a}" step="1"><small id="apertureHelp">Kedalaman ruang</small></div><div class="control"><label for="shutter">Shutter speed <output id="shutterValue">${SHUTTERS[cam.s].l}s</output></label><input id="shutter" type="range" min="0" max="6" value="${cam.s}" step="1"><small id="shutterHelp">Ketajaman gerak</small></div><div class="control"><label for="iso">ISO <output id="isoValue">${ISOS[cam.i]}</output></label><input id="iso" type="range" min="0" max="6" value="${cam.i}" step="1"><small id="isoHelp">Noise dan sensitivitas efektif</small></div></div><div class="actions participant-camera-actions"><button id="reset-camera" class="btn subtle">↺ Reset kamera</button><button id="save-camera" class="btn primary">Simpan eksperimen ✓</button></div></div><div class="grid two participant-camera-notes"><div class="card"><h3>💡 Bukaan lensa</h3><p class="small-note">f-number kecil berarti bukaan besar: lebih banyak cahaya dan area fokus yang lebih tipis. Pada banyak HP, bukaan fisik tetap. Di simulator ini semua pilihan tetap bisa dicoba.</p></div><div class="card"><h3>⚡ Rana & ISO</h3><p class="small-note">Rana lebih cepat bisa membekukan gerakan tetapi mengurangi cahaya. ISO tinggi membantu pemotretan gelap, namun biasanya meningkatkan noise. Pengaturan nyata bergantung jenis kamera dan kondisi lokasi.</p></div></div></div>`;
}
function exposureFor(cam){
  const aperture=APERTURE[cam.a],shutter=SHUTTERS[cam.s].t,iso=ISOS[cam.i];
  return Math.log2((shutter/(1/125))*Math.pow(2.8/aperture,2)*(iso/200));
}
function exposureText(cam){
  const ev=exposureFor(cam);
  return `${ev>0?"+":""}${ev.toFixed(1)} EV`;
}
function paintCameraScene(sc,cam){
  if(!sc)return;
  const aperture=APERTURE[cam.a],shutter=SHUTTERS[cam.s].t,iso=ISOS[cam.i],ev=exposureFor(cam);
  const bgBlur=Math.max(0,Math.min(8,(8-aperture)*1.3));
  const motionBlur=Math.max(0,Math.min(18,(shutter*125-1)*2));
  if(sc.classList.contains("photo-camera-scene")){
    const main=sc.querySelector(".photo-main");
    const photo=cam.a<=1?"aperture-lebar":cam.a>=4?"aperture-sempit":"base";
    const next=cameraPhotoUrl(photo);
    if(main.getAttribute("src")!==next)main.setAttribute("src",next);
    const movement=sc.querySelector(".photo-motion");
    const movePhoto=cam.s<=2?"shutter-lambat":"shutter-cepat";
    const moveSrc=cameraPhotoUrl(movePhoto);
    if(movement.getAttribute("src")!==moveSrc)movement.setAttribute("src",moveSrc);
    movement.style.opacity=cam.s===3?"0":String(Math.min(.96,Math.abs(cam.s-3)*.32));
  } else {
    sc.querySelector(".back").style.filter=`blur(${bgBlur.toFixed(1)}px)`;
    sc.querySelector(".motion").style.filter=`blur(${motionBlur.toFixed(1)}px)`;
  }
  sc.querySelector(".exposure").style.background=ev<0
    ?`rgba(0,0,0,${Math.min(.72,-ev*.115)})`
    :`rgba(255,255,240,${Math.min(.68,ev*.105)})`;
  const canvas=sc.querySelector(".noise"),ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(iso>400){
    const pixels=ctx.createImageData(canvas.width,canvas.height),d=pixels.data;
    let seed=12271+cam.i*8137;
    const alpha=Math.min(120,(cam.i-2)*23);
    for(let j=0;j<d.length;j+=4){
      seed=(1664525*seed+1013904223)>>>0;
      const gray=(seed>>>16)&255;
      d[j]=gray;d[j+1]=gray;d[j+2]=gray;d[j+3]=alpha;
    }
    ctx.putImageData(pixels,0,0);
  }
}
function updateCamera(){
  const cam=state.camera,sc=$("#cameraScene");
  if(!sc)return;
  paintCameraScene(sc,cam);
  $("#ev").textContent=exposureText(cam);
  $("#apertureValue").textContent=`f/${APERTURE[cam.a]}`;
  $("#shutterValue").textContent=`${SHUTTERS[cam.s].l}s`;
  $("#isoValue").textContent=`${ISOS[cam.i]}`;
  $("#apertureHelp").textContent=APERTURE[cam.a]<4?"Latar cenderung semakin blur":APERTURE[cam.a]>8?"Area fokus tampak lebih luas":"Kedalaman ruang menengah";
  $("#shutterHelp").textContent=SHUTTERS[cam.s].t>=1/30?"Gerak tampak kabur":SHUTTERS[cam.s].t<=1/500?"Gerak lebih mudah dibekukan":"Perhatikan gerakan tangan";
  $("#isoHelp").textContent=ISOS[cam.i]>=1600?"Noise semakin terlihat":ISOS[cam.i]<=200?"Noise relatif rendah":"Penguatan cahaya meningkat";
}
function compositionSlideContent(index,variant="lcd"){
 const slide=compositionSlide(index);
 return `<div class="composition-slide-layout composition-slide-${variant}">
 <div class="composition-slide-copy"><span class="theory-kicker">BAB 2 · ${escapeHtml(slide.eyebrow)} · ${compositionLabel(index)} / ${COMPOSITION_SLIDES.length}</span>
 <h2>${escapeHtml(slide.title)}</h2><p class="theory-lead">${escapeHtml(slide.lead)}</p>
 <ul class="theory-points">${slide.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
 <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(slide.prompt)}</strong></div></div>
 ${compositionVisual(index)}</div>`;
}
function compositionParticipantPage(i=state.presentation.slide){
 return `${titleBlock("komposisi")}<div class="card composition-participant-theory">
 <p class="small-note">Amati foto dan diskusikan pertanyaannya. Setelah teori, trainer membuka latihan mandiri.</p>
 ${compositionSlideContent(i,"participant")}</div>`;
}
function compositionTrainerPanel(data,isMentor){
 const active=data.stage===2,enabled=!isMentor;
 const i=state.presentation.slide>=COMPOSITION_START&&state.presentation.slide<=COMPOSITION_END?state.presentation.slide:COMPOSITION_START;
 const slide=compositionSlide(i),theory=state.presentation.view==="theory";
 return `<section class="card composition-trainer-card"><div class="trainer-demo-heading">
 <div><span class="eyebrow">PRESENTASI INTERAKTIF · BAB 2</span><h2>Bahasa Visual: Komposisi Foto</h2><p class="small-note">Sebelas tampilan foto dokumentasi, termasuk sub-slide perbandingan, dan catatan pemandu diskusi.</p></div>
 <span class="pill ${active?"green":"gray"}">${active?"● TAHAP 02 AKTIF":"BUKA TAHAP 02"}</span></div>
 ${theory?`<div class="composition-trainer-preview"><div class="composition-trainer-notes"><span class="eyebrow">SLIDE ${compositionLabel(i)} / ${COMPOSITION_SLIDES.length}</span><h3>${escapeHtml(slide.title)}</h3><div class="trainer-theory-note"><b>CATATAN TRAINER</b><p>${escapeHtml(slide.note)}</p></div></div>
 ${compositionSlideContent(i,"trainer")}</div>
 <div class="trainer-slide-nav"><button class="btn subtle" data-comp-slide-step="-1" ${i===COMPOSITION_START||!enabled?"disabled":""}>← Sebelumnya</button><strong>Slide ${compositionLabel(i)} / ${COMPOSITION_SLIDES.length}</strong><button class="btn primary" data-comp-slide-step="1" ${i===COMPOSITION_END||!enabled?"disabled":""}>Berikutnya →</button></div>
 <div class="theory-step-picker">${COMPOSITION_SLIDES.map((x,j)=>`<button class="theory-dot" data-comp-slide="${COMPOSITION_START+j}" aria-pressed="${i===COMPOSITION_START+j}" ${!enabled?"disabled":""} title="${escapeHtml(x.title)}">${compositionLabel(COMPOSITION_START+j)}</button>`).join("")}</div>
 <div class="actions"><button class="btn primary" data-comp-mode="simulator" ${!enabled?"disabled":""}>Buka latihan komposisi peserta →</button></div>`:
 `<div class="trainer-theory-compact"><div><strong>Latihan peserta sedang terbuka</strong><p class="small-note">Peserta memilih framing, jarak, dan sudut; lalu menjelaskan alasannya.</p></div><button class="btn subtle" data-comp-mode="theory" ${!enabled?"disabled":""}>← Kembali ke slide</button></div>${compositionTrainerDemoPanel(data,isMentor)}`}
 <p id="composition-status" class="small-note">${active?"LCD dan peserta mengikuti mode ini.":"Buka tahap 02 untuk menampilkan di LCD."}</p></section>`;
}
function compositionExample(c){
 const selected=c.preview||"distance";
 const maps={
  position:{left:["8798","Tokoh di kiri: ruang bercerita"],center:["8851","Pemain lebih dominan di tengah"],right:["8980","Tokoh di samping materi ajar"]},
  distance:{wide:["9053","Foto lebar: ruang dan kegiatan"],medium:["9010","Foto sedang: hubungan peserta dan instruktur"],close:["8878","Foto dekat: bentuk instrumen bambu"]},
  angle:{eye:["9053","Tinjauan ruang dari posisi biasa"],low:["8868","Sudut dengan foreground besar"],high:["8878","Sudut lebih tinggi mengamati pola alat"]},
  frame:{"true":["8824","Bingkai alami dari alat musik"],"false":["9053","Tanpa bingkai foreground yang dominan"]}
 };
 const value=selected==="frame"?String(!!c.frame):String(c[selected]||"wide");
 const [photo,caption]=maps[selected]?.[value]||maps.distance.wide;
 return {photo,caption};
}
function compositionDemoPreview(c,id){
 const example=compositionExample(c);
 return `<div class="composition-live-scene"><div class="comp-visual ${c.grid?"comp-grid-on":""}" id="${id}">
 <figure><div class="comp-photo-stage"><img src="/lensa-muda/assets/composition/sangihe-2017-${example.photo}.webp" alt="Foto dokumentasi Sangihe: ${escapeHtml(example.caption)}"><div class="comp-rule-grid"></div></div>
 <figcaption>Musik bambu Sangihe, September 2017 · Foto: Ronny Adolof Buol</figcaption></figure></div>
 <strong class="comp-example-caption" id="${id}-caption">${escapeHtml(example.caption)}</strong></div>`;
}
function compositionDemoControls(c,disabled){
 return `<div class="composition-demo-controls">
 <div class="composition-setting"><strong>Garis dan framing</strong><div class="choice-set">
 <button class="choice" data-demo-comp="grid" aria-pressed="${c.grid}" ${disabled?"disabled":""}>▦ Garis sepertiga</button>
 <button class="choice" data-demo-comp="frame" aria-pressed="${c.frame}" ${disabled?"disabled":""}>▣ Framing</button></div></div>
 ${[["position","Letak subjek",[["left","Kiri"],["center","Tengah"],["right","Kanan"]]],["distance","Jarak pengambilan",[["wide","Lebar"],["medium","Sedang"],["close","Dekat"]]],["angle","Sudut pandang",[["eye","Setinggi mata"],["low","Rendah"],["high","Tinggi"]]]].map(([key,label,choices])=>`<div class="composition-setting"><strong>${label}</strong><div class="choice-set">${choices.map(([value,title])=>`<button class="choice" data-demo-${key}="${value}" aria-pressed="${c[key]===value}" ${disabled?"disabled":""}>${title}</button>`).join("")}</div></div>`).join("")}
 <button class="btn subtle" id="reset-demo-composition" ${disabled?"disabled":""}>↺ Atur ulang demonstrasi</button></div>`;
}
function compositionTrainerDemoPanel(data,isMentor){
 const c=state.demoComposition;
 return `<section class="composition-trainer-demo" aria-label="Demonstrasi komposisi langsung">
 <div class="composition-demo-heading"><h3>Demonstrasi komposisi langsung</h3><p class="small-note">Klik tombol untuk mengubah contoh pada LCD. Latihan pribadi peserta tetap mandiri.</p></div>
 <div class="composition-demo-layout">${compositionDemoPreview(c,"trainerCompositionDemo")}${compositionDemoControls(c,isMentor)}</div>
 <p class="small-note" id="composition-demo-status">Perubahan sinkron melalui koneksi kelas.</p></section>`;
}
function compositionPage(){
 const c=state.composition;
 return `${titleBlock("komposisi")}<div class="card composition-lab-card">
 <div class="composition-lab-intro"><span class="eyebrow">LABORATORIUM KOMPOSISI</span><h2>Bandingkan foto. Jelaskan pilihanmu.</h2><p>Ketuk pengaturan untuk melihat contoh dokumentasi yang berbeda dari kegiatan musik bambu di Sangihe. Bukan satu foto yang diubah menjadi adegan lain: setiap pilihan menampilkan foto asli yang membantu memahami tekniknya.</p></div>
 <div class="composition-lab-layout"><div class="composition-lab-image"><div class="comp-visual ${c.grid?"comp-grid-on":""}" id="compositionScene"><figure><div class="comp-photo-stage"><img id="comp-example-image" src="/lensa-muda/assets/composition/sangihe-2017-${compositionExample(c).photo}.webp" alt="Contoh foto dokumentasi musik bambu Sangihe" decoding="async"><div class="comp-rule-grid"></div></div><figcaption>Musik bambu Sangihe, September 2017 · Foto: Ronny Adolof Buol</figcaption></figure></div><p class="comp-example-caption" id="comp-example-caption">${compositionExample(c).caption}</p><p class="small-note">Kumpulan foto asli dari satu rangkaian kegiatan. Pengaturan menampilkan contoh teknik, bukan merekayasa subjek di foto.</p></div>
 <div class="composition-lab-controls">
 <div class="composition-setting"><strong>01 · Garis dan bingkai</strong><div class="choice-set"><button class="choice" data-comp="grid" aria-pressed="${c.grid}">▦ Garis sepertiga</button><button class="choice" data-comp="frame" aria-pressed="${c.frame}">▣ Framing</button></div></div>
 <div class="composition-setting"><strong>02 · Letak subjek</strong><div class="choice-set">${["left","center","right"].map((p,i)=>`<button class="choice" data-position="${p}" aria-pressed="${c.position===p}">${["Kiri","Tengah","Kanan"][i]}</button>`).join("")}</div></div>
 <div class="composition-setting"><strong>03 · Jarak pengambilan</strong><div class="choice-set">${[["wide","Lebar"],["medium","Sedang"],["close","Dekat"]].map(([v,t])=>`<button class="choice" data-distance="${v}" aria-pressed="${c.distance===v}">${t}</button>`).join("")}</div></div>
 <div class="composition-setting"><strong>04 · Sudut pandang</strong><div class="choice-set">${[["eye","Setinggi mata"],["low","Rendah"],["high","Tinggi"]].map(([v,t])=>`<button class="choice" data-angle="${v}" aria-pressed="${c.angle===v}">${t}</button>`).join("")}</div></div>
 </div></div>
 <div class="composition-reflection"><label for="comp-reason">Mengapa komposisi itu dipilih?</label><textarea id="comp-reason" rows="3" placeholder="Informasi apa yang ingin kamu perlihatkan: tokoh, tempat, alat kerja, atau detail?">${escapeHtml(c.reason||"")}</textarea><small>Minimal 15 karakter. Jelaskan informasi yang diperlihatkan.</small></div>
 <div class="actions"><button class="btn subtle" id="reset-comp">↺ Atur ulang</button><button class="btn primary" id="save-comp">Simpan keputusan komposisi ✓</button></div></div>
 <div class="grid two composition-context"><div class="card"><h3>Informasi dalam bingkai</h3><p class="small-note">Lebar memperlihatkan tempat. Dekat menyoroti proses. Jangan hilangkan konteks penting.</p></div><div class="card"><h3>Hormati budaya</h3><p class="small-note">Berpindah posisi boleh, tetapi jangan mengganggu ritual atau mengatur ulang kejadian demi foto.</p></div></div>`;
}
function updateComposition(){
 const sc=$("#compositionScene");if(!sc)return;
 sc.classList.toggle("comp-grid-on",!!state.composition.grid);
 const example=compositionExample(state.composition);
 const image=$("#comp-example-image"),caption=$("#comp-example-caption");
 if(image){
  const url="/lensa-muda/assets/composition/sangihe-2017-"+example.photo+".webp";
  if(!image.src.endsWith(url))image.src=url;
  image.alt="Dokumentasi Sangihe, "+example.caption;
 }
 if(caption)caption.textContent=example.caption;
}
function edfatSlideHTML(index,variant="lcd"){
 const data=edfatSlide(index);
 return `<div class="edfat-slide edfat-slide-${variant}">
 <div class="edfat-slide-copy"><span class="theory-kicker">BAB 3 · ${escapeHtml(data.tag)} · ${edfatLabel(index)}/${EDFAT_SLIDES.length}</span>
 <h2>${escapeHtml(data.title)}</h2><p class="edfat-lead">${escapeHtml(data.lead)}</p>
 <ul class="edfat-points">${data.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
 <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(data.prompt)}</strong></div></div>
 ${edfatVisual(index)}</div>`;
}
function edfatParticipantSlide(i=state.presentation.slide){
 return `${titleBlock("edfat")}<section class="card edfat-learner-theory">
 <p class="small-note">Amati foto dan diskusikan pertanyaannya. Trainer akan membuka Misi Detektif untuk latihan mandiri.</p>
 ${edfatSlideHTML(i,"participant")}</section>`;
}
function edfatTrainerPanel(data,isMentor){
 const active=data.stage===3;
 const i=state.presentation.slide>=EDFAT_START&&state.presentation.slide<=EDFAT_END?state.presentation.slide:EDFAT_START;
 const slide=edfatSlide(i),theory=state.presentation.view==="theory";
 return `<section class="card edfat-trainer-card"><div class="trainer-demo-heading">
 <div><span class="eyebrow">PRESENTASI INTERAKTIF · BAB 3</span><h2>Detektif EDFAT</h2><p class="small-note">Tujuh slide observasi, satu foto besar per slide, lalu lima misi foto individu.</p></div>
 <span class="pill ${active?"green":"gray"}">${active?"● TAHAP 03 AKTIF":"BUKA TAHAP 03"}</span></div>
 ${theory?`<div class="edfat-trainer-preview">
 <div class="edfat-trainer-notes"><span class="eyebrow">SLIDE ${edfatLabel(i)}/07</span><h3>${escapeHtml(slide.title)}</h3>
 <div class="trainer-theory-note"><b>PANDUAN TRAINER</b><p>${escapeHtml(slide.trainer)}</p></div></div>
 ${edfatVisual(i)}</div>
 <div class="trainer-slide-nav"><button class="btn subtle" data-edfat-slide-step="-1" ${i===EDFAT_START||isMentor?"disabled":""}>← Sebelumnya</button><strong>Slide ${edfatLabel(i)} / 07</strong><button class="btn primary" data-edfat-slide-step="1" ${i===EDFAT_END||isMentor?"disabled":""}>Berikutnya →</button></div>
 <div class="edfat-slide-dots">${EDFAT_SLIDES.map((x,j)=>`<button class="theory-dot" data-edfat-slide="${EDFAT_START+j}" aria-pressed="${i===EDFAT_START+j}" ${isMentor?"disabled":""} title="${escapeHtml(x.title)}">${edfatLabel(EDFAT_START+j)}</button>`).join("")}</div>
 <div class="actions"><button class="btn primary" data-edfat-mode="simulator" ${isMentor?"disabled":""}>Buka Misi Detektif peserta →</button></div>`:
 `<div class="trainer-theory-compact"><div><strong>Misi Detektif sedang terbuka</strong><p class="small-note">Peserta menilai lima foto, memilih pendekatan dominan, dan menulis alasan. Jawaban terlihat pada manajemen peserta.</p></div>
 <button class="btn subtle" data-edfat-mode="theory" ${isMentor?"disabled":""}>← Kembali ke slide</button></div>
 <div class="edfat-trainer-mission"><span class="eyebrow">TANTANGAN UNTUK DISKUSI KELAS</span>
 <p>Apakah satu foto bisa mengandung lebih dari satu unsur EDFAT? Mintalah peserta menjelaskan informasi apa yang terlihat.</p></div>`}
 <p class="small-note">LCD dan peserta mengikuti mode trainer. Misi peserta dikerjakan sendiri pada perangkat masing-masing.</p>
 </section>`;
}
function edfatPage(){
 const saved=state.work.edfat||{},answers=saved.answers||{},reasons=saved.reasons||{};
 const cases=EDFAT_CASES.map((x,i)=>`<section class="edfat-case card" data-edfat-case="${x.id}">
 <div class="edfat-case-top"><span class="eyebrow">KASUS ${String(i+1).padStart(2,"0")} / ${EDFAT_CASES.length}</span><h3>${escapeHtml(x.question)}</h3></div>
 <figure class="edfat-figure"><div class="edfat-photo"><img src="${edfatPhoto(x.image)}" alt="Foto kasus ${i+1} dari dokumentasi musik bambu Sangihe" loading="lazy" decoding="async"></div>
 <figcaption>Foto: Ronny Adolof Buol · Sangihe, September 2017</figcaption></figure>
 <fieldset class="edfat-options"><legend>Pendekatan yang paling menonjol</legend>
 ${EDFAT_OPTIONS.map(option=>`<label class="edfat-option"><input type="radio" name="edfat-${x.id}" value="${option}" data-edfat-choice="${x.id}" ${answers[x.id]===option?"checked":""}><span>${option}</span></label>`).join("")}</fieldset>
 <label for="edfat-reason-${x.id}">Petunjuk apa pada foto yang mendukung pilihanmu?</label>
 <textarea id="edfat-reason-${x.id}" data-edfat-reason="${x.id}" rows="2" placeholder="Tuliskan apa yang benar-benar terlihat pada foto…">${escapeHtml(reasons[x.id]||"")}</textarea>
 </section>`).join("");
 return `${titleBlock("edfat")}<div class="card edfat-mission-intro"><span class="eyebrow">MISI DETEKTIF · 5 KASUS FOTO</span>
 <h2>Satu foto, banyak petunjuk.</h2><p>Amati setiap foto musik bambu Sangihe. Pilih pendekatan EDFAT yang paling menonjol, lalu jelaskan petunjuk visual yang mendukung jawabanmu.</p>
 <p class="small-note">EDFAT bukan label mutlak. Penilaian terutama pada alasan pengamatan, bukan sekadar pilihan istilah.</p></div>
 <div class="edfat-case-list">${cases}</div>
 <div class="card edfat-submit"><p><strong>${Object.keys(answers).length} dari ${EDFAT_CASES.length} kasus dipilih.</strong> Alasan harus memuat minimal 12 karakter setiap kasus.</p>
 <div class="actions"><button id="save-edfat" class="btn primary">Simpan hasil penyelidikan ✓</button></div><p id="edfat-feedback" class="small-note" role="status" aria-live="polite"></p></div>`;
}
function shotSvg(i){
const palettes=[["#779da2","#e4c08f","#ae633e"],["#697c7d","#c9aa7c","#af6d38"],["#496e73","#e0bb8e","#cc6638"],["#8a9d92","#dcc6a3","#976a52"],["#485b5d","#d4ad77","#9c5132"],["#6d817c","#e2af7b","#b87948"]];
const [bg,ground,accent]=palettes[i%palettes.length];
const near=[3,4,5,9,10].includes(i),detail=[4,5,10].includes(i),crowd=[1,6,7,8].includes(i);
const scale=near?1.4:1, shift=i%3===0?45:i%3===1?-30:0;
return `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi latihan foto cerita"><rect width="600" height="400" fill="${bg}"/><rect x="0" y="265" width="600" height="135" fill="${ground}"/><rect x="25" y="39" width="210" height="185" rx="5" fill="#34555b" stroke="#d2b890" stroke-width="10"/><rect x="42" y="55" width="175" height="150" fill="#d4d6b8"/><path d="M42 185 90 123l35 24 46-55 46 59v54H42" fill="#89a6a0"/><path d="M0 38h600" stroke="#524c3e" stroke-width="17"/><path d="M470 42v90M540 42v100" stroke="#d4b37c" stroke-width="6"/><path d="M452 136q15-31 36 0v30h-36zM520 143q15-29 36 0v29h-36z" fill="${accent}"/><g transform="translate(${shift} 0) translate(${detail?-60:30} ${detail?-55:5}) scale(${scale})"><ellipse cx="315" cy="340" rx="145" ry="22" fill="#3a3a3a" opacity=".3"/><path d="M225 280h220v28H225zM242 306h15v45h-15zM418 306h14v45h-14z" fill="#725039"/><path d="M283 290q-16-96 26-127 43-20 81 20l28 107z" fill="${accent}"/><path d="M304 166q-29-34-7-71 23-31 61-11 21 31 8 61l-17 26v15h-41z" fill="#c28c69"/><path d="M285 119q-15-53 38-59 55-5 54 56-33-27-53-24-15 20-39 27" fill="#282b2c"/><path d="M313 272q39-13 69-8" stroke="#cd9b73" stroke-width="18" stroke-linecap="round"/><path d="M362 273 415 243" stroke="#cfad8e" stroke-width="14" stroke-linecap="round"/><path d="M330 288 413 275 430 303 352 314" fill="#ab7648"/></g>${crowd?`<g fill="#a95838"><circle cx="515" cy="189" r="26"/><path d="M481 286q0-67 35-65 38 0 49 65z"/></g>`:""}<path d="M0 381h600" stroke="#856750" stroke-width="8" opacity=".3"/><text x="18" y="383" fill="#fff" font-family="Arial" font-size="13" font-weight="bold">ILUSTRASI LATIHAN • ${String(i+1).padStart(2,"0")}</text></svg>`;
}
function shotSrc(i){return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shotSvg(i))}`}
function storyTheoryContent(index,variant="lcd"){
 const x=storySlide(index);
 return `<div class="story-theory-layout story-theory-${variant}"><div class="story-theory-copy">
 <span class="theory-kicker">BAB 4 · ${escapeHtml(x.tag)} · ${storyLabel(index)} / ${STORY_SLIDES.length}</span>
 <h2>${escapeHtml(x.title)}</h2><p class="story-theory-lead">${escapeHtml(x.lead)}</p>
 <ul class="story-theory-points">${x.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
 <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(x.prompt)}</strong></div></div>
 ${storySlideVisual(index)}</div>`;
}
function storyParticipantSlide(i=state.presentation.slide){
 return `${titleBlock("story")}<section class="card story-learner-theory">
 <p class="small-note">Diskusikan pilihan editorial bersama trainer. Setelah presentasi, kamu akan memilih sembilan bingkai sendiri.</p>
 ${storyTheoryContent(i,"participant")}</section>`;
}
function storyTrainerPanel(data,isMentor){
 const i=state.presentation.slide>=STORY_START&&state.presentation.slide<=STORY_END?state.presentation.slide:STORY_START;
 const x=storySlide(i),theory=state.presentation.view==="theory";
 return `<section class="card story-trainer-card"><div class="trainer-demo-heading"><div><span class="eyebrow">PRESENTASI · BAB 4</span>
 <h2>Sembilan Bingkai</h2><p class="small-note">Enam slide mengedit cerita, dilanjutkan latihan 9 dari 12 foto dokumentasi.</p></div>
 <span class="pill ${data.stage>=4?"green":"gray"}">${data.stage>=4?"● MODUL 04 SIAP":"BUKA TAHAP 04"}</span></div>
 ${theory?`<div class="story-trainer-preview"><div class="story-trainer-notes"><span class="eyebrow">SLIDE ${storyLabel(i)} / 06</span><h3>${escapeHtml(x.title)}</h3>
 <div class="trainer-theory-note"><b>CATATAN TRAINER</b><p>${escapeHtml(x.note)}</p></div></div>${storySlideVisual(i)}</div>
 <div class="trainer-slide-nav"><button class="btn subtle" data-story-step="-1" ${i===STORY_START||isMentor?"disabled":""}>← Sebelumnya</button><strong>Slide ${storyLabel(i)} / 06</strong>
 <button class="btn primary" data-story-step="1" ${i===STORY_END||isMentor?"disabled":""}>Berikutnya →</button></div>
 <div class="story-slide-dots">${STORY_SLIDES.map((x,j)=>`<button class="theory-dot" data-story-slide="${STORY_START+j}" aria-pressed="${i===STORY_START+j}" ${isMentor?"disabled":""}>${storyLabel(STORY_START+j)}</button>`).join("")}</div>
 <div class="actions"><button class="btn primary" data-story-mode="simulator" ${isMentor?"disabled":""}>Buka meja editor peserta →</button></div>`:
 `<div class="trainer-theory-compact"><div><strong>Meja editor peserta sedang terbuka</strong><p class="small-note">Peserta memilih, mengurutkan sembilan foto, memberi judul dan alasan editorial.</p></div>
 <button class="btn subtle" data-story-mode="theory" ${isMentor?"disabled":""}>← Kembali ke slide</button></div>
 <div class="story-trainer-tip"><b>DISKUSI</b><p>Mintalah peserta menjelaskan foto yang tidak dipilih. Kandidat 12 adalah detail alternatif dari foto 5, bukan foto peristiwa lain.</p></div>`}
 </section>`;
}
function captionTheoryContent(index,variant="lcd"){
 const slide=captionSlide(index);
 return `<div class="caption-theory-layout caption-theory-${variant}"><div class="caption-theory-copy">
  <span class="theory-kicker">BAB 5 · ${escapeHtml(slide.tag)} · ${captionLabel(index)} / ${CAPTION_SLIDES.length}</span>
  <h2>${escapeHtml(slide.title)}</h2><p class="caption-theory-lead">${escapeHtml(slide.lead)}</p>
  <ul class="caption-theory-points">${slide.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
  <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(slide.prompt)}</strong></div>
 </div>${captionVisual(index)}</div>`;
}
function captionParticipantSlide(index){
 return `${titleBlock("caption")}<section class="card caption-learner-theory">
   <p class="small-note">Tinjau foto dan diskusikan pertanyaan bersama kelas. Kamu juga boleh membuka teori sendiri lalu kembali menulis.</p>
   ${captionTheoryContent(index,"participant")}</section>`;
}
function captionTrainerPanel(data,isMentor){
 const i=state.presentation.slide>=CAPTION_START&&state.presentation.slide<=CAPTION_END?state.presentation.slide:CAPTION_START;
 const x=captionSlide(i),theory=state.presentation.view==="theory";
 return `<section class="card caption-trainer-card"><div class="trainer-demo-heading">
 <div><span class="eyebrow">PRESENTASI · BAB 5</span><h2>Caption Lab</h2>
 <p class="small-note">Enam slide untuk memahami 5W+1H, verifikasi, dan menulis narasi foto dari sembilan bingkai.</p></div>
 <span class="pill green">● MODUL 05 SIAP</span></div>
 ${theory?`<div class="caption-trainer-preview"><div class="caption-trainer-notes">
   <span class="eyebrow">SLIDE ${captionLabel(i)} / 06</span><h3>${escapeHtml(x.title)}</h3>
   <div class="trainer-theory-note"><b>CATATAN TRAINER</b><p>${escapeHtml(x.note)}</p></div></div>
   ${captionVisual(i)}</div><div class="trainer-slide-nav">
   <button class="btn subtle" data-caption-step="-1" ${i===CAPTION_START||isMentor?"disabled":""}>← Sebelumnya</button>
   <strong>Slide ${captionLabel(i)} / 06</strong>
   <button class="btn primary" data-caption-step="1" ${i===CAPTION_END||isMentor?"disabled":""}>Berikutnya →</button></div>
   <div class="story-slide-dots">${CAPTION_SLIDES.map((x,j)=>`<button class="theory-dot" data-caption-slide="${CAPTION_START+j}" aria-pressed="${i===CAPTION_START+j}" ${isMentor?"disabled":""}>${captionLabel(CAPTION_START+j)}</button>`).join("")}</div>
   <div class="actions"><button class="btn primary" data-caption-mode="simulator" ${isMentor?"disabled":""}>Buka Caption Lab peserta →</button></div>`
 :`<div class="trainer-theory-compact"><div><strong>Caption Lab mandiri sedang terbuka</strong>
 <p class="small-note">Peserta meninjau sembilan foto, mencatat 5W+1H, dan menyusun narasi. Perubahan slide trainer tidak mengganggu mereka.</p></div>
 <button class="btn subtle" data-caption-mode="theory" ${isMentor?"disabled":""}>← Kembali ke slide</button></div>`}
 </section>`;
}
function renderStoryShot(x,chosen=false,pos=0,total=0){
 if(!x)return "";
 return `<article class="story-candidate ${chosen?"story-candidate-selected":""}">
 <div class="story-candidate-photo">${storyImage(x,"Foto "+x.id+": "+x.title)}${chosen?`<span class="story-position">${String(pos+1).padStart(2,"0")}</span>`:""}</div>
 <div class="story-candidate-body"><span class="eyebrow">${escapeHtml(x.function)} · ${escapeHtml(x.role)}</span>
 <h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.desc)}</p><div class="story-candidate-actions">
 ${chosen?`<button data-move="${x.id}" data-dir="-1" ${pos===0?"disabled":""} aria-label="Geser foto ke depan">↑</button>
 <button data-move="${x.id}" data-dir="1" ${pos===total-1?"disabled":""} aria-label="Geser foto ke belakang">↓</button>
 <button data-remove="${x.id}">Keluarkan</button>`:`<button data-pick="${x.id}">+ Pilih foto</button>`}</div></div></article>`;
}
function storyPage(){
 const saved=state.work.story||{},selected=Array.isArray(saved.selected)?saved.selected.filter(id=>STORY_BANK.some(x=>x.id===id)):[];
 const remaining=STORY_BANK.filter(x=>!selected.includes(x.id));
 return `${titleBlock("story")}<section class="card story-editor-intro">
 <span class="eyebrow">MEJA EDITOR · SEMBILAN BINGKAI · ${APP_RELEASE}</span><h2>12 kandidat. Pilih 9 yang bercerita.</h2>
 <p>Jadilah editor foto latihan musik bambu Sangihe. Pilih sembilan foto yang saling melengkapi, susun urutannya, lalu jelaskan arah cerita.</p>
 <p class="small-note">Foto asli: Ronny Adolof Buol, September 2017. Kandidat 12 merupakan potongan dari foto 5 yang sama. Susunan naratif bukan klaim urutan kronologis yang sudah terverifikasi.</p></section>
 <section class="card story-editor-workspace"><div class="story-head"><h3>Rangkaian cerita kamu</h3><span class="counter" id="story-count">${selected.length} / 9 dipilih</span></div>
 <p class="small-note">Gunakan tombol ↑ dan ↓ untuk mengurutkan foto.</p>
 <div class="story-sequence" id="selected-shots">${selected.map((id,i)=>renderStoryShot(STORY_BANK.find(x=>x.id===id),true,i,selected.length)).join("")||`<div class="story-empty">Belum ada foto. Pilih dari bank foto di bawah.</div>`}</div>
 <div class="story-editor-fields"><div class="field"><label for="story-title">Judul kerja cerita</label><input id="story-title" maxlength="110" value="${escapeHtml(saved.title||"")}" placeholder="Contoh: Menjaga bunyi bambu di Sangihe"></div>
 <div class="field"><label for="story-reason">Mengapa foto-foto ini dipilih dan disusun demikian?</label>
 <textarea id="story-reason" rows="4" placeholder="Jelaskan fungsi pembuka, perkembangan cerita, dan penutup…">${escapeHtml(saved.reason||"")}</textarea>
 <small>Minimal 30 karakter, tidak ada satu susunan yang mutlak benar.</small></div></div>
 <div class="actions"><button id="save-story" class="btn primary" ${selected.length===9?"":"disabled"}>Simpan sembilan foto ✓</button>
 <button id="reset-story" class="btn subtle">↺ Ulangi pilihan</button></div><p class="small-note" id="story-status" role="status" aria-live="polite"></p></section>
 <section class="card story-editor-bank"><div class="story-head"><h3>Bank foto dokumentasi</h3><span class="pill">${remaining.length} pilihan</span></div>
 <div class="story-bank-grid">${remaining.map(x=>renderStoryShot(x)).join("")||`<div class="story-empty">Semua foto sudah dipilih.</div>`}</div></section>
 <div class="info"><b>Catatan editor:</b> foto pembuka mengenalkan, bagian tengah mengembangkan, dan penutup memberi pemahaman. Jangan membuat cerita yang tidak didukung fakta.</div>`;
}
function ethicsTheoryContent(index,variant="lcd"){
 const x=ethicsSlide(index);
 return `<div class="ethics-theory-layout ethics-theory-${variant}">
 <div class="ethics-theory-copy"><span class="theory-kicker">BAB 6 · ${escapeHtml(x.tag)} · ${ethicsLabel(index)} / ${ETHICS_SLIDES.length}</span>
 <h2>${escapeHtml(x.title)}</h2><p class="ethics-theory-lead">${escapeHtml(x.lead)}</p>
 <ul class="ethics-theory-points">${x.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul>
 <div class="theory-question"><span>DISKUSI KELAS</span><strong>${escapeHtml(x.prompt)}</strong></div></div>
 ${ethicsVisual(index)}</div>`;
}
function ethicsParticipantSlide(index){
 return `${titleBlock("etika")}<section class="card ethics-learner-theory">
 <p class="small-note">Amati contoh foto, pikirkan dampaknya bagi orang yang dipotret, dan diskusikan pilihanmu. Latihan tetap bisa dibuka kapan saja.</p>
 ${ethicsTheoryContent(index,"participant")}</section>`;
}
function ethicsTrainerPanel(data,isMentor){
 const i=state.presentation.slide>=ETHICS_START&&state.presentation.slide<=ETHICS_END?state.presentation.slide:ETHICS_START;
 const x=ethicsSlide(i),theory=state.presentation.view==="theory";
 return `<section class="card ethics-trainer-card">
 <div class="trainer-demo-heading"><div><span class="eyebrow">PRESENTASI · BAB 6</span><h2>Etika & Tantangan</h2>
 <p class="small-note">Enam slide terakhir, empat skenario keputusan etis, dan rencana foto cerita peserta.</p></div>
 <span class="pill green">● MODUL 06 SIAP</span></div>
 ${theory?`<div class="ethics-trainer-preview"><div class="ethics-trainer-notes"><span class="eyebrow">SLIDE ${ethicsLabel(i)} / 06</span><h3>${escapeHtml(x.title)}</h3>
 <div class="trainer-theory-note"><b>CATATAN TRAINER</b><p>${escapeHtml(x.note)}</p></div></div>${ethicsVisual(i)}</div>
 <div class="trainer-slide-nav"><button class="btn subtle" data-ethics-step="-1" ${i===ETHICS_START||isMentor?"disabled":""}>← Sebelumnya</button><strong>Slide ${ethicsLabel(i)} / 06</strong>
 <button class="btn primary" data-ethics-step="1" ${i===ETHICS_END||isMentor?"disabled":""}>Berikutnya →</button></div>
 <div class="story-slide-dots">${ETHICS_SLIDES.map((x,j)=>`<button class="theory-dot" data-ethics-slide="${ETHICS_START+j}" aria-pressed="${i===ETHICS_START+j}" ${isMentor?"disabled":""}>${ethicsLabel(ETHICS_START+j)}</button>`).join("")}</div>
 <div class="actions"><button class="btn primary" data-ethics-mode="simulator" ${isMentor?"disabled":""}>Buka tantangan akhir peserta →</button></div>`:
 `<div class="trainer-theory-compact"><div><strong>Tantangan akhir sedang terbuka</strong>
 <p class="small-note">Peserta menyelesaikan empat situasi etis serta merencanakan liputan budaya. Trainer dapat membuka slide tanpa memindahkan pekerjaan mereka.</p></div>
 <button class="btn subtle" data-ethics-mode="theory" ${isMentor?"disabled":""}>← Kembali ke slide</button></div>`}
 </section>`;
}
function captionPhotoStrip(selected){
 return `<div class="caption-photo-strip">${selected.map((id,i)=>{
 const photo=STORY_BANK.find(x=>x.id===id);return !photo?"":`<figure class="caption-photo-tile">${storyImage(photo,"Foto urutan "+(i+1)+": "+photo.title)}
 <figcaption><b>${String(i+1).padStart(2,"0")}</b> ${escapeHtml(photo.title)}</figcaption></figure>`;
 }).join("")}</div>`;
}
function captionPage(){
 const saved=state.work.caption||{},draft=saved.captionText||"",story=state.work.story||{};
 const selected=Array.isArray(story.selected)?story.selected.filter(id=>STORY_BANK.some(x=>x.id===id)).slice(0,9):[];
 const count=countWords(draft),validStory=selected.length===9;
 return `${titleBlock("caption")}<section class="card caption-story-link">
 <span class="eyebrow">DARI MODUL 04 KE MODUL 05</span><h2>Foto yang kamu pilih, cerita yang kamu tulis.</h2>
 <p>${validStory?"Ini sembilan foto dari meja editormu, ditampilkan dalam urutan pilihanmu.":"Belum ada sembilan foto dari Modul 04. Kamu boleh mulai membuat catatan, tetapi sebaiknya lengkapi urutan fotomu lebih dulu."}</p>
 ${validStory?`<div class="caption-story-title"><b>Judul kerja:</b> ${escapeHtml(story.title||"Belum ada judul")}</div>
 ${captionPhotoStrip(selected)}`:`<div class="info">Buka <b>Sembilan Bingkai</b> melalui menu materi dan pilih tepat sembilan foto. Saat kembali ke Caption Lab, rangkaiannya akan tampil di sini.</div>`}
 <p class="small-note">Foto dokumentasi: Ronny Adolof Buol · Sangihe, September 2017. Sembilan bingkai menjadi referensi, bukan bukti otomatis seluruh klaim dalam tulisan.</p></section>
 <form id="caption-form" class="card caption-workspace">
 <div class="story-head"><h2>Catatan fakta · 5W + 1H</h2><span class="pill">6 unsur</span></div>
 <p class="small-note">Isi berdasarkan foto, catatan lapangan, dan informasi yang telah dipastikan. Jika masih belum diketahui, tulis “perlu verifikasi”. Jangan menebak.</p>
 <div class="field-row">${CAPTION_FIELDS.map(([key,label,placeholder])=>`<div class="field">
 <label for="cap-${key}">${label}</label><input id="cap-${key}" name="${key}" value="${escapeHtml(saved[key]||"")}" placeholder="${escapeHtml(placeholder)}" maxlength="500"></div>`).join("")}</div>
 <div class="field"><label for="caption-verification">Fakta yang masih perlu diverifikasi</label>
 <textarea id="caption-verification" name="verification" rows="3" maxlength="1800" placeholder="Contoh: nama dan peran orang dalam foto, nama lokasi yang lebih rinci, rincian penghargaan…">${escapeHtml(saved.verification||"")}</textarea>
 <small>Tuliskan pertanyaan untuk narasumber atau data yang perlu diperiksa.</small></div>
 <hr class="rule">
 <div class="field"><label for="captionText">Narasi untuk sembilan foto (target sekitar 150 kata)</label>
 <textarea class="captionbox" id="captionText" name="captionText" rows="9" maxlength="11000" placeholder="Mulailah dari fakta paling penting. Hubungkan orang, aktivitas, lokasi, dan proses yang terbukti dalam rangkaian foto…">${escapeHtml(draft)}</textarea>
 <div class="caption-counter"><strong id="wordcount">${count} kata</strong><span id="caption-word-feedback">${count===0?"Mulai tulis narasimu":count<120?"Masih di bawah kisaran latihan":count<=180?"Dalam kisaran latihan":"Lebih panjang dari kisaran latihan; periksa bagian yang dapat dipadatkan"}</span></div>
 <div class="progress-meter"><span id="wordbar" style="width:${Math.min(100,count/150*100)}%"></span></div>
 <small>Kisaran latihan 120–180 kata sebagai panduan, bukan aturan kaku. Prioritaskan akurasi. Aplikasi tidak menuliskan narasi otomatis.</small></div>
 <div class="caption-review-list"><h3>Periksa sebelum menyimpan</h3>
 <label><input type="checkbox" name="reviewVisual" value="yes" ${saved.reviewVisual==="yes"?"checked":""}> Semua pernyataan tentang foto sesuai yang terlihat.</label>
 <label><input type="checkbox" name="reviewFacts" value="yes" ${saved.reviewFacts==="yes"?"checked":""}> Nama, tanggal, tempat, serta klaim lain telah diperiksa atau ditandai perlu verifikasi.</label>
 <label><input type="checkbox" name="reviewSequence" value="yes" ${saved.reviewSequence==="yes"?"checked":""}> Narasi sesuai urutan dan gagasan sembilan foto.</label></div>
 <div class="actions"><button class="btn primary" type="submit">Simpan hasil Caption Lab ✓</button></div>
 <p class="small-note" role="status" id="caption-save-status" aria-live="polite">Draf tersimpan di perangkat saat kamu mengetik. Tekan Simpan untuk mengirim hasil ke trainer.</p>
 </form>
 <section class="card caption-reminder"><h3>Catatan editorial</h3><p>Rangkaian ini dokumentasi musik bambu Sangihe, September 2017. Nama, gelar, tujuan kegiatan, dan rincian penghargaan tidak boleh ditambahkan sebagai fakta tanpa sumber yang dapat diperiksa.</p></section>`;
}
function countWords(v){return v.trim()?v.trim().split(/\s+/).length:0}
const ETHICS_PLAN_FIELDS=[
 ["topic","Cerita budaya apa yang ingin kamu dokumentasikan?","Contoh: proses pembuatan alat musik, aktivitas latihan, atau tradisi di lingkunganmu"],
 ["subject","Siapa yang perlu kamu ajak bicara?","Tokoh, pembuat, pelaku kegiatan, atau anggota komunitas"],
 ["permission","Apa yang harus kamu tanyakan atau minta izin terlebih dahulu?","Batasan pengambilan gambar, privasi, kesepakatan dengan subjek"],
 ["frames","Foto apa saja yang akan dicari?","Foto konteks, tokoh, proses, detail, interaksi, momen, dan penutup"],
 ["verify","Fakta apa yang perlu diperiksa dan kepada siapa?","Nama, fungsi kegiatan, lokasi, waktu, riwayat, makna, serta sumber informasi"],
 ["safety","Bagaimana menjaga keselamatan dan martabat subjek?","Risiko bagi orang yang dipotret, adat setempat, dan cara mempublikasikan karya"]
];
function ethicsPage(){
 const saved=state.work.etika||{},plan=saved.plan||{},score=Number.isInteger(saved.score)?saved.score:null;
 return `${titleBlock("etika")}
 <section class="card ethics-final-intro"><span class="eyebrow">TANTANGAN PENUTUP · MODUL 06</span>
 <h2>Keputusan etis, lalu rencana karya nyata.</h2>
 <p>Empat situasi berikut menguji alasan di balik keputusanmu. Setelah itu, siapkan rencana foto cerita budaya yang dapat kamu kerjakan secara bertanggung jawab.</p>
 <p class="small-note">Tidak ada foto baru atau gambar rekayasa dalam latihan ini. Contoh visual berasal dari dokumentasi Sangihe karya Ronny Adolof Buol, September 2017.</p></section>
 <form id="ethics-form" class="card ethics-final-workspace">
 <h2>Bagian A · Empat keputusan di lapangan</h2><p class="small-note">Pilih satu respons untuk tiap situasi. Jelaskan alasan sebelum melihat pembahasannya.</p>
 ${ETHICS.map((e,i)=>`<fieldset class="ethics-final-question"><legend>${i+1}. ${escapeHtml(e.q)}</legend>
 ${e.a.map((choice,j)=>`<label class="ethics-option"><input type="radio" name="q${i}" value="${j}" ${saved.answers?.[i]===j?"checked":""}><span>${escapeHtml(choice)}</span></label>`).join("")}
 <label class="ethics-reason-label" for="ethical-reason-${i}">Mengapa kamu memilih jawaban ini?</label>
 <textarea id="ethical-reason-${i}" name="reason${i}" rows="2" maxlength="900" placeholder="Tuliskan alasan singkat dan pertimbangkan dampaknya bagi subjek…">${escapeHtml(saved.reasons?.[i]||"")}</textarea></fieldset>`).join("")}
 <hr class="rule"><h2>Bagian B · Rencana foto cerita budaya</h2>
 <p class="small-note">Rencana ini bukan janji publikasi. Ini langkah awal supaya kamu siap mengamati, bertanya, memotret, dan memeriksa fakta.</p>
 <div class="ethics-plan-fields">${ETHICS_PLAN_FIELDS.map(([key,label,hint])=>`<div class="field">
 <label for="ethical-plan-${key}">${escapeHtml(label)}</label>
 <textarea id="ethical-plan-${key}" name="plan-${key}" rows="3" maxlength="1500" placeholder="${escapeHtml(hint)}">${escapeHtml(plan[key]||"")}</textarea></div>`).join("")}</div>
 <div class="ethics-checklist"><h3>Periksa kesiapan karya</h3>
 ${[["original","Saya akan menjaga keaslian momen serta menyimpan file foto asli."],["respect","Saya akan menghormati orang, privasi, serta pembatasan budaya."],["facts","Saya akan memeriksa fakta dalam caption sebelum publikasi."]].map(([key,label])=>`<label><input type="checkbox" name="check-${key}" value="yes" ${saved.checks?.[key]?"checked":""}><span>${escapeHtml(label)}</span></label>`).join("")}</div>
 <button type="submit" class="btn primary">Periksa keputusan & simpan rencana ✓</button>
 <p class="small-note" id="ethics-status" role="status" aria-live="polite">Draf keputusan dan rencana disimpan di perangkat selama kamu mengerjakan. Tekan Simpan untuk mengirim hasil ke trainer.</p>
 <div id="ethics-result" class="ethics-results">${score===null?"":`<div class="info"><b>${score}/${ETHICS.length} keputusan sesuai pembahasan.</b><p>Nilai ini bahan refleksi, bukan satu-satunya ukuran etika fotografer.</p>
 ${ETHICS.map((q,i)=>`<p><b>${i+1}. ${saved.answers?.[i]===q.correct?"✓":"Periksa kembali"}</b> ${escapeHtml(q.why)}</p>`).join("")}</div>`}</div>
 </form>
 <section class="card ethics-closing"><h3>Sesudah kelas</h3><p>Bawa rancangan ini untuk diskusi dengan pendamping. Cari informasi latar, sepakati akses yang menghormati subjek, siapkan variasi EDFAT, pilih sembilan bingkai yang saling melengkapi, lalu tulis narasi foto yang dapat diverifikasi.</p></section>`;
}
async function saveAnswer(key,payload){
 state.work[key]=payload;saveWork();
 if(!state.online||!state.user?.token){toast("Tersimpan di perangkat (demo)");return}
 try{await request(`/api/answers/${encodeURIComponent(key)}`,{method:"PUT",payload});toast("Jawaban tersimpan di kelas ✓")}
 catch(e){toast(`Tersimpan lokal; sinkronisasi gagal: ${e.message}`)}
}
function bindLessons(){
 $$("[data-nav]").forEach(btn=>btn.addEventListener("click",()=>{const key=btn.dataset.nav;if(isUnlocked(key))goModule(key)}));
 if(state.active==="kamera" && $("#aperture")){
  [["aperture","a"],["shutter","s"],["iso","i"]].forEach(([id,key])=>$("#"+id).addEventListener("input",e=>{state.camera[key]=Number(e.target.value);updateCamera()}));
  $("#reset-camera").onclick=()=>{state.camera={a:1,s:3,i:1};["aperture","shutter","iso"].forEach((id,n)=>{$("#"+id).value=[1,3,1][n]});updateCamera()};
  $("#save-camera").onclick=()=>saveAnswer("kamera",{...state.camera,at:new Date().toISOString()});
  updateCamera();
 }
 if(state.active==="komposisi"&&$("#compositionScene")){
  $$("[data-comp]").forEach(btn=>btn.onclick=()=>{const key=btn.dataset.comp;state.composition[key]=!state.composition[key];if(key==="frame")state.composition.preview="frame";btn.setAttribute("aria-pressed",String(state.composition[key]));updateComposition()});
  for(const attr of ["position","distance","angle"]){
   $$("[data-"+attr+"]").forEach(btn=>btn.onclick=()=>{state.composition[attr]=btn.dataset[attr];state.composition.preview=attr;$$("[data-"+attr+"]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));updateComposition()});
  }
  const reason=$("#comp-reason");if(reason)reason.oninput=()=>{state.composition.reason=reason.value};
  $("#reset-comp").onclick=()=>{state.composition={grid:true,frame:false,position:"center",distance:"wide",angle:"eye",reason:"",preview:"distance"};goModule("komposisi")};
  $("#save-comp").onclick=()=>{const reason=(state.composition.reason||"").trim();if(reason.length<15){toast("Tuliskan alasan minimal 15 karakter");return}saveAnswer("komposisi",{...state.composition,reason})};
  updateComposition();
 }
 if(state.active==="edfat"&&$("#save-edfat")){
  const current={answers:{...(state.work.edfat?.answers||{})},reasons:{...(state.work.edfat?.reasons||{})}};
  $$("[data-edfat-choice]").forEach(input=>input.onchange=()=>{
   current.answers[input.dataset.edfatChoice]=input.value;
   state.work.edfat={...current,_draft:true};saveWork();
   const counter=$(".edfat-submit strong");if(counter)counter.textContent=Object.keys(current.answers).length+" dari "+EDFAT_CASES.length+" kasus dipilih.";
  });
  $$("[data-edfat-reason]").forEach(textarea=>textarea.oninput=()=>{current.reasons[textarea.dataset.edfatReason]=textarea.value;state.work.edfat={...current,_draft:true};saveWork()});
  $("#save-edfat").onclick=()=>{
   const missing=EDFAT_CASES.find(x=>!EDFAT_OPTIONS.includes(current.answers[x.id])||(current.reasons[x.id]||"").trim().length<12);
   if(missing){const feedback=$("#edfat-feedback");if(feedback)feedback.textContent="Lengkapi pilihan dan alasan minimal 12 karakter untuk setiap kasus.";toast("Lengkapi lima jawaban beserta alasannya");return}
   saveAnswer("edfat",{...current,completedAt:new Date().toISOString()});
   const feedback=$("#edfat-feedback");if(feedback)feedback.textContent="Lima hasil pengamatan sudah disimpan. Trainer dapat membaca seluruh alasanmu.";
  };
 }
 if(state.active==="story"&&$("#save-story")){
  const current=()=>state.work.story||{};
  const setSelected=selected=>{state.work.story={...current(),selected,_draft:true};saveWork();render()};
  $$("[data-pick]").forEach(btn=>btn.onclick=()=>{const ids=[...(current().selected||[])],id=Number(btn.dataset.pick);if(ids.length>=9){toast("Sudah sembilan foto. Keluarkan satu dahulu.");return}if(!ids.includes(id))setSelected([...ids,id])});
  $$("[data-remove]").forEach(btn=>btn.onclick=()=>setSelected((current().selected||[]).filter(id=>id!==Number(btn.dataset.remove))));
  $$("[data-move]").forEach(btn=>btn.onclick=()=>{const ids=[...(current().selected||[])],i=ids.indexOf(Number(btn.dataset.move)),j=i+Number(btn.dataset.dir);if(i<0||j<0||j>=ids.length)return;[ids[i],ids[j]]=[ids[j],ids[i]];setSelected(ids)});
  for(const [selector,key] of [["#story-title","title"],["#story-reason","reason"]]){
   const field=$(selector);if(field)field.oninput=()=>{state.work.story={...current(),[key]:field.value,_draft:true};saveWork()};
  }
  $("#reset-story").onclick=()=>{if(!confirm("Kosongkan pilihan sembilan foto?"))return;setSelected([])};
  $("#save-story").onclick=()=>{
   const data=current(),ids=data.selected||[],title=(data.title||"").trim(),reason=(data.reason||"").trim();
   const status=$("#story-status");
   if(ids.length!==9){if(status)status.textContent="Pilih tepat sembilan foto.";return}
   if(title.length<5||reason.length<30){if(status)status.textContent="Lengkapi judul minimal 5 karakter dan alasan urutan minimal 30 karakter.";toast("Lengkapi judul dan alasan");return}
   saveAnswer("story",{selected:ids,title,reason,completedAt:new Date().toISOString()});
   if(status)status.textContent="Sembilan foto dan alasan editorial tersimpan.";
  };
 }
 if(state.active==="caption"){
  const form=$("#caption-form");
  if(form){
   function currentDraft(){
    const data=Object.fromEntries(new FormData(form).entries());
    for(const flag of ["reviewVisual","reviewFacts","reviewSequence"])data[flag]=form.elements[flag]?.checked?"yes":"no";
    return data;
   }
   function updateDraft(){
    const obj=currentDraft();state.work.caption={...obj,_draft:true};saveWork();
    const n=countWords(obj.captionText||"");
    const counter=$("#wordcount"),bar=$("#wordbar"),feedback=$("#caption-word-feedback");
    if(counter)counter.textContent=n+" kata";
    if(bar)bar.style.width=Math.min(100,n/150*100)+"%";
    if(feedback)feedback.textContent=n===0?"Mulai tulis narasimu":n<120?"Masih di bawah kisaran latihan":n<=180?"Dalam kisaran latihan":"Lebih panjang dari kisaran latihan; periksa bagian yang dapat dipadatkan";
   }
   form.oninput=updateDraft;
   form.onchange=updateDraft;
   form.onsubmit=async e=>{
    e.preventDefault();const data=currentDraft(),n=countWords(data.captionText||"");
    const status=$("#caption-save-status");
    if(n<50){if(status)status.textContent="Narasi terlalu pendek untuk latihan; tulis minimal 50 kata.";toast("Lengkapi narasi terlebih dahulu");return}
    if(["reviewVisual","reviewFacts","reviewSequence"].some(k=>data[k]!=="yes")){
      if(status)status.textContent="Periksa dan centang ketiga butir editorial sebelum mengirim.";toast("Lengkapi pemeriksaan editorial");return}
    const result={...data,storySelected:Array.isArray(state.work.story?.selected)?state.work.story.selected.slice(0,9):[],completedAt:new Date().toISOString()};
    await saveAnswer("caption",result);
    if(status)status.textContent=state.online?"Permintaan simpan dikirim. Periksa pesan status di atas.":"Hasil disimpan di perangkat mode demo.";
   };
  }
 }
 if(state.active==="etika"){
  const form=$("#ethics-form");
  if(form){
    function ethicsDraft(){
      const values=new FormData(form);
      const answers=ETHICS.map((_,i)=>values.get("q"+i)===null?null:Number(values.get("q"+i)));
      const reasons=ETHICS.map((_,i)=>String(values.get("reason"+i)||"").trim());
      const plan=Object.fromEntries(ETHICS_PLAN_FIELDS.map(([key])=>[key,String(values.get("plan-"+key)||"").trim()]));
      const checks=Object.fromEntries(["original","respect","facts"].map(k=>[k,values.get("check-"+k)==="yes"]));
      return {answers,reasons,plan,checks};
    }
    const saveDraft=()=>{state.work.etika={...(state.work.etika||{}),...ethicsDraft(),_draft:true};saveWork()};
    form.oninput=saveDraft;
    form.onchange=saveDraft;
    form.onsubmit=e=>{
      e.preventDefault();
      const data=ethicsDraft(),status=$("#ethics-status");
      const fail=msg=>{if(status)status.textContent=msg;toast(msg)};
      if(data.answers.some(v=>v===null))return fail("Pilih jawaban untuk keempat situasi.");
      if(data.reasons.some(v=>v.length<12))return fail("Jelaskan alasan tiap keputusan, minimal 12 karakter.");
      if(ETHICS_PLAN_FIELDS.some(([key])=>(data.plan[key]||"").length<12))return fail("Lengkapi setiap bagian rencana foto cerita, minimal 12 karakter.");
      if(Object.values(data.checks).some(v=>!v))return fail("Centang ketiga komitmen etika sebelum menyimpan.");
      const score=data.answers.filter((v,i)=>v===ETHICS[i].correct).length;
      const result={...data,score,completedAt:new Date().toISOString()};
      saveAnswer("etika",result);
      const area=$("#ethics-result");
      if(area)area.innerHTML=`<div class="info"><b>${score}/${ETHICS.length} keputusan sesuai pembahasan.</b>
      <p>Gunakan pembahasan ini untuk meninjau kembali alasanmu, bukan hanya menghafal jawaban.</p>
      ${ETHICS.map((q,i)=>`<p><b>${i+1}. ${data.answers[i]===q.correct?"✓":"Periksa kembali"}</b> ${escapeHtml(q.why)}</p>`).join("")}</div>`;
      if(status)status.textContent="Hasil telah disiapkan untuk disimpan. Periksa pesan status penyimpanan kelas.";
    };
  }
 }
}
async function signup(e){
 e.preventDefault();const form=e.currentTarget,data=Object.fromEntries(new FormData(form).entries());
 data.name=data.name.trim();data.school=data.school.trim();data.className=data.className.trim();data.username=data.username.trim();
 if(!data.name||!data.school||!data.className||!/^[a-z]{3,20}$/.test(data.username)){toast("Lengkapi data dan username satu kata huruf kecil (3–20 huruf)");return}
 const button=form.querySelector("button");button.disabled=true;button.textContent="Menyimpan…";
 if(state.online){
  try {const response=await request("/api/participants",{method:"POST",payload:data});state.user=response.user}
  catch(err){button.disabled=false;button.textContent="Masuk Studio Foto Cerita →";toast("Pendaftaran gagal: "+err.message);return}
 }else{
  state.user={id:crypto.randomUUID(),...data,username:null,token:null};
 }
 localStorage.setItem(STORAGE_USER,JSON.stringify(state.user));
 loadLearnerViews();
 if(state.user.username)localStorage.setItem("lm26-last-username",state.user.username);
 state.work={};saveWork();state.justRegistered=!!state.user.username;state.active=STAGES[state.serverStage]?.key||"mulai";render();toast(state.user.username?"Pendaftaran berhasil! Simpan username kamu.":"Mode demo lokal — username tidak diterbitkan tanpa koneksi kelas.");
}
function logout(){localStorage.removeItem(learnerKey());state.learnerViews={};state.user=null;state.work={};state.justRegistered=false;localStorage.removeItem(STORAGE_USER);localStorage.removeItem(STORAGE_WORK);localStorage.removeItem("lm26-last-username");render()}
function renderParticipant(){
 if(state.locked){$("#root").innerHTML=`<div class="page"><div class="card login-card class-closed"><span class="eyebrow">KELAS DITUTUP</span><h1>Kegiatan belajar telah selesai</h1><p>Akses peserta sedang dikunci oleh trainer. Terima kasih telah mengikuti Lensa Muda.</p></div></div>`;return}
 if(!state.user){
  showParticipantAuth("signup");
  return;
 }
 if(state.justRegistered){
  $("#root").innerHTML=participantWelcomePage();
  $("#copy-participant-username").onclick=()=>navigator.clipboard?.writeText(state.user.username).then(()=>toast("Username disalin"),()=>toast("Catat username secara manual"));
  $("#participant-continue").onclick=()=>{state.justRegistered=false;state.active=STAGES[state.serverStage]?.key||"mulai";renderParticipant()};
  return;
 }
 if(!isUnlocked(state.active))state.active=STAGES[Math.min(state.serverStage,6)].key;
 if(learnerRange(state.active)&&!state.learnerViews[state.active]){
   state.learnerViews[state.active]={mode:learnerMode(state.active),slide:liveLearnerSlide(state.active)};
   saveLearnerViews();
 }
 const learnerRangeNow=learnerRange(state.active);
 // Begitu trainer membuka simulator bagi peserta yang sedang mengikuti kelas,
 // jadikan latihan mandiri agar peserta tidak terseret saat trainer kembali ke slide.
 if(learnerRangeNow&&state.learnerViews[state.active]?.mode==="follow"
    &&state.presentation.view==="simulator"
    &&state.presentation.slide>=learnerRangeNow[0]&&state.presentation.slide<=learnerRangeNow[1]){
   state.learnerViews[state.active]={mode:"practice",slide:liveLearnerSlide(state.active)};
   saveLearnerViews();
 }
 $("#root").innerHTML=lessonLayout();bindLearnerMode();bindLessons();
 const select=$("#participant-module-select");
 if(select)select.onchange=()=>{if(isUnlocked(select.value))goModule(select.value)};
 const rename=$("#participant-rename-form");
 if(rename)rename.onsubmit=async event=>{
  event.preventDefault();const username=String(new FormData(event.currentTarget).get("username")||"").trim();
  if(!/^[a-z]{3,20}$/.test(username)){toast("Username harus satu kata huruf kecil, 3–20 huruf.");return}
  try{if(!state.online)throw Error("Perlu koneksi kelas");
   const response=await request("/api/me/username",{method:"PATCH",payload:{username}});
   state.user.username=response.username;localStorage.setItem(STORAGE_USER,JSON.stringify(state.user));
   renderParticipant();toast("Username baru tersimpan");
  }catch(error){toast("Gagal mengubah username: "+error.message)}
 };

 const button=$("#participant-switch-account");
 if(button)button.onclick=()=>{if(confirm("Keluar dari akun ini? Simpan username terlebih dahulu."))logout()};
}
function trainerLogin(){
 return `<div class="page"><div class="card login-card"><span class="eyebrow">Akses trainer / pendamping</span><h1>Ruang kendali kelas</h1><p class="muted">Masukkan PIN trainer atau pendamping yang telah disiapkan di Cloudflare. Jangan bagikan PIN trainer kepada peserta.</p><form id="trainer-login"><div class="field"><label for="trainer-pin">PIN akses</label><input id="trainer-pin" type="password" required minlength="4" autocomplete="off" inputmode="numeric" placeholder="PIN"></div><div id="trainer-login-feedback" role="alert" aria-live="polite" class="login-feedback" hidden></div><button type="submit" class="btn primary block">Masuk dashboard →</button></form><p class="small-note">Dalam mode demo lokal, dashboard hanya menunjukkan status perangkat ini. Untuk kendali serentak dibutuhkan Workers dan D1.</p>${!state.online?`<button class="btn subtle" id="trainer-preview">Buka pratinjau dashboard lokal</button>`:""}</div></div>`;
}
async function fetchDashboard(){
 if(!state.online||!state.trainerToken){state.dashboard={stage:state.demoStage,camera:state.demoCamera,presentation:state.presentation,count:state.user?1:0,participants:state.user?[{...state.user,done:Object.keys(state.work).length,answers:state.work}]:[],answers:state.work};return}
 state.dashboard=await request("/api/dashboard",{auth:true});
 state.serverStage=state.dashboard.stage;state.count=state.dashboard.count;
 if(state.dashboard.camera)state.demoCamera=state.dashboard.camera;
 if(state.dashboard.composition)state.demoComposition=state.dashboard.composition;
 if(state.dashboard.presentation)state.presentation=state.dashboard.presentation;
 state.spotlight=state.dashboard.spotlight||null;
}
function trainerCameraPanel(data,isMentor){
 const c=state.demoCamera;
 return `<section class="card trainer-demo-card" aria-label="Studio kamera langsung">
   <div class="trainer-demo-heading">
     <div><span class="eyebrow">STUDIO PERAGAAN · LIVE LCD</span><h2>Kontrol Kamera dari Trainer</h2>
       <p class="small-note">Geser pengaturan di sini. Perubahan dikirim ke layar LCD saat tahap <b>01 · Laboratorium Kamera</b> aktif.</p></div>
     <span class="pill ${data.stage===1?"green":"gray"}">${data.stage===1?"● LIVE DI LCD":"BUKA TAHAP 01 UNTUK TAMPIL DI LCD"}</span>
   </div>
   <div class="trainer-demo-grid">
     <div class="trainer-scene">
       ${photoSceneHTML("trainerCameraScene")}
       <div class="trainer-demo-ev"><span>Perubahan pencahayaan</span><strong id="trainer-ev">${exposureText(c)}</strong></div>
       <p class="small-note">Ilustrasi demonstrasi — pengaturan di sini tidak mengganti eksperimen individu peserta.</p>
     </div>
     <div class="trainer-controls">
       <div class="control"><label for="trainer-aperture">Aperture / Bukaan <output id="trainer-aperture-value">f/${APERTURE[c.a]}</output></label>
          <input id="trainer-aperture" data-livecam="a" type="range" min="0" max="6" step="1" value="${c.a}" ${isMentor?"disabled":""}>
          <small>Nilai f kecil: latar lebih blur. Nilai f besar: ruang tajam lebih luas.</small></div>
       <div class="control"><label for="trainer-shutter">Shutter Speed <output id="trainer-shutter-value">${SHUTTERS[c.s].l}s</output></label>
          <input id="trainer-shutter" data-livecam="s" type="range" min="0" max="6" step="1" value="${c.s}" ${isMentor?"disabled":""}>
          <small>Rana lambat: gerak kabur. Rana cepat: gerak cenderung beku.</small></div>
       <div class="control"><label for="trainer-iso">ISO <output id="trainer-iso-value">ISO ${ISOS[c.i]}</output></label>
          <input id="trainer-iso" data-livecam="i" type="range" min="0" max="6" step="1" value="${c.i}" ${isMentor?"disabled":""}>
          <small>ISO tinggi: gambar lebih terang dengan risiko noise lebih besar.</small></div>
       <div class="actions">
         <button class="btn subtle" id="trainer-camera-reset" ${isMentor?"disabled":""}>↺ Reset simulasi</button>
         <a href="${location.pathname}#/lcd" target="_blank" rel="noopener noreferrer" class="btn">Lihat LCD ↗</a>
       </div>
       <p id="trainer-camera-status" role="status" class="small-note">${isMentor?"Mode pendamping: hanya melihat pengaturan.":!state.online?"Mode demo lokal — belum tersinkron.":"Siap mengirim pengaturan ke proyektor."}</p>
     </div>
   </div>
 </section>`;
}
function answerDetails(key,v){
 if(!v||typeof v!=="object")return `<p class="small-note">Belum ada detail.</p>`;
 if(key==="kamera"){
   const ok=["a","s","i"].every(k=>Number.isInteger(v[k])&&v[k]>=0&&v[k]<=6);
   if(!ok)return `<p class="small-note">Data kamera tidak lengkap.</p>`;
   return `<div class="response-pills"><span>BUKAAN <b>f/${APERTURE[v.a]}</b></span><span>RANA <b>${SHUTTERS[v.s].l}s</b></span><span>ISO <b>${ISOS[v.i]}</b></span><span>EV <b>${exposureText(v)}</b></span></div>`;
 }
 if(key==="komposisi")return `<p class="small-note">Posisi: <b>${escapeHtml(v.position||"–")}</b> · Jarak: <b>${escapeHtml(v.distance||"wide")}</b> · Sudut: <b>${escapeHtml(v.angle||"eye")}</b> · Garis: <b>${v.grid?"Ya":"Tidak"}</b> · Framing: <b>${v.frame?"Ya":"Tidak"}</b></p><p class="small-note"><b>Alasan:</b> ${escapeHtml(v.reason||"Belum dicatat")}</p>`;
 if(key==="edfat")return Array.isArray(EDFAT_CASES)&&v.answers
 ?`<div class="edfat-answer-review">${EDFAT_CASES.map((x,i)=>`<p><b>${i+1}. ${escapeHtml(x.recommended)} — ${escapeHtml(v.answers[x.id]||"–")}</b><br>${escapeHtml(v.reasons?.[x.id]||"Belum ada alasan")}</p>`).join("")}</div>`
 :`<p class="small-note">Pilihan EDFAT lama: <b>${escapeHtml(v.answer||"–")}</b></p>`;
 if(key==="story"){
 const ids=Array.isArray(v.selected)?v.selected:[];
 return `<div class="response-story">${ids.map((id,i)=>`<span><b>${i+1}.</b> ${escapeHtml(STORY_BANK.find(x=>x.id===id)?.title||"Foto "+id)}</span>`).join("")}</div>
 <div class="small-note"><b>Judul kerja:</b> ${escapeHtml(v.title||"Belum ditulis")}<p><b>Alasan urutan:</b> ${escapeHtml(v.reason||"Belum ditulis")}</p></div>`;
}
if(key==="caption"){
   const facts=CAPTION_FIELDS.filter(([k])=>v[k]).map(([k,label])=>`<div><b>${escapeHtml(label)}</b> ${escapeHtml(v[k])}</div>`).join("");
   return `<div class="small-note">${facts||"Belum ada unsur 5W+1H."}</div><div class="response-caption"><b>Narasi (${countWords(v.captionText||"")} kata):</b><p>${escapeHtml(v.captionText||"Belum ditulis")}</p><p><b>Perlu verifikasi:</b> ${escapeHtml(v.verification||"Tidak ada catatan")}</p></div>`;
 }
 if(key==="etika")return `<div class="ethics-answer-review">
 <p><b>Keputusan:</b> ${Number(v.score)||0} dari ${ETHICS.length} sesuai pembahasan</p>
 ${ETHICS.map((q,i)=>`<div><b>${i+1}. ${escapeHtml(q.q)}</b><p>Jawaban: ${escapeHtml(q.a?.[v.answers?.[i]]||"Belum ada")} · Alasan: ${escapeHtml(v.reasons?.[i]||"Belum ditulis")}</p></div>`).join("")}
 <h4>Rencana foto cerita</h4>${ETHICS_PLAN_FIELDS.map(([key,label])=>`<p><b>${escapeHtml(label)}</b> ${escapeHtml(v.plan?.[key]||"Belum ditulis")}</p>`).join("")}</div>`;
 return `<p class="small-note">Latihan tersimpan.</p>`;
}
const SPOTLIGHT_MODULES=["story","edfat","komposisi","kamera","caption","etika"];
function lcdSpotlightContent(spot){
 const a=spot.answer||{},label=escapeHtml(STAGES.find(x=>x.key===spot.module)?.name||spot.module),name=escapeHtml(spot.name);
 if(spot.module==="story"){
  const ids=Array.isArray(a.selected)?a.selected.slice(0,9):[];
  return `<div class="spotlight-layout">
   <div class="spotlight-gallery">${ids.map((id,i)=>{
    const photo=STORY_BANK.find(x=>x.id===id);return !photo?"":`<figure class="spotlight-tile">${storyImage(photo,"Bingkai "+(i+1)+": "+photo.title)}<figcaption><b>${i+1}.</b> ${escapeHtml(photo.title)}</figcaption></figure>`;
   }).join("")}</div>
   <aside class="spotlight-editorial"><span class="kicker">SOROTAN KARYA · ${label}</span>
   <h1>${name}</h1><h2>${escapeHtml(a.title||"Sembilan Bingkai")}</h2>
   <section class="spotlight-notes"><strong>ALASAN EDITORIAL PESERTA</strong><p>${escapeHtml(a.reason||"Belum mencatat alasan.")}</p></section>
   <p class="spotlight-prompt">Diskusi: Mengapa foto pertama dan terakhir dipilih? Adakah informasi yang berulang?</p></aside></div>`;
 }
 if(spot.module==="caption"){
  const ids=Array.isArray(a.storySelected)?a.storySelected.slice(0,9):[];
  const samples=[ids[0],ids[4],ids[8]].filter(id=>Number.isInteger(id));
  return `<div class="caption-spotlight"><div class="caption-spotlight-top">
   <span class="kicker">SOROTAN KARYA · CAPTION LAB</span><h1>${name}</h1>
   <p>Narasi peserta · ${captionWordCount(a.captionText||"")} kata</p></div>
   ${samples.length?`<div class="caption-spotlight-photos">${samples.map((id,i)=>{
      const item=STORY_BANK.find(x=>x.id===id);return item?`<figure>${storyImage(item,"Foto pilihan peserta")}<figcaption>${escapeHtml(item.title)}</figcaption></figure>`:"";
    }).join("")}</div>`:""}
   <div class="caption-spotlight-text">${escapeHtml(a.captionText||"Belum ada narasi.")}</div>
   <div class="caption-spotlight-question">Diskusi: Klaim apa yang kuat dan informasi apa yang masih perlu diverifikasi?</div>
  </div>`;
 }
 if(spot.module==="etika"){
   return `<div class="ethics-spotlight"><div class="ethics-spotlight-copy">
   <span class="kicker">SOROTAN KARYA · ETIKA & TANTANGAN</span><h1>${name}</h1>
   <h2>${escapeHtml(a.plan?.topic||"Rencana foto cerita budaya")}</h2>
   <div class="ethics-spotlight-plan">
   ${[["subject","Tokoh / sumber"],["permission","Izin dan batasan"],["frames","Bingkai yang dicari"],["verify","Verifikasi fakta"],["safety","Martabat dan keselamatan"]].map(([key,label])=>`<div><b>${label}</b><p>${escapeHtml(a.plan?.[key]||"Belum dicatat")}</p></div>`).join("")}
   </div><p class="ethics-spotlight-prompt">Diskusi: Apa keputusan etis paling penting sebelum liputan ini dimulai?</p>
   </div>${ethicsVisual(ETHICS_END)}</div>`;
 }
 if(spot.module==="edfat"){
  return `<div class="spotlight-generic"><span class="kicker">SOROTAN KARYA · ${label}</span><h1>${name}</h1>
  <h2>Hasil Detektif EDFAT</h2><div class="spotlight-edfat">${EDFAT_CASES.map((x,i)=>`<div><b>${i+1}. ${escapeHtml(a.answers?.[x.id]||"Belum dipilih")}</b><p>${escapeHtml(a.reasons?.[x.id]||"Belum ada alasan")}</p></div>`).join("")}</div></div>`;
 }
 const detail=spot.module==="caption"?escapeHtml(a.captionText||"Belum ada caption."):
  spot.module==="komposisi"?escapeHtml(a.reason||"Belum ada alasan.") :
  spot.module==="etika"?"Skor latihan: "+(Number(a.score)||0)+" dari 4":
  `Aperture: f/${escapeHtml(String(APERTURE[a.a]??"—"))} · Shutter: ${escapeHtml(String(SHUTTERS[a.s]?.l??"—"))}s · ISO: ${escapeHtml(String(ISOS[a.i]??"—"))}`;
 return `<div class="spotlight-generic"><span class="kicker">SOROTAN KARYA · ${label}</span><h1>${name}</h1><h2>Hasil pekerjaan peserta</h2><p class="spotlight-copy">${detail}</p></div>`;
}
function rosterMessage(includeUsernames=false){
 const list=state.dashboard?.participants||[];
 return ["Daftar Peserta Lensa Muda — 16 November 2026","Total: "+list.length+" peserta","",...list.map((p,i)=>(i+1)+". "+p.name+" — "+p.school+" / "+p.className+(includeUsernames?" — "+(p.username||""): "")+" — "+(p.done||0)+"/6 modul"),"","Kelas Belajar Zonautara.com"].join("\n");
}
function participantFormHTML(p=null){
 const isEdit=!!p;
 return `<form id="${isEdit?"participant-edit-form":"participant-add-form"}" class="card participant-edit-form">
 <h3>${isEdit?"Koreksi data peserta":"Tambah peserta"}</h3>
 <p class="small-note">${isEdit?"Username dapat diperbaiki dan progres tidak berubah.":"Trainer dapat mendaftarkan peserta yang kesulitan memakai HP."}</p>
 <div class="field-row">
 <div class="field"><label for="manage-name">Nama lengkap</label><input id="manage-name" name="name" value="${escapeHtml(p?.name||"")}" required maxlength="90"></div>
 <div class="field"><label for="manage-school">Sekolah</label><input id="manage-school" name="school" value="${escapeHtml(p?.school||"")}" required maxlength="140"></div>
 <div class="field"><label for="manage-class">Kelas</label><input id="manage-class" name="className" value="${escapeHtml(p?.className||"")}" required maxlength="30"></div>
 <div class="field"><label for="manage-username">Username</label><input id="manage-username" name="username" value="${/^[a-z]{3,20}$/.test(p?.username||"")?escapeHtml(p.username):""}" required pattern="[a-z]{3,20}" minlength="3" maxlength="20" autocapitalize="none" spellcheck="false" placeholder="contoh: jufri"><small>Huruf kecil, satu kata, 3–20 huruf. Username lama acak dapat diganti.</small></div></div>
 <div class="actions"><button type="submit" class="btn primary">${isEdit?"Simpan perubahan":"Daftarkan peserta"}</button><button id="cancel-participant-edit" type="button" class="btn subtle">Batal</button></div></form>`;
}
function renderDashboard(){
 const data=state.dashboard||{stage:state.serverStage,count:state.count,participants:[]},isMentor=state.trainerRole==="mentor";
 return `<div class="page"><div class="module-top"><div><span class="eyebrow">DASHBOARD ${isMentor?"PENDAMPING":"TRAINER"}</span><h1>Kendali Studio Foto Cerita</h1><p>16 November 2026 · kelas berlangsung 180 menit · LCD mengikuti presentasi trainer; peserta dapat mengerjakan latihan secara mandiri. <span class="small-note">Rilis: ${APP_RELEASE}</span></p></div><button id="trainer-out" class="btn subtle">Keluar dashboard</button></div><div class="grid"><div class="card"><div class="eyebrow">Peserta terdaftar</div><h2 style="font-size:38px">${data.count||0}</h2><p class="small-note">Tidak ada batas jumlah peserta dalam formulir.</p></div><div class="card"><div class="eyebrow">Tahap terbuka</div><h2 style="font-size:22px">${STAGES[data.stage||0]?.name||"Orientasi"}</h2><p class="small-note">Peserta dapat mengakses tahap ini dan semua tahap sebelumnya.</p></div><div class="card"><div class="eyebrow">Tampilan publik</div><a href="/lensa-muda/#/lcd" target="_blank" rel="noopener noreferrer" class="btn">Buka layar LCD ↗</a><p class="small-note">Gunakan jendela/tab terpisah di proyektor.</p></div></div><div class="card welcome-control" style="margin-top:16px"><div><span class="eyebrow">PEMBUKAAN KELAS</span><h2>Layar Selamat Datang</h2><p class="small-note">Tampilkan Hong Bit, identitas trainer, dan QR pendaftaran di LCD tanpa mengubah tahap atau jawaban peserta.</p></div><div class="actions"><button id="trainer-show-welcome" class="btn primary" ${isMentor?"disabled":""}>Tampilkan Sambutan di LCD</button><a href="/lensa-muda/#/lcd" target="_blank" rel="noopener noreferrer" class="btn subtle">Buka / Lempar ke LCD ↗</a></div></div><div class="card class-lock-panel" style="margin-top:16px"><div><span class="eyebrow">AKSES KELAS</span><h2>${data.locked?"Kelas sedang dikunci":"Kelas terbuka"}</h2><p class="small-note">${data.locked?"Peserta tidak dapat masuk, mendaftar atau menyimpan latihan. Data tetap aman di D1.":"Ketika kegiatan berakhir, kunci kelas agar pendaftaran dan akses peserta berhenti."}</p></div><button id="trainer-toggle-class-lock" class="btn ${data.locked?"primary":"subtle"}" ${isMentor?"disabled":""}>${data.locked?"Buka kembali kelas":"Kunci aplikasi peserta"}</button></div><div class="card" style="margin-top:16px"><h2>Alur pelajaran</h2><p class="small-note">${isMentor?"Mode pendamping: memantau kelas tanpa mengubah tahap.":"Pilih tahap untuk membuka akses peserta. LCD mengikuti slide yang Anda kendalikan; pekerjaan mandiri peserta tetap terbuka."}</p><div class="choice-set">${STAGES.map((s,i)=>`<button class="choice" data-stage="${i}" ${isMentor?"disabled":""} aria-pressed="${data.stage===i}">${String(i).padStart(2,"0")} · ${s.name}</button>`).join("")}</div></div>${data.stage===6?ethicsTrainerPanel(data,isMentor):data.stage===5?captionTrainerPanel(data,isMentor):data.stage>=4?storyTrainerPanel(data,isMentor):data.stage===3?edfatTrainerPanel(data,isMentor):data.stage===2?compositionTrainerPanel(data,isMentor):theoryTrainerPanel(data,isMentor)}${data.stage===1&&state.presentation.view==="simulator"?trainerCameraPanel(data,isMentor):""}<section class="card trainer-spotlight-banner" id="trainer-spotlight-status"><div><span class="eyebrow">SOROTAN KARYA DI LCD</span>
<h3>${state.spotlight?"Menampilkan karya: "+escapeHtml(state.spotlight.name):"LCD mengikuti presentasi trainer"}</h3>
<p class="small-note">Pilih hasil peserta untuk diskusi. Sorotan tidak mengubah slide atau mode presentasi terakhir.</p></div>
<button class="btn primary" id="stop-spotlight" ${!state.spotlight||isMentor?"disabled":""}>Kembali ke Presentasi</button></section><div class="card" style="margin-top:16px"><div class="story-head"><h2>Manajemen peserta & progres</h2><button class="btn small subtle" id="refresh-dashboard">↻ Segarkan</button></div>
<div class="participant-management-tools"><button class="btn primary small" id="trainer-add-participant" ${isMentor?"disabled":""}>+ Tambah peserta</button><button class="btn small" id="print-participants">Cetak / Simpan PDF</button><button class="btn small subtle" id="share-participants-wa">Bagikan via WA</button><button class="btn small subtle" id="share-participants-email">Kirim via email</button></div><p class="small-note">Username terlihat pada daftar trainer. Untuk keamanan, daftar yang dibagikan melalui WA/email tidak menyertakan username; cetakan memuat username untuk administrasi internal.</p>
<div class="field"><label for="participant-filter">Cari peserta</label><input id="participant-filter" type="search" placeholder="Nama, username, sekolah, atau kelas"></div>
<div class="table-wrap participant-table"><table class="data-table"><thead><tr><th>Nama</th><th>Username</th><th>Sekolah</th><th>Kelas</th><th>Progres</th><th>Aksi</th></tr></thead><tbody>${(data.participants||[]).map(p=>`<tr data-participant-row="${escapeHtml((p.name+" "+(p.username||"")+" "+p.school+" "+p.className).toLowerCase())}"><td><b>${escapeHtml(p.name)}</b></td><td><code>${escapeHtml(p.username||"—")}</code></td><td>${escapeHtml(p.school)}</td><td>${escapeHtml(p.className)}</td><td>${Number(p.done)||0}/6</td><td><div class="participant-row-actions"><button class="btn small" data-inspect="${escapeHtml(p.id)}">Lihat</button>${!isMentor&&p.answers?.story?`<button class="btn small primary" data-spotlight-id="${escapeHtml(p.id)}" data-spotlight-module="story">Tampilkan di LCD</button>`:""}${p.username?`<button class="btn small subtle" data-copy-username="${escapeHtml(p.id)}">Salin</button>`:""}${!isMentor?`<button class="btn small subtle" data-edit-participant="${escapeHtml(p.id)}">Edit</button><button class="btn small danger" data-delete-participant="${escapeHtml(p.id)}">Hapus</button>`:""}</div></td></tr>`).join("")||`<tr><td colspan="6" class="center muted">Belum ada peserta terdaftar.</td></tr>`}</tbody></table></div>
<div id="participant-management"></div><div id="inspect" style="margin-top:12px"></div></div>
<section id="participant-print-sheet" class="participant-print-sheet"><h1>Daftar Peserta Lensa Muda</h1><p>Studio Foto Cerita · 16 November 2026 · Kelas Belajar Zonautara.com</p><table><thead><tr><th>No.</th><th>Nama</th><th>Username</th><th>Sekolah</th><th>Kelas</th><th>Progres</th></tr></thead><tbody>${(data.participants||[]).map((p,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.username||"—")}</td><td>${escapeHtml(p.school)}</td><td>${escapeHtml(p.className)}</td><td>${Number(p.done)||0}/6</td></tr>`).join("")}</tbody></table><p class="small-note">Dokumen internal, username merupakan akses akun peserta tanpa password.</p></section></div>`;
}
function bindDashboard(){
 const welcomeButton=$("#trainer-show-welcome");
 if(welcomeButton)welcomeButton.onclick=async()=>{
  if(state.trainerRole!=="trainer")return;
  welcomeButton.disabled=true;welcomeButton.textContent="Mengirim sambutan…";
  try{await request("/api/welcome",{method:"PUT",payload:{active:true},auth:true});
   state.welcome=true;welcomeButton.textContent="✓ Sambutan tampil di LCD";toast("Layar pembuka siap di proyektor");
  }catch(error){welcomeButton.disabled=false;welcomeButton.textContent="Coba tampilkan sambutan";toast(error.message)}
 };
 const isMentor=state.trainerRole==="mentor";
 $("#trainer-out").onclick=()=>{
   state.trainerToken="";
   sessionStorage.removeItem("lm26-trainer");sessionStorage.removeItem("lm26-role");
   state.dashboard=null;render();
 };
 const lockButton=$("#trainer-toggle-class-lock");
 if(lockButton)lockButton.onclick=async()=>{
  if(state.trainerRole!=="trainer"||!state.online)return;
  const target=!state.dashboard.locked;
  if(!confirm(target?"Kunci akses aplikasi peserta sekarang? Peserta tidak bisa masuk atau menyimpan jawaban.":"Buka lagi akses peserta untuk melanjutkan kelas?"))return;
  try{await request("/api/class-lock",{method:"PUT",payload:{locked:target},auth:true});
   await syncState();await fetchDashboard();render();toast(target?"Kelas terkunci":"Kelas dibuka kembali");
  }catch(error){toast("Tidak dapat mengubah kunci: "+error.message)}
 };
 const print=$("#print-participants");if(print)print.onclick=()=>window.print();
 const wa=$("#share-participants-wa");if(wa)wa.onclick=()=>window.open("https://wa.me/?text="+encodeURIComponent(rosterMessage()),"_blank","noopener,noreferrer");
 const email=$("#share-participants-email");if(email)email.onclick=()=>{window.location.href="mailto:?subject="+encodeURIComponent("Daftar Peserta Lensa Muda")+"&body="+encodeURIComponent(rosterMessage())};
 const add=$("#trainer-add-participant");
 if(add)add.onclick=()=>{
  if(state.trainerRole!=="trainer")return;
  const area=$("#participant-management");area.innerHTML=participantFormHTML();
  $("#cancel-participant-edit").onclick=()=>area.innerHTML="";
  $("#participant-add-form").onsubmit=async event=>{
   event.preventDefault();const payload=Object.fromEntries(new FormData(event.currentTarget).entries());
   try{if(!state.online)throw Error("Perlu koneksi kelas");
    await request("/api/trainer/participants",{method:"POST",payload,auth:true});
    await fetchDashboard();render();toast("Peserta baru ditambahkan");
   }catch(error){toast("Gagal menambah: "+error.message)}
  };
  area.scrollIntoView({block:"nearest",behavior:"smooth"});
 };
 $("#refresh-dashboard").onclick=async()=>{
   try{await fetchDashboard();render()}catch(e){toast(e.message)}
 };
 $$("[data-stage]").forEach(b=>b.onclick=async()=>{
   const stage=Number(b.dataset.stage);
   if(state.trainerRole==="mentor")return;
   if(!state.online){state.demoStage=stage;state.dashboard.stage=stage;if(stage>=1&&stage<=6){state.presentation={view:"theory",slide:stage===1?0:stage===2?COMPOSITION_START:stage===3?EDFAT_START:stage===4?STORY_START:stage===5?CAPTION_START:ETHICS_START};state.dashboard.presentation=state.presentation}render();toast("Tahap demo diubah pada perangkat ini");return}
   try{
     await request("/api/state",{method:"PUT",payload:{stage},auth:true});
     if(stage!==state.dashboard?.stage && stage>=1 && stage<=6){
       await request("/api/presentation",{method:"PUT",payload:{view:"theory",slide:stage===1?0:stage===2?COMPOSITION_START:stage===3?EDFAT_START:stage===4?STORY_START:stage===5?CAPTION_START:ETHICS_START},auth:true});
     }
     await syncState();await fetchDashboard();render();
     toast("Tahap kelas berhasil diperbarui");
   }catch(e){toast("Tidak dapat mengubah tahap: "+e.message)}
 });
 async function choosePresentation(next){
   if(state.trainerRole==="mentor")return;
   const target={view:next.view,slide:Math.max(0,Math.min(ETHICS_END,next.slide))};
   if(!state.online){
     state.presentation=target;
     if(state.dashboard)state.dashboard.presentation=target;
     render();toast("Pratinjau lokal — LCD lain tidak ikut berubah.");
     return;
   }
   const status=$("#presentation-save-status");
   if(status)status.textContent="Mengirim slide ke layar LCD…";
   try{
     await request("/api/presentation",{method:"PUT",payload:target,auth:true});
     state.presentation=target;
     if(state.dashboard)state.dashboard.presentation=target;
     render();
   }catch(error){
     if(status)status.textContent="Gagal: "+error.message;
     toast("Slide tidak tersinkron: "+error.message);
   }
 }
 $$("[data-slide-step]").forEach(button=>button.onclick=()=>{
   const pos=PRESENTATION_ORDER.indexOf(state.presentation.slide);
    const n=PRESENTATION_ORDER[pos+Number(button.dataset.slideStep)];
   if(n!==undefined)choosePresentation({view:"theory",slide:n});
 });
 $$("[data-slide]").forEach(button=>button.onclick=()=>{
   choosePresentation({view:"theory",slide:Number(button.dataset.slide)});
 });
 $$("[data-present-mode]").forEach(button=>button.onclick=()=>{
   choosePresentation({view:button.dataset.presentMode,slide:state.presentation.slide});
 });
 $$("[data-ethics-step]").forEach(btn=>btn.onclick=()=>{
   const next=state.presentation.slide+Number(btn.dataset.ethicsStep);
   if(next>=ETHICS_START&&next<=ETHICS_END)choosePresentation({view:"theory",slide:next});
 });
 $$("[data-ethics-slide]").forEach(btn=>btn.onclick=()=>choosePresentation({view:"theory",slide:Number(btn.dataset.ethicsSlide)}));
 $$("[data-ethics-mode]").forEach(btn=>btn.onclick=()=>choosePresentation({view:btn.dataset.ethicsMode,slide:state.presentation.slide>=ETHICS_START&&state.presentation.slide<=ETHICS_END?state.presentation.slide:ETHICS_START}));
 $$("[data-caption-step]").forEach(button=>button.onclick=()=>{
    const next=state.presentation.slide+Number(button.dataset.captionStep);
    if(next>=CAPTION_START&&next<=CAPTION_END)choosePresentation({view:"theory",slide:next});
 });
 $$("[data-caption-slide]").forEach(button=>button.onclick=()=>choosePresentation({view:"theory",slide:Number(button.dataset.captionSlide)}));
 $$("[data-caption-mode]").forEach(button=>button.onclick=()=>choosePresentation({view:button.dataset.captionMode,slide:state.presentation.slide>=CAPTION_START&&state.presentation.slide<=CAPTION_END?state.presentation.slide:CAPTION_START}));
 $$("[data-story-step]").forEach(button=>button.onclick=()=>{
  const next=state.presentation.slide+Number(button.dataset.storyStep);
  if(next>=STORY_START&&next<=STORY_END)choosePresentation({view:"theory",slide:next});
 });
 $$("[data-story-slide]").forEach(button=>button.onclick=()=>choosePresentation({view:"theory",slide:Number(button.dataset.storySlide)}));
 $$("[data-story-mode]").forEach(button=>button.onclick=()=>choosePresentation({view:button.dataset.storyMode,slide:state.presentation.slide>=STORY_START&&state.presentation.slide<=STORY_END?state.presentation.slide:STORY_START}));
 $$("[data-edfat-slide-step]").forEach(button=>button.onclick=()=>{
  const n=state.presentation.slide+Number(button.dataset.edfatSlideStep);
  if(n>=EDFAT_START&&n<=EDFAT_END)choosePresentation({view:"theory",slide:n});
 });
 $$("[data-edfat-slide]").forEach(button=>button.onclick=()=>choosePresentation({view:"theory",slide:Number(button.dataset.edfatSlide)}));
 $$("[data-edfat-mode]").forEach(button=>button.onclick=()=>choosePresentation({view:button.dataset.edfatMode,slide:state.presentation.slide>=EDFAT_START&&state.presentation.slide<=EDFAT_END?state.presentation.slide:EDFAT_START}));
 $$("[data-comp-slide-step]").forEach(button=>button.onclick=()=>{
  const n=state.presentation.slide+Number(button.dataset.compSlideStep);
  if(n>=COMPOSITION_START&&n<=COMPOSITION_END)choosePresentation({view:"theory",slide:n});
 });
 $$("[data-comp-slide]").forEach(button=>button.onclick=()=>choosePresentation({view:"theory",slide:Number(button.dataset.compSlide)}));
 $$("[data-comp-mode]").forEach(button=>button.onclick=()=>choosePresentation({view:button.dataset.compMode,slide:state.presentation.slide>=COMPOSITION_START?state.presentation.slide:COMPOSITION_START}));
 let savingComposition=false,queuedComposition=false;
 async function saveCompositionDemo(){
  if(savingComposition){queuedComposition=true;return}
  savingComposition=true;
  do{
   queuedComposition=false;
   const snapshot={...state.demoComposition};
   try{
    if(!state.online)throw Error("Koneksi kelas belum tersedia");
    await request("/api/demo-composition",{method:"PUT",payload:snapshot,auth:true});
    const status=$("#composition-demo-status");if(status)status.textContent="Tersinkron dengan LCD";
   }catch(error){const status=$("#composition-demo-status");if(status)status.textContent="Gagal sinkron: "+error.message}
  }while(queuedComposition);
  savingComposition=false;
 }
 function refreshTrainerDemo(){
  const scene=$("#trainerCompositionDemo"),caption=$("#trainerCompositionDemo-caption");
  if(!scene)return;
  const example=compositionExample(state.demoComposition);
  scene.classList.toggle("comp-grid-on",!!state.demoComposition.grid);
  const image=scene.querySelector("img");
  if(image&&!image.src.endsWith("sangihe-2017-"+example.photo+".webp"))image.src="/lensa-muda/assets/composition/sangihe-2017-"+example.photo+".webp";
  if(caption)caption.textContent=example.caption;
  $$("[data-demo-comp]").forEach(btn=>btn.setAttribute("aria-pressed",String(!!state.demoComposition[btn.dataset.demoComp])));
  for(const key of ["position","distance","angle"])$$("[data-demo-"+key+"]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset["demo"+key[0].toUpperCase()+key.slice(1)]===state.demoComposition[key])));
 }
 $$("[data-demo-comp]").forEach(btn=>btn.onclick=()=>{
  const key=btn.dataset.demoComp;
  state.demoComposition[key]=!state.demoComposition[key];
  if(key==="frame")state.demoComposition.preview="frame";
  refreshTrainerDemo();saveCompositionDemo();
 });
 for(const key of ["position","distance","angle"])$$("[data-demo-"+key+"]").forEach(btn=>btn.onclick=()=>{
  state.demoComposition[key]=btn.dataset["demo"+key[0].toUpperCase()+key.slice(1)];
  state.demoComposition.preview=key;refreshTrainerDemo();saveCompositionDemo();
 });
 const resetDemo=$("#reset-demo-composition");
 if(resetDemo)resetDemo.onclick=()=>{state.demoComposition={grid:true,frame:false,position:"center",distance:"wide",angle:"eye",preview:"distance"};refreshTrainerDemo();saveCompositionDemo()};

 async function changeSpotlight(participantId,module){
  if(isMentor)return;
  if(!state.online){toast("Koneksi kelas diperlukan untuk sorotan LCD");return}
  try{
   const result=await request("/api/spotlight",{method:"PUT",payload:{participantId,module},auth:true});
   state.spotlight=result.spotlight||null;state.dashboard.spotlight=state.spotlight;
   const banner=$("#trainer-spotlight-status");
   if(banner){
    banner.querySelector("h3").textContent=state.spotlight?"Menampilkan karya: "+state.spotlight.name:"LCD mengikuti presentasi trainer";
    const stop=$("#stop-spotlight");if(stop)stop.disabled=!state.spotlight;
   }
   toast(state.spotlight?"Karya "+state.spotlight.name+" ditampilkan di LCD":"LCD kembali ke presentasi terakhir");
  }catch(error){toast("Gagal menampilkan karya: "+error.message)}
 }
 const stopSpotlight=$("#stop-spotlight");
 if(stopSpotlight)stopSpotlight.onclick=()=>changeSpotlight(null,null);
 function bindSpotlight(scope){
  $$("[data-spotlight-id]",scope).forEach(btn=>btn.onclick=()=>changeSpotlight(btn.dataset.spotlightId,btn.dataset.spotlightModule));
 }
 bindSpotlight();
 $$("[data-inspect]").forEach(btn=>btn.onclick=()=>{
   const p=(state.dashboard.participants||[]).find(p=>p.id===btn.dataset.inspect);
   if(!p)return;
   const answers=p.answers||{};
   $("#inspect").innerHTML=`<div class="info"><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.school)} · ${escapeHtml(p.className)}<hr class="rule">${
     Object.keys(answers).length
       ?Object.entries(answers).map(([key,v])=>`<div class="response-group"><strong>${escapeHtml(STAGES.find(s=>s.key===key)?.name||key)}</strong>${answerDetails(key,v)}${!isMentor&&SPOTLIGHT_MODULES.includes(key)?`<button class="btn small primary" data-spotlight-id="${escapeHtml(p.id)}" data-spotlight-module="${escapeHtml(key)}">Tampilkan hasil di LCD</button>`:""}</div>`).join("")
       :"Belum ada hasil tersimpan."
   }</div>`;
   bindSpotlight($("#inspect"));
 });
 const filter=$("#participant-filter");
 if(filter)filter.oninput=()=>{const q=filter.value.trim().toLowerCase();$$("[data-participant-row]").forEach(tr=>tr.hidden=!tr.dataset.participantRow.includes(q))};
 $$("[data-copy-username]").forEach(btn=>btn.onclick=()=>{
   const p=(state.dashboard.participants||[]).find(x=>x.id===btn.dataset.copyUsername);
   if(p?.username)navigator.clipboard?.writeText(p.username).then(()=>toast("Username disalin"),()=>toast("Username: "+p.username));
 });
 $$("[data-edit-participant]").forEach(btn=>btn.onclick=()=>{
  if(state.trainerRole!=="trainer")return;
  const p=(state.dashboard.participants||[]).find(x=>x.id===btn.dataset.editParticipant);
  if(!p)return;const area=$("#participant-management");
  area.innerHTML=participantFormHTML(p);
  $("#cancel-participant-edit").onclick=()=>area.innerHTML="";
  $("#participant-edit-form").onsubmit=async e=>{
   e.preventDefault();const payload=Object.fromEntries(new FormData(e.currentTarget).entries());
   try{if(!state.online)throw Error("Perlu koneksi kelas");
    await request("/api/participants/"+p.id,{method:"PATCH",payload,auth:true});
    await fetchDashboard();render();toast("Data peserta diperbarui");
   }catch(error){toast("Gagal mengubah: "+error.message)}
  };
  area.scrollIntoView({block:"nearest",behavior:"smooth"});
 });
 $$("[data-delete-participant]").forEach(btn=>btn.onclick=async()=>{
  if(state.trainerRole!=="trainer")return;
  const p=(state.dashboard.participants||[]).find(x=>x.id===btn.dataset.deleteParticipant);
  if(!p||!confirm(`Hapus ${p.name} beserta semua jawaban dan progresnya? Tindakan ini tidak dapat dibatalkan.`))return;
  try{if(!state.online)throw Error("Perlu koneksi kelas");
   await request("/api/participants/"+p.id,{method:"DELETE",auth:true});
   await fetchDashboard();render();toast("Peserta berhasil dihapus");
  }catch(error){toast("Gagal menghapus: "+error.message)}
 });
 if($("#trainer-camera-reset")) {
 // Simulator langsung: diubah seketika di laptop; pengiriman diserialkan agar
 // pembaruan cepat dari beberapa slider tidak saling menimpa.
 const isMentor=state.trainerRole==="mentor";
 let debounce=null,writing=false,dirty=false;
 function redrawTrainerCamera(){
   const c=state.demoCamera;
   paintCameraScene($("#trainerCameraScene"),c);
   $("#trainer-ev").textContent=exposureText(c);
   $("#trainer-aperture-value").textContent=`f/${APERTURE[c.a]}`;
   $("#trainer-shutter-value").textContent=`${SHUTTERS[c.s].l}s`;
   $("#trainer-iso-value").textContent=`ISO ${ISOS[c.i]}`;
   $$("[data-livecam]").forEach(el=>{el.value=c[el.dataset.livecam]});
 }
 async function commitCamera(){
   if(isMentor)return;
   if(!state.online){$("#trainer-camera-status").textContent="Pratinjau lokal — belum tersinkron.";return}
   if(writing){dirty=true;return}
   writing=true;dirty=false;
   const snapshot={...state.demoCamera};
   $("#trainer-camera-status").textContent="Menyinkronkan pengaturan ke LCD…";
   try{
     await request("/api/demo-camera",{method:"PUT",payload:snapshot,auth:true});
     $("#trainer-camera-status").textContent="✓ Pengaturan tersimpan dan siap ditampilkan di LCD";
   }catch(error){
     $("#trainer-camera-status").textContent="✕ Gagal menyinkronkan: "+error.message;
     toast("Gagal mengirim demo kamera: "+error.message);
   }finally{
     writing=false;
     if(dirty||["a","s","i"].some(k=>state.demoCamera[k]!==snapshot[k]))commitCamera();
   }
 }
 $$("[data-livecam]").forEach(el=>el.addEventListener("input",()=>{
   state.demoCamera[el.dataset.livecam]=Number(el.value);
   redrawTrainerCamera();
   clearTimeout(debounce);
   $("#trainer-camera-status").textContent="Pengaturan berubah — menyiapkan pembaruan…";
   debounce=setTimeout(commitCamera,180);
 }));
 $("#trainer-camera-reset").onclick=()=>{
   if(isMentor)return;
   state.demoCamera={a:1,s:3,i:1};
   redrawTrainerCamera();
   clearTimeout(debounce);
   debounce=setTimeout(commitCamera,20);
 };
 redrawTrainerCamera();
 }
}
async function renderTrainer(){
  const root=$("#root");
  if(!state.trainerToken){
    root.innerHTML=trainerLogin();
    const form=$("#trainer-login");
    const feedback=$("#trainer-login-feedback");
    const showError=(message)=>{
      feedback.hidden=false;
      feedback.textContent=message;
    };
    form.onsubmit=async event=>{
      event.preventDefault();
      const button=form.querySelector("button[type=submit]");
      if(!state.online){
        showError("Server kelas belum terhubung. Periksa koneksi internet dan muat ulang halaman.");
        return;
      }
      button.disabled=true;
      button.textContent="Memeriksa PIN…";
      feedback.hidden=true;
      try{
        const result=await request("/api/login",{method:"POST",payload:{pin:$("#trainer-pin").value}});
        state.trainerToken=result.token;
        state.trainerRole=result.role;
        sessionStorage.setItem("lm26-trainer",result.token);
        sessionStorage.setItem("lm26-role",result.role);
        await renderTrainer();
      }catch(error){
        showError(error.message);
        button.disabled=false;
        button.textContent="Coba masuk kembali";
      }
    };
    if(!state.online){
      const preview=$("#trainer-preview");
      if(preview)preview.onclick=()=>{
        state.trainerToken="demo";
        state.trainerRole="trainer";
        fetchDashboard().then(render);
      };
    }
    return;
  }
  try{
    await fetchDashboard();
    root.innerHTML=renderDashboard();
    bindDashboard();
  }catch(error){
    if(error.status===401||error.status===403){
      state.trainerToken="";
      sessionStorage.removeItem("lm26-trainer");
      sessionStorage.removeItem("lm26-role");
      await renderTrainer();
      const feedback=$("#trainer-login-feedback");
      if(feedback){
        feedback.hidden=false;
        feedback.textContent="Sesi lama sudah kedaluwarsa. Masukkan PIN trainer untuk membuat sesi baru.";
      }
      return;
    }
    // PIN telah diterima: jangan hapus sesi saat dashboard yang gagal.
    root.innerHTML=`<div class="page"><div class="card login-card"><span class="eyebrow">LOGIN BERHASIL, DASHBOARD BELUM SIAP</span>
      <h1>PIN sudah diterima.</h1><p>Terjadi kesalahan saat memuat dashboard: ${escapeHtml(error.message)}.</p>
      <p class="small-note">Data peserta dan pengaturan kelas tidak dihapus. Anda bisa mengulang pemuatan dashboard.</p>
      <button id="trainer-retry-dashboard" class="btn primary block">Coba muat dashboard lagi</button>
      <button id="trainer-back-login" class="btn subtle block" style="margin-top:8px">← Kembali ke Login / Ganti PIN</button></div></div>`;
    $("#trainer-retry-dashboard").onclick=renderTrainer;
    $("#trainer-back-login").onclick=()=>{
      state.trainerToken="";
      state.trainerRole="trainer";
      state.dashboard=null;
      sessionStorage.removeItem("lm26-trainer");
      sessionStorage.removeItem("lm26-role");
      renderTrainer();
    };
  }
}
function lcdFooter(stage,count,link,qr){
 return `<div class="lcd-bottom">
  <div><strong>${String(stage).padStart(2,"0")} / 06</strong><div>${escapeHtml(STAGES[stage]?.name||"Orientasi")}</div>
  <div class="lcd-participants">${count} peserta terdaftar · 16 November 2026</div></div>
  <div class="lcd-join"><span>${escapeHtml(link)}</span><div class="lcd-qr">
   <img src="${qr}" alt="QR menuju halaman peserta" width="112" height="112"
   onerror="this.style.display='none';this.parentElement.textContent='Buka tautan kelas'"></div></div>
 </div>`;
}
function cameraDialHTML(key,index){
 const iris=key==="a";
 return `<div class="lcd-camera-control" data-camera-control="${key}" aria-hidden="true">
  <div class="lcd-camera-dial ${iris?"lcd-aperture-dial":"lcd-setting-dial"}" id="lcd-dial-${key}" style="--dial-angle:${-135+index*45}deg;--iris-size:${10+((6-index)/6)*41}%">
   ${iris?`<div class="lcd-iris-ring"><div class="lcd-iris-opening"></div></div>`:`<div class="lcd-dial-pointer"></div><div class="lcd-dial-center">${key==="s"?"S":"ISO"}</div>`}
  </div>
  <div class="lcd-camera-track"><div class="lcd-camera-track-fill" id="lcd-track-${key}" style="width:${index/6*100}%"></div><span class="lcd-camera-track-thumb" id="lcd-thumb-${key}" style="left:${index/6*100}%"></span></div>
  <div class="lcd-camera-scale"><span>${key==="a"?"f/1.8":key==="s"?"1/15":"100"}</span><span>${key==="a"?"f/16":key==="s"?"1/1000":"6400"}</span></div>
  <span class="lcd-camera-control-label">${key==="a"?"DIAFRAGMA":key==="s"?"DIAL RANA":"DIAL ISO"}</span>
 </div>`;
}
function paintCameraDials(camera){
 for(const key of ["a","s","i"]){
  const index=camera[key];
  const dial=$("#lcd-dial-"+key),fill=$("#lcd-track-"+key),thumb=$("#lcd-thumb-"+key);
  if(dial){
   dial.style.setProperty("--dial-angle",(-135+index*45)+"deg");
   if(key==="a")dial.style.setProperty("--iris-size",(10+((6-index)/6)*41)+"%");
  }
  if(fill)fill.style.width=(index/6*100)+"%";
  if(thumb)thumb.style.left=(index/6*100)+"%";
 }
}
function lcdPage(){
 const stage=state.online?state.serverStage:state.demoStage;
 const step=STAGES[stage]||STAGES[0];
 const count=state.online?state.count:(state.user?1:0);
 const link=location.origin+"/lensa-muda/peserta";
 const qr="/lensa-muda/assets/brand/peserta-qr.svg";
 const footer=lcdFooter(stage,count,link,qr);
 if(state.spotlight)return `<div class="page lcd-page"><div class="lcd-mode lcd-spotlight-mode">${lcdSpotlightContent(state.spotlight)}${footer}</div><div class="actions lcd-toolbar"><button class="btn" id="lcd-refresh">↻ Segarkan</button><button class="btn primary" id="lcd-fullscreen">⛶ Layar penuh</button></div></div>`;
 if(state.welcome){
  return `<div class="page lcd-page"><section class="lcd-mode lcd-welcome-mode">
   <div class="lcd-welcome-photo"></div><div class="lcd-welcome-darken"></div>
   <div class="lcd-welcome-top"><img src="/lensa-muda/assets/brand/lensa-muda.png" alt="Lensa Muda"><img src="/lensa-muda/assets/brand/zonautara.png" alt="Zonautara.com"></div>
   <div class="lcd-welcome-body"><span class="kicker">LENSA MUDA 2026 · MEREKAM JEJAK DAN WARISAN BUDAYA SULAWESI UTARA</span>
    <h1>Selamat Datang di<br><em>Kelas Belajar Fotografi</em></h1>
    <p>Platform pembelajaran interaktif yang dikembangkan Zonautara.com untuk Program Lensa Muda.</p>
    <div class="lcd-welcome-trainer"><span>TRAINER</span><strong>Ronny Adolof Buol</strong><small>Fotografer · Pemred Zonautara.com · Pendiri Kelasbelajar.org</small></div>
   </div>
   <div class="lcd-welcome-join"><div><span>SCAN UNTUK MENDAFTAR</span><strong>kelasbelajar.org/lensa-muda/peserta</strong><small>Gunakan kamera HP untuk membuka formulir peserta</small><small class="lcd-welcome-count">${count} peserta terdaftar</small></div><div class="lcd-welcome-qr"><img src="${qr}" alt="QR pendaftaran peserta Lensa Muda"></div></div>
   <div class="lcd-welcome-credit">Hong Bit, perempuan Dayak berkuping panjang · Foto: Ronny Adolof Buol, Kalimantan, 2016</div>
  </section><div class="actions lcd-toolbar"><button class="btn" id="lcd-refresh">↻ Segarkan</button><button class="btn primary" id="lcd-fullscreen">⛶ Layar penuh</button></div></div>`;
 }
 const camera=state.demoCamera;
 const content=stage===6&&state.presentation.view==="theory"
    ?`<div class="lcd-theory-intro"><span class="kicker">BAB 6 · ETIKA & TANTANGAN</span><span class="theory-slide-indicator">SLIDE ${ethicsLabel(state.presentation.slide)} / ${ETHICS_SLIDES.length}</span></div>${ethicsTheoryContent(state.presentation.slide,"lcd")}`
    :stage===6
    ?`<div class="ethics-lcd-mission"><span class="kicker">TAHAP 06 · TANTANGAN AKHIR</span><h1>Foto yang jujur. <em>Cerita yang bertanggung jawab.</em></h1>
      <p>Peserta menyelesaikan empat pilihan etis dan menyusun rencana foto cerita budaya yang ingin mereka kerjakan.</p>
      ${ethicsVisual(ETHICS_END)}<div class="theory-question"><span>DISKUSI KELAS</span><strong>Apa yang akan kamu potret, dan siapa yang perlu kamu ajak bicara terlebih dahulu?</strong></div></div>`
    :stage===5&&state.presentation.view==="theory"
    ?`<div class="lcd-theory-intro"><span class="kicker">BAB 5 · CAPTION LAB</span><span class="theory-slide-indicator">SLIDE ${captionLabel(state.presentation.slide)} / ${CAPTION_SLIDES.length}</span></div>${captionTheoryContent(state.presentation.slide,"lcd")}`
    :stage===5
    ?`<div class="caption-lcd-mission"><span class="kicker">TAHAP 05 · MENULIS NARASI FOTO</span><h1>Sembilan foto. <em>Satu cerita yang akurat.</em></h1>
      <p>Gunakan pilihan foto dari Meja Editor, isi unsur 5W+1H, lalu tulis narasi sekitar 150 kata. Tandai fakta yang masih perlu diperiksa.</p>
      ${captionVisual(CAPTION_END)}<div class="theory-question"><span>DISKUSI KELAS</span><strong>Apa yang terlihat dalam foto, dan apa yang perlu ditanyakan kepada narasumber?</strong></div></div>`
    :stage===4&&state.presentation.view==="theory"
   ?`<div class="lcd-theory-intro"><span class="kicker">BAB 4 · SEMBILAN BINGKAI</span><span class="theory-slide-indicator">SLIDE ${storyLabel(state.presentation.slide)} / ${STORY_SLIDES.length}</span></div>${storyTheoryContent(state.presentation.slide,"lcd")}`
   :stage===4
   ?`<div class="story-lcd-mission"><span class="kicker">TAHAP 04 · MEJA EDITOR FOTO</span><h1>Pilih sembilan. <em>Susun ceritanya.</em></h1>
   <p>Dari 12 kandidat foto dokumentasi, pilih sembilan yang saling melengkapi. Jelaskan pembuka, perkembangan, dan penutup.</p>
   ${storySlideVisual(STORY_END)}
   <div class="theory-question"><span>DISKUSI KELAS</span><strong>Foto mana yang sengaja tidak dipilih dan mengapa?</strong></div></div>`
   :stage===3&&state.presentation.view==="theory"
   ?`<div class="lcd-theory-intro"><span class="kicker">BAB 3 · DETEKTIF EDFAT</span><span class="theory-slide-indicator">SLIDE ${edfatLabel(state.presentation.slide)} / ${EDFAT_SLIDES.length}</span></div>${edfatSlideHTML(state.presentation.slide,"lcd")}`
   :stage===3
   ?`<div class="edfat-lcd-mission"><span class="kicker">TAHAP 03 · MISI DETEKTIF</span><h1>Amati. Temukan petunjuk. <em>Jelaskan alasan.</em></h1>
   <p>Lima foto, lima pendekatan EDFAT. Peserta memilih sendiri dari HP dan menjelaskan petunjuk nyata pada foto.</p>
   ${edfatVisual(EDFAT_END)}
   <div class="theory-question"><span>DISKUSI KELAS</span><strong>Apakah satu foto hanya dapat memuat satu unsur EDFAT?</strong></div></div>`
   :stage===2 && state.presentation.view==="theory"
    ?`<div class="lcd-theory-intro"><span class="kicker">BAB 2 · BAHASA VISUAL</span><span class="theory-slide-indicator">SLIDE ${compositionLabel(state.presentation.slide)} / ${COMPOSITION_SLIDES.length}</span></div>${compositionSlideContent(state.presentation.slide,"lcd")}`
    :stage===2
    ?`<div class="lcd-composition-lab"><span class="kicker">TAHAP 02 · LABORATORIUM KOMPOSISI</span><h1>Ubah bingkai. <em>Jelaskan pilihan.</em></h1><p>Amati bagaimana foto budaya Sangihe memakai ruang, jarak, framing, dan sudut untuk menyampaikan informasi.</p>${compositionDemoPreview(state.demoComposition,"lcdCompositionDemo")}
      <div class="theory-question"><span>LATIHAN MANDIRI</span><strong>Komposisi apa yang membuat pembaca memahami kegiatan ini?</strong></div></div>`
    :stage===1 && state.presentation.view==="theory"
   ?`<div class="lcd-theory-intro"><span class="kicker">BAB 1 · MATERI TEORI FOTOGRAFI</span><span class="theory-slide-indicator">SLIDE ${presentationLabel(state.presentation.slide)} · ${PRESENTATION_ORDER.indexOf(state.presentation.slide)+1}/${PRESENTATION_ORDER.length}</span></div>${theorySlideContent(state.presentation.slide,"lcd")}`
   :stage===1
   ?`<div class="lcd-camera-heading"><div class="kicker">TAHAP 01 · LABORATORIUM KAMERA</div>
      <h1>Ubah pengaturan. <em>Amati fotonya.</em></h1>
      <p>Amati bagaimana bukaan, kecepatan rana, dan ISO memengaruhi foto.</p></div>
      <div class="lcd-camera-layout">
        <div class="lcd-camera-photo">${photoSceneHTML("lcdCameraScene")}
          <div class="lcd-camera-note">Ilustrasi simulasi · bukan hasil kamera sungguhan</div></div>
        <div class="lcd-camera-readouts">
          <div class="lcd-reading"><span>APERTURE / BUKAAN</span><strong id="lcd-aperture">f/${APERTURE[camera.a]}</strong><small id="lcd-aperture-tip">Kedalaman ruang</small>${cameraDialHTML("a",camera.a)}</div>
          <div class="lcd-reading"><span>SHUTTER SPEED</span><strong id="lcd-shutter">${SHUTTERS[camera.s].l}s</strong><small id="lcd-shutter-tip">Gerak objek</small>${cameraDialHTML("s",camera.s)}</div>
          <div class="lcd-reading"><span>ISO</span><strong id="lcd-iso">${ISOS[camera.i]}</strong><small id="lcd-iso-tip">Penguatan sinyal</small>${cameraDialHTML("i",camera.i)}</div>
          <div class="lcd-reading lcd-ev-reading"><span>PERUBAHAN EXPOSURE</span><strong id="lcd-ev">${exposureText(camera)}</strong><small>Relatif terhadap f/2.8 · 1/125 · ISO 200</small></div>
        </div>
      </div>`
   :`<div><div class="kicker">LENSA MUDA 2026 · STUDIO FOTO CERITA</div>
      <h1>${escapeHtml(step.title)}</h1><p>${escapeHtml(step.blurb)}</p></div>`;
 return `<div class="page lcd-page">
   <div class="lcd-mode ${stage===1?(state.presentation.view==="theory"?"lcd-theory-mode":"lcd-camera-mode"):stage===2?"lcd-composition-mode":stage===3?"lcd-edfat-mode":stage===4?"lcd-story-mode":stage===5?"lcd-caption-mode":stage===6?"lcd-ethics-mode":""} ${stage===1&&state.presentation.view==="theory"&&photoDetail(state.presentation.slide)?"lcd-photo-detail":""}">
     ${content}
     ${footer}
   </div>
   <div class="actions lcd-toolbar"><button class="btn" id="lcd-refresh">↻ Segarkan</button>
     <button class="btn primary" id="lcd-fullscreen">⛶ Layar penuh</button></div>
   <p class="small-note">Untuk demonstrasi langsung, tampilkan LCD di jendela tersendiri. QR menggunakan layanan gambar eksternal; gunakan URL tertulis jika QR tidak tampil.</p>
 </div>`;
}
function paintLcdCamera(){
 const scene=$("#lcdCameraScene");if(!scene)return;
 const c=state.demoCamera;
 paintCameraScene(scene,c);
 $("#lcd-aperture").textContent=`f/${APERTURE[c.a]}`;
 $("#lcd-shutter").textContent=`${SHUTTERS[c.s].l}s`;
 $("#lcd-iso").textContent=ISOS[c.i];
 $("#lcd-ev").textContent=exposureText(c);
 $("#lcd-aperture-tip").textContent=APERTURE[c.a]<=2.8?"Latar lebih blur":APERTURE[c.a]>=11?"Area fokus lebih luas":"Kedalaman ruang sedang";
 $("#lcd-shutter-tip").textContent=SHUTTERS[c.s].t>=1/30?"Gerak mudah kabur":SHUTTERS[c.s].t<=1/500?"Gerak dibekukan":"Perhatikan gerakan";
 $("#lcd-iso-tip").textContent=ISOS[c.i]>=1600?"Noise semakin jelas":ISOS[c.i]<=200?"Noise rendah":"Noise sedang";
 paintCameraDials(c);
}
function paintLcdComposition(){
 const scene=$("#lcdCompositionDemo"),caption=$("#lcdCompositionDemo-caption");if(!scene)return;
 const example=compositionExample(state.demoComposition);
 scene.classList.toggle("comp-grid-on",!!state.demoComposition.grid);
 const image=scene.querySelector("img");
 if(image&&!image.src.endsWith("sangihe-2017-"+example.photo+".webp")){image.src="/lensa-muda/assets/composition/sangihe-2017-"+example.photo+".webp";image.alt=example.caption}
 if(caption)caption.textContent=example.caption;
}
function renderLCD(){
 $("#root").innerHTML=lcdPage();
 $("#lcd-refresh").onclick=refreshLCD;
 // Fullscreen menempel pada #root yang tidak diganti saat LCD diperbarui.
 $("#lcd-fullscreen").onclick=()=>{
   $("#root").requestFullscreen?.().catch(()=>toast("Mode layar penuh tidak tersedia di browser ini"));
 };
 paintLcdCamera();
 paintLcdComposition();
}
let lcdPolling=false;
async function refreshLCD(){
 if(lcdPolling||pageMode()!=="lcd")return;
 lcdPolling=true;
 const prevStage=state.online?state.serverStage:state.demoStage;
  const prevWelcome=state.welcome;
 const prevCamera=JSON.stringify(state.demoCamera);
 const prevComposition=JSON.stringify(state.demoComposition);
 const prevPresentation=JSON.stringify(state.presentation);
 const prevSpotlight=JSON.stringify(state.spotlight);
 try{
   await syncState();
   const nextStage=state.online?state.serverStage:state.demoStage;
   if(prevStage!==nextStage||prevWelcome!==state.welcome||prevPresentation!==JSON.stringify(state.presentation)||prevSpotlight!==JSON.stringify(state.spotlight)||!$(".lcd-mode")){
     renderLCD();
   }else{
     if(prevCamera!==JSON.stringify(state.demoCamera))paintLcdCamera();
      if(prevComposition!==JSON.stringify(state.demoComposition))paintLcdComposition();
     const welcomeCount=$(".lcd-welcome-count");if(welcomeCount)welcomeCount.textContent=`${state.online?state.count:state.user?1:0} peserta terdaftar`;
      const count=$(".lcd-participants");
     if(count)count.textContent=`${state.online?state.count:state.user?1:0} peserta terdaftar · 16 November 2026`;
   }
 }finally{lcdPolling=false}
}
async function render(){
 document.title=`Studio Foto Cerita — Lensa Muda 2026`;
 const mode=pageMode();document.body.dataset.appMode=mode;if(mode==="trainer")await renderTrainer();else if(mode==="lcd")renderLCD();else if(mode==="welcome")$("#root").innerHTML=welcomePage();else renderParticipant();
}
window.addEventListener("hashchange",render);
window.addEventListener("visibilitychange",()=>{
  if(!document.hidden){
    if(pageMode()==="lcd")refreshLCD();
    else syncState();
  }
});
// LCD diperbarui tanpa mengganti konten halaman, sehingga mode fullscreen tetap aktif.
let lastPassivePoll=0;
setInterval(async()=>{
  if(pageMode()==="lcd"){await refreshLCD();return}
  if(document.hidden)return;
  const now=Date.now();
  if(now-lastPassivePoll>3500){
    lastPassivePoll=now;
    const prev=JSON.stringify({stage:state.serverStage,locked:state.locked,presentation:state.presentation});
    await syncState();
    if(pageMode()==="peserta"){
      const before=JSON.parse(prev),stageChanged=before.stage!==state.serverStage,lockChanged=before.locked!==state.locked;
       const slideChanged=JSON.stringify(before.presentation)!==JSON.stringify(state.presentation);
       const startingLesson=stageChanged&&before.stage===0&&state.active==="mulai"&&state.serverStage>0;
       if(startingLesson){state.active=STAGES[state.serverStage]?.key||"mulai";localStorage.setItem(STORAGE_VIEW,state.active)}
       const accessRevoked=stageChanged&&!isUnlocked(state.active);
       // Pembukaan tahap lanjut tidak menginterupsi peserta yang sedang menulis atau memilih foto.
       if(lockChanged||accessRevoked||startingLesson||(learnerMode(state.active)==="follow"&&slideChanged))renderParticipant();
    }
  }
},1800);
async function restoreParticipantSession(){
 if(!state.online||!state.user?.token)return;
 try{
  const response=await request("/api/me");
  state.user={...state.user,...response.user,token:state.user.token};
  const serverAnswers=response.answers||{};
  // Draf di perangkat tidak boleh ditimpa oleh jawaban tersimpan yang lebih lama di server.
  for(const key of ["story","edfat","komposisi","caption","etika"]){
   const local=state.work[key];
   if(local&&(local._draft===true||(key==="story"&&!local.completedAt&&(local.selected?.length||local.title||local.reason))))serverAnswers[key]=local;
  }
  state.work=serverAnswers;state.composition={...state.composition,...(state.work.komposisi||{})};
  localStorage.setItem(STORAGE_USER,JSON.stringify(state.user));
  if(state.user.username)localStorage.setItem("lm26-last-username",state.user.username);
  saveWork();
  loadLearnerViews();
 }catch(error){
  if(error.status!==401)return;
  if(state.user.username)localStorage.setItem("lm26-last-username",state.user.username);
  state.user=null;state.work={};state.learnerViews={};
  localStorage.removeItem(STORAGE_USER);localStorage.removeItem(STORAGE_WORK);
 }
}
await syncState();
await restoreParticipantSession();
render();